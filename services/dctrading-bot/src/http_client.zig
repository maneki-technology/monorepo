/// Shared HTTP client wrapper for HTTPS JSON APIs.
/// Replaces popen("curl ...") with native Zig std.http.Client.
const std = @import("std");
const http = std.http;
const Uri = std.Uri;
const Io = std.Io;

pub const HttpClient = struct {
    client: http.Client,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, io: Io) HttpClient {
        return .{
            .client = .{ .allocator = allocator, .io = io },
            .allocator = allocator,
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

    /// POST JSON to a URL with custom headers. Returns owned response body.
    pub fn post(self: *HttpClient, url: []const u8, headers: []const Header, body: []const u8) !Response {
        return self.doRequest(.POST, url, headers, body);
    }

    /// GET from a URL with custom headers. Returns owned response body.
    pub fn get(self: *HttpClient, url: []const u8, headers: []const Header) !Response {
        return self.doRequest(.GET, url, headers, null);
    }

    /// DELETE from a URL with custom headers. Returns owned response body.
    pub fn delete(self: *HttpClient, url: []const u8, headers: []const Header) !Response {
        return self.doRequest(.DELETE, url, headers, null);
    }

    fn doRequest(
        self: *HttpClient,
        method: http.Method,
        url: []const u8,
        headers: []const Header,
        body: ?[]const u8,
    ) !Response {
        const uri = try Uri.parse(url);

        // Convert headers to std.http format
        var extra_headers: [16]http.Header = undefined;
        const header_count = @min(headers.len, extra_headers.len);
        for (headers[0..header_count], 0..) |h, i| {
            extra_headers[i] = .{ .name = h.name, .value = h.value };
        }

        var req = try self.client.request(method, uri, .{
            .extra_headers = extra_headers[0..header_count],
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
        const resp_body = try response.reader(&.{}).allocRemaining(self.allocator, .limited(64 * 1024));

        return .{
            .status = response.head.status,
            .body = resp_body,
            .allocator = self.allocator,
        };
    }
};
