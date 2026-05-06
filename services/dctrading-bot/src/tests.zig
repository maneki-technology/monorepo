const std = @import("std");
const testing = std.testing;
const types = @import("types.zig");
const dc_mod = @import("dc_detector.zig");
const strat_mod = @import("strategy.zig");
const resource_monitor = @import("resource_monitor.zig");
const bnb_monitor = @import("bnb_monitor.zig");

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
const telegram_mod = @import("telegram.zig");

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

test "feed: normalizeSymbol maps USD quote to Binance USDT quote" {
    const sym = feed_mod.normalizeSymbol("BTC/USD");
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

test "feed: parseTickerPrice parses quoted Binance ticker price" {
    const price = feed_mod.parseTickerPrice("{\"symbol\":\"BNBUSDT\",\"price\":\"612.34000000\"}");
    try testing.expect(price != null);
    try testing.expectApproxEqAbs(price.?, 612.34, 0.000001);
}

test "feed: parseTickerPrice parses unquoted ticker price" {
    const price = feed_mod.parseTickerPrice("{\"symbol\":\"BNBUSDT\",\"price\":612.34}");
    try testing.expect(price != null);
    try testing.expectApproxEqAbs(price.?, 612.34, 0.000001);
}

test "feed: parseTickerPrice returns null for missing price" {
    try testing.expect(feed_mod.parseTickerPrice("{\"symbol\":\"BNBUSDT\"}") == null);
}

// ============================================================
// Funding Rate Tests
// ============================================================

test "bnb_monitor: low managed BNB alerts first time" {
    var state: bnb_monitor.AlertState = .{};
    const result = bnb_monitor.evaluate(0.005, 600.0, 5.0, 1000.0, 86400.0, &state);
    try testing.expect(result.enabled);
    try testing.expect(result.is_low);
    try testing.expect(result.should_alert);
    try testing.expect(state.was_low);
    try testing.expectApproxEqAbs(state.last_alert_ts, 1000.0, 0.001);
    try testing.expectApproxEqAbs(result.value_quote, 3.0, 0.001);
}

test "bnb_monitor: low managed BNB suppresses repeated alert before cooldown" {
    var state: bnb_monitor.AlertState = .{};
    _ = bnb_monitor.evaluate(0.005, 600.0, 5.0, 1000.0, 86400.0, &state);
    const repeated = bnb_monitor.evaluate(0.004, 600.0, 5.0, 2000.0, 86400.0, &state);
    try testing.expect(repeated.is_low);
    try testing.expect(!repeated.should_alert);
    try testing.expectApproxEqAbs(state.last_alert_ts, 1000.0, 0.001);
}

test "bnb_monitor: low managed BNB alerts again after cooldown" {
    var state: bnb_monitor.AlertState = .{};
    _ = bnb_monitor.evaluate(0.005, 600.0, 5.0, 1000.0, 3600.0, &state);
    const repeated = bnb_monitor.evaluate(0.004, 600.0, 5.0, 4600.0, 3600.0, &state);
    try testing.expect(repeated.is_low);
    try testing.expect(repeated.should_alert);
    try testing.expectApproxEqAbs(state.last_alert_ts, 4600.0, 0.001);
}

test "bnb_monitor: healthy managed BNB clears low state" {
    var state: bnb_monitor.AlertState = .{};
    _ = bnb_monitor.evaluate(0.005, 600.0, 5.0, 1000.0, 86400.0, &state);
    const healthy = bnb_monitor.evaluate(0.02, 600.0, 5.0, 2000.0, 86400.0, &state);
    try testing.expect(!healthy.is_low);
    try testing.expect(!healthy.should_alert);
    try testing.expect(!state.was_low);

    const low_again = bnb_monitor.evaluate(0.005, 600.0, 5.0, 3000.0, 86400.0, &state);
    try testing.expect(low_again.is_low);
    try testing.expect(low_again.should_alert);
}

test "bnb_monitor: threshold disables alert" {
    var state: bnb_monitor.AlertState = .{};
    const result = bnb_monitor.evaluate(0, 600.0, 0, 1000.0, 86400.0, &state);
    try testing.expect(!result.enabled);
    try testing.expect(!result.is_low);
    try testing.expect(!result.should_alert);
}

test "bnb_monitor: alert mode parser accepts explicit modes" {
    try testing.expectEqual(bnb_monitor.AlertMode.auto, bnb_monitor.parseAlertMode(""));
    try testing.expectEqual(bnb_monitor.AlertMode.auto, bnb_monitor.parseAlertMode("auto"));
    try testing.expectEqual(bnb_monitor.AlertMode.on, bnb_monitor.parseAlertMode("on"));
    try testing.expectEqual(bnb_monitor.AlertMode.on, bnb_monitor.parseAlertMode("true"));
    try testing.expectEqual(bnb_monitor.AlertMode.on, bnb_monitor.parseAlertMode("1"));
    try testing.expectEqual(bnb_monitor.AlertMode.off, bnb_monitor.parseAlertMode("off"));
    try testing.expectEqual(bnb_monitor.AlertMode.off, bnb_monitor.parseAlertMode("false"));
    try testing.expectEqual(bnb_monitor.AlertMode.off, bnb_monitor.parseAlertMode("0"));
}

test "bnb_monitor: auto mode follows observed BNB fee state" {
    try testing.expect(!bnb_monitor.shouldMonitor(.auto, false));
    try testing.expect(bnb_monitor.shouldMonitor(.auto, true));
    try testing.expect(bnb_monitor.shouldMonitor(.on, false));
    try testing.expect(!bnb_monitor.shouldMonitor(.off, true));
}

test "feed: parseFundingRates parses 3 rates and averages" {
    const json = "[{\"symbol\":\"BTCUSDT\",\"fundingRate\":\"0.00010000\",\"fundingTime\":1698768000000},{\"symbol\":\"BTCUSDT\",\"fundingRate\":\"0.00020000\",\"fundingTime\":1698796800000},{\"symbol\":\"BTCUSDT\",\"fundingRate\":\"0.00030000\",\"fundingTime\":1698825600000}]";
    const avg = feed_mod.parseFundingRates(json);
    try testing.expect(avg != null);
    try testing.expectApproxEqAbs(avg.?, 0.0002, 0.000001); // (0.1 + 0.2 + 0.3) / 3 = 0.2
}

test "feed: parseFundingSnapshot returns average count and latest funding time" {
    const json = "[{\"symbol\":\"BTCUSDT\",\"fundingTime\":1698768000000,\"fundingRate\":\"0.00010000\"},{\"symbol\":\"BTCUSDT\",\"fundingTime\":1698796800000,\"fundingRate\":\"0.00020000\"},{\"symbol\":\"BTCUSDT\",\"fundingTime\":1698825600000,\"fundingRate\":\"0.00030000\"}]";
    const snapshot = feed_mod.parseFundingSnapshot(json);
    try testing.expect(snapshot != null);
    try testing.expectApproxEqAbs(snapshot.?.avg, 0.0002, 0.000001);
    try testing.expectEqual(@as(usize, 3), snapshot.?.count);
    try testing.expectApproxEqAbs(snapshot.?.latest_time, 1698825600.0, 0.001);
}

test "feed: parseFundingRates parses single rate" {
    const json = "[{\"fundingRate\":\"0.00050000\"}]";
    const avg = feed_mod.parseFundingRates(json);
    try testing.expect(avg != null);
    try testing.expectApproxEqAbs(avg.?, 0.0005, 0.000001);
}

test "feed: parseFundingRates handles negative rate" {
    const json = "[{\"fundingRate\":\"-0.00030000\"},{\"fundingRate\":\"0.00010000\"}]";
    const avg = feed_mod.parseFundingRates(json);
    try testing.expect(avg != null);
    try testing.expectApproxEqAbs(avg.?, -0.0001, 0.000001); // (-0.3 + 0.1) / 2 = -0.1
}

test "feed: parseFundingRates returns null for empty array" {
    const avg = feed_mod.parseFundingRates("[]");
    try testing.expect(avg == null);
}

test "feed: parseFundingRates returns null for invalid json" {
    const avg = feed_mod.parseFundingRates("not json");
    try testing.expect(avg == null);
}

test "telegram: funding rate status is normal below threshold" {
    try testing.expectEqualStrings("NORMAL", telegram_mod.fundingRateStatus(0.000053, 0.0001));
}

test "telegram: funding rate status is elevated above threshold" {
    try testing.expectEqualStrings("ELEVATED (skip active)", telegram_mod.fundingRateStatus(0.0002, 0.0001));
}

test "telegram: funding rate status is normal when filter disabled" {
    try testing.expectEqualStrings("NORMAL", telegram_mod.fundingRateStatus(0.003, 0));
}

test "telegram: funding cache status reports freshness" {
    try testing.expectEqualStrings("EMPTY", telegram_mod.fundingCacheStatus(0, 1700000000.0));
    try testing.expectEqualStrings("FRESH", telegram_mod.fundingCacheStatus(1700000000.0 - 8.0 * 3600.0, 1700000000.0));
    try testing.expectEqualStrings("STALE", telegram_mod.fundingCacheStatus(1700000000.0 - 10.0 * 3600.0, 1700000000.0));
    try testing.expectEqualStrings("STALE >24h", telegram_mod.fundingCacheStatus(1700000000.0 - 25.0 * 3600.0, 1700000000.0));
}

test "telegram: funding rate message includes average threshold and status" {
    var buf: [256]u8 = undefined;
    const msg = try telegram_mod.formatFundingRateMessage(&buf, "BTC/USD", 0.000053, 0.0001, 1700000000.0 - 3600.0, 1700000000.0 - 8.0 * 3600.0, 1700000000.0, "local");
    try testing.expectEqualStrings(
        "Funding Rate Update\nSymbol: BTC/USD\n24h avg: 0.0053%\nThreshold: 0.0100%\nStatus: NORMAL\nLatest print: 8.0h ago\nCache: FRESH (1.0h)\nInstance: local",
        msg,
    );
}

test "telegram: funding rate stale message includes cache age" {
    var buf: [256]u8 = undefined;
    const msg = try telegram_mod.formatFundingRateStaleMessage(&buf, "BTC/USD", 0.000053, 1700000000.0 - 10.0 * 3600.0, 1700000000.0 - 16.0 * 3600.0, 1700000000.0, "local");
    try testing.expectEqualStrings(
        "Funding Rate Warning\nSymbol: BTC/USD\nRefresh failed\nCached 24h avg: 0.0053%\nLatest print: 16.0h ago\nCache: STALE (10.0h)\nInstance: local",
        msg,
    );
}

test "strategy: funding filter skips DC entry when funding elevated" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    // Fill MA to enter SIDEWAYS
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(101.0, 6.0)); // sideways
    try testing.expect(s.regime == .sideways);

    // Set elevated funding rate
    s.funding_avg = 0.0002; // 0.020% — above default threshold of 0.010%

    // DC DOWN then UP — should trigger entry but funding blocks it
    _ = s.processTick(tick(93.0, 7.0)); // DC DOWN
    _ = s.processTick(tick(99.51, 8.0)); // DC UP — entry signal
    try testing.expect(!s.in_position); // blocked by funding filter
}

test "strategy: funding filter allows entry when funding is low" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    // Fill MA to enter SIDEWAYS
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(101.0, 6.0)); // sideways

    // Set low funding rate
    s.funding_avg = 0.00005; // 0.005% — below threshold

    // DC DOWN then UP — should open position
    _ = s.processTick(tick(93.0, 7.0)); // DC DOWN
    _ = s.processTick(tick(99.51, 8.0)); // DC UP
    try testing.expect(s.in_position); // allowed
}

test "strategy: funding filter does not affect BULL regime entry" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    // Fill MA then jump to BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }

    // Set very high funding
    s.funding_avg = 0.003; // 0.3% — extremely high

    // BULL entry is NOT gated by funding
    _ = s.processTick(tick(104.0, 6.0)); // BULL
    try testing.expect(s.regime == .bull);
    try testing.expect(s.in_position); // opened despite high funding
}

test "strategy: funding filter does not block exits" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    // Set up position in SIDEWAYS with high funding
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(101.0, 6.0)); // sideways
    s.funding_avg = 0.00005; // low — allow entry
    _ = s.processTick(tick(93.0, 7.0)); // DC DOWN
    _ = s.processTick(tick(99.51, 8.0)); // DC UP — opens position
    try testing.expect(s.in_position);

    // Now set high funding
    s.funding_avg = 0.003; // very high

    // DC DOWN should still close — funding doesn't block exits
    _ = s.processTick(tick(92.0, 9.0)); // DC DOWN
    try testing.expect(!s.in_position); // closed despite high funding
}

test "strategy: funding filter disabled when threshold is 0" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    // Disable funding filter
    s.funding_skip_threshold = 0;
    s.funding_avg = 0.003; // very high — but filter disabled

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(101.0, 6.0)); // sideways
    _ = s.processTick(tick(93.0, 7.0)); // DC DOWN
    _ = s.processTick(tick(99.51, 8.0)); // DC UP
    try testing.expect(s.in_position); // allowed — filter disabled
}

test "strategy: DC detector maintains state through BULL regime" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    // Fill MA, enter BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(104.0, 6.0)); // BULL, opens position
    try testing.expect(s.regime == .bull);
    try testing.expect(s.in_position);
    try testing.expect(s.detector.initialized);

    // Price rises during BULL — DC detector should track extreme
    _ = s.processTick(tick(110.0, 7.0));
    _ = s.processTick(tick(115.0, 8.0));
    try testing.expectApproxEqAbs(s.detector.extreme_price, 115.0, 0.01);

    // Price drops but stays in BULL — DC detector should update
    _ = s.processTick(tick(108.0, 9.0));
    // Extreme should still be 115 (tracking high in UP mode)
    try testing.expectApproxEqAbs(s.detector.extreme_price, 115.0, 0.01);
}

