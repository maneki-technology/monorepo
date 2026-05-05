/// Native Binance WebSocket feed using websocket.zig + HttpClient for REST.
const std = @import("std");
const websocket = @import("websocket");
const types = @import("types.zig");
const http_mod = @import("http_client.zig");
const HttpClient = http_mod.HttpClient;
const Tick = types.Tick;

extern "c" fn usleep(usec: c_uint) c_int;
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

        const normalized = normalizeSymbol(symbol);
        for (normalized.slice()) |c| {
            path_buf[path_len] = if (c >= 'A' and c <= 'Z') c + 32 else c;
            path_len += 1;
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

/// Fetch historical 1-minute klines from Binance REST API (paginated).
/// Returns up to `count` close prices (oldest first). Binance caps at 1000/request.
pub fn fetch1mCloses(allocator: std.mem.Allocator, http: *HttpClient, symbol: []const u8, count: usize) ![]f64 {
    var closes: std.ArrayList(f64) = .empty;
    errdefer closes.deinit(allocator);

    const sym = normalizeSymbol(symbol);

    // Start time: now - count minutes (in ms)
    const now_s: u64 = @intCast(time(null));
    var start_ms: u64 = (now_s - @as(u64, count) * 60) * 1000;

    std.debug.print("  Fetching {d} 1-minute candles ({d} requests)...\n", .{ count, (count + 999) / 1000 });

    var batch: usize = 0;
    while (closes.items.len < count) {
        const remaining = count - closes.items.len;
        const limit = @min(remaining, 1000);

        const result = try fetchKlineBatch(http, sym.slice(), start_ms, limit);
        const parsed = result.parsed;
        const last_close_time = result.last_close_time;

        for (result.prices[0..parsed]) |p| {
            try closes.append(allocator, p);
        }

        batch += 1;
        if (batch % 10 == 0 or closes.items.len >= count) {
            std.debug.print("  ... {d}/{d} candles fetched\n", .{ closes.items.len, count });
        }

        if (parsed == 0) break;
        if (closes.items.len >= count) break;
        start_ms = last_close_time + 1;
    }

    std.debug.print("  Fetched {d} candles total.\n", .{closes.items.len});
    return try closes.toOwnedSlice(allocator);
}

/// Fetch 1-minute klines from a specific start timestamp to now.
/// Used for catch-up after downtime.
pub fn fetch1mClosesSince(allocator: std.mem.Allocator, http: *HttpClient, symbol: []const u8, since_epoch_s: u64) ![]f64 {
    const now_s: u64 = @intCast(time(null));
    if (since_epoch_s >= now_s) return try allocator.alloc(f64, 0);

    const gap_minutes = (now_s - since_epoch_s) / 60;
    if (gap_minutes < 2) return try allocator.alloc(f64, 0);

    std.debug.print("  Catch-up: {d} minutes gap, fetching klines...\n", .{gap_minutes});

    var closes: std.ArrayList(f64) = .empty;
    errdefer closes.deinit(allocator);

    const sym = normalizeSymbol(symbol);
    const count = gap_minutes + 1;
    var start_ms = since_epoch_s * 1000;

    var batch: usize = 0;
    while (closes.items.len < count) {
        const remaining = count - closes.items.len;
        const limit = @min(remaining, 1000);

        const result = try fetchKlineBatch(http, sym.slice(), start_ms, limit);
        const parsed = result.parsed;
        const last_close_time = result.last_close_time;

        for (result.prices[0..parsed]) |p| {
            try closes.append(allocator, p);
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

// -- Internal helpers --

pub const SymBuf = struct {
    buf: [16]u8,
    len: usize,

    pub fn slice(self: *const SymBuf) []const u8 {
        return self.buf[0..self.len];
    }
};

pub fn normalizeSymbol(symbol: []const u8) SymBuf {
    var result: SymBuf = .{ .buf = undefined, .len = 0 };
    for (symbol) |c| {
        if (c != '/') {
            result.buf[result.len] = if (c >= 'a' and c <= 'z') c - 32 else c;
            result.len += 1;
        }
    }
    if (std.mem.endsWith(u8, result.slice(), "USD") and !std.mem.endsWith(u8, result.slice(), "USDT") and result.len < result.buf.len) {
        result.buf[result.len] = 'T';
        result.len += 1;
    }
    return result;
}

pub const KlineBatchResult = struct {
    prices: [1000]f64,
    parsed: usize,
    last_close_time: u64,
};

fn fetchKlineBatch(http: *HttpClient, sym: []const u8, start_ms: u64, limit: usize) !KlineBatchResult {
    var url_buf: [256]u8 = undefined;
    const url = std.fmt.bufPrint(&url_buf, "https://{s}/api/v3/klines?symbol={s}&interval=1m&startTime={d}&limit={d}", .{ apiHost(), sym, start_ms, limit }) catch return error.FormatError;

    const resp = http.getLarge(url, &.{}, 262144) catch return error.FetchFailed;
    defer resp.deinit();

    if (resp.body.len == 0) return error.EmptyResponse;

    if (resp.body[0] == '{') {
        std.debug.print("  API error: {s}\n", .{resp.body[0..@min(resp.body.len, 200)]});
        return error.ApiError;
    }

    return parseKlineCloses(resp.body);
}

/// Parse Binance kline JSON array into close prices and close times.
/// Exported for testing.
pub fn parseKlineCloses(json: []const u8) KlineBatchResult {
    var result: KlineBatchResult = .{ .prices = undefined, .parsed = 0, .last_close_time = 0 };
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

        if (close_price > 0 and result.parsed < 1000) {
            result.prices[result.parsed] = close_price;
            result.parsed += 1;
            if (close_time > result.last_close_time) result.last_close_time = close_time;
        }
        i = j;
    }

    return result;
}

/// Fetch latest funding rates from Binance futures API (public, no auth).
/// Returns the average of the last `count` funding rates (default 3 = 24h).
pub fn fetchFundingRate(http: *HttpClient, symbol: []const u8, count: usize) ?f64 {
    var url_buf: [256]u8 = undefined;
    const sym = normalizeSymbol(symbol);
    const url = std.fmt.bufPrint(&url_buf, "https://fapi.binance.com/fapi/v1/fundingRate?symbol={s}&limit={d}", .{ sym.slice(), count }) catch return null;

    const resp = http.get(url, &.{}) catch return null;
    defer resp.deinit();

    if (resp.body.len < 2 or resp.body[0] != '[') return null;

    // Parse funding rates from JSON array
    // [{"fundingRate":"0.00010000",...}, ...]
    var sum: f64 = 0;
    var parsed: usize = 0;
    var pos: usize = 0;
    const key = "\"fundingRate\":";

    while (pos < resp.body.len) {
        const kpos = std.mem.indexOf(u8, resp.body[pos..], key) orelse break;
        pos = pos + kpos + key.len;
        // Skip whitespace and opening quote
        while (pos < resp.body.len and (resp.body[pos] == ' ' or resp.body[pos] == '"')) : (pos += 1) {}
        var end = pos;
        while (end < resp.body.len and resp.body[end] != '"' and resp.body[end] != ',' and resp.body[end] != '}') : (end += 1) {}
        const rate = std.fmt.parseFloat(f64, resp.body[pos..end]) catch continue;
        sum += rate;
        parsed += 1;
        pos = end;
    }

    if (parsed == 0) return null;
    const avg = sum / @as(f64, @floatFromInt(parsed));
    std.debug.print("  [funding] Fetched {d} rates, 24h avg={d:.6}%\n", .{ parsed, avg * 100 });
    return avg;
}

/// Parse funding rate from JSON for testing.
pub fn parseFundingRates(json: []const u8) ?f64 {
    var sum: f64 = 0;
    var parsed: usize = 0;
    var pos: usize = 0;
    const key = "\"fundingRate\":";

    while (pos < json.len) {
        const kpos = std.mem.indexOf(u8, json[pos..], key) orelse break;
        pos = pos + kpos + key.len;
        while (pos < json.len and (json[pos] == ' ' or json[pos] == '"')) : (pos += 1) {}
        var end = pos;
        while (end < json.len and json[end] != '"' and json[end] != ',' and json[end] != '}') : (end += 1) {}
        const rate = std.fmt.parseFloat(f64, json[pos..end]) catch continue;
        sum += rate;
        parsed += 1;
        pos = end;
    }

    if (parsed == 0) return null;
    return sum / @as(f64, @floatFromInt(parsed));
}
