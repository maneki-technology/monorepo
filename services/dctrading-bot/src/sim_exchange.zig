/// SimExchange — configurable mock exchange for integration testing.
/// Supports: fill delay, partial fills, cancel races, order logging.
const std = @import("std");
const exchange_mod = @import("exchange.zig");
const Exchange = exchange_mod.Exchange;
const OrderFill = exchange_mod.OrderFill;
const PendingOrder = exchange_mod.PendingOrder;
const OrderStatus = exchange_mod.OrderStatus;
const CancelResult = exchange_mod.CancelResult;
const Side = exchange_mod.Side;
const Position = exchange_mod.Position;

pub const SimExchange = struct {
    // Configuration
    fill_delay: u32 = 1, // ticks before order fills (0 = immediate)
    fill_price_offset: f64 = 0, // slippage: actual = signal + offset
    partial_fill_ratio: f64 = 1.0, // 1.0 = full fill, 0.5 = half
    submitted_qty_ratio: f64 = 1.0, // exchange-side quantity normalization
    submitted_quote_amount: f64 = 0,
    fill_quote_amount: f64 = 0,
    fill_commission: f64 = 0,
    fill_commission_usd: f64 = 0,
    fill_commission_asset: [8]u8 = undefined,
    fill_commission_asset_len: usize = 0,
    fail_next_submit: bool = false,
    fail_next_cancel: bool = false,
    cancel_fills_instead: bool = false, // simulate race: cancel returns .filled

    // Position state
    position_qty: f64 = 0,
    position_entry: f64 = 0,

    // Order tracking
    orders: [MAX_ORDERS]SimOrder = undefined,
    order_count: u32 = 0,
    next_order_id: u32 = 1,
    tick_count: u32 = 0, // incremented by test harness
    last_price: f64 = 0, // set by test harness or advanceTick

    // Event log for assertions
    log: [MAX_LOG]LogEntry = undefined,
    log_count: u32 = 0,

    const MAX_ORDERS: usize = 16;
    const MAX_LOG: usize = 64;

    pub const SimOrder = struct {
        id: u32,
        side: Side,
        qty: f64,
        price: f64, // signal price at submission
        submit_tick: u32,
        filled: bool = false,
        cancelled: bool = false,
    };

    pub const LogEntry = struct {
        tick: u32,
        kind: enum { submit, fill, cancel, check, get_position },
        order_id: u32 = 0,
        side: Side = .buy,
        qty: f64 = 0,
        price: f64 = 0,
    };

    pub fn exchange(self: *SimExchange) Exchange {
        return .{
            .ptr = @ptrCast(self),
            .vtable = &vtable,
        };
    }

    /// Call this each tick from the test harness to advance time.
    pub fn advanceTick(self: *SimExchange) void {
        self.tick_count += 1;
    }

    fn appendLog(self: *SimExchange, entry: LogEntry) void {
        if (self.log_count < MAX_LOG) {
            self.log[self.log_count] = entry;
            self.log_count += 1;
        }
    }

    fn findOrder(self: *SimExchange, order_id: u32) ?*SimOrder {
        for (self.orders[0..self.order_count]) |*o| {
            if (o.id == order_id) return o;
        }
        return null;
    }

    fn removeOrder(self: *SimExchange, order_id: u32) void {
        var i: u32 = 0;
        while (i < self.order_count) {
            if (self.orders[i].id == order_id) {
                self.order_count -= 1;
                if (i < self.order_count) {
                    self.orders[i] = self.orders[self.order_count];
                }
                return;
            }
            i += 1;
        }
    }

    fn orderIdFromSlice(id_str: []const u8) u32 {
        return std.fmt.parseInt(u32, id_str, 10) catch 0;
    }

    // ========== Exchange vtable implementations ==========

    fn buy(ptr: *anyopaque, qty: f64) ?OrderFill {
        const self: *SimExchange = @ptrCast(@alignCast(ptr));
        // Sync buy: submit + immediate fill
        const pending = submitOrderImpl(self, .buy, qty) orelse return null;
        const oid = orderIdFromSlice(pending.order_id[0..pending.order_id_len]);
        if (self.findOrder(oid)) |order| {
            order.filled = true;
            const fp = order.price + self.fill_price_offset;
            const fq = order.qty * self.partial_fill_ratio;
            self.position_qty += fq;
            self.position_entry = fp;
            return self.makeFill(fp, fq);
        }
        return null;
    }

    fn sell(ptr: *anyopaque, qty: f64) ?OrderFill {
        const self: *SimExchange = @ptrCast(@alignCast(ptr));
        const pending = submitOrderImpl(self, .sell, qty) orelse return null;
        const oid = orderIdFromSlice(pending.order_id[0..pending.order_id_len]);
        if (self.findOrder(oid)) |order| {
            order.filled = true;
            const fp = order.price + self.fill_price_offset;
            const fq = order.qty * self.partial_fill_ratio;
            self.position_qty -= fq;
            if (self.position_qty <= 0) {
                self.position_qty = 0;
                self.position_entry = 0;
            }
            return self.makeFill(fp, fq);
        }
        return null;
    }

    fn submitOrderImpl(self: *SimExchange, side: Side, qty: f64) ?PendingOrder {
        if (self.fail_next_submit) {
            self.fail_next_submit = false;
            return null;
        }
        if (self.order_count >= MAX_ORDERS) return null;

        const id = self.next_order_id;
        self.next_order_id += 1;

        const submitted_qty = qty * self.submitted_qty_ratio;
        self.orders[self.order_count] = .{
            .id = id,
            .side = side,
            .qty = submitted_qty,
            .price = self.last_price, // market price at submission
            .submit_tick = self.tick_count,
        };
        self.order_count += 1;

        self.appendLog(.{ .tick = self.tick_count, .kind = .submit, .order_id = id, .side = side, .qty = submitted_qty });

        var pending: PendingOrder = .{ .side = side, .qty = submitted_qty, .quote_amount = self.submitted_quote_amount };
        var id_buf: [16]u8 = undefined;
        const id_str = std.fmt.bufPrint(&id_buf, "{d}", .{id}) catch "0";
        @memcpy(pending.order_id[0..id_str.len], id_str);
        pending.order_id_len = id_str.len;
        return pending;
    }

    fn submitOrder(ptr: *anyopaque, side: Side, qty: f64, signal_price: f64) ?PendingOrder {
        _ = signal_price;
        const self: *SimExchange = @ptrCast(@alignCast(ptr));
        return submitOrderImpl(self, side, qty);
    }

    fn checkOrder(ptr: *anyopaque, order_id_str: []const u8) OrderStatus {
        const self: *SimExchange = @ptrCast(@alignCast(ptr));
        const oid = orderIdFromSlice(order_id_str);
        self.appendLog(.{ .tick = self.tick_count, .kind = .check, .order_id = oid });

        const order = self.findOrder(oid) orelse return .{ .failed = {} };
        if (order.filled) {
            const fp = order.price + self.fill_price_offset;
            const fq = order.qty * self.partial_fill_ratio;
            var fill = self.makeFill(fp, fq);
            const id_str = std.fmt.bufPrint(&fill.order_id, "{d}", .{oid}) catch return .{ .failed = {} };
            fill.order_id_len = id_str.len;
            self.removeOrder(oid);
            return .{ .filled = fill };
        }
        if (order.cancelled) {
            self.removeOrder(oid);
            return .{ .cancelled = {} };
        }

        // Check if fill delay has elapsed
        if (self.tick_count >= order.submit_tick + self.fill_delay) {
            order.filled = true;
            const fp = order.price + self.fill_price_offset;
            const fq = order.qty * self.partial_fill_ratio;
            if (order.side == .buy) {
                self.position_qty += fq;
                self.position_entry = fp;
            } else {
                self.position_qty -= fq;
                if (self.position_qty <= 0) {
                    self.position_qty = 0;
                    self.position_entry = 0;
                }
            }
            self.appendLog(.{ .tick = self.tick_count, .kind = .fill, .order_id = oid, .side = order.side, .qty = fq, .price = fp });
            var fill = self.makeFill(fp, fq);
            const id_str = std.fmt.bufPrint(&fill.order_id, "{d}", .{oid}) catch return .{ .failed = {} };
            fill.order_id_len = id_str.len;
            self.removeOrder(oid);
            return .{ .filled = fill };
        }

        return .{ .pending = {} };
    }

    fn cancelOrder(ptr: *anyopaque, order_id_str: []const u8) CancelResult {
        const self: *SimExchange = @ptrCast(@alignCast(ptr));
        const oid = orderIdFromSlice(order_id_str);
        self.appendLog(.{ .tick = self.tick_count, .kind = .cancel, .order_id = oid });

        if (self.fail_next_cancel) {
            self.fail_next_cancel = false;
            return .{ .failed = {} };
        }

        const order = self.findOrder(oid) orelse return .{ .failed = {} };

        if (self.cancel_fills_instead or order.filled) {
            // Race condition: order filled before cancel
            order.filled = true;
            const fp = order.price + self.fill_price_offset;
            const fq = order.qty * self.partial_fill_ratio;
            return .{ .filled = self.makeFill(fp, fq) };
        }

        order.cancelled = true;
        return .{ .cancelled = {} };
    }

    fn getPosition(ptr: *anyopaque) ?Position {
        const self: *SimExchange = @ptrCast(@alignCast(ptr));
        self.appendLog(.{ .tick = self.tick_count, .kind = .get_position });
        if (self.position_qty <= 0) return null;
        return .{
            .qty = self.position_qty,
            .entry_price = self.position_entry,
            .market_value = self.position_qty * self.position_entry,
            .unrealized_pnl = 0,
        };
    }

    fn makeFill(self: *const SimExchange, fill_price: f64, fill_qty: f64) OrderFill {
        var fill: OrderFill = .{ .fill_price = fill_price, .fill_qty = fill_qty, .status = .filled };
        fill.quote_amount = self.fill_quote_amount;
        if (self.fill_commission > 0 or self.fill_commission_asset_len > 0) {
            fill.commission = self.fill_commission;
            fill.commission_usd = self.fill_commission_usd;
            const len = @min(self.fill_commission_asset_len, fill.commission_asset.len);
            @memcpy(fill.commission_asset[0..len], self.fill_commission_asset[0..len]);
            fill.commission_asset_len = len;
        }
        return fill;
    }

    const vtable = Exchange.VTable{
        .buy = @ptrCast(&buy),
        .sell = @ptrCast(&sell),
        .submitOrder = @ptrCast(&submitOrder),
        .checkOrder = @ptrCast(&checkOrder),
        .cancelOrder = @ptrCast(&cancelOrder),
        .getPosition = @ptrCast(&getPosition),
    };
};
