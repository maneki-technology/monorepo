const std = @import("std");
const http_mod = @import("http_client.zig");

extern "c" fn popen(cmd: [*:0]const u8, mode: [*:0]const u8) ?*anyopaque;
extern "c" fn pclose(fp: *anyopaque) c_int;
extern "c" fn fread(buf: [*]u8, size: usize, count: usize, fp: *anyopaque) usize;
extern "c" fn clock() c_long;
extern "c" fn getpid() c_int;

const CLOCKS_PER_SEC: f64 = 1_000_000.0;

pub const ResourceSample = struct {
    timestamp: f64,
    uptime_sec: f64,
    rss_mb: f64,
    cpu_sec: f64,
    disk_free_mb: f64,
    disk_used_pct: f64,
    disk_path: []const u8,
    ticks_per_min: f64,
    feed_gap_sec: f64,
    ws_lag_sec: f64,
    reconnect_count: u32,
    http_requests: u64,
    http_errors: u64,
    http_retries: u64,
    http_last_ms: f64,
    http_max_ms: f64,
};

pub const Thresholds = struct {
    rss_warn_mb: f64 = 512.0,
    disk_free_warn_mb: f64 = 1024.0,
    disk_used_warn_pct: f64 = 90.0,
    feed_gap_warn_sec: f64 = 180.0,
    ws_lag_warn_sec: f64 = 180.0,
    http_latency_warn_ms: f64 = 5000.0,
};

pub const Health = struct {
    status: []const u8,
    detail: []const u8,
};

pub const FeedWindow = struct {
    ticks: u32 = 0,
    max_gap_sec: f64 = 0,
    max_ws_lag_sec: f64 = 0,
    reconnect_count: u32 = 0,
};

pub fn sample(now: f64, uptime_start: f64, interval_sec: f64, disk_path: []const u8, feed: FeedWindow, http: http_mod.HttpClient.MetricsSnapshot) ResourceSample {
    const disk = sampleDisk(disk_path);
    const interval_min = if (interval_sec > 0) interval_sec / 60.0 else 5.0;
    return .{
        .timestamp = now,
        .uptime_sec = @max(0, now - uptime_start),
        .rss_mb = sampleRssMb(),
        .cpu_sec = sampleCpuSec(),
        .disk_free_mb = disk.free_mb,
        .disk_used_pct = disk.used_pct,
        .disk_path = disk_path,
        .ticks_per_min = @as(f64, @floatFromInt(feed.ticks)) / interval_min,
        .feed_gap_sec = feed.max_gap_sec,
        .ws_lag_sec = feed.max_ws_lag_sec,
        .reconnect_count = feed.reconnect_count,
        .http_requests = http.requests,
        .http_errors = http.errors,
        .http_retries = http.retries,
        .http_last_ms = http.last_ms,
        .http_max_ms = http.max_ms,
    };
}

pub fn classify(s: ResourceSample, t: Thresholds) Health {
    if (s.disk_free_mb > 0 and s.disk_free_mb < t.disk_free_warn_mb) return .{ .status = "DISK_LOW", .detail = "disk_free_mb_below_threshold" };
    if (s.disk_used_pct >= t.disk_used_warn_pct) return .{ .status = "DISK_HIGH", .detail = "disk_used_pct_above_threshold" };
    if (s.rss_mb >= t.rss_warn_mb) return .{ .status = "MEMORY_HIGH", .detail = "rss_mb_above_threshold" };
    if (s.feed_gap_sec >= t.feed_gap_warn_sec) return .{ .status = "FEED_GAP", .detail = "feed_gap_sec_above_threshold" };
    if (s.ws_lag_sec >= t.ws_lag_warn_sec) return .{ .status = "WS_LAG", .detail = "ws_lag_sec_above_threshold" };
    if (s.http_max_ms >= t.http_latency_warn_ms) return .{ .status = "HTTP_SLOW", .detail = "http_max_ms_above_threshold" };
    if (s.http_errors > 0) return .{ .status = "HTTP_ERRORS", .detail = "http_errors_observed" };
    return .{ .status = "OK", .detail = "" };
}

fn sampleCpuSec() f64 {
    const ticks = clock();
    if (ticks <= 0) return 0;
    return @as(f64, @floatFromInt(ticks)) / CLOCKS_PER_SEC;
}

fn sampleRssMb() f64 {
    if (readProcStatmRssMb()) |rss| return rss;
    if (readPsRssMb()) |rss| return rss;
    return 0;
}

fn readProcStatmRssMb() ?f64 {
    var cmd_buf: [128]u8 = undefined;
    const cmd = std.fmt.bufPrintZ(&cmd_buf, "cat /proc/{d}/statm 2>/dev/null", .{getpid()}) catch return null;
    const fp = popen(cmd, "r") orelse return null;
    defer _ = pclose(fp);
    var buf: [128]u8 = undefined;
    const n = fread(&buf, 1, buf.len - 1, fp);
    var fields = std.mem.tokenizeScalar(u8, buf[0..n], ' ');
    _ = fields.next() orelse return null;
    const rss_pages_txt = fields.next() orelse return null;
    const rss_pages = std.fmt.parseFloat(f64, rss_pages_txt) catch return null;
    return rss_pages * 4096.0 / (1024.0 * 1024.0);
}

fn readPsRssMb() ?f64 {
    var cmd_buf: [128]u8 = undefined;
    const cmd = std.fmt.bufPrintZ(&cmd_buf, "ps -o rss= -p {d}", .{getpid()}) catch return null;
    const fp = popen(cmd, "r") orelse return null;
    defer _ = pclose(fp);

    var out: [128]u8 = undefined;
    const n = fread(&out, 1, out.len - 1, fp);
    const txt = std.mem.trim(u8, out[0..n], " \t\r\n");
    if (txt.len == 0) return null;
    const rss_kb = std.fmt.parseFloat(f64, txt) catch return null;
    return rss_kb / 1024.0;
}

const DiskSample = struct {
    free_mb: f64,
    used_pct: f64,
};

fn sampleDisk(path: []const u8) DiskSample {
    var cmd_buf: [512]u8 = undefined;
    const cmd = std.fmt.bufPrintZ(&cmd_buf, "df -k '{s}'", .{path}) catch return .{ .free_mb = 0, .used_pct = 0 };
    const fp = popen(cmd, "r") orelse return .{ .free_mb = 0, .used_pct = 0 };
    defer _ = pclose(fp);

    var out: [1024]u8 = undefined;
    const n = fread(&out, 1, out.len - 1, fp);
    return parseDf(out[0..n]) orelse .{ .free_mb = 0, .used_pct = 0 };
}

pub fn parseDf(output: []const u8) ?DiskSample {
    var lines = std.mem.splitScalar(u8, output, '\n');
    _ = lines.next() orelse return null;
    const data = lines.next() orelse return null;
    var fields = std.mem.tokenizeAny(u8, data, " \t");
    _ = fields.next() orelse return null; // filesystem
    _ = fields.next() orelse return null; // 1K-blocks
    _ = fields.next() orelse return null; // used
    const avail_txt = fields.next() orelse return null;
    const use_pct_txt = fields.next() orelse return null;
    const avail_kb = std.fmt.parseFloat(f64, avail_txt) catch return null;
    const pct_txt = std.mem.trim(u8, use_pct_txt, "%");
    const used_pct = std.fmt.parseFloat(f64, pct_txt) catch return null;
    return .{ .free_mb = avail_kb / 1024.0, .used_pct = used_pct };
}
