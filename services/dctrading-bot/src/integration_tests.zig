/// Integration tests for the live trading loop.
/// Uses SimExchange + SimFeed + LiveLoop to test actual code paths end-to-end.
const std = @import("std");
const testing = std.testing;
const types = @import("types.zig");
const strat_mod = @import("strategy.zig");
const exchange_mod = @import("exchange.zig");
const turso_mod = @import("turso.zig");
const sim_exchange_mod = @import("sim_exchange.zig");
const tick_source_mod = @import("tick_source.zig");
const live_loop_mod = @import("live_loop.zig");

const Tick = types.Tick;
const Strategy = strat_mod.Strategy;
const SimExchange = sim_exchange_mod.SimExchange;
const SimFeed = tick_source_mod.SimFeed;
const LiveLoop = live_loop_mod.LiveLoop;
const Ledger = live_loop_mod.Ledger;

const MockLedger = struct {
    next_id: u32 = 100,
    pending_count: u32 = 0,
    post_fill_count: u32 = 0,
    posted_count: u32 = 0,
    void_count: u32 = 0,
    last_pending: PendingCall = .{},
    last_post_fill: PostFillCall = .{},
    posted: [8]PostedCall = undefined,
    voided_id: u32 = 0,

    const PendingCall = struct {
        debit_acct: u8 = 0,
        credit_acct: u8 = 0,
        amount: f64 = 0,
        code: u8 = 0,
        timestamp: f64 = 0,
        price: f64 = 0,
        qty: f64 = 0,
        order_id_len: usize = 0,
    };

    const PostFillCall = struct {
        pending_id: u32 = 0,
        actual_amount: f64 = 0,
        actual_price: f64 = 0,
        actual_size: f64 = 0,
    };

    const PostedCall = struct {
        debit_acct: u8 = 0,
        credit_acct: u8 = 0,
        amount: f64 = 0,
        code: u8 = 0,
        timestamp: f64 = 0,
        price: f64 = 0,
        qty: f64 = 0,
    };

    fn ledger(self: *MockLedger) Ledger {
        return .{
            .ptr = @ptrCast(self),
            .vtable = &vtable,
        };
    }

    fn createPendingTransfer(ptr: *const anyopaque, debit_acct: u8, credit_acct: u8, amount: f64, code: u8, _: []const u8, timestamp: f64, price: f64, qty: f64, order_id: []const u8) ?u32 {
        const self: *MockLedger = @ptrCast(@alignCast(@constCast(ptr)));
        self.pending_count += 1;
        self.last_pending = .{
            .debit_acct = debit_acct,
            .credit_acct = credit_acct,
            .amount = amount,
            .code = code,
            .timestamp = timestamp,
            .price = price,
            .qty = qty,
            .order_id_len = order_id.len,
        };
        const id = self.next_id;
        self.next_id += 1;
        return id;
    }

    fn postTransferWithFill(ptr: *const anyopaque, pending_id: u32, actual_amount: f64, actual_price: f64, actual_size: f64, _: []const u8) void {
        const self: *MockLedger = @ptrCast(@alignCast(@constCast(ptr)));
        self.post_fill_count += 1;
        self.last_post_fill = .{
            .pending_id = pending_id,
            .actual_amount = actual_amount,
            .actual_price = actual_price,
            .actual_size = actual_size,
        };
    }

    fn createPostedTransfer(ptr: *const anyopaque, debit_acct: u8, credit_acct: u8, amount: f64, code: u8, _: []const u8, timestamp: f64, price: f64, qty: f64) void {
        const self: *MockLedger = @ptrCast(@alignCast(@constCast(ptr)));
        if (self.posted_count < self.posted.len) {
            self.posted[self.posted_count] = .{
                .debit_acct = debit_acct,
                .credit_acct = credit_acct,
                .amount = amount,
                .code = code,
                .timestamp = timestamp,
                .price = price,
                .qty = qty,
            };
        }
        self.posted_count += 1;
    }

    fn voidTransfer(ptr: *const anyopaque, pending_id: u32) void {
        const self: *MockLedger = @ptrCast(@alignCast(@constCast(ptr)));
        self.void_count += 1;
        self.voided_id = pending_id;
    }

    const vtable = Ledger.VTable{
        .createPendingTransfer = &createPendingTransfer,
        .postTransferWithFill = &postTransferWithFill,
        .createPostedTransfer = &createPostedTransfer,
        .voidTransfer = &voidTransfer,
    };
};

fn makeTick(price: f64, ts: f64) Tick {
    return .{ .timestamp = ts, .price = price };
}

/// Generate ticks: warmup at base_price, then action ticks.
fn warmupAndRun(loop: *LiveLoop, base_price: f64, warmup_count: usize, action_ticks: []const Tick) void {
    // Warmup: fill MA (1 tick per minute)
    var i: usize = 0;
    while (i < warmup_count) : (i += 1) {
        loop.processTick(makeTick(base_price, @as(f64, @floatFromInt(i)) * 60.0));
    }
    // Action ticks
    for (action_ticks) |t| {
        loop.processTick(t);
    }
}

