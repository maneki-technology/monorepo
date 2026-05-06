/// DC Trading backtester — reads CSV ticks, runs strategy, outputs results.
const std = @import("std");
const types = @import("types.zig");
const strat_mod = @import("strategy.zig");
const telegram_mod = @import("telegram.zig");
const alpaca_mod = @import("alpaca.zig");
const exchange_mod = @import("exchange.zig");
const http_mod = @import("http_client.zig");
const turso_mod = @import("turso.zig");
const live_loop_mod = @import("live_loop.zig");
const sim_exchange_mod = @import("sim_exchange.zig");
const resource_monitor = @import("resource_monitor.zig");
const bnb_monitor = @import("bnb_monitor.zig");

const Tick = types.Tick;
const Trade = types.Trade;
const Strategy = strat_mod.Strategy;

// C file I/O (Zig 0.16 moved to Io-based API, extern C is simplest for file reading)
extern "c" fn fopen(path: [*:0]const u8, mode: [*:0]const u8) ?*anyopaque;
extern "c" fn fclose(fp: *anyopaque) c_int;
extern "c" fn fseek(fp: *anyopaque, offset: c_long, whence: c_int) c_int;
extern "c" fn ftell(fp: *anyopaque) c_long;
extern "c" fn fread(buf: [*]u8, size: usize, count: usize, fp: *anyopaque) usize;
extern "c" fn fwrite(buf: [*]const u8, size: usize, count: usize, fp: *anyopaque) usize;
extern "c" fn usleep(usec: c_uint) c_int;
extern "c" fn time(tloc: ?*anyopaque) c_long;
extern "c" fn signal(sig: c_int, handler: *const fn (c_int) callconv(.c) void) ?*const fn (c_int) callconv(.c) void;
extern "c" fn localtime(timer: *const c_long) ?*const extern struct { sec: c_int, min: c_int, hour: c_int, mday: c_int, mon: c_int, year: c_int, wday: c_int, yday: c_int, isdst: c_int };
extern "c" fn getenv(name: [*:0]const u8) ?[*:0]const u8;
extern "c" fn getcwd(buf: [*]u8, size: usize) ?[*:0]u8;

var shutdown_requested: bool = false;

fn handleSigint(_: c_int) callconv(.c) void {
    shutdown_requested = true;
}

const SymbolInfo = struct {
    trading_symbol: [32]u8,
    trading_symbol_len: usize,
    base_asset: [16]u8,
    base_asset_len: usize,
    quote_asset: [16]u8,
    quote_asset_len: usize,
    mark_symbol: [32]u8,
    mark_symbol_len: usize,

    fn tradingSymbol(self: *const SymbolInfo) []const u8 {
        return self.trading_symbol[0..self.trading_symbol_len];
    }

    fn baseAsset(self: *const SymbolInfo) []const u8 {
        return self.base_asset[0..self.base_asset_len];
    }

    fn quoteAsset(self: *const SymbolInfo) []const u8 {
        return self.quote_asset[0..self.quote_asset_len];
    }

    fn markSymbol(self: *const SymbolInfo) []const u8 {
        return self.mark_symbol[0..self.mark_symbol_len];
    }
};

fn upperCopy(dst: []u8, src: []const u8) usize {
    const len = @min(dst.len, src.len);
    for (src[0..len], 0..) |c, i| {
        dst[i] = if (c >= 'a' and c <= 'z') c - 32 else c;
    }
    return len;
}

fn parseEnvU8(name: [*:0]const u8, default_value: u8) u8 {
    const raw = getenv(name) orelse return default_value;
    return std.fmt.parseInt(u8, std.mem.sliceTo(raw, 0), 10) catch default_value;
}

fn parseEnvU32(name: [*:0]const u8, default_value: u32) u32 {
    const raw = getenv(name) orelse return default_value;
    return std.fmt.parseInt(u32, std.mem.sliceTo(raw, 0), 10) catch default_value;
}

fn parseEnvF64(name: [*:0]const u8, default_value: f64) f64 {
    const raw = getenv(name) orelse return default_value;
    return std.fmt.parseFloat(f64, std.mem.sliceTo(raw, 0)) catch default_value;
}

