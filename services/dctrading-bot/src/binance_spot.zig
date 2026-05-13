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
    min_qty: f64 = 0,
    step_size: f64 = 0,
    min_notional: f64 = 0,
    server_time_offset_ms: i64 = 0,
    server_time_synced_at_ms: i64 = 0,
    bnb_valuation_symbol: [16]u8 = undefined,
    bnb_valuation_symbol_len: usize = 0,
    fee_missing_order: [64]u8 = undefined,
    fee_missing_order_len: usize = 0,
    fee_missing_count: u32 = 0,
    fee_missing_max_checks: u32 = 20,
    exchange_health: [32]u8 = undefined,
    exchange_health_len: usize = 0,
    exchange_error: [128]u8 = undefined,
    exchange_error_len: usize = 0,

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

        var client = BinanceSpot{
            .api_key = key,
            .api_secret = secret,
            .http = http,
            .symbol = symbol.buf,
            .symbol_len = symbol.len,
            .base_url = base_url,
            .base_url_len = base_url_str.len,
        };
        const bnb_symbol = if (getenv("BINANCE_BNB_VALUATION_SYMBOL")) |ptr| std.mem.sliceTo(ptr, 0) else "BNBUSDT";
        const bnb_symbol_len = @min(bnb_symbol.len, client.bnb_valuation_symbol.len);
        @memcpy(client.bnb_valuation_symbol[0..bnb_symbol_len], bnb_symbol[0..bnb_symbol_len]);
        client.bnb_valuation_symbol_len = bnb_symbol_len;
        if (getenv("BINANCE_FEE_LOOKUP_MAX_CHECKS")) |ptr| {
            client.fee_missing_max_checks = std.fmt.parseInt(u32, std.mem.sliceTo(ptr, 0), 10) catch 20;
        }
        client.syncServerTime() orelse {
            std.debug.print("  [binance_spot] Failed to sync server time; Spot trading disabled.\n", .{});
            return null;
        };
        client.loadSymbolFilters() orelse {
            std.debug.print("  [binance_spot] Failed to load symbol filters for {s}; Spot trading disabled.\n", .{symbol.slice()});
            return null;
        };

        std.debug.print("  [binance_spot] Spot trading enabled for {s} min_qty={d:.8} step={d:.8} min_notional=${d:.2}.\n", .{
            symbol.slice(),
            client.min_qty,
            client.step_size,
            client.min_notional,
        });
        return client;
    }

    pub fn initForTest(http: *HttpClient, key: []const u8, secret: []const u8, trading_symbol: []const u8, base_url_str: []const u8) BinanceSpot {
        const symbol = normalizeSymbol(trading_symbol);
        var base_url: [64]u8 = undefined;
        const base_len = @min(base_url_str.len, base_url.len);
        @memcpy(base_url[0..base_len], base_url_str[0..base_len]);
        var client = BinanceSpot{
            .api_key = key,
            .api_secret = secret,
            .http = http,
            .symbol = symbol.buf,
            .symbol_len = symbol.len,
            .base_url = base_url,
            .base_url_len = base_len,
            .server_time_synced_at_ms = nowMs(),
        };
        @memcpy(client.bnb_valuation_symbol[0..7], "BNBUSDT");
        client.bnb_valuation_symbol_len = 7;
        return client;
    }

    pub fn healthStatus(self: *const BinanceSpot) []const u8 {
        if (self.exchange_health_len == 0) return "OK";
        return self.exchange_health[0..self.exchange_health_len];
    }

    pub fn healthError(self: *const BinanceSpot) []const u8 {
        return self.exchange_error[0..self.exchange_error_len];
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

    fn bnbValuationSymbol(self: *const BinanceSpot) []const u8 {
        return self.bnb_valuation_symbol[0..self.bnb_valuation_symbol_len];
    }

    fn syncServerTime(self: *BinanceSpot) ?void {
        var url_buf: [128]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf, "{s}/api/v3/time", .{self.baseUrl()}) catch return null;

        const before = nowMs();
        const resp = self.http.get(url, &.{}) catch return null;
        const after = nowMs();
        defer resp.deinit();
        if (!isSuccess(resp.status) or logBinanceError("time", resp.body)) return null;

        const server_time = parseJsonInt(resp.body, "\"serverTime\":") orelse return null;
        const local_midpoint = @divTrunc(before + after, 2);
        self.server_time_offset_ms = server_time - local_midpoint;
        self.server_time_synced_at_ms = after;
        std.debug.print("  [binance_spot] Server time offset: {d}ms.\n", .{self.server_time_offset_ms});
    }

    fn maybeSyncServerTime(self: *BinanceSpot) void {
        const now = nowMs();
        if (self.server_time_synced_at_ms > 0 and now - self.server_time_synced_at_ms < 3600 * 1000) return;
        _ = self.syncServerTime();
    }

    fn loadSymbolFilters(self: *BinanceSpot) ?void {
        var url_buf: [256]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf, "{s}/api/v3/exchangeInfo?symbol={s}", .{ self.baseUrl(), self.tradingSymbol() }) catch return null;

        const resp = self.http.get(url, &.{}) catch return null;
        defer resp.deinit();
        if (!isSuccess(resp.status) or hasBinanceError(resp.body)) return null;

        parseSymbolFilters(resp.body, &self.min_qty, &self.step_size, &self.min_notional) orelse return null;
    }

    fn normalizeOrderQty(self: *const BinanceSpot, qty: f64) ?f64 {
        if (qty <= 0) return null;

        var normalized = qty;
        if (self.step_size > 0) {
            normalized = @floor(qty / self.step_size) * self.step_size;
        }
        if (normalized <= 0 or (self.min_qty > 0 and normalized + 0.000000000001 < self.min_qty)) {
            std.debug.print("  [binance_spot] qty {d:.8} below minQty {d:.8} after step rounding.\n", .{ normalized, self.min_qty });
            return null;
        }

        if (self.min_notional > 0) {
            const px = self.queryTickerPrice(self.tradingSymbol()) orelse {
                std.debug.print("  [binance_spot] cannot validate minNotional without ticker price.\n", .{});
                return null;
            };
            if (normalized * px + 0.00000001 < self.min_notional) {
                std.debug.print("  [binance_spot] order notional ${d:.2} below minNotional ${d:.2}.\n", .{ normalized * px, self.min_notional });
                return null;
            }
        }

        return normalized;
    }

    fn quoteOrderAmount(self: *const BinanceSpot, qty: f64, signal_price: f64) ?f64 {
        if (qty <= 0) return null;
        const px = if (signal_price > 0) signal_price else self.queryTickerPrice(self.tradingSymbol()) orelse {
            std.debug.print("  [binance_spot] cannot price quoteOrderQty without signal or ticker price.\n", .{});
            return null;
        };
        const quote_amount = qty * px;
        if (self.min_notional > 0 and quote_amount + 0.00000001 < self.min_notional) {
            std.debug.print("  [binance_spot] quoteOrderQty ${d:.2} below minNotional ${d:.2}.\n", .{ quote_amount, self.min_notional });
            return null;
        }
        return quote_amount;
    }

    fn isSuccess(status: std.http.Status) bool {
        const code = @intFromEnum(status);
        return code >= 200 and code < 300;
    }

    fn hasBinanceError(body: []const u8) bool {
        return std.mem.indexOf(u8, body, "\"code\"") != null and std.mem.indexOf(u8, body, "\"msg\"") != null;
    }

    fn classifyBinanceCode(code: i64) []const u8 {
        return switch (code) {
            -1021 => "timestamp",
            -1013 => "filter",
            -2010 => "order_rejected",
            -2011 => "unknown_order",
            -1121 => "invalid_symbol",
            -2015 => "auth",
            else => "api",
        };
    }

    fn logBinanceError(context: []const u8, body: []const u8) bool {
        const code = parseJsonInt(body, "\"code\":") orelse return false;
        const msg = parseJsonString(body, "\"msg\":\"") orelse "";
        std.debug.print("  [binance_spot] {s} error class={s} code={d} msg={s}\n", .{ context, classifyBinanceCode(code), code, msg });
        return true;
    }

    fn setHealth(self: *BinanceSpot, status: []const u8, detail: []const u8) void {
        const slen = @min(status.len, self.exchange_health.len);
        @memcpy(self.exchange_health[0..slen], status[0..slen]);
        self.exchange_health_len = slen;
        const dlen = @min(detail.len, self.exchange_error.len);
        @memcpy(self.exchange_error[0..dlen], detail[0..dlen]);
        self.exchange_error_len = dlen;
    }

    fn clearHealth(self: *BinanceSpot) void {
        self.exchange_health_len = 0;
        self.exchange_error_len = 0;
    }

    pub fn parseSymbolFilters(json: []const u8, min_qty: *f64, step_size: *f64, min_notional: *f64) ?void {
        const lot_pos = std.mem.indexOf(u8, json, "\"filterType\":\"LOT_SIZE\"") orelse return null;
        const lot_end = std.mem.indexOf(u8, json[lot_pos..], "}") orelse return null;
        const lot = json[lot_pos..][0..lot_end];
        min_qty.* = parseJsonFloat(lot, "\"minQty\":\"") orelse return null;
        step_size.* = parseJsonFloat(lot, "\"stepSize\":\"") orelse return null;

        if (std.mem.indexOf(u8, json, "\"filterType\":\"MIN_NOTIONAL\"")) |notional_pos| {
            const notional_end = std.mem.indexOf(u8, json[notional_pos..], "}") orelse return null;
            const notional = json[notional_pos..][0..notional_end];
            min_notional.* = parseJsonFloat(notional, "\"minNotional\":\"") orelse 0;
        } else if (std.mem.indexOf(u8, json, "\"filterType\":\"NOTIONAL\"")) |notional_pos| {
            const notional_end = std.mem.indexOf(u8, json[notional_pos..], "}") orelse return null;
            const notional = json[notional_pos..][0..notional_end];
            min_notional.* = parseJsonFloat(notional, "\"minNotional\":\"") orelse 0;
        } else {
            min_notional.* = 0;
        }

        return {};
    }

    /// Build signed URL or body: append timestamp, recvWindow, and HMAC signature.
    fn sign(self: *const BinanceSpot, query: []const u8, out: []u8) []const u8 {
        @constCast(self).maybeSyncServerTime();
        const ts = nowMs() + self.server_time_offset_ms;
        var signed_query_buf: [1024]u8 = undefined;
        var signed: []const u8 = undefined;
        if (query.len > 0) {
            signed = std.fmt.bufPrint(&signed_query_buf, "{s}&timestamp={d}&recvWindow=5000", .{ query, ts }) catch return "";
        } else {
            signed = std.fmt.bufPrint(&signed_query_buf, "timestamp={d}&recvWindow=5000", .{ts}) catch return "";
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
        const pending = self.submitOrderAsync(side, qty, 0) orelse return null;
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

    pub fn submitOrderAsync(self: *const BinanceSpot, side: Side, qty: f64, signal_price: f64) ?PendingOrder {
        const side_str = if (side == .buy) "BUY" else "SELL";
        const quote_amount = if (side == .buy) self.quoteOrderAmount(qty, signal_price) orelse return null else 0;
        const order_qty = if (side == .buy) qty else self.normalizeOrderQty(qty) orelse return null;
        var query_buf: [512]u8 = undefined;
        const query = if (side == .buy)
            std.fmt.bufPrint(
                &query_buf,
                "symbol={s}&side={s}&type=MARKET&quoteOrderQty={d:.8}",
                .{ self.tradingSymbol(), side_str, quote_amount },
            ) catch return null
        else
            std.fmt.bufPrint(
                &query_buf,
                "symbol={s}&side={s}&type=MARKET&quantity={d:.8}",
                .{ self.tradingSymbol(), side_str, order_qty },
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

        if (!isSuccess(resp.status) or logBinanceError("submitOrder", r)) {
            return null;
        }

        const pending_qty = if (side == .buy) qty else order_qty;
        var pending: PendingOrder = .{ .side = side, .qty = pending_qty, .quote_amount = quote_amount, .dust_qty_threshold = self.min_qty };
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
        const query = std.fmt.bufPrint(
            &query_buf,
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
        if (!isSuccess(resp.status) or logBinanceError("checkOrder", r)) return .{ .failed = {} };

        if (std.mem.indexOf(u8, r, "\"status\":\"FILLED\"") != null) {
            var fill: OrderFill = .{ .fill_price = 0, .fill_qty = 0, .status = .filled };

            // Binance returns string numbers; parseJsonFloat handles quotes
            fill.fill_qty = parseJsonFloat(r, "\"executedQty\":\"") orelse parseJsonFloat(r, "\"executedQty\":") orelse 0;
            const quote_qty = parseJsonFloat(r, "\"cummulativeQuoteQty\":\"") orelse parseJsonFloat(r, "\"cummulativeQuoteQty\":") orelse 0;
            fill.quote_amount = quote_qty;
            if (fill.fill_qty > 0) {
                fill.fill_price = quote_qty / fill.fill_qty;
            }

            if (!self.attachTradeCommission(order_id, &fill)) {
                return .{ .pending = {} };
            }

            const len = @min(order_id.len, fill.order_id.len);
            @memcpy(fill.order_id[0..len], order_id[0..len]);
            fill.order_id_len = len;

            std.debug.print("  [binance_spot] checkOrder: filled price=${d:.2} qty={d:.8} comm={d:.8} {s}\n", .{
                fill.fill_price,
                fill.fill_qty,
                fill.commission,
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
        const query = std.fmt.bufPrint(
            &query_buf,
            "symbol={s}&orderId={s}",
            .{ self.tradingSymbol(), order_id },
        ) catch return .{ .failed = {} };

        var signed_buf: [1024]u8 = undefined;
        const signed = self.sign(query, &signed_buf);
        if (signed.len == 0) return .{ .failed = {} };

        var url_buf: [512]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf, "{s}/api/v3/order?{s}", .{ self.baseUrl(), signed }) catch return .{ .failed = {} };

        const h = [_]HttpClient.Header{self.apiKeyHeader()};
        const resp = self.http.delete(url, &h) catch {
            return .{ .failed = {} };
        };
        defer resp.deinit();
        if (!isSuccess(resp.status) and resp.status != .not_found) {
            _ = logBinanceError("cancelOrder", resp.body);
            return .{ .failed = {} };
        }

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
        if (!isSuccess(resp.status) or logBinanceError("account", resp.body)) return null;

        const r = resp.body;
        return parseAccountBalance(r, asset);
    }

    fn attachTradeCommission(self: *const BinanceSpot, order_id: []const u8, fill: *OrderFill) bool {
        var query_buf: [512]u8 = undefined;
        const query = std.fmt.bufPrint(
            &query_buf,
            "symbol={s}&orderId={s}",
            .{ self.tradingSymbol(), order_id },
        ) catch return false;

        var signed_buf: [1024]u8 = undefined;
        const signed = self.sign(query, &signed_buf);
        if (signed.len == 0) return false;

        var url_buf: [512]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf, "{s}/api/v3/myTrades?{s}", .{ self.baseUrl(), signed }) catch return false;

        const h = [_]HttpClient.Header{self.apiKeyHeader()};
        var attempt: u8 = 0;
        while (attempt < 3) : (attempt += 1) {
            const resp = self.http.get(url, &h) catch |err| {
                std.debug.print("  [binance_spot] commission lookup failed: {s}\n", .{@errorName(err)});
                _ = usleep(150_000);
                continue;
            };
            defer resp.deinit();
            if (!isSuccess(resp.status) or logBinanceError("myTrades", resp.body)) {
                std.debug.print("  [binance_spot] commission lookup returned API error for order {s}\n", .{order_id});
                _ = usleep(150_000);
                continue;
            }

            if (parseTradeCommissions(resp.body, &fill.commission, &fill.commission_asset, &fill.commission_asset_len)) {
                fill.commission_usd = self.valueCommissionUsd(fill.*);
                @constCast(self).resetFeeMissing(order_id);
                @constCast(self).clearHealth();
                return true;
            }

            _ = usleep(150_000);
        }

        if (@constCast(self).recordFeeMissing(order_id)) {
            std.debug.print("  [binance_spot] commission lookup timed out for order {s}; posting with configured fallback fee and manual reconciliation required.\n", .{order_id});
            @constCast(self).setHealth("EXCHANGE_RECONCILE", "binance_fee_lookup_timeout_manual_reconciliation_required");
            fill.commission = 0;
            fill.commission_usd = 0;
            fill.commission_asset_len = 0;
            return true;
        }

        std.debug.print("  [binance_spot] commission lookup returned no trade fees for order {s}; keeping order pending.\n", .{order_id});
        return false;
    }

    fn resetFeeMissing(self: *BinanceSpot, order_id: []const u8) void {
        if (self.fee_missing_order_len == order_id.len and std.mem.eql(u8, self.fee_missing_order[0..self.fee_missing_order_len], order_id)) {
            self.fee_missing_order_len = 0;
            self.fee_missing_count = 0;
        }
    }

    fn recordFeeMissing(self: *BinanceSpot, order_id: []const u8) bool {
        if (self.fee_missing_order_len != order_id.len or !std.mem.eql(u8, self.fee_missing_order[0..self.fee_missing_order_len], order_id)) {
            const len = @min(order_id.len, self.fee_missing_order.len);
            @memcpy(self.fee_missing_order[0..len], order_id[0..len]);
            self.fee_missing_order_len = len;
            self.fee_missing_count = 0;
        }
        self.fee_missing_count += 1;
        return self.fee_missing_max_checks > 0 and self.fee_missing_count >= self.fee_missing_max_checks;
    }

    fn valueCommissionUsd(self: *const BinanceSpot, fill: OrderFill) f64 {
        if (fill.commission <= 0 or fill.commission_asset_len == 0) return 0;

        const asset = fill.commission_asset[0..fill.commission_asset_len];
        if (std.mem.eql(u8, asset, "USD") or std.mem.eql(u8, asset, "USDT")) return fill.commission;
        if (std.mem.eql(u8, asset, "BTC")) return 0;
        if (std.mem.eql(u8, asset, "BNB")) {
            if (self.queryTickerPrice(self.bnbValuationSymbol())) |bnb_usdt| {
                return fill.commission * bnb_usdt;
            }
        }
        return 0;
    }

    fn queryTickerPrice(self: *const BinanceSpot, symbol: []const u8) ?f64 {
        var url_buf: [256]u8 = undefined;
        const url = std.fmt.bufPrint(&url_buf, "{s}/api/v3/ticker/price?symbol={s}", .{ self.baseUrl(), symbol }) catch return null;

        const resp = self.http.get(url, &.{}) catch return null;
        defer resp.deinit();
        if (!isSuccess(resp.status) or logBinanceError("ticker", resp.body)) return null;

        return parseJsonFloat(resp.body, "\"price\":\"") orelse parseJsonFloat(resp.body, "\"price\":");
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

    pub fn parseJsonInt(json: []const u8, key: []const u8) ?i64 {
        const pos = std.mem.indexOf(u8, json, key) orelse return null;
        var start = pos + key.len;
        while (start < json.len and (json[start] == ' ' or json[start] == '"')) : (start += 1) {}
        var end = start;
        while (end < json.len and json[end] != ',' and json[end] != '}' and json[end] != '"') : (end += 1) {}
        return std.fmt.parseInt(i64, json[start..end], 10) catch null;
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

    /// Parse and aggregate commissions from /api/v3/myTrades.
    /// Returns false if no commission metadata is present or if assets differ.
    pub fn parseTradeCommissions(json: []const u8, commission: *f64, asset_out: *[8]u8, asset_len: *usize) bool {
        var search = json;
        var total: f64 = 0;
        var found = false;
        var expected_asset: [8]u8 = undefined;
        var expected_len: usize = 0;

        while (std.mem.indexOf(u8, search, "\"commission\"")) |commission_pos| {
            const entry_end = std.mem.indexOf(u8, search[commission_pos..], "}") orelse search.len - commission_pos;
            const entry = search[commission_pos..][0..entry_end];
            const fee = parseJsonFloat(entry, "\"commission\":\"") orelse parseJsonFloat(entry, "\"commission\":") orelse return false;
            const asset = parseJsonString(entry, "\"commissionAsset\":\"") orelse return false;

            if (!found) {
                expected_len = @min(asset.len, expected_asset.len);
                @memcpy(expected_asset[0..expected_len], asset[0..expected_len]);
                found = true;
            } else if (asset.len != expected_len or !std.mem.eql(u8, asset[0..expected_len], expected_asset[0..expected_len])) {
                return false;
            }

            total += fee;
            search = search[commission_pos + entry.len ..];
        }

        if (!found) return false;
        commission.* = total;
        @memcpy(asset_out[0..expected_len], expected_asset[0..expected_len]);
        asset_len.* = expected_len;
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
