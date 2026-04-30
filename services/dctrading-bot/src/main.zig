/// DC Trading backtester — reads CSV ticks, runs strategy, outputs results.
const std = @import("std");
const types = @import("types.zig");
const strat_mod = @import("strategy.zig");
const telegram_mod = @import("telegram.zig");
const alpaca_mod = @import("alpaca.zig");
const http_mod = @import("http_client.zig");

const Tick = types.Tick;
const Trade = types.Trade;
const Strategy = strat_mod.Strategy;

// C file I/O (Zig 0.16 moved to Io-based API, extern C is simplest for file reading)
extern "c" fn fopen(path: [*:0]const u8, mode: [*:0]const u8) ?*anyopaque;
extern "c" fn fclose(fp: *anyopaque) c_int;
extern "c" fn fseek(fp: *anyopaque, offset: c_long, whence: c_int) c_int;
extern "c" fn ftell(fp: *anyopaque) c_long;
extern "c" fn fread(buf: [*]u8, size: usize, count: usize, fp: *anyopaque) usize;
extern "c" fn usleep(usec: c_uint) c_int;
extern "c" fn time(tloc: ?*anyopaque) c_long;
extern "c" fn signal(sig: c_int, handler: *const fn (c_int) callconv(.c) void) ?*const fn (c_int) callconv(.c) void;
extern "c" fn localtime(timer: *const c_long) ?*const extern struct { sec: c_int, min: c_int, hour: c_int, mday: c_int, mon: c_int, year: c_int, wday: c_int, yday: c_int, isdst: c_int };
extern "c" fn getenv(name: [*:0]const u8) ?[*:0]const u8;

var shutdown_requested: bool = false;

fn handleSigint(_: c_int) callconv(.c) void {
    shutdown_requested = true;
}

pub fn main(init: std.process.Init) !void {
    const allocator = init.gpa;

    // Parse CLI args
    var args = init.minimal.args.iterate();
    _ = args.skip(); // program name

    const first_arg = args.next() orelse {
        std.debug.print("Usage: dctrading <ticks.csv|-> [threshold] [initial_capital]\n\n", .{});
        std.debug.print("  <file.csv>  Backtest mode: read CSV file\n", .{});
        std.debug.print("  -           Live mode: native Binance WebSocket feed\n", .{});
        std.debug.print("  threshold   DC lambda (default: 0.07)\n", .{});
        std.debug.print("  capital     Initial capital (default: 1000)\n\n", .{});
        std.debug.print("Strategy: ZI-DCT0 long-only, 3-regime (BULL/SIDE/BEAR), vol-trail 2%%/72h, 60d MA buf=3%%\n", .{});
        return;
    };

    const live_mode = std.mem.eql(u8, first_arg, "-");

    const threshold_str = args.next();
    const capital_str = args.next();
    const threshold = if (threshold_str) |s| try std.fmt.parseFloat(f64, s) else 0.07;
    const capital = if (capital_str) |s| try std.fmt.parseFloat(f64, s) else 1000.0;

    if (live_mode) {
        try runLive(allocator, init.io, threshold, capital);
    } else {
        try runBacktest(allocator, first_arg, threshold, capital);
    }
}

