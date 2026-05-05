/// Exchange abstraction layer — vtable interface for order management.
/// Implementations: Alpaca (paper trading), future: Binance (live trading).
///
/// Two interfaces:
///   - Sync: buy()/sell() block until filled (used by backtest-mode tests, simple scripts)
///   - Async: submitOrder()/checkOrder()/cancelOrder() for non-blocking live trading
const std = @import("std");

pub const Side = enum { buy, sell };

pub const OrderFill = struct {
    order_id: [64]u8 = undefined,
    order_id_len: usize = 0,
    fill_price: f64,
    fill_qty: f64,
    /// Native commission quantity in `commission_asset` units.
    commission: f64 = 0,
    /// Historical USD value of `commission` at fill time. Required when
    /// commission_asset is non-USD and the adapter has a valuation rate.
    /// If omitted, LiveLoop estimates BTC fees from fill_price. A nonzero
    /// commission_asset_len means the adapter supplied commission metadata
    /// explicitly, even when commission is zero.
    commission_usd: f64 = 0,
    commission_asset: [8]u8 = undefined,
    commission_asset_len: usize = 0,
    status: enum { filled, accepted, failed },
};

pub const PendingOrder = struct {
    order_id: [64]u8 = undefined,
    order_id_len: usize = 0,
    side: Side,
    qty: f64,
};

/// Result of checking a pending order's status.
/// - filled: order executed, OrderFill has price/qty/commission
/// - pending: still waiting, check again next tick
/// - cancelled: order was cancelled (by us or exchange)
/// - failed: order rejected/expired
pub const OrderStatus = union(enum) {
    filled: OrderFill,
    pending: void,
    cancelled: void,
    failed: void,
};

/// Result of attempting to cancel an order.
/// - cancelled: successfully cancelled before fill
/// - filled: order filled before cancel arrived (race condition)
/// - failed: cancel request failed (network error, unknown order)
pub const CancelResult = union(enum) {
    cancelled: void,
    filled: OrderFill,
    failed: void,
};

pub const Position = struct {
    qty: f64,
    entry_price: f64,
    market_value: f64,
    unrealized_pnl: f64,
};

/// Exchange interface — vtable pattern (like std.mem.Allocator).
///
/// Sync methods (buy/sell) block until order is filled or failed.
/// Async methods (submitOrder/checkOrder/cancelOrder) are non-blocking.
/// Both sets share the same vtable — implementations provide all methods.
pub const Exchange = struct {
    ptr: *const anyopaque,
    vtable: *const VTable,

    pub const VTable = struct {
        // Sync (blocking) — kept for backward compatibility
        buy: *const fn (ptr: *const anyopaque, qty: f64) ?OrderFill,
        sell: *const fn (ptr: *const anyopaque, qty: f64) ?OrderFill,
        // Async (non-blocking)
        submitOrder: *const fn (ptr: *const anyopaque, side: Side, qty: f64) ?PendingOrder,
        checkOrder: *const fn (ptr: *const anyopaque, order_id: []const u8) OrderStatus,
        cancelOrder: *const fn (ptr: *const anyopaque, order_id: []const u8) CancelResult,
        // Query
        getPosition: *const fn (ptr: *const anyopaque) ?Position,
    };

    // Sync interface
    pub fn buy(self: Exchange, qty: f64) ?OrderFill {
        return self.vtable.buy(self.ptr, qty);
    }

    pub fn sell(self: Exchange, qty: f64) ?OrderFill {
        return self.vtable.sell(self.ptr, qty);
    }

    // Async interface
    pub fn submitOrder(self: Exchange, side: Side, qty: f64) ?PendingOrder {
        return self.vtable.submitOrder(self.ptr, side, qty);
    }

    pub fn checkOrder(self: Exchange, order_id: []const u8) OrderStatus {
        return self.vtable.checkOrder(self.ptr, order_id);
    }

    pub fn cancelOrder(self: Exchange, order_id: []const u8) CancelResult {
        return self.vtable.cancelOrder(self.ptr, order_id);
    }

    // Query
    pub fn getPosition(self: Exchange) ?Position {
        return self.vtable.getPosition(self.ptr);
    }
};
