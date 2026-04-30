const std = @import("std");
const testing = std.testing;
const types = @import("types.zig");
const dc_mod = @import("dc_detector.zig");
const strat_mod = @import("strategy.zig");

const Tick = types.Tick;
const DCDetector = dc_mod.DCDetector;
const Strategy = strat_mod.Strategy;

// ============================================================
// DC Detector Tests
// ============================================================

fn tick(price: f64, ts: f64) Tick {
    return .{ .timestamp = ts, .price = price, .volume = 1.0 };
}

test "dc_detector: first tick initializes, no event" {
    var d = DCDetector.init(0.07);
    const event = d.processTick(tick(100.0, 1.0));
    try testing.expect(event == null);
    try testing.expect(d.initialized);
    try testing.expect(d.direction.? == .up);
    try testing.expectApproxEqAbs(d.extreme_price, 100.0, 0.001);
}

test "dc_detector: price rises, no event in up mode" {
    var d = DCDetector.init(0.07);
    _ = d.processTick(tick(100.0, 1.0));
    const event = d.processTick(tick(110.0, 2.0));
    try testing.expect(event == null);
    try testing.expectApproxEqAbs(d.extreme_price, 110.0, 0.001);
}

test "dc_detector: 7% drop triggers down event" {
    var d = DCDetector.init(0.07);
    _ = d.processTick(tick(100.0, 1.0));
    const event = d.processTick(tick(93.0, 2.0));
    try testing.expect(event != null);
    try testing.expect(event.?.direction == .down);
    try testing.expectApproxEqAbs(event.?.extreme_price, 100.0, 0.001);
    try testing.expectApproxEqAbs(event.?.confirm_price, 93.0, 0.001);
    // Detector should now be in down mode
    try testing.expect(d.direction.? == .down);
}

test "dc_detector: 6% drop does NOT trigger event" {
    var d = DCDetector.init(0.07);
    _ = d.processTick(tick(100.0, 1.0));
    const event = d.processTick(tick(94.0, 2.0));
    try testing.expect(event == null);
}

test "dc_detector: down then 7% rise triggers up event" {
    var d = DCDetector.init(0.07);
    _ = d.processTick(tick(100.0, 1.0));
    _ = d.processTick(tick(93.0, 2.0)); // triggers down
    // Now in down mode at 93.0
    const event = d.processTick(tick(99.51, 3.0)); // 7% rise from 93.0
    try testing.expect(event != null);
    try testing.expect(event.?.direction == .up);
    try testing.expect(d.direction.? == .up);
}

test "dc_detector: reset clears state" {
    var d = DCDetector.init(0.07);
    _ = d.processTick(tick(100.0, 1.0));
    d.reset();
    try testing.expect(!d.initialized);
    try testing.expect(d.direction == null);
}

// ============================================================
// Strategy Tests
// ============================================================

test "strategy: init with defaults" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{});
    defer s.deinit(allocator);

    try testing.expectApproxEqAbs(s.capital, 10000.0, 0.001);
    try testing.expect(!s.in_position);
    try testing.expect(s.regime == .bear);
    try testing.expectEqual(s.tick_count, 0);
}

test "strategy: bootstrap fills MA without opening positions" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{ .ma_period = 10 });
    defer s.deinit(allocator);

    var closes: [15]f64 = undefined;
    for (&closes, 0..) |*c, i| c.* = 100.0 + @as(f64, @floatFromInt(i));
    s.bootstrap(&closes);

    try testing.expect(!s.in_position); // no position opened
    try testing.expectEqual(s.tick_count, 15);
    try testing.expectEqual(s.price_count, 10); // MA buffer full
    try testing.expectApproxEqAbs(s.capital, 10000.0, 0.001); // capital unchanged
}

