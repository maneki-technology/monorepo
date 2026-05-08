/// Binance Spot trading client — sync + async order interfaces via native HTTP.
/// Implements Exchange.VTable for live trading on Binance Spot markets.
const std = @import("std");
const http_mod = @import("http_client.zig");
const HttpClient = http_mod.HttpClient;
const exchange_mod = @import("exchange.zig");
const Exchange = exchange_mod.Exchange;
const OrderFill = exchange_mod.OrderFill;
const PendingOrder = exchange_mod.PendingOrder;
const OrderStatus = exchange_mod.OrderStatus;
const CancelResult = exchange_mod.CancelResult;
const Side = exchange_mod.Side;
const ExchangePosition = exchange_mod.Position;
const feed_mod = @import("feed.zig");
const normalizeSymbol = feed_mod.normalizeSymbol;

extern "c" fn getenv(name: [*:0]const u8) ?[*:0]const u8;
extern "c" fn usleep(usec: c_uint) c_int;
extern "c" fn time(tloc: ?*anyopaque) c_long;

const hmac = std.crypto.auth.hmac.sha2.HmacSha256;

/// Hex-encode bytes into out buffer. Returns slice of encoded chars.
pub fn hexEncode(bytes: []const u8, out: []u8) []const u8 {
    const hex = "0123456789abcdef";
    std.debug.assert(out.len >= bytes.len * 2);
    for (bytes, 0..) |b, i| {
        out[i * 2] = hex[b >> 4];
        out[i * 2 + 1] = hex[b & 0xf];
    }
    return out[0 .. bytes.len * 2];
}

/// HMAC-SHA256 sign a message with the given secret key.
pub fn hmacSign(msg: []const u8, secret: []const u8, out: *[64]u8) []const u8 {
    var mac: [hmac.mac_length]u8 = undefined;
    hmac.create(&mac, msg, secret);
    return hexEncode(&mac, out);
}

/// Current Unix timestamp in milliseconds.
fn nowMs() i64 {
    const ts: i64 = time(null);
    return ts * 1000;
}