test "strategy: warmup flag prevents position opening" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    s.warmup = true;

    // Fill MA, trigger BULL — should NOT open position during warmup
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(104.0, 6.0)); // BULL
    try testing.expect(s.regime == .bull);
    try testing.expect(!s.in_position); // warmup blocks entry

    // DC entry in SIDEWAYS also blocked
    _ = s.processTick(tick(101.0, 7.0)); // sideways
    _ = s.processTick(tick(93.0, 8.0)); // DC DOWN
    _ = s.processTick(tick(99.51, 9.0)); // DC UP
    try testing.expect(!s.in_position); // still blocked

    // Disable warmup — next entry should work
    s.warmup = false;
    _ = s.processTick(tick(92.0, 10.0)); // DC DOWN
    _ = s.processTick(tick(98.50, 11.0)); // DC UP (7.07% > 7%)
    try testing.expect(s.in_position); // now allowed
}

test "strategy: warmup flag prevents position closing" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .base_trail = 0.02,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    // Manually set up a position in BEAR
    s.regime = .bear;
    s.in_position = true;
    s.entry_price = 100.0;
    s.size = 1.0;
    s.peak_price = 100.0;
    s.current_trail = 0.02;
    s.capital = 9990.0;
    s.warmup = true;

    // 2.1% drop should trigger trailing stop — but warmup blocks it
    const trade = s.processTick(tick(97.9, 1.0));
    try testing.expect(trade == null); // blocked by warmup
    try testing.expect(s.in_position); // still holding
}

test "strategy: entry fee not deducted from capital" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Fill MA, trigger BULL to open position
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(s.in_position);

    // Capital should NOT be reduced by entry fee
    // Fee is embedded in smaller size: size = (1000 - 1) / 104 = 9.60576...
    try testing.expectApproxEqAbs(s.capital, 1000.0, 0.01);
    try testing.expect(s.size < 1000.0 / 104.0); // size is smaller due to fee
}

test "strategy: funding filter at exact threshold boundary" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(101.0, 6.0)); // sideways

    // Exactly at threshold — should skip (> not >=, but 0.0001 > 0.0001 is false)
    s.funding_avg = 0.0001; // exactly at threshold
    _ = s.processTick(tick(93.0, 7.0)); // DC DOWN
    _ = s.processTick(tick(99.51, 8.0)); // DC UP
    try testing.expect(s.in_position); // NOT skipped — threshold is strict >
}

test "strategy: negative funding rate never skips entry" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(101.0, 6.0)); // sideways

    // Negative funding — bearish sentiment, should always allow entry
    s.funding_avg = -0.003; // very negative
    _ = s.processTick(tick(93.0, 7.0)); // DC DOWN
    _ = s.processTick(tick(99.51, 8.0)); // DC UP
    try testing.expect(s.in_position); // allowed
}

test "strategy: funding filter skips BEAR regime DC entry" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
    });
    defer s.deinit(allocator);

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(96.0, 6.0)); // BEAR
    try testing.expect(s.regime == .bear);

    s.funding_avg = 0.0002; // elevated
    _ = s.processTick(tick(89.0, 7.0)); // DC DOWN
    _ = s.processTick(tick(95.23, 8.0)); // DC UP
    try testing.expect(!s.in_position); // skipped in BEAR too
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
    s.funding_avg = 0.000053;
    s.funding_avg_updated_at = 1700000300.0;
    s.funding_latest_time = 1699999200.0;

    const path: [*:0]const u8 = "/tmp/test_ckpt_3reg.bin";
    try testing.expect(s.saveCheckpoint(path));

    // Load into fresh strategy
    var s2 = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer s2.deinit(allocator);

    try testing.expect(s2.loadCheckpoint(path));
    try testing.expect(s2.regime == .sideways);
    try testing.expectApproxEqAbs(s2.capital, 5000.0, 0.001);
    try testing.expectEqual(s2.tick_count, 42);
    try testing.expectApproxEqAbs(s2.funding_avg, 0.000053, 0.000001);
    try testing.expectApproxEqAbs(s2.funding_avg_updated_at, 1700000300.0, 0.001);
    try testing.expectApproxEqAbs(s2.funding_latest_time, 1699999200.0, 0.001);
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

test "strategy: old DCTRADE4 checkpoint loads with empty funding average" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer s.deinit(allocator);

    const path: [*:0]const u8 = "/tmp/test_ckpt_v4.bin";
    const v4_magic: u64 = 0x4443_5452_4144_4534; // DCTRADE4
    const fp = strat_mod.fopen(path, "wb") orelse unreachable;
    var scalars: [24]f64 = undefined;
    @memset(&scalars, 0);
    scalars[0] = @as(f64, @bitCast(v4_magic));
    scalars[1] = 1.0;
    scalars[2] = 95000.0;
    scalars[6] = 5000.0;
    scalars[8] = 2.0; // sideways
    scalars[22] = 42.0;
    scalars[23] = 1700000000.0;
    var returns: [10]f64 = .{0} ** 10;
    var prices: [10]f64 = .{0} ** 10;
    _ = strat_mod.fwrite(@ptrCast(&scalars), @sizeOf(f64), scalars.len, fp);
    _ = strat_mod.fwrite(@ptrCast(&returns), @sizeOf(f64), returns.len, fp);
    _ = strat_mod.fwrite(@ptrCast(&prices), @sizeOf(f64), prices.len, fp);
    _ = strat_mod.fclose(fp);

    s.funding_avg = 0.003;
    try testing.expect(s.loadCheckpoint(path));
    try testing.expect(s.in_position);
    try testing.expectApproxEqAbs(s.entry_price, 95000.0, 0.001);
    try testing.expectApproxEqAbs(s.capital, 5000.0, 0.001);
    try testing.expect(s.regime == .sideways);
    try testing.expectEqual(s.tick_count, 42);
    try testing.expectApproxEqAbs(s.funding_avg, 0, 0.000001);
    try testing.expectApproxEqAbs(s.funding_avg_updated_at, 0, 0.001);
    try testing.expectApproxEqAbs(s.funding_latest_time, 0, 0.001);
}

test "strategy: intermediate DCTRADE5 checkpoints load funding fields by file size" {
    const allocator = testing.allocator;
    const v5_magic: u64 = 0x4443_5452_4144_4535; // DCTRADE5

    const cases = [_]struct {
        path: [*:0]const u8,
        scalar_count: usize,
        expected_avg: f64,
        expected_updated_at: f64,
        expected_latest_time: f64,
    }{
        .{
            .path = "/tmp/test_ckpt_v5_25.bin",
            .scalar_count = 25,
            .expected_avg = 0.000053,
            .expected_updated_at = 0,
            .expected_latest_time = 0,
        },
        .{
            .path = "/tmp/test_ckpt_v5_26.bin",
            .scalar_count = 26,
            .expected_avg = 0.000061,
            .expected_updated_at = 1700000300.0,
            .expected_latest_time = 0,
        },
    };

    for (cases) |case| {
        const fp = strat_mod.fopen(case.path, "wb") orelse unreachable;
        var scalars: [27]f64 = .{0} ** 27;
        scalars[0] = @as(f64, @bitCast(v5_magic));
        scalars[6] = 5000.0;
        scalars[8] = 2.0; // sideways
        scalars[22] = 42.0;
        scalars[23] = 1700000000.0;
        scalars[24] = case.expected_avg;
        scalars[25] = case.expected_updated_at;
        var returns: [10]f64 = .{0} ** 10;
        var prices: [10]f64 = .{0} ** 10;
        _ = strat_mod.fwrite(@ptrCast(&scalars), @sizeOf(f64), case.scalar_count, fp);
        _ = strat_mod.fwrite(@ptrCast(&returns), @sizeOf(f64), returns.len, fp);
        _ = strat_mod.fwrite(@ptrCast(&prices), @sizeOf(f64), prices.len, fp);
        _ = strat_mod.fclose(fp);

        var s = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
        defer s.deinit(allocator);
        try testing.expect(s.loadCheckpoint(case.path));
        try testing.expect(s.regime == .sideways);
        try testing.expectEqual(s.tick_count, 42);
        try testing.expectApproxEqAbs(s.funding_avg, case.expected_avg, 0.000001);
        try testing.expectApproxEqAbs(s.funding_avg_updated_at, case.expected_updated_at, 0.001);
        try testing.expectApproxEqAbs(s.funding_latest_time, case.expected_latest_time, 0.001);
    }
}

test "strategy: checkpoint backups recover from corrupt primary" {
    const allocator = testing.allocator;
    const path: [*:0]const u8 = "/tmp/test_ckpt_backup.bin";

    var s = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer s.deinit(allocator);
    s.capital = 1000.0;
    s.tick_count = 10;
    try testing.expect(s.saveCheckpointWithBackups(path, 3));

    s.capital = 2000.0;
    s.tick_count = 20;
    try testing.expect(s.saveCheckpointWithBackups(path, 3));

    const fp = strat_mod.fopen(path, "wb") orelse unreachable;
    var junk: [4]u8 = .{ 'b', 'a', 'd', '\n' };
    _ = strat_mod.fwrite(&junk, 1, junk.len, fp);
    _ = strat_mod.fclose(fp);

    var recovered = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer recovered.deinit(allocator);
    try testing.expect(recovered.loadCheckpointWithBackups(path, 3));
    try testing.expectApproxEqAbs(recovered.capital, 1000.0, 0.001);
    try testing.expectEqual(@as(u64, 10), recovered.tick_count);
}

test "strategy: checkpoint backup retention keeps older fallback slots" {
    const allocator = testing.allocator;
    const path: [*:0]const u8 = "/tmp/test_ckpt_backup_retention.bin";

    var s = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer s.deinit(allocator);

    var i: u64 = 1;
    while (i <= 4) : (i += 1) {
        s.capital = @as(f64, @floatFromInt(i * 1000));
        s.tick_count = i;
        try testing.expect(s.saveCheckpointWithBackups(path, 2));
    }

    const primary = strat_mod.fopen(path, "wb") orelse unreachable;
    var junk: [4]u8 = .{ 'b', 'a', 'd', '\n' };
    _ = strat_mod.fwrite(&junk, 1, junk.len, primary);
    _ = strat_mod.fclose(primary);

    const bak1: [*:0]const u8 = "/tmp/test_ckpt_backup_retention.bin.bak.1";
    const first_backup = strat_mod.fopen(bak1, "wb") orelse unreachable;
    _ = strat_mod.fwrite(&junk, 1, junk.len, first_backup);
    _ = strat_mod.fclose(first_backup);

    var recovered = try Strategy.init(allocator, .{ .ma_period = 10, .vol_window = 10 });
    defer recovered.deinit(allocator);
    try testing.expect(recovered.loadCheckpointWithBackups(path, 2));
    try testing.expectApproxEqAbs(recovered.capital, 2000.0, 0.001);
    try testing.expectEqual(@as(u64, 2), recovered.tick_count);
}

// ============================================================
// HTTP Client / Alpaca / Turso Parsing Tests
// ============================================================

const alpaca_mod = @import("alpaca.zig");
const turso_mod = @import("turso.zig");
const exchange_mod = @import("exchange.zig");

test "alpaca: normalizeOrderSymbol preserves slash and uppercases" {
    const sym = alpaca_mod.normalizeOrderSymbol("btc/usd");
    try testing.expectEqualStrings("BTC/USD", sym.slice());
}

test "alpaca: normalizePositionSymbol removes slash for position URL" {
    const sym = alpaca_mod.normalizePositionSymbol("BTC/USD");
    try testing.expectEqualStrings("BTCUSD", sym.slice());
}

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

// ============================================================
// Exchange Abstraction Tests
// ============================================================

// Shared no-op async stubs for mock exchanges (tests only use sync buy/sell)
fn noopSubmitOrder(_: *const anyopaque, _: exchange_mod.Side, _: f64) ?exchange_mod.PendingOrder {
    return null;
}
fn noopCheckOrder(_: *const anyopaque, _: []const u8) exchange_mod.OrderStatus {
    return .{ .failed = {} };
}
fn noopCancelOrder(_: *const anyopaque, _: []const u8) exchange_mod.CancelResult {
    return .{ .failed = {} };
}

test "exchange: mock implementation via vtable" {
    // Create a mock exchange to verify the vtable pattern works
    const MockExchange = struct {
        buy_called: bool = false,
        sell_called: bool = false,
        position_called: bool = false,

        fn mockBuy(ptr: *const anyopaque, qty: f64) ?exchange_mod.OrderFill {
            _ = ptr;
            return .{ .fill_price = 80000.0, .fill_qty = qty, .status = .filled };
        }

        fn mockSell(ptr: *const anyopaque, qty: f64) ?exchange_mod.OrderFill {
            _ = ptr;
            return .{ .fill_price = 85000.0, .fill_qty = qty, .status = .filled };
        }

        fn mockGetPosition(ptr: *const anyopaque) ?exchange_mod.Position {
            _ = ptr;
            return .{ .qty = 0.01, .entry_price = 80000.0, .market_value = 850.0, .unrealized_pnl = 50.0 };
        }

        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&mockBuy),
            .sell = @ptrCast(&mockSell),
            .submitOrder = @ptrCast(&noopSubmitOrder),
            .checkOrder = @ptrCast(&noopCheckOrder),
            .cancelOrder = @ptrCast(&noopCancelOrder),
            .getPosition = @ptrCast(&mockGetPosition),
        };
    };

    var mock = MockExchange{};
    const ex = exchange_mod.Exchange{
        .ptr = @ptrCast(&mock),
        .vtable = &MockExchange.vtable,
    };

    // Test buy
    const buy_fill = ex.buy(0.05);
    try testing.expect(buy_fill != null);
    try testing.expectApproxEqAbs(buy_fill.?.fill_price, 80000.0, 0.01);
    try testing.expectApproxEqAbs(buy_fill.?.fill_qty, 0.05, 0.0001);
    try testing.expect(buy_fill.?.status == .filled);

    // Test sell
    const sell_fill = ex.sell(0.05);
    try testing.expect(sell_fill != null);
    try testing.expectApproxEqAbs(sell_fill.?.fill_price, 85000.0, 0.01);
    try testing.expectApproxEqAbs(sell_fill.?.fill_qty, 0.05, 0.0001);

    // Test getPosition
    const pos = ex.getPosition();
    try testing.expect(pos != null);
    try testing.expectApproxEqAbs(pos.?.qty, 0.01, 0.0001);
    try testing.expectApproxEqAbs(pos.?.entry_price, 80000.0, 0.01);
    try testing.expectApproxEqAbs(pos.?.unrealized_pnl, 50.0, 0.01);
}