fn parseSymbolInfo(symbol: []const u8) SymbolInfo {
    var info: SymbolInfo = undefined;
    info.trading_symbol_len = upperCopy(&info.trading_symbol, symbol);

    const canonical = info.tradingSymbol();
    if (std.mem.indexOf(u8, canonical, "/")) |slash| {
        info.base_asset_len = upperCopy(&info.base_asset, canonical[0..slash]);
        info.quote_asset_len = upperCopy(&info.quote_asset, canonical[slash + 1 ..]);
    } else if (std.mem.endsWith(u8, canonical, "USDT")) {
        info.base_asset_len = upperCopy(&info.base_asset, canonical[0 .. canonical.len - 4]);
        info.quote_asset_len = upperCopy(&info.quote_asset, "USDT");
    } else if (std.mem.endsWith(u8, canonical, "USD")) {
        info.base_asset_len = upperCopy(&info.base_asset, canonical[0 .. canonical.len - 3]);
        info.quote_asset_len = upperCopy(&info.quote_asset, "USD");
    } else {
        info.base_asset_len = upperCopy(&info.base_asset, canonical);
        info.quote_asset_len = upperCopy(&info.quote_asset, "USD");
    }

    const mark_quote: []const u8 = if (std.mem.eql(u8, info.quoteAsset(), "USD")) "USDT" else info.quoteAsset();
    info.mark_symbol_len = 0;
    info.mark_symbol_len += upperCopy(info.mark_symbol[info.mark_symbol_len..], info.baseAsset());
    info.mark_symbol_len += upperCopy(info.mark_symbol[info.mark_symbol_len..], mark_quote);
    return info;
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
        std.debug.print("  checkpoint:migrate [path] [backups]  Migrate checkpoint files offline\n", .{});
        std.debug.print("  threshold   DC lambda (default: 0.07)\n", .{});
        std.debug.print("  capital     Initial capital (default: 1000)\n\n", .{});
        std.debug.print("Strategy: ZI-DCT0 long-only, 3-regime (BULL/SIDE/BEAR), vol-trail 2%%/72h, 60d MA buf=3%%\n", .{});
        return;
    };

    if (std.mem.eql(u8, first_arg, "checkpoint:migrate")) {
        const path_arg = args.next();
        const retention_arg = args.next();
        const retention = if (retention_arg) |s| try std.fmt.parseInt(u8, s, 10) else parseEnvU8("CHECKPOINT_BACKUP_RETENTION", 5);
        try runCheckpointMigrate(allocator, path_arg orelse "dctrading.checkpoint", retention);
        return;
    }

    const live_mode = std.mem.eql(u8, first_arg, "-");

    const threshold_str = args.next();
    const capital_str = args.next();
    const threshold = if (threshold_str) |s| try std.fmt.parseFloat(f64, s) else 0.07;
    const capital: f64 = if (capital_str) |s| try std.fmt.parseFloat(f64, s) else if (live_mode) 0.0 else 1000.0;

    if (live_mode) {
        try runLive(allocator, init.io, threshold, capital);
    } else if (std.mem.startsWith(u8, first_arg, "sim:")) {
        // Simulate mode: run LiveLoop on CSV data
        // Usage: dctrading sim:ticks.csv [threshold] [capital]
        const csv_path: [*:0]const u8 = @ptrCast(first_arg[4..].ptr);
        try runSimulate(allocator, csv_path, threshold, capital);
    } else {
        try runBacktest(allocator, first_arg, threshold, capital);
    }
}