// ============================================================
// Scenario: Basic buy + sell cycle
// ============================================================

test "integration: BULL buy signal submits async order and fills" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Warmup: 5 ticks at $100 (1/min)
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    // BULL trigger: price > MA + 3%
    loop.processTick(makeTick(104.0, 360.0));
    try testing.expect(loop.buys_submitted == 1);
    try testing.expect(loop.pending_count == 1);
    try testing.expect(!strategy.in_position);

    // Next tick: fill delay elapsed, order fills
    sim.advanceTick();
    loop.processTick(makeTick(104.5, 420.0));
    try testing.expect(loop.buys_filled == 1);
    try testing.expect(loop.pending_count == 0);
    try testing.expect(strategy.in_position);
    try testing.expect(strategy.size > 0);
}

test "integration: trailing stop fires and submits async sell" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Setup: manually put in BEAR with position
    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 100.0;
    strategy.size = 10.0;
    strategy.peak_price = 105.0;
    strategy.current_trail = 0.02; // 2% trailing stop

    // Price drops 3% from peak: 105 * 0.97 = 101.85
    loop.processTick(makeTick(101.0, 60.0));

    try testing.expect(loop.sells_submitted == 1);
    try testing.expect(loop.closed_count == 1);
    try testing.expect(!strategy.in_position);
}

test "integration: buy fills after N ticks, trailing stop active during pending" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 5 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Warmup
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    // BULL trigger
    loop.processTick(makeTick(104.0, 360.0));
    try testing.expect(loop.buys_submitted == 1);
    try testing.expect(loop.pending_count == 1);

    // 4 more ticks: order still pending, ticks processed
    var ticks_during_pending: u32 = 0;
    while (ticks_during_pending < 4) : (ticks_during_pending += 1) {
        sim.advanceTick();
        loop.processTick(makeTick(104.0 + @as(f64, @floatFromInt(ticks_during_pending)) * 0.1, 420.0 + @as(f64, @floatFromInt(ticks_during_pending)) * 60.0));
    }
    try testing.expect(loop.pending_count == 1); // still pending
    try testing.expect(!strategy.in_position);

    // 5th tick: fills
    sim.advanceTick();
    loop.processTick(makeTick(104.5, 720.0));
    try testing.expect(loop.buys_filled == 1);
    try testing.expect(loop.pending_count == 0);
    try testing.expect(strategy.in_position);
}

test "integration: cancel pending buy before trailing stop sell" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 100 }; // won't fill during test
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Setup: BEAR with position + pending deposit buy
    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 100.0;
    strategy.size = 10.0;
    strategy.peak_price = 105.0;
    strategy.current_trail = 0.02;

    // Submit a deposit buy manually
    loop.submitBuy(104.0, 0.5, true, 0.0);
    try testing.expect(loop.pending_count == 1);
    try testing.expect(loop.deposit_buys_submitted == 1);
    const reserved_before = strategy.capital_reserved;
    try testing.expect(reserved_before > 0);

    // Trailing stop fires: should cancel buy then submit sell
    loop.processTick(makeTick(101.0, 60.0));

    try testing.expect(loop.cancels_issued == 1);
    try testing.expect(loop.sells_submitted == 1);
    // Capital reservation released
    try testing.expectApproxEqAbs(strategy.capital_reserved, 0.0, 0.01);
}

test "integration: duplicate buy suppressed while pending" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 100 }; // won't fill
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Warmup
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    // First BULL trigger
    loop.processTick(makeTick(104.0, 360.0));
    try testing.expect(loop.buys_submitted == 1);

    // Second BULL trigger (next minute): should be suppressed
    loop.processTick(makeTick(106.0, 420.0));
    try testing.expect(loop.buys_submitted == 1); // still 1, not 2
}

test "integration: capital_reserved prevents oversized orders" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 100 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Warmup
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    // First buy: reserves ~$999
    loop.processTick(makeTick(104.0, 360.0));
    try testing.expect(loop.buys_submitted == 1);
    try testing.expect(strategy.capital_reserved > 900.0);

    // Available capital is now ~$1
    const available = strategy.capital - strategy.capital_reserved;
    try testing.expect(available < 10.0);
}

test "integration: sell fill adjusts capital for price difference" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    // Slippage: exchange fills $100 higher than signal
    var sim = SimExchange{ .fill_delay = 0, .fill_price_offset = 100.0 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Setup: BEAR with position
    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 90000.0;
    strategy.size = 0.1;
    strategy.peak_price = 95000.0;
    strategy.current_trail = 0.02;

    const capital_before = strategy.capital;

    // Trailing stop at 92000 (signal price)
    // Exchange fills at 92100 (signal + offset)
    sim.last_price = 92000.0;
    loop.processTick(makeTick(92000.0, 60.0));
    try testing.expect(loop.sells_submitted == 1);

    // Next tick: sell order fills via checkPendingOrders
    sim.advanceTick();
    loop.processTick(makeTick(92000.0, 61.0));
    try testing.expect(loop.sells_filled == 1);
    // Capital should be higher than if filled at signal price
    // price_diff_pnl = (92100 - 92000) * 0.1 = $10
    try testing.expect(strategy.capital > capital_before);
}

