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
        const sql =
            \\{"requests": [
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS trade_events (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, price REAL, size REAL, fee REAL, timestamp REAL, created_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS positions (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT, entry_price REAL, entry_time REAL, exit_price REAL, exit_time REAL, size REAL, pnl REAL, fees REAL, exit_type TEXT, signal_price REAL, alpaca_order_id TEXT, created_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS equity_log (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp REAL, tick_count INTEGER, capital REAL, equity REAL, unrealized REAL, regime TEXT, price REAL, created_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS bot_status (id INTEGER PRIMARY KEY CHECK (id = 1), status TEXT, last_tick REAL, tick_count INTEGER, regime TEXT, in_position INTEGER, entry_price REAL, equity REAL, capital REAL, unrealized REAL, price REAL, uptime_start REAL, version TEXT, updated_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE TABLE IF NOT EXISTS account_ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, amount REAL, balance_after REAL, note TEXT, timestamp REAL, created_at TEXT DEFAULT (datetime('now')))"}},
            \\  {"type": "execute", "stmt": {"sql": "CREATE INDEX IF NOT EXISTS idx_equity_log_timestamp ON equity_log(timestamp)"}}
            \\]}
        ;
        if (self.execSync(sql)) {
            std.debug.print("  [turso] Tables ready.\n", .{});
        } else {
            std.debug.print("  [turso] WARNING: Table creation may have failed.\n", .{});
        }
    }

    /// Log a BUY event (async).
    pub fn logBuy(self: *const Turso, price: f64, size: f64, fee: f64, timestamp: f64) void {
        var buf: [1024]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "INSERT INTO trade_events (action, price, size, fee, timestamp) VALUES ('BUY', {d:.8}, {d:.8}, {d:.8}, {d:.6})"}}}}]}}
        , .{ price, size, fee, timestamp }) catch return;
        self.execAsync(sql);
    }

    /// Log a SELL event (async).
    pub fn logSell(self: *const Turso, price: f64, size: f64, fee: f64, timestamp: f64) void {
        var buf: [1024]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "INSERT INTO trade_events (action, price, size, fee, timestamp) VALUES ('SELL', {d:.8}, {d:.8}, {d:.8}, {d:.6})"}}}}]}}
        , .{ price, size, fee, timestamp }) catch return;
        self.execAsync(sql);
    }

    /// Log position open (async).
    pub fn logPositionOpen(self: *const Turso, entry_price: f64, entry_time: f64, size: f64, fee: f64, signal_price: f64, alpaca_order_id: []const u8) void {
        var buf: [1024]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "INSERT INTO positions (status, entry_price, entry_time, size, fees, signal_price, alpaca_order_id) VALUES ('OPEN', {d:.8}, {d:.6}, {d:.8}, {d:.8}, {d:.8}, '{s}')"}}}}]}}
        , .{ entry_price, entry_time, size, fee, signal_price, alpaca_order_id }) catch return;
        self.execAsync(sql);
    }

    /// Log position close — update the most recent OPEN position (async).
    pub fn logPositionClose(self: *const Turso, trade: Trade) void {
        const exit_str = switch (trade.exit_type) {
            .dc_exit => "DC",
            .trailing_stop => "SL",
            .regime_close => "REG",
            .end_of_data => "END",
        };
        var buf: [1024]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "UPDATE positions SET status='CLOSED', exit_price={d:.8}, exit_time={d:.6}, pnl={d:.8}, fees=fees+{d:.8}, exit_type='{s}' WHERE id=(SELECT id FROM positions WHERE status='OPEN' ORDER BY id DESC LIMIT 1)"}}}}]}}
        , .{ trade.exit_price, trade.exit_time, trade.pnl, trade.exit_price * trade.size * 0.001, exit_str }) catch return;
        self.execAsync(sql);
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

    /// Query total closed trade count from positions table (blocking).
    pub fn queryTradeCount(self: *const Turso) ?u32 {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT COUNT(*) as cnt FROM positions WHERE status='CLOSED'"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        return parseFirstValueInt(resp.body);
    }

    /// Log an account ledger entry (async).
    pub fn logLedger(self: *const Turso, entry_type: []const u8, amount: f64, balance_after: f64, note: []const u8, timestamp: f64) void {
        var buf: [1024]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "INSERT INTO account_ledger (type, amount, balance_after, note, timestamp) VALUES ('{s}', {d:.8}, {d:.8}, '{s}', {d:.6})"}}}}]}}
        , .{ entry_type, amount, balance_after, note, timestamp }) catch return;
        self.execAsync(sql);
    }

    /// Log a ledger entry synchronously (for startup deposits).
    pub fn logLedgerSync(self: *const Turso, entry_type: []const u8, amount: f64, balance_after: f64, note: []const u8, timestamp: f64) void {
        var buf: [1024]u8 = undefined;
        const sql = std.fmt.bufPrint(&buf,
            \\{{"requests": [{{"type": "execute", "stmt": {{"sql": "INSERT INTO account_ledger (type, amount, balance_after, note, timestamp) VALUES ('{s}', {d:.8}, {d:.8}, '{s}', {d:.6})"}}}}]}}
        , .{ entry_type, amount, balance_after, note, timestamp }) catch return;
        _ = self.execSync(sql);
    }

    /// Query latest balance from account_ledger (blocking).
    pub fn queryLedgerBalance(self: *const Turso) ?f64 {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT balance_after FROM account_ledger ORDER BY id DESC LIMIT 1"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        return parseFirstValueFloat(resp.body);
    }

    /// Query total deposits from account_ledger (blocking).
    pub fn queryTotalDeposits(self: *const Turso) ?f64 {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT COALESCE(SUM(amount), 0) as total FROM account_ledger WHERE type='DEPOSIT'"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        return parseFirstValueFloat(resp.body);
    }

    /// Query latest capital from equity_log (blocking).
    pub fn queryLatestCapital(self: *const Turso) ?f64 {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT capital FROM equity_log ORDER BY id DESC LIMIT 1"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();
        return parseFirstValueFloat(resp.body);
    }

    /// Query Turso for an existing OPEN position (blocking).
    pub fn queryOpenPosition(self: *const Turso) ?struct { entry_price: f64, entry_time: f64, size: f64, fee: f64 } {
        const sql =
            \\{"requests": [{"type": "execute", "stmt": {"sql": "SELECT entry_price, entry_time, size, fees FROM positions WHERE status='OPEN' ORDER BY id DESC LIMIT 1"}}]}
        ;
        const resp = self.execSyncRead(sql) orelse return null;
        defer resp.deinit();

        const r = resp.body;
        if (std.mem.indexOf(u8, r, "\"rows\":[]") != null) return null;

        const rows_pos = std.mem.indexOf(u8, r, "\"rows\":") orelse return null;
        var pos = rows_pos;
        var values: [4]f64 = .{ 0, 0, 0, 0 };
        var vi: usize = 0;

        while (vi < 4 and pos < r.len) {
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
        std.debug.print("  [turso] Found OPEN position: entry=${d:.2} size={d:.8}\n", .{ values[0], values[2] });
        return .{ .entry_price = values[0], .entry_time = values[1], .size = values[2], .fee = values[3] };
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
            body: [2048]u8,
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