fn runLive(allocator: std.mem.Allocator, io: std.Io, threshold: f64, capital: f64) !void {
    const feed_mod = @import("feed.zig");
    const turso_mod = @import("turso.zig");
    const checkpoint_path: [*:0]const u8 = "dctrading.checkpoint";
    const checkpoint_interval: u64 = 60; // ~1 hour with 1-min downsampling

    std.debug.print("Live mode: native Binance WebSocket feed\n", .{});
    std.debug.print("  lambda={d:.3}, capital=${d:.0}\n", .{ threshold, capital });
    std.debug.print("  Strategy: ZI-DCT0 long-only + vol-trail 2%/72h + 60d MA buf=3%\n", .{});
    std.debug.print("  Checkpoint: every {d} ticks\n\n", .{checkpoint_interval});

    // Register signal handlers for clean shutdown (SIGINT=2, SIGTERM=15)
    _ = signal(2, &handleSigint);  // Ctrl-C / local
    _ = signal(15, &handleSigint); // systemctl stop / GCP
    var strategy = try Strategy.init(allocator, .{
        .threshold = threshold,
        .initial_capital = capital,
    });
    defer strategy.deinit(allocator);

    var loaded_checkpoint = false;
    if (strategy.loadCheckpoint(checkpoint_path)) {
        loaded_checkpoint = true;
        std.debug.print("  Resumed from checkpoint: capital=${d:.2} regime={s} ticks={d}\n", .{
            strategy.capital,
            switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" },
            strategy.tick_count,
        });
        if (strategy.in_position) {
            std.debug.print("  Open position: entry=${d:.2} size={d:.8}\n", .{
                strategy.entry_price, strategy.size,
            });
        }
        std.debug.print("\n", .{});
    }

    // Init shared HTTP client
    var http = http_mod.HttpClient.init(allocator, io);
    defer http.deinit();

    // Init Turso DB logging (optional — disabled if env vars not set)
    var turso = turso_mod.Turso.init(allocator, &http);
    if (turso != null) turso.?.createTables();

    // Init Telegram notifications (optional)
    const tg = telegram_mod.Telegram.init(allocator, &http);

    // Init Alpaca paper trading (required)
    const alpaca = alpaca_mod.Alpaca.init(&http) orelse {
        std.debug.print("ERROR: Alpaca not configured. Set ALPACA_API_KEY + ALPACA_API_SECRET.\n", .{});
        return;
    };
    // Bootstrap or catch-up
    if (!loaded_checkpoint) {
        // Fresh start: full bootstrap from 60 days of 1m klines
        std.debug.print("  No checkpoint found, bootstrapping from historical data...\n", .{});
        const closes = feed_mod.fetch1mCloses(allocator, &http, "BTC/USDT", 87500) catch |err| {
            std.debug.print("  Bootstrap failed: {s}. Starting cold.\n", .{@errorName(err)});
            return;
        };
        defer allocator.free(closes);
        strategy.bootstrap(closes);

        if (turso != null) {
            std.debug.print("  Checking Turso for existing state...\n", .{});
            // Restore capital from ledger (source of truth) or equity_log (fallback)
            if (turso.?.queryLedgerBalance()) |bal| {
                strategy.capital = bal;
                std.debug.print("  Restored capital from ledger: ${d:.2}\n", .{bal});
            } else if (turso.?.queryLatestCapital()) |cap| {
                strategy.capital = cap;
                std.debug.print("  Restored capital from equity_log: ${d:.2}\n", .{cap});
            } else {
                // First run — log initial deposit
                const now: f64 = @floatFromInt(time(null));
                turso.?.logLedgerSync("DEPOSIT", capital, capital, "Initial capital", now);
                std.debug.print("  Logged initial deposit: ${d:.2}\n", .{capital});
            }
            // Restore open position
            if (turso.?.queryOpenPosition()) |pos| {
                strategy.in_position = true;
                strategy.entry_price = pos.entry_price;
                strategy.entry_time = pos.entry_time;
                strategy.size = pos.size;
                strategy.peak_price = pos.entry_price;
                std.debug.print("  Restored position from Turso: entry=${d:.2} size={d:.8}\n", .{ pos.entry_price, pos.size });
            }
        }
    } else {
        // Resumed: catch up missed candles since last checkpoint
        const last_active: u64 = @intFromFloat(strategy.last_timestamp);
        if (last_active > 0) {
            if (feed_mod.fetch1mClosesSince(allocator, &http, "BTC/USDT", last_active)) |closes| {
                if (closes.len > 0) {
                    strategy.catchup(closes);
                }
                allocator.free(closes);
            } else |err| {
                std.debug.print("  Catch-up failed: {s}. Continuing with stale state.\n", .{@errorName(err)});
            }
        }
    }

    // Reconcile deposits made while bot was down
    if (loaded_checkpoint and turso != null) {
        if (turso.?.queryLedgerBalance()) |ledger_bal| {
            if (ledger_bal > strategy.capital + 0.01) {
                const deposit = ledger_bal - strategy.capital;
                strategy.capital = ledger_bal;
                std.debug.print("  Deposit reconciled: +${d:.2} (capital now ${d:.2})\n", .{ deposit, strategy.capital });
            }
        }
    }

    // Reconcile with Alpaca position (source of truth for execution)
    if (alpaca.getPosition()) |pos| {
        if (pos.qty > 0) {
            strategy.in_position = true;
            strategy.entry_price = pos.entry_price;
            strategy.size = pos.qty;
            strategy.peak_price = pos.entry_price;
            std.debug.print("  [alpaca] Synced position: entry=${d:.2} qty={d:.8}\n", .{ pos.entry_price, pos.qty });
        }
    } else {
        // Alpaca has no position — if we think we have one, clear it
        if (strategy.in_position) {
            std.debug.print("  [alpaca] No position on Alpaca, clearing internal state.\n", .{});
            strategy.in_position = false;
            strategy.size = 0;
            strategy.capital = strategy.initial_capital;
        }
    }

    std.debug.print("\n  Connecting to Binance WebSocket...\n", .{});
    var feed = feed_mod.Feed.init(allocator, io, "BTC/USDT") catch |err| {
        std.debug.print("ERROR: Failed to connect: {s}\n", .{@errorName(err)});
        return;
    };
    defer feed.deinit();
    std.debug.print("  Connected. Streaming trades...\n\n", .{});

    var closed_count: u32 = 0;
    if (turso != null) {
        if (turso.?.queryTradeCount()) |cnt| {
            closed_count = cnt;
            std.debug.print("  Restored closed positions from Turso: {d}\n", .{cnt});
        }
    }
    var last_feed_ts: f64 = 0;
    var last_equity_ts: f64 = 0;
    var last_deposit_check: f64 = 0;
    var known_total_deposits: f64 = if (turso != null) (turso.?.queryTotalDeposits() orelse capital) else capital;
    var last_price: f64 = 0;
    var prev_regime = strategy.regime;
    const uptime_start: f64 = @floatFromInt(time(null));
    const instance: []const u8 = if (getenv("BOT_INSTANCE")) |ptr| std.mem.sliceTo(ptr, 0) else "local";
    // Notify startup
    if (tg) |t| {
        const regime_str = switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
        t.notifyStartup(regime_str, strategy.capital, strategy.in_position, instance);
    }
    while (!shutdown_requested) {
        const tick = feed.nextTick() catch |err| {
            std.debug.print("\n  FEED ERROR: {s}. Reconnecting...\n", .{@errorName(err)});
            _ = usleep(3_000_000); // 3s
            feed.deinit();
            feed = feed_mod.Feed.init(allocator, io, "BTC/USDT") catch |e| {
                std.debug.print("  Reconnect failed: {s}\n", .{@errorName(e)});
                return;
            };
            continue;
        };
        if (tick == null) continue;
        const t = tick.?;
        last_price = t.price;
        // Real-time risk: check trailing stop only in BEAR mode (matches backtest)
        if (strategy.regime == .bear) {
            if (strategy.checkStop(t.price, t.timestamp)) |trade| {
                closed_count += 1;
                printLiveTrade(trade, closed_count, &strategy);
                var sell_price = trade.exit_price;
                if (alpaca.sell(trade.size)) |fill| {
                    if (fill.status == .filled and fill.fill_price > 0) sell_price = fill.fill_price;
                }
                if (turso != null) {
                    const exit_fee = sell_price * trade.size * 0.001;
                    const sell_proceeds = sell_price * trade.size;
                    turso.?.logSell(sell_price, trade.size, exit_fee, t.timestamp);
                    turso.?.logPositionClose(trade);
                    // Ledger: cash inflow from selling BTC
                    turso.?.logLedger("SELL", sell_proceeds, strategy.capital + exit_fee, "Sold BTC", t.timestamp);
                    turso.?.logLedger("EXIT_FEE", -exit_fee, strategy.capital, "SELL fee 0.1%", t.timestamp);
                }
                if (tg) |tl| {
                    const exit_str = switch (trade.exit_type) { .dc_exit => "DC", .trailing_stop => "TRAIL", .regime_close => "REGIME", .end_of_data => "END" };
                    const regime_str = switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
                    tl.notifySell(sell_price, trade.pnl, exit_str, regime_str, instance);
                }
            }
        }
        // Downsample strategy logic (MA, vol, DC) to ~1 tick/minute
        if (t.timestamp - last_feed_ts < 60.0) continue;
        last_feed_ts = t.timestamp;

        const was_in_pos = strategy.in_position;
        if (strategy.processTick(t)) |trade| {
            closed_count += 1;
            printLiveTrade(trade, closed_count, &strategy);
            var sell_price = trade.exit_price;
            if (alpaca.sell(trade.size)) |fill| {
                if (fill.status == .filled and fill.fill_price > 0) sell_price = fill.fill_price;
            }
            if (turso != null) {
                const exit_fee = sell_price * trade.size * 0.001;
                const sell_proceeds = sell_price * trade.size;
                turso.?.logSell(sell_price, trade.size, exit_fee, t.timestamp);
                turso.?.logPositionClose(trade);
                // Ledger: cash inflow from selling BTC
                turso.?.logLedger("SELL", sell_proceeds, strategy.capital + exit_fee, "Sold BTC", t.timestamp);
                turso.?.logLedger("EXIT_FEE", -exit_fee, strategy.capital, "SELL fee 0.1%", t.timestamp);
            }
            if (tg) |tl| {
                const exit_str = switch (trade.exit_type) { .dc_exit => "DC", .trailing_stop => "TRAIL", .regime_close => "REGIME", .end_of_data => "END" };
                const regime_str = switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
                tl.notifySell(sell_price, trade.pnl, exit_str, regime_str, instance);
            }
        }
        // Detect new position opened by processTick
        if (!was_in_pos and strategy.in_position) {
            const signal_price = strategy.entry_price;  // capture before Alpaca overwrites
            var buy_price = strategy.entry_price;
            var buy_size = strategy.size;
            var alpaca_oid: []const u8 = "";
            var unspent_amt: f64 = 0;
            if (alpaca.buy(strategy.size)) |fill| {
                if (fill.status == .filled and fill.fill_price > 0) {
                    buy_price = fill.fill_price;
                    buy_size = fill.fill_qty;
                    // Add back unspent capital from Alpaca qty rounding
                    unspent_amt = (strategy.size - buy_size) * buy_price;
                    strategy.capital += unspent_amt;
                    strategy.entry_price = buy_price;
                    strategy.size = buy_size;
                    alpaca_oid = fill.order_id[0..fill.order_id_len];
                }
            }
            if (turso != null) {
                const fee = buy_price * buy_size * 0.001;
                const buy_cost = buy_price * buy_size;
                const cash_after_fee = strategy.initial_capital - fee;
                const cash_after_buy = cash_after_fee - buy_cost;
                turso.?.logBuy(buy_price, buy_size, fee, t.timestamp);
                turso.?.logPositionOpen(buy_price, t.timestamp, buy_size, fee, signal_price, alpaca_oid);
                turso.?.logLedger("ENTRY_FEE", -fee, cash_after_fee, "BUY fee 0.1%", t.timestamp);
                turso.?.logLedger("BUY", -buy_cost, cash_after_buy, "Bought BTC", t.timestamp);
            }
            if (tg) |tl| {
                const regime_str = switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
                tl.notifyBuy(buy_price, buy_size, regime_str, instance);
            }
        }

        // Detect regime change
        if (strategy.regime != prev_regime) {
            if (tg) |tl| {
                const from_str = switch (prev_regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
                const to_str = switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
                tl.notifyRegimeChange(from_str, to_str, t.price, instance);
            }
            prev_regime = strategy.regime;
        }
        // Print every strategy tick (~1/min) with timestamp
        const unrealized = if (strategy.in_position) (t.price - strategy.entry_price) * strategy.size else 0.0;
        const realized = strategy.capital - strategy.initial_capital;
        const equity = strategy.capital + unrealized;
        const ts_sec: c_long = @intFromFloat(t.timestamp);
        const tm = localtime(&ts_sec);
        if (tm) |lt| {
            std.debug.print("  {d:0>4}-{d:0>2}-{d:0>2} {d:0>2}:{d:0>2}:{d:0>2} ticks={d} closed={d} equity=${d:.2} realized=${d:.2} unrealized=${d:.2} regime={s} price=${d:.2}\n", .{
                @as(u32, @intCast(lt.year)) + 1900, @as(u32, @intCast(lt.mon)) + 1, @as(u32, @intCast(lt.mday)),
                @as(u32, @intCast(lt.hour)), @as(u32, @intCast(lt.min)), @as(u32, @intCast(lt.sec)),
                strategy.tick_count, closed_count, equity, realized, unrealized,
                switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" },
                t.price,
            });
        }
        // Log equity to Turso: every 5 min or on trade events
        const traded = (was_in_pos != strategy.in_position);
        const equity_interval = t.timestamp - last_equity_ts >= 300.0; // 5 min
        _ = strategy.saveCheckpoint(checkpoint_path);
        if (turso != null) {
            const regime_str = switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
            turso.?.upsertStatus(t.timestamp, strategy.tick_count, regime_str, strategy.in_position, strategy.entry_price, equity, strategy.capital, unrealized, t.price, uptime_start, instance);
            if (equity_interval or traded) {
                turso.?.logEquity(t.timestamp, strategy.tick_count, strategy.capital, equity, unrealized, regime_str, t.price);
                last_equity_ts = t.timestamp;
            }
            // Check for new deposits every 5 min
            if (t.timestamp - last_deposit_check >= 300.0) {
                last_deposit_check = t.timestamp;
                if (turso.?.queryTotalDeposits()) |total| {
                    if (total > known_total_deposits) {
                        const deposit = total - known_total_deposits;
                        strategy.capital += deposit;
                        known_total_deposits = total;
                        std.debug.print("  DEPOSIT detected: +${d:.2} (capital now ${d:.2})\n", .{ deposit, strategy.capital });
                        turso.?.logEquity(t.timestamp, strategy.tick_count, strategy.capital, strategy.capital + unrealized, unrealized, regime_str, t.price);
                        if (tg) |tel| tel.notifyDeposit(deposit, strategy.capital, instance);
                    }
                }

                // Reconcile with Alpaca position (detect manual trades)
                if (alpaca.getPosition()) |pos| {
                    if (!strategy.in_position and pos.qty > 0) {
                        // Manual buy detected (no existing position) — sync
                        strategy.in_position = true;
                        strategy.entry_price = pos.entry_price;
                        strategy.size = pos.qty;
                        strategy.peak_price = pos.entry_price;
                        const cost = pos.entry_price * pos.qty;
                        const fee_est = cost * strategy.fee_pct;
                        strategy.capital -= (cost + fee_est);
                        std.debug.print("  MANUAL BUY detected: entry=${d:.2} qty={d:.8}\n", .{ pos.entry_price, pos.qty });
                        if (tg) |tel| tel.notifyBuy(pos.entry_price, pos.qty, regime_str, instance);
                        if (turso != null) {
                            turso.?.logBuy(pos.entry_price, pos.qty, fee_est, t.timestamp);
                            turso.?.logPositionOpen(pos.entry_price, t.timestamp, pos.qty, fee_est, pos.entry_price, "");
                            turso.?.logLedger("ENTRY_FEE", -fee_est, strategy.capital, "Manual buy fee", t.timestamp);
                            turso.?.logLedger("BUY", -cost, strategy.capital, "Manual buy", t.timestamp);
                        }
                    } else if (strategy.in_position and pos.qty > strategy.size + 0.00000001) {
                        // Manual buy added to existing position — blend entry
                        const added_qty = pos.qty - strategy.size;
                        const added_cost = pos.entry_price * added_qty;
                        const fee_est = added_cost * strategy.fee_pct;
                        // Blend entry price: weighted average
                        strategy.entry_price = (strategy.entry_price * strategy.size + pos.entry_price * added_qty) / pos.qty;
                        strategy.size = pos.qty;
                        if (pos.entry_price > strategy.peak_price) strategy.peak_price = pos.entry_price;
                        strategy.capital -= (added_cost + fee_est);
                        std.debug.print("  MANUAL BUY (add): +{d:.8} BTC, blended entry=${d:.2}\n", .{ added_qty, strategy.entry_price });
                        if (tg) |tel| tel.notifyBuy(pos.entry_price, added_qty, regime_str, instance);
                        if (turso != null) {
                            turso.?.logBuy(pos.entry_price, added_qty, fee_est, t.timestamp);
                            turso.?.logLedger("ENTRY_FEE", -fee_est, strategy.capital, "Manual buy fee (add)", t.timestamp);
                            turso.?.logLedger("BUY", -added_cost, strategy.capital, "Manual buy (add)", t.timestamp);
                        }
                    }
                } else {
                    if (strategy.in_position) {
                        // Manual sell detected — close internal position
                        const sell_price = t.price;
                        const proceeds = sell_price * strategy.size;
                        const fee_est = proceeds * strategy.fee_pct;
                        const raw_pnl = (sell_price - strategy.entry_price) * strategy.size;
                        const net_pnl = raw_pnl - fee_est;
                        strategy.capital += net_pnl;
                        std.debug.print("  MANUAL SELL detected: price=${d:.2} pnl=${d:.2}\n", .{ sell_price, net_pnl });
                        if (tg) |tel| tel.notifySell(sell_price, net_pnl, "manual", regime_str, instance);
                        if (turso != null) {
                            turso.?.logSell(sell_price, strategy.size, fee_est, t.timestamp);
                            turso.?.logLedger("SELL", proceeds, strategy.capital + fee_est, "Manual sell", t.timestamp);
                            turso.?.logLedger("EXIT_FEE", -fee_est, strategy.capital, "Manual sell fee", t.timestamp);
                        }
                        strategy.in_position = false;
                        strategy.size = 0;
                        strategy.entry_price = 0;
                        strategy.peak_price = 0;
                        closed_count += 1;
                    }
                }
            }
        }
    }

    // Clean shutdown — save state, keep position open
    std.debug.print("\n  Shutting down...\n", .{});
    _ = strategy.saveCheckpoint(checkpoint_path);
    const final_unrealized = if (strategy.in_position) (last_price - strategy.entry_price) * strategy.size else 0.0;
    const eq = strategy.capital + final_unrealized;
    // Log final equity to Turso on shutdown
    if (turso != null) {
        const regime_str = switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
        turso.?.logEquity(last_feed_ts, strategy.tick_count, strategy.capital, eq, final_unrealized, regime_str, last_price);
        turso.?.setStatusStopped();
        _ = usleep(1_000_000);
    }
    if (tg) |t| {
        std.debug.print("  Sending shutdown notification...\n", .{});
        t.notifyShutdown(eq, closed_count, instance);
        std.debug.print("  Shutdown notification sent.\n", .{});
    }
    std.debug.print("  Final: equity=${d:.2} closed={d} ticks={d} position={s}\n", .{
        eq, closed_count, strategy.tick_count,
        if (strategy.in_position) "OPEN" else "NONE",
    });
    std.debug.print("  Checkpoint saved. Goodbye.\n", .{});
}

fn parseTick(line: []const u8) ?Tick {
    var fields = std.mem.splitSequence(u8, line, ",");
    const ts_str = fields.next() orelse return null;
    const price_str = fields.next() orelse return null;
    const vol_str = fields.next();
    const timestamp = std.fmt.parseFloat(f64, ts_str) catch return null;
    const price = std.fmt.parseFloat(f64, price_str) catch return null;
    const volume = if (vol_str) |v| std.fmt.parseFloat(f64, v) catch 0.0 else 0.0;
    return .{ .timestamp = timestamp, .price = price, .volume = volume };
}

fn printLiveTrade(trade: Trade, count: u32, strategy: *const Strategy) void {
    const exit_str = switch (trade.exit_type) {
        .dc_exit => "DC",
        .trailing_stop => "SL",
        .regime_close => "REG",
        .end_of_data => "END",
    };
    std.debug.print("\n  TRADE #{d}: {s} entry=${d:.2} exit=${d:.2} pnl=${d:.2} ret={d:.1}% capital=${d:.2}\n", .{
        count, exit_str, trade.entry_price, trade.exit_price, trade.pnl, trade.return_pct(), strategy.capital,
    });
}

fn runBacktest(allocator: std.mem.Allocator, csv_path: [*:0]const u8, threshold: f64, capital: f64) !void {
    std.debug.print("Loading {s}...\n", .{csv_path});
    const ticks = try loadCSV(allocator, csv_path);
    defer allocator.free(ticks);

    if (ticks.len == 0) {
        std.debug.print("No ticks loaded.\n", .{});
        return;
    }

    std.debug.print("Loaded {d} ticks (${d:.2} - ${d:.2})\n", .{
        ticks.len, ticks[0].price, ticks[ticks.len - 1].price,
    });

    const bh_return = (ticks[ticks.len - 1].price - ticks[0].price) / ticks[0].price * 100.0;
    std.debug.print("Buy&Hold: {d:.2}%\n\n", .{bh_return});

    var strategy = try Strategy.init(allocator, .{
        .threshold = threshold,
        .initial_capital = capital,
    });
    defer strategy.deinit(allocator);

    var trades: std.ArrayList(Trade) = .empty;
    defer trades.deinit(allocator);

    for (ticks) |tick| {
        if (strategy.processTick(tick)) |trade| {
            try trades.append(allocator, trade);
        }
    }

    if (strategy.forceClose(ticks[ticks.len - 1].price, ticks[ticks.len - 1].timestamp)) |trade| {
        try trades.append(allocator, trade);
    }

    printResults(trades.items, &strategy, bh_return);
}

fn loadCSV(allocator: std.mem.Allocator, path: [*:0]const u8) ![]Tick {
    const fp = fopen(path, "r") orelse return error.FileNotFound;
    defer _ = fclose(fp);

    _ = fseek(fp, 0, 2); // SEEK_END
    const size: usize = @intCast(ftell(fp));
    _ = fseek(fp, 0, 0); // SEEK_SET

    const buf = try allocator.alloc(u8, size);
    defer allocator.free(buf);
    _ = fread(buf.ptr, 1, size, fp);

    var ticks: std.ArrayList(Tick) = .empty;
    errdefer ticks.deinit(allocator);

    var lines = std.mem.splitSequence(u8, buf, "\n");
    while (lines.next()) |line| {
        if (line.len == 0) continue;
        if (line[0] < '0' or line[0] > '9') continue;

        var fields = std.mem.splitSequence(u8, line, ",");
        const ts_str = fields.next() orelse continue;
        const price_str = fields.next() orelse continue;
        const vol_str = fields.next();

        const timestamp = std.fmt.parseFloat(f64, ts_str) catch continue;
        const price = std.fmt.parseFloat(f64, price_str) catch continue;
        const volume = if (vol_str) |v| std.fmt.parseFloat(f64, v) catch 0.0 else 0.0;

        try ticks.append(allocator, .{ .timestamp = timestamp, .price = price, .volume = volume });
    }

    return try ticks.toOwnedSlice(allocator);
}

fn printResults(trades: []const Trade, strategy: *const Strategy, bh_return: f64) void {
    const p = std.debug.print;
    const n = trades.len;
    if (n == 0) {
        p("No trades executed.\n", .{});
        return;
    }

    var total_pnl: f64 = 0;
    var wins: u32 = 0;
    var sl_exits: u32 = 0;
    var pnls: [1024]f64 = undefined;
    const pnl_count = @min(n, 1024);

    for (trades, 0..) |t, i| {
        total_pnl += t.pnl;
        if (t.pnl > 0) wins += 1;
        if (t.exit_type == .trailing_stop) sl_exits += 1;
        if (i < 1024) pnls[i] = t.pnl;
    }

    const nf: f64 = @floatFromInt(n);
    const win_rate = @as(f64, @floatFromInt(wins)) / nf * 100.0;
    const total_return = strategy.totalReturn();

    // Sharpe
    var sum: f64 = 0;
    const pcf: f64 = @floatFromInt(pnl_count);
    for (pnls[0..pnl_count]) |v| sum += v;
    const mean = sum / pcf;
    var sq_sum: f64 = 0;
    for (pnls[0..pnl_count]) |v| {
        const d = v - mean;
        sq_sum += d * d;
    }
    const std_dev = if (pnl_count > 1) @sqrt(sq_sum / @as(f64, @floatFromInt(pnl_count - 1))) else 0.0;
    const sharpe = if (std_dev > 0) mean / std_dev * @sqrt(365.0) else 0.0;

    // Max drawdown
    var equity = strategy.initial_capital;
    var peak_equity = equity;
    var max_dd: f64 = 0;
    for (trades) |t| {
        equity += t.pnl;
        if (equity > peak_equity) peak_equity = equity;
        const dd = if (peak_equity > 0) (peak_equity - equity) / peak_equity else 0.0;
        if (dd > max_dd) max_dd = dd;
    }

    p("=== DC Hybrid Strategy Results ===\n", .{});
    p("  lambda=0.07, Vol-Trail 2%/72h, 60d MA buf=3%\n\n", .{});
    p("  PnL:        ${d:.2}\n", .{total_pnl});
    p("  Return:     {d:.2}%\n", .{total_return});
    p("  Buy&Hold:   {d:.2}%\n", .{bh_return});
    p("  Trades:     {d} ({d} trailing stops)\n", .{ n, sl_exits });
    p("  Win rate:   {d:.0}%\n", .{win_rate});
    p("  Sharpe:     {d:.4}\n", .{sharpe});
    p("  Max DD:     {d:.2}%\n", .{max_dd * 100.0});
    p("  Capital:    ${d:.2}\n\n", .{strategy.capital});

    p("  #   Entry $      Exit $        PnL    Ret    Hold   Type\n", .{});
    p("  --- ---------- ---------- --------- ------ ------ ------\n", .{});

    for (trades, 0..) |t, i| {
        const ret = t.return_pct();
        const hold = t.hold_hours();
        const exit_str = switch (t.exit_type) {
            .dc_exit => "DC",
            .trailing_stop => "SL",
            .regime_close => "REG",
            .end_of_data => "END",
        };
        const hold_val = if (hold < 48) hold else hold / 24.0;
        const hold_unit = if (hold < 48) "h" else "d";

        p("  {d:3} {d:10.2} {d:10.2} {d:9.2} {d:5.1}% {d:5.1}{s}  {s}\n", .{
            i + 1,
            t.entry_price,
            t.exit_price,
            t.pnl,
            ret,
            hold_val,
            hold_unit,
            exit_str,
        });
    }
}