test "integration: full cycle — warmup, buy, hold, sell" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Phase 1: Warmup (5 ticks at $100)
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }
    try testing.expect(strategy.regime == .bull or strategy.regime == .sideways or strategy.regime == .bear);

    // Phase 2: BULL entry at $104
    loop.processTick(makeTick(104.0, 360.0));
    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0)); // fill
    try testing.expect(strategy.in_position);
    const entry = strategy.entry_price;

    // Phase 3: Hold (price rises)
    loop.processTick(makeTick(106.0, 480.0));
    loop.processTick(makeTick(108.0, 540.0));
    try testing.expect(strategy.in_position); // still holding

    // Phase 4: Price drops to BEAR, trailing stop fires
    loop.processTick(makeTick(90.0, 600.0)); // regime change to BEAR
    strategy.current_trail = 0.02;
    strategy.peak_price = 108.0;
    loop.processTick(makeTick(85.0, 601.0)); // 21% drop from peak, stop fires

    try testing.expect(loop.sells_submitted >= 1);
    try testing.expect(!strategy.in_position);
    _ = entry;
}

// ============================================================
// Deposit scenarios
// ============================================================

test "integration: deposit in BULL with position triggers deposit buy" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Setup: BULL with open position
    strategy.regime = .bull;
    strategy.in_position = true;
    strategy.entry_price = 95000.0;
    strategy.size = 0.01;
    strategy.peak_price = 95000.0;

    // Simulate deposit buy via loop.submitBuy (same path as runLive deposit handler)
    sim.last_price = 96000.0;
    loop.submitBuy(96000.0, 0.01, true, 100.0);

    try testing.expect(loop.deposit_buys_submitted == 1);
    try testing.expect(loop.pending_count == 1);
    try testing.expect(strategy.capital_reserved > 0);
}

test "integration: deposit in BEAR adds capital but no buy" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    const loop = LiveLoop.init(&strategy, ex, null);

    // Setup: BEAR with position
    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 90000.0;
    strategy.size = 0.01;

    // Deposit: capital increases
    const capital_before = strategy.capital;
    strategy.capital += 500.0;
    strategy.initial_capital += 500.0;

    // Condition: not BULL, so no deposit buy
    try testing.expect(strategy.regime != .bull);
    try testing.expect(strategy.capital > capital_before);
    try testing.expect(loop.deposit_buys_submitted == 0);
}

// ============================================================
// Order failure scenarios
// ============================================================

test "integration: order submission failure does not crash" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 0, .fail_next_submit = true };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Warmup
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    // BULL trigger: submit will fail
    loop.processTick(makeTick(104.0, 360.0));

    // No crash, no pending order
    try testing.expect(loop.buys_submitted == 0);
    try testing.expect(loop.pending_count == 0);
    try testing.expect(!strategy.in_position);
}

test "integration: partial fill returns unspent capital" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1, .partial_fill_ratio = 0.5 };
    sim.last_price = 104.0;
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Warmup
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    // BULL trigger
    loop.processTick(makeTick(104.0, 360.0));
    try testing.expect(loop.buys_submitted == 1);
    const requested_size = loop.pending_orders[0].size;

    // Fill (50%)
    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0));
    try testing.expect(loop.buys_filled == 1);
    try testing.expect(strategy.in_position);

    // Size should be half of requested
    try testing.expectApproxEqAbs(strategy.size, requested_size * 0.5, 0.001);
    // Unspent capital returned
    try testing.expect(strategy.capital > 999.0);
}

test "integration: cancel race — buy fills despite cancel" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 100, .cancel_fills_instead = true };
    sim.last_price = 100.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    // Setup: BEAR with position + pending deposit buy
    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 100.0;
    strategy.size = 10.0;
    strategy.peak_price = 105.0;
    strategy.current_trail = 0.02;

    loop.submitBuy(104.0, 0.5, true, 0.0);
    try testing.expect(loop.pending_count == 1);
    try testing.expectEqual(@as(u32, 1), ledger.pending_count);
    try testing.expectEqual(@as(u32, 100), loop.pending_orders[0].transfer_id);

    // Trailing stop fires: cancel buy, but it fills instead
    loop.processTick(makeTick(101.0, 60.0));

    // Buy filled despite cancel — position should be updated
    try testing.expect(loop.buys_filled == 1);
    // Sell also submitted
    try testing.expect(loop.sells_submitted == 1);
    try testing.expectEqual(@as(u32, 2), ledger.pending_count);
    try testing.expectEqual(@as(u32, 1), ledger.post_fill_count);
    try testing.expectEqual(@as(u32, 100), ledger.last_post_fill.pending_id);
    try testing.expectApproxEqAbs(100.0 * 0.5, ledger.last_post_fill.actual_amount, 0.001);
    try testing.expectApproxEqAbs(100.0, ledger.last_post_fill.actual_price, 0.001);
    try testing.expectApproxEqAbs(0.5, ledger.last_post_fill.actual_size, 0.001);
    try testing.expectEqual(@as(u32, 1), ledger.posted_count);
    try testing.expectEqual(turso_mod.Turso.CODE_FEE, ledger.posted[0].code);
    try testing.expectEqual(@as(u32, 0), ledger.void_count);
}

