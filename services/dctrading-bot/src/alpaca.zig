/// Alpaca paper trading client — sync + async order interfaces via native HTTP.
const std = @import("std");
const http_mod = @import("http_client.zig");
const HttpClient = http_mod.HttpClient;
const exchange_mod = @import("exchange.zig");
const Exchange = exchange_mod.Exchange;
const OrderFill = exchange_mod.OrderFill;
const PendingOrder = exchange_mod.PendingOrder;
const OrderStatus = exchange_mod.OrderStatus;
const CancelResult = exchange_mod.CancelResult;
const Side = exchange_mod.Side;
const ExchangePosition = exchange_mod.Position;

extern "c" fn getenv(name: [*:0]const u8) ?[*:0]const u8;
extern "c" fn usleep(usec: c_uint) c_int;

pub const Alpaca = struct {
    api_key: []const u8,
    api_secret: []const u8,
    http: *HttpClient,

    pub fn init(http: *HttpClient) ?Alpaca {
        const key_ptr = getenv("ALPACA_API_KEY") orelse {
            std.debug.print("  [alpaca] ALPACA_API_KEY not set, paper trading disabled.\n", .{});
            return null;
        };
        const secret_ptr = getenv("ALPACA_API_SECRET") orelse {
            std.debug.print("  [alpaca] ALPACA_API_SECRET not set, paper trading disabled.\n", .{});
            return null;
        };
        const key = std.mem.sliceTo(key_ptr, 0);
        const secret = std.mem.sliceTo(secret_ptr, 0);
        std.debug.print("  [alpaca] Paper trading enabled.\n", .{});
        return .{ .api_key = key, .api_secret = secret, .http = http };
    }

    /// Return an Exchange interface backed by this Alpaca instance.
    pub fn exchange(self: *const Alpaca) Exchange {
        return .{
            .ptr = @ptrCast(self),
            .vtable = &vtable,
        };
    }

    const vtable = Exchange.VTable{
        .buy = @ptrCast(&buy),
        .sell = @ptrCast(&sell),
        .submitOrder = @ptrCast(&submitOrderAsync),
        .checkOrder = @ptrCast(&checkOrderStatus),
        .cancelOrder = @ptrCast(&cancelOrderAsync),
        .getPosition = @ptrCast(&getPositionExchange),
    };

    fn headers(self: *const Alpaca) [2]HttpClient.Header {
        return .{
            .{ .name = "APCA-API-KEY-ID", .value = self.api_key },
            .{ .name = "APCA-API-SECRET-KEY", .value = self.api_secret },
        };
    }

    fn headersWithJson(self: *const Alpaca) [3]HttpClient.Header {
        return .{
            .{ .name = "APCA-API-KEY-ID", .value = self.api_key },
            .{ .name = "APCA-API-SECRET-KEY", .value = self.api_secret },
            .{ .name = "content-type", .value = "application/json" },
        };
    }

    // ========== Sync interface (blocking) ==========

    /// Place a synchronous market BUY. Returns fill details or null on failure.
    pub fn buy(self: *const Alpaca, qty: f64) ?OrderFill {
        var body_buf: [256]u8 = undefined;
        const body = std.fmt.bufPrint(&body_buf,
            \\{{"symbol":"BTC/USD","qty":"{d:.8}","side":"buy","type":"market","time_in_force":"gtc"}}
        , .{qty}) catch return null;
        return self.submitOrderSync(body);
    }

    /// Place a synchronous market SELL for given qty. Returns fill details or null.
    pub fn sell(self: *const Alpaca, qty: f64) ?OrderFill {
        var body_buf: [256]u8 = undefined;
        const body = std.fmt.bufPrint(&body_buf,
            \\{{"symbol":"BTC/USD","qty":"{d:.8}","side":"sell","type":"market","time_in_force":"gtc"}}
        , .{qty}) catch return null;
        return self.submitOrderSync(body);
    }

    // ========== Async interface (non-blocking) ==========

    /// Submit order without waiting for fill. Returns PendingOrder with order ID.
    /// Typically completes in ~200ms (just the POST, no polling).
    pub fn submitOrderAsync(self: *const Alpaca, side: Side, qty: f64) ?PendingOrder {
        var body_buf: [256]u8 = undefined;
        const side_str = if (side == .buy) "buy" else "sell";
        const body = std.fmt.bufPrint(&body_buf,
            \\{{"symbol":"BTC/USD","qty":"{d:.8}","side":"{s}","type":"market","time_in_force":"gtc"}}
        , .{ qty, side_str }) catch return null;

        const h = self.headersWithJson();
        const resp = self.http.post(
            "https://paper-api.alpaca.markets/v2/orders",
            &h,
            body,
        ) catch |err| {
            std.debug.print("  [alpaca] submitOrder HTTP error: {s}\n", .{@errorName(err)});
            return null;
        };
        defer resp.deinit();

        const r = resp.body;
        std.debug.print("  [alpaca] Order submitted ({d} bytes): {s}\n", .{ r.len, r[0..@min(r.len, 300)] });

        if (std.mem.indexOf(u8, r, "\"message\"") != null and std.mem.indexOf(u8, r, "\"id\"") == null) {
            return null;
        }

        var pending: PendingOrder = .{ .side = side, .qty = qty };
        if (parseJsonString(r, "\"id\":")) |id| {
            const len = @min(id.len, pending.order_id.len);
            @memcpy(pending.order_id[0..len], id[0..len]);
            pending.order_id_len = len;
        } else {
            return null; // no order ID = submission failed
        }

        // Check if already filled (common for market orders)
        if (std.mem.indexOf(u8, r, "\"status\":\"filled\"") != null) {
            std.debug.print("  [alpaca] Immediately filled.\n", .{});
        }

        return pending;
    }

    /// Check status of a pending order. Single GET, no polling, no sleep.
    pub fn checkOrderStatus(self: *const Alpaca, order_id: []const u8) OrderStatus {
        var url_buf: [256]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf,
            "https://paper-api.alpaca.markets/v2/orders/{s}",
            .{order_id},
        ) catch return .{ .failed = {} };

        const h = self.headers();
        const resp = self.http.get(url, &h) catch return .{ .pending = {} };
        defer resp.deinit();

        const r = resp.body;

        if (std.mem.indexOf(u8, r, "\"status\":\"filled\"") != null) {
            var fill: OrderFill = .{ .fill_price = 0, .fill_qty = 0, .status = .filled };
            fill.fill_price = parseJsonFloat(r, "\"filled_avg_price\":") orelse 0;
            fill.fill_qty = parseJsonFloat(r, "\"filled_qty\":") orelse 0;
            fill.commission = parseJsonFloat(r, "\"commission\":") orelse 0;
            fill.commission_usd = fill.commission;
            @memcpy(fill.commission_asset[0..3], "USD");
            fill.commission_asset_len = 3;
            // Copy order ID
            const len = @min(order_id.len, fill.order_id.len);
            @memcpy(fill.order_id[0..len], order_id[0..len]);
            fill.order_id_len = len;
            std.debug.print("  [alpaca] checkOrder: filled price=${d:.2} qty={d:.8}\n", .{ fill.fill_price, fill.fill_qty });
            return .{ .filled = fill };
        }

        if (std.mem.indexOf(u8, r, "\"status\":\"canceled\"") != null or
            std.mem.indexOf(u8, r, "\"status\":\"expired\"") != null)
        {
            return .{ .cancelled = {} };
        }

        if (std.mem.indexOf(u8, r, "\"status\":\"rejected\"") != null) {
            return .{ .failed = {} };
        }

        // Still new/accepted/partially_filled — keep waiting
        return .{ .pending = {} };
    }

    /// Cancel a pending order. DELETE then check final status.
    pub fn cancelOrderAsync(self: *const Alpaca, order_id: []const u8) CancelResult {
        var url_buf: [256]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf,
            "https://paper-api.alpaca.markets/v2/orders/{s}",
            .{order_id},
        ) catch return .{ .failed = {} };

        const h = self.headers();
        // DELETE to request cancellation
        _ = self.http.delete(url, &h) catch {
            return .{ .failed = {} };
        };

        // Brief pause then check final status (cancel is near-instant for market orders)
        _ = usleep(200_000); // 200ms

        // Check if it was filled before cancel took effect
        const status = self.checkOrderStatus(order_id);
        return switch (status) {
            .filled => |fill| .{ .filled = fill },
            .cancelled => .{ .cancelled = {} },
            .pending => .{ .cancelled = {} }, // cancel was accepted, treat as cancelled
            .failed => .{ .failed = {} },
        };
    }

    // ========== Position query ==========

    /// Get current BTC/USD position. Returns ExchangePosition for interface compatibility.
    fn getPositionExchange(self: *const Alpaca) ?ExchangePosition {
        return self.getPosition();
    }

    /// Get current BTC/USD position from Alpaca. Returns null if no position.
    pub fn getPosition(self: *const Alpaca) ?ExchangePosition {
        const h = self.headers();
        const resp = self.http.get(
            "https://paper-api.alpaca.markets/v2/positions/BTCUSD",
            &h,
        ) catch return null;
        defer resp.deinit();

        const r = resp.body;
        if (std.mem.indexOf(u8, r, "\"code\"") != null) return null;

        const qty = parseJsonFloat(r, "\"qty\":") orelse return null;
        const entry = parseJsonFloat(r, "\"avg_entry_price\":") orelse return null;
        const mv = parseJsonFloat(r, "\"market_value\":") orelse 0;
        const pnl = parseJsonFloat(r, "\"unrealized_pl\":") orelse 0;

        std.debug.print("  [alpaca] Position: qty={d:.8} entry=${d:.2}\n", .{ qty, entry });
        return .{ .qty = qty, .entry_price = entry, .market_value = mv, .unrealized_pnl = pnl };
    }

    // ========== Sync order (blocking, kept for backward compat) ==========

    fn submitOrderSync(self: *const Alpaca, body: []const u8) ?OrderFill {
        const h = self.headersWithJson();
        var attempt: u32 = 0;
        while (attempt < 2) : (attempt += 1) {
            const resp = self.http.post(
                "https://paper-api.alpaca.markets/v2/orders",
                &h,
                body,
            ) catch |err| {
                std.debug.print("  [alpaca] HTTP error (attempt {d}): {s}\n", .{ attempt + 1, @errorName(err) });
                _ = usleep(1_000_000);
                continue;
            };
            defer resp.deinit();

            const r = resp.body;
            std.debug.print("  [alpaca] Order response ({d} bytes): {s}\n", .{ r.len, r[0..@min(r.len, 300)] });

            if (std.mem.indexOf(u8, r, "\"message\"") != null and std.mem.indexOf(u8, r, "\"id\"") == null) {
                return null;
            }

            var fill: OrderFill = .{ .fill_price = 0, .fill_qty = 0, .status = .accepted };
            if (parseJsonString(r, "\"id\":")) |id| {
                const len = @min(id.len, fill.order_id.len);
                @memcpy(fill.order_id[0..len], id[0..len]);
                fill.order_id_len = len;
            }

            if (std.mem.indexOf(u8, r, "\"status\":\"filled\"") != null) {
                fill.status = .filled;
                fill.fill_price = parseJsonFloat(r, "\"filled_avg_price\":") orelse 0;
                fill.fill_qty = parseJsonFloat(r, "\"filled_qty\":") orelse 0;
                fill.commission = parseJsonFloat(r, "\"commission\":") orelse 0;
                fill.commission_usd = fill.commission;
                @memcpy(fill.commission_asset[0..3], "USD");
                fill.commission_asset_len = 3;
                std.debug.print("  [alpaca] Filled: price=${d:.2} qty={d:.8} fee=${d:.4}\n", .{ fill.fill_price, fill.fill_qty, fill.commission });
                return fill;
            }

            if (fill.order_id_len > 0) {
                const order_id = fill.order_id[0..fill.order_id_len];
                var poll: u32 = 0;
                while (poll < 10) : (poll += 1) {
                    _ = usleep(1_000_000);
                    var poll_url_buf: [256]u8 = undefined;
                    const poll_url = std.fmt.bufPrint(&poll_url_buf,
                        "https://paper-api.alpaca.markets/v2/orders/{s}",
                        .{order_id},
                    ) catch break;

                    const ph = self.headers();
                    const poll_resp = self.http.get(poll_url, &ph) catch continue;
                    defer poll_resp.deinit();

                    const pr = poll_resp.body;
                    if (std.mem.indexOf(u8, pr, "\"status\":\"filled\"") != null) {
                        fill.status = .filled;
                        fill.fill_price = parseJsonFloat(pr, "\"filled_avg_price\":") orelse 0;
                        fill.fill_qty = parseJsonFloat(pr, "\"filled_qty\":") orelse 0;
                        fill.commission = parseJsonFloat(pr, "\"commission\":") orelse 0;
                        fill.commission_usd = fill.commission;
                        @memcpy(fill.commission_asset[0..3], "USD");
                        fill.commission_asset_len = 3;
                        std.debug.print("  [alpaca] Filled (poll {d}): price=${d:.2} qty={d:.8} fee=${d:.4}\n", .{ poll + 1, fill.fill_price, fill.fill_qty, fill.commission });
                        return fill;
                    }
                    if (std.mem.indexOf(u8, pr, "\"status\":\"canceled\"") != null or
                        std.mem.indexOf(u8, pr, "\"status\":\"expired\"") != null or
                        std.mem.indexOf(u8, pr, "\"status\":\"rejected\"") != null)
                    {
                        std.debug.print("  [alpaca] Order failed.\n", .{});
                        fill.status = .failed;
                        return fill;
                    }
                }
                std.debug.print("  [alpaca] Order not filled after 10s, treating as failed.\n", .{});
                fill.status = .failed;
            }
            return fill;
        }
        return null; // all retries exhausted
    }

    // ========== JSON helpers ==========

    pub fn parseJsonFloat(json: []const u8, key: []const u8) ?f64 {
        const pos = std.mem.indexOf(u8, json, key) orelse return null;
        var start = pos + key.len;
        while (start < json.len and (json[start] == ' ' or json[start] == '"')) : (start += 1) {}
        var end = start;
        while (end < json.len and json[end] != ',' and json[end] != '}' and json[end] != '"') : (end += 1) {}
        return std.fmt.parseFloat(f64, json[start..end]) catch null;
    }

    pub fn parseJsonString(json: []const u8, key: []const u8) ?[]const u8 {
        const pos = std.mem.indexOf(u8, json, key) orelse return null;
        var start = pos + key.len;
        while (start < json.len and json[start] == ' ') : (start += 1) {}
        if (start >= json.len or json[start] != '"') return null;
        start += 1;
        const end = std.mem.indexOf(u8, json[start..], "\"") orelse return null;
        return json[start..][0..end];
    }
};