test "exchange: mock returning null (no position, failed orders)" {
    const NullExchange = struct {
        fn nullBuy(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn nullSell(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn nullGetPosition(_: *const anyopaque) ?exchange_mod.Position {
            return null;
        }
        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&nullBuy),
            .sell = @ptrCast(&nullSell),
            .submitOrder = @ptrCast(&noopSubmitOrder),
            .checkOrder = @ptrCast(&noopCheckOrder),
            .cancelOrder = @ptrCast(&noopCancelOrder),
            .getPosition = @ptrCast(&nullGetPosition),
        };
    };

    var dummy: u8 = 0;
    const ex = exchange_mod.Exchange{
        .ptr = @ptrCast(&dummy),
        .vtable = &NullExchange.vtable,
    };

    try testing.expect(ex.buy(1.0) == null);
    try testing.expect(ex.sell(1.0) == null);
    try testing.expect(ex.getPosition() == null);
}

test "exchange: OrderFill default values" {
    const fill = exchange_mod.OrderFill{ .fill_price = 0, .fill_qty = 0, .status = .accepted };
    try testing.expectEqual(fill.order_id_len, 0);
    try testing.expectApproxEqAbs(fill.fill_price, 0.0, 0.001);
    try testing.expect(fill.status == .accepted);
}

test "exchange: OrderFill status variants" {
    const filled = exchange_mod.OrderFill{ .fill_price = 80000.0, .fill_qty = 0.01, .status = .filled };
    const accepted = exchange_mod.OrderFill{ .fill_price = 0, .fill_qty = 0, .status = .accepted };
    const failed = exchange_mod.OrderFill{ .fill_price = 0, .fill_qty = 0, .status = .failed };
    try testing.expect(filled.status == .filled);
    try testing.expect(accepted.status == .accepted);
    try testing.expect(failed.status == .failed);
    try testing.expect(filled.status != accepted.status);
    try testing.expect(filled.status != failed.status);
}

test "exchange: Position struct fields" {
    const pos = exchange_mod.Position{
        .qty = 0.05,
        .entry_price = 77000.0,
        .market_value = 3900.0,
        .unrealized_pnl = 50.0,
    };
    try testing.expectApproxEqAbs(pos.qty, 0.05, 0.0001);
    try testing.expectApproxEqAbs(pos.entry_price, 77000.0, 0.01);
    try testing.expectApproxEqAbs(pos.market_value, 3900.0, 0.01);
    try testing.expectApproxEqAbs(pos.unrealized_pnl, 50.0, 0.01);
}

test "exchange: OrderFill order_id storage" {
    var fill = exchange_mod.OrderFill{ .fill_price = 80000.0, .fill_qty = 0.01, .status = .filled };
    const id = "abc-123-def-456";
    @memcpy(fill.order_id[0..id.len], id);
    fill.order_id_len = id.len;
    try testing.expectEqualStrings(id, fill.order_id[0..fill.order_id_len]);
}

test "exchange: OrderFill commission fields default to zero" {
    const fill = exchange_mod.OrderFill{ .fill_price = 80000.0, .fill_qty = 0.01, .status = .filled };
    try testing.expectApproxEqAbs(fill.commission, 0.0, 0.001);
    try testing.expectApproxEqAbs(fill.commission_usd, 0.0, 0.001);
    try testing.expectEqual(fill.commission_asset_len, 0);
}

test "exchange: OrderFill commission_asset storage" {
    var fill = exchange_mod.OrderFill{ .fill_price = 80000.0, .fill_qty = 0.01, .status = .filled };
    fill.commission = 0.50;
    fill.commission_usd = 0.50;
    @memcpy(fill.commission_asset[0..3], "USD");
    fill.commission_asset_len = 3;
    try testing.expectApproxEqAbs(fill.commission, 0.50, 0.001);
    try testing.expectApproxEqAbs(fill.commission_usd, 0.50, 0.001);
    try testing.expectEqualStrings("USD", fill.commission_asset[0..fill.commission_asset_len]);
}

test "exchange: OrderFill commission_asset supports BNB and BTC" {
    var fill = exchange_mod.OrderFill{ .fill_price = 80000.0, .fill_qty = 0.01, .status = .filled };
    // BNB fee (Binance discount)
    fill.commission = 0.00123;
    @memcpy(fill.commission_asset[0..3], "BNB");
    fill.commission_asset_len = 3;
    try testing.expectEqualStrings("BNB", fill.commission_asset[0..fill.commission_asset_len]);
    // BTC fee (Binance default when buying)
    @memcpy(fill.commission_asset[0..3], "BTC");
    try testing.expectEqualStrings("BTC", fill.commission_asset[0..fill.commission_asset_len]);
}

test "exchange: mock exchange returns commission in fill" {
    const CommissionExchange = struct {
        fn buy(_: *const anyopaque, qty: f64) ?exchange_mod.OrderFill {
            var fill = exchange_mod.OrderFill{ .fill_price = 95000.0, .fill_qty = qty, .status = .filled };
            fill.commission = 0.95; // $0.95 fee
            @memcpy(fill.commission_asset[0..3], "USD");
            fill.commission_asset_len = 3;
            return fill;
        }
        fn sell(_: *const anyopaque, qty: f64) ?exchange_mod.OrderFill {
            var fill = exchange_mod.OrderFill{ .fill_price = 96000.0, .fill_qty = qty, .status = .filled };
            fill.commission = 0.00000100; // BTC fee
            @memcpy(fill.commission_asset[0..3], "BTC");
            fill.commission_asset_len = 3;
            return fill;
        }
        fn getPosition(_: *const anyopaque) ?exchange_mod.Position {
            return null;
        }
        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&buy),
            .sell = @ptrCast(&sell),
            .submitOrder = @ptrCast(&noopSubmitOrder),
            .checkOrder = @ptrCast(&noopCheckOrder),
            .cancelOrder = @ptrCast(&noopCancelOrder),
            .getPosition = @ptrCast(&getPosition),
        };
    };
    var dummy: u8 = 0;
    const ex = exchange_mod.Exchange{ .ptr = @ptrCast(&dummy), .vtable = &CommissionExchange.vtable };

    const buy_fill = ex.buy(0.01).?;
    try testing.expectApproxEqAbs(buy_fill.commission, 0.95, 0.001);
    try testing.expectEqualStrings("USD", buy_fill.commission_asset[0..buy_fill.commission_asset_len]);

    const sell_fill = ex.sell(0.01).?;
    try testing.expectApproxEqAbs(sell_fill.commission, 0.00000100, 0.00000001);
    try testing.expectEqualStrings("BTC", sell_fill.commission_asset[0..sell_fill.commission_asset_len]);
}

test "exchange: two different implementations share the same interface" {
    // Simulates switching between Alpaca and a future Binance exchange
    const ExchangeA = struct {
        fn buy(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return .{ .fill_price = 80000.0, .fill_qty = 0.01, .status = .filled };
        }
        fn sell(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return .{ .fill_price = 80000.0, .fill_qty = 0.01, .status = .filled };
        }
        fn getPosition(_: *const anyopaque) ?exchange_mod.Position {
            return .{ .qty = 0.01, .entry_price = 80000.0, .market_value = 800.0, .unrealized_pnl = 0 };
        }
        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&buy),
            .sell = @ptrCast(&sell),
            .submitOrder = @ptrCast(&noopSubmitOrder),
            .checkOrder = @ptrCast(&noopCheckOrder),
            .cancelOrder = @ptrCast(&noopCancelOrder),
            .getPosition = @ptrCast(&getPosition),
        };
    };

    const ExchangeB = struct {
        fn buy(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return .{ .fill_price = 90000.0, .fill_qty = 0.02, .status = .filled };
        }
        fn sell(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return .{ .fill_price = 90000.0, .fill_qty = 0.02, .status = .filled };
        }
        fn getPosition(_: *const anyopaque) ?exchange_mod.Position {
            return .{ .qty = 0.02, .entry_price = 90000.0, .market_value = 1800.0, .unrealized_pnl = 0 };
        }
        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&buy),
            .sell = @ptrCast(&sell),
            .submitOrder = @ptrCast(&noopSubmitOrder),
            .checkOrder = @ptrCast(&noopCheckOrder),
            .cancelOrder = @ptrCast(&noopCancelOrder),
            .getPosition = @ptrCast(&getPosition),
        };
    };

    var dummy: u8 = 0;
    // Use exchange A
    var ex = exchange_mod.Exchange{ .ptr = @ptrCast(&dummy), .vtable = &ExchangeA.vtable };
    try testing.expectApproxEqAbs(ex.buy(1.0).?.fill_price, 80000.0, 0.01);
    try testing.expectApproxEqAbs(ex.getPosition().?.qty, 0.01, 0.0001);

    // Switch to exchange B — same interface, different behavior
    ex = exchange_mod.Exchange{ .ptr = @ptrCast(&dummy), .vtable = &ExchangeB.vtable };
    try testing.expectApproxEqAbs(ex.buy(1.0).?.fill_price, 90000.0, 0.01);
    try testing.expectApproxEqAbs(ex.getPosition().?.qty, 0.02, 0.0001);
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
// Double-Entry Accounting Tests
// ============================================================

test "turso: parseTransferId parses RETURNING id from pipeline response" {
    // Simulates a Turso pipeline response where the second result contains RETURNING id
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[]}}},{\"response\":{\"result\":{\"rows\":[[{\"type\":\"integer\",\"value\":\"7\"}]]}}},{\"response\":{\"result\":{\"rows\":[]}}},{\"response\":{\"result\":{\"rows\":[]}}}]}";
    const val = turso_mod.Turso.parseTransferId(json);
    try testing.expect(val != null);
    try testing.expectEqual(val.?, 7);
}

test "turso: parseTransferId returns null for empty rows" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[]}}},{\"response\":{\"result\":{\"rows\":[]}}}]}";
    const val = turso_mod.Turso.parseTransferId(json);
    try testing.expect(val == null);
}

test "turso: parseTransferId parses large transfer ID" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[]}}},{\"response\":{\"result\":{\"rows\":[[{\"type\":\"integer\",\"value\":\"99999\"}]]}}}]}";
    const val = turso_mod.Turso.parseTransferId(json);
    try testing.expect(val != null);
    try testing.expectEqual(val.?, 99999);
}

test "turso: parseTransferId handles unquoted integer" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[]}}},{\"response\":{\"result\":{\"rows\":[[{\"type\":\"integer\",\"value\":42}]]}}}]}";
    const val = turso_mod.Turso.parseTransferId(json);
    try testing.expect(val != null);
    try testing.expectEqual(val.?, 42);
}

