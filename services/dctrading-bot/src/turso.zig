/// Turso/libsql HTTP client — native HTTP, no curl dependency.
const std = @import("std");
const types = @import("types.zig");
const http_mod = @import("http_client.zig");
const HttpClient = http_mod.HttpClient;
const Trade = types.Trade;

extern "c" fn getenv(name: [*:0]const u8) ?[*:0]const u8;

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
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS bot_status (id INTEGER PRIMARY KEY CHECK (id = 1), status TEXT, last_tick REAL, tick_count INTEGER, regime TEXT, in_position INTEGER, entry_price REAL, equity REAL, capital REAL, unrealized REAL, price REAL, uptime_start REAL, version TEXT, updated_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE INDEX IF NOT EXISTS idx_equity_log_timestamp ON equity_log(timestamp)"}}
            \\]}
        ;
        // Double-entry tables (TigerBeetle-inspired)
        const sql_acct =
            \\{"requests": [
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, ledger INTEGER NOT NULL, code INTEGER NOT NULL, debits_pending REAL NOT NULL DEFAULT 0, debits_posted REAL NOT NULL DEFAULT 0, credits_pending REAL NOT NULL DEFAULT 0, credits_posted REAL NOT NULL DEFAULT 0, flags INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS transfers (id INTEGER PRIMARY KEY AUTOINCREMENT, debit_account_id INTEGER NOT NULL REFERENCES accounts(id), credit_account_id INTEGER NOT NULL REFERENCES accounts(id), amount REAL NOT NULL, pending_id INTEGER REFERENCES transfers(id), code INTEGER NOT NULL, flags INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'posted', user_data TEXT, timestamp REAL NOT NULL, created_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status)"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE INDEX IF NOT EXISTS idx_transfers_pending_id ON transfers(pending_id)"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE INDEX IF NOT EXISTS idx_transfers_code ON transfers(code)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (1, 'cash', 1, 1001)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (2, 'btc_position', 2, 1002)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (3, 'fees', 1, 2001)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (4, 'equity', 1, 3001)"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT OR IGNORE INTO accounts (id, name, ledger, code) VALUES (5, 'pnl', 1, 4001)"}}
            \\]}
        ;
        const core_ok = self.execSync(sql_core);
        const acct_ok = self.execSync(sql_acct);
        if (core_ok and acct_ok) {
            std.debug.print("  [turso] Tables ready.\n", .{});
        } else {
            std.debug.print("  [turso] WARNING: Table creation may have failed.\n", .{});
        }
        // One-time migration: backfill old account_ledger data into transfers
        self.migrateOldData();
    }

    /// One-time migration: backfill account_ledger entries into transfers table.
    /// Idempotent: only runs if transfers is empty and account_ledger has data.
    fn migrateOldData(self: *const Turso) void {
        // Check if migration is needed: transfers empty + account_ledger exists with data
        const check_sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT (SELECT COUNT(*) FROM transfers) as t_count, (SELECT COUNT(*) FROM account_ledger) as l_count"}}]}
        ;
        const check_resp = self.execSyncRead(check_sql) orelse return;
        defer check_resp.deinit();

        // Parse both counts from the response
        const r = check_resp.body;
        const vkey = "\"value\":";
        const vpos1 = std.mem.indexOf(u8, r, vkey) orelse return;
        var pos = vpos1 + vkey.len;
        // Parse t_count
        var t_count: u32 = 0;
        if (pos < r.len and r[pos] == '"') {
            pos += 1;
            const end = std.mem.indexOf(u8, r[pos..], "\"") orelse return;
            t_count = std.fmt.parseInt(u32, r[pos..][0..end], 10) catch return;
            pos += end + 1;
        } else {
            var end = pos;
            while (end < r.len and r[end] != ',' and r[end] != '}') : (end += 1) {}
            t_count = std.fmt.parseInt(u32, r[pos..end], 10) catch return;
            pos = end;
        }
        // Parse l_count
        const vpos2 = std.mem.indexOf(u8, r[pos..], vkey) orelse return;
        pos = pos + vpos2 + vkey.len;
        var l_count: u32 = 0;
        if (pos < r.len and r[pos] == '"') {
            pos += 1;
            const end = std.mem.indexOf(u8, r[pos..], "\"") orelse return;
            l_count = std.fmt.parseInt(u32, r[pos..][0..end], 10) catch return;
        } else {
            var end = pos;
            while (end < r.len and r[end] != ',' and r[end] != '}') : (end += 1) {}
            l_count = std.fmt.parseInt(u32, r[pos..end], 10) catch return;
        }

        if (t_count > 0 or l_count == 0) {
            // Already migrated or nothing to migrate
            return;
        }

        std.debug.print("  [turso] Migrating {d} ledger entries to transfers...\n", .{l_count});

        // Migrate account_ledger entries to transfers using INSERT...SELECT
        // Map old types to new transfer codes and account pairs:
        //   DEPOSIT    → code=1, debit=cash(1), credit=equity(4)
        //   BUY        → code=2, debit=btc(2), credit=cash(1)
        //   SELL       → code=3, debit=cash(1), credit=btc(2)
        //   ENTRY_FEE  → code=4, debit=fees(3), credit=cash(1)
        //   EXIT_FEE   → code=4, debit=fees(3), credit=cash(1)
        const migrate_sql =
            \\{"requests": [
            \\  {"type": "execute", "stmt": {"sql": "BEGIN"}},
            \\  {"type": "execute", "stmt": {"sql": "INSERT INTO transfers (debit_account_id, credit_account_id, amount, code, flags, status, user_data, timestamp) SELECT CASE type WHEN 'DEPOSIT' THEN 1 WHEN 'BUY' THEN 2 WHEN 'SELL' THEN 1 WHEN 'ENTRY_FEE' THEN 3 WHEN 'EXIT_FEE' THEN 3 ELSE 1 END, CASE type WHEN 'DEPOSIT' THEN 4 WHEN 'BUY' THEN 1 WHEN 'SELL' THEN 2 WHEN 'ENTRY_FEE' THEN 1 WHEN 'EXIT_FEE' THEN 1 ELSE 1 END, ABS(amount), CASE type WHEN 'DEPOSIT' THEN 1 WHEN 'BUY' THEN 2 WHEN 'SELL' THEN 3 WHEN 'ENTRY_FEE' THEN 4 WHEN 'EXIT_FEE' THEN 4 ELSE 0 END, 0, 'posted', note, timestamp FROM account_ledger ORDER BY id ASC"}},
            \\  {"type": "execute", "stmt": {"sql": "UPDATE accounts SET credits_posted = COALESCE((SELECT SUM(amount) FROM transfers WHERE debit_account_id = accounts.id AND status = 'posted'), 0), debits_posted = COALESCE((SELECT SUM(amount) FROM transfers WHERE credit_account_id = accounts.id AND status = 'posted'), 0)"}},
            \\  {"type": "execute", "stmt": {"sql": "COMMIT"}}
            \\]}
        ;
        if (self.execSync(migrate_sql)) {
            std.debug.print("  [turso] Migration complete.\n", .{});
        } else {
            std.debug.print("  [turso] WARNING: Migration may have failed.\n", .{});
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

    /// Upsert bot status (async, every tick).
    pub fn upsertStatus(self: *const Turso, last_tick: f64, tick_count: u64, regime: []const u8, in_position: bool, entry_price: f64, equity: f64, capital: f64, unrealized: f64, price: f64, uptime_start: f64, instance: []const u8) void {
        var buf: [2048]u8 = undefined;
        var ver_buf: [64]u8 = undefined;
        const ver = std.fmt.bufPrint(&ver_buf, "DCTRADE4@{s}", .{instance}) catch "DCTRADE4";
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "INSERT INTO bot_status (id, status, last_tick, tick_count, regime, in_position, entry_price, equity, capital, unrealized, price, uptime_start, version) VALUES (1, 'RUNNING', {d:.6}, {d}, '{s}', {d}, {d:.8}, {d:.2}, {d:.2}, {d:.2}, {d:.2}, {d:.6}, '{s}') ON CONFLICT(id) DO UPDATE SET status='RUNNING', last_tick={d:.6}, tick_count={d}, regime='{s}', in_position={d}, entry_price={d:.8}, equity={d:.2}, capital={d:.2}, unrealized={d:.2}, price={d:.2}, version='{s}', updated_at=datetime('now')"}}}}]}}
        , .{
            last_tick, tick_count, regime, @as(u8, if (in_position) 1 else 0), entry_price, equity, capital, unrealized, price, uptime_start, ver,
            last_tick, tick_count, regime, @as(u8, if (in_position) 1 else 0), entry_price, equity, capital, unrealized, price, ver,
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


    // === Double-Entry Accounting (TigerBeetle-inspired) ===

    // Account IDs (match seeded accounts)
    pub const ACCT_CASH: u8 = 1;
    pub const ACCT_BTC: u8 = 2;
    pub const ACCT_FEES: u8 = 3;
    pub const ACCT_EQUITY: u8 = 4;
    pub const ACCT_PNL: u8 = 5;

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
    /// Used for deposits, fees, PnL — anything that settles immediately.
    /// TigerBeetle convention: debit_account receives credits, credit_account receives debits.
    pub fn createPostedTransfer(self: *const Turso, debit_acct: u8, credit_acct: u8, amount: f64, code: u8, user_data: []const u8, timestamp: f64) void {
        var buf: [2048]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [
            \\  {{"type": "execute", "stmt": {{"sql": "BEGIN"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "INSERT INTO transfers (debit_account_id, credit_account_id, amount, code, flags, status, user_data, timestamp) VALUES ({d}, {d}, {d:.8}, {d}, 0, 'posted', '{s}', {d:.6})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET credits_posted = credits_posted + {d:.8} WHERE id = {d}"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET debits_posted = debits_posted + {d:.8} WHERE id = {d}"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "COMMIT"}}}}
            \\]}}
        , .{ debit_acct, credit_acct, amount, code, user_data, timestamp, amount, debit_acct, amount, credit_acct }) catch return;
        self.execAsync(sql);
    }

    /// Create a pending transfer + reserve balances atomically (sync, returns transfer ID).
    /// Used for buy/sell orders submitted to Alpaca.
    /// TigerBeetle convention: debit_account receives credits, credit_account receives debits.
    pub fn createPendingTransfer(self: *const Turso, debit_acct: u8, credit_acct: u8, amount: f64, code: u8, user_data: []const u8, timestamp: f64) ?u32 {
        var buf: [2048]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [
            \\  {{"type": "execute", "stmt": {{"sql": "BEGIN"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "INSERT INTO transfers (debit_account_id, credit_account_id, amount, code, flags, status, user_data, timestamp) VALUES ({d}, {d}, {d:.8}, {d}, 1, 'pending', '{s}', {d:.6}) RETURNING id"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET credits_pending = credits_pending + {d:.8} WHERE id = {d}"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET debits_pending = debits_pending + {d:.8} WHERE id = {d}"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "COMMIT"}}}}
            \\]}}
        , .{ debit_acct, credit_acct, amount, code, user_data, timestamp, amount, debit_acct, amount, credit_acct }) catch return null;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        // Parse the transfer ID from the RETURNING clause (second result in pipeline)
        return parseTransferId(resp.body);
    }

    /// Post a pending transfer — move pending → posted balances (async).
    /// TigerBeetle convention: debit_account has credits, credit_account has debits.
    pub fn postTransfer(self: *const Turso, pending_id: u32) void {
        var buf: [2048]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [
            \\  {{"type": "execute", "stmt": {{"sql": "BEGIN"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE transfers SET status = 'posted' WHERE id = {d} AND status = 'pending'"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET credits_pending = credits_pending - (SELECT amount FROM transfers WHERE id = {d}), credits_posted = credits_posted + (SELECT amount FROM transfers WHERE id = {d}) WHERE id = (SELECT debit_account_id FROM transfers WHERE id = {d})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET debits_pending = debits_pending - (SELECT amount FROM transfers WHERE id = {d}), debits_posted = debits_posted + (SELECT amount FROM transfers WHERE id = {d}) WHERE id = (SELECT credit_account_id FROM transfers WHERE id = {d})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "COMMIT"}}}}
            \\]}}
        , .{ pending_id, pending_id, pending_id, pending_id, pending_id, pending_id, pending_id }) catch return;
        self.execAsync(sql);
    }

    /// Void a pending transfer — release reserved balances (sync).
    /// TigerBeetle convention: debit_account has credits, credit_account has debits.
    pub fn voidTransfer(self: *const Turso, pending_id: u32) void {
        var buf: [2048]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [
            \\  {{"type": "execute", "stmt": {{"sql": "BEGIN"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE transfers SET status = 'voided' WHERE id = {d} AND status = 'pending'"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET credits_pending = credits_pending - (SELECT amount FROM transfers WHERE id = {d}) WHERE id = (SELECT debit_account_id FROM transfers WHERE id = {d})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "UPDATE accounts SET debits_pending = debits_pending - (SELECT amount FROM transfers WHERE id = {d}) WHERE id = (SELECT credit_account_id FROM transfers WHERE id = {d})"}}}},
            \\  {{"type": "execute", "stmt": {{"sql": "COMMIT"}}}}
            \\]}}
        , .{ pending_id, pending_id, pending_id, pending_id, pending_id }) catch return;
        _ = self.execSync(sql);
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

    /// Query open position from pending buy transfer (blocking).
    /// Reconstructs entry_price, entry_time, size from user_data JSON.
    pub fn queryOpenPositionNew(self: *const Turso) ?struct { entry_price: f64, entry_time: f64, size: f64, fee: f64 } {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT user_data, timestamp FROM transfers WHERE code = 2 AND status = 'posted' AND pending_id IS NULL ORDER BY id DESC LIMIT 1"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        const r = resp.body;
        if (std.mem.indexOf(u8, r, "\"rows\":[]") != null) return null;

        // Parse user_data (first value) and timestamp (second value)
        const vkey = "\"value\":";
        const vpos1 = std.mem.indexOf(u8, r, vkey) orelse return null;
        var pos = vpos1 + vkey.len;

        // user_data is a JSON string like: {"price":80000.0,"size":0.01,...}
        if (pos >= r.len or r[pos] != '"') return null;
        pos += 1;
        const ud_end = std.mem.indexOf(u8, r[pos..], "\"") orelse return null;
        const user_data = r[pos..][0..ud_end];
        pos += ud_end + 1;

        // Parse timestamp (second value)
        const vpos2 = std.mem.indexOf(u8, r[pos..], vkey) orelse return null;
        pos = pos + vpos2 + vkey.len;
        var ts: f64 = 0;
        if (pos < r.len and r[pos] == '"') {
            pos += 1;
            const ts_end = std.mem.indexOf(u8, r[pos..], "\"") orelse return null;
            ts = std.fmt.parseFloat(f64, r[pos..][0..ts_end]) catch 0;
        } else {
            var end = pos;
            while (end < r.len and r[end] != ',' and r[end] != '}') : (end += 1) {}
            ts = std.fmt.parseFloat(f64, r[pos..end]) catch 0;
        }

        // Parse price and size from user_data JSON
        const price = parseJsonFloat(user_data, "\"price\":") orelse return null;
        const size = parseJsonFloat(user_data, "\"size\":") orelse return null;
        const fee = parseJsonFloat(user_data, "\"fee\":") orelse 0;

        std.debug.print("  [turso] Found position from transfers: entry=${d:.2} size={d:.8}\n", .{ price, size });
        return .{ .entry_price = price, .entry_time = ts, .size = size, .fee = fee };
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

    fn execSyncRead(self: *const Turso, json_body: []const u8) ?HttpClient.Response {
        const h = self.headers();
        return self.http.post(self.url, &h, json_body) catch null;
    }

    fn execAsync(self: *const Turso, json_body: []const u8) void {
        const Context = struct {
            turso: *const Turso,
            body: [4096]u8,
            body_len: usize,
        };

        var ctx = self.allocator.create(Context) catch return;
        ctx.turso = self;
        ctx.body_len = json_body.len;
        @memcpy(ctx.body[0..json_body.len], json_body);

        const thread = std.Thread.spawn(.{}, asyncWorker, .{ctx, self.allocator}) catch {
            self.allocator.destroy(ctx);
            return;
        };
        thread.detach();
    }

    fn asyncWorker(ctx: anytype, allocator: std.mem.Allocator) void {
        defer allocator.destroy(ctx);
        const turso: *const Turso = ctx.turso;
        const body = ctx.body[0..ctx.body_len];
        _ = turso.execSync(body);
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
