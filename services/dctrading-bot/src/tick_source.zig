/// TickSource — vtable interface for tick providers.
/// Implementations: Feed (Binance WebSocket), SimFeed (test replay).
const std = @import("std");
const types = @import("types.zig");
const Tick = types.Tick;

pub const TickSource = struct {
    ptr: *anyopaque,
    vtable: *const VTable,

    pub const VTable = struct {
        nextTick: *const fn (ptr: *anyopaque) Error!?Tick,
        deinit: *const fn (ptr: *anyopaque) void,
    };

    pub const Error = error{FeedError};

    pub fn nextTick(self: TickSource) Error!?Tick {
        return self.vtable.nextTick(self.ptr);
    }

    pub fn deinit(self: TickSource) void {
        self.vtable.deinit(self.ptr);
    }
};

/// SimFeed — replays ticks from a fixed array. For testing.
pub const SimFeed = struct {
    ticks: []const Tick,
    index: usize = 0,

    pub fn tickSource(self: *SimFeed) TickSource {
        return .{
            .ptr = @ptrCast(self),
            .vtable = &vtable,
        };
    }

    fn nextTick(ptr: *anyopaque) TickSource.Error!?Tick {
        const self: *SimFeed = @ptrCast(@alignCast(ptr));
        if (self.index >= self.ticks.len) return null;
        const t = self.ticks[self.index];
        self.index += 1;
        return t;
    }

    fn deinitNoop(_: *anyopaque) void {}

    const vtable = TickSource.VTable{
        .nextTick = &nextTick,
        .deinit = &deinitNoop,
    };
};