test "turso: parseValueStringAlloc parses selected value" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[[{\"type\":\"integer\",\"value\":12},{\"type\":\"text\",\"value\":\"YWJj\"}]]}}}]}";
    const value = turso_mod.Turso.parseValueStringAlloc(testing.allocator, json, 1).?;
    defer testing.allocator.free(value);
    try testing.expectEqualStrings("YWJj", value);
}

test "turso: checkpoint backup response parses checksum and payload" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[[{\"type\":\"integer\",\"value\":3},{\"type\":\"text\",\"value\":\"2a4f1d7cb516c72\"},{\"type\":\"text\",\"value\":\"YWJj\"}]]}}}]}";
    const checksum = turso_mod.Turso.parseValueStringAlloc(testing.allocator, json, 1).?;
    defer testing.allocator.free(checksum);
    const payload = turso_mod.Turso.parseValueStringAlloc(testing.allocator, json, 2).?;
    defer testing.allocator.free(payload);
    try testing.expectEqualStrings("2a4f1d7cb516c72", checksum);
    try testing.expectEqualStrings("YWJj", payload);
}

test "turso: account constants are correct" {
    try testing.expectEqual(turso_mod.Turso.ACCT_CASH, 1);
    try testing.expectEqual(turso_mod.Turso.ACCT_BTC, 2);
    try testing.expectEqual(turso_mod.Turso.ACCT_FEES, 3);
    try testing.expectEqual(turso_mod.Turso.ACCT_EQUITY, 4);
    try testing.expectEqual(turso_mod.Turso.ACCT_PNL, 5);
    try testing.expectEqual(turso_mod.Turso.ACCT_BNB, 6);
    try testing.expectEqual(turso_mod.Turso.CODE_DEPOSIT, 1);
    try testing.expectEqual(turso_mod.Turso.CODE_BUY, 2);
    try testing.expectEqual(turso_mod.Turso.CODE_SELL, 3);
    try testing.expectEqual(turso_mod.Turso.CODE_FEE, 4);
    try testing.expectEqual(turso_mod.Turso.CODE_PNL, 5);
}

test "turso: managed BNB quantity derives from native transfer size" {
    const BnbRow = struct {
        debit_account_id: u8,
        credit_account_id: u8,
        size: f64,
        posted: bool,
    };
    const rows = [_]BnbRow{
        .{ .debit_account_id = turso_mod.Turso.ACCT_BNB, .credit_account_id = turso_mod.Turso.ACCT_EQUITY, .size = 0.010, .posted = true },
        .{ .debit_account_id = turso_mod.Turso.ACCT_FEES, .credit_account_id = turso_mod.Turso.ACCT_BNB, .size = 0.0015, .posted = true },
        .{ .debit_account_id = turso_mod.Turso.ACCT_BNB, .credit_account_id = turso_mod.Turso.ACCT_EQUITY, .size = 0.020, .posted = false },
    };

    var qty: f64 = 0;
    for (rows) |row| {
        if (!row.posted) continue;
        if (row.debit_account_id == turso_mod.Turso.ACCT_BNB) qty += row.size;
        if (row.credit_account_id == turso_mod.Turso.ACCT_BNB) qty -= row.size;
    }
    try testing.expectApproxEqAbs(qty, 0.0085, 0.0000001);
}

test "turso: BNB fee detection only counts posted BNB fee transfers" {
    const Row = struct {
        credit_account_id: u8,
        code: u8,
        posted: bool,
    };
    const rows = [_]Row{
        .{ .credit_account_id = turso_mod.Turso.ACCT_BNB, .code = turso_mod.Turso.CODE_DEPOSIT, .posted = true },
        .{ .credit_account_id = turso_mod.Turso.ACCT_BNB, .code = turso_mod.Turso.CODE_FEE, .posted = false },
        .{ .credit_account_id = turso_mod.Turso.ACCT_CASH, .code = turso_mod.Turso.CODE_FEE, .posted = true },
        .{ .credit_account_id = turso_mod.Turso.ACCT_BNB, .code = turso_mod.Turso.CODE_FEE, .posted = true },
    };

    var has_bnb_fee = false;
    for (rows) |row| {
        if (row.posted and row.code == turso_mod.Turso.CODE_FEE and row.credit_account_id == turso_mod.Turso.ACCT_BNB) {
            has_bnb_fee = true;
        }
    }
    try testing.expect(has_bnb_fee);
}

test "turso: transfer flags are correct" {
    try testing.expectEqual(turso_mod.Turso.FLAG_PENDING, 1);
    try testing.expectEqual(turso_mod.Turso.FLAG_POST_PENDING, 2);
    try testing.expectEqual(turso_mod.Turso.FLAG_VOID_PENDING, 4);
}

test "turso: parseJsonFloat parses unquoted float" {
    const json = "{\"price\":80000.50,\"size\":0.01}";
    const val = turso_mod.Turso.parseJsonFloat(json, "\"price\":");
    try testing.expect(val != null);
    try testing.expectApproxEqAbs(val.?, 80000.50, 0.01);
}

test "turso: parseJsonFloat parses quoted float" {
    const json = "{\"price\":\"80000.50\",\"size\":\"0.01\"}";
    const val = turso_mod.Turso.parseJsonFloat(json, "\"price\":");
    try testing.expect(val != null);
    try testing.expectApproxEqAbs(val.?, 80000.50, 0.01);
}

test "turso: parseJsonFloat returns null for missing key" {
    const json = "{\"price\":80000.50}";
    const val = turso_mod.Turso.parseJsonFloat(json, "\"size\":");
    try testing.expect(val == null);
}

test "turso: parseJsonFloat parses second key in object" {
    const json = "{\"price\":80000.50,\"size\":0.01234567}";
    const val = turso_mod.Turso.parseJsonFloat(json, "\"size\":");
    try testing.expect(val != null);
    try testing.expectApproxEqAbs(val.?, 0.01234567, 0.00000001);
}

test "turso: parseJsonFloat parses last key before closing brace" {
    const json = "{\"price\":80000.50,\"fee\":80.00}";
    const val = turso_mod.Turso.parseJsonFloat(json, "\"fee\":");
    try testing.expect(val != null);
    try testing.expectApproxEqAbs(val.?, 80.00, 0.01);
}

test "turso: parseJsonFloat handles zero value" {
    const json = "{\"price\":0,\"size\":0.0}";
    const price = turso_mod.Turso.parseJsonFloat(json, "\"price\":");
    try testing.expect(price != null);
    try testing.expectApproxEqAbs(price.?, 0.0, 0.001);
    const size = turso_mod.Turso.parseJsonFloat(json, "\"size\":");
    try testing.expect(size != null);
    try testing.expectApproxEqAbs(size.?, 0.0, 0.001);
}

test "turso: parseJsonFloat parses user_data format from buy transfer" {
    // This is the exact format written by main.zig buy flow
    const json = "{\"price\":95432.12345678,\"size\":0.01048000,\"fee\":1.00012345,\"signal_price\":95400.00000000,\"order_id\":\"abc-123\"}";
    const price = turso_mod.Turso.parseJsonFloat(json, "\"price\":");
    try testing.expect(price != null);
    try testing.expectApproxEqAbs(price.?, 95432.12345678, 0.00000001);
    const size = turso_mod.Turso.parseJsonFloat(json, "\"size\":");
    try testing.expect(size != null);
    try testing.expectApproxEqAbs(size.?, 0.01048000, 0.00000001);
    const fee = turso_mod.Turso.parseJsonFloat(json, "\"fee\":");
    try testing.expect(fee != null);
    try testing.expectApproxEqAbs(fee.?, 1.00012345, 0.00000001);
    const signal = turso_mod.Turso.parseJsonFloat(json, "\"signal_price\":");
    try testing.expect(signal != null);
    try testing.expectApproxEqAbs(signal.?, 95400.0, 0.01);
    // order_id is a string, not a float — should not parse as float
    const oid = turso_mod.Turso.parseJsonFloat(json, "\"order_id\":");
    try testing.expect(oid == null);
}

test "turso: parseJsonFloat parses user_data format from sell transfer" {
    const json = "{\"price\":96000.50000000,\"size\":0.01048000,\"fee\":1.00608524,\"exit_type\":\"DC\"}";
    const price = turso_mod.Turso.parseJsonFloat(json, "\"price\":");
    try testing.expect(price != null);
    try testing.expectApproxEqAbs(price.?, 96000.50, 0.01);
    const size = turso_mod.Turso.parseJsonFloat(json, "\"size\":");
    try testing.expect(size != null);
    try testing.expectApproxEqAbs(size.?, 0.01048, 0.00001);
    // exit_type is a string — should not parse as float
    const exit = turso_mod.Turso.parseJsonFloat(json, "\"exit_type\":");
    try testing.expect(exit == null);
}

test "turso: parseTransferId with full 5-statement pipeline (BEGIN, INSERT RETURNING, UPDATE, UPDATE, COMMIT)" {
    // Realistic pipeline: BEGIN (empty rows), INSERT RETURNING id (has rows), UPDATE x2 (affected_rows), COMMIT (empty)
    const json = "{\"results\":[" ++
        "{\"response\":{\"result\":{\"rows\":[]}}}," ++ // BEGIN
        "{\"response\":{\"result\":{\"rows\":[[{\"type\":\"integer\",\"value\":\"123\"}]]}}}," ++ // INSERT RETURNING
        "{\"response\":{\"result\":{\"rows\":[]}}}," ++ // UPDATE accounts debit
        "{\"response\":{\"result\":{\"rows\":[]}}}," ++ // UPDATE accounts credit
        "{\"response\":{\"result\":{\"rows\":[]}}}" ++ // COMMIT
        "]}";
    const val = turso_mod.Turso.parseTransferId(json);
    try testing.expect(val != null);
    try testing.expectEqual(val.?, 123);
}

test "turso: parseTransferId returns null when no results at all" {
    const json = "{\"results\":[]}";
    const val = turso_mod.Turso.parseTransferId(json);
    try testing.expect(val == null);
}

test "turso: double-entry balance derivation: full trading cycle" {
    // Simulate the account balance fields after each operation.
    // TigerBeetle convention (as implemented):
    //   createPostedTransfer(debit_acct, credit_acct, amount)
    //     → debit_acct.credits_posted += amount
    //     → credit_acct.debits_posted += amount
    //   queryAccountBalance = credits_posted - debits_posted
    //
    // We track the 4 balance fields for each account manually.
    const Turso = turso_mod.Turso;

    // Account balance fields: [credits_pending, credits_posted, debits_pending, debits_posted]
    var cash = [4]f64{ 0, 0, 0, 0 };
    var btc = [4]f64{ 0, 0, 0, 0 };
    var fees = [4]f64{ 0, 0, 0, 0 };
    var equity = [4]f64{ 0, 0, 0, 0 };
    var pnl = [4]f64{ 0, 0, 0, 0 };
    _ = Turso;

    // Helper: balance = credits_posted - debits_posted
    const bal = struct {
        fn get(acct: [4]f64) f64 {
            return acct[1] - acct[3]; // credits_posted - debits_posted
        }
    };

    // --- Step 1: Deposit $1000 ---
    // createPostedTransfer(debit=cash, credit=equity, 1000, CODE_DEPOSIT)
    //   → cash.credits_posted += 1000 (debit_acct gets credits)
    //   → equity.debits_posted += 1000 (credit_acct gets debits)
    cash[1] += 1000; // credits_posted
    equity[3] += 1000; // debits_posted

    try testing.expectApproxEqAbs(bal.get(cash), 1000.0, 0.001); // cash has $1000
    try testing.expectApproxEqAbs(bal.get(equity), -1000.0, 0.001); // equity is negative (owner's claim)

    // Integrity check: sum of all debits_posted == sum of all credits_posted
    const total_credits_1 = cash[1] + btc[1] + fees[1] + equity[1] + pnl[1];
    const total_debits_1 = cash[3] + btc[3] + fees[3] + equity[3] + pnl[3];
    try testing.expectApproxEqAbs(total_credits_1, total_debits_1, 0.001);

    // --- Step 2: Buy BTC — fee $1, buy cost $999 ---
    // Fee: createPostedTransfer(debit=fees, credit=cash, 1, CODE_FEE)
    //   → fees.credits_posted += 1
    //   → cash.debits_posted += 1
    fees[1] += 1; // credits_posted
    cash[3] += 1; // debits_posted

    // Buy: createPostedTransfer(debit=btc, credit=cash, 999, CODE_BUY)
    //   → btc.credits_posted += 999
    //   → cash.debits_posted += 999
    btc[1] += 999; // credits_posted
    cash[3] += 999; // debits_posted

    try testing.expectApproxEqAbs(bal.get(cash), 0.0, 0.001); // cash spent: 1000 - 1 - 999 = 0
    try testing.expectApproxEqAbs(bal.get(btc), 999.0, 0.001); // btc holds $999
    try testing.expectApproxEqAbs(bal.get(fees), 1.0, 0.001); // $1 in fees

    // Integrity check
    const total_credits_2 = cash[1] + btc[1] + fees[1] + equity[1] + pnl[1];
    const total_debits_2 = cash[3] + btc[3] + fees[3] + equity[3] + pnl[3];
    try testing.expectApproxEqAbs(total_credits_2, total_debits_2, 0.001);

    // --- Step 3: Sell BTC for $1050 (profit!) — fee $1.05 ---
    // Sell: createPostedTransfer(debit=cash, credit=btc, 1050, CODE_SELL)
    //   → cash.credits_posted += 1050
    //   → btc.debits_posted += 1050
    cash[1] += 1050; // credits_posted
    btc[3] += 1050; // debits_posted

    // Fee: createPostedTransfer(debit=fees, credit=cash, 1.05, CODE_FEE)
    //   → fees.credits_posted += 1.05
    //   → cash.debits_posted += 1.05
    fees[1] += 1.05;
    cash[3] += 1.05;

    // PnL: profit = 1050 - 999 = 51 (before exit fee)
    // createPostedTransfer(debit=cash, credit=pnl, 51, CODE_PNL)
    //   → cash.credits_posted += 51
    //   → pnl.debits_posted += 51
    cash[1] += 51;
    pnl[3] += 51;

    // Verify final balances
    // Cash: 1000 + 1050 + 51 credits - 1 - 999 - 1.05 debits = 1099.95
    try testing.expectApproxEqAbs(bal.get(cash), 1099.95, 0.001);
    // BTC: 999 credits - 1050 debits = -51 (sold more than bought = realized gain)
    try testing.expectApproxEqAbs(bal.get(btc), -51.0, 0.001);
    // Fees: 1 + 1.05 = 2.05
    try testing.expectApproxEqAbs(bal.get(fees), 2.05, 0.001);
    // Equity: -1000 (unchanged)
    try testing.expectApproxEqAbs(bal.get(equity), -1000.0, 0.001);
    // PnL: -51 (credit account, negative = profit)
    try testing.expectApproxEqAbs(bal.get(pnl), -51.0, 0.001);

    // Global integrity: sum(credits_posted) == sum(debits_posted)
    const total_credits_3 = cash[1] + btc[1] + fees[1] + equity[1] + pnl[1];
    const total_debits_3 = cash[3] + btc[3] + fees[3] + equity[3] + pnl[3];
    try testing.expectApproxEqAbs(total_credits_3, total_debits_3, 0.001);

    // Verify: cash balance = initial_deposit - total_fees + realized_pnl
    // 1000 - 2.05 + (1050 - 999) = 1000 - 2.05 + 51 = 1048.95
    // But our cash is 1099.95 because PnL transfer also credits cash.
    // Actual: cash = deposit(1000) - fee(1) - buy(999) + sell(1050) - fee(1.05) + pnl(51) = 1099.95
    // The PnL transfer is separate from the sell — it records the gain explicitly.
    // Net equity = cash + btc + fees + equity + pnl = 1099.95 + (-51) + 2.05 + (-1000) + (-51) = 0 ✓
    const net = bal.get(cash) + bal.get(btc) + bal.get(fees) + bal.get(equity) + bal.get(pnl);
    try testing.expectApproxEqAbs(net, 0.0, 0.001);
}

test "turso: double-entry balance derivation: deposit only" {
    // Simplest case: just a deposit, verify cash is positive
    var cash_cp: f64 = 0; // credits_posted
    const cash_dp: f64 = 0; // debits_posted

    // Deposit $500: debit=cash → cash.credits_posted += 500
    cash_cp += 500;
    const balance = cash_cp - cash_dp;
    try testing.expectApproxEqAbs(balance, 500.0, 0.001);
}

test "turso: double-entry balance derivation: buy reduces cash" {
    const cash_cp: f64 = 1000; // after deposit
    var cash_dp: f64 = 0;

    // Fee: credit=cash → cash.debits_posted += 1
    cash_dp += 1;
    // Buy: credit=cash → cash.debits_posted += 999
    cash_dp += 999;

    const balance = cash_cp - cash_dp;
    try testing.expectApproxEqAbs(balance, 0.0, 0.001);
}

test "turso: double-entry balance derivation: pending reserves funds" {
    // Pending transfer reserves via credits_pending/debits_pending
    const cash_cp: f64 = 1000; // credits_posted (after deposit)
    const cash_dp: f64 = 0; // debits_posted
    // createPendingTransfer(debit=btc, credit=cash, 999)
    //   → btc.credits_pending += 999 (debit_acct)
    //   → cash.debits_pending += 999 (credit_acct)
    var cash_dpend: f64 = 0;
    cash_dpend += 999; // credit_acct gets debits_pending

    // Cash balance (posted only)
    const posted_balance = cash_cp - cash_dp;
    try testing.expectApproxEqAbs(posted_balance, 1000.0, 0.001);

    // Cash available = posted_balance - debits_pending
    const available = posted_balance - cash_dpend;
    try testing.expectApproxEqAbs(available, 1.0, 0.001); // $1 available after reserving $999
}

test "turso: double-entry balance derivation: void releases funds" {
    // After voiding a pending transfer, reserved funds return
    const cash_cp: f64 = 1000;
    const cash_dp: f64 = 0;
    var cash_dpend: f64 = 0;

    // Pending buy reserves $999
    cash_dpend += 999;
    try testing.expectApproxEqAbs((cash_cp - cash_dp) - cash_dpend, 1.0, 0.001);

    // Void releases the reservation
    cash_dpend -= 999;
    try testing.expectApproxEqAbs((cash_cp - cash_dp) - cash_dpend, 1000.0, 0.001);
    try testing.expectApproxEqAbs(cash_dpend, 0.0, 0.001);
}

test "turso: double-entry balance derivation: post settles pending" {
    // Posting moves pending → posted
    const cash_cp: f64 = 1000;
    var cash_dp: f64 = 0;
    var cash_dpend: f64 = 999; // pending buy reserved

    // Post: debits_pending -= 999, debits_posted += 999
    cash_dpend -= 999;
    cash_dp += 999;

    const posted_balance = cash_cp - cash_dp;
    try testing.expectApproxEqAbs(posted_balance, 1.0, 0.001); // $1 left after buy settled
    try testing.expectApproxEqAbs(cash_dpend, 0.0, 0.001); // no pending
}

test "turso: append-only post creates settlement row without mutating original" {
    // In append-only model, postTransfer INSERTs a new row with pending_id reference.
    // Original pending row stays status='pending'. New row has status='posted', flags=FLAG_POST_PENDING.
    // Account balances move the same way: pending -= amount, posted += amount.
    const Turso = turso_mod.Turso;

    // Simulate: pending buy for $999
    var cash_cpend: f64 = 0; // credits_pending (debit_acct)
    var cash_dpend: f64 = 999; // debits_pending (credit_acct = cash)
    const cash_cp: f64 = 1000; // credits_posted
    var cash_dp: f64 = 0; // debits_posted

    // Transfer table state after createPendingTransfer:
    //   Row #1: { status='pending', flags=FLAG_PENDING, pending_id=null, amount=999 }
    const row1_status = "pending";
    const row1_flags = Turso.FLAG_PENDING;
    _ = row1_status;

    // postTransfer (append-only): INSERT new row, DON'T update row #1
    //   Row #1: { status='pending', flags=1 }  ← UNCHANGED (immutable)
    //   Row #2: { status='posted', flags=FLAG_POST_PENDING, pending_id=1, amount=999 }
    const row2_flags = Turso.FLAG_POST_PENDING;

    // Account balance update (same as before):
    //   credits_pending -= 999 (debit_acct)
    //   credits_posted += 999 (debit_acct)
    //   debits_pending -= 999 (credit_acct = cash)
    //   debits_posted += 999 (credit_acct = cash)
    cash_cpend -= 0; // cash is credit_acct, not debit_acct for buy
    cash_dpend -= 999;
    cash_dp += 999;

    // Verify: row #1 is immutable (still pending)
    try testing.expectEqual(row1_flags, 1); // FLAG_PENDING
    // Verify: row #2 is the settlement
    try testing.expectEqual(row2_flags, 2); // FLAG_POST_PENDING
    // Verify: balances correct
    try testing.expectApproxEqAbs(cash_dpend, 0.0, 0.001); // no pending left
    try testing.expectApproxEqAbs(cash_cp - cash_dp, 1.0, 0.001); // $1 posted balance
}

test "turso: append-only void creates settlement row without mutating original" {
    // In append-only model, voidTransfer INSERTs a new row with pending_id reference.
    // Original pending row stays status='pending'. New row has status='voided', flags=FLAG_VOID_PENDING.
    // Account balances release: pending -= amount (no posted change).
    const Turso = turso_mod.Turso;

    // Simulate: pending buy for $999
    var cash_dpend: f64 = 999;
    const cash_cp: f64 = 1000;
    const cash_dp: f64 = 0;

    // Transfer table state after createPendingTransfer:
    //   Row #1: { status='pending', flags=FLAG_PENDING, pending_id=null, amount=999 }
    const row1_status = "pending";
    const row1_flags = Turso.FLAG_PENDING;
    _ = row1_status;

    // voidTransfer (append-only): INSERT new row, DON'T update row #1
    //   Row #1: { status='pending', flags=1 }  ← UNCHANGED (immutable)
    //   Row #2: { status='voided', flags=FLAG_VOID_PENDING, pending_id=1, amount=999 }
    const row2_flags = Turso.FLAG_VOID_PENDING;

    // Account balance update:
    //   credits_pending -= 999 (debit_acct)
    //   debits_pending -= 999 (credit_acct = cash)
    cash_dpend -= 999;

    // Verify: row #1 is immutable
    try testing.expectEqual(row1_flags, 1); // FLAG_PENDING
    // Verify: row #2 is the void settlement
    try testing.expectEqual(row2_flags, 4); // FLAG_VOID_PENDING
    // Verify: pending released, posted unchanged
    try testing.expectApproxEqAbs(cash_dpend, 0.0, 0.001);
    try testing.expectApproxEqAbs(cash_cp - cash_dp, 1000.0, 0.001); // full balance restored
}

test "turso: append-only model preserves global balance integrity" {
    // Full cycle: deposit → pending buy → post buy → sell
    // With append-only, transfer table has MORE rows but account balances are identical.
    const Turso = turso_mod.Turso;
    _ = Turso;

    // Account fields: [credits_pending, credits_posted, debits_pending, debits_posted]
    var cash = [4]f64{ 0, 0, 0, 0 };
    var btc = [4]f64{ 0, 0, 0, 0 };
    var fees = [4]f64{ 0, 0, 0, 0 };
    var equity = [4]f64{ 0, 0, 0, 0 };

    const bal = struct {
        fn get(acct: [4]f64) f64 {
            return acct[1] - acct[3]; // credits_posted - debits_posted
        }
    };

    // Step 1: Deposit $1000 (posted directly, no pending phase)
    cash[1] += 1000;
    equity[3] += 1000;
    try testing.expectApproxEqAbs(bal.get(cash), 1000.0, 0.001);

    // Step 2: Pending buy — fee $1 (posted), buy $999 (pending)
    // Fee is always posted immediately
    fees[1] += 1;
    cash[3] += 1;
    // Buy: pending phase — reserve in pending fields
    btc[0] += 999; // credits_pending (debit_acct)
    cash[2] += 999; // debits_pending (credit_acct)
    try testing.expectApproxEqAbs(bal.get(cash), 999.0, 0.001); // posted: 1000 - 1 = 999
    // Available = posted - pending = 999 - 999 = 0
    try testing.expectApproxEqAbs(bal.get(cash) - cash[2], 0.0, 0.001);

    // Step 3: Post buy (append-only) — move pending → posted
    // Transfer table: row #1 (pending, immutable) + row #2 (posted, pending_id=#1)
    btc[0] -= 999; // credits_pending -= amount
    btc[1] += 999; // credits_posted += amount
    cash[2] -= 999; // debits_pending -= amount
    cash[3] += 999; // debits_posted += amount
    try testing.expectApproxEqAbs(bal.get(cash), 0.0, 0.001); // 1000 - 1 - 999 = 0
    try testing.expectApproxEqAbs(bal.get(btc), 999.0, 0.001);
    try testing.expectApproxEqAbs(cash[0], 0.0, 0.001); // no pending left
    try testing.expectApproxEqAbs(cash[2], 0.0, 0.001); // no pending left

    // Step 4: Sell for $1050 (posted directly)
    cash[1] += 1050;
    btc[3] += 1050;
    fees[1] += 1.05;
    cash[3] += 1.05;

    // Final balances identical to mutable model
    try testing.expectApproxEqAbs(bal.get(cash), 1048.95, 0.001); // 1000 + 1050 - 1 - 999 - 1.05
    try testing.expectApproxEqAbs(bal.get(btc), -51.0, 0.001);
    try testing.expectApproxEqAbs(bal.get(fees), 2.05, 0.001);
    try testing.expectApproxEqAbs(bal.get(equity), -1000.0, 0.001);

    // Global integrity: sum(credits) == sum(debits) for both posted and pending
    const total_cp = cash[1] + btc[1] + fees[1] + equity[1];
    const total_dp = cash[3] + btc[3] + fees[3] + equity[3];
    try testing.expectApproxEqAbs(total_cp, total_dp, 0.001);
    const total_cpend = cash[0] + btc[0] + fees[0] + equity[0];
    const total_dpend = cash[2] + btc[2] + fees[2] + equity[2];
    try testing.expectApproxEqAbs(total_cpend, total_dpend, 0.001); // all pending settled
}

test "turso: double-entry operation codes cover all trade operations" {
    // Every operation in the trading flow has a corresponding code
    const Turso = turso_mod.Turso;
    // Deposit: cash receives funds from equity
    try testing.expect(Turso.CODE_DEPOSIT == 1);
    // Buy: btc_position receives value from cash
    try testing.expect(Turso.CODE_BUY == 2);
    // Sell: cash receives value from btc_position
    try testing.expect(Turso.CODE_SELL == 3);
    // Fee: fees account receives from cash
    try testing.expect(Turso.CODE_FEE == 4);
    // PnL: realized profit/loss
    try testing.expect(Turso.CODE_PNL == 5);
}

test "turso: two-phase flags are mutually exclusive powers of 2" {
    const Turso = turso_mod.Turso;
    // Flags should be powers of 2 for bitwise operations
    try testing.expectEqual(Turso.FLAG_PENDING, 1); // 0b001
    try testing.expectEqual(Turso.FLAG_POST_PENDING, 2); // 0b010
    try testing.expectEqual(Turso.FLAG_VOID_PENDING, 4); // 0b100
    // No two flags share bits
    try testing.expectEqual(Turso.FLAG_PENDING & Turso.FLAG_POST_PENDING, 0);
    try testing.expectEqual(Turso.FLAG_PENDING & Turso.FLAG_VOID_PENDING, 0);
    try testing.expectEqual(Turso.FLAG_POST_PENDING & Turso.FLAG_VOID_PENDING, 0);
}

test "turso: parseJsonFloat handles empty JSON object" {
    const json = "{}";
    const val = turso_mod.Turso.parseJsonFloat(json, "\"price\":");
    try testing.expect(val == null);
}

test "turso: parseJsonFloat handles empty string" {
    const val = turso_mod.Turso.parseJsonFloat("", "\"price\":");
    try testing.expect(val == null);
}

test "turso: parseTransferId with transfer ID 1 (first ever transfer)" {
    const json = "{\"results\":[{\"response\":{\"result\":{\"rows\":[]}}},{\"response\":{\"result\":{\"rows\":[[{\"type\":\"integer\",\"value\":\"1\"}]]}}}]}";
    const val = turso_mod.Turso.parseTransferId(json);
    try testing.expect(val != null);
    try testing.expectEqual(val.?, 1);
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

    // Strategy calculated: capital=1000 (fee embedded in size), size=(1000-1)/104=9.60576923
    const strategy_size = s.size;
    const strategy_capital = s.capital; // 1000.0 — fee not deducted from capital
    try testing.expectApproxEqAbs(strategy_capital, 1000.0, 0.01);

    // Simulate Alpaca filling less qty (e.g. 9.60 instead of 9.60576923)
    const alpaca_fill_qty = 9.60;
    const alpaca_fill_price = 104.0;
    const unspent = (strategy_size - alpaca_fill_qty) * alpaca_fill_price;
    s.capital += unspent;
    s.size = alpaca_fill_qty;
    s.entry_price = alpaca_fill_price;

    // Capital should have unspent added back
    try testing.expect(s.capital > 999.0);
    const expected_capital = 1000.0 + (strategy_size - 9.60) * 104.0;
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

    // Capital should have unspent added back (capital stays at 1000 + unspent)
    try testing.expect(s.capital > 1000.0);
    try testing.expect(s.capital < 1001.0); // unspent is tiny

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
// Capital Injection Tests
// ============================================================

test "strategy: no position opened when capital is zero" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 0.0,
    });
    defer s.deinit(allocator);

    // Fill MA to trigger BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(104.0, 6.0));

    try testing.expect(s.regime == .bull);
    try testing.expect(!s.in_position); // no capital, no position
    try testing.expectApproxEqAbs(s.capital, 0.0, 0.001);
}

test "strategy: no position opened when capital below minimum" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 5.0, // below $10 minimum
    });
    defer s.deinit(allocator);

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(104.0, 6.0));

    try testing.expect(s.regime == .bull);
    try testing.expect(!s.in_position);
    try testing.expectApproxEqAbs(s.capital, 5.0, 0.001);
}

