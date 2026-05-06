/// Telegram + ntfy notification client — native HTTP, no curl dependency.
const std = @import("std");
const http_mod = @import("http_client.zig");
const HttpClient = http_mod.HttpClient;

extern "c" fn getenv(name: [*:0]const u8) ?[*:0]const u8;
extern "c" fn usleep(usec: c_uint) c_int;
extern "c" fn popen(cmd: [*:0]const u8, mode: [*:0]const u8) ?*anyopaque;
extern "c" fn pclose(fp: *anyopaque) c_int;
extern "c" fn fread(buf: [*]u8, size: usize, count: usize, fp: *anyopaque) usize;

pub const Telegram = struct {
    token: []const u8,
    chat_id: []const u8,
    ntfy_topic: []const u8,
    http: *HttpClient,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, http: *HttpClient) ?Telegram {
        const token_ptr = getenv("TELEGRAM_BOT_TOKEN") orelse {
            std.debug.print("  [telegram] TELEGRAM_BOT_TOKEN not set, notifications disabled.\n", .{});
            return null;
        };
        const chat_ptr = getenv("TELEGRAM_CHAT_ID") orelse {
            std.debug.print("  [telegram] TELEGRAM_CHAT_ID not set, notifications disabled.\n", .{});
            return null;
        };
        const token = std.mem.sliceTo(token_ptr, 0);
        const chat_id = std.mem.sliceTo(chat_ptr, 0);
        const ntfy = if (getenv("NTFY_TOPIC")) |ptr| std.mem.sliceTo(ptr, 0) else "";
        std.debug.print("  [telegram] Notifications enabled.\n", .{});
        return .{ .token = token, .chat_id = chat_id, .ntfy_topic = ntfy, .http = http, .allocator = allocator };
    }

    pub fn notifyBuy(self: *const Telegram, price: f64, size: f64, regime: []const u8, instance: []const u8) void {
        var buf: [512]u8 = undefined;
        const msg = std.fmt.bufPrint(
            &buf,
            "🟢 BUY ${d:.2}\nSize: {d:.6} BTC\nRegime: {s}\nInstance: {s}",
            .{ price, size, regime, instance },
        ) catch return;
        self.send(msg);
    }

    pub fn notifyDeposit(self: *const Telegram, amount: f64, capital: f64, instance: []const u8) void {
        var buf: [256]u8 = undefined;
        const msg = std.fmt.bufPrint(
            &buf,
            "\xf0\x9f\x92\xb0 Deposit: +${d:.2}\nCapital: ${d:.2}\nInstance: {s}",
            .{ amount, capital, instance },
        ) catch return;
        self.send(msg);
    }

    pub fn notifySell(self: *const Telegram, price: f64, pnl: f64, exit_type: []const u8, regime: []const u8, instance: []const u8) void {
        var buf: [512]u8 = undefined;
        const emoji = if (pnl >= 0) "🟢" else "🔴";
        const msg = std.fmt.bufPrint(
            &buf,
            "{s} SELL ${d:.2}\nPnL: ${d:.2}\nExit: {s}\nRegime: {s}\nInstance: {s}",
            .{ emoji, price, pnl, exit_type, regime, instance },
        ) catch return;
        self.send(msg);
    }

    pub fn notifyRegimeChange(self: *const Telegram, from: []const u8, to: []const u8, price: f64, instance: []const u8) void {
        var buf: [256]u8 = undefined;
        const msg = std.fmt.bufPrint(
            &buf,
            "⚡ Regime: {s} → {s}\nPrice: ${d:.2}\nInstance: {s}",
            .{ from, to, price, instance },
        ) catch return;
        self.send(msg);
    }

    pub fn notifyStartup(self: *const Telegram, regime: []const u8, capital: f64, in_position: bool, instance: []const u8) void {
        var buf: [256]u8 = undefined;
        const pos_str = if (in_position) "OPEN" else "NONE";
        const msg = std.fmt.bufPrint(
            &buf,
            "🚀 Bot started\nRegime: {s}\nCapital: ${d:.2}\nPosition: {s}\nInstance: {s}",
            .{ regime, capital, pos_str, instance },
        ) catch return;
        self.send(msg);
    }

    pub fn notifyShutdown(self: *const Telegram, equity: f64, closed: u32, instance: []const u8) void {
        var buf: [256]u8 = undefined;
        const msg = std.fmt.bufPrint(
            &buf,
            "🛑 Bot stopped\nEquity: ${d:.2}\nClosed: {d}\nInstance: {s}",
            .{ equity, closed, instance },
        ) catch return;
        self.sendSync(msg);
    }

    pub fn notifyCheckpointWarning(self: *const Telegram, health: []const u8, detail: []const u8, instance: []const u8) void {
        var buf: [512]u8 = undefined;
        const msg = std.fmt.bufPrint(
            &buf,
            "⚠️ Checkpoint warning\nHealth: {s}\nDetail: {s}\nInstance: {s}",
            .{ health, detail, instance },
        ) catch return;
        self.send(msg);
    }

    pub fn notifyLowBnb(self: *const Telegram, quantity: f64, price: f64, value_quote: f64, threshold_quote: f64, instance: []const u8) void {
        var buf: [512]u8 = undefined;
        const msg = std.fmt.bufPrint(
            &buf,
            "Low Managed BNB\nBalance: {d:.8} BNB\nPrice: ${d:.2}\nValue: ${d:.2}\nThreshold: ${d:.2}\nInstance: {s}",
            .{ quantity, price, value_quote, threshold_quote, instance },
        ) catch return;
        self.send(msg);
    }

    pub fn notifyFundingRate(self: *const Telegram, symbol: []const u8, avg: f64, threshold: f64, updated_at: f64, latest_time: f64, now: f64, instance: []const u8) void {
        var buf: [512]u8 = undefined;
        const msg = formatFundingRateMessage(&buf, symbol, avg, threshold, updated_at, latest_time, now, instance) catch return;
        self.send(msg);
    }

    pub fn notifyFundingRateStale(self: *const Telegram, symbol: []const u8, avg: f64, updated_at: f64, latest_time: f64, now: f64, instance: []const u8) void {
        var buf: [512]u8 = undefined;
        const msg = formatFundingRateStaleMessage(&buf, symbol, avg, updated_at, latest_time, now, instance) catch return;
        self.send(msg);
    }

    fn send(self: *const Telegram, text: []const u8) void {
        const Context = struct {
            tg: *const Telegram,
            msg: [512]u8,
            msg_len: usize,
        };

        var ctx = self.allocator.create(Context) catch return;
        ctx.tg = self;
        ctx.msg_len = text.len;
        @memcpy(ctx.msg[0..text.len], text);

        const thread = std.Thread.spawn(.{}, asyncSend, .{ ctx, self.allocator }) catch {
            self.allocator.destroy(ctx);
            return;
        };
        thread.detach();
    }

    fn asyncSend(ctx: anytype, allocator: std.mem.Allocator) void {
        defer allocator.destroy(ctx);
        const tg: *const Telegram = ctx.tg;
        const msg = ctx.msg[0..ctx.msg_len];
        doSend(tg, msg);
    }

    fn doSend(self: *const Telegram, text: []const u8) void {
        // Send to Telegram (retry once on stale connection)
        var url_buf: [256]u8 = undefined;
        const url = std.fmt.bufPrint(
            &url_buf,
            "https://api.telegram.org/bot{s}/sendMessage",
            .{self.token},
        ) catch return;

        var body_buf: [1024]u8 = undefined;
        const body = std.fmt.bufPrint(
            &body_buf,
            "{{\"chat_id\":\"{s}\",\"text\":\"{s}\"}}",
            .{ self.chat_id, text },
        ) catch return;

        const headers = [_]HttpClient.Header{
            .{ .name = "content-type", .value = "application/json" },
        };

        var tg_attempt: u32 = 0;
        while (tg_attempt < 2) : (tg_attempt += 1) {
            if (self.http.post(url, &headers, body)) |resp| {
                resp.deinit();
                break;
            } else |_| {
                if (tg_attempt == 0) {
                    _ = usleep(1_000_000);
                } else {
                    std.debug.print("  [telegram] Send failed.\n", .{});
                }
            }
        }

        // Send to ntfy
        if (self.ntfy_topic.len > 0) {
            var ntfy_url_buf: [128]u8 = undefined;
            const ntfy_url = std.fmt.bufPrint(
                &ntfy_url_buf,
                "https://ntfy.sh/{s}",
                .{self.ntfy_topic},
            ) catch return;

            var ntfy_attempt: u32 = 0;
            while (ntfy_attempt < 2) : (ntfy_attempt += 1) {
                if (self.http.post(ntfy_url, &.{}, text)) |resp| {
                    resp.deinit();
                    break;
                } else |_| {
                    if (ntfy_attempt == 0) {
                        _ = usleep(1_000_000);
                    } else {
                        std.debug.print("  [ntfy] Send failed.\n", .{});
                    }
                }
            }
        }
    }

    /// Synchronous send — for shutdown (must complete before exit).
    /// Uses popen(curl) as fallback since HTTP client connections may be stale.
    fn sendSync(self: *const Telegram, text: []const u8) void {
        // Skip native HTTP — connections are stale after signal interrupt.
        // Go straight to curl which is reliable during shutdown.

        // curl for reliability during shutdown
        var url_buf: [256]u8 = undefined;
        const url_str = std.fmt.bufPrint(
            &url_buf,
            "curl -s -X POST 'https://api.telegram.org/bot{s}/sendMessage' -H 'Content-Type: application/json' -d '{{\"chat_id\":\"{s}\",\"text\":\"{s}\"}}'\x00",
            .{ self.token, self.chat_id, text },
        ) catch return;
        const fp = popen(@ptrCast(url_buf[0 .. url_str.len - 1 :0]), "r") orelse return;
        var drain: [512]u8 = undefined;
        while (fread(@ptrCast(&drain), 1, drain.len, fp) > 0) {}
        _ = pclose(fp);

        // ntfy fallback
        if (self.ntfy_topic.len > 0) {
            var ntfy_buf: [512]u8 = undefined;
            const ntfy_cmd = std.fmt.bufPrint(
                &ntfy_buf,
                "curl -s -d '{s}' ntfy.sh/{s}\x00",
                .{ text, self.ntfy_topic },
            ) catch return;
            const nfp = popen(@ptrCast(ntfy_buf[0 .. ntfy_cmd.len - 1 :0]), "r") orelse return;
            while (fread(@ptrCast(&drain), 1, drain.len, nfp) > 0) {}
            _ = pclose(nfp);
        }
    }
};