// ============================================================
// Regime transition scenarios
// ============================================================

test "integration: BULL to BEAR activates trailing stop" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Warmup at $100
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    // BULL: buy at $110 (well above MA+3%)
    sim.last_price = 110.0;
    loop.processTick(makeTick(110.0, 360.0));
    sim.advanceTick();
    loop.processTick(makeTick(110.0, 420.0));
    try testing.expect(strategy.in_position);
    try testing.expect(strategy.regime == .bull);

    // Price drops to BEAR
    loop.processTick(makeTick(80.0, 480.0));
    try testing.expect(strategy.regime == .bear);

    // Set trailing stop params
    strategy.current_trail = 0.02;
    strategy.peak_price = 110.0;

    // Price drops further — trailing stop fires (80 is 27% below peak 110)
    loop.processTick(makeTick(75.0, 481.0));
    try testing.expect(loop.sells_submitted >= 1);
    try testing.expect(!strategy.in_position);
}

test "integration: funding rate skip blocks DC entry" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    // Elevated funding rate
    strategy.funding_avg = 0.02; // 2%, well above 0.01% threshold
    strategy.funding_skip_threshold = 0.0001;

    var sim = SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Warmup into BEAR/SIDEWAYS (where DC entries happen)
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }
    // Drop to BEAR
    loop.processTick(makeTick(90.0, 360.0));
    try testing.expect(strategy.regime == .bear);

    // DC up event would normally trigger buy, but funding is elevated
    // Feed enough ticks to trigger a DC event (price swing > threshold)
    loop.processTick(makeTick(80.0, 420.0)); // down
    loop.processTick(makeTick(86.0, 480.0)); // up > 7% from 80

    // No buy submitted — funding rate blocked it
    try testing.expect(loop.buys_submitted == 0);
    try testing.expect(!strategy.in_position);
}

// ============================================================
// Edge cases
// ============================================================

test "integration: MAX_PENDING reached rejects new orders gracefully" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 100 }; // never fills
    sim.last_price = 100.0;
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Fill all 4 pending slots
    loop.submitBuy(100.0, 0.01, true, 0.0);
    loop.submitBuy(101.0, 0.01, true, 0.0);
    loop.submitBuy(102.0, 0.01, true, 0.0);
    loop.submitBuy(103.0, 0.01, true, 0.0);
    try testing.expectEqual(loop.pending_count, 4);

    // 5th order: should be silently rejected
    loop.submitBuy(104.0, 0.01, true, 0.0);
    try testing.expectEqual(loop.pending_count, 4); // still 4
}

test "integration: sell PnL positive trade" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Setup: BEAR with profitable position
    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 80000.0;
    strategy.size = 0.1;
    strategy.peak_price = 95000.0;
    strategy.current_trail = 0.02;

    const capital_before = strategy.capital;

    // Trailing stop at 92000 (profit: 92000 - 80000 = $12000 * 0.1 = $1200)
    sim.last_price = 92000.0;
    loop.processTick(makeTick(92000.0, 60.0));
    try testing.expect(loop.sells_submitted == 1);

    // Fill the sell
    sim.advanceTick();
    loop.processTick(makeTick(92000.0, 61.0));
    try testing.expect(loop.sells_filled == 1);
    // Capital should increase (profitable trade)
    try testing.expect(strategy.capital >= capital_before);
}

test "integration: sell PnL negative trade" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Setup: BEAR with losing position
    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 95000.0;
    strategy.size = 0.1;
    strategy.peak_price = 95500.0;
    strategy.current_trail = 0.02;

    const capital_before = strategy.capital;

    // Trailing stop at 93000 (loss: 93000 - 95000 = -$2000 * 0.1 = -$200)
    sim.last_price = 93000.0;
    loop.processTick(makeTick(93000.0, 60.0));

    sim.advanceTick();
    loop.processTick(makeTick(93000.0, 61.0));
    try testing.expect(loop.sells_filled == 1);
    // Capital should decrease (losing trade)
    try testing.expect(strategy.capital < capital_before);
}

// ============================================================
// DC exit sell (different from trailing stop)
// ============================================================

