/// Turso/libsql HTTP client — native HTTP, no curl dependency.
const std = @import("std");
const types = @import("types.zig");
const http_mod = @import("http_client.zig");
const resource_monitor = @import("resource_monitor.zig");
const HttpClient = http_mod.HttpClient;
const Trade = types.Trade;

extern "c" fn getenv(name: [*:0]const u8) ?[*:0]const u8;
extern "c" fn fopen(path: [*:0]const u8, mode: [*:0]const u8) ?*anyopaque;
extern "c" fn fclose(fp: *anyopaque) c_int;
extern "c" fn fread(buf: [*]u8, size: usize, count: usize, fp: *anyopaque) usize;
extern "c" fn fwrite(buf: [*]const u8, size: usize, count: usize, fp: *anyopaque) usize;
extern "c" fn fseek(fp: *anyopaque, offset: c_long, whence: c_int) c_int;
extern "c" fn ftell(fp: *anyopaque) c_long;

pub const Turso = struct {
    url: []const u8, // full pipeline URL: https://host/v2/pipeline
    token: []const u8,
    auth_header: []const u8, // "Bearer <token>"
    http: *HttpClient,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, http: *HttpClient) ?Turso {
        const url_ptr = getenv("TURSO_URL") orelse {
            std.debug.print("  [turso] TURSO_URL not set, DB logging disabled.\n", .{});
            return null;
        };
        const token_ptr = getenv("TURSO_TOKEN") orelse {
            std.debug.print("  [turso] TURSO_TOKEN not set, DB logging disabled.\n", .{});
            return null;
        };
        var url = std.mem.sliceTo(url_ptr, 0);
        const token = std.mem.sliceTo(token_ptr, 0);

        if (std.mem.startsWith(u8, url, "libsql://")) {
            url = url["libsql://".len..];
        } else if (std.mem.startsWith(u8, url, "https://")) {
            url = url["https://".len..];
        }

        // Build pipeline URL
        var url_buf: [256]u8 = undefined;
        const full_url = std.fmt.bufPrint(&url_buf, "https://{s}/v2/pipeline", .{url}) catch {
            std.debug.print("  [turso] URL too long.\n", .{});
            return null;
        };
        const stable_url = allocator.alloc(u8, full_url.len) catch return null;
        @memcpy(stable_url, full_url);

        // Build auth header
        var auth_buf: [512]u8 = undefined;
        const auth = std.fmt.bufPrint(&auth_buf, "Bearer {s}", .{token}) catch return null;
        const stable_auth = allocator.alloc(u8, auth.len) catch return null;
        @memcpy(stable_auth, auth);

        return .{ .url = stable_url, .token = token, .auth_header = stable_auth, .http = http, .allocator = allocator };
    }

    fn headers(self: *const Turso) [2]HttpClient.Header {
        return .{
            .{ .name = "authorization", .value = self.auth_header },
            .{ .name = "content-type", .value = "application/json" },
        };
    }

    /// Create/migrate tables (blocking, idempotent).
    pub fn createTables(self: *const Turso) void {
        // Core tables (equity_log + bot_status are permanent)
        const sql_core =
            \\{"requests": [
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS equity_log (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp REAL, tick_count INTEGER, capital REAL, equity REAL, unrealized REAL, regime TEXT, price REAL, created_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS bot_status (id INTEGER PRIMARY KEY CHECK (id = 1), status TEXT, last_tick REAL, tick_count INTEGER, regime TEXT, in_position INTEGER, entry_price REAL, equity REAL, capital REAL, unrealized REAL, price REAL, uptime_start REAL, version TEXT, trading_symbol TEXT DEFAULT 'BTC/USD', base_asset TEXT DEFAULT 'BTC', quote_asset TEXT DEFAULT 'USD', mark_symbol TEXT DEFAULT 'BTCUSDT', checkpoint_health TEXT DEFAULT 'OK', checkpoint_error TEXT DEFAULT '', exchange_health TEXT DEFAULT 'OK', exchange_error TEXT DEFAULT '', resource_health TEXT DEFAULT 'OK', resource_error TEXT DEFAULT '', resource_rss_mb REAL DEFAULT 0, resource_disk_free_mb REAL DEFAULT 0, resource_disk_used_pct REAL DEFAULT 0, resource_feed_gap_sec REAL DEFAULT 0, resource_ws_lag_sec REAL DEFAULT 0, resource_http_errors INTEGER DEFAULT 0, resource_http_max_ms REAL DEFAULT 0, updated_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS checkpoint_backups (id INTEGER PRIMARY KEY CHECK (id = 1), path TEXT NOT NULL, data_base64 TEXT NOT NULL, byte_len INTEGER NOT NULL, checksum TEXT NOT NULL DEFAULT '', tick_count INTEGER NOT NULL, updated_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS resource_log (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp REAL NOT NULL, uptime_sec REAL NOT NULL, rss_mb REAL NOT NULL, cpu_sec REAL NOT NULL, disk_path TEXT NOT NULL, disk_free_mb REAL NOT NULL, disk_used_pct REAL NOT NULL, ticks_per_min REAL NOT NULL, feed_gap_sec REAL NOT NULL, ws_lag_sec REAL NOT NULL, reconnect_count INTEGER NOT NULL, http_requests INTEGER NOT NULL, http_errors INTEGER NOT NULL, http_retries INTEGER NOT NULL, http_last_ms REAL NOT NULL, http_max_ms REAL NOT NULL, resource_health TEXT NOT NULL, resource_error TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE INDEX IF NOT EXISTS idx_resource_log_timestamp ON resource_log(timestamp)"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE INDEX IF NOT EXISTS idx_equity_log_timestamp ON equity_log(timestamp)"}}
            \\]}
        ;
        // Double-entry tables (TigerBeetle-inspired)
        const sql_acct =
            \\{"requests": [
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, ledger INTEGER NOT NULL, code INTEGER NOT NULL, debits_pending REAL NOT NULL DEFAULT 0, debits_posted REAL NOT NULL DEFAULT 0, credits_pending REAL NOT NULL DEFAULT 0, credits_posted REAL NOT NULL DEFAULT 0, flags INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS transfers (id INTEGER PRIMARY KEY AUTOINCREMENT, debit_account_id INTEGER NOT NULL REFERENCES accounts(id), credit_account_id INTEGER NOT NULL REFERENCES accounts(id), amount REAL NOT NULL, pending_id INTEGER REFERENCES transfers(id), code INTEGER NOT NULL, flags INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'posted', user_data TEXT, price REAL NOT NULL DEFAULT 0, size REAL NOT NULL DEFAULT 0, timestamp REAL NOT NULL, created_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status)"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE INDEX IF NOT EXISTS idx_transfers_pending_id ON transfers(pending_id)"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE INDEX IF NOT EXISTS idx_transfers_code ON transfers(code)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (1, 'cash', 1, 1001)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (2, 'btc_position', 2, 1002)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (3, 'fees', 1, 2001)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (4, 'equity', 1, 3001)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (5, 'pnl', 1, 4001)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (6, 'bnb', 3, 1003)"}}
            \\]}
        ;
        const core_ok = self.execSync(sql_core);
        const acct_ok = self.execSync(sql_acct);
        // Migration: add order_id column (silent — ignore duplicate column error)
        const sql_migrate =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE transfers ADD COLUMN order_id TEXT"}}]}
        ;
        self.execSyncSilent(sql_migrate);
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN trading_symbol TEXT DEFAULT 'BTC/USD'"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN base_asset TEXT DEFAULT 'BTC'"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN quote_asset TEXT DEFAULT 'USD'"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN mark_symbol TEXT DEFAULT 'BTCUSDT'"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN checkpoint_health TEXT DEFAULT 'OK'"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN checkpoint_error TEXT DEFAULT ''"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN exchange_health TEXT DEFAULT 'OK'"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN exchange_error TEXT DEFAULT ''"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN resource_health TEXT DEFAULT 'OK'"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN resource_error TEXT DEFAULT ''"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN resource_rss_mb REAL DEFAULT 0"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN resource_disk_free_mb REAL DEFAULT 0"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN resource_disk_used_pct REAL DEFAULT 0"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN resource_feed_gap_sec REAL DEFAULT 0"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN resource_ws_lag_sec REAL DEFAULT 0"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN resource_http_errors INTEGER DEFAULT 0"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE bot_status ADD COLUMN resource_http_max_ms REAL DEFAULT 0"}}]}
        );
        self.execSyncSilent(
            \\{"requests": [{"type": "execute", "stmt": {"sql": "ALTER TABLE checkpoint_backups ADD COLUMN checksum TEXT NOT NULL DEFAULT ''"}}]}
        );
        if (core_ok and acct_ok) {
            std.debug.print("  [turso] Tables ready.\n", .{});
        } else {
            std.debug.print("  [turso] WARNING: Table creation may have failed.\n", .{});
        }
    }

    /// Query latest capital from equity_log (blocking, fallback for startup).
    pub fn queryLatestCapital(self: *const Turso) ?f64 {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT capital FROM equity_log ORDER BY id DESC LIMIT 1"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        return parseFirstValueFloat(resp.body);
    }

    /// Log equity snapshot (async).
    pub fn logEquity(self: *const Turso, timestamp: f64, tick_count: u64, capital: f64, equity: f64, unrealized: f64, regime: []const u8, price: f64) void {
        var buf: [1024]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "INSERT INTO equity_log (timestamp, tick_count, capital, equity, unrealized, regime, price) VALUES ({d:.6}, {d}, {d:.2}, {d:.2}, {d:.2}, '{s}', {d:.2})"}}}}]}}
        , .{ timestamp, tick_count, capital, equity, unrealized, regime, price }) catch return;
        self.execAsync(sql);
    }

    /// Log process/feed/HTTP resource health (async).
    pub fn logResource(self: *const Turso, sample: resource_monitor.ResourceSample, health: []const u8, detail: []const u8) void {
        var buf: [4096]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [
            \\  {{"type": "execute", "stmt": {{"sql": "INSERT INTO resource_log (timestamp, uptime_sec, rss_mb, cpu_sec, disk_path, disk_free_mb, disk_used_pct, ticks_per_min, feed_gap_sec, ws_lag_sec, reconnect_count, http_requests, http_errors, http_retries, http_last_ms, http_max_ms, resource_health, resource_error) VALUES ({d:.6}, {d:.2}, {d:.2}, {d:.2}, '{s}', {d:.2}, {d:.2}, {d:.2}, {d:.2}, {d:.2}, {d}, {d}, {d}, {d}, {d:.2}, {d:.2}, '{s}', '{s}')"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE bot_status SET resource_health='{s}', resource_error='{s}', resource_rss_mb={d:.2}, resource_disk_free_mb={d:.2}, resource_disk_used_pct={d:.2}, resource_feed_gap_sec={d:.2}, resource_ws_lag_sec={d:.2}, resource_http_errors={d}, resource_http_max_ms={d:.2}, updated_at=datetime('now') WHERE id=1"}}}}
            \\]}}
        , .{
            sample.timestamp,
            sample.uptime_sec,
            sample.rss_mb,
            sample.cpu_sec,
            sample.disk_path,
            sample.disk_free_mb,
            sample.disk_used_pct,
            sample.ticks_per_min,
            sample.feed_gap_sec,
            sample.ws_lag_sec,
            sample.reconnect_count,
            sample.http_requests,
            sample.http_errors,
            sample.http_retries,
            sample.http_last_ms,
            sample.http_max_ms,
            health,
            detail,
            health,
            detail,
            sample.rss_mb,
            sample.disk_free_mb,
            sample.disk_used_pct,
            sample.feed_gap_sec,
            sample.ws_lag_sec,
            sample.http_errors,
            sample.http_max_ms,
        }) catch return;
        self.execAsync(sql);
    }

    /// Upsert bot status (async, every tick).
    pub fn upsertStatus(self: *const Turso, last_tick: f64, tick_count: u64, regime: []const u8, in_position: bool, entry_price: f64, equity: f64, capital: f64, unrealized: f64, price: f64, uptime_start: f64, instance: []const u8, trading_symbol: []const u8, base_asset: []const u8, quote_asset: []const u8, mark_symbol: []const u8, checkpoint_health: []const u8, checkpoint_error: []const u8, exchange_health: []const u8, exchange_error: []const u8) void {
        var buf: [8192]u8 = undefined;
        var ver_buf: [64]u8 = undefined;
        const ver = std.fmt.bufPrint(&ver_buf, "DCTRADE5@{s}", .{instance}) catch "DCTRADE5";
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "INSERT INTO bot_status (id, status, last_tick, tick_count, regime, in_position, entry_price, equity, capital, unrealized, price, uptime_start, version, trading_symbol, base_asset, quote_asset, mark_symbol, checkpoint_health, checkpoint_error, exchange_health, exchange_error) VALUES (1, 'RUNNING', {d:.6}, {d}, '{s}', {d}, {d:.8}, {d:.2}, {d:.2}, {d:.2}, {d:.2}, {d:.6}, '{s}', '{s}', '{s}', '{s}', '{s}', '{s}', '{s}', '{s}', '{s}') ON CONFLICT(id) DO UPDATE SET status=excluded.status, last_tick=excluded.last_tick, tick_count=excluded.tick_count, regime=excluded.regime, in_position=excluded.in_position, entry_price=excluded.entry_price, equity=excluded.equity, capital=excluded.capital, unrealized=excluded.unrealized, price=excluded.price, version=excluded.version, trading_symbol=excluded.trading_symbol, base_asset=excluded.base_asset, quote_asset=excluded.quote_asset, mark_symbol=excluded.mark_symbol, checkpoint_health=excluded.checkpoint_health, checkpoint_error=excluded.checkpoint_error, exchange_health=excluded.exchange_health, exchange_error=excluded.exchange_error, updated_at=datetime('now')"}}}}]}}
        , .{
            last_tick,
            tick_count,
            regime,
            @as(u8, if (in_position) 1 else 0),
            entry_price,
            equity,
            capital,
            unrealized,
            price,
            uptime_start,
            ver,
            trading_symbol,
            base_asset,
            quote_asset,
            mark_symbol,
            checkpoint_health,
            checkpoint_error,
            exchange_health,
            exchange_error,
        }) catch return;
        self.execAsync(sql);
    }

    /// Set bot status to STOPPED (sync — must complete before exit).
    pub fn setStatusStopped(self: *const Turso) void {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "UPDATE bot_status SET status='STOPPED', updated_at=datetime('now') WHERE id=1"}}
            \\]}
        ;
        _ = self.execSync(sql);
    }

    pub fn backupCheckpointFile(self: *const Turso, path: [*:0]const u8, tick_count: u64, wait: bool) bool {
        const bytes = readFileAlloc(self.allocator, path) orelse return false;
        defer self.allocator.free(bytes);

        const encoded_len = std.base64.standard.Encoder.calcSize(bytes.len);
        const encoded = self.allocator.alloc(u8, encoded_len) catch return false;
        defer self.allocator.free(encoded);
        _ = std.base64.standard.Encoder.encode(encoded, bytes);

        const path_slice = std.mem.sliceTo(path, 0);
        const checksum = std.hash.Wyhash.hash(0, bytes);
        const sql = std.fmt.allocPrint(self.allocator,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "INSERT INTO checkpoint_backups (id, path, data_base64, byte_len, checksum, tick_count, updated_at) VALUES (1, '{s}', '{s}', {d}, '{x}', {d}, datetime('now')) ON CONFLICT(id) DO UPDATE SET path='{s}', data_base64='{s}', byte_len={d}, checksum='{x}', tick_count={d}, updated_at=datetime('now')"}}}}]}}
        , .{ path_slice, encoded, bytes.len, checksum, tick_count, path_slice, encoded, bytes.len, checksum, tick_count }) catch return false;
        defer self.allocator.free(sql);

        if (wait) return self.execSync(sql);
        self.execAsync(sql);
        return true;
    }

    pub fn restoreCheckpointBackupToFile(self: *const Turso, path: [*:0]const u8) bool {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT byte_len, checksum, data_base64 FROM checkpoint_backups WHERE id = 1"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return false;
        defer resp.deinit();
        if (std.mem.indexOf(u8, resp.body, "\"rows\":[]") != null) return false;

        const expected_len = parseFirstValueInt(resp.body) orelse return false;
        if (expected_len == 0) return false;

        const checksum_text = parseValueStringAlloc(self.allocator, resp.body, 1) orelse return false;
        defer self.allocator.free(checksum_text);
        const expected_checksum = std.fmt.parseInt(u64, checksum_text, 16) catch return false;

        const encoded = parseValueStringAlloc(self.allocator, resp.body, 2) orelse return false;
        defer self.allocator.free(encoded);

        const decoded_len = std.base64.standard.Decoder.calcSizeForSlice(encoded) catch return false;
        if (decoded_len != expected_len) return false;

        const decoded = self.allocator.alloc(u8, decoded_len) catch return false;
        defer self.allocator.free(decoded);
        std.base64.standard.Decoder.decode(decoded, encoded) catch return false;
        if (std.hash.Wyhash.hash(0, decoded) != expected_checksum) return false;

        return writeFile(path, decoded);
    }

    // === Double-Entry Accounting (TigerBeetle-inspired) ===

    // Account IDs (match seeded accounts)
    pub const ACCT_CASH: u8 = 1;
    pub const ACCT_BTC: u8 = 2;
    pub const ACCT_FEES: u8 = 3;
    pub const ACCT_EQUITY: u8 = 4;
    pub const ACCT_PNL: u8 = 5;
    pub const ACCT_BNB: u8 = 6;

    // Transfer codes
    pub const CODE_DEPOSIT: u8 = 1;
    pub const CODE_BUY: u8 = 2;
    pub const CODE_SELL: u8 = 3;
    pub const CODE_FEE: u8 = 4;
    pub const CODE_PNL: u8 = 5;

    // Transfer flags
    pub const FLAG_PENDING: u8 = 1;
    pub const FLAG_POST_PENDING: u8 = 2;
    pub const FLAG_VOID_PENDING: u8 = 4;

    /// Create a posted transfer + update account balances atomically (async).
    /// TigerBeetle convention: debit_account receives credits, credit_account receives debits.
    pub fn createPostedTransfer(self: *const Turso, debit_acct: u8, credit_acct: u8, amount: f64, code: u8, user_data: []const u8, timestamp: f64, price: f64, qty: f64) void {
        var buf: [2048]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [
            \\  {{"type": "execute", "stmt": {{"sql": "BEGIN"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "INSERT INTO transfers (debit_account_id, credit_account_id, amount, code, flags, status, user_data, price, size, timestamp) VALUES ({d}, {d}, {d:.8}, {d}, 0, 'posted', '{s}', {d:.8}, {d:.8}, {d:.6})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET credits_posted = credits_posted + {d:.8} WHERE id = {d}"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET debits_posted = debits_posted + {d:.8} WHERE id = {d}"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "COMMIT"}}}}
            \\]}}
        , .{ debit_acct, credit_acct, amount, code, user_data, price, qty, timestamp, amount, debit_acct, amount, credit_acct }) catch return;
        self.execAsync(sql);
    }

    /// Create a pending transfer + reserve balances atomically (sync, returns transfer ID).
    /// TigerBeetle convention: debit_account receives credits, credit_account receives debits.
    pub fn createPendingTransfer(self: *const Turso, debit_acct: u8, credit_acct: u8, amount: f64, code: u8, user_data: []const u8, timestamp: f64, price: f64, qty: f64, order_id: []const u8) ?u32 {
        var buf: [2048]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [
            \\  {{"type": "execute", "stmt": {{"sql": "BEGIN"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "INSERT INTO transfers (debit_account_id, credit_account_id, amount, code, flags, status, user_data, price, size, timestamp, order_id) VALUES ({d}, {d}, {d:.8}, {d}, 1, 'pending', '{s}', {d:.8}, {d:.8}, {d:.6}, '{s}') RETURNING id"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET credits_pending = credits_pending + {d:.8} WHERE id = {d}"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET debits_pending = debits_pending + {d:.8} WHERE id = {d}"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "COMMIT"}}}}
            \\]}}
        , .{ debit_acct, credit_acct, amount, code, user_data, price, qty, timestamp, order_id, amount, debit_acct, amount, credit_acct }) catch return null;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        return parseTransferId(resp.body);
    }

    /// Post a pending transfer — append settlement record + move pending → posted balances (async).
    /// Original pending transfer stays immutable. New row references it via pending_id.
    pub fn postTransfer(self: *const Turso, pending_id: u32) void {
        var buf: [4096]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [
            \\  {{"type": "execute", "stmt": {{"sql": "BEGIN"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "INSERT INTO transfers (debit_account_id, credit_account_id, amount, pending_id, code, flags, status, user_data, price, size, timestamp) SELECT debit_account_id, credit_account_id, amount, id, code, 2, 'posted', user_data, price, size, timestamp FROM transfers WHERE id = {d} AND status = 'pending'"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET credits_pending = credits_pending - (SELECT amount FROM transfers WHERE id = {d}), credits_posted = credits_posted + (SELECT amount FROM transfers WHERE id = {d}) WHERE id = (SELECT debit_account_id FROM transfers WHERE id = {d})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET debits_pending = debits_pending - (SELECT amount FROM transfers WHERE id = {d}), debits_posted = debits_posted + (SELECT amount FROM transfers WHERE id = {d}) WHERE id = (SELECT credit_account_id FROM transfers WHERE id = {d})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "COMMIT"}}}}
            \\]}}
        , .{ pending_id, pending_id, pending_id, pending_id, pending_id, pending_id, pending_id }) catch return;
        self.execAsync(sql);
    }
    /// Post a pending transfer with actual fill data — append settlement record with corrected price/size/amount.
    /// Original pending transfer stays immutable. New row has actual exchange fill values.
    pub fn postTransferWithFill(self: *const Turso, pending_id: u32, actual_amount: f64, actual_price: f64, actual_size: f64, user_data: []const u8) void {
        var buf: [4096]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [
            \\  {{"type": "execute", "stmt": {{"sql": "BEGIN"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "INSERT INTO transfers (debit_account_id, credit_account_id, amount, pending_id, code, flags, status, user_data, price, size, timestamp) SELECT debit_account_id, credit_account_id, {d:.8}, id, code, 2, 'posted', '{s}', {d:.8}, {d:.8}, timestamp FROM transfers WHERE id = {d} AND status = 'pending'"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET credits_pending = credits_pending - (SELECT amount FROM transfers WHERE id = {d}), credits_posted = credits_posted + {d:.8} WHERE id = (SELECT debit_account_id FROM transfers WHERE id = {d})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET debits_pending = debits_pending - (SELECT amount FROM transfers WHERE id = {d}), debits_posted = debits_posted + {d:.8} WHERE id = (SELECT credit_account_id FROM transfers WHERE id = {d})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "COMMIT"}}}}
            \\]}}
        , .{ actual_amount, user_data, actual_price, actual_size, pending_id, pending_id, actual_amount, pending_id, pending_id, actual_amount, pending_id }) catch return;
        self.execAsync(sql);
    }

    /// Void a pending transfer — append void record + release reserved balances (sync).
    /// Original pending transfer stays immutable. New row references it via pending_id.
    pub fn voidTransfer(self: *const Turso, pending_id: u32) void {
        var buf: [4096]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [
            \\  {{"type": "execute", "stmt": {{"sql": "BEGIN"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "INSERT INTO transfers (debit_account_id, credit_account_id, amount, pending_id, code, flags, status, user_data, price, size, timestamp) SELECT debit_account_id, credit_account_id, amount, id, code, 4, 'voided', user_data, price, size, timestamp FROM transfers WHERE id = {d} AND status = 'pending'"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET credits_pending = credits_pending - (SELECT amount FROM transfers WHERE id = {d}) WHERE id = (SELECT debit_account_id FROM transfers WHERE id = {d})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET debits_pending = debits_pending - (SELECT amount FROM transfers WHERE id = {d}) WHERE id = (SELECT credit_account_id FROM transfers WHERE id = {d})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "COMMIT"}}}}
            \\]}}
        , .{ pending_id, pending_id, pending_id, pending_id, pending_id }) catch return;
        _ = self.execSync(sql);
    }

    /// Query unresolved pending transfers for startup reconciliation (blocking).
    /// Returns the first pending transfer that has no post/void settlement row.
    /// Caller must check the order_id against the exchange to resolve.
    pub const PendingTransferInfo = struct {
        transfer_id: u32,
        order_id: [64]u8 = undefined,
        order_id_len: usize = 0,
        code: u8 = 0,
        amount: f64 = 0,
        price: f64 = 0,
        size: f64 = 0,
    };

    pub fn queryPendingOrder(self: *const Turso) ?PendingTransferInfo {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT id, order_id, code, amount, price, size FROM transfers WHERE status = 'pending' AND order_id IS NOT NULL AND id NOT IN (SELECT pending_id FROM transfers WHERE pending_id IS NOT NULL) LIMIT 1"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        if (std.mem.indexOf(u8, resp.body, "\"rows\":[]") != null) return null;

        // Parse values from first row: id, order_id, code, amount, price, size
        const r = resp.body;
        const vkey = "\"value\":";
        var info: PendingTransferInfo = .{ .transfer_id = 0 };
        var search_pos: usize = 0;
        var col: usize = 0;
        while (col < 6) : (col += 1) {
            const vpos = std.mem.indexOf(u8, r[search_pos..], vkey) orelse break;
            var pos = search_pos + vpos + vkey.len;
            if (pos < r.len and r[pos] == '"') {
                pos += 1;
                const end = std.mem.indexOf(u8, r[pos..], "\"") orelse break;
                const val = r[pos..][0..end];
                switch (col) {
                    0 => info.transfer_id = std.fmt.parseInt(u32, val, 10) catch 0,
                    1 => {
                        const len = @min(val.len, info.order_id.len);
                        @memcpy(info.order_id[0..len], val[0..len]);
                        info.order_id_len = len;
                    },
                    2 => info.code = std.fmt.parseInt(u8, val, 10) catch 0,
                    3 => info.amount = std.fmt.parseFloat(f64, val) catch 0,
                    4 => info.price = std.fmt.parseFloat(f64, val) catch 0,
                    5 => info.size = std.fmt.parseFloat(f64, val) catch 0,
                    else => {},
                }
                search_pos = pos + end + 1;
            } else {
                var end = pos;
                while (end < r.len and r[end] != ',' and r[end] != '}') : (end += 1) {}
                const val = r[pos..end];
                switch (col) {
                    0 => info.transfer_id = std.fmt.parseInt(u32, val, 10) catch 0,
                    2 => info.code = std.fmt.parseInt(u8, val, 10) catch 0,
                    3 => info.amount = std.fmt.parseFloat(f64, val) catch 0,
                    4 => info.price = std.fmt.parseFloat(f64, val) catch 0,
                    5 => info.size = std.fmt.parseFloat(f64, val) catch 0,
                    else => {},
                }
                search_pos = end;
            }
        }
        if (info.transfer_id == 0) return null;
        return info;
    }

    /// Query account balance: credits_posted - debits_posted (blocking).
    pub fn queryAccountBalance(self: *const Turso, account_id: u8) ?f64 {
        var buf: [256]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "SELECT credits_posted - debits_posted as balance FROM accounts WHERE id = {d}"}}}}]}}
        , .{account_id}) catch return null;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        return parseFirstValueFloat(resp.body);
    }

    /// Query account debits_posted (blocking). Used for deposit detection on equity account.
    pub fn queryAccountDebitsPosted(self: *const Turso, account_id: u8) ?f64 {
        var buf: [256]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "SELECT debits_posted FROM accounts WHERE id = {d}"}}}}]}}
        , .{account_id}) catch return null;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        return parseFirstValueFloat(resp.body);
    }

    /// Query total deposits from transfers table (blocking).
    pub fn queryTotalDepositsNew(self: *const Turso) ?f64 {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT COALESCE(SUM(amount), 0) FROM transfers WHERE code = 1 AND status = 'posted'"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        return parseFirstValueFloat(resp.body);
    }

    /// Query open position from latest buy transfer (blocking).
    /// Reads price/size columns directly.
    pub fn queryOpenPositionNew(self: *const Turso) ?struct { entry_price: f64, entry_time: f64, size: f64, fee: f64 } {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT price, timestamp, size FROM transfers WHERE code = 2 AND status = 'posted' ORDER BY id DESC LIMIT 1"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        const r = resp.body;
        if (std.mem.indexOf(u8, r, "\"rows\":[]") != null) return null;

        // Parse 3 values: price, timestamp, size
        const rows_pos = std.mem.indexOf(u8, r, "\"rows\":") orelse return null;
        var pos = rows_pos;
        var values: [3]f64 = .{ 0, 0, 0 };
        var vi: usize = 0;
        while (vi < 3 and pos < r.len) {
            const vkey = "\"value\":";
            const vpos = std.mem.indexOf(u8, r[pos..], vkey) orelse break;
            pos = pos + vpos + vkey.len;
            if (pos < r.len and r[pos] == '"') {
                pos += 1;
                const end = std.mem.indexOf(u8, r[pos..], "\"") orelse break;
                values[vi] = std.fmt.parseFloat(f64, r[pos..][0..end]) catch 0;
                pos += end + 1;
            } else {
                var end = pos;
                while (end < r.len and r[end] != ',' and r[end] != '}') : (end += 1) {}
                values[vi] = std.fmt.parseFloat(f64, r[pos..end]) catch 0;
                pos = end;
            }
            vi += 1;
        }
        if (values[0] == 0) return null;
        std.debug.print("  [turso] Found position from transfers: entry=${d:.2} size={d:.8}\n", .{ values[0], values[2] });
        return .{ .entry_price = values[0], .entry_time = values[1], .size = values[2], .fee = 0 };
    }

    /// Query closed trade count from transfers (blocking).
    pub fn queryTradeCountNew(self: *const Turso) ?u32 {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT COUNT(*) FROM transfers WHERE code = 3 AND status = 'posted'"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        return parseFirstValueInt(resp.body);
    }

    /// Parse a float from a JSON-like string: "key":value or "key":"value"
    pub fn parseJsonFloat(json: []const u8, key: []const u8) ?f64 {
        const kpos = std.mem.indexOf(u8, json, key) orelse return null;
        var pos = kpos + key.len;
        if (pos < json.len and json[pos] == '"') {
            pos += 1;
            const end = std.mem.indexOf(u8, json[pos..], "\"") orelse return null;
            return std.fmt.parseFloat(f64, json[pos..][0..end]) catch null;
        } else {
            var end = pos;
            while (end < json.len and json[end] != ',' and json[end] != '}') : (end += 1) {}
            return std.fmt.parseFloat(f64, json[pos..end]) catch null;
        }
    }

    /// Parse transfer ID from Turso pipeline response containing RETURNING id.
    /// The ID is in the second result (index 1) of the pipeline response.
    pub fn parseTransferId(r: []const u8) ?u32 {
        // Find the second "rows" occurrence (first is from BEGIN which has empty rows)
        const first_rows = std.mem.indexOf(u8, r, "\"rows\":") orelse return null;
        const after_first = first_rows + 7; // skip past "rows":
        // Find the second "rows" — this is the RETURNING result
        const second_rows_rel = std.mem.indexOf(u8, r[after_first..], "\"rows\":") orelse return null;
        const second_rows = after_first + second_rows_rel;
        const after_second = second_rows + 7;
        // Check if the RETURNING result has empty rows
        if (after_second + 2 <= r.len and r[after_second] == '[' and r[after_second + 1] == ']') return null;
        // Parse the value from the RETURNING result
        const vkey = "\"value\":";
        const vpos = std.mem.indexOf(u8, r[after_second..], vkey) orelse return null;
        var pos = after_second + vpos + vkey.len;
        if (pos < r.len and r[pos] == '"') {
            pos += 1;
            const end = std.mem.indexOf(u8, r[pos..], "\"") orelse return null;
            return std.fmt.parseInt(u32, r[pos..][0..end], 10) catch null;
        } else {
            var end = pos;
            while (end < r.len and r[end] != ',' and r[end] != '}') : (end += 1) {}
            return std.fmt.parseInt(u32, r[pos..end], 10) catch null;
        }
    }

    pub fn parseValueStringAlloc(allocator: std.mem.Allocator, json: []const u8, value_index: usize) ?[]u8 {
        const vkey = "\"value\":";
        var search_pos: usize = 0;
        var seen: usize = 0;
        while (search_pos < json.len) {
            const rel = std.mem.indexOf(u8, json[search_pos..], vkey) orelse return null;
            var pos = search_pos + rel + vkey.len;
            if (seen == value_index) {
                if (pos >= json.len or json[pos] != '"') return null;
                pos += 1;
                const end = std.mem.indexOf(u8, json[pos..], "\"") orelse return null;
                return allocator.dupe(u8, json[pos..][0..end]) catch null;
            }
            seen += 1;
            search_pos = pos;
        }
        return null;
    }

    // --- Internal helpers ---

    fn execSync(self: *const Turso, json_body: []const u8) bool {
        const h = self.headers();
        const resp = self.http.post(self.url, &h, json_body) catch return false;
        defer resp.deinit();
        if (std.mem.indexOf(u8, resp.body, "\"error\"") != null) {
            std.debug.print("  [turso] Error: {s}\n", .{resp.body[0..@min(resp.body.len, 200)]});
            return false;
        }
        return true;
    }

    fn execSyncSilent(self: *const Turso, json_body: []const u8) void {
        const h = self.headers();
        const resp = self.http.post(self.url, &h, json_body) catch return;
        defer resp.deinit();
    }

    fn execSyncRead(self: *const Turso, json_body: []const u8) ?HttpClient.Response {
        const h = self.headers();
        return self.http.post(self.url, &h, json_body) catch null;
    }

    fn execAsync(self: *const Turso, json_body: []const u8) void {
        const Context = struct {
            turso: *const Turso,
            body: []u8,
        };

        var ctx = self.allocator.create(Context) catch return;
        ctx.turso = self;
        ctx.body = self.allocator.alloc(u8, json_body.len) catch {
            self.allocator.destroy(ctx);
            return;
        };
        @memcpy(ctx.body, json_body);

        const thread = std.Thread.spawn(.{}, asyncWorker, .{ ctx, self.allocator }) catch {
            self.allocator.free(ctx.body);
            self.allocator.destroy(ctx);
            return;
        };
        thread.detach();
    }

    fn asyncWorker(ctx: anytype, allocator: std.mem.Allocator) void {
        defer {
            allocator.free(ctx.body);
            allocator.destroy(ctx);
        }
        const turso: *const Turso = ctx.turso;
        _ = turso.execSync(ctx.body);
    }

    pub fn parseFirstValueFloat(r: []const u8) ?f64 {
        if (std.mem.indexOf(u8, r, "\"rows\":[]") != null) return null;
        const vkey = "\"value\":";
        const vpos = std.mem.indexOf(u8, r, vkey) orelse return null;
        var pos = vpos + vkey.len;
        if (pos < r.len and r[pos] == '"') {
            pos += 1;
            const end = std.mem.indexOf(u8, r[pos..], "\"") orelse return null;
            return std.fmt.parseFloat(f64, r[pos..][0..end]) catch null;
        } else {
            var end = pos;
            while (end < r.len and r[end] != ',' and r[end] != '}') : (end += 1) {}
            return std.fmt.parseFloat(f64, r[pos..end]) catch null;
        }
    }

    pub fn parseFirstValueInt(r: []const u8) ?u32 {
        if (std.mem.indexOf(u8, r, "\"rows\":[]") != null) return 0;
        const vkey = "\"value\":";
        const vpos = std.mem.indexOf(u8, r, vkey) orelse return null;
        var pos = vpos + vkey.len;
        if (pos < r.len and r[pos] == '"') {
            pos += 1;
            const end = std.mem.indexOf(u8, r[pos..], "\"") orelse return null;
            return std.fmt.parseInt(u32, r[pos..][0..end], 10) catch null;
        } else {
            var end = pos;
            while (end < r.len and r[end] != ',' and r[end] != '}') : (end += 1) {}
            return std.fmt.parseInt(u32, r[pos..end], 10) catch null;
        }
    }
};

fn readFileAlloc(allocator: std.mem.Allocator, path: [*:0]const u8) ?[]u8 {
    const fp = fopen(path, "rb") orelse return null;
    defer _ = fclose(fp);

    if (fseek(fp, 0, 2) != 0) return null;
    const size_raw = ftell(fp);
    if (size_raw < 0) return null;
    if (fseek(fp, 0, 0) != 0) return null;

    const size: usize = @intCast(size_raw);
    const bytes = allocator.alloc(u8, size) catch return null;
    errdefer allocator.free(bytes);
    if (fread(bytes.ptr, 1, size, fp) != size) return null;
    return bytes;
}

fn writeFile(path: [*:0]const u8, bytes: []const u8) bool {
    const fp = fopen(path, "wb") orelse return false;
    defer _ = fclose(fp);
    return fwrite(bytes.ptr, 1, bytes.len, fp) == bytes.len;
}