fn runLive(allocator: std.mem.Allocator, io: std.Io, threshold: f64, capital: f64) !void {
    const feed_mod = @import("feed.zig");
    // turso_mod imported at file scope
    const checkpoint_path: [*:0]const u8 = if (getenv("CHECKPOINT_PATH")) |ptr| ptr else "dctrading.checkpoint";
    const checkpoint_interval: u64 = 60; // ~1 hour with 1-min downsampling
    const checkpoint_backup_retention = parseEnvU8("CHECKPOINT_BACKUP_RETENTION", 5);
    const checkpoint_remote_interval = parseEnvU32("CHECKPOINT_REMOTE_BACKUP_INTERVAL", 3600);
    const bnb_low_alert_mode = bnb_monitor.parseAlertMode(if (getenv("BNB_LOW_ALERT")) |ptr| std.mem.sliceTo(ptr, 0) else "auto");
    const bnb_low_threshold_quote = parseEnvF64("BNB_LOW_THRESHOLD_QUOTE", 5.0);
    const bnb_low_check_interval = parseEnvF64("BNB_LOW_CHECK_INTERVAL_SEC", 300.0);
    const bnb_low_alert_cooldown = parseEnvF64("BNB_LOW_ALERT_COOLDOWN_SEC", 86400.0);
    const resource_interval_sec = parseEnvF64("RESOURCE_LOG_INTERVAL_SEC", 300.0);
    const resource_disk_path: []const u8 = if (getenv("RESOURCE_DISK_PATH")) |ptr| std.mem.sliceTo(ptr, 0) else ".";
    const resource_thresholds: resource_monitor.Thresholds = .{
        .rss_warn_mb = parseEnvF64("RESOURCE_RSS_WARN_MB", 512.0),
        .disk_free_warn_mb = parseEnvF64("RESOURCE_DISK_FREE_WARN_MB", 1024.0),
        .disk_used_warn_pct = parseEnvF64("RESOURCE_DISK_USED_WARN_PCT", 90.0),
        .feed_gap_warn_sec = parseEnvF64("RESOURCE_FEED_GAP_WARN_SEC", 180.0),
        .ws_lag_warn_sec = parseEnvF64("RESOURCE_WS_LAG_WARN_SEC", 180.0),
        .http_latency_warn_ms = parseEnvF64("RESOURCE_HTTP_LATENCY_WARN_MS", 5000.0),
    };
    var last_remote_checkpoint_ts: f64 = 0;
    var checkpoint_health: []const u8 = "OK";
    var checkpoint_error: []const u8 = "";
    var last_checkpoint_alert: []const u8 = "";
    const symbol_info = parseSymbolInfo(if (getenv("TRADING_SYMBOL")) |ptr| std.mem.sliceTo(ptr, 0) else "BTC/USD");
    const trading_symbol = symbol_info.tradingSymbol();

    std.debug.print("Live mode: native Binance WebSocket feed\n", .{});
    std.debug.print("  lambda={d:.3}, capital=${d:.0}\n", .{ threshold, capital });
    std.debug.print("  symbol={s} quote={s} mark={s}\n", .{ trading_symbol, symbol_info.quoteAsset(), symbol_info.markSymbol() });
    std.debug.print("  Strategy: ZI-DCT0 long-only + vol-trail 2%/72h + 60d MA buf=3%\n", .{});
    printCheckpointLocation(checkpoint_path);
    std.debug.print("  Checkpoint: every {d} ticks, backups={d}, remote={d}s\n\n", .{ checkpoint_interval, checkpoint_backup_retention, checkpoint_remote_interval });
    std.debug.print("  BNB alert: mode={s} threshold=${d:.2}, check={d:.0}s, cooldown={d:.0}s\n", .{ bnb_monitor.alertModeLabel(bnb_low_alert_mode), bnb_low_threshold_quote, bnb_low_check_interval, bnb_low_alert_cooldown });
    std.debug.print("  Resource monitor: every {d:.0}s disk={s} warn free<{d:.0}MB used>{d:.0}% rss>{d:.0}MB\n\n", .{ resource_interval_sec, resource_disk_path, resource_thresholds.disk_free_warn_mb, resource_thresholds.disk_used_warn_pct, resource_thresholds.rss_warn_mb });

    // Register signal handlers for clean shutdown (SIGINT=2, SIGTERM=15)
    _ = signal(2, &handleSigint); // Ctrl-C / local
    _ = signal(15, &handleSigint); // systemctl stop / GCP
    var strategy = try Strategy.init(allocator, .{
        .threshold = threshold,
        .initial_capital = capital,
        // Live mode currently uses zero-commission Alpaca paper trading. Keep
        // fee_pct for backtest/sim sizing only.
        .fee_pct = 0.0,
    });
    defer strategy.deinit(allocator);

    // Init shared HTTP client
    var http = http_mod.HttpClient.init(allocator, io);
    defer http.deinit();

    // Init Turso DB logging (optional — disabled if env vars not set)
    var turso = turso_mod.Turso.init(allocator, &http);
    if (turso != null) turso.?.createTables();

    const local_checkpoint_exists = checkpointSetExists(checkpoint_path, checkpoint_backup_retention);
    var loaded_checkpoint = false;
    var restored_remote = false;
    if (strategy.loadCheckpointWithBackups(checkpoint_path, checkpoint_backup_retention)) {
        loaded_checkpoint = true;
    } else if (turso != null and turso.?.restoreCheckpointBackupToFile(checkpoint_path) and strategy.loadCheckpoint(checkpoint_path)) {
        loaded_checkpoint = true;
        restored_remote = true;
        checkpoint_health = "RESTORED_REMOTE";
        checkpoint_error = "local_checkpoint_unavailable";
        std.debug.print("  Restored checkpoint from Turso remote backup.\n", .{});
    }
    if (!loaded_checkpoint and local_checkpoint_exists) {
        checkpoint_health = "CHECKPOINT_LOAD_FAILED";
        checkpoint_error = "local_checkpoint_exists_but_unreadable";
    }
    if (loaded_checkpoint) {
        std.debug.print("  Resumed from checkpoint: capital=${d:.2} regime={s} ticks={d}\n", .{
            strategy.capital,
            switch (strategy.regime) {
                .bull => "BULL",
                .sideways => "SIDE",
                .bear => "BEAR",
            },
            strategy.tick_count,
        });
        if (strategy.in_position) {
            std.debug.print("  Open position: entry=${d:.2} size={d:.8}\n", .{
                strategy.entry_price, strategy.size,
            });
        }
        std.debug.print("\n", .{});
    }

    // Init Telegram notifications (optional)
    const tg = telegram_mod.Telegram.init(allocator, &http);
    if (!std.mem.eql(u8, checkpoint_health, "OK")) {
        if (tg) |tl| {
            tl.notifyCheckpointWarning(checkpoint_health, checkpoint_error, if (getenv("BOT_INSTANCE")) |ptr| std.mem.sliceTo(ptr, 0) else "local");
            last_checkpoint_alert = checkpoint_health;
        }
    }
    if (!loaded_checkpoint and local_checkpoint_exists) {
        std.debug.print("ERROR: Checkpoint files exist but none could be loaded. Refusing to bootstrap and overwrite checkpoint state.\n", .{});
        std.debug.print("       Run `./zig-out/bin/dctrading checkpoint:migrate {s} {d}` or restore a known-good backup first.\n", .{ std.mem.sliceTo(checkpoint_path, 0), checkpoint_backup_retention });
        return;
    }
    if (restored_remote) {
        std.debug.print("  Local checkpoint will be rewritten from restored remote state on next save.\n", .{});
    }

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
        const closes = feed_mod.fetch1mCloses(allocator, &http, trading_symbol, 87500) catch |err| {
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
            if (feed_mod.fetch1mClosesSince(allocator, &http, trading_symbol, last_active)) |closes| {
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
                        // Reserve capital for pending buy
                        if (side == .buy) strategy.capital_reserved += pending_info.price * pending_info.size;
                    }
                },
            }
        }
    }

    // Fetch initial funding rate
    const initial_funding_now: f64 = @floatFromInt(time(null));
    var initial_funding_fetch_ok = false;
    if (feed_mod.fetchFundingSnapshot(&http, trading_symbol, 3)) |snapshot| {
        strategy.funding_avg = snapshot.avg;
        strategy.funding_avg_updated_at = initial_funding_now;
        strategy.funding_latest_time = snapshot.latest_time;
        initial_funding_fetch_ok = true;
    }

    // Read funding skip threshold from env (default: 0.0001 = 0.010%)
    if (getenv("FUNDING_SKIP_THRESHOLD")) |ptr| {
        const val = std.mem.sliceTo(ptr, 0);
        strategy.funding_skip_threshold = std.fmt.parseFloat(f64, val) catch 0.0001;
        std.debug.print("  Funding skip threshold: {d:.4}%\n", .{strategy.funding_skip_threshold * 100});
    }

    std.debug.print("\n  Connecting to Binance WebSocket...\n", .{});
    var feed = feed_mod.Feed.init(allocator, io, trading_symbol) catch |err| {
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
    var last_equity_ts: f64 = 0;
    var last_deposit_check: f64 = 0;
    var last_resource_ts: f64 = 0;
    var last_resource_tick_ts: f64 = 0;
    var last_bnb_low_check_ts: f64 = 0;
    var bnb_low_state: bnb_monitor.AlertState = .{};
    var resource_window: resource_monitor.FeedWindow = .{};
    var known_total_deposits: f64 = if (turso != null) (turso.?.queryTotalDepositsNew() orelse capital) else capital;
    var last_funding_check: f64 = if (initial_funding_fetch_ok) initial_funding_now else 0;
    const uptime_start: f64 = @floatFromInt(time(null));
    const instance: []const u8 = if (getenv("BOT_INSTANCE")) |ptr| std.mem.sliceTo(ptr, 0) else "local";
    // Notify startup
    if (tg) |t| {
        const regime_str = switch (strategy.regime) {
            .bull => "BULL",
            .sideways => "SIDE",
            .bear => "BEAR",
        };
        t.notifyStartup(regime_str, strategy.capital, strategy.in_position, instance);
    }

    // Initialize LiveLoop — core order flow logic (shared with integration tests)
    var turso_ledger = if (turso != null) live_loop_mod.TursoLedger{ .turso = &turso.? } else null;
    const ledger = if (turso_ledger) |*tl| tl.ledger() else null;
    var loop = live_loop_mod.LiveLoop.init(&strategy, exchange, ledger);
    loop.closed_count = closed_count;
    // Copy reconciled pending orders into LiveLoop
    var pi: u8 = 0;
    while (pi < pending_count) : (pi += 1) {
        if (loop.pending_count < live_loop_mod.MAX_PENDING) {
            loop.pending_orders[loop.pending_count] = .{
                .side = pending_orders[pi].side,
                .signal_price = pending_orders[pi].signal_price,
                .size = pending_orders[pi].size,
                .transfer_id = pending_orders[pi].transfer_id,
                .is_deposit_buy = pending_orders[pi].is_deposit_buy,
                .entry_price = pending_orders[pi].entry_price,
                .pnl = pending_orders[pi].pnl,
                .exit_type = pending_orders[pi].exit_type,
            };
            @memcpy(loop.pending_orders[loop.pending_count].order_id[0..pending_orders[pi].order_id_len], pending_orders[pi].order_id[0..pending_orders[pi].order_id_len]);
            loop.pending_orders[loop.pending_count].order_id_len = pending_orders[pi].order_id_len;
            loop.pending_count += 1;
        }
    }
    while (!shutdown_requested) {
        const tick = feed.nextTick() catch |err| {
            std.debug.print("\n  FEED ERROR: {s}. Reconnecting...\n", .{@errorName(err)});
            resource_window.reconnect_count += 1;
            _ = usleep(3_000_000); // 3s
            feed.deinit();
            feed = feed_mod.Feed.init(allocator, io, trading_symbol) catch |e| {
                std.debug.print("  Reconnect failed: {s}\n", .{@errorName(e)});
                return;
            };
            continue;
        };
        if (tick == null) continue;
        const t = tick.?;
        resource_window.ticks += 1;
        if (last_resource_tick_ts > 0) {
            const feed_gap = t.timestamp - last_resource_tick_ts;
            if (feed_gap > resource_window.max_gap_sec) resource_window.max_gap_sec = feed_gap;
        }
        last_resource_tick_ts = t.timestamp;
        const tick_wall_now: f64 = @floatFromInt(time(null));
        const ws_lag = tick_wall_now - t.timestamp;
        if (ws_lag > resource_window.max_ws_lag_sec) resource_window.max_ws_lag_sec = ws_lag;

        // Refresh funding rate before strategy-minute ticks so DC entries use the latest filter value.
        const is_strategy_tick = t.timestamp - loop.last_feed_ts >= 60.0;
        if (is_strategy_tick) {
            const funding_now_ts: f64 = @floatFromInt(time(null));
            if (funding_now_ts - last_funding_check >= 3600.0) {
                last_funding_check = funding_now_ts;
                if (feed_mod.fetchFundingSnapshot(&http, trading_symbol, 3)) |snapshot| {
                    const latest_changed = snapshot.latest_time > 0 and snapshot.latest_time != strategy.funding_latest_time;
                    strategy.funding_avg = snapshot.avg;
                    strategy.funding_avg_updated_at = funding_now_ts;
                    strategy.funding_latest_time = snapshot.latest_time;
                    if (latest_changed) {
                        if (tg) |tl| tl.notifyFundingRate(trading_symbol, snapshot.avg, strategy.funding_skip_threshold, strategy.funding_avg_updated_at, strategy.funding_latest_time, funding_now_ts, instance);
                    }
                } else if (telegram_mod.fundingCacheStatus(strategy.funding_avg_updated_at, funding_now_ts)[0] != 'F') {
                    std.debug.print("  [funding] WARNING: refresh failed, cache={s}\n", .{telegram_mod.fundingCacheStatus(strategy.funding_avg_updated_at, funding_now_ts)});
                    if (tg) |tl| tl.notifyFundingRateStale(trading_symbol, strategy.funding_avg, strategy.funding_avg_updated_at, strategy.funding_latest_time, funding_now_ts, instance);
                }
            }
        }

        // Core order flow: pending checks, trailing stop, strategy, buy/sell signals
        const was_in_pos = strategy.in_position;
        loop.processTick(t);

        const regime_str = switch (strategy.regime) {
            .bull => "BULL",
            .sideways => "SIDE",
            .bear => "BEAR",
        };
        if (loop.last_buy_fill) |fill| {
            std.debug.print("  {s}BUY FILLED: {d:.8} BTC @ ${d:.2}\n", .{ if (fill.is_deposit) "DEPOSIT " else "", fill.size, fill.price });
            if (tg) |tl| tl.notifyBuy(fill.price, fill.size, regime_str, instance);
        }
        if (loop.last_sell_trade) |trade| {
            printLiveTrade(trade, loop.closed_count, &strategy);
        }
        if (loop.last_sell_fill) |fill| {
            const exit_str = switch (fill.exit_type) {
                .dc_exit => "DC",
                .trailing_stop => "SL",
                .regime_close => "REG",
                .end_of_data => "END",
            };
            std.debug.print("  SELL FILLED: {d:.8} BTC @ ${d:.2} pnl=${d:.2} ({s})\n", .{ fill.size, fill.price, fill.pnl, exit_str });
            if (tg) |tl| tl.notifySell(fill.price, fill.pnl, exit_str, regime_str, instance);
        }

        // --- Periodic tasks (not in LiveLoop) ---

        // Only run periodic tasks on downsampled ticks (1/min)
        if (loop.was_downsampled) {
            // Detect regime change
            if (loop.regime_changed) {
                if (tg) |tl| {
                    const from_str = switch (loop.old_regime) {
                        .bull => "BULL",
                        .sideways => "SIDE",
                        .bear => "BEAR",
                    };
                    tl.notifyRegimeChange(from_str, regime_str, t.price, instance);
                }
            }
            // Print status
            const unrealized = if (strategy.in_position) (t.price - strategy.entry_price) * strategy.size else 0.0;
            const realized = strategy.capital - strategy.initial_capital;
            const equity = strategy.capital + unrealized;
            const ts_sec: c_long = @intFromFloat(t.timestamp);
            const tm = localtime(&ts_sec);
            if (tm) |lt| {
                std.debug.print("  {d:0>4}-{d:0>2}-{d:0>2} {d:0>2}:{d:0>2}:{d:0>2} ticks={d} closed={d} equity=${d:.2} realized=${d:.2} unrealized=${d:.2} regime={s} price=${d:.2} pending={d}\n", .{
                    @as(u32, @intCast(lt.year)) + 1900, @as(u32, @intCast(lt.mon)) + 1, @as(u32, @intCast(lt.mday)),
                    @as(u32, @intCast(lt.hour)),        @as(u32, @intCast(lt.min)),     @as(u32, @intCast(lt.sec)),
                    strategy.tick_count,                loop.closed_count,              equity,
                    realized,                           unrealized,
                    switch (strategy.regime) {
                        .bull => "BULL",
                        .sideways => "SIDE",
                        .bear => "BEAR",
                    },
                    t.price,                            loop.pending_count,
                });
            }
            // Log equity + checkpoint
            const traded = (was_in_pos != strategy.in_position);
            const equity_interval = t.timestamp - last_equity_ts >= 300.0;
            const checkpoint_saved = strategy.saveCheckpointWithBackups(checkpoint_path, checkpoint_backup_retention);
            if (!checkpoint_saved) {
                checkpoint_health = "CHECKPOINT_SAVE_FAILED";
                checkpoint_error = "local_checkpoint_write_failed";
                std.debug.print("  [checkpoint] ERROR: local checkpoint save failed.\n", .{});
                if (!std.mem.eql(u8, last_checkpoint_alert, checkpoint_health)) {
                    if (tg) |tl| tl.notifyCheckpointWarning(checkpoint_health, checkpoint_error, instance);
                    last_checkpoint_alert = checkpoint_health;
                }
            } else if (std.mem.eql(u8, checkpoint_health, "CHECKPOINT_SAVE_FAILED")) {
                checkpoint_health = "OK";
                checkpoint_error = "";
                last_checkpoint_alert = "";
            }
            if (resource_interval_sec > 0 and t.timestamp - last_resource_ts >= resource_interval_sec) {
                const http_metrics = http.snapshotAndResetMetrics();
                const resource_sample = resource_monitor.sample(tick_wall_now, uptime_start, resource_interval_sec, resource_disk_path, resource_window, http_metrics);
                const resource_health = resource_monitor.classify(resource_sample, resource_thresholds);
                std.debug.print("  [resource] health={s} rss={d:.1}MB disk_free={d:.0}MB disk_used={d:.1}% ticks/min={d:.1} gap={d:.0}s lag={d:.0}s reconnects={d} http={d}/{d} retry={d} max={d:.0}ms\n", .{
                    resource_health.status,
                    resource_sample.rss_mb,
                    resource_sample.disk_free_mb,
                    resource_sample.disk_used_pct,
                    resource_sample.ticks_per_min,
                    resource_sample.feed_gap_sec,
                    resource_sample.ws_lag_sec,
                    resource_sample.reconnect_count,
                    resource_sample.http_errors,
                    resource_sample.http_requests,
                    resource_sample.http_retries,
                    resource_sample.http_max_ms,
                });
                if (turso != null) {
                    turso.?.logResource(resource_sample, resource_health.status, resource_health.detail);
                }
                last_resource_ts = t.timestamp;
                resource_window = .{};
            }
            if (turso != null) {
                if (checkpoint_saved and checkpoint_remote_interval > 0) {
                    const remote_now_ts: f64 = @floatFromInt(time(null));
                    if (remote_now_ts - last_remote_checkpoint_ts >= @as(f64, @floatFromInt(checkpoint_remote_interval))) {
                        if (turso.?.backupCheckpointFile(checkpoint_path, strategy.tick_count, false)) {
                            last_remote_checkpoint_ts = remote_now_ts;
                            if (std.mem.eql(u8, checkpoint_health, "REMOTE_BACKUP_FAILED")) {
                                checkpoint_health = "OK";
                                checkpoint_error = "";
                                last_checkpoint_alert = "";
                            }
                        } else {
                            checkpoint_health = "REMOTE_BACKUP_FAILED";
                            checkpoint_error = "turso_checkpoint_backup_failed";
                            std.debug.print("  [checkpoint] WARNING: Turso checkpoint backup failed.\n", .{});
                            if (!std.mem.eql(u8, last_checkpoint_alert, checkpoint_health)) {
                                if (tg) |tl| tl.notifyCheckpointWarning(checkpoint_health, checkpoint_error, instance);
                                last_checkpoint_alert = checkpoint_health;
                            }
                        }
                    }
                }
                turso.?.upsertStatus(t.timestamp, strategy.tick_count, regime_str, strategy.in_position, strategy.entry_price, equity, strategy.capital, unrealized, t.price, uptime_start, instance, symbol_info.tradingSymbol(), symbol_info.baseAsset(), symbol_info.quoteAsset(), symbol_info.markSymbol(), checkpoint_health, checkpoint_error);
                if (equity_interval or traded) {
                    turso.?.logEquity(t.timestamp, strategy.tick_count, strategy.capital, equity, unrealized, regime_str, t.price);
                    last_equity_ts = t.timestamp;
                }
                if (bnb_low_threshold_quote > 0 and bnb_low_check_interval > 0 and t.timestamp - last_bnb_low_check_ts >= bnb_low_check_interval) {
                    last_bnb_low_check_ts = t.timestamp;
                    const has_bnb_fee = if (bnb_low_alert_mode == .auto) (turso.?.hasPostedBnbFees() orelse false) else false;
                    if (bnb_monitor.shouldMonitor(bnb_low_alert_mode, has_bnb_fee)) {
                        if (turso.?.queryManagedBnbQuantity()) |managed_bnb_qty| {
                            if (feed_mod.fetchSpotPrice(&http, "BNBUSDT")) |bnb_price| {
                                const bnb_check = bnb_monitor.evaluate(managed_bnb_qty, bnb_price, bnb_low_threshold_quote, tick_wall_now, bnb_low_alert_cooldown, &bnb_low_state);
                                if (bnb_check.is_low) {
                                    std.debug.print("  [bnb] WARNING: managed={d:.8} BNB value=${d:.2} threshold=${d:.2}\n", .{ bnb_check.quantity, bnb_check.value_quote, bnb_check.threshold_quote });
                                }
                                if (bnb_check.should_alert) {
                                    if (tg) |tl| tl.notifyLowBnb(bnb_check.quantity, bnb_check.price, bnb_check.value_quote, bnb_check.threshold_quote, instance);
                                }
                            } else {
                                std.debug.print("  [bnb] WARNING: failed to fetch BNBUSDT spot price.\n", .{});
                            }
                        } else {
                            std.debug.print("  [bnb] WARNING: failed to query managed BNB quantity.\n", .{});
                        }
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
                                loop.submitBuy(t.price, add_size, true, t.timestamp);
                            }

                            turso.?.logEquity(t.timestamp, strategy.tick_count, strategy.capital, strategy.capital + unrealized, unrealized, regime_str, t.price);
                        }
                    }
                }
            }
        }
    }

    // Clean shutdown — save state, keep position open
    std.debug.print("\n  Shutting down...\n", .{});
    const final_checkpoint_saved = strategy.saveCheckpointWithBackups(checkpoint_path, checkpoint_backup_retention);
    if (!final_checkpoint_saved) {
        checkpoint_health = "CHECKPOINT_SAVE_FAILED";
        checkpoint_error = "shutdown_checkpoint_write_failed";
        if (tg) |tl| tl.notifyCheckpointWarning(checkpoint_health, checkpoint_error, instance);
    }
    if (final_checkpoint_saved and checkpoint_remote_interval > 0 and turso != null) {
        if (!turso.?.backupCheckpointFile(checkpoint_path, strategy.tick_count, true)) {
            checkpoint_health = "REMOTE_BACKUP_FAILED";
            checkpoint_error = "shutdown_turso_checkpoint_backup_failed";
            if (tg) |tl| tl.notifyCheckpointWarning(checkpoint_health, checkpoint_error, instance);
        }
    }
    const final_unrealized = if (strategy.in_position) (loop.last_price - strategy.entry_price) * strategy.size else 0.0;
    const eq = strategy.capital + final_unrealized;
    // Log final equity to Turso on shutdown
    if (turso != null) {
        const regime_str = switch (strategy.regime) {
            .bull => "BULL",
            .sideways => "SIDE",
            .bear => "BEAR",
        };
        turso.?.logEquity(loop.last_feed_ts, strategy.tick_count, strategy.capital, eq, final_unrealized, regime_str, loop.last_price);
        turso.?.setStatusStopped();
        _ = usleep(1_000_000);
    }
    if (tg) |t| {
        std.debug.print("  Sending shutdown notification...\n", .{});
        t.notifyShutdown(eq, loop.closed_count, instance);
        std.debug.print("  Shutdown notification sent.\n", .{});
    }
    std.debug.print("  Final: equity=${d:.2} closed={d} ticks={d} position={s}\n", .{
        eq,                                           loop.closed_count, strategy.tick_count,
        if (strategy.in_position) "OPEN" else "NONE",
    });
    std.debug.print("  Checkpoint saved. Goodbye.\n", .{});
}