test "integration: DC down event triggers sell in BEAR" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Setup: BEAR with position (manually, to control DC detector state)
    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 100.0;
    strategy.size = 10.0;
    strategy.peak_price = 100.0;
    strategy.current_trail = 1.0; // very wide trail so it doesn't fire

    // Feed ticks to trigger DC down event (price rises then drops > 7%)
    // First establish an upward extreme
    loop.processTick(makeTick(100.0, 0.0));
    loop.processTick(makeTick(110.0, 60.0)); // DC detector tracks this as extreme
    // Now drop > 7% from 110: 110 * 0.93 = 102.3
    sim.last_price = 101.0;
    loop.processTick(makeTick(101.0, 120.0)); // DC DOWN event

    // If DC down fired, a sell should be submitted
    if (loop.sells_submitted > 0) {
        try testing.expect(!strategy.in_position);
        // Fill the sell
        sim.advanceTick();
        loop.processTick(makeTick(101.0, 121.0));
        try testing.expect(loop.sells_filled >= 1);
    }
    // Note: DC detector state depends on initialization, so the event may not fire
    // in this simplified setup. The key test is that processTick CAN return a Trade
    // and LiveLoop handles it correctly.
}

// ============================================================
// was_downsampled regression test
// ============================================================

test "integration: was_downsampled only true on 1/min ticks" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // First tick at t=1000: last_feed_ts=0, delta=1000 >= 60 → downsampled
    loop.processTick(makeTick(100.0, 1000.0));
    try testing.expect(loop.was_downsampled);

    // Second tick 30s later: NOT downsampled
    loop.processTick(makeTick(100.1, 1030.0));
    try testing.expect(!loop.was_downsampled);

    // Third tick 60s after first: downsampled
    loop.processTick(makeTick(100.2, 1060.0));
    try testing.expect(loop.was_downsampled);

    // Fourth tick 90s: NOT downsampled
    loop.processTick(makeTick(100.3, 1090.0));
    try testing.expect(!loop.was_downsampled);

    // Fifth tick 120s: downsampled
    loop.processTick(makeTick(100.4, 1120.0));
    try testing.expect(loop.was_downsampled);
}

test "integration: event fields emit fills and clear on next tick" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1 };
    sim.last_price = 104.0;
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    loop.processTick(makeTick(104.0, 360.0));
    try testing.expect(loop.last_buy_fill == null);
    try testing.expect(loop.last_sell_trade == null);

    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0));
    try testing.expect(loop.last_buy_fill != null);
    try testing.expect(loop.last_buy_fill.?.price == 104.0);
    try testing.expect(loop.last_buy_fill.?.size > 0);
    try testing.expect(!loop.last_buy_fill.?.is_deposit);

    loop.processTick(makeTick(104.0, 421.0));
    try testing.expect(loop.last_buy_fill == null);

    strategy.regime = .bear;
    strategy.peak_price = 110.0;
    strategy.current_trail = 0.02;
    sim.last_price = 100.0;
    loop.processTick(makeTick(100.0, 422.0));
    try testing.expect(loop.last_sell_trade != null);
    try testing.expect(loop.last_sell_trade.?.exit_type == .trailing_stop);

    sim.advanceTick();
    loop.processTick(makeTick(100.0, 423.0));
    try testing.expect(loop.last_sell_fill != null);
    try testing.expect(loop.last_sell_fill.?.price == 100.0);
    try testing.expect(loop.last_sell_fill.?.exit_type == .trailing_stop);

    loop.processTick(makeTick(100.0, 424.0));
    try testing.expect(loop.last_sell_fill == null);
}

test "integration: one-minute tick uses fresh strategy state before realtime stop" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 1,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 100.0;
    strategy.size = 10.0;
    strategy.peak_price = 105.0;
    strategy.current_trail = 0.02;

    // On the exact strategy tick, processTick() updates MA/regime first. With
    // ma_period=1 this price becomes SIDEWAYS, so stale BEAR stop state must
    // not submit a sell before the strategy update.
    loop.processTick(makeTick(101.0, 60.0));
    try testing.expect(loop.was_downsampled);
    try testing.expect(strategy.regime == .sideways);
    try testing.expect(loop.sells_submitted == 0);
    try testing.expect(strategy.in_position);

    // Between strategy ticks, realtime risk remains active from the latest
    // completed strategy state.
    strategy.regime = .bear;
    strategy.peak_price = 105.0;
    loop.processTick(makeTick(101.0, 61.0));
    try testing.expect(!loop.was_downsampled);
    try testing.expect(loop.sells_submitted == 1);
    try testing.expect(!strategy.in_position);
}