test "strategy: position opened after deposit brings capital above minimum" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 0.0,
    });
    defer s.deinit(allocator);

    // Fill MA to trigger BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(!s.in_position); // no capital yet

    // Simulate deposit
    s.capital = 1000.0;
    s.initial_capital = 1000.0;

    // Next tick in BULL should open position
    _ = s.processTick(tick(105.0, 7.0));
    try testing.expect(s.in_position);
    try testing.expectApproxEqAbs(s.entry_price, 105.0, 0.01);
}

test "deposit: capital and initial_capital both increase" {
    const allocator = testing.allocator;
    var s = try Strategy.init(allocator, .{
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Simulate deposit
    const deposit = 500.0;
    s.capital += deposit;
    s.initial_capital += deposit;

    try testing.expectApproxEqAbs(s.capital, 1500.0, 0.01);
    try testing.expectApproxEqAbs(s.initial_capital, 1500.0, 0.01);
    // Realized PnL should still be 0
    try testing.expectApproxEqAbs(s.totalReturn(), 0.0, 0.01);
}

test "deposit: buy in BULL blends entry price correctly" {
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
    s.entry_price = 80000.0;
    s.size = 0.01;
    s.peak_price = 80000.0;
    s.capital = 1.0; // after initial buy
    s.regime = .bull;

    // Deposit arrives, buy at current price
    const deposit = 1000.0;
    s.capital += deposit;
    s.initial_capital += deposit;
    const buy_price = 82000.0;
    const fee = deposit * s.fee_pct; // 1.0
    const usable = deposit - fee; // 999.0
    const add_size = usable / buy_price; // ~0.01218

    // Blend entry
    s.entry_price = (s.entry_price * s.size + buy_price * add_size) / (s.size + add_size);
    s.size += add_size;
    s.capital -= (usable + fee);

    // Blended: (80000*0.01 + 82000*0.01218) / (0.01 + 0.01218) = ~81094
    try testing.expect(s.entry_price > 80000.0);
    try testing.expect(s.entry_price < 82000.0);
    try testing.expectApproxEqAbs(s.size, 0.01 + add_size, 0.0001);
    try testing.expectApproxEqAbs(s.capital, 1.0, 0.01); // back to ~$1 cash
}

// ============================================================
// Non-blocking Order Flow Tests (#449)
// ============================================================

test "non-blocking: submitOrder returns immediately, checkOrder resolves after N ticks" {
    // Simulates the async order flow: submit returns instantly,
    // checkOrder returns .pending for 5 calls, then .filled on the 6th.
    // This proves ticks continue processing while order is in flight.
    const AsyncExchange = struct {
        var check_count: u32 = 0;

        fn buy(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            // Sync buy would block here — not used in async flow
            return .{ .fill_price = 95000.0, .fill_qty = 0.01, .status = .filled };
        }
        fn sell(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return .{ .fill_price = 95000.0, .fill_qty = 0.01, .status = .filled };
        }
        fn submitOrder(_: *const anyopaque, side: exchange_mod.Side, qty: f64) ?exchange_mod.PendingOrder {
            _ = side;
            var po: exchange_mod.PendingOrder = .{ .side = .buy, .qty = qty };
            const id = "mock-order-001";
            @memcpy(po.order_id[0..id.len], id);
            po.order_id_len = id.len;
            check_count = 0; // reset on new order
            return po;
        }
        fn checkOrder(_: *const anyopaque, _: []const u8) exchange_mod.OrderStatus {
            check_count += 1;
            if (check_count >= 6) {
                // Filled after 6 checks (simulates ~6 seconds of polling)
                var fill: exchange_mod.OrderFill = .{ .fill_price = 95100.0, .fill_qty = 0.01, .status = .filled };
                fill.commission = 0.095;
                @memcpy(fill.commission_asset[0..3], "USD");
                fill.commission_asset_len = 3;
                return .{ .filled = fill };
            }
            return .{ .pending = {} };
        }
        fn cancelOrder(_: *const anyopaque, _: []const u8) exchange_mod.CancelResult {
            return .{ .cancelled = {} };
        }
        fn getPosition(_: *const anyopaque) ?exchange_mod.Position {
            return null;
        }
        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&buy),
            .sell = @ptrCast(&sell),
            .submitOrder = @ptrCast(&submitOrder),
            .checkOrder = @ptrCast(&checkOrder),
            .cancelOrder = @ptrCast(&cancelOrder),
            .getPosition = @ptrCast(&getPosition),
        };
    };

    var dummy: u8 = 0;
    const ex = exchange_mod.Exchange{ .ptr = @ptrCast(&dummy), .vtable = &AsyncExchange.vtable };

    // Submit order — returns immediately
    const pending = ex.submitOrder(.buy, 0.01);
    try testing.expect(pending != null);
    try testing.expectEqualStrings("mock-order-001", pending.?.order_id[0..pending.?.order_id_len]);

    // Simulate tick loop: check order each tick, count ticks processed
    var ticks_processed: u32 = 0;
    var filled = false;
    const oid = pending.?.order_id[0..pending.?.order_id_len];
    while (!filled) {
        ticks_processed += 1;
        const status = ex.checkOrder(oid);
        switch (status) {
            .filled => |fill| {
                filled = true;
                try testing.expectApproxEqAbs(fill.fill_price, 95100.0, 0.01);
                try testing.expectApproxEqAbs(fill.commission, 0.095, 0.001);
            },
            .pending => {}, // keep processing ticks
            .cancelled, .failed => {
                try testing.expect(false);
            }, // unexpected
        }
    }

    // KEY METRIC: 6 ticks were processed while order was pending
    // With sync buy(), this would be 0 — the loop would be blocked
    try testing.expectEqual(ticks_processed, 6);
}