fn runCheckpointMigrate(allocator: std.mem.Allocator, checkpoint_path: []const u8, retention: u8) !void {
    var path_buf: [4096]u8 = undefined;
    const primary = try std.fmt.bufPrintZ(&path_buf, "{s}", .{checkpoint_path});

    var migrated: u32 = 0;
    var skipped: u32 = 0;
    var failed: u32 = 0;

    std.debug.print("Checkpoint migration: path={s} backups={d}\n", .{ primary, retention });
    if (try migrateCheckpointFile(allocator, primary)) {
        migrated += 1;
    } else {
        skipped += 1;
    }

    var index: u8 = 1;
    while (index <= retention) : (index += 1) {
        var backup_buf: [4096]u8 = undefined;
        const backup = std.fmt.bufPrintZ(&backup_buf, "{s}.bak.{d}", .{ primary, index }) catch {
            failed += 1;
            continue;
        };
        if (migrateCheckpointFile(allocator, backup)) |did_migrate| {
            if (did_migrate) {
                migrated += 1;
            } else {
                skipped += 1;
            }
        } else |err| {
            std.debug.print("  FAILED: {s} ({s})\n", .{ backup, @errorName(err) });
            failed += 1;
        }
    }

    std.debug.print("Checkpoint migration complete: migrated={d} skipped={d} failed={d}\n", .{ migrated, skipped, failed });
    if (failed > 0) return error.CheckpointMigrationFailed;
}

