/// Native Binance WebSocket feed using websocket.zig — zero Python dependencies.
const std = @import("std");
const websocket = @import("websocket");
const types = @import("types.zig");
const Tick = types.Tick;

extern "c" fn usleep(usec: c_uint) c_int;
extern "c" fn popen(cmd: [*:0]const u8, mode: [*:0]const u8) ?*anyopaque;
extern "c" fn pclose(fp: *anyopaque) c_int;
extern "c" fn fread(buf: [*]u8, size: usize, count: usize, fp: *anyopaque) usize;
extern "c" fn time(tloc: ?*anyopaque) c_long;
extern "c" fn getenv(name: [*:0]const u8) ?[*:0]const u8;

fn wsHost() []const u8 {
    const ptr = getenv("BINANCE_WS_HOST") orelse return "stream.binance.com";
    return std.mem.sliceTo(ptr, 0);
}

fn apiHost() []const u8 {
    const ptr = getenv("BINANCE_API_HOST") orelse return "api.binance.com";
    return std.mem.sliceTo(ptr, 0);
}

pub const Feed = struct {
    allocator: std.mem.Allocator,
    client: websocket.Client,

    pub fn init(allocator: std.mem.Allocator, io: std.Io, symbol: []const u8) !Feed {
        // Build path: /ws/btcusdt@trade
        var path_buf: [128]u8 = undefined;
        var path_len: usize = 0;

        const prefix = "/ws/";
        @memcpy(path_buf[0..prefix.len], prefix);
        path_len = prefix.len;

        // Convert "BTC/USDT" to "btcusdt"
        for (symbol) |c| {
            if (c != '/') {
                path_buf[path_len] = if (c >= 'A' and c <= 'Z') c + 32 else c;
                path_len += 1;
            }
        }
        const suffix = "@trade";
        @memcpy(path_buf[path_len..][0..suffix.len], suffix);
        path_len += suffix.len;

        const ws_host = wsHost();
        var host_buf: [128]u8 = undefined;
        const host_header = std.fmt.bufPrint(&host_buf, "Host: {s}\r\n", .{ws_host}) catch return error.FormatError;

        var client = try websocket.Client.init(io, allocator, .{
            .port = 9443,
            .host = ws_host,
            .tls = true,
        });
        errdefer client.deinit();

        try client.handshake(path_buf[0..path_len], .{
            .timeout_ms = 10000,
            .headers = host_header,
        });
        // Set read timeout — if no data for 30s, connection is dead
        try client.readTimeout(30000);

        return .{
            .allocator = allocator,
            .client = client,
        };
    }

    pub fn deinit(self: *Feed) void {
        self.client.deinit();
    }

    /// Read one message from the WebSocket and parse it into a Tick.
    /// Binance trade stream format:
    /// {"e":"trade","E":123,"s":"BTCUSDT","t":123,"p":"95000.00","q":"0.001","T":123456789000,...}
    pub fn nextTick(self: *Feed) !?Tick {
        const msg = try self.client.read();
        if (msg == null) return null;
        const m = msg.?;

        // Respond to WebSocket-level pings
        if (m.type == .ping) {
            try self.client.writePong(@constCast(m.data));
            return null;
        }

        // Only process text frames
        if (m.type != .text) return null;
        if (m.data.len == 0) return null;

        // Binance sends app-level pings as text frames with just a timestamp
        // e.g. "1777196360249" — must respond with pong frame echoing the data
        if (m.data[0] != '{') {
            try self.client.writePong(@constCast(m.data));
            return null;
        }

        return parseBinanceTrade(m.data);
    }
};

/// Parse Binance trade stream JSON into a Tick — no allocations.
pub fn parseBinanceTrade(json: []const u8) ?Tick {
    // Extract "T": (trade time in ms)
    const time_key = "\"T\":";
    const time_pos = indexOf(json, 0, time_key) orelse return null;
    var pos = time_pos + time_key.len;
    const time_val = parseNumber(json, pos) orelse return null;

    // Extract "p":"..." (price)
    const price_key = "\"p\":\"";
    const price_pos = indexOf(json, 0, price_key) orelse return null;
    pos = price_pos + price_key.len;
    const price_val = parseQuotedFloat(json, pos) orelse return null;

    // Extract "q":"..." (quantity)
    const qty_key = "\"q\":\"";
    const qty_pos = indexOf(json, 0, qty_key) orelse return null;
    pos = qty_pos + qty_key.len;
    const qty_val = parseQuotedFloat(json, pos) orelse return null;

    return .{
        .timestamp = time_val.value / 1000.0,
        .price = price_val.value,
        .volume = qty_val.value,
    };
}

const ParseResult = struct { value: f64, end: usize };

fn parseNumber(json: []const u8, start: usize) ?ParseResult {
    var end = start;
    while (end < json.len and (json[end] >= '0' and json[end] <= '9')) : (end += 1) {}
    if (end == start) return null;
    const val = std.fmt.parseFloat(f64, json[start..end]) catch return null;
    return .{ .value = val, .end = end };
}

