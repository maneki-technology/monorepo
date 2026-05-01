/// DC Trading backtester — reads CSV ticks, runs strategy, outputs results.
const std = @import("std");
const types = @import("types.zig");
const strat_mod = @import("strategy.zig");
const telegram_mod = @import("telegram.zig");
const alpaca_mod = @import("alpaca.zig");
const http_mod = @import("http_client.zig");
const turso_mod = @import("turso.zig");

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
    const capital: f64 = if (capital_str) |s| try std.fmt.parseFloat(f64, s) else if (live_mode) 0.0 else 1000.0;

    if (live_mode) {
        try runLive(allocator, init.io, threshold, capital);
    } else {
        try runBacktest(allocator, first_arg, threshold, capital);
    }
}

fn runLive(allocator: std.mem.Allocator, io: std.Io, threshold: f64, capital: f64) !void {
    const feed_mod = @import("feed.zig");
    // turso_mod imported at file scope
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
            // Restore capital from accounts (source of truth) or equity_log (fallback)
            if (turso.?.queryAccountBalance(turso_mod.Turso.ACCT_CASH)) |bal| {
                strategy.capital = bal;
                std.debug.print("  Restored capital from accounts: ${d:.2}\n", .{bal});
            } else if (turso.?.queryLatestCapital()) |cap| {
                strategy.capital = cap;
                std.debug.print("  Restored capital from equity_log: ${d:.2}\n", .{cap});
            } else {
                // First run — log initial deposit (skip if $0)
                if (capital > 0) {
                    const now: f64 = @floatFromInt(time(null));
                    turso.?.createPostedTransfer(turso_mod.Turso.ACCT_CASH, turso_mod.Turso.ACCT_EQUITY, capital, turso_mod.Turso.CODE_DEPOSIT, "Initial capital", now, 0, 0);
                    std.debug.print("  Logged initial deposit: ${d:.2}\n", .{capital});
                } else {
                    std.debug.print("  No initial capital. Waiting for deposit.\n", .{});
                }
            }
            // Restore open position from transfers
            if (turso.?.queryOpenPositionNew()) |pos| {
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

    // Set initial_capital from total deposits (survives restarts without checkpoint change)
    if (turso != null) {
        if (turso.?.queryTotalDepositsNew()) |total_deps| {
            if (total_deps > strategy.initial_capital + 0.01) {
                strategy.initial_capital = total_deps;
                std.debug.print("  Initial capital from deposits: ${d:.2}\n", .{total_deps});
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
        if (turso.?.queryTradeCountNew()) |cnt| {
            closed_count = cnt;
            std.debug.print("  Restored closed positions from Turso: {d}\n", .{cnt});
        }
    }
    var last_feed_ts: f64 = 0;
    var last_equity_ts: f64 = 0;
    var last_deposit_check: f64 = 0;
    var known_total_deposits: f64 = if (turso != null) (turso.?.queryTotalDepositsNew() orelse capital) else capital;
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
                handleSell(trade, &strategy, &closed_count, alpaca, if (turso != null) &turso.? else null, tg, t.timestamp, instance);
            }
        }
        // Downsample strategy logic (MA, vol, DC) to ~1 tick/minute
        if (t.timestamp - last_feed_ts < 60.0) continue;
        last_feed_ts = t.timestamp;

        const was_in_pos = strategy.in_position;
        if (strategy.processTick(t)) |trade| {
            handleSell(trade, &strategy, &closed_count, alpaca, if (turso != null) &turso.? else null, tg, t.timestamp, instance);
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
                    unspent_amt = (strategy.size - buy_size) * buy_price;
                    strategy.capital += unspent_amt;
                    strategy.entry_price = buy_price;
                    strategy.size = buy_size;
                    alpaca_oid = fill.order_id[0..fill.order_id_len];
                } else {
                    std.debug.print("  [alpaca] Buy order not filled: status={s}\n", .{if (fill.status == .accepted) "accepted" else "failed"});
                }
            } else {
                std.debug.print("  [alpaca] Buy order failed (null)\n", .{});
            }
            if (turso != null) {
                const fee = buy_price * buy_size * 0.001;
                const buy_cost = buy_price * buy_size;
                // Double-entry: fee transfer (cash → fees)
                turso.?.createPostedTransfer(turso_mod.Turso.ACCT_FEES, turso_mod.Turso.ACCT_CASH, fee, turso_mod.Turso.CODE_FEE, "BUY fee 0.1%", t.timestamp, 0, 0);
                // Double-entry: buy transfer (btc_position ← cash)
                var ud_buf: [256]u8 = undefined;
                const ud = std.fmt.bufPrint(&ud_buf,
                    \\{{"price":{d:.8},"size":{d:.8},"fee":{d:.8},"signal_price":{d:.8},"order_id":"{s}"}}
                , .{ buy_price, buy_size, fee, signal_price, alpaca_oid }) catch "{}" ;
                turso.?.createPostedTransfer(turso_mod.Turso.ACCT_BTC, turso_mod.Turso.ACCT_CASH, buy_cost, turso_mod.Turso.CODE_BUY, ud, t.timestamp, buy_price, buy_size);
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
                if (turso.?.queryTotalDepositsNew()) |total| {
                    if (total > known_total_deposits) {
                        const deposit = total - known_total_deposits;
                        strategy.capital += deposit;
                        strategy.initial_capital += deposit;
                        known_total_deposits = total;
                        std.debug.print("  DEPOSIT detected: +${d:.2} (capital now ${d:.2})\n", .{ deposit, strategy.capital });
                        if (tg) |tel| tel.notifyDeposit(deposit, strategy.capital, instance);

                        // If in BULL with open position, immediately buy with the deposit
                        if (strategy.regime == .bull and strategy.in_position and deposit > 10.0) {
                            const fee = deposit * strategy.fee_pct;
                            const usable = deposit - fee;
                            const add_size = usable / t.price;
                            var buy_price = t.price;
                            var buy_size = add_size;
                            if (alpaca.buy(add_size)) |fill| {
                                if (fill.status == .filled and fill.fill_price > 0) {
                                    buy_price = fill.fill_price;
                                    buy_size = fill.fill_qty;
                                }
                            }
                            strategy.entry_price = (strategy.entry_price * strategy.size + buy_price * buy_size) / (strategy.size + buy_size);
                            strategy.size += buy_size;
                            strategy.capital -= fee;
                            if (buy_price > strategy.peak_price) strategy.peak_price = buy_price;
                            std.debug.print("  DEPOSIT BUY: +{d:.8} BTC @ ${d:.2}, blended entry=${d:.2}\n", .{ buy_size, buy_price, strategy.entry_price });
                            if (tg) |tel| tel.notifyBuy(buy_price, buy_size, regime_str, instance);
                            // Double-entry: fee transfer for deposit buy
                            turso.?.createPostedTransfer(turso_mod.Turso.ACCT_FEES, turso_mod.Turso.ACCT_CASH, fee, turso_mod.Turso.CODE_FEE, "Deposit buy fee", t.timestamp, 0, 0);
                            // Double-entry: buy transfer for deposit buy
                            var dep_ud_buf: [256]u8 = undefined;
                            const dep_ud = std.fmt.bufPrint(&dep_ud_buf,
                                \\{{"price":{d:.8},"size":{d:.8},"fee":{d:.8},"deposit_buy":true}}
                            , .{ buy_price, buy_size, fee }) catch "{}";
                            const dep_buy_cost = buy_price * buy_size;
                            turso.?.createPostedTransfer(turso_mod.Turso.ACCT_BTC, turso_mod.Turso.ACCT_CASH, dep_buy_cost, turso_mod.Turso.CODE_BUY, dep_ud, t.timestamp, buy_price, buy_size);
                        }

                        turso.?.logEquity(t.timestamp, strategy.tick_count, strategy.capital, strategy.capital + unrealized, unrealized, regime_str, t.price);
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

fn handleSell(trade: Trade, strategy: *const Strategy, closed_count: *u32, alpaca: alpaca_mod.Alpaca, turso: ?*const turso_mod.Turso, tg: ?telegram_mod.Telegram, timestamp: f64, instance: []const u8) void {
    closed_count.* += 1;
    printLiveTrade(trade, closed_count.*, strategy);
    var sell_price = trade.exit_price;
    if (alpaca.sell(trade.size)) |fill| {
        if (fill.status == .filled and fill.fill_price > 0) sell_price = fill.fill_price;
    }
    if (turso) |t| {
        const exit_fee = sell_price * trade.size * 0.001;
        const sell_proceeds = sell_price * trade.size;
        const pnl = trade.pnl;
        const exit_str = switch (trade.exit_type) { .dc_exit => "DC", .trailing_stop => "SL", .regime_close => "REG", .end_of_data => "END" };
        // Double-entry: sell transfer (cash ← btc_position)
        var ud_buf: [256]u8 = undefined;
        const ud = std.fmt.bufPrint(&ud_buf,
            \\{{"price":{d:.8},"size":{d:.8},"fee":{d:.8},"exit_type":"{s}"}}
        , .{ sell_price, trade.size, exit_fee, exit_str }) catch "{}";
        t.createPostedTransfer(turso_mod.Turso.ACCT_CASH, turso_mod.Turso.ACCT_BTC, sell_proceeds, turso_mod.Turso.CODE_SELL, ud, timestamp, sell_price, trade.size);
        // Double-entry: fee transfer (fees ← cash)
        t.createPostedTransfer(turso_mod.Turso.ACCT_FEES, turso_mod.Turso.ACCT_CASH, exit_fee, turso_mod.Turso.CODE_FEE, "SELL fee 0.1%", timestamp, 0, 0);
        // Double-entry: PnL transfer (if nonzero)
        if (pnl > 0) {
            t.createPostedTransfer(turso_mod.Turso.ACCT_CASH, turso_mod.Turso.ACCT_PNL, pnl, turso_mod.Turso.CODE_PNL, "Realized PnL", timestamp, 0, 0);
        } else if (pnl < 0) {
            t.createPostedTransfer(turso_mod.Turso.ACCT_PNL, turso_mod.Turso.ACCT_CASH, -pnl, turso_mod.Turso.CODE_PNL, "Realized loss", timestamp, 0, 0);
        }
    }
    if (tg) |tl| {
        const exit_str = switch (trade.exit_type) { .dc_exit => "DC", .trailing_stop => "TRAIL", .regime_close => "REGIME", .end_of_data => "END" };
        const regime_str = switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
        tl.notifySell(sell_price, trade.pnl, exit_str, regime_str, instance);
    }
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