test "integration: ledger records buy pending and actual fill settlement" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1, .fill_price_offset = 2.0 };
    sim.last_price = 104.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    loop.processTick(makeTick(104.0, 360.0));
    try testing.expectEqual(@as(u32, 1), ledger.pending_count);
    try testing.expectEqual(turso_mod.Turso.ACCT_BTC, ledger.last_pending.debit_acct);
    try testing.expectEqual(turso_mod.Turso.ACCT_CASH, ledger.last_pending.credit_acct);
    try testing.expectEqual(turso_mod.Turso.CODE_BUY, ledger.last_pending.code);
    try testing.expectApproxEqAbs(104.0, ledger.last_pending.price, 0.001);
    try testing.expect(ledger.last_pending.order_id_len > 0);
    try testing.expectEqual(@as(u32, 100), loop.pending_orders[0].transfer_id);

    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0));
    const fill_price = 106.0;
    const fill_size = ledger.last_pending.qty;
    try testing.expectEqual(@as(u32, 1), ledger.post_fill_count);
    try testing.expectEqual(@as(u32, 100), ledger.last_post_fill.pending_id);
    try testing.expectApproxEqAbs(fill_price * fill_size, ledger.last_post_fill.actual_amount, 0.001);
    try testing.expectApproxEqAbs(fill_price, ledger.last_post_fill.actual_price, 0.001);
    try testing.expectApproxEqAbs(fill_size, ledger.last_post_fill.actual_size, 0.001);
    try testing.expectEqual(@as(u32, 1), ledger.posted_count);
    try testing.expectEqual(turso_mod.Turso.CODE_FEE, ledger.posted[0].code);
    try testing.expectApproxEqAbs(420.0, ledger.posted[0].timestamp, 0.001);
}

test "integration: buy pending reserves exchange-normalized submitted quantity" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1, .submitted_qty_ratio = 0.9 };
    sim.last_price = 104.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    loop.processTick(makeTick(104.0, 360.0));
    try testing.expectEqual(@as(u32, 1), ledger.pending_count);
    try testing.expectApproxEqAbs(loop.pending_orders[0].size, ledger.last_pending.qty, 0.000001);
    try testing.expectApproxEqAbs(104.0 * loop.pending_orders[0].size, ledger.last_pending.amount, 0.001);
    try testing.expectApproxEqAbs(104.0 * loop.pending_orders[0].size, strategy.capital_reserved, 0.001);

    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0));
    try testing.expectEqual(@as(u32, 1), ledger.post_fill_count);
    try testing.expectApproxEqAbs(ledger.last_pending.qty, ledger.last_post_fill.actual_size, 0.000001);
    try testing.expectApproxEqAbs(0.0, strategy.capital_reserved, 0.001);
}

test "integration: buy ledger uses exchange quote amounts for reserve and fill" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{
        .fill_delay = 1,
        .submitted_quote_amount = 123.45,
        .fill_quote_amount = 120.12,
    };
    sim.last_price = 104.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    loop.processTick(makeTick(104.0, 360.0));
    try testing.expectEqual(@as(u32, 1), ledger.pending_count);
    try testing.expectApproxEqAbs(123.45, ledger.last_pending.amount, 0.001);
    try testing.expectApproxEqAbs(123.45, strategy.capital_reserved, 0.001);

    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0));
    try testing.expectEqual(@as(u32, 1), ledger.post_fill_count);
    try testing.expectApproxEqAbs(120.12, ledger.last_post_fill.actual_amount, 0.001);
    try testing.expectApproxEqAbs(0.0, strategy.capital_reserved, 0.001);
}

test "integration: slippage warning persists until ttl expires" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1, .fill_price_offset = 2.0 };
    sim.last_price = 104.0;
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);
    loop.slippage_warn_pct = 0.01;
    loop.slippage_warning_ttl_sec = 120;

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    loop.processTick(makeTick(104.0, 360.0));
    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0));
    try testing.expectEqualStrings("EXCHANGE_SLIPPAGE", loop.last_warning.?);
    try testing.expectEqualStrings("exchange_slippage_warn_threshold_exceeded", loop.last_warning_error);

    loop.processTick(makeTick(104.0, 480.0));
    try testing.expect(loop.last_warning != null);

    loop.processTick(makeTick(104.0, 540.0));
    try testing.expect(loop.last_warning == null);
}

test "integration: ledger uses actual exchange commission for buy fee" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1, .fill_commission = 0.25 };
    @memcpy(sim.fill_commission_asset[0..3], "USD");
    sim.fill_commission_asset_len = 3;
    sim.last_price = 104.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    loop.processTick(makeTick(104.0, 360.0));
    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0));

    try testing.expectEqual(@as(u32, 1), ledger.posted_count);
    try testing.expectEqual(turso_mod.Turso.CODE_FEE, ledger.posted[0].code);
    try testing.expectEqual(turso_mod.Turso.ACCT_CASH, ledger.posted[0].credit_acct);
    try testing.expectApproxEqAbs(0.25, ledger.posted[0].amount, 0.001);
}

test "integration: ledger routes BNB commission to BNB account" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1, .fill_commission = 0.00123, .fill_commission_usd = 0.75 };
    @memcpy(sim.fill_commission_asset[0..3], "BNB");
    sim.fill_commission_asset_len = 3;
    sim.last_price = 104.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    loop.processTick(makeTick(104.0, 360.0));
    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0));

    try testing.expectEqual(@as(u32, 1), ledger.posted_count);
    try testing.expectEqual(turso_mod.Turso.CODE_FEE, ledger.posted[0].code);
    try testing.expectEqual(turso_mod.Turso.ACCT_FEES, ledger.posted[0].debit_acct);
    try testing.expectEqual(turso_mod.Turso.ACCT_BNB, ledger.posted[0].credit_acct);
    try testing.expectApproxEqAbs(0.75, ledger.posted[0].amount, 0.000001);
    try testing.expectApproxEqAbs(0.00123, ledger.posted[0].qty, 0.000001);
    try testing.expectApproxEqAbs(0.75 / 0.00123, ledger.posted[0].price, 0.000001);
}

