/// Shared HTTP client wrapper for HTTPS JSON APIs.
/// Thread-safe: all requests serialize through a mutex to protect
/// the underlying std.http.Client connection pool.
const std = @import("std");
const http = std.http;
const Uri = std.Uri;
const Io = std.Io;

pub const HttpClient = struct {
    client: http.Client,
    allocator: std.mem.Allocator,
    io: Io,
    mutex: std.atomic.Mutex = .unlocked,
    request_count: u64 = 0,
    error_count: u64 = 0,
    retry_count: u64 = 0,
    last_latency_ms: f64 = 0,
    max_latency_ms: f64 = 0,

    pub fn init(allocator: std.mem.Allocator, io: Io) HttpClient {
        return .{
            .client = .{ .allocator = allocator, .io = io },
            .allocator = allocator,
            .io = io,
        };
    }

    pub fn deinit(self: *HttpClient) void {
        self.client.deinit();
    }

    pub const Header = struct {
        name: []const u8,
        value: []const u8,
    };

    pub const Response = struct {
        status: http.Status,
        body: []const u8,
        allocator: std.mem.Allocator,

        pub fn deinit(self: *const Response) void {
            self.allocator.free(self.body);
        }
    };

    pub const MetricsSnapshot = struct {
        requests: u64 = 0,
        errors: u64 = 0,
        retries: u64 = 0,
        last_ms: f64 = 0,
        max_ms: f64 = 0,
    };

    /// POST JSON to a URL with custom headers. Returns owned response body.
    pub fn post(self: *HttpClient, url: []const u8, headers: []const Header, body: []const u8) !Response {
        return self.doRequest(.POST, url, headers, body, 64 * 1024);
    }

    /// GET from a URL with custom headers. Returns owned response body.
    pub fn get(self: *HttpClient, url: []const u8, headers: []const Header) !Response {
        return self.doRequest(.GET, url, headers, null, 64 * 1024);
    }

    /// DELETE from a URL with custom headers. Returns owned response body.
    pub fn delete(self: *HttpClient, url: []const u8, headers: []const Header) !Response {
        return self.doRequest(.DELETE, url, headers, null, 64 * 1024);
    }

    /// GET with custom max response size (for large payloads like Binance klines).
    pub fn getLarge(self: *HttpClient, url: []const u8, headers: []const Header, max_response_bytes: usize) !Response {
        return self.doRequest(.GET, url, headers, null, max_response_bytes);
    }

    pub fn snapshotAndResetMetrics(self: *HttpClient) MetricsSnapshot {
        while (!self.mutex.tryLock()) {
            std.atomic.spinLoopHint();
        }
        defer self.mutex.unlock();

        const snapshot: MetricsSnapshot = .{
            .requests = self.request_count,
            .errors = self.error_count,
            .retries = self.retry_count,
            .last_ms = self.last_latency_ms,
            .max_ms = self.max_latency_ms,
        };
        self.request_count = 0;
        self.error_count = 0;
        self.retry_count = 0;
        self.last_latency_ms = 0;
        self.max_latency_ms = 0;
        return snapshot;
    }

    fn doRequest(
        self: *HttpClient,
        method: http.Method,
        url: []const u8,
        headers: []const Header,
        body: ?[]const u8,
        max_response_bytes: usize,
    ) !Response {
        const start_ms = self.nowMs();
        // Spin-lock: Zig 0.16 atomic.Mutex only has tryLock
        while (!self.mutex.tryLock()) {
            std.atomic.spinLoopHint();
        }
        defer self.mutex.unlock();

        const uri = try Uri.parse(url);

        // Convert headers to std.http format
        var extra_headers: [16]http.Header = undefined;
        const header_count = @min(headers.len, extra_headers.len);
        for (headers[0..header_count], 0..) |h, i| {
            extra_headers[i] = .{ .name = h.name, .value = h.value };
        }

        // Retry once on stale connection (HttpConnectionClosing)
        var attempt: u32 = 0;
        while (attempt < 2) : (attempt += 1) {
            const result = self.doRequestInner(method, uri, extra_headers[0..header_count], body, max_response_bytes);
            if (result) |resp| {
                self.recordMetrics(start_ms, false, attempt);
                return resp;
            } else |err| {
                if (attempt == 0 and err == error.HttpConnectionClosing) {
                    continue; // retry with fresh connection
                }
                self.recordMetrics(start_ms, true, attempt);
                return err;
            }
        }
        unreachable;
    }

    fn recordMetrics(self: *HttpClient, start_ms: i64, failed: bool, attempt: u32) void {
        const elapsed_ms = @max(0, self.nowMs() - start_ms);
        const latency: f64 = @floatFromInt(elapsed_ms);
        self.request_count += 1;
        if (failed) self.error_count += 1;
        if (attempt > 0) self.retry_count += attempt;
        self.last_latency_ms = latency;
        if (latency > self.max_latency_ms) self.max_latency_ms = latency;
    }

    fn nowMs(self: *HttpClient) i64 {
        return Io.Timestamp.now(self.io, .awake).toMilliseconds();
    }

    fn doRequestInner(
        self: *HttpClient,
        method: http.Method,
        uri: Uri,
        extra_headers: []const http.Header,
        body: ?[]const u8,
        max_response_bytes: usize,
    ) !Response {
        var req = try self.client.request(method, uri, .{
            .extra_headers = extra_headers,
        });
        defer req.deinit();

        if (body) |b| {
            req.transfer_encoding = .{ .content_length = b.len };
            var bw = try req.sendBodyUnflushed(&.{});
            try bw.writer.writeAll(b);
            try bw.end();
            try req.connection.?.flush();
        } else {
            try req.sendBodiless();
        }

        var response = try req.receiveHead(&.{});

        // Decompress gzip/deflate if server sent compressed response
        var transfer_buf: [64]u8 = undefined;
        var decompress: http.Decompress = undefined;
        const decompress_buf = switch (response.head.content_encoding) {
            .identity => @as([]u8, &.{}),
            .deflate, .gzip => try self.allocator.alloc(u8, std.compress.flate.max_window_len),
            .zstd => try self.allocator.alloc(u8, std.compress.zstd.default_window_len),
            .compress => return error.UnsupportedCompression,
        };
        defer if (decompress_buf.len > 0) self.allocator.free(decompress_buf);

        const resp_body = if (response.head.content_encoding == .identity)
            try response.reader(&transfer_buf).allocRemaining(self.allocator, .limited(max_response_bytes))
        else
            try response.readerDecompressing(&transfer_buf, &decompress, decompress_buf).allocRemaining(self.allocator, .limited(max_response_bytes));

        return .{
            .status = response.head.status,
            .body = resp_body,
            .allocator = self.allocator,
        };
    }
};