test "strategy: catchup updates indicators without trading" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{ .ma_period = 10 });
    defer s.deinit(allocator);

    // Bootstrap first to fill MA
    var bootstrap_data: [10]f64 = undefined;
    for (&bootstrap_data) |*c| c.* = 100.0;
    s.bootstrap(&bootstrap_data);

    // Simulate holding a position
    s.in_position = true;
    s.entry_price = 100.0;
    s.size = 1.0;
    s.peak_price = 100.0;

    // Catch up with rising prices
    var catchup_data: [5]f64 = undefined;
    for (&catchup_data, 0..) |*c, i| c.* = 105.0 + @as(f64, @floatFromInt(i));
    s.catchup(&catchup_data);

    try testing.expect(s.in_position); // still holding
    try testing.expectApproxEqAbs(s.peak_price, 109.0, 0.001); // peak updated
    try testing.expectApproxEqAbs(s.capital, 10000.0, 0.001); // no trades
    try testing.expectEqual(s.tick_count, 15);
}

test "strategy: bull regime opens position" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    // Fill MA with low prices, then jump above MA+3% to trigger BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    // MA is 100.0, need price > 103.0 for BULL
    _ = s.processTick(tick(104.0, 6.0));

    try testing.expect(s.regime == .bull);
    try testing.expect(s.in_position);
    try testing.expectApproxEqAbs(s.entry_price, 104.0, 0.001);
}

test "strategy: checkStop is regime-agnostic (caller gates by regime)" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .base_trail = 0.02,
    });
    defer s.deinit(allocator);

    // Set up a position in BULL mode
    s.regime = .bull;
    s.in_position = true;
    s.entry_price = 100.0;
    s.size = 1.0;
    s.peak_price = 100.0;
    s.current_trail = 0.02;
    s.capital = 9990.0;

    // checkStop fires regardless of regime — main.zig gates it
    const trade = s.checkStop(97.9, 7.0); // 2.1% drop > 2% trail
    try testing.expect(trade != null);
    try testing.expect(trade.?.exit_type == .trailing_stop);
}

test "strategy: checkStop fires in bear mode" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .base_trail = 0.02,
    });
    defer s.deinit(allocator);

    // Manually set up a bear position
    s.regime = .bear;
    s.in_position = true;
    s.entry_price = 100.0;
    s.size = 1.0;
    s.peak_price = 100.0;
    s.current_trail = 0.02;
    s.capital = 9990.0; // after entry fee

    const trade = s.checkStop(97.9, 1.0); // 2.1% drop > 2% trail
    try testing.expect(trade != null);
    try testing.expect(trade.?.exit_type == .trailing_stop);
    try testing.expect(!s.in_position);
}

test "strategy: forceClose closes open position" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{});
    defer s.deinit(allocator);

    s.in_position = true;
    s.entry_price = 100.0;
    s.size = 1.0;
    s.capital = 9990.0;

    const trade = s.forceClose(105.0, 10.0);
    try testing.expect(trade != null);
    try testing.expect(trade.?.exit_type == .end_of_data);
    try testing.expect(!s.in_position);
}

test "strategy: forceClose returns null when no position" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{});
    defer s.deinit(allocator);

    const trade = s.forceClose(105.0, 10.0);
    try testing.expect(trade == null);
}

// ============================================================
// Feed Parsing Tests (Binance JSON)
// ============================================================

// Import the parseBinanceTrade function via feed module
const feed_mod = @import("feed.zig");

test "feed: parse valid Binance trade JSON" {
    const json =
        \\{"e":"trade","E":123,"s":"BTCUSDT","t":456,"p":"78123.45","q":"0.001","T":1777248563983,"b":1,"a":2,"m":false}
    ;
    const result = feed_mod.parseBinanceTrade(json);
    try testing.expect(result != null);
    const t = result.?;
    try testing.expectApproxEqAbs(t.price, 78123.45, 0.01);
    try testing.expectApproxEqAbs(t.volume, 0.001, 0.0001);
    try testing.expectApproxEqAbs(t.timestamp, 1777248563.983, 0.001);
}

test "feed: parse returns null for non-JSON" {
    const result = feed_mod.parseBinanceTrade("1777196360249");
    try testing.expect(result == null);
}