pub fn fundingRateStatus(avg: f64, threshold: f64) []const u8 {
    return if (threshold > 0 and avg > threshold) "ELEVATED (skip active)" else "NORMAL";
}

pub fn fundingCacheStatus(updated_at: f64, now: f64) []const u8 {
    if (updated_at <= 0) return "EMPTY";
    const age = @max(0, now - updated_at);
    if (age <= 9.0 * 3600.0) return "FRESH";
    if (age <= 24.0 * 3600.0) return "STALE";
    return "STALE >24h";
}

pub fn formatFundingRateMessage(buf: []u8, symbol: []const u8, avg: f64, threshold: f64, updated_at: f64, latest_time: f64, now: f64, instance: []const u8) ![]const u8 {
    const age_hours = if (updated_at > 0) @max(0, now - updated_at) / 3600.0 else 0;
    const latest_age_hours = if (latest_time > 0) @max(0, now - latest_time) / 3600.0 else 0;
    return std.fmt.bufPrint(
        buf,
        "Funding Rate Update\nSymbol: {s}\n24h avg: {d:.4}%\nThreshold: {d:.4}%\nStatus: {s}\nLatest print: {d:.1}h ago\nCache: {s} ({d:.1}h)\nInstance: {s}",
        .{ symbol, avg * 100, threshold * 100, fundingRateStatus(avg, threshold), latest_age_hours, fundingCacheStatus(updated_at, now), age_hours, instance },
    );
}

pub fn formatFundingRateStaleMessage(buf: []u8, symbol: []const u8, avg: f64, updated_at: f64, latest_time: f64, now: f64, instance: []const u8) ![]const u8 {
    const age_hours = if (updated_at > 0) @max(0, now - updated_at) / 3600.0 else 0;
    const latest_age_hours = if (latest_time > 0) @max(0, now - latest_time) / 3600.0 else 0;
    return std.fmt.bufPrint(
        buf,
        "Funding Rate Warning\nSymbol: {s}\nRefresh failed\nCached 24h avg: {d:.4}%\nLatest print: {d:.1}h ago\nCache: {s} ({d:.1}h)\nInstance: {s}",
        .{ symbol, avg * 100, latest_age_hours, fundingCacheStatus(updated_at, now), age_hours, instance },
    );
}