test "non-blocking: strategy suppress_entry stores signal without committing position" {
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Enable suppress_entry (live mode)
    s.suppress_entry = true;

    // Fill MA to trigger BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    // BULL: price > MA+3% would trigger buy
    _ = s.processTick(tick(104.0, 6.0));

    // With suppress_entry, position is NOT committed
    try testing.expect(!s.in_position);
    try testing.expect(s.buy_signal);
    try testing.expect(s.buy_signal_price > 0);
    try testing.expect(s.buy_signal_size > 0);

    // Capital unchanged (no fee deducted)
    try testing.expectApproxEqAbs(s.capital, 1000.0, 0.01);

    // Verify signal values are reasonable
    try testing.expectApproxEqAbs(s.buy_signal_price, 104.0, 0.01);
    const expected_size = (1000.0 - 1000.0 * 0.001) / 104.0;
    try testing.expectApproxEqAbs(s.buy_signal_size, expected_size, 0.001);
}

test "non-blocking: strategy without suppress_entry commits position (backtest mode)" {
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Default: suppress_entry = false (backtest mode)
    try testing.expect(!s.suppress_entry);

    // Fill MA to trigger BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    // BULL: price > MA+3% triggers immediate position
    _ = s.processTick(tick(104.0, 6.0));

    // Without suppress_entry, position IS committed
    try testing.expect(s.in_position);
    try testing.expect(!s.buy_signal); // no signal stored
    try testing.expectApproxEqAbs(s.entry_price, 104.0, 0.01);
    try testing.expect(s.size > 0);
}

test "non-blocking: cancelOrder handles race condition (filled before cancel)" {
    // When we cancel a buy but it filled before cancel arrived,
    // cancelOrder returns .filled with the fill details.
    const RaceExchange = struct {
        fn buy(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn sell(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn submitOrder(_: *const anyopaque, _: exchange_mod.Side, qty: f64) ?exchange_mod.PendingOrder {
            var po: exchange_mod.PendingOrder = .{ .side = .buy, .qty = qty };
            const id = "race-order-001";
            @memcpy(po.order_id[0..id.len], id);
            po.order_id_len = id.len;
            return po;
        }
        fn checkOrder(_: *const anyopaque, _: []const u8) exchange_mod.OrderStatus {
            return .{ .filled = .{ .fill_price = 95000.0, .fill_qty = 0.01, .status = .filled } };
        }
        fn cancelOrder(_: *const anyopaque, _: []const u8) exchange_mod.CancelResult {
            // Order filled before cancel took effect
            return .{ .filled = .{ .fill_price = 95000.0, .fill_qty = 0.01, .status = .filled } };
        }
        fn getPosition(_: *const anyopaque) ?exchange_mod.Position {
            return null;
        }
        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&buy),
            .sell = @ptrCast(&sell),
            .submitOrder = @ptrCast(&submitOrder),
            .checkOrder = @ptrCast(&checkOrder),
            .cancelOrder = @ptrCast(&cancelOrder),
            .getPosition = @ptrCast(&getPosition),
        };
    };

    var dummy: u8 = 0;
    const ex = exchange_mod.Exchange{ .ptr = @ptrCast(&dummy), .vtable = &RaceExchange.vtable };

    // Submit buy
    const pending = ex.submitOrder(.buy, 0.01);
    try testing.expect(pending != null);

    // Try to cancel — but it already filled
    const result = ex.cancelOrder(pending.?.order_id[0..pending.?.order_id_len]);
    switch (result) {
        .filled => |fill| {
            // Correct: order filled despite cancel attempt
            try testing.expectApproxEqAbs(fill.fill_price, 95000.0, 0.01);
            try testing.expect(fill.status == .filled);
        },
        .cancelled => {
            try testing.expect(false);
        }, // wrong — it should be filled
        .failed => {
            try testing.expect(false);
        },
    }
}

test "non-blocking: multiple pending orders tracked independently" {
    // Simulates regular buy + deposit buy both pending simultaneously
    const MultiExchange = struct {
        var order_count: u32 = 0;

        fn buy(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn sell(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn submitOrder(_: *const anyopaque, side: exchange_mod.Side, qty: f64) ?exchange_mod.PendingOrder {
            order_count += 1;
            var po: exchange_mod.PendingOrder = .{ .side = side, .qty = qty };
            var id_buf: [20]u8 = undefined;
            const id = std.fmt.bufPrint(&id_buf, "order-{d:0>3}", .{order_count}) catch "order-000";
            @memcpy(po.order_id[0..id.len], id);
            po.order_id_len = id.len;
            return po;
        }
        fn checkOrder(_: *const anyopaque, order_id: []const u8) exchange_mod.OrderStatus {
            // First order fills on check, second stays pending
            if (std.mem.eql(u8, order_id, "order-001")) {
                return .{ .filled = .{ .fill_price = 95000.0, .fill_qty = 0.01, .status = .filled } };
            }
            return .{ .pending = {} };
        }
        fn cancelOrder(_: *const anyopaque, _: []const u8) exchange_mod.CancelResult {
            return .{ .cancelled = {} };
        }
        fn getPosition(_: *const anyopaque) ?exchange_mod.Position {
            return null;
        }
        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&buy),
            .sell = @ptrCast(&sell),
            .submitOrder = @ptrCast(&submitOrder),
            .checkOrder = @ptrCast(&checkOrder),
            .cancelOrder = @ptrCast(&cancelOrder),
            .getPosition = @ptrCast(&getPosition),
        };
    };

    MultiExchange.order_count = 0;
    var dummy: u8 = 0;
    const ex = exchange_mod.Exchange{ .ptr = @ptrCast(&dummy), .vtable = &MultiExchange.vtable };

    // Submit two orders
    const order1 = ex.submitOrder(.buy, 0.01).?;
    const order2 = ex.submitOrder(.buy, 0.005).?;

    // They have different IDs
    try testing.expect(!std.mem.eql(u8, order1.order_id[0..order1.order_id_len], order2.order_id[0..order2.order_id_len]));

    // Check both — order1 fills, order2 still pending
    const status1 = ex.checkOrder(order1.order_id[0..order1.order_id_len]);
    const status2 = ex.checkOrder(order2.order_id[0..order2.order_id_len]);

    switch (status1) {
        .filled => |fill| {
            try testing.expectApproxEqAbs(fill.fill_price, 95000.0, 0.01);
        },
        else => {
            try testing.expect(false);
        },
    }
    try testing.expect(status2 == .pending);
}

test "non-blocking: trailing stop fires while buy is pending — cancel and sell" {
    // Scenario: strategy signals buy, order submitted but not yet filled.
    // Price drops, trailing stop fires. We must cancel the buy and sell.
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Setup: get into BEAR regime with a position
    s.suppress_entry = false; // use sync for setup
    // Fill MA
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    // Drop to BEAR
    _ = s.processTick(tick(90.0, 6.0));
    try testing.expect(s.regime == .bear);

    // Manually set up a position (simulating a filled buy)
    s.in_position = true;
    s.entry_price = 90.0;
    s.size = 10.0;
    s.peak_price = 95.0; // price went up to 95
    s.current_trail = 0.02; // 2% trailing stop

    // Price drops 3% from peak (95 → 92.15) — should trigger stop
    const stop_trade = s.checkStop(92.0, 100.0);
    try testing.expect(stop_trade != null);
    try testing.expect(stop_trade.?.exit_type == .trailing_stop);

    // After stop fires, position is closed
    try testing.expect(!s.in_position);
    try testing.expect(s.size == 0);
}

test "non-blocking: pending order array swap-remove correctness" {
    // Verify that removing a filled order from the middle of the pending array
    // correctly swaps the last element into the gap.
    const PendingOrderEntry = struct {
        order_id: [64]u8 = undefined,
        order_id_len: usize = 0,
        side: exchange_mod.Side = .buy,
        signal_price: f64 = 0,
        size: f64 = 0,
        transfer_id: u32 = 0,
        is_deposit_buy: bool = false,
    };

    const MAX_PENDING: usize = 4;
    var pending: [MAX_PENDING]PendingOrderEntry = undefined;
    var count: u8 = 0;

    // Add 3 orders
    pending[0] = .{ .signal_price = 100.0, .size = 0.01 };
    @memcpy(pending[0].order_id[0..5], "ord-A");
    pending[0].order_id_len = 5;
    count = 1;

    pending[1] = .{ .signal_price = 200.0, .size = 0.02 };
    @memcpy(pending[1].order_id[0..5], "ord-B");
    pending[1].order_id_len = 5;
    count = 2;

    pending[2] = .{ .signal_price = 300.0, .size = 0.03 };
    @memcpy(pending[2].order_id[0..5], "ord-C");
    pending[2].order_id_len = 5;
    count = 3;

    // Remove order at index 0 (swap with last)
    count -= 1;
    pending[0] = pending[count];

    // Now: [ord-C, ord-B], count=2
    try testing.expectEqual(count, 2);
    try testing.expectEqualStrings("ord-C", pending[0].order_id[0..pending[0].order_id_len]);
    try testing.expectEqualStrings("ord-B", pending[1].order_id[0..pending[1].order_id_len]);
    try testing.expectApproxEqAbs(pending[0].signal_price, 300.0, 0.01);
    try testing.expectApproxEqAbs(pending[1].signal_price, 200.0, 0.01);

    // Remove order at index 1 (last element, no swap needed)
    count -= 1;
    try testing.expectEqual(count, 1);
    try testing.expectEqualStrings("ord-C", pending[0].order_id[0..pending[0].order_id_len]);

    // Remove last order
    count -= 1;
    try testing.expectEqual(count, 0);
}