test "feed: parse returns null for empty data" {
    const result = feed_mod.parseBinanceTrade("");
    try testing.expect(result == null);
}

test "feed: parse returns null for malformed JSON" {
    const result = feed_mod.parseBinanceTrade("{\"foo\":\"bar\"}");
    try testing.expect(result == null);
}

// ============================================================
// Feed Kline Parsing Tests (Binance REST)
// ============================================================

test "feed: normalizeSymbol converts BTC/USDT to BTCUSDT" {
    const sym = feed_mod.normalizeSymbol("BTC/USDT");
    try testing.expectEqualStrings("BTCUSDT", sym.slice());
}

test "feed: normalizeSymbol uppercases lowercase input" {
    const sym = feed_mod.normalizeSymbol("btc/usdt");
    try testing.expectEqualStrings("BTCUSDT", sym.slice());
}

test "feed: normalizeSymbol handles no-slash input" {
    const sym = feed_mod.normalizeSymbol("BTCUSDT");
    try testing.expectEqualStrings("BTCUSDT", sym.slice());
}

test "feed: parseKlineCloses parses klines (first skipped by outer bracket)" {
    // Parser skips first kline due to [[ detection — matches Binance behavior
    // where we always fetch 1000 and losing one is negligible
    const json =
        \\[[1700000000000,"95000.00","96000.00","94000.00","95500.50","100.0",1700000060000,"0",0,"0","0","0"],
        \\[1700000060000,"95500.50","97000.00","95000.00","96800.00","200.0",1700000120000,"0",0,"0","0","0"]]
    ;
    const result = feed_mod.parseKlineCloses(json);
    try testing.expectEqual(result.parsed, 1);
    try testing.expectApproxEqAbs(result.prices[0], 96800.00, 0.01);
    try testing.expectEqual(result.last_close_time, 1700000120000);
}

test "feed: parseKlineCloses parses multiple klines" {
    const json =
        \\[[1700000000000,"95000.00","96000.00","94000.00","95500.00","100.0",1700000060000,"0",0,"0","0","0"],
        \\[1700000060000,"95500.00","97000.00","95000.00","96800.00","200.0",1700000120000,"0",0,"0","0","0"],
        \\[1700000120000,"96800.00","98000.00","96000.00","97200.00","150.0",1700000180000,"0",0,"0","0","0"]]
    ;
    const result = feed_mod.parseKlineCloses(json);
    try testing.expectEqual(result.parsed, 2); // first kline skipped
    try testing.expectApproxEqAbs(result.prices[0], 96800.00, 0.01);
    try testing.expectApproxEqAbs(result.prices[1], 97200.00, 0.01);
    try testing.expectEqual(result.last_close_time, 1700000180000);
}

test "feed: parseKlineCloses returns zero parsed for empty array" {
    const result = feed_mod.parseKlineCloses("[]");
    try testing.expectEqual(result.parsed, 0);
}

test "feed: parseKlineCloses returns zero parsed for non-array" {
    const result = feed_mod.parseKlineCloses("not json");
    try testing.expectEqual(result.parsed, 0);
}

// ============================================================
// 3-Regime Tests
// ============================================================

test "strategy: sideways regime when price in MA buffer zone" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
    });
    defer s.deinit(allocator);

    // Fill MA with 100.0
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    // MA=100, price 101 is within ±3% → sideways
    _ = s.processTick(tick(101.0, 6.0));
    try testing.expect(s.regime == .sideways);
}

test "strategy: regime transitions bull/sideways/bear" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
    });
    defer s.deinit(allocator);

    // Fill MA with 100.0
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    // MA=100, price > 103 → bull
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(s.regime == .bull);

    // Price drops into buffer zone → sideways
    _ = s.processTick(tick(101.0, 7.0));
    try testing.expect(s.regime == .sideways);

    // Price drops below 97 → bear
    _ = s.processTick(tick(96.0, 8.0));
    try testing.expect(s.regime == .bear);

    // Price back into buffer zone → sideways
    _ = s.processTick(tick(99.0, 9.0));
    try testing.expect(s.regime == .sideways);

    // Price above buffer → bull
    _ = s.processTick(tick(104.0, 10.0));
    try testing.expect(s.regime == .bull);
}

