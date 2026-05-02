/// Exchange abstraction layer — vtable interface for order management.
/// Implementations: Alpaca (paper trading), future: Binance (live trading).
const std = @import("std");

pub const OrderFill = struct {
    order_id: [64]u8 = undefined,
    order_id_len: usize = 0,
    fill_price: f64,
    fill_qty: f64,
    status: enum { filled, accepted, failed },
};

pub const Position = struct {
    qty: f64,
    entry_price: f64,
    market_value: f64,
    unrealized_pnl: f64,
};

/// Exchange interface — vtable pattern (like std.mem.Allocator).
pub const Exchange = struct {
    ptr: *const anyopaque,
    vtable: *const VTable,

    pub const VTable = struct {
        buy: *const fn (ptr: *const anyopaque, qty: f64) ?OrderFill,
        sell: *const fn (ptr: *const anyopaque, qty: f64) ?OrderFill,
        getPosition: *const fn (ptr: *const anyopaque) ?Position,
    };

    pub fn buy(self: Exchange, qty: f64) ?OrderFill {
        return self.vtable.buy(self.ptr, qty);
    }

    pub fn sell(self: Exchange, qty: f64) ?OrderFill {
        return self.vtable.sell(self.ptr, qty);
    }

    pub fn getPosition(self: Exchange) ?Position {
        return self.vtable.getPosition(self.ptr);
    }
};