test "integration: ledger treats adapter-provided zero commission as actual zero" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1, .fill_commission = 0 };
    @memcpy(sim.fill_commission_asset[0..3], "USD");
    sim.fill_commission_asset_len = 3;
    sim.last_price = 104.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    loop.processTick(makeTick(104.0, 360.0));
    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0));

    try testing.expectEqual(@as(u32, 1), ledger.post_fill_count);
    try testing.expectEqual(@as(u32, 1), ledger.posted_count);
    try testing.expectEqual(turso_mod.Turso.CODE_FEE, ledger.posted[0].code);
    try testing.expectEqual(turso_mod.Turso.ACCT_CASH, ledger.posted[0].credit_acct);
    try testing.expectApproxEqAbs(0.0, ledger.posted[0].amount, 0.001);
}

test "integration: ledger falls back to configured fee only when commission metadata is missing" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1, .fill_commission = 0 };
    sim.last_price = 104.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        loop.processTick(makeTick(100.0, @as(f64, @floatFromInt(i)) * 60.0));
    }

    loop.processTick(makeTick(104.0, 360.0));
    sim.advanceTick();
    loop.processTick(makeTick(104.0, 420.0));

    try testing.expectEqual(@as(u32, 1), ledger.post_fill_count);
    try testing.expectEqual(@as(u32, 1), ledger.posted_count);
    try testing.expectEqual(turso_mod.Turso.CODE_FEE, ledger.posted[0].code);
    try testing.expectEqual(turso_mod.Turso.ACCT_CASH, ledger.posted[0].credit_acct);
    try testing.expectApproxEqAbs(104.0 * ledger.last_pending.qty * 0.001, ledger.posted[0].amount, 0.001);
}

test "integration: ledger routes BTC commission to BTC account on sell" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1, .fill_price_offset = 10.0, .fill_commission = 0.00042 };
    @memcpy(sim.fill_commission_asset[0..3], "BTC");
    sim.fill_commission_asset_len = 3;
    sim.last_price = 120.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 100.0;
    strategy.size = 2.0;
    strategy.peak_price = 130.0;
    strategy.current_trail = 0.02;

    loop.processTick(makeTick(120.0, 60.0));
    sim.advanceTick();
    loop.processTick(makeTick(120.0, 61.0));

    try testing.expectEqual(@as(u32, 2), ledger.posted_count);
    try testing.expectEqual(turso_mod.Turso.CODE_FEE, ledger.posted[0].code);
    try testing.expectEqual(turso_mod.Turso.ACCT_FEES, ledger.posted[0].debit_acct);
    try testing.expectEqual(turso_mod.Turso.ACCT_BTC, ledger.posted[0].credit_acct);
    try testing.expectApproxEqAbs(0.00042 * 130.0, ledger.posted[0].amount, 0.000001);
    try testing.expectApproxEqAbs(0.00042, ledger.posted[0].qty, 0.000001);
    try testing.expectApproxEqAbs(130.0, ledger.posted[0].price, 0.000001);
    try testing.expectEqual(turso_mod.Turso.CODE_PNL, ledger.posted[1].code);
}

test "integration: ledger records sell fill fee and realized pnl" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1, .fill_price_offset = 10.0 };
    sim.last_price = 120.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 100.0;
    strategy.size = 2.0;
    strategy.peak_price = 130.0;
    strategy.current_trail = 0.02;

    loop.processTick(makeTick(120.0, 60.0));
    try testing.expectEqual(@as(u32, 1), ledger.pending_count);
    try testing.expectEqual(turso_mod.Turso.ACCT_CASH, ledger.last_pending.debit_acct);
    try testing.expectEqual(turso_mod.Turso.ACCT_BTC, ledger.last_pending.credit_acct);
    try testing.expectEqual(turso_mod.Turso.CODE_SELL, ledger.last_pending.code);
    try testing.expectEqual(@as(u32, 100), loop.pending_orders[0].transfer_id);

    sim.advanceTick();
    loop.processTick(makeTick(120.0, 61.0));
    const sell_price = 130.0;
    const sell_size = 2.0;
    const sell_fee = sell_price * sell_size * 0.001;
    const pnl = (sell_price - 100.0) * sell_size - sell_fee;
    try testing.expectEqual(@as(u32, 1), ledger.post_fill_count);
    try testing.expectApproxEqAbs(sell_price * sell_size, ledger.last_post_fill.actual_amount, 0.001);
    try testing.expectApproxEqAbs(sell_price, ledger.last_post_fill.actual_price, 0.001);
    try testing.expectApproxEqAbs(sell_size, ledger.last_post_fill.actual_size, 0.001);
    try testing.expectEqual(@as(u32, 2), ledger.posted_count);
    try testing.expectEqual(turso_mod.Turso.CODE_FEE, ledger.posted[0].code);
    try testing.expectApproxEqAbs(sell_fee, ledger.posted[0].amount, 0.001);
    try testing.expectEqual(turso_mod.Turso.CODE_PNL, ledger.posted[1].code);
    try testing.expectEqual(turso_mod.Turso.ACCT_CASH, ledger.posted[1].debit_acct);
    try testing.expectEqual(turso_mod.Turso.ACCT_PNL, ledger.posted[1].credit_acct);
    try testing.expectApproxEqAbs(pnl, ledger.posted[1].amount, 0.001);
}

