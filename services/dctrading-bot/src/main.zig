/// DC Trading backtester — reads CSV ticks, runs strategy, outputs results.
const std = @import("std");
const types = @import("types.zig");
const strat_mod = @import("strategy.zig");
const telegram_mod = @import("telegram.zig");
const alpaca_mod = @import("alpaca.zig");
const exchange_mod = @import("exchange.zig");
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

    // Init exchange (Alpaca paper trading)
    const alpaca = alpaca_mod.Alpaca.init(&http) orelse {
        std.debug.print("ERROR: Exchange not configured. Set ALPACA_API_KEY + ALPACA_API_SECRET.\n", .{});
        return;
    };
    const exchange = alpaca.exchange();
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

    // Reconcile with exchange position (source of truth for execution)
    if (exchange.getPosition()) |pos| {
        if (pos.qty > 0) {
            strategy.in_position = true;
            strategy.entry_price = pos.entry_price;
            strategy.size = pos.qty;
            strategy.peak_price = pos.entry_price;
            std.debug.print("  [exchange] Synced position: entry=${d:.2} qty={d:.8}\n", .{ pos.entry_price, pos.qty });
        }
    } else {
        // Exchange has no position — if we think we have one, clear it
        if (strategy.in_position) {
            std.debug.print("  [exchange] No position on exchange, clearing internal state.\n", .{});
            strategy.in_position = false;
            strategy.size = 0;
            strategy.capital = strategy.initial_capital;
        }
    }

    // --- Pending order tracking ---
    const PendingOrderEntry = struct {
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
    const MAX_PENDING: usize = 4;
    var pending_orders: [MAX_PENDING]PendingOrderEntry = undefined;
    var pending_count: u8 = 0;


    // Reconcile pending transfers from Turso (orders submitted but not confirmed before restart)
    if (turso != null) {
        while (turso.?.queryPendingOrder()) |pending_info| {
            const oid = pending_info.order_id[0..pending_info.order_id_len];
            std.debug.print("  [reconcile] Pending transfer id={d} order_id={s} code={d}\n", .{ pending_info.transfer_id, oid, pending_info.code });
            const order_status = exchange.checkOrder(oid);
            switch (order_status) {
                .filled => |fill| {
                    std.debug.print("  [reconcile] Order filled: price=${d:.2} qty={d:.8}\n", .{ fill.fill_price, fill.fill_qty });
                    turso.?.postTransfer(pending_info.transfer_id);
                    // If it was a buy, update strategy state
                    if (pending_info.code == turso_mod.Turso.CODE_BUY) {
                        const bp = if (fill.fill_price > 0) fill.fill_price else pending_info.price;
                        const bs = if (fill.fill_qty > 0) fill.fill_qty else pending_info.size;
                        if (!strategy.in_position) {
                            strategy.in_position = true;
                            strategy.entry_price = bp;
                            strategy.size = bs;
                            strategy.peak_price = bp;
                        } else {
                            // Deposit buy: blend
                            strategy.entry_price = (strategy.entry_price * strategy.size + bp * bs) / (strategy.size + bs);
                            strategy.size += bs;
                            if (bp > strategy.peak_price) strategy.peak_price = bp;
                        }
                    }
                },
                .cancelled, .failed => {
                    std.debug.print("  [reconcile] Order cancelled/failed, voiding transfer\n", .{});
                    turso.?.voidTransfer(pending_info.transfer_id);
                },
                .pending => {
                    // Still pending after restart — track in main loop
                    std.debug.print("  [reconcile] Order still pending, tracking in main loop\n", .{});
                    if (pending_count < MAX_PENDING) {
                        const side: exchange_mod.Side = if (pending_info.code == turso_mod.Turso.CODE_BUY) .buy else .sell;
                        pending_orders[pending_count] = .{
                            .side = side,
                            .signal_price = pending_info.price,
                            .size = pending_info.size,
                            .transfer_id = pending_info.transfer_id,
                            .is_deposit_buy = (side == .buy and strategy.in_position),
                            .entry_price = strategy.entry_price,
                        };
                        const len = @min(pending_info.order_id_len, pending_orders[pending_count].order_id.len);
                        @memcpy(pending_orders[pending_count].order_id[0..len], pending_info.order_id[0..len]);
                        pending_orders[pending_count].order_id_len = len;
                        pending_count += 1;
                    }
                },
            }
        }
    }

    // Fetch initial funding rate
    if (feed_mod.fetchFundingRate(&http, 3)) |avg| {
        strategy.funding_avg = avg;
    }

    // Read funding skip threshold from env (default: 0.0001 = 0.010%)
    if (getenv("FUNDING_SKIP_THRESHOLD")) |ptr| {
        const val = std.mem.sliceTo(ptr, 0);
        strategy.funding_skip_threshold = std.fmt.parseFloat(f64, val) catch 0.0001;
        std.debug.print("  Funding skip threshold: {d:.4}%\n", .{strategy.funding_skip_threshold * 100});
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
    var last_funding_check: f64 = @floatFromInt(time(null));
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

        // --- Check pending orders on EVERY tick (non-blocking) ---
        {
            var i: u8 = 0;
            while (i < pending_count) {
                const po = pending_orders[i];
                const oid = po.order_id[0..po.order_id_len];
                const status = exchange.checkOrder(oid);
                switch (status) {
                    .filled => |fill| {
                        if (po.side == .buy) {
                            // Buy filled — commit position
                            const buy_price = if (fill.fill_price > 0) fill.fill_price else po.signal_price;
                            const buy_size = if (fill.fill_qty > 0) fill.fill_qty else po.size;
                            const fee = if (fill.commission > 0) fill.commission else buy_price * buy_size * 0.001;
                            if (po.is_deposit_buy) {
                                // Deposit buy: blend into existing position
                                strategy.entry_price = (strategy.entry_price * strategy.size + buy_price * buy_size) / (strategy.size + buy_size);
                                strategy.size += buy_size;
                                strategy.capital -= fee;
                                if (buy_price > strategy.peak_price) strategy.peak_price = buy_price;
                                std.debug.print("  DEPOSIT BUY FILLED: +{d:.8} BTC @ ${d:.2}, fee=${d:.4}, blended entry=${d:.2}\n", .{ buy_size, buy_price, fee, strategy.entry_price });
                            } else {
                                // Regular buy: set position
                                const unspent = (po.size - buy_size) * buy_price;
                                strategy.capital += unspent;
                                strategy.entry_price = buy_price;
                                strategy.size = buy_size;
                                strategy.peak_price = buy_price;
                                strategy.in_position = true;
                                std.debug.print("  BUY FILLED: {d:.8} BTC @ ${d:.2} fee=${d:.4}\n", .{ buy_size, buy_price, fee });
                            }
                            if (turso != null) {
                                // Post the pending transfer with actual fill data
                                const buy_cost = buy_price * buy_size;
                                var ud_buf: [256]u8 = undefined;
                                const ud = std.fmt.bufPrint(&ud_buf, "BUY signal={d:.2} oid={s}", .{ po.signal_price, oid }) catch "BUY";
                                if (po.transfer_id > 0) turso.?.postTransferWithFill(po.transfer_id, buy_cost, buy_price, buy_size, ud);
                                // Fee transfer (separate, always posted directly)
                                turso.?.createPostedTransfer(turso_mod.Turso.ACCT_FEES, turso_mod.Turso.ACCT_CASH, fee, turso_mod.Turso.CODE_FEE, "BUY fee", t.timestamp, 0, 0);
                            }
                            if (tg) |tl| {
                                const regime_str = switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
                                tl.notifyBuy(buy_price, buy_size, regime_str, instance);
                            }
                        } else {
                            // Sell filled — adjust capital for actual exchange price
                            const sell_price = if (fill.fill_price > 0) fill.fill_price else po.signal_price;
                            const sell_fee = if (fill.commission > 0) fill.commission else sell_price * po.size * 0.001;
                            const pnl = (sell_price - po.entry_price) * po.size - sell_fee;
                            // Adjust strategy capital: strategy already deducted based on signal price,
                            // correct for actual exchange price difference
                            const price_diff_pnl = (sell_price - po.signal_price) * po.size;
                            if (price_diff_pnl != 0) strategy.capital += price_diff_pnl;
                            const exit_str = switch (po.exit_type) { .dc_exit => "DC", .trailing_stop => "SL", .regime_close => "REG", .end_of_data => "END" };
                            std.debug.print("  SELL FILLED: {d:.8} BTC @ ${d:.2} pnl=${d:.2} ({s})\n", .{ po.size, sell_price, pnl, exit_str });
                            if (turso != null) {
                                // Post the pending transfer with actual fill data
                                const sell_amount = sell_price * po.size;
                                var ud_buf: [128]u8 = undefined;
                                const ud = std.fmt.bufPrint(&ud_buf, "SELL exit={s} oid={s}", .{ exit_str, oid }) catch "SELL";
                                if (po.transfer_id > 0) turso.?.postTransferWithFill(po.transfer_id, sell_amount, sell_price, po.size, ud);
                                // Fee transfer (separate, always posted directly)
                                turso.?.createPostedTransfer(turso_mod.Turso.ACCT_FEES, turso_mod.Turso.ACCT_CASH, sell_fee, turso_mod.Turso.CODE_FEE, "SELL fee", t.timestamp, 0, 0);
                                // PnL transfer
                                if (pnl > 0) {
                                    turso.?.createPostedTransfer(turso_mod.Turso.ACCT_CASH, turso_mod.Turso.ACCT_PNL, pnl, turso_mod.Turso.CODE_PNL, "Realized PnL", t.timestamp, 0, 0);
                                } else if (pnl < 0) {
                                    turso.?.createPostedTransfer(turso_mod.Turso.ACCT_PNL, turso_mod.Turso.ACCT_CASH, -pnl, turso_mod.Turso.CODE_PNL, "Realized loss", t.timestamp, 0, 0);
                                }
                            }
                            if (tg) |tl| {
                                const regime_str = switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" };
                                tl.notifySell(sell_price, pnl, exit_str, regime_str, instance);
                            }
                        }
                        // Remove from pending array (swap with last)
                        pending_count -= 1;
                        if (i < pending_count) {
                            pending_orders[i] = pending_orders[pending_count];
                        }
                        // Don't increment i — re-check swapped entry
                        continue;
                    },
                    .cancelled, .failed => {
                        std.debug.print("  Order {s}: {s}\n", .{ if (status == .cancelled) "cancelled" else "failed", oid });
                        // Void the pending transfer (release reserved balances)
                        if (po.transfer_id > 0 and turso != null) turso.?.voidTransfer(po.transfer_id);
                        // Remove from pending array
                        pending_count -= 1;
                        if (i < pending_count) {
                            pending_orders[i] = pending_orders[pending_count];
                        }
                        continue;
                    },
                    .pending => {},
                }
                i += 1;
            }
        }

        // Real-time risk: check trailing stop only in BEAR mode (matches backtest)
        if (strategy.regime == .bear) {
            if (strategy.checkStop(t.price, t.timestamp)) |trade| {
                // Cancel any pending buy orders before selling
                {
                    var i: u8 = 0;
                    while (i < pending_count) {
                        if (pending_orders[i].side == .buy) {
                            const cancel_oid = pending_orders[i].order_id[0..pending_orders[i].order_id_len];
                            const cancel_result = exchange.cancelOrder(cancel_oid);
                            switch (cancel_result) {
                                .filled => |fill| {
                                    // Buy filled despite cancel — commit position, then sell will proceed
                                    const bp = if (fill.fill_price > 0) fill.fill_price else pending_orders[i].signal_price;
                                    const bs = if (fill.fill_qty > 0) fill.fill_qty else pending_orders[i].size;
                                    strategy.entry_price = bp;
                                    strategy.size = bs;
                                    strategy.peak_price = bp;
                                    strategy.in_position = true;
                                    std.debug.print("  BUY filled during cancel, will sell immediately\n", .{});
                                },
                                .cancelled, .failed => {},
                            }
                            pending_count -= 1;
                            if (i < pending_count) {
                                pending_orders[i] = pending_orders[pending_count];
                            }
                            continue;
                        }
                        i += 1;
                    }
                }
                // Submit async sell
                closed_count += 1;
                printLiveTrade(trade, closed_count, &strategy);
                if (exchange.submitOrder(.sell, trade.size)) |pending| {
                    if (pending_count < MAX_PENDING) {
                        const oid_slice = pending.order_id[0..pending.order_id_len];
                        var tid: u32 = 0;
                        if (turso != null) {
                            const sell_amt = trade.exit_price * trade.size;
                            tid = turso.?.createPendingTransfer(turso_mod.Turso.ACCT_CASH, turso_mod.Turso.ACCT_BTC, sell_amt, turso_mod.Turso.CODE_SELL, "SELL pending", t.timestamp, trade.exit_price, trade.size, oid_slice) orelse 0;
                        }
                        pending_orders[pending_count] = .{
                            .side = .sell,
                            .signal_price = trade.exit_price,
                            .size = trade.size,
                            .entry_price = trade.entry_price,
                            .pnl = trade.pnl,
                            .exit_type = trade.exit_type,
                            .transfer_id = tid,
                        };
                        const len = @min(pending.order_id_len, pending_orders[pending_count].order_id.len);
                        @memcpy(pending_orders[pending_count].order_id[0..len], pending.order_id[0..len]);
                        pending_orders[pending_count].order_id_len = len;
                        pending_count += 1;
                    }
                }
            }
        }

        // Downsample strategy logic (MA, vol, DC) to ~1 tick/minute
        if (t.timestamp - last_feed_ts < 60.0) continue;
        last_feed_ts = t.timestamp;

        // Clear any previous buy signal before processing
        strategy.buy_signal = false;
        const was_in_pos = strategy.in_position;
        if (strategy.processTick(t)) |trade| {
            // Sell signal from strategy (DC exit or regime close)
            // Cancel any pending buy orders before selling
            {
                var ci: u8 = 0;
                while (ci < pending_count) {
                    if (pending_orders[ci].side == .buy) {
                        const cancel_oid = pending_orders[ci].order_id[0..pending_orders[ci].order_id_len];
                        const cancel_result = exchange.cancelOrder(cancel_oid);
                        switch (cancel_result) {
                            .filled => |fill| {
                                const bp = if (fill.fill_price > 0) fill.fill_price else pending_orders[ci].signal_price;
                                const bs = if (fill.fill_qty > 0) fill.fill_qty else pending_orders[ci].size;
                                if (pending_orders[ci].is_deposit_buy) {
                                    strategy.entry_price = (strategy.entry_price * strategy.size + bp * bs) / (strategy.size + bs);
                                    strategy.size += bs;
                                    if (bp > strategy.peak_price) strategy.peak_price = bp;
                                } else {
                                    strategy.entry_price = bp;
                                    strategy.size = bs;
                                    strategy.peak_price = bp;
                                    strategy.in_position = true;
                                }
                                std.debug.print("  BUY filled during cancel, will sell immediately\n", .{});
                            },
                            .cancelled, .failed => {
                                if (pending_orders[ci].transfer_id > 0 and turso != null) turso.?.voidTransfer(pending_orders[ci].transfer_id);
                            },
                        }
                        pending_count -= 1;
                        if (ci < pending_count) {
                            pending_orders[ci] = pending_orders[pending_count];
                        }
                        continue;
                    }
                    ci += 1;
                }
            }
            closed_count += 1;
            printLiveTrade(trade, closed_count, &strategy);
            if (exchange.submitOrder(.sell, trade.size)) |pending| {
                if (pending_count < MAX_PENDING) {
                    const oid_slice = pending.order_id[0..pending.order_id_len];
                    var tid: u32 = 0;
                    if (turso != null) {
                        const sell_amt = trade.exit_price * trade.size;
                        tid = turso.?.createPendingTransfer(turso_mod.Turso.ACCT_CASH, turso_mod.Turso.ACCT_BTC, sell_amt, turso_mod.Turso.CODE_SELL, "SELL pending", t.timestamp, trade.exit_price, trade.size, oid_slice) orelse 0;
                    }
                    pending_orders[pending_count] = .{
                        .side = .sell,
                        .signal_price = trade.exit_price,
                        .size = trade.size,
                        .entry_price = trade.entry_price,
                        .pnl = trade.pnl,
                        .exit_type = trade.exit_type,
                        .transfer_id = tid,
                    };
                    const len = @min(pending.order_id_len, pending_orders[pending_count].order_id.len);
                    @memcpy(pending_orders[pending_count].order_id[0..len], pending.order_id[0..len]);
                    pending_orders[pending_count].order_id_len = len;
                    pending_count += 1;
                }
            }
        }

        // Check for buy signal from strategy (suppress_entry mode)
        if (strategy.buy_signal) {
            strategy.buy_signal = false;
            // Prevent duplicate buy submissions while one is pending
            const has_pending_buy = blk: {
                var j: u8 = 0;
                while (j < pending_count) : (j += 1) {
                    if (pending_orders[j].side == .buy and !pending_orders[j].is_deposit_buy) break :blk true;
                }
                break :blk false;
            };
            if (!has_pending_buy) {
                if (exchange.submitOrder(.buy, strategy.buy_signal_size)) |pending| {
                    if (pending_count < MAX_PENDING) {
                        const oid_slice = pending.order_id[0..pending.order_id_len];
                        var tid: u32 = 0;
                        if (turso != null) {
                            const buy_cost = strategy.buy_signal_price * strategy.buy_signal_size;
                            tid = turso.?.createPendingTransfer(turso_mod.Turso.ACCT_BTC, turso_mod.Turso.ACCT_CASH, buy_cost, turso_mod.Turso.CODE_BUY, "BUY pending", t.timestamp, strategy.buy_signal_price, strategy.buy_signal_size, oid_slice) orelse 0;
                        }
                        pending_orders[pending_count] = .{
                            .side = .buy,
                            .signal_price = strategy.buy_signal_price,
                            .size = strategy.buy_signal_size,
                            .transfer_id = tid,
                        };
                        const len = @min(pending.order_id_len, pending_orders[pending_count].order_id.len);
                        @memcpy(pending_orders[pending_count].order_id[0..len], pending.order_id[0..len]);
                        pending_orders[pending_count].order_id_len = len;
                        pending_count += 1;
                        std.debug.print("  BUY submitted: {d:.8} BTC @ signal ${d:.2} tid={d}\n", .{ strategy.buy_signal_size, strategy.buy_signal_price, tid });
                    }
                }
            } else {
                std.debug.print("  BUY signal suppressed: pending buy already in flight\n", .{});
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
            std.debug.print("  {d:0>4}-{d:0>2}-{d:0>2} {d:0>2}:{d:0>2}:{d:0>2} ticks={d} closed={d} equity=${d:.2} realized=${d:.2} unrealized=${d:.2} regime={s} price=${d:.2} pending={d}\n", .{
                @as(u32, @intCast(lt.year)) + 1900, @as(u32, @intCast(lt.mon)) + 1, @as(u32, @intCast(lt.mday)),
                @as(u32, @intCast(lt.hour)), @as(u32, @intCast(lt.min)), @as(u32, @intCast(lt.sec)),
                strategy.tick_count, closed_count, equity, realized, unrealized,
                switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" },
                t.price, pending_count,
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
            // Refresh funding rate every 8h
            const now_ts: f64 = @floatFromInt(time(null));
            if (now_ts - last_funding_check >= 28800.0) { // 8h
                last_funding_check = now_ts;
                if (feed_mod.fetchFundingRate(&http, 3)) |avg| {
                    strategy.funding_avg = avg;
                }
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

                        // If in BULL with open position, submit async deposit buy
                        if (strategy.regime == .bull and strategy.in_position and deposit > 10.0) {
                            const est_fee = deposit * strategy.fee_pct;
                            const usable = deposit - est_fee;
                            const add_size = usable / t.price;
                            if (exchange.submitOrder(.buy, add_size)) |pending| {
                                if (pending_count < MAX_PENDING) {
                                    const oid_slice = pending.order_id[0..pending.order_id_len];
                                    var tid: u32 = 0;
                                    const dep_buy_cost = t.price * add_size;
                                    tid = turso.?.createPendingTransfer(turso_mod.Turso.ACCT_BTC, turso_mod.Turso.ACCT_CASH, dep_buy_cost, turso_mod.Turso.CODE_BUY, "Deposit buy pending", t.timestamp, t.price, add_size, oid_slice) orelse 0;
                                    pending_orders[pending_count] = .{
                                        .side = .buy,
                                        .signal_price = t.price,
                                        .size = add_size,
                                        .is_deposit_buy = true,
                                        .transfer_id = tid,
                                    };
                                    const len = @min(pending.order_id_len, pending_orders[pending_count].order_id.len);
                                    @memcpy(pending_orders[pending_count].order_id[0..len], pending.order_id[0..len]);
                                    pending_orders[pending_count].order_id_len = len;
                                    pending_count += 1;
                                    std.debug.print("  DEPOSIT BUY submitted: {d:.8} BTC @ ${d:.2} tid={d}\n", .{ add_size, t.price, tid });
                                }
                            }
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

    // Load funding rates if available (funding_rates.csv in same dir)
    const FundingRate = struct { timestamp: f64, rate: f64 };
    var funding_rates: std.ArrayList(FundingRate) = .empty;
    defer funding_rates.deinit(allocator);
    {
        const fr_fp = fopen("funding_rates.csv", "r");
        if (fr_fp) |fp| {
            defer _ = fclose(fp);
            _ = fseek(fp, 0, 2);
            const fr_size: usize = @intCast(ftell(fp));
            _ = fseek(fp, 0, 0);
            const fr_buf = try allocator.alloc(u8, fr_size);
            defer allocator.free(fr_buf);
            _ = fread(fr_buf.ptr, 1, fr_size, fp);
            var lines = std.mem.splitSequence(u8, fr_buf, "\n");
            while (lines.next()) |line| {
                if (line.len == 0) continue;
                var fields = std.mem.splitSequence(u8, line, ",");
                const ts_str = fields.next() orelse continue;
                const rate_str = fields.next() orelse continue;
                const ts = std.fmt.parseFloat(f64, ts_str) catch continue;
                const rate = std.fmt.parseFloat(f64, rate_str) catch continue;
                try funding_rates.append(allocator, .{ .timestamp = ts, .rate = rate });
            }
            std.debug.print("Loaded {d} funding rates\n", .{funding_rates.items.len});
        } else {
            std.debug.print("No funding_rates.csv found, running without funding filter\n", .{});
        }
    }

    // Read funding skip threshold from env
    if (getenv("FUNDING_SKIP_THRESHOLD")) |ptr| {
        const val = std.mem.sliceTo(ptr, 0);
        strategy.funding_skip_threshold = std.fmt.parseFloat(f64, val) catch 0.0001;
    }

    var trades: std.ArrayList(Trade) = .empty;
    defer trades.deinit(allocator);

    // Warmup: run full strategy with warmup flag (indicators + DC detector, no trades)
    const warmup_n = @min(strategy.ma_period, ticks.len);
    strategy.warmup = true;
    for (ticks[0..warmup_n]) |tick| {
        _ = strategy.processTick(tick);
    }
    strategy.warmup = false;
    std.debug.print("Warmup: {d} ticks, regime={s}, trading from tick {d}\n", .{
        warmup_n,
        switch (strategy.regime) { .bull => "BULL", .sideways => "SIDE", .bear => "BEAR" },
        warmup_n,
    });
    std.debug.print("Funding filter: threshold={d:.4}%, rates={d}\n\n", .{
        strategy.funding_skip_threshold * 100,
        funding_rates.items.len,
    });

    // Compute 24h avg funding rate for each tick (sliding window, matches Python)
    const FUNDING_WINDOW: f64 = 24.0 * 3600.0; // 24h in seconds
    var fr_start: usize = 0; // start of window
    var fr_end: usize = 0;   // end of window (exclusive)
    var fr_sum: f64 = 0;
    var fr_count: usize = 0;

    for (ticks[warmup_n..]) |tick_item| {
        const window_start = tick_item.timestamp - FUNDING_WINDOW;
        // Advance fr_end to include new records <= tick timestamp
        while (fr_end < funding_rates.items.len and funding_rates.items[fr_end].timestamp <= tick_item.timestamp) {
            fr_sum += funding_rates.items[fr_end].rate;
            fr_count += 1;
            fr_end += 1;
        }
        // Advance fr_start to exclude records outside window
        while (fr_start < fr_end and funding_rates.items[fr_start].timestamp < window_start) {
            fr_sum -= funding_rates.items[fr_start].rate;
            fr_count -= 1;
            fr_start += 1;
        }
        if (fr_count > 0) {
            strategy.funding_avg = fr_sum / @as(f64, @floatFromInt(fr_count));
        }
        if (strategy.processTick(tick_item)) |trade| {
            try trades.append(allocator, trade);
        }
    }

    // Don't force-close — match Python backtest behavior
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

    for (trades) |t| {
        total_pnl += t.pnl;
        if (t.pnl > 0) wins += 1;
        if (t.exit_type == .trailing_stop) sl_exits += 1;
    }

    const nf: f64 = @floatFromInt(n);
    const win_rate = @as(f64, @floatFromInt(wins)) / nf * 100.0;
    const total_return = strategy.totalReturn();

    // Sharpe (using percentage returns, not raw PnL)
    var returns: [1024]f64 = undefined;
    const ret_count = @min(n, 1024);
    var eq_track: f64 = strategy.initial_capital;
    for (trades[0..ret_count], 0..) |t, i| {
        returns[i] = if (eq_track > 0) t.pnl / eq_track else 0.0;
        eq_track += t.pnl;
    }
    var sum: f64 = 0;
    const rcf: f64 = @floatFromInt(ret_count);
    for (returns[0..ret_count]) |v| sum += v;
    const mean = sum / rcf;
    var sq_sum: f64 = 0;
    for (returns[0..ret_count]) |v| {
        const d = v - mean;
        sq_sum += d * d;
    }
    const std_dev = if (ret_count > 1) @sqrt(sq_sum / @as(f64, @floatFromInt(ret_count - 1))) else 0.0;
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