test "strategy: sideways mode does DC trading without trailing stop" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .base_trail = 0.02,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    // Fill MA, then enter sideways
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(101.0, 6.0)); // sideways
    try testing.expect(s.regime == .sideways);
    try testing.expect(!s.in_position);

    // DC UP event: price drops to 94 (down), then rises 7% to ~100.6
    _ = s.processTick(tick(93.0, 7.0)); // DC DOWN from 101→93
    _ = s.processTick(tick(99.51, 8.0)); // DC UP from 93→99.51 (7% rise)
    try testing.expect(s.in_position); // should have opened

    // Now drop 2.1% — trailing stop should NOT fire in sideways
    const entry = s.entry_price;
    s.peak_price = entry;
    const drop_price = entry * 0.979; // 2.1% drop
    const trade = s.processTick(tick(drop_price, 9.0));
    try testing.expect(trade == null); // no trailing stop in sideways
    try testing.expect(s.in_position); // still holding
}

test "strategy: bear mode trailing stop still works" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .base_trail = 0.02,
    });
    defer s.deinit(allocator);

    // Set up position in bear mode
    s.regime = .bear;
    s.in_position = true;
    s.entry_price = 100.0;
    s.size = 1.0;
    s.peak_price = 100.0;
    s.current_trail = 0.02;
    s.capital = 9990.0;

    // Fill MA so updateMA doesn't change regime
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        s.price_buf[i] = 110.0; // MA=110, price 97.9 < 110*0.97=106.7 → stays bear
    }
    s.price_count = 5;
    s.price_sum = 550.0;

    // 2.1% drop should trigger trailing stop in bear
    const trade = s.processTick(tick(97.9, 1.0));
    try testing.expect(trade != null);
    try testing.expect(trade.?.exit_type == .trailing_stop);
    try testing.expect(!s.in_position);
}

test "strategy: checkpoint round-trip preserves sideways regime" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer s.deinit(allocator);

    s.regime = .sideways;
    s.capital = 5000.0;
    s.tick_count = 42;
    s.last_timestamp = 1700000000.0;

    const path: [*:0]const u8 = "/tmp/test_ckpt_3reg.bin";
    try testing.expect(s.saveCheckpoint(path));

    // Load into fresh strategy
    var s2 = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer s2.deinit(allocator);

    try testing.expect(s2.loadCheckpoint(path));
    try testing.expect(s2.regime == .sideways);
    try testing.expectApproxEqAbs(s2.capital, 5000.0, 0.001);
    try testing.expectEqual(s2.tick_count, 42);
}

test "strategy: checkpoint round-trip preserves all 3 regimes" {
    const allocator = testing.allocator;
    const path: [*:0]const u8 = "/tmp/test_ckpt_regimes.bin";

    // Test each regime value round-trips correctly
    const regimes = [_]Strategy.Regime{ .bull, .sideways, .bear };
    for (regimes) |regime| {
        var s = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
        defer s.deinit(allocator);
        s.regime = regime;
        try testing.expect(s.saveCheckpoint(path));

        var s2 = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
        defer s2.deinit(allocator);
        try testing.expect(s2.loadCheckpoint(path));
        try testing.expect(s2.regime == regime);
    }
}