fn printCheckpointLocation(path: [*:0]const u8) void {
    var cwd_buf: [4096]u8 = undefined;
    if (getcwd(&cwd_buf, cwd_buf.len)) |cwd| {
        std.debug.print("  Working dir: {s}\n", .{std.mem.sliceTo(cwd, 0)});
    } else {
        std.debug.print("  Working dir: <unknown>\n", .{});
    }
    std.debug.print("  Checkpoint path: {s}\n", .{std.mem.sliceTo(path, 0)});
}

fn checkpointSetExists(path: [*:0]const u8, retention: u8) bool {
    if (fileExists(path)) return true;
    var index: u8 = 1;
    while (index <= retention) : (index += 1) {
        var backup_buf: [4096]u8 = undefined;
        const backup = std.fmt.bufPrintZ(&backup_buf, "{s}.bak.{d}", .{ std.mem.sliceTo(path, 0), index }) catch return true;
        if (fileExists(backup)) return true;
    }
    return false;
}

fn migrateCheckpointFile(allocator: std.mem.Allocator, path: [*:0]const u8) !bool {
    if (!fileExists(path)) {
        std.debug.print("  skip missing: {s}\n", .{std.mem.sliceTo(path, 0)});
        return false;
    }

    var strategy = try Strategy.init(allocator, .{});
    defer strategy.deinit(allocator);

    if (!strategy.loadCheckpoint(path)) {
        return error.InvalidCheckpoint;
    }

    var backup_buf: [4096]u8 = undefined;
    const backup_path = try std.fmt.bufPrintZ(&backup_buf, "{s}.pre-migrate", .{std.mem.sliceTo(path, 0)});
    if (!copyFile(path, backup_path)) return error.BackupFailed;
    if (!strategy.saveCheckpoint(path)) return error.SaveFailed;

    std.debug.print("  migrated: {s} (pre-migrate copy: {s})\n", .{ std.mem.sliceTo(path, 0), backup_path });
    return true;
}

