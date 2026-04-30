/// Alpaca paper trading client — synchronous orders via native HTTP.
const std = @import("std");
const http_mod = @import("http_client.zig");
const HttpClient = http_mod.HttpClient;

extern "c" fn getenv(name: [*:0]const u8) ?[*:0]const u8;
extern "c" fn usleep(usec: c_uint) c_int;

pub const OrderFill = struct {
    order_id: [64]u8 = undefined,
    order_id_len: usize = 0,
    fill_price: f64,
    fill_qty: f64,
    status: enum { filled, accepted, failed },
};

pub const AlpacaPosition = struct {
    qty: f64,
    entry_price: f64,
    market_value: f64,
    unrealized_pnl: f64,
};

pub const Alpaca = struct {
    api_key: []const u8,
    api_secret: []const u8,
    http: *HttpClient,

    pub fn init(http: *HttpClient) ?Alpaca {
        const key_ptr = getenv("ALPACA_API_KEY") orelse {
            std.debug.print("  [alpaca] ALPACA_API_KEY not set, paper trading disabled.\n", .{});
            return null;
        };
        const secret_ptr = getenv("ALPACA_API_SECRET") orelse {
            std.debug.print("  [alpaca] ALPACA_API_SECRET not set, paper trading disabled.\n", .{});
            return null;
        };
        const key = std.mem.sliceTo(key_ptr, 0);
        const secret = std.mem.sliceTo(secret_ptr, 0);
        std.debug.print("  [alpaca] Paper trading enabled.\n", .{});
        return .{ .api_key = key, .api_secret = secret, .http = http };
    }

    fn headers(self: *const Alpaca) [2]HttpClient.Header {
        return .{
            .{ .name = "APCA-API-KEY-ID", .value = self.api_key },
            .{ .name = "APCA-API-SECRET-KEY", .value = self.api_secret },
        };
    }

    fn headersWithJson(self: *const Alpaca) [3]HttpClient.Header {
        return .{
            .{ .name = "APCA-API-KEY-ID", .value = self.api_key },
            .{ .name = "APCA-API-SECRET-KEY", .value = self.api_secret },
            .{ .name = "content-type", .value = "application/json" },
        };
    }

    /// Place a synchronous market BUY. Returns fill details or null on failure.
    pub fn buy(self: *const Alpaca, qty: f64) ?OrderFill {
        var body_buf: [256]u8 = undefined;
        const body = std.fmt.bufPrint(&body_buf,
            "{{\"symbol\":\"BTC/USD\",\"qty\":\"{d:.8}\",\"side\":\"buy\",\"type\":\"market\",\"time_in_force\":\"gtc\"}}",
            .{qty},
        ) catch return null;
        return self.submitOrder(body);
    }

    /// Place a synchronous market SELL for given qty. Returns fill details or null.
    pub fn sell(self: *const Alpaca, qty: f64) ?OrderFill {
        var body_buf: [256]u8 = undefined;
        const body = std.fmt.bufPrint(&body_buf,
            "{{\"symbol\":\"BTC/USD\",\"qty\":\"{d:.8}\",\"side\":\"sell\",\"type\":\"market\",\"time_in_force\":\"gtc\"}}",
            .{qty},
        ) catch return null;
        return self.submitOrder(body);
    }

    /// Get current BTC/USD position from Alpaca. Returns null if no position.
    pub fn getPosition(self: *const Alpaca) ?AlpacaPosition {
        const h = self.headers();
        const resp = self.http.get(
            "https://paper-api.alpaca.markets/v2/positions/BTCUSD",
            &h,
        ) catch return null;
        defer resp.deinit();

        const r = resp.body;
        if (std.mem.indexOf(u8, r, "\"code\"") != null) return null;

        const qty = parseJsonFloat(r, "\"qty\":") orelse return null;
        const entry = parseJsonFloat(r, "\"avg_entry_price\":") orelse return null;
        const mv = parseJsonFloat(r, "\"market_value\":") orelse 0;
        const pnl = parseJsonFloat(r, "\"unrealized_pl\":") orelse 0;

        std.debug.print("  [alpaca] Position: qty={d:.8} entry=${d:.2}\n", .{ qty, entry });
        return .{ .qty = qty, .entry_price = entry, .market_value = mv, .unrealized_pnl = pnl };
    }

    fn submitOrder(self: *const Alpaca, body: []const u8) ?OrderFill {
        const h = self.headersWithJson();
        const resp = self.http.post(
            "https://paper-api.alpaca.markets/v2/orders",
            &h,
            body,
        ) catch return null;
        defer resp.deinit();

        const r = resp.body;

        // Check for error
        if (std.mem.indexOf(u8, r, "\"message\"") != null and std.mem.indexOf(u8, r, "\"id\"") == null) {
            std.debug.print("  [alpaca] Order error: {s}\n", .{r[0..@min(r.len, 200)]});
            return null;
        }

        // Parse order ID
        var fill: OrderFill = .{ .fill_price = 0, .fill_qty = 0, .status = .accepted };
        if (parseJsonString(r, "\"id\":")) |id| {
            const len = @min(id.len, fill.order_id.len);
            @memcpy(fill.order_id[0..len], id[0..len]);
            fill.order_id_len = len;
        }

        // Check if already filled
        if (std.mem.indexOf(u8, r, "\"status\":\"filled\"") != null) {
            fill.status = .filled;
            fill.fill_price = parseJsonFloat(r, "\"filled_avg_price\":") orelse 0;
            fill.fill_qty = parseJsonFloat(r, "\"filled_qty\":") orelse 0;
            std.debug.print("  [alpaca] Filled: price=${d:.2} qty={d:.8}\n", .{ fill.fill_price, fill.fill_qty });
            return fill;
        }

        // If accepted but not filled, poll for up to 10 seconds
        if (fill.order_id_len > 0) {
            const order_id = fill.order_id[0..fill.order_id_len];
            var poll: u32 = 0;
            while (poll < 10) : (poll += 1) {
                _ = usleep(1_000_000); // 1s
                var poll_url_buf: [256]u8 = undefined;
                const poll_url = std.fmt.bufPrint(&poll_url_buf,
                    "https://paper-api.alpaca.markets/v2/orders/{s}",
                    .{order_id},
                ) catch break;

                const ph = self.headers();
                const poll_resp = self.http.get(poll_url, &ph) catch continue;
                defer poll_resp.deinit();

                const pr = poll_resp.body;
                if (std.mem.indexOf(u8, pr, "\"status\":\"filled\"") != null) {
                    fill.status = .filled;
                    fill.fill_price = parseJsonFloat(pr, "\"filled_avg_price\":") orelse 0;
                    fill.fill_qty = parseJsonFloat(pr, "\"filled_qty\":") orelse 0;
                    std.debug.print("  [alpaca] Filled (poll {d}): price=${d:.2} qty={d:.8}\n", .{ poll + 1, fill.fill_price, fill.fill_qty });
                    return fill;
                }
                if (std.mem.indexOf(u8, pr, "\"status\":\"canceled\"") != null or
                    std.mem.indexOf(u8, pr, "\"status\":\"expired\"") != null or
                    std.mem.indexOf(u8, pr, "\"status\":\"rejected\"") != null)
                {
                    std.debug.print("  [alpaca] Order failed.\n", .{});
                    fill.status = .failed;
                    return fill;
                }
            }
            std.debug.print("  [alpaca] Order not filled after 10s, treating as failed.\n", .{});
            fill.status = .failed;
        }
        return fill;
    }

    pub fn parseJsonFloat(json: []const u8, key: []const u8) ?f64 {
        const pos = std.mem.indexOf(u8, json, key) orelse return null;
        var start = pos + key.len;
        while (start < json.len and (json[start] == ' ' or json[start] == '"')) : (start += 1) {}
        var end = start;
        while (end < json.len and json[end] != ',' and json[end] != '}' and json[end] != '"') : (end += 1) {}
        return std.fmt.parseFloat(f64, json[start..end]) catch null;
    }

    pub fn parseJsonString(json: []const u8, key: []const u8) ?[]const u8 {
        const pos = std.mem.indexOf(u8, json, key) orelse return null;
        var start = pos + key.len;
        while (start < json.len and json[start] == ' ') : (start += 1) {}
        if (start >= json.len or json[start] != '"') return null;
        start += 1;
        const end = std.mem.indexOf(u8, json[start..], "\"") orelse return null;
        return json[start..][0..end];
    }
};