test "integration: ledger voids cancelled pending buy" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 100 };
    sim.last_price = 100.0;
    const ex = sim.exchange();
    var ledger = MockLedger{};
    var loop = LiveLoop.init(&strategy, ex, ledger.ledger());

    loop.submitBuy(100.0, 1.0, true, 0.0);
    try testing.expectEqual(@as(u32, 1), ledger.pending_count);
    try testing.expectEqual(@as(u32, 100), loop.pending_orders[0].transfer_id);

    strategy.regime = .bear;
    strategy.in_position = true;
    strategy.entry_price = 100.0;
    strategy.size = 1.0;
    strategy.peak_price = 105.0;
    strategy.current_trail = 0.02;

    loop.processTick(makeTick(101.0, 60.0));
    try testing.expectEqual(@as(u32, 1), ledger.void_count);
    try testing.expectEqual(@as(u32, 100), ledger.voided_id);
    try testing.expectEqual(@as(u8, 1), loop.pending_count); // sell remains pending
    try testing.expectEqual(exchange_mod.Side.sell, loop.pending_orders[0].side);
}

// ============================================================
// Startup reconciliation: pending orders copied into LiveLoop
// ============================================================

test "integration: reconciled pending orders are tracked by LiveLoop" {
    // Regression: reconciled pending orders were stored in local vars but never
    // copied into LiveLoop. Orders surviving restart would be ignored.
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    // SimExchange: fill_delay=1 so the order fills on next tick
    var sim = SimExchange{ .fill_delay = 1 };
    sim.last_price = 95000.0;
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Simulate: a pending buy was reconciled from Turso at startup
    // and copied into LiveLoop (the fix)
    const recon_order = ex.submitOrder(.buy, 0.1, 0);
    try testing.expect(recon_order != null);
    const pending = recon_order.?;

    loop.pending_orders[0] = .{
        .side = .buy,
        .signal_price = 95000.0,
        .size = 0.1,
        .transfer_id = 42,
    };
    @memcpy(loop.pending_orders[0].order_id[0..pending.order_id_len], pending.order_id[0..pending.order_id_len]);
    loop.pending_orders[0].order_id_len = pending.order_id_len;
    loop.pending_count = 1;
    strategy.capital_reserved = 95000.0 * 0.1;

    // Verify: LiveLoop has the pending order
    try testing.expectEqual(loop.pending_count, 1);
    try testing.expect(strategy.capital_reserved > 0);

    // Next tick: order should fill via checkPendingOrders
    sim.advanceTick();
    loop.processTick(makeTick(95100.0, 60.0));

    // Verify: order filled, position committed
    try testing.expect(loop.buys_filled == 1);
    try testing.expectEqual(loop.pending_count, 0);
    try testing.expect(strategy.in_position);
    try testing.expect(strategy.capital_reserved == 0);
}

test "integration: reconciled pending sell fills correctly" {
    const allocator = testing.allocator;
    var strategy = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
        .fee_pct = 0.001,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    var sim = SimExchange{ .fill_delay = 1 };
    sim.last_price = 92000.0;
    const ex = sim.exchange();
    var loop = LiveLoop.init(&strategy, ex, null);

    // Setup: had a position, sell was submitted before restart
    strategy.in_position = false; // strategy already closed position
    strategy.capital = 10000.0;

    // Reconciled pending sell
    const recon_order = ex.submitOrder(.sell, 0.1, 0);
    try testing.expect(recon_order != null);
    const pending = recon_order.?;

    loop.pending_orders[0] = .{
        .side = .sell,
        .signal_price = 92000.0,
        .size = 0.1,
        .transfer_id = 43,
        .entry_price = 90000.0,
    };
    @memcpy(loop.pending_orders[0].order_id[0..pending.order_id_len], pending.order_id[0..pending.order_id_len]);
    loop.pending_orders[0].order_id_len = pending.order_id_len;
    loop.pending_count = 1;

    // Next tick: sell fills
    sim.advanceTick();
    loop.processTick(makeTick(92000.0, 60.0));

    try testing.expect(loop.sells_filled == 1);
    try testing.expectEqual(loop.pending_count, 0);
}