fn parseQuotedFloat(json: []const u8, start: usize) ?ParseResult {
    var end = start;
    while (end < json.len and json[end] != '"') : (end += 1) {}
    if (end == start) return null;
    const val = std.fmt.parseFloat(f64, json[start..end]) catch return null;
    return .{ .value = val, .end = end + 1 };
}

fn indexOf(haystack: []const u8, start: usize, needle: []const u8) ?usize {
    if (start + needle.len > haystack.len) return null;
    var i = start;
    while (i + needle.len <= haystack.len) : (i += 1) {
        if (std.mem.eql(u8, haystack[i..][0..needle.len], needle)) return i;
    }
    return null;
}

/// Fetch historical 1-minute klines from Binance REST API via curl (paginated).
/// Returns up to `count` close prices (oldest first). Binance caps at 1000/request.
pub fn fetch1mCloses(allocator: std.mem.Allocator, symbol: []const u8, count: usize) ![]f64 {
    var closes: std.ArrayList(f64) = .empty;
    errdefer closes.deinit(allocator);

    // Build uppercase symbol: "BTC/USDT" -> "BTCUSDT"
    var sym_buf: [16]u8 = undefined;
    var sym_len: usize = 0;
    for (symbol) |c| {
        if (c != '/') {
            sym_buf[sym_len] = if (c >= 'a' and c <= 'z') c - 32 else c;
            sym_len += 1;
        }
    }
    const sym = sym_buf[0..sym_len];

    // Start time: now - count minutes (in ms)
    // We use the C time() function to get current epoch seconds
    const now_s: u64 = @intCast(time(null));
    var start_ms: u64 = (now_s - @as(u64, count) * 60) * 1000;

    std.debug.print("  Fetching {d} 1-minute candles ({d} requests)...\n", .{ count, (count + 999) / 1000 });

    var batch: usize = 0;
    while (closes.items.len < count) {
        const remaining = count - closes.items.len;
        const limit = @min(remaining, 1000);

        // Build curl command
        var cmd_buf: [512]u8 = undefined;
        const cmd = std.fmt.bufPrint(&cmd_buf, "curl -s 'https://{s}/api/v3/klines?symbol={s}&interval=1m&startTime={d}&limit={d}'\x00", .{ apiHost(), sym, start_ms, limit }) catch return error.FormatError;

        const fp = popen(@ptrCast(cmd_buf[0 .. cmd.len - 1 :0]), "r") orelse return error.PopenFailed;

        // Read response (~200KB for 1000 klines)
        var resp_buf = try allocator.alloc(u8, 262144);
        defer allocator.free(resp_buf);
        var total: usize = 0;
        while (total < resp_buf.len) {
            const n = fread(@ptrCast(resp_buf[total..].ptr), 1, resp_buf.len - total, fp);
            if (n == 0) break;
            total += n;
        }
        _ = pclose(fp);

        if (total == 0) {
            if (closes.items.len > 0) break; // partial success
            return error.EmptyResponse;
        }
        const json = resp_buf[0..total];

        // Check for API error (starts with '{' instead of '[')
        if (json[0] == '{') {
            std.debug.print("  API error: {s}\n", .{json[0..@min(total, 200)]});
            if (closes.items.len > 0) break;
            return error.ApiError;
        }

        // Parse close prices (index 4 in each kline array)
        var parsed: usize = 0;
        var last_close_time: u64 = 0;
        var i: usize = 0;
        while (i < json.len) : (i += 1) {
            if (json[i] != '[' or i == 0) continue;
            if (json[i - 1] == '[') continue; // skip outer "[["

            // Find close time (index 6) for pagination and close price (index 4)
            var commas: usize = 0;
            var j = i + 1;
            var close_price: f64 = 0;
            var close_time: u64 = 0;

            while (j < json.len and json[j] != ']') : (j += 1) {
                if (json[j] == ',') {
                    commas += 1;
                    if (commas == 4) {
                        // Next field is close price
                        const ps = j + 2; // skip ,"
                        var pe = ps;
                        while (pe < json.len and json[pe] != '"') : (pe += 1) {}
                        close_price = std.fmt.parseFloat(f64, json[ps..pe]) catch 0;
                    } else if (commas == 6) {
                        // Next field is close time (integer)
                        const ts = j + 1;
                        var te = ts;
                        while (te < json.len and json[te] >= '0' and json[te] <= '9') : (te += 1) {}
                        close_time = std.fmt.parseInt(u64, json[ts..te], 10) catch 0;
                    }
                }
            }

            if (close_price > 0) {
                try closes.append(allocator, close_price);
                parsed += 1;
                if (close_time > last_close_time) last_close_time = close_time;
            }
            i = j; // skip past this kline
        }

        batch += 1;
        if (batch % 10 == 0 or closes.items.len >= count) {
            std.debug.print("  ... {d}/{d} candles fetched\n", .{ closes.items.len, count });
        }

        if (parsed == 0) break; // no more data
        if (closes.items.len >= count) break;

        // Next page starts after last close time
        start_ms = last_close_time + 1;
    }

    std.debug.print("  Fetched {d} candles total.\n", .{closes.items.len});
    return try closes.toOwnedSlice(allocator);
}