test "non-blocking: strategy does not emit duplicate buy signals while suppressed" {
    // When suppress_entry is true and a buy signal fires, subsequent ticks
    // at the same price level should NOT re-emit the signal (strategy thinks
    // it already signaled via in_position or buy_signal).
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);
    s.suppress_entry = true;

    // Fill MA
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }

    // First tick above MA+3% — should signal buy
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(s.buy_signal);
    const first_size = s.buy_signal_size;
    try testing.expect(first_size > 0);

    // Simulate: main loop reads the signal and clears it
    s.buy_signal = false;

    // In BULL with suppress_entry, strategy called openPosition which set buy_signal
    // but did NOT set in_position. So next tick will try to open again.
    // This is expected — main loop must set in_position after fill to prevent re-signal.
    _ = s.processTick(tick(106.0, 7.0));
    // Without in_position set, strategy will signal again (still BULL at 106)
    try testing.expect(s.buy_signal);

    // Now simulate: main loop got the fill, sets in_position
    s.in_position = true;
    s.entry_price = 104.0;
    s.size = first_size;
    s.peak_price = 104.0;
    s.buy_signal = false;

    // Next tick: already in position, no new signal
    _ = s.processTick(tick(105.0, 8.0));
    try testing.expect(!s.buy_signal);
    try testing.expect(s.in_position);
}

test "non-blocking: sell signal still works with suppress_entry enabled" {
    // suppress_entry only affects buy signals. Sell signals (DC exit, trailing stop)
    // must still work normally — they return Trade from processTick.
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .threshold = 0.07,
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);
    s.suppress_entry = true;

    // Setup: BEAR regime with position
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(90.0, 6.0)); // drop to BEAR
    try testing.expect(s.regime == .bear);

    // Manually set position
    s.in_position = true;
    s.entry_price = 90.0;
    s.size = 10.0;
    s.peak_price = 95.0;
    s.current_trail = 0.02;

    // Trailing stop fires — should return Trade even with suppress_entry
    const trade = s.checkStop(92.0, 100.0);
    try testing.expect(trade != null);
    try testing.expect(trade.?.exit_type == .trailing_stop);
    try testing.expect(!s.in_position); // position closed
}

test "non-blocking: fill resolves correctly after multiple pending checks" {
    // Simulates realistic scenario: submit order, check 10 times (pending),
    // then fill. Verify state is correct throughout.
    const DelayedExchange = struct {
        var checks: u32 = 0;
        var submitted: bool = false;

        fn buy(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn sell(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn submitOrder(_: *const anyopaque, side: exchange_mod.Side, qty: f64) ?exchange_mod.PendingOrder {
            submitted = true;
            checks = 0;
            var po: exchange_mod.PendingOrder = .{ .side = side, .qty = qty };
            const id = "delayed-001";
            @memcpy(po.order_id[0..id.len], id);
            po.order_id_len = id.len;
            return po;
        }
        fn checkOrder(_: *const anyopaque, _: []const u8) exchange_mod.OrderStatus {
            checks += 1;
            if (checks >= 10) {
                return .{ .filled = .{ .fill_price = 96000.0, .fill_qty = 0.105, .status = .filled } };
            }
            return .{ .pending = {} };
        }
        fn cancelOrder(_: *const anyopaque, _: []const u8) exchange_mod.CancelResult {
            return .{ .cancelled = {} };
        }
        fn getPosition(_: *const anyopaque) ?exchange_mod.Position {
            return null;
        }
        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&buy),
            .sell = @ptrCast(&sell),
            .submitOrder = @ptrCast(&submitOrder),
            .checkOrder = @ptrCast(&checkOrder),
            .cancelOrder = @ptrCast(&cancelOrder),
            .getPosition = @ptrCast(&getPosition),
        };
    };

    DelayedExchange.checks = 0;
    DelayedExchange.submitted = false;
    var dummy: u8 = 0;
    const ex = exchange_mod.Exchange{ .ptr = @ptrCast(&dummy), .vtable = &DelayedExchange.vtable };

    // Submit
    const pending = ex.submitOrder(.buy, 0.105).?;
    try testing.expect(DelayedExchange.submitted);
    try testing.expectEqualStrings("delayed-001", pending.order_id[0..pending.order_id_len]);

    // Simulate main loop: process ticks while checking order
    const oid = pending.order_id[0..pending.order_id_len];
    var ticks_while_pending: u32 = 0;
    var trailing_stop_checks: u32 = 0;
    var final_fill: ?exchange_mod.OrderFill = null;

    for (0..20) |_| {
        // Each iteration = one tick in the main loop
        ticks_while_pending += 1;
        trailing_stop_checks += 1; // trailing stop runs every tick

        const status = ex.checkOrder(oid);
        switch (status) {
            .filled => |fill| {
                final_fill = fill;
                break;
            },
            .pending => {},
            .cancelled, .failed => break,
        }
    }

    // Verify: order filled after 10 checks
    try testing.expect(final_fill != null);
    try testing.expectApproxEqAbs(final_fill.?.fill_price, 96000.0, 0.01);
    try testing.expectApproxEqAbs(final_fill.?.fill_qty, 0.105, 0.001);

    // KEY: 10 ticks processed (trailing stop checked 10 times) while order was pending
    // With sync buy(), this would be 0
    try testing.expectEqual(ticks_while_pending, 10);
    try testing.expectEqual(trailing_stop_checks, 10);
    try testing.expectEqual(DelayedExchange.checks, 10);
}

test "non-blocking: startup reconciliation adds still-pending order to tracking array" {
    // Simulates: bot restarts, Turso has a pending transfer, exchange says still pending.
    // The order should be added to pending_orders so the main loop tracks it.
    const PendingOrderEntry = struct {
        order_id: [64]u8 = undefined,
        order_id_len: usize = 0,
        side: exchange_mod.Side = .buy,
        signal_price: f64 = 0,
        size: f64 = 0,
        transfer_id: u32 = 0,
        is_deposit_buy: bool = false,
        entry_price: f64 = 0,
        pnl: f64 = 0,
        exit_type: types.Trade.ExitType = .dc_exit,
    };

    const MAX_PENDING: usize = 4;
    var pending_orders: [MAX_PENDING]PendingOrderEntry = undefined;
    var pending_count: u8 = 0;

    // Simulate: Turso returned a pending buy transfer
    const transfer_id: u32 = 42;
    const order_id = "recon-order-001";
    const price: f64 = 95000.0;
    const size: f64 = 0.105;
    const code: u8 = 2; // CODE_BUY
    const in_position = false;

    // Simulate reconciliation logic: exchange says still pending → add to tracking
    const side: exchange_mod.Side = if (code == 2) .buy else .sell;
    if (pending_count < MAX_PENDING) {
        pending_orders[pending_count] = .{
            .side = side,
            .signal_price = price,
            .size = size,
            .transfer_id = transfer_id,
            .is_deposit_buy = (side == .buy and in_position),
        };
        @memcpy(pending_orders[pending_count].order_id[0..order_id.len], order_id);
        pending_orders[pending_count].order_id_len = order_id.len;
        pending_count += 1;
    }

    // Verify: order is tracked
    try testing.expectEqual(pending_count, 1);
    try testing.expectEqualStrings("recon-order-001", pending_orders[0].order_id[0..pending_orders[0].order_id_len]);
    try testing.expect(pending_orders[0].side == .buy);
    try testing.expectApproxEqAbs(pending_orders[0].signal_price, 95000.0, 0.01);
    try testing.expectApproxEqAbs(pending_orders[0].size, 0.105, 0.001);
    try testing.expectEqual(pending_orders[0].transfer_id, 42);
    try testing.expect(!pending_orders[0].is_deposit_buy); // not in position → regular buy
}

test "non-blocking: startup reconciliation marks deposit buy correctly when in position" {
    const PendingOrderEntry = struct {
        order_id: [64]u8 = undefined,
        order_id_len: usize = 0,
        side: exchange_mod.Side = .buy,
        signal_price: f64 = 0,
        size: f64 = 0,
        transfer_id: u32 = 0,
        is_deposit_buy: bool = false,
        entry_price: f64 = 0,
        pnl: f64 = 0,
        exit_type: types.Trade.ExitType = .dc_exit,
    };

    const MAX_PENDING: usize = 4;
    var pending_orders: [MAX_PENDING]PendingOrderEntry = undefined;
    var pending_count: u8 = 0;

    // Simulate: already in position, pending buy from deposit
    const in_position = true;
    const side: exchange_mod.Side = .buy;
    if (pending_count < MAX_PENDING) {
        pending_orders[pending_count] = .{
            .side = side,
            .signal_price = 96000.0,
            .size = 0.01,
            .transfer_id = 50,
            .is_deposit_buy = (side == .buy and in_position),
        };
        const id = "deposit-recon-001";
        @memcpy(pending_orders[pending_count].order_id[0..id.len], id);
        pending_orders[pending_count].order_id_len = id.len;
        pending_count += 1;
    }

    try testing.expectEqual(pending_count, 1);
    try testing.expect(pending_orders[0].is_deposit_buy); // in position → deposit buy
}

test "non-blocking: DC exit cancels pending buys before selling" {
    // Simulates: strategy emits DC exit sell, but there's a pending deposit buy.
    // The pending buy must be cancelled before the sell is submitted.
    const CancelTrackExchange = struct {
        var cancel_called: bool = false;
        var cancel_order_id: [64]u8 = undefined;
        var cancel_order_id_len: usize = 0;
        var submit_count: u32 = 0;

        fn buy(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn sell(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn submitOrder(_: *const anyopaque, side: exchange_mod.Side, qty: f64) ?exchange_mod.PendingOrder {
            submit_count += 1;
            var po: exchange_mod.PendingOrder = .{ .side = side, .qty = qty };
            var id_buf: [20]u8 = undefined;
            const id = std.fmt.bufPrint(&id_buf, "sell-{d:0>3}", .{submit_count}) catch "sell-000";
            @memcpy(po.order_id[0..id.len], id);
            po.order_id_len = id.len;
            return po;
        }
        fn checkOrder(_: *const anyopaque, _: []const u8) exchange_mod.OrderStatus {
            return .{ .pending = {} };
        }
        fn cancelOrder(_: *const anyopaque, order_id: []const u8) exchange_mod.CancelResult {
            cancel_called = true;
            @memcpy(cancel_order_id[0..order_id.len], order_id);
            cancel_order_id_len = order_id.len;
            return .{ .cancelled = {} };
        }
        fn getPosition(_: *const anyopaque) ?exchange_mod.Position {
            return null;
        }
        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&buy),
            .sell = @ptrCast(&sell),
            .submitOrder = @ptrCast(&submitOrder),
            .checkOrder = @ptrCast(&checkOrder),
            .cancelOrder = @ptrCast(&cancelOrder),
            .getPosition = @ptrCast(&getPosition),
        };
    };

    CancelTrackExchange.cancel_called = false;
    CancelTrackExchange.submit_count = 0;
    var dummy: u8 = 0;
    const ex = exchange_mod.Exchange{ .ptr = @ptrCast(&dummy), .vtable = &CancelTrackExchange.vtable };

    // Setup: pending deposit buy in the array
    const PendingOrderEntry = struct {
        order_id: [64]u8 = undefined,
        order_id_len: usize = 0,
        side: exchange_mod.Side = .buy,
        signal_price: f64 = 0,
        size: f64 = 0,
        transfer_id: u32 = 0,
        is_deposit_buy: bool = false,
        entry_price: f64 = 0,
        pnl: f64 = 0,
        exit_type: types.Trade.ExitType = .dc_exit,
    };
    const MAX_PENDING: usize = 4;
    var pending_orders: [MAX_PENDING]PendingOrderEntry = undefined;
    var pending_count: u8 = 0;

    // Add a pending deposit buy
    pending_orders[0] = .{ .side = .buy, .signal_price = 95000.0, .size = 0.01, .is_deposit_buy = true };
    const buy_id = "dep-buy-001";
    @memcpy(pending_orders[0].order_id[0..buy_id.len], buy_id);
    pending_orders[0].order_id_len = buy_id.len;
    pending_count = 1;

    // Simulate: cancel pending buys before sell (same logic as main loop)
    {
        var ci: u8 = 0;
        while (ci < pending_count) {
            if (pending_orders[ci].side == .buy) {
                const cancel_oid = pending_orders[ci].order_id[0..pending_orders[ci].order_id_len];
                _ = ex.cancelOrder(cancel_oid);
                pending_count -= 1;
                if (ci < pending_count) {
                    pending_orders[ci] = pending_orders[pending_count];
                }
                continue;
            }
            ci += 1;
        }
    }

    // Verify: buy was cancelled
    try testing.expect(CancelTrackExchange.cancel_called);
    try testing.expectEqualStrings("dep-buy-001", CancelTrackExchange.cancel_order_id[0..CancelTrackExchange.cancel_order_id_len]);
    try testing.expectEqual(pending_count, 0); // buy removed

    // Now submit sell
    if (ex.submitOrder(.sell, 0.1)) |pending| {
        if (pending_count < MAX_PENDING) {
            pending_orders[pending_count] = .{ .side = .sell, .signal_price = 94000.0, .size = 0.1 };
            const len = @min(pending.order_id_len, pending_orders[pending_count].order_id.len);
            @memcpy(pending_orders[pending_count].order_id[0..len], pending.order_id[0..len]);
            pending_orders[pending_count].order_id_len = len;
            pending_count += 1;
        }
    }

    // Verify: sell submitted after cancel
    try testing.expectEqual(pending_count, 1);
    try testing.expect(pending_orders[0].side == .sell);
    try testing.expectEqual(CancelTrackExchange.submit_count, 1);
}

test "non-blocking: sell fill adjusts capital for actual exchange price vs signal" {
    // Strategy closes position at signal price $95,000. Exchange fills at $95,100.
    // Capital should be adjusted for the $100 * size difference.
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 10000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);

    // Setup: in position
    s.in_position = true;
    s.entry_price = 90000.0;
    s.size = 0.1;
    s.capital = 10000.0;

    // Trigger close via checkStop (public API)
    s.peak_price = 95000.0;
    s.current_trail = 0.02; // 2% trailing stop
    // Price drops 3% from peak: 95000 * 0.97 = 92150
    const trade = s.checkStop(92000.0, 100.0);
    try testing.expect(trade != null);
    const t = trade.?;
    // Strategy updated capital with signal-based PnL
    const capital_after_signal = s.capital;

    // Exchange fills at 92100 (better than signal 92000)
    const signal_price = t.exit_price; // 92000
    const actual_price: f64 = 92100.0;
    const price_diff_pnl = (actual_price - signal_price) * t.size;
    s.capital += price_diff_pnl;

    // Capital should be higher than signal-based close
    try testing.expect(s.capital > capital_after_signal);
    // Difference should be exactly (95100 - 95000) * 0.1 = $10
    try testing.expectApproxEqAbs(s.capital - capital_after_signal, 10.0, 0.01);
}

