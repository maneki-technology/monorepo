/// LiveLoop — extracted main loop logic for testability.
/// Holds all state that runLive() manages as local variables.
/// processTick() handles one tick — same logic as the while loop body in runLive().
const std = @import("std");
const types = @import("types.zig");
const exchange_mod = @import("exchange.zig");
const turso_mod = @import("turso.zig");
const strat_mod = @import("strategy.zig");

const Tick = types.Tick;
const Trade = types.Trade;
const Strategy = strat_mod.Strategy;
const Exchange = exchange_mod.Exchange;

pub const PendingOrderEntry = struct {
    order_id: [64]u8 = undefined,
    order_id_len: usize = 0,
    side: exchange_mod.Side,
    signal_price: f64,
    size: f64,
    transfer_id: u32 = 0,
    is_deposit_buy: bool = false,
    entry_price: f64 = 0,
    pnl: f64 = 0,
    exit_type: types.Trade.ExitType = .dc_exit,
};

pub const MAX_PENDING: usize = 4;

pub const LiveLoop = struct {
    strategy: *Strategy,
    exchange: Exchange,
    turso: ?*const turso_mod.Turso,

    pending_orders: [MAX_PENDING]PendingOrderEntry = undefined,
    pending_count: u8 = 0,
    closed_count: u32 = 0,
    last_feed_ts: f64 = 0,
    last_price: f64 = 0,
    prev_regime: Strategy.Regime = .bear,
    was_downsampled: bool = false, // true if last processTick ran strategy (1/min)

    // Event counters for test assertions
    buys_submitted: u32 = 0,
    buys_filled: u32 = 0,
    sells_submitted: u32 = 0,
    sells_filled: u32 = 0,
    cancels_issued: u32 = 0,
    deposit_buys_submitted: u32 = 0,

    // Events emitted per tick (read by main.zig for notifications/logging)
    regime_changed: bool = false,
    old_regime: Strategy.Regime = .bear,
    last_buy_fill: ?struct { price: f64, size: f64, is_deposit: bool } = null,
    last_sell_fill: ?struct { price: f64, size: f64, pnl: f64, exit_type: types.Trade.ExitType } = null,
    last_sell_trade: ?types.Trade = null, // for printLiveTrade
    pub fn init(strategy: *Strategy, exchange: Exchange, turso: ?*const turso_mod.Turso) LiveLoop {
        return .{
            .strategy = strategy,
            .exchange = exchange,
            .turso = turso,
            .prev_regime = strategy.regime,
        };
    }

    /// Process one tick — same logic as the main loop body in runLive().
    /// Returns true if the loop should continue, false to stop.
    pub fn processTick(self: *LiveLoop, t: Tick) void {
        // Clear per-tick events
        self.was_downsampled = false;
        self.regime_changed = false;
        self.last_buy_fill = null;
        self.last_sell_fill = null;
        self.last_sell_trade = null;
        self.last_price = t.price;

        // --- Phase 1: Check pending orders (every tick) ---
        self.checkPendingOrders(t);

        if (t.timestamp - self.last_feed_ts < 60.0) {
            // Realtime risk path between strategy ticks.
            if (self.strategy.regime == .bear) {
                if (self.strategy.checkStop(t.price, t.timestamp)) |trade| {
                    self.cancelPendingBuys();
                    self.submitSell(trade, t.timestamp);
                }
            }
            return;
        }
        self.was_downsampled = true;
        self.last_feed_ts = t.timestamp;

        // --- Phase 2: Strategy tick ---
        self.strategy.buy_signal = false;
        if (self.strategy.processTick(t)) |trade| {
            self.cancelPendingBuys();
            self.submitSell(trade, t.timestamp);
        }

        if (self.strategy.buy_signal) {
            self.strategy.buy_signal = false;
            if (!self.hasPendingRegularBuy()) {
                self.submitBuy(self.strategy.buy_signal_price, self.strategy.buy_signal_size, false, t.timestamp);
            }
        }
        // Detect regime change
        if (self.strategy.regime != self.prev_regime) {
            self.regime_changed = true;
            self.old_regime = self.prev_regime;
        }
        self.prev_regime = self.strategy.regime;
    }

    // ========== Internal helpers ==========

    fn checkPendingOrders(self: *LiveLoop, t: Tick) void {
        var i: u8 = 0;
        while (i < self.pending_count) {
            const po = self.pending_orders[i];
            const oid = po.order_id[0..po.order_id_len];
            const status = self.exchange.checkOrder(oid);
            switch (status) {
                .filled => |fill| {
                    if (po.side == .buy) {
                        self.handleBuyFill(po, fill, t);
                    } else {
                        self.handleSellFill(po, fill);
                    }
                    self.removePending(i);
                    continue; // re-check swapped entry
                },
                .cancelled, .failed => {
                    if (po.side == .buy) self.strategy.capital_reserved -= po.signal_price * po.size;
                    if (po.transfer_id > 0 and self.turso != null) self.turso.?.voidTransfer(po.transfer_id);
                    self.removePending(i);
                    continue;
                },
                .pending => {},
            }
            i += 1;
        }
    }

    fn handleBuyFill(self: *LiveLoop, po: PendingOrderEntry, fill: exchange_mod.OrderFill, t: Tick) void {
        self.strategy.capital_reserved -= po.signal_price * po.size;
        const buy_price = if (fill.fill_price > 0) fill.fill_price else po.signal_price;
        const buy_size = if (fill.fill_qty > 0) fill.fill_qty else po.size;
        const fee = if (fill.commission > 0) fill.commission else buy_price * buy_size * 0.001;

        if (po.is_deposit_buy) {
            self.strategy.entry_price = (self.strategy.entry_price * self.strategy.size + buy_price * buy_size) / (self.strategy.size + buy_size);
            self.strategy.size += buy_size;
            self.strategy.capital -= fee;
            if (buy_price > self.strategy.peak_price) self.strategy.peak_price = buy_price;
        } else {
            const unspent = (po.size - buy_size) * buy_price;
            self.strategy.capital += unspent;
            self.strategy.entry_price = buy_price;
            self.strategy.size = buy_size;
            self.strategy.peak_price = buy_price;
            self.strategy.in_position = true;
        }
        self.buys_filled += 1;
        self.last_buy_fill = .{ .price = buy_price, .size = buy_size, .is_deposit = po.is_deposit_buy };

        if (po.transfer_id > 0 and self.turso != null) {
            const buy_cost = buy_price * buy_size;
            var ud_buf: [256]u8 = undefined;
            const ud = std.fmt.bufPrint(&ud_buf, "BUY oid={s}", .{po.order_id[0..po.order_id_len]}) catch "BUY";
            self.turso.?.postTransferWithFill(po.transfer_id, buy_cost, buy_price, buy_size, ud);
            self.turso.?.createPostedTransfer(turso_mod.Turso.ACCT_FEES, turso_mod.Turso.ACCT_CASH, fee, turso_mod.Turso.CODE_FEE, "BUY fee", t.timestamp, 0, 0);
        }
    }

    fn handleSellFill(self: *LiveLoop, po: PendingOrderEntry, fill: exchange_mod.OrderFill) void {
        const sell_price = if (fill.fill_price > 0) fill.fill_price else po.signal_price;
        const sell_fee = if (fill.commission > 0) fill.commission else sell_price * po.size * 0.001;
        const pnl = (sell_price - po.entry_price) * po.size - sell_fee;
        const price_diff_pnl = (sell_price - po.signal_price) * po.size;
        if (price_diff_pnl != 0) self.strategy.capital += price_diff_pnl;
        self.sells_filled += 1;
        self.last_sell_fill = .{ .price = sell_price, .size = po.size, .pnl = pnl, .exit_type = po.exit_type };

        if (po.transfer_id > 0 and self.turso != null) {
            const sell_amount = sell_price * po.size;
            const exit_str = switch (po.exit_type) {
                .dc_exit => "DC",
                .trailing_stop => "SL",
                .regime_close => "REG",
                .end_of_data => "END",
            };
            var ud_buf: [128]u8 = undefined;
            const ud = std.fmt.bufPrint(&ud_buf, "SELL exit={s}", .{exit_str}) catch "SELL";
            self.turso.?.postTransferWithFill(po.transfer_id, sell_amount, sell_price, po.size, ud);
            self.turso.?.createPostedTransfer(turso_mod.Turso.ACCT_FEES, turso_mod.Turso.ACCT_CASH, sell_fee, turso_mod.Turso.CODE_FEE, "SELL fee", 0, 0, 0);
            if (pnl > 0) {
                self.turso.?.createPostedTransfer(turso_mod.Turso.ACCT_CASH, turso_mod.Turso.ACCT_PNL, pnl, turso_mod.Turso.CODE_PNL, "Realized PnL", 0, 0, 0);
            } else if (pnl < 0) {
                self.turso.?.createPostedTransfer(turso_mod.Turso.ACCT_PNL, turso_mod.Turso.ACCT_CASH, -pnl, turso_mod.Turso.CODE_PNL, "Realized loss", 0, 0, 0);
            }
        }
    }

    pub fn submitBuy(self: *LiveLoop, price: f64, size: f64, is_deposit: bool, timestamp: f64) void {
        if (self.exchange.submitOrder(.buy, size)) |pending| {
            if (self.pending_count < MAX_PENDING) {
                const oid_slice = pending.order_id[0..pending.order_id_len];
                var tid: u32 = 0;
                if (self.turso != null) {
                    const cost = price * size;
                    tid = self.turso.?.createPendingTransfer(turso_mod.Turso.ACCT_BTC, turso_mod.Turso.ACCT_CASH, cost, turso_mod.Turso.CODE_BUY, "BUY pending", timestamp, price, size, oid_slice) orelse 0;
                }
                self.pending_orders[self.pending_count] = .{
                    .side = .buy,
                    .signal_price = price,
                    .size = size,
                    .is_deposit_buy = is_deposit,
                    .transfer_id = tid,
                };
                const len = @min(pending.order_id_len, self.pending_orders[self.pending_count].order_id.len);
                @memcpy(self.pending_orders[self.pending_count].order_id[0..len], pending.order_id[0..len]);
                self.pending_orders[self.pending_count].order_id_len = len;
                self.pending_count += 1;
                self.strategy.capital_reserved += price * size;
                if (is_deposit) {
                    self.deposit_buys_submitted += 1;
                } else {
                    self.buys_submitted += 1;
                }
            }
        }
    }

    fn submitSell(self: *LiveLoop, trade: Trade, timestamp: f64) void {
        self.closed_count += 1;
        self.last_sell_trade = trade; // for printLiveTrade in main.zig
        if (self.exchange.submitOrder(.sell, trade.size)) |pending| {
            if (self.pending_count < MAX_PENDING) {
                const oid_slice = pending.order_id[0..pending.order_id_len];
                var tid: u32 = 0;
                if (self.turso != null) {
                    const sell_amt = trade.exit_price * trade.size;
                    tid = self.turso.?.createPendingTransfer(turso_mod.Turso.ACCT_CASH, turso_mod.Turso.ACCT_BTC, sell_amt, turso_mod.Turso.CODE_SELL, "SELL pending", timestamp, trade.exit_price, trade.size, oid_slice) orelse 0;
                }
                self.pending_orders[self.pending_count] = .{
                    .side = .sell,
                    .signal_price = trade.exit_price,
                    .size = trade.size,
                    .entry_price = trade.entry_price,
                    .pnl = trade.pnl,
                    .exit_type = trade.exit_type,
                    .transfer_id = tid,
                };
                const len = @min(pending.order_id_len, self.pending_orders[self.pending_count].order_id.len);
                @memcpy(self.pending_orders[self.pending_count].order_id[0..len], pending.order_id[0..len]);
                self.pending_orders[self.pending_count].order_id_len = len;
                self.pending_count += 1;
                self.sells_submitted += 1;
            }
        }
    }

    fn cancelPendingBuys(self: *LiveLoop) void {
        var i: u8 = 0;
        while (i < self.pending_count) {
            if (self.pending_orders[i].side == .buy) {
                const cancel_oid = self.pending_orders[i].order_id[0..self.pending_orders[i].order_id_len];
                const result = self.exchange.cancelOrder(cancel_oid);
                switch (result) {
                    .filled => |fill| {
                        const bp = if (fill.fill_price > 0) fill.fill_price else self.pending_orders[i].signal_price;
                        const bs = if (fill.fill_qty > 0) fill.fill_qty else self.pending_orders[i].size;
                        if (self.pending_orders[i].is_deposit_buy) {
                            self.strategy.entry_price = (self.strategy.entry_price * self.strategy.size + bp * bs) / (self.strategy.size + bs);
                            self.strategy.size += bs;
                            if (bp > self.strategy.peak_price) self.strategy.peak_price = bp;
                        } else {
                            self.strategy.entry_price = bp;
                            self.strategy.size = bs;
                            self.strategy.peak_price = bp;
                            self.strategy.in_position = true;
                        }
                        self.buys_filled += 1;
                    },
                    .cancelled, .failed => {
                        if (self.pending_orders[i].transfer_id > 0 and self.turso != null) {
                            self.turso.?.voidTransfer(self.pending_orders[i].transfer_id);
                        }
                    },
                }
                self.strategy.capital_reserved -= self.pending_orders[i].signal_price * self.pending_orders[i].size;
                self.cancels_issued += 1;
                self.removePending(i);
                continue;
            }
            i += 1;
        }
    }

    fn hasPendingRegularBuy(self: *const LiveLoop) bool {
        var j: u8 = 0;
        while (j < self.pending_count) : (j += 1) {
            if (self.pending_orders[j].side == .buy and !self.pending_orders[j].is_deposit_buy) return true;
        }
        return false;
    }

    fn removePending(self: *LiveLoop, index: u8) void {
        self.pending_count -= 1;
        if (index < self.pending_count) {
            self.pending_orders[index] = self.pending_orders[self.pending_count];
        }
    }
};