/// Fetch 1-minute klines from a specific start timestamp to now.
/// Used for catch-up after downtime.
pub fn fetch1mClosesSince(allocator: std.mem.Allocator, symbol: []const u8, since_epoch_s: u64) ![]f64 {
    const now_s: u64 = @intCast(time(null));
    if (since_epoch_s >= now_s) return try allocator.alloc(f64, 0);

    const gap_minutes = (now_s - since_epoch_s) / 60;
    if (gap_minutes < 2) return try allocator.alloc(f64, 0); // gap too small

    std.debug.print("  Catch-up: {d} minutes gap, fetching klines...\n", .{gap_minutes});
    return fetch1mClosesFrom(allocator, symbol, since_epoch_s * 1000, gap_minutes + 1);
}

/// Internal: fetch 1m klines starting from start_ms (epoch ms), up to count candles.
fn fetch1mClosesFrom(allocator: std.mem.Allocator, symbol: []const u8, start_ms_init: u64, count: usize) ![]f64 {
    var closes: std.ArrayList(f64) = .empty;
    errdefer closes.deinit(allocator);

    var sym_buf: [16]u8 = undefined;
    var sym_len: usize = 0;
    for (symbol) |c| {
        if (c != '/') {
            sym_buf[sym_len] = if (c >= 'a' and c <= 'z') c - 32 else c;
            sym_len += 1;
        }
    }
    const sym = sym_buf[0..sym_len];
    var start_ms = start_ms_init;

    var batch: usize = 0;
    while (closes.items.len < count) {
        const remaining = count - closes.items.len;
        const limit = @min(remaining, 1000);

        var cmd_buf: [512]u8 = undefined;
        const cmd = std.fmt.bufPrint(&cmd_buf, "curl -s 'https://{s}/api/v3/klines?symbol={s}&interval=1m&startTime={d}&limit={d}'\x00", .{ apiHost(), sym, start_ms, limit }) catch return error.FormatError;

        const fp = popen(@ptrCast(cmd_buf[0 .. cmd.len - 1 :0]), "r") orelse return error.PopenFailed;

        var resp_buf = try allocator.alloc(u8, 262144);
        defer allocator.free(resp_buf);
        var total: usize = 0;
        while (total < resp_buf.len) {
            const n = fread(@ptrCast(resp_buf[total..].ptr), 1, resp_buf.len - total, fp);
            if (n == 0) break;
            total += n;
        }
        _ = pclose(fp);

        if (total == 0) {
            if (closes.items.len > 0) break;
            return error.EmptyResponse;
        }
        const json = resp_buf[0..total];

        if (json[0] == '{') {
            std.debug.print("  API error: {s}\n", .{json[0..@min(total, 200)]});
            if (closes.items.len > 0) break;
            return error.ApiError;
        }

        var parsed: usize = 0;
        var last_close_time: u64 = 0;
        var i: usize = 0;
        while (i < json.len) : (i += 1) {
            if (json[i] != '[' or i == 0) continue;
            if (json[i - 1] == '[') continue;

            var commas: usize = 0;
            var j = i + 1;
            var close_price: f64 = 0;
            var close_time: u64 = 0;

            while (j < json.len and json[j] != ']') : (j += 1) {
                if (json[j] == ',') {
                    commas += 1;
                    if (commas == 4) {
                        const ps = j + 2;
                        var pe = ps;
                        while (pe < json.len and json[pe] != '"') : (pe += 1) {}
                        close_price = std.fmt.parseFloat(f64, json[ps..pe]) catch 0;
                    } else if (commas == 6) {
                        const ts = j + 1;
                        var te = ts;
                        while (te < json.len and json[te] >= '0' and json[te] <= '9') : (te += 1) {}
                        close_time = std.fmt.parseInt(u64, json[ts..te], 10) catch 0;
                    }
                }
            }

            if (close_price > 0) {
                try closes.append(allocator, close_price);
                parsed += 1;
                if (close_time > last_close_time) last_close_time = close_time;
            }
            i = j;
        }

        batch += 1;
        if (batch % 10 == 0 or closes.items.len >= count) {
            std.debug.print("  ... {d}/{d} candles fetched\n", .{ closes.items.len, count });
        }

        if (parsed == 0) break;
        if (closes.items.len >= count) break;
        start_ms = last_close_time + 1;
    }

    std.debug.print("  Catch-up fetched {d} candles.\n", .{closes.items.len});
    return try closes.toOwnedSlice(allocator);
}