fn fileExists(path: [*:0]const u8) bool {
    const fp = fopen(path, "rb") orelse return false;
    _ = fclose(fp);
    return true;
}

fn copyFile(src: [*:0]const u8, dst: [*:0]const u8) bool {
    const in = fopen(src, "rb") orelse return false;
    defer _ = fclose(in);
    const out = fopen(dst, "wb") orelse return false;
    defer _ = fclose(out);

    var buf: [8192]u8 = undefined;
    while (true) {
        const n = fread(&buf, 1, buf.len, in);
        if (n == 0) break;
        if (fwrite(&buf, 1, n, out) != n) return false;
    }
    return true;
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

fn runSimulate(allocator: std.mem.Allocator, csv_path: [*:0]const u8, threshold: f64, capital: f64) !void {
    std.debug.print("Simulate mode (LiveLoop): loading {s}...\n", .{csv_path});
    const ticks = try loadCSV(allocator, csv_path);
    defer allocator.free(ticks);

    if (ticks.len == 0) {
        std.debug.print("No ticks loaded.\n", .{});
        return;
    }
    std.debug.print("Loaded {d} ticks (${d:.2} - ${d:.2})\n", .{ ticks.len, ticks[0].price, ticks[ticks.len - 1].price });

    var strategy = try Strategy.init(allocator, .{
        .threshold = threshold,
        .initial_capital = capital,
    });
    defer strategy.deinit(allocator);
    strategy.suppress_entry = true;

    // SimExchange: instant fills (fill_delay=0), no slippage
    var sim = sim_exchange_mod.SimExchange{ .fill_delay = 0 };
    const ex = sim.exchange();
    var loop = live_loop_mod.LiveLoop.init(&strategy, ex, null);

    // Load funding rates if available
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

    if (getenv("FUNDING_SKIP_THRESHOLD")) |ptr| {
        const val = std.mem.sliceTo(ptr, 0);
        strategy.funding_skip_threshold = std.fmt.parseFloat(f64, val) catch 0.0001;
    }

    // Warmup
    const warmup_n = @min(strategy.ma_period, ticks.len);
    strategy.warmup = true;
    for (ticks[0..warmup_n]) |tick_item| {
        _ = strategy.processTick(tick_item);
    }
    strategy.warmup = false;
    std.debug.print("Warmup: {d} ticks, regime={s}\n", .{
        warmup_n,
        switch (strategy.regime) {
            .bull => "BULL",
            .sideways => "SIDE",
            .bear => "BEAR",
        },
    });
    std.debug.print("Funding filter: threshold={d:.4}%, rates={d}\n\n", .{
        strategy.funding_skip_threshold * 100,
        funding_rates.items.len,
    });

    // Funding rate sliding window
    const FUNDING_WINDOW: f64 = 24.0 * 3600.0;
    var fr_start: usize = 0;
    var fr_end: usize = 0;
    var fr_sum: f64 = 0;
    var fr_count: usize = 0;

    for (ticks[warmup_n..]) |tick_item| {
        // Update funding rate
        const window_start = tick_item.timestamp - FUNDING_WINDOW;
        while (fr_end < funding_rates.items.len and funding_rates.items[fr_end].timestamp <= tick_item.timestamp) {
            fr_sum += funding_rates.items[fr_end].rate;
            fr_count += 1;
            fr_end += 1;
        }
        while (fr_start < fr_end and funding_rates.items[fr_start].timestamp < window_start) {
            fr_sum -= funding_rates.items[fr_start].rate;
            fr_count -= 1;
            fr_start += 1;
        }
        if (fr_count > 0) {
            strategy.funding_avg = fr_sum / @as(f64, @floatFromInt(fr_count));
            strategy.funding_avg_updated_at = tick_item.timestamp;
            strategy.funding_latest_time = funding_rates.items[fr_end - 1].timestamp;
        }

        // Set SimExchange price so fills use market price
        sim.last_price = tick_item.price;
        sim.advanceTick();

        loop.processTick(tick_item);
    }

    // Print results
    const total_pnl = strategy.capital - strategy.initial_capital;
    const bh_return = (ticks[ticks.len - 1].price - ticks[0].price) / ticks[0].price * 100.0;
    std.debug.print("=== LiveLoop Simulate Results ===\n", .{});
    std.debug.print("  PnL:        ${d:.2}\n", .{total_pnl});
    std.debug.print("  Return:     {d:.2}%\n", .{total_pnl / strategy.initial_capital * 100.0});
    std.debug.print("  Buy&Hold:   {d:.2}%\n", .{bh_return});
    std.debug.print("  Trades:     {d}\n", .{loop.closed_count});
    std.debug.print("  Buys sub:   {d} filled: {d}\n", .{ loop.buys_submitted, loop.buys_filled });
    std.debug.print("  Sells sub:  {d} filled: {d}\n", .{ loop.sells_submitted, loop.sells_filled });
    std.debug.print("  Cancels:    {d}\n", .{loop.cancels_issued});
    std.debug.print("  Capital:    ${d:.2}\n", .{strategy.capital});
    std.debug.print("  Pending:    {d}\n", .{loop.pending_count});
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
        switch (strategy.regime) {
            .bull => "BULL",
            .sideways => "SIDE",
            .bear => "BEAR",
        },
        warmup_n,
    });
    std.debug.print("Funding filter: threshold={d:.4}%, rates={d}\n\n", .{
        strategy.funding_skip_threshold * 100,
        funding_rates.items.len,
    });

    // Compute 24h avg funding rate for each tick (sliding window, matches Python)
    const FUNDING_WINDOW: f64 = 24.0 * 3600.0; // 24h in seconds
    var fr_start: usize = 0; // start of window
    var fr_end: usize = 0; // end of window (exclusive)
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
            strategy.funding_avg_updated_at = tick_item.timestamp;
            strategy.funding_latest_time = funding_rates.items[fr_end - 1].timestamp;
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