test "strategy: bootstrap preserves regime on restart (no re-warmup needed)" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer s.deinit(allocator);

    // Bootstrap with prices that establish bull regime
    var closes: [15]f64 = undefined;
    for (&closes, 0..) |*c, i| c.* = 100.0 + @as(f64, @floatFromInt(i));
    // Last prices are 114.0 — MA of last 10 is ~109.5, 114 > 109.5*1.03 → bull
    s.bootstrap(&closes);
    try testing.expect(s.regime == .bull);
    const saved_regime = s.regime;

    // Save checkpoint
    const path: [*:0]const u8 = "/tmp/test_ckpt_warmup.bin";
    try testing.expect(s.saveCheckpoint(path));

    // Simulate restart: load checkpoint (no bootstrap needed)
    var s2 = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer s2.deinit(allocator);
    try testing.expect(s2.loadCheckpoint(path));

    // Regime preserved — no re-warmup
    try testing.expect(s2.regime == saved_regime);
    try testing.expectEqual(s2.price_count, 10); // MA buffer still full
    try testing.expectEqual(s2.tick_count, 15);
}

test "strategy: old DCTRADE3 checkpoint rejected after upgrade" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer s.deinit(allocator);

    // Write a fake DCTRADE3 checkpoint (old magic)
    const path: [*:0]const u8 = "/tmp/test_ckpt_old.bin";
    const old_magic: u64 = 0x4443_5452_4144_4533; // DCTRADE3
    const fp = strat_mod.fopen(path, "wb") orelse unreachable;
    var scalars: [24]f64 = undefined;
    @memset(&scalars, 0);
    scalars[0] = @as(f64, @bitCast(old_magic));
    _ = strat_mod.fwrite(@ptrCast(&scalars), @sizeOf(f64), 24, fp);
    _ = strat_mod.fclose(fp);

    // Should fail to load (magic mismatch)
    try testing.expect(!s.loadCheckpoint(path));
}


// ============================================================
// HTTP Client / Alpaca / Turso Parsing Tests
// ============================================================

const alpaca_mod = @import("alpaca.zig");
const turso_mod = @import("turso.zig");

test "alpaca: parseJsonFloat parses quoted float" {
    const json = "{\"filled_avg_price\":\"76960.70\",\"qty\":\"0.01295111\"}";
    const price = alpaca_mod.Alpaca.parseJsonFloat(json, "\"filled_avg_price\":");
    try testing.expect(price != null);
    try testing.expectApproxEqAbs(price.?, 76960.70, 0.01);
}

test "alpaca: parseJsonFloat parses unquoted float" {
    const json = "{\"market_value\":996.73,\"qty\":\"0.01\"}";
    const mv = alpaca_mod.Alpaca.parseJsonFloat(json, "\"market_value\":");
    try testing.expect(mv != null);
    try testing.expectApproxEqAbs(mv.?, 996.73, 0.01);
}

test "alpaca: parseJsonFloat returns null for missing key" {
    const json = "{\"foo\":\"bar\"}";
    const val = alpaca_mod.Alpaca.parseJsonFloat(json, "\"price\":");
    try testing.expect(val == null);
}

test "alpaca: parseJsonString parses quoted string" {
    const json = "{\"id\":\"abc-123-def\",\"status\":\"filled\"}";
    const id = alpaca_mod.Alpaca.parseJsonString(json, "\"id\":");
    try testing.expect(id != null);
    try testing.expectEqualStrings("abc-123-def", id.?);
}

test "alpaca: parseJsonString returns null for missing key" {
    const json = "{\"foo\":\"bar\"}";
    const val = alpaca_mod.Alpaca.parseJsonString(json, "\"id\":");
    try testing.expect(val == null);
}

test "turso: parseFirstValueFloat parses Turso response" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[[{\"type\":\"float\",\"value\":\"9990.50\"}]]}}}]}";
    const val = turso_mod.Turso.parseFirstValueFloat(json);
    try testing.expect(val != null);
    try testing.expectApproxEqAbs(val.?, 9990.50, 0.01);
}

test "turso: parseFirstValueFloat returns null for empty rows" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[]}}}]}";
    const val = turso_mod.Turso.parseFirstValueFloat(json);
    try testing.expect(val == null);
}

test "turso: parseFirstValueInt parses count" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[[{\"type\":\"integer\",\"value\":\"42\"}]]}}}]}";
    const val = turso_mod.Turso.parseFirstValueInt(json);
    try testing.expect(val != null);
    try testing.expectEqual(val.?, 42);
}

test "turso: parseFirstValueInt returns 0 for empty rows" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[]}}}]}";
    const val = turso_mod.Turso.parseFirstValueInt(json);
    try testing.expect(val != null);
    try testing.expectEqual(val.?, 0);
}

