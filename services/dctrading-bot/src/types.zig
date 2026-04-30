/// Core types for the DC trading system.
pub const Direction = enum {
    up,
    down,
};

pub const Tick = struct {
    timestamp: f64, // Unix seconds
    price: f64,
    volume: f64 = 0.0,
};

pub const DCEvent = struct {
    direction: Direction,
    threshold: f64,
    extreme_price: f64,
    extreme_time: f64,
    confirm_price: f64,
    confirm_time: f64,

    pub fn magnitude(self: DCEvent) f64 {
        return @abs(self.confirm_price - self.extreme_price) / self.extreme_price;
    }
};

pub const Trade = struct {
    entry_price: f64,
    exit_price: f64,
    entry_time: f64,
    exit_time: f64,
    size: f64,
    pnl: f64,
    fees: f64,
    exit_type: ExitType,

    pub const ExitType = enum { dc_exit, trailing_stop, regime_close, end_of_data };

    pub fn return_pct(self: Trade) f64 {
        if (self.entry_price == 0 or self.size == 0) return 0;
        return self.pnl / (self.entry_price * self.size) * 100.0;
    }

    pub fn hold_hours(self: Trade) f64 {
        return (self.exit_time - self.entry_time) / 3600.0;
    }
};