pub const BinanceSpot = struct {
    api_key: []const u8,
    api_secret: []const u8,
    http: *HttpClient,
    symbol: [16]u8,
    symbol_len: usize,
    base_url: [64]u8,
    base_url_len: usize,

    pub fn init(http: *HttpClient) ?BinanceSpot {
        const key_ptr = getenv("BINANCE_API_KEY") orelse {
            std.debug.print("  [binance_spot] BINANCE_API_KEY not set, Spot trading disabled.\n", .{});
            return null;
        };
        const secret_ptr = getenv("BINANCE_API_SECRET") orelse {
            std.debug.print("  [binance_spot] BINANCE_API_SECRET not set, Spot trading disabled.\n", .{});
            return null;
        };
        const key = std.mem.sliceTo(key_ptr, 0);
        const secret = std.mem.sliceTo(secret_ptr, 0);
        const symbol = normalizeSymbol(if (getenv("TRADING_SYMBOL")) |ptr| std.mem.sliceTo(ptr, 0) else "BTC/USD");

        const host = if (getenv("BINANCE_API_HOST")) |ptr| std.mem.sliceTo(ptr, 0) else "api.binance.com";
        var base_url: [64]u8 = undefined;
        const base_url_str = std.fmt.bufPrint(&base_url, "https://{s}", .{host}) catch {
            std.debug.print("  [binance_spot] Invalid API host.\n", .{});
            return null;
        };

        std.debug.print("  [binance_spot] Spot trading enabled for {s}.\n", .{symbol.slice()});
        return .{
            .api_key = key,
            .api_secret = secret,
            .http = http,
            .symbol = symbol.buf,
            .symbol_len = symbol.len,
            .base_url = base_url,
            .base_url_len = base_url_str.len,
        };
    }

    pub fn exchange(self: *const BinanceSpot) Exchange {
        return .{
            .ptr = @ptrCast(self),
            .vtable = &vtable,
        };
    }

    const vtable = Exchange.VTable{
        .buy = @ptrCast(&buy),
        .sell = @ptrCast(&sell),
        .submitOrder = @ptrCast(&submitOrderAsync),
        .checkOrder = @ptrCast(&checkOrderStatus),
        .cancelOrder = @ptrCast(&cancelOrderAsync),
        .getPosition = @ptrCast(&getPositionExchange),
    };

    fn apiKeyHeader(self: *const BinanceSpot) HttpClient.Header {
        return .{ .name = "X-MBX-APIKEY", .value = self.api_key };
    }

    fn tradingSymbol(self: *const BinanceSpot) []const u8 {
        return self.symbol[0..self.symbol_len];
    }

    fn baseUrl(self: *const BinanceSpot) []const u8 {
        return self.base_url[0..self.base_url_len];
    }

    /// Build signed URL or body: append timestamp, recvWindow, and HMAC signature.
    fn sign(self: *const BinanceSpot, query: []const u8, out: []u8) []const u8 {
        const ts = nowMs();
        var signed: []const u8 = undefined;
        if (query.len > 0) {
            signed = std.fmt.bufPrint(out, "{s}&timestamp={d}&recvWindow=5000", .{ query, ts }) catch return "";
        } else {
            signed = std.fmt.bufPrint(out, "timestamp={d}&recvWindow=5000", .{ ts }) catch return "";
        }
        var sig_buf: [64]u8 = undefined;
        const signature = hmacSign(signed, self.api_secret, &sig_buf);
        return std.fmt.bufPrint(out, "{s}&signature={s}", .{ signed, signature }) catch "";
    }

    // ========== Sync interface (blocking) ==========

    pub fn buy(self: *const BinanceSpot, qty: f64) ?OrderFill {
        return self.submitOrderSync(.buy, qty);
    }

    pub fn sell(self: *const BinanceSpot, qty: f64) ?OrderFill {
        return self.submitOrderSync(.sell, qty);
    }

    fn submitOrderSync(self: *const BinanceSpot, side: Side, qty: f64) ?OrderFill {
        const pending = self.submitOrderAsync(side, qty) orelse return null;
        const order_id = pending.order_id[0..pending.order_id_len];

        var poll: u32 = 0;
        while (poll < 20) : (poll += 1) {
            _ = usleep(500_000); // 500ms
            const status = self.checkOrderStatus(order_id);
            switch (status) {
                .filled => |fill| return fill,
                .cancelled => return null,
                .failed => return null,
                .pending => {},
            }
        }
        // Timeout: try to cancel
        _ = self.cancelOrderAsync(order_id);
        return null;
    }

    // ========== Async interface (non-blocking) ==========

    pub fn submitOrderAsync(self: *const BinanceSpot, side: Side, qty: f64) ?PendingOrder {
        const side_str = if (side == .buy) "BUY" else "SELL";
        var query_buf: [512]u8 = undefined;
        const query = std.fmt.bufPrint(&query_buf,
            "symbol={s}&side={s}&type=MARKET&quantity={d:.8}",
            .{ self.tradingSymbol(), side_str, qty },
        ) catch return null;

        var signed_buf: [1024]u8 = undefined;
        const signed = self.sign(query, &signed_buf);
        if (signed.len == 0) return null;

        var url_buf: [256]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf, "{s}/api/v3/order?{s}", .{ self.baseUrl(), signed }) catch return null;

        const h = [_]HttpClient.Header{
            self.apiKeyHeader(),
            .{ .name = "Content-Type", .value = "application/x-www-form-urlencoded" },
        };

        const resp = self.http.post(url, &h, "") catch |err| {
            std.debug.print("  [binance_spot] submitOrder HTTP error: {s}\n", .{@errorName(err)});
            return null;
        };
        defer resp.deinit();

        const r = resp.body;
        std.debug.print("  [binance_spot] Order submitted ({d} bytes): {s}\n", .{ r.len, r[0..@min(r.len, 300)] });

        if (std.mem.indexOf(u8, r, "\"code\"") != null) {
            return null;
        }

        var pending: PendingOrder = .{ .side = side, .qty = qty };
        if (parseJsonString(r, "\"orderId\":")) |id_str| {
            const len = @min(id_str.len, pending.order_id.len);
            @memcpy(pending.order_id[0..len], id_str[0..len]);
            pending.order_id_len = len;
        } else {
            return null;
        }

        // Check if already filled (common for market orders on liquid pairs)
        if (std.mem.indexOf(u8, r, "\"status\":\"FILLED\"") != null) {
            std.debug.print("  [binance_spot] Immediately filled.\n", .{});
        }

        return pending;
    }

    pub fn checkOrderStatus(self: *const BinanceSpot, order_id: []const u8) OrderStatus {
        var query_buf: [512]u8 = undefined;
        const query = std.fmt.bufPrint(&query_buf,
            "symbol={s}&orderId={s}",
            .{ self.tradingSymbol(), order_id },
        ) catch return .{ .failed = {} };

        var signed_buf: [1024]u8 = undefined;
        const signed = self.sign(query, &signed_buf);
        if (signed.len == 0) return .{ .failed = {} };

        var url_buf: [512]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf, "{s}/api/v3/order?{s}", .{ self.baseUrl(), signed }) catch return .{ .failed = {} };

        const h = [_]HttpClient.Header{self.apiKeyHeader()};
        const resp = self.http.get(url, &h) catch return .{ .pending = {} };
        defer resp.deinit();

        const r = resp.body;

        if (std.mem.indexOf(u8, r, "\"status\":\"FILLED\"") != null) {
            var fill: OrderFill = .{ .fill_price = 0, .fill_qty = 0, .status = .filled };

            // Binance returns string numbers; parseJsonFloat handles quotes
            fill.fill_qty = parseJsonFloat(r, "\"executedQty\":\"") orelse parseJsonFloat(r, "\"executedQty\":") orelse 0;
            const quote_qty = parseJsonFloat(r, "\"cummulativeQuoteQty\":\"") orelse parseJsonFloat(r, "\"cummulativeQuoteQty\":") orelse 0;
            if (fill.fill_qty > 0) {
                fill.fill_price = quote_qty / fill.fill_qty;
            }

            // Parse fills array for commission
            if (parseFillCommission(r, &fill.commission, &fill.commission_asset, &fill.commission_asset_len)) {
                // commission_usd: if asset is quote currency (USDT), use directly; otherwise estimate
                if (fill.commission_asset_len >= 4 and std.mem.eql(u8, fill.commission_asset[0..4], "USDT")) {
                    fill.commission_usd = fill.commission;
                } else if (fill.commission_asset_len >= 3 and std.mem.eql(u8, fill.commission_asset[0..3], "BNB")) {
                    // Will be estimated by LiveLoop if no direct rate available
                    fill.commission_usd = 0;
                } else {
                    fill.commission_usd = 0;
                }
            } else {
                @memcpy(fill.commission_asset[0..4], "USDT");
                fill.commission_asset_len = 4;
            }

            const len = @min(order_id.len, fill.order_id.len);
            @memcpy(fill.order_id[0..len], order_id[0..len]);
            fill.order_id_len = len;

            std.debug.print("  [binance_spot] checkOrder: filled price=${d:.2} qty={d:.8} comm={d:.8} {s}\n", .{
                fill.fill_price, fill.fill_qty, fill.commission,
                fill.commission_asset[0..fill.commission_asset_len],
            });
            return .{ .filled = fill };
        }

        if (std.mem.indexOf(u8, r, "\"status\":\"CANCELED\"") != null or
            std.mem.indexOf(u8, r, "\"status\":\"EXPIRED\"") != null)
        {
            return .{ .cancelled = {} };
        }

        if (std.mem.indexOf(u8, r, "\"status\":\"REJECTED\"") != null) {
            return .{ .failed = {} };
        }

        // NEW, PARTIALLY_FILLED, PENDING_NEW — keep waiting
        return .{ .pending = {} };
    }

    pub fn cancelOrderAsync(self: *const BinanceSpot, order_id: []const u8) CancelResult {
        var query_buf: [512]u8 = undefined;
        const query = std.fmt.bufPrint(&query_buf,
            "symbol={s}&orderId={s}",
            .{ self.tradingSymbol(), order_id },
        ) catch return .{ .failed = {} };

        var signed_buf: [1024]u8 = undefined;
        const signed = self.sign(query, &signed_buf);
        if (signed.len == 0) return .{ .failed = {} };

        var url_buf: [512]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf, "{s}/api/v3/order?{s}", .{ self.baseUrl(), signed }) catch return .{ .failed = {} };

        const h = [_]HttpClient.Header{self.apiKeyHeader()};
        _ = self.http.delete(url, &h) catch {
            return .{ .failed = {} };
        };

        _ = usleep(200_000); // 200ms

        const status = self.checkOrderStatus(order_id);
        return switch (status) {
            .filled => |fill| .{ .filled = fill },
            .cancelled => .{ .cancelled = {} },
            .pending => .{ .cancelled = {} },
            .failed => .{ .failed = {} },
        };
    }

    // ========== Position query ==========

    /// Binance Spot has no native position endpoint. Returns null.
    /// The bot's position is tracked via Turso transfers (source of truth).
    fn getPositionExchange(self: *const BinanceSpot) ?ExchangePosition {
        _ = self;
        return null;
    }

    /// Query account balance for discrepancy alerts. Not used as position source of truth.
    pub fn queryAccountBalance(self: *const BinanceSpot, asset: []const u8) ?f64 {
        var signed_buf: [1024]u8 = undefined;
        const signed = self.sign("", &signed_buf);
        if (signed.len == 0) return null;

        var url_buf: [512]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf, "{s}/api/v3/account?{s}", .{ self.baseUrl(), signed }) catch return null;

        const h = [_]HttpClient.Header{self.apiKeyHeader()};
        const resp = self.http.get(url, &h) catch return null;
        defer resp.deinit();

        const r = resp.body;
        return parseAccountBalance(r, asset);
    }

    // ========== JSON helpers ==========

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
        if (start >= json.len or json[start] != '"') {
            // Try parsing as bare number (Binance sometimes returns orderId as number)
            var end = start;
            while (end < json.len and json[end] != ',' and json[end] != '}' and json[end] != '"' and json[end] != ' ') : (end += 1) {}
            return json[start..end];
        }
        start += 1;
        const end = std.mem.indexOf(u8, json[start..], "\"") orelse return null;
        return json[start..][0..end];
    }

    /// Parse first fill from the fills array for commission data.
    pub fn parseFillCommission(json: []const u8, commission: *f64, asset_out: *[8]u8, asset_len: *usize) bool {
        const fills_pos = std.mem.indexOf(u8, json, "\"fills\":[") orelse return false;
        const start = fills_pos + "\"fills\":[".len;
        const end = std.mem.indexOf(u8, json[start..], "]") orelse return false;
        const first_fill = json[start..][0..end];

        commission.* = parseJsonFloat(first_fill, "\"commission\":\"") orelse parseJsonFloat(first_fill, "\"commission\":") orelse 0;
        if (parseJsonString(first_fill, "\"commissionAsset\":\"")) |asset| {
            const len = @min(asset.len, asset_out.len);
            @memcpy(asset_out[0..len], asset[0..len]);
            asset_len.* = len;
        } else {
            asset_len.* = 0;
        }
        return true;
    }

    /// Parse free balance for a given asset from /api/v3/account response.
    pub fn parseAccountBalance(json: []const u8, asset: []const u8) ?f64 {
        const balances_key = "\"balances\":";
        const list_pos = std.mem.indexOf(u8, json, balances_key) orelse return null;
        var list_start = list_pos + balances_key.len;
        while (list_start < json.len and json[list_start] != '[') : (list_start += 1) {}
        if (list_start >= json.len) return null;
        list_start += 1;

        var search = json[list_start..];
        while (search.len > 0) {
            var asset_key_buf: [64]u8 = undefined;
        const asset_key = std.fmt.bufPrint(&asset_key_buf, "\"asset\":\"{s}\"", .{asset}) catch return null;
            const asset_pos = std.mem.indexOf(u8, search, asset_key) orelse break;
            const entry_end = std.mem.indexOf(u8, search[asset_pos..], "}") orelse break;
            const entry = search[asset_pos..][0..entry_end];

            // Binance returns both free and locked; we want total (free + locked)
            const free = parseJsonFloat(entry, "\"free\":\"") orelse 0;
            const locked = parseJsonFloat(entry, "\"locked\":\"") orelse 0;
            return free + locked;
        }
        return null;
    }
};