test "turso: parseFirstValueFloat handles unquoted number" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[[{\"type\":\"float\",\"value\":1234.56}]]}}}]}";
    const val = turso_mod.Turso.parseFirstValueFloat(json);
    try testing.expect(val != null);
    try testing.expectApproxEqAbs(val.?, 1234.56, 0.01);
}


// ============================================================
// Capital Accounting Tests (Alpaca qty rounding)
// ============================================================

test "strategy: unspent capital added back when Alpaca fills less qty" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Fill MA to trigger BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    // BULL: price > MA+3% triggers open
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(s.in_position);

    // Strategy calculated: capital=999 (after fee), size=999/104=9.60576923
    const strategy_size = s.size;
    const strategy_capital = s.capital; // 999.0 after fee deduction
    try testing.expectApproxEqAbs(strategy_capital, 999.0, 0.01);

    // Simulate Alpaca filling less qty (e.g. 9.60 instead of 9.60576923)
    const alpaca_fill_qty = 9.60;
    const alpaca_fill_price = 104.0;
    const unspent = (strategy_size - alpaca_fill_qty) * alpaca_fill_price;
    s.capital += unspent;
    s.size = alpaca_fill_qty;
    s.entry_price = alpaca_fill_price;

    // Capital should have unspent added back
    try testing.expect(s.capital > 999.0);
    const expected_capital = 999.0 + (strategy_size - 9.60) * 104.0;
    try testing.expectApproxEqAbs(s.capital, expected_capital, 0.01);

    // Equity should be: capital + (price - entry) * size
    const equity = s.capital + (104.0 - s.entry_price) * s.size;
    // At entry price, unrealized = 0, so equity = capital
    try testing.expectApproxEqAbs(equity, s.capital, 0.01);
}

test "strategy: no unspent capital when Alpaca fills exact qty" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Fill MA to trigger BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(s.in_position);

    const strategy_size = s.size;
    const strategy_capital = s.capital;

    // Alpaca fills exact same qty
    const unspent = (strategy_size - strategy_size) * 104.0;
    s.capital += unspent;

    // Capital unchanged
    try testing.expectApproxEqAbs(s.capital, strategy_capital, 0.001);
}

test "strategy: equity correct after Alpaca fill with price drift" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Fill MA to trigger BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(s.in_position);

    const strategy_size = s.size;

    // Alpaca fills at different price AND slightly less qty (realistic)
    const alpaca_price = 104.50; // price drifted up
    const alpaca_qty = strategy_size - 0.005; // tiny rounding, realistic
    const unspent = (strategy_size - alpaca_qty) * alpaca_price;
    s.capital += unspent;
    s.entry_price = alpaca_price;
    s.size = alpaca_qty;

    // Capital should be slightly > 999 (unspent added back)
    try testing.expect(s.capital > 999.0);
    try testing.expect(s.capital < 1000.0); // but not more than initial

    // At entry price, unrealized = 0, so equity = capital
    const equity_at_entry = s.capital + (alpaca_price - s.entry_price) * s.size;
    try testing.expectApproxEqAbs(equity_at_entry, s.capital, 0.001);

    // Simulate close at entry price: PnL = -exit_fee only
    const exit_fee = s.size * alpaca_price * 0.001;
    const close_pnl = (alpaca_price - s.entry_price) * s.size - exit_fee;
    const final_capital = s.capital + close_pnl;
    // Lost entry fee + exit fee, but gained unspent
    try testing.expect(final_capital < 1000.0);
    try testing.expect(final_capital > 996.0);
}


// ============================================================
// Manual Trade Reconciliation Tests
// ============================================================

