/// Directional Change event detector (Aloud, Tsang, Olsen, Dupuis 2012).
/// Processes ticks one at a time, emits DCEvent when price reverses by >= threshold.
const types = @import("types.zig");
const Direction = types.Direction;
const Tick = types.Tick;
const DCEvent = types.DCEvent;

pub const DCDetector = struct {
    threshold: f64,
    direction: ?Direction = null,
    extreme_price: f64 = 0,
    extreme_time: f64 = 0,
    initialized: bool = false,

    pub fn init(threshold: f64) DCDetector {
        return .{ .threshold = threshold };
    }

    pub fn processTick(self: *DCDetector, tick: Tick) ?DCEvent {
        if (!self.initialized) {
            self.extreme_price = tick.price;
            self.extreme_time = tick.timestamp;
            self.direction = .up;
            self.initialized = true;
            return null;
        }

        return switch (self.direction.?) {
            .up => self.processUpMode(tick),
            .down => self.processDownMode(tick),
        };
    }

    fn processUpMode(self: *DCDetector, tick: Tick) ?DCEvent {
        if (tick.price > self.extreme_price) {
            self.extreme_price = tick.price;
            self.extreme_time = tick.timestamp;
            return null;
        }

        if (self.extreme_price == 0) return null;

        const drop = (self.extreme_price - tick.price) / self.extreme_price;
        if (drop >= self.threshold) {
            const event = DCEvent{
                .direction = .down,
                .threshold = self.threshold,
                .extreme_price = self.extreme_price,
                .extreme_time = self.extreme_time,
                .confirm_price = tick.price,
                .confirm_time = tick.timestamp,
            };
            self.direction = .down;
            self.extreme_price = tick.price;
            self.extreme_time = tick.timestamp;
            return event;
        }

        return null;
    }

    fn processDownMode(self: *DCDetector, tick: Tick) ?DCEvent {
        if (tick.price < self.extreme_price) {
            self.extreme_price = tick.price;
            self.extreme_time = tick.timestamp;
            return null;
        }

        if (self.extreme_price == 0) return null;

        const rise = (tick.price - self.extreme_price) / self.extreme_price;
        if (rise >= self.threshold) {
            const event = DCEvent{
                .direction = .up,
                .threshold = self.threshold,
                .extreme_price = self.extreme_price,
                .extreme_time = self.extreme_time,
                .confirm_price = tick.price,
                .confirm_time = tick.timestamp,
            };
            self.direction = .up;
            self.extreme_price = tick.price;
            self.extreme_time = tick.timestamp;
            return event;
        }

        return null;
    }

    pub fn reset(self: *DCDetector) void {
        self.direction = null;
        self.extreme_price = 0;
        self.extreme_time = 0;
        self.initialized = false;
    }
};