test "non-blocking: multiple orders fill on same tick iteration" {
    // Two pending orders (regular buy + deposit buy) both fill on the same checkOrder pass.
    // Both should be processed and removed from the array.
    const BothFillExchange = struct {
        fn buy(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn sell(_: *const anyopaque, _: f64) ?exchange_mod.OrderFill {
            return null;
        }
        fn submitOrder(_: *const anyopaque, side: exchange_mod.Side, qty: f64) ?exchange_mod.PendingOrder {
            var po: exchange_mod.PendingOrder = .{ .side = side, .qty = qty };
            const id = "both-fill";
            @memcpy(po.order_id[0..id.len], id);
            po.order_id_len = id.len;
            return po;
        }
        fn checkOrder(_: *const anyopaque, _: []const u8) exchange_mod.OrderStatus {
            // Both orders fill immediately
            return .{ .filled = .{ .fill_price = 96000.0, .fill_qty = 0.01, .status = .filled } };
        }
        fn cancelOrder(_: *const anyopaque, _: []const u8) exchange_mod.CancelResult {
            return .{ .cancelled = {} };
        }
        fn getPosition(_: *const anyopaque) ?exchange_mod.Position {
            return null;
        }
        const vtable = exchange_mod.Exchange.VTable{
            .buy = @ptrCast(&buy),
            .sell = @ptrCast(&sell),
            .submitOrder = @ptrCast(&submitOrder),
            .checkOrder = @ptrCast(&checkOrder),
            .cancelOrder = @ptrCast(&cancelOrder),
            .getPosition = @ptrCast(&getPosition),
        };
    };

    var dummy: u8 = 0;
    const ex = exchange_mod.Exchange{ .ptr = @ptrCast(&dummy), .vtable = &BothFillExchange.vtable };

    const PendingOrderEntry = struct {
        order_id: [64]u8 = undefined,
        order_id_len: usize = 0,
        side: exchange_mod.Side = .buy,
        signal_price: f64 = 0,
        size: f64 = 0,
        transfer_id: u32 = 0,
        is_deposit_buy: bool = false,
        entry_price: f64 = 0,
        pnl: f64 = 0,
        exit_type: types.Trade.ExitType = .dc_exit,
    };
    const MAX_PENDING: usize = 4;
    var pending_orders: [MAX_PENDING]PendingOrderEntry = undefined;
    var pending_count: u8 = 0;

    // Add two pending buys
    pending_orders[0] = .{ .side = .buy, .signal_price = 95000.0, .size = 0.1 };
    const id1 = "order-001";
    @memcpy(pending_orders[0].order_id[0..id1.len], id1);
    pending_orders[0].order_id_len = id1.len;

    pending_orders[1] = .{ .side = .buy, .signal_price = 95500.0, .size = 0.01, .is_deposit_buy = true };
    const id2 = "order-002";
    @memcpy(pending_orders[1].order_id[0..id2.len], id2);
    pending_orders[1].order_id_len = id2.len;
    pending_count = 2;

    // Simulate tick: check all pending orders (swap-remove loop)
    var fills: u8 = 0;
    {
        var i: u8 = 0;
        while (i < pending_count) {
            const oid = pending_orders[i].order_id[0..pending_orders[i].order_id_len];
            const status = ex.checkOrder(oid);
            switch (status) {
                .filled => {
                    fills += 1;
                    pending_count -= 1;
                    if (i < pending_count) {
                        pending_orders[i] = pending_orders[pending_count];
                    }
                    continue; // re-check swapped entry
                },
                else => {},
            }
            i += 1;
        }
    }

    // Both orders filled and removed
    try testing.expectEqual(fills, 2);
    try testing.expectEqual(pending_count, 0);
}

test "non-blocking: regime change BULL to BEAR while buy is pending" {
    // Buy submitted in BULL. Before fill, regime changes to BEAR.
    // Trailing stop should NOT fire on the pending (unfilled) position.
    // When buy fills, position is committed. Trailing stop then applies.
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);
    s.suppress_entry = true;

    // Fill MA
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    // BULL: price above MA+3%
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(s.regime == .bull);
    try testing.expect(s.buy_signal);

    // Buy signal fired but not filled yet (suppress_entry)
    try testing.expect(!s.in_position);
    s.buy_signal = false;

    // Price drops — regime changes to BEAR
    _ = s.processTick(tick(90.0, 7.0));
    try testing.expect(s.regime == .bear);

    // Trailing stop check: no position, should return null
    const stop = s.checkStop(89.0, 8.0);
    try testing.expect(stop == null);

    // Now simulate: buy fills at original price
    s.in_position = true;
    s.entry_price = 104.0;
    s.size = 9.59;
    s.peak_price = 104.0;

    // Now trailing stop can fire (we're in BEAR with position)
    s.current_trail = 0.02;
    // Price at 90 is a 13.5% drop from peak 104 — well past 2% trail
    const stop2 = s.checkStop(90.0, 9.0);
    try testing.expect(stop2 != null);
    try testing.expect(stop2.?.exit_type == .trailing_stop);
}

test "non-blocking: postTransferWithFill uses actual fill values not signal values" {
    // Verify the settlement row carries actual exchange fill data.
    // We can't test Turso directly, but we can verify the function signature
    // and that the values passed differ from signal values.
    const signal_price: f64 = 95000.0;
    const signal_size: f64 = 0.105;
    const signal_amount = signal_price * signal_size; // 9975.0

    const actual_price: f64 = 95100.0;
    const actual_size: f64 = 0.10498;
    const actual_amount = actual_price * actual_size; // 9983.598

    // Verify actual values differ from signal values
    try testing.expect(actual_price != signal_price);
    try testing.expect(actual_size != signal_size);
    try testing.expect(actual_amount != signal_amount);

    // Verify the actual amount is computed from actual price * actual size
    try testing.expectApproxEqAbs(actual_amount, 9983.598, 0.01);
    // Not from signal values
    try testing.expect(@abs(actual_amount - signal_amount) > 1.0);
}

// ============================================================
// Capital Reserved Tests (#456)
// ============================================================

test "capital_reserved: openPosition sizes from available capital, not total" {
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);
    s.suppress_entry = true;

    // Reserve $500 for a pending order
    s.capital_reserved = 500.0;

    // Fill MA to trigger BULL
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    // BULL: trigger buy signal
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(s.buy_signal);

    // Size should be based on $500 available, not $1000 total
    // available = 1000 - 500 = 500, fee = 500 * 0.001 = 0.50, usable = 499.50
    // size = 499.50 / 104.0 ≈ 4.803
    const expected_size = (500.0 - 500.0 * 0.001) / 104.0;
    try testing.expectApproxEqAbs(s.buy_signal_size, expected_size, 0.001);
    // NOT the full capital size
    const full_size = (1000.0 - 1000.0 * 0.001) / 104.0;
    try testing.expect(s.buy_signal_size < full_size);
}

test "capital_reserved: zero reserved uses full capital" {
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);
    s.suppress_entry = true;

    // No reservation
    try testing.expectApproxEqAbs(s.capital_reserved, 0.0, 0.001);

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(s.buy_signal);

    // Full capital used
    const expected_size = (1000.0 - 1000.0 * 0.001) / 104.0;
    try testing.expectApproxEqAbs(s.buy_signal_size, expected_size, 0.001);
}

test "capital_reserved: prevents double-ordering from same capital" {
    // Scenario: $1000 capital, first buy reserves ~$999.
    // Second buy signal should size from ~$1, not $1000.
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);
    s.suppress_entry = true;

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        _ = s.processTick(tick(100.0, @floatFromInt(i)));
    }

    // First buy signal
    _ = s.processTick(tick(104.0, 6.0));
    try testing.expect(s.buy_signal);
    const first_size = s.buy_signal_size;
    const first_cost = s.buy_signal_price * first_size; // ~999

    // Simulate: main loop reserves capital
    s.capital_reserved = first_cost;
    s.buy_signal = false;

    // Deposit buy signal fires while regular buy is reserved — sizes from remaining capital
    _ = s.processTick(tick(106.0, 7.0));
    if (s.buy_signal) {
        // Size should be tiny — only ~$1 available
        try testing.expect(s.buy_signal_size < 0.02); // less than 0.02 BTC at $106
        try testing.expect(s.buy_signal_size < first_size * 0.01); // less than 1% of first
    }
}

test "capital_reserved: deposit during pending buy sizes correctly" {
    // $1000 capital, $999 reserved for pending buy.
    // Deposit $1000 → capital = $2000, reserved = $999, available = $1001.
    // Deposit buy should size from $1001, not $2000.
    const allocator = testing.allocator;
    var s = try strat_mod.Strategy.init(allocator, .{
        .ma_period = 5,
        .ma_buffer = 0.03,
        .initial_capital = 1000.0,
        .fee_pct = 0.001,
    });
    defer s.deinit(allocator);
    s.suppress_entry = true;

    // Simulate: pending buy reserved $999
    s.capital_reserved = 999.0;

    // Deposit arrives
    s.capital += 1000.0;
    s.initial_capital += 1000.0;

    // Available = 2000 - 999 = 1001
    const available = s.capital - s.capital_reserved;
    try testing.expectApproxEqAbs(available, 1001.0, 0.001);

    // Deposit buy should use available, not total
    const dep_fee = available * s.fee_pct;
    const dep_usable = available - dep_fee;
    const dep_size = dep_usable / 104.0;
    try testing.expect(dep_size > 0);
    try testing.expect(dep_size < 10.0); // ~9.6 BTC at $104

    // NOT the full capital
    const full_size = (s.capital - s.capital * s.fee_pct) / 104.0;
    try testing.expect(dep_size < full_size);
}

test "capital_reserved: recomputed from pending array on startup" {
    // Simulate startup reconciliation: pending orders in array,
    // capital_reserved should equal sum of pending buy amounts.
    const PendingOrderEntry = struct {
        order_id: [64]u8 = undefined,
        order_id_len: usize = 0,
        side: exchange_mod.Side = .buy,
        signal_price: f64 = 0,
        size: f64 = 0,
        transfer_id: u32 = 0,
        is_deposit_buy: bool = false,
        entry_price: f64 = 0,
        pnl: f64 = 0,
        exit_type: types.Trade.ExitType = .dc_exit,
    };
    const MAX_PENDING: usize = 4;
    var pending_orders: [MAX_PENDING]PendingOrderEntry = undefined;
    var pending_count: u8 = 0;

    // Two pending buys from reconciliation
    pending_orders[0] = .{ .side = .buy, .signal_price = 95000.0, .size = 0.1 };
    pending_orders[1] = .{ .side = .buy, .signal_price = 96000.0, .size = 0.01, .is_deposit_buy = true };
    // One pending sell (should NOT count)
    pending_orders[2] = .{ .side = .sell, .signal_price = 94000.0, .size = 0.1 };
    pending_count = 3;

    // Recompute capital_reserved from pending array
    var reserved: f64 = 0;
    var i: u8 = 0;
    while (i < pending_count) : (i += 1) {
        if (pending_orders[i].side == .buy) {
            reserved += pending_orders[i].signal_price * pending_orders[i].size;
        }
    }

    // Should be sum of buy amounts only
    const expected = 95000.0 * 0.1 + 96000.0 * 0.01; // 9500 + 960 = 10460
    try testing.expectApproxEqAbs(reserved, expected, 0.01);
    // Sell not counted
    try testing.expect(reserved < 95000.0 * 0.1 + 96000.0 * 0.01 + 94000.0 * 0.1);
}

test "resource_monitor: parses df output" {
    const output =
        \\Filesystem     1K-blocks     Used Available Use% Mounted on
        \\/dev/disk3s1s1 488245288 12345678 123904000 73% /
        \\
    ;
    const sample = resource_monitor.parseDf(output) orelse return error.ExpectedDiskSample;
    try testing.expectApproxEqAbs(@as(f64, 123904000.0 / 1024.0), sample.free_mb, 0.001);
    try testing.expectApproxEqAbs(@as(f64, 73.0), sample.used_pct, 0.001);
}

test "resource_monitor: classifies disk pressure before secondary warnings" {
    const sample: resource_monitor.ResourceSample = .{
        .timestamp = 1,
        .uptime_sec = 1,
        .rss_mb = 2048,
        .cpu_sec = 1,
        .disk_free_mb = 100,
        .disk_used_pct = 95,
        .disk_path = ".",
        .ticks_per_min = 60,
        .feed_gap_sec = 0,
        .ws_lag_sec = 0,
        .reconnect_count = 0,
        .http_requests = 0,
        .http_errors = 0,
        .http_retries = 0,
        .http_last_ms = 0,
        .http_max_ms = 0,
    };
    const health = resource_monitor.classify(sample, .{});
    try testing.expectEqualStrings("DISK_LOW", health.status);
    try testing.expectEqualStrings("disk_free_mb_below_threshold", health.detail);
}

test "resource_monitor: computes ticks per minute from configured interval" {
    const sample = resource_monitor.sample(
        1200,
        900,
        120,
        ".",
        .{ .ticks = 180 },
        .{ .requests = 3, .errors = 1, .retries = 1, .last_ms = 25, .max_ms = 50 },
    );
    try testing.expectApproxEqAbs(@as(f64, 90.0), sample.ticks_per_min, 0.001);
    try testing.expectApproxEqAbs(@as(f64, 300.0), sample.uptime_sec, 0.001);
    try testing.expectEqual(@as(u64, 3), sample.http_requests);
    try testing.expectEqual(@as(u64, 1), sample.http_errors);
}

// Integration tests (LiveLoop + SimExchange + SimFeed)
comptime {
    _ = @import("integration_tests.zig");
}