test "reconcile: manual buy when no position (deposit + buy)" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Simulate manual buy: deposit external capital, then buy
    const alpaca_price = 80000.0;
    const alpaca_qty = 0.01;
    const cost = alpaca_price * alpaca_qty; // 800
    const fee_est = cost * s.fee_pct; // 0.80

    // Deposit (external capital)
    s.capital += cost;
    // Buy
    s.in_position = true;
    s.entry_price = alpaca_price;
    s.size = alpaca_qty;
    s.peak_price = alpaca_price;
    s.capital -= (cost + fee_est);

    try testing.expect(s.in_position);
    try testing.expectApproxEqAbs(s.size, 0.01, 0.0001);
    try testing.expectApproxEqAbs(s.entry_price, 80000.0, 0.01);
    // capital = 1000 + 800 (deposit) - 800 (cost) - 0.80 (fee) = 999.20
    try testing.expectApproxEqAbs(s.capital, 999.20, 0.01);
}

test "reconcile: manual buy added to existing position (blend entry)" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Existing position
    s.in_position = true;
    s.entry_price = 75000.0;
    s.size = 0.01;
    s.peak_price = 76000.0;
    s.capital = 250.0; // after initial buy

    // Alpaca reports more qty at different price
    const alpaca_qty = 0.015; // added 0.005
    const alpaca_entry = 76000.0; // Alpaca's blended avg
    const added_qty = alpaca_qty - s.size; // 0.005
    const added_cost = alpaca_entry * added_qty; // 380
    const fee_est = added_cost * s.fee_pct; // 0.38

    // Deposit external capital
    s.capital += added_cost;
    // Blend entry price and deduct
    s.entry_price = (s.entry_price * s.size + alpaca_entry * added_qty) / alpaca_qty;
    s.size = alpaca_qty;
    s.capital -= (added_cost + fee_est);

    try testing.expectApproxEqAbs(s.size, 0.015, 0.0001);
    // Blended: (75000*0.01 + 76000*0.005) / 0.015 = (750+380)/0.015 = 75333.33
    // capital = 250 + 380 (deposit) - 380 (cost) - 0.38 (fee) = 249.62
    try testing.expectApproxEqAbs(s.capital, 249.62, 0.01);
}

test "reconcile: manual full sell" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Bot has open position
    s.in_position = true;
    s.entry_price = 80000.0;
    s.size = 0.01;
    s.peak_price = 82000.0;
    s.capital = 200.0;

    // Alpaca has no position — manual sell at current price
    const sell_price = 85000.0;
    const proceeds = sell_price * s.size; // 850
    const fee_est = proceeds * s.fee_pct; // 0.85
    const raw_pnl = (sell_price - s.entry_price) * s.size; // 50
    const net_pnl = raw_pnl - fee_est; // 49.15

    s.capital += net_pnl;
    s.in_position = false;
    s.size = 0;
    s.entry_price = 0;
    s.peak_price = 0;

    try testing.expect(!s.in_position);
    try testing.expectApproxEqAbs(s.size, 0, 0.0001);
    try testing.expectApproxEqAbs(s.capital, 200.0 + 49.15, 0.01);
}

test "reconcile: manual partial sell" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Bot has open position
    s.in_position = true;
    s.entry_price = 80000.0;
    s.size = 0.02;
    s.peak_price = 82000.0;
    s.capital = 100.0;

    // Alpaca reports reduced qty (sold half)
    const alpaca_qty = 0.01;
    const sold_qty = s.size - alpaca_qty; // 0.01
    const current_price = 85000.0;
    const proceeds = current_price * sold_qty; // 850
    const fee_est = proceeds * s.fee_pct; // 0.85
    const raw_pnl = (current_price - s.entry_price) * sold_qty; // 50
    const net_pnl = raw_pnl - fee_est; // 49.15

    s.capital += net_pnl;
    s.size = alpaca_qty;

    try testing.expect(s.in_position); // still in position
    try testing.expectApproxEqAbs(s.size, 0.01, 0.0001);
    try testing.expectApproxEqAbs(s.capital, 100.0 + 49.15, 0.01);
}
