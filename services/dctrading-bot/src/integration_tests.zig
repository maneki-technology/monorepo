/// Integration tests for the live trading loop.
/// Uses SimExchange + SimFeed + LiveLoop to test actual code paths end-to-end.
const std = @import("std");
const testing = std.testing;
const types = @import("types.zig");
const strat_mod = @import("strategy.zig");
const exchange_mod = @import("exchange.zig");
const sim_exchange_mod = @import("sim_exchange.zig");
const tick_source_mod = @import("tick_source.zig");
const live_loop_mod = @import("live_loop.zig");

const Tick = types.Tick;
const Strategy = strat_mod.Strategy;
const SimExchange = sim_exchange_mod.SimExchange;
const SimFeed = tick_source_mod.SimFeed;
const LiveLoop = live_loop_mod.LiveLoop;

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
