/// ZI-DCT0 long-only + vol-trailing stop + 60d MA regime filter.
const std = @import("std");
const types = @import("types.zig");
const dc_mod = @import("dc_detector.zig");

const Tick = types.Tick;
const DCEvent = types.DCEvent;
const Direction = types.Direction;
const Trade = types.Trade;
const DCDetector = dc_mod.DCDetector;

// C file I/O for checkpoint persistence
pub extern "c" fn fopen(path: [*:0]const u8, mode: [*:0]const u8) ?*anyopaque;
pub extern "c" fn fclose(fp: *anyopaque) c_int;
extern "c" fn fseek(fp: *anyopaque, offset: c_long, whence: c_int) c_int;
extern "c" fn ftell(fp: *anyopaque) c_long;
pub extern "c" fn fread(buf: [*]u8, size: usize, count: usize, fp: *anyopaque) usize;
pub extern "c" fn fwrite(buf: [*]const u8, size: usize, count: usize, fp: *anyopaque) usize;
extern "c" fn rename(old: [*:0]const u8, new: [*:0]const u8) c_int;
extern "c" fn remove(path: [*:0]const u8) c_int;

pub const Strategy = struct {
    detector: DCDetector,

    in_position: bool = false,
    entry_price: f64 = 0,
    entry_time: f64 = 0,
    size: f64 = 0,
    peak_price: f64 = 0,

    capital: f64,
    initial_capital: f64,
    fee_pct: f64,

    // Vol-trailing stop
    base_trail: f64,
    current_trail: f64,
    vol_window: usize,
    returns_buf: []f64,
    returns_idx: usize = 0,
    returns_count: usize = 0,
    cum_vol_sum: f64 = 0,
    cum_vol_count: u64 = 0,
    avg_vol: f64 = 0,
    last_price: f64 = 0,

    // MA regime filter
    ma_period: usize,
    ma_buffer: f64,
    price_sum: f64 = 0,
    price_buf: []f64,
    price_idx: usize = 0,
    price_count: usize = 0,
    regime: Regime = .bear,

    // Funding rate filter
    funding_avg: f64 = 0,
    funding_avg_updated_at: f64 = 0,
    funding_latest_time: f64 = 0,
    funding_skip_threshold: f64 = 0.0001, // 0.010% default

    // Tick counter and last active timestamp for catch-up
    tick_count: u64 = 0,
    last_timestamp: f64 = 0,
    warmup: bool = false, // when true, indicators run but no trades open/close

    // Non-blocking order support: when true, buy signals are stored but position
    // state is NOT committed. Main loop reads the signal and submits async order.
    suppress_entry: bool = false,
    buy_signal: bool = false, // set by processTick when entry would fire
    buy_signal_price: f64 = 0,
    buy_signal_size: f64 = 0,
    capital_reserved: f64 = 0, // cash reserved for pending orders (main loop manages this)

    pub const Regime = enum { bull, sideways, bear };

    pub const Config = struct {
        threshold: f64 = 0.07,
        initial_capital: f64 = 10000.0,
        fee_pct: f64 = 0.001,
        base_trail: f64 = 0.02,
        vol_window: usize = 4320,
        ma_period: usize = 86400,
        ma_buffer: f64 = 0.03,
    };

    pub fn init(allocator: std.mem.Allocator, config: Config) !Strategy {
        const returns_buf = try allocator.alloc(f64, config.vol_window);
        @memset(returns_buf, 0);
        const price_buf = try allocator.alloc(f64, config.ma_period);
        @memset(price_buf, 0);

        return .{
            .detector = DCDetector.init(config.threshold),
            .capital = config.initial_capital,
            .initial_capital = config.initial_capital,
            .fee_pct = config.fee_pct,
            .base_trail = config.base_trail,
            .current_trail = config.base_trail,
            .vol_window = config.vol_window,
            .returns_buf = returns_buf,
            .ma_period = config.ma_period,
            .ma_buffer = config.ma_buffer,
            .price_buf = price_buf,
        };
    }

    pub fn deinit(self: *Strategy, allocator: std.mem.Allocator) void {
        allocator.free(self.returns_buf);
        allocator.free(self.price_buf);
    }

    /// Bootstrap strategy state from historical 1-minute close prices.
    /// Feeds each price through updateMA() and updateVol() to fill ring buffers.
    /// After this, regime detection and vol-trailing work immediately.
    pub fn bootstrap(self: *Strategy, closes: []const f64) void {
        for (closes) |price| {
            self.updateVol(price);
            self.updateMA(price);
            self.tick_count += 1;
        }
        std.debug.print("  Bootstrapped: {d} ticks, regime={s}, MA filled={s}\n", .{
            self.tick_count,
            switch (self.regime) {
                .bull => "BULL",
                .sideways => "SIDE",
                .bear => "BEAR",
            },
            if (self.price_count >= self.ma_period) "yes" else "no",
        });
    }

    /// Catch-up after downtime: updates indicators + DC detector + peak_price,
    /// but does NOT open/close positions. Missed opportunities are the cost of downtime.
    pub fn catchup(self: *Strategy, closes: []const f64) void {
        const before_regime = self.regime;
        for (closes) |price| {
            self.updateVol(price);
            self.updateMA(price);
            // Update DC detector state (prevents stale signals on first live tick)
            const tick = Tick{ .timestamp = 0, .price = price, .volume = 0 };
            _ = self.detector.processTick(tick);
            // Update peak_price if holding a position
            if (self.in_position and price > self.peak_price) {
                self.peak_price = price;
            }
            self.tick_count += 1;
        }
        const after_regime = self.regime;
        std.debug.print("  Catch-up: {d} candles replayed, regime {s}→{s}\n", .{
            closes.len,
            switch (before_regime) {
                .bull => "BULL",
                .sideways => "SIDE",
                .bear => "BEAR",
            },
            switch (after_regime) {
                .bull => "BULL",
                .sideways => "SIDE",
                .bear => "BEAR",
            },
        });
    }

    pub fn processTick(self: *Strategy, tick: Tick) ?Trade {
        const price = tick.price;
        self.tick_count += 1;
        self.last_timestamp = tick.timestamp;
        self.updateVol(price);
        self.updateMA(price);
        // DC detector runs on EVERY tick to maintain accurate state
        const event = self.detector.processTick(tick);

        // BULL mode: hold passively (DC events ignored)
        if (self.regime == .bull) {
            if (!self.in_position and !self.warmup and self.capital > 10.0) {
                self.openPosition(price, tick.timestamp);
            }
            return null;
        }

        // BEAR: trailing stop
        if (self.regime == .bear and self.in_position) {
            if (price > self.peak_price) self.peak_price = price;
            if (self.current_trail > 0 and self.peak_price > 0) {
                const drop = (self.peak_price - price) / self.peak_price;
                if (drop >= self.current_trail) {
                    if (self.warmup) return null;
                    return self.closePosition(price, tick.timestamp, .trailing_stop);
                }
            }
        }

        // BEAR + SIDEWAYS: act on DC events
        const ev = event orelse return null;

        if (ev.direction == .up and !self.in_position and !self.warmup) {
            // Skip entry if funding rate is elevated (overleveraged market)
            if (self.funding_avg > self.funding_skip_threshold and self.funding_skip_threshold > 0) {
                std.debug.print("  [funding] Skipping DC entry: 24h avg FR={d:.4}%\n", .{self.funding_avg * 100});
                return null;
            }
            self.openPosition(price, tick.timestamp);
            return null;
        } else if (ev.direction == .down and self.in_position and !self.warmup) {
            return self.closePosition(price, tick.timestamp, .dc_exit);
        }

        return null;
    }

    /// Real-time trailing stop check — call on EVERY tick for risk management.
    /// Does NOT update MA, vol, or DC detector (those stay at 1/min resolution).
    pub fn checkStop(self: *Strategy, price: f64, timestamp: f64) ?Trade {
        if (!self.in_position) return null;
        if (price > self.peak_price) self.peak_price = price;
        if (self.current_trail > 0 and self.peak_price > 0) {
            const drop = (self.peak_price - price) / self.peak_price;
            if (drop >= self.current_trail) {
                return self.closePosition(price, timestamp, .trailing_stop);
            }
        }
        return null;
    }

    fn openPosition(self: *Strategy, price: f64, time: f64) void {
        const available = self.capital - self.capital_reserved;
        const fee = available * self.fee_pct;
        const usable = available - fee;
        const size = usable / price;

        if (self.suppress_entry) {
            // Non-blocking mode: store signal for main loop to submit async order
            self.buy_signal = true;
            self.buy_signal_price = price;
            self.buy_signal_size = size;
            return;
        }

        // Sync mode (backtest): commit position immediately
        self.size = size;
        self.entry_price = price;
        self.entry_time = time;
        self.peak_price = price;
        self.in_position = true;
        // Note: capital NOT reduced here. Fee is embedded in smaller size.
        // Capital updated on closePosition with net PnL (includes both fees).
    }

    fn closePosition(self: *Strategy, price: f64, time: f64, exit_type: Trade.ExitType) Trade {
        const exit_fee = self.size * price * self.fee_pct;
        const raw_pnl = (price - self.entry_price) * self.size;
        const net_pnl = raw_pnl - exit_fee;

        const trade = Trade{
            .entry_price = self.entry_price,
            .exit_price = price,
            .entry_time = self.entry_time,
            .exit_time = time,
            .size = self.size,
            .pnl = net_pnl,
            .fees = exit_fee + (self.size * self.entry_price * self.fee_pct),
            .exit_type = exit_type,
        };

        self.capital += net_pnl;
        self.in_position = false;
        self.entry_price = 0;
        self.entry_time = 0;
        self.size = 0;
        self.peak_price = 0;

        return trade;
    }

    fn updateVol(self: *Strategy, price: f64) void {
        if (self.last_price > 0) {
            const ret = @log(price / self.last_price);
            self.returns_buf[self.returns_idx] = ret;
            self.returns_idx = (self.returns_idx + 1) % self.vol_window;
            if (self.returns_count < self.vol_window) self.returns_count += 1;

            if (self.returns_count >= self.vol_window) {
                const recent_vol = ringStd(self.returns_buf, self.returns_count);
                if (self.cum_vol_count > 0 and self.avg_vol > 0 and recent_vol > 0) {
                    var ratio = recent_vol / self.avg_vol;
                    ratio = @max(0.5, @min(3.0, ratio));
                    self.current_trail = self.base_trail * ratio;
                }
                self.cum_vol_sum += recent_vol;
                self.cum_vol_count += 1;
                self.avg_vol = self.cum_vol_sum / @as(f64, @floatFromInt(self.cum_vol_count));
            }
        }
        self.last_price = price;
    }

    fn updateMA(self: *Strategy, price: f64) void {
        if (self.price_count >= self.ma_period) {
            self.price_sum -= self.price_buf[self.price_idx];
        }
        self.price_buf[self.price_idx] = price;
        self.price_sum += price;
        self.price_idx = (self.price_idx + 1) % self.ma_period;
        if (self.price_count < self.ma_period) self.price_count += 1;

        if (self.price_count >= self.ma_period) {
            const ma = self.price_sum / @as(f64, @floatFromInt(self.ma_period));
            const upper = ma * (1.0 + self.ma_buffer);
            const lower = ma * (1.0 - self.ma_buffer);
            if (price > upper) {
                self.regime = .bull;
            } else if (price < lower) {
                self.regime = .bear;
            } else {
                self.regime = .sideways;
            }
        }
    }

    pub fn forceClose(self: *Strategy, price: f64, time: f64) ?Trade {
        if (!self.in_position) return null;
        return self.closePosition(price, time, .end_of_data);
    }

    pub fn totalReturn(self: Strategy) f64 {
        return (self.capital - self.initial_capital) / self.initial_capital * 100.0;
    }

    // --- Checkpoint save/load ---

    const CHECKPOINT_MAGIC_V4: u64 = 0x4443_5452_4144_4534; // "DCTRADE4"
    const CHECKPOINT_MAGIC: u64 = 0x4443_5452_4144_4535; // "DCTRADE5"
    const SCALAR_COUNT_V4 = 24;
    const SCALAR_COUNT_V5_FUNDING_AVG = 25;
    const SCALAR_COUNT_V5_FUNDING_CACHE = 26;
    const SCALAR_COUNT = 27;

    fn writeCheckpointFile(self: *const Strategy, path: [*:0]const u8) bool {
        const fp = fopen(path, "wb") orelse return false;
        defer _ = fclose(fp);

        var scalars: [SCALAR_COUNT]f64 = .{
            @as(f64, @bitCast(CHECKPOINT_MAGIC)),
            if (self.in_position) 1.0 else 0.0,
            self.entry_price,
            self.entry_time,
            self.size,
            self.peak_price,
            self.capital,
            self.current_trail,
            switch (self.regime) {
                .bull => 1.0,
                .sideways => 2.0,
                .bear => 0.0,
            },
            self.cum_vol_sum,
            @as(f64, @floatFromInt(self.cum_vol_count)),
            self.avg_vol,
            self.last_price,
            @as(f64, @floatFromInt(self.returns_idx)),
            @as(f64, @floatFromInt(self.returns_count)),
            self.price_sum,
            @as(f64, @floatFromInt(self.price_idx)),
            @as(f64, @floatFromInt(self.price_count)),
            if (self.detector.initialized) 1.0 else 0.0,
            if (self.detector.direction) |d| (if (d == .up) 1.0 else 0.0) else 0.0,
            self.detector.extreme_price,
            self.detector.extreme_time,
            @as(f64, @floatFromInt(self.tick_count)),
            self.last_timestamp,
            self.funding_avg,
            self.funding_avg_updated_at,
            self.funding_latest_time,
        };
        _ = fwrite(@ptrCast(&scalars), @sizeOf(f64), SCALAR_COUNT, fp);
        _ = fwrite(@ptrCast(self.returns_buf.ptr), @sizeOf(f64), self.vol_window, fp);
        _ = fwrite(@ptrCast(self.price_buf.ptr), @sizeOf(f64), self.ma_period, fp);

        return true;
    }

    pub fn saveCheckpoint(self: *const Strategy, path: [*:0]const u8) bool {
        return self.writeCheckpointFile(path);
    }

    pub fn saveCheckpointWithBackups(self: *const Strategy, path: [*:0]const u8, retention: u8) bool {
        var tmp_buf: [4096]u8 = undefined;
        const path_slice = std.mem.sliceTo(path, 0);
        const tmp_path = std.fmt.bufPrintZ(&tmp_buf, "{s}.tmp", .{path_slice}) catch return false;

        if (!self.writeCheckpointFile(tmp_path)) return false;
        if (retention > 0) rotateCheckpointBackups(path, retention);

        if (rename(tmp_path, path) != 0) {
            _ = remove(tmp_path);
            return false;
        }
        return true;
    }

    pub fn loadCheckpoint(self: *Strategy, path: [*:0]const u8) bool {
        const fp = fopen(path, "rb") orelse return false;
        defer _ = fclose(fp);

        const file_size = checkpointFileSize(fp) orelse return false;

        var scalars: [SCALAR_COUNT]f64 = undefined;
        if (fread(@ptrCast(&scalars), @sizeOf(f64), SCALAR_COUNT_V4, fp) != SCALAR_COUNT_V4) return false;
        const magic = @as(u64, @bitCast(scalars[0]));
        const is_v5 = magic == CHECKPOINT_MAGIC;
        if (!is_v5 and magic != CHECKPOINT_MAGIC_V4) return false;

        const scalar_count = if (is_v5) checkpointScalarCount(file_size, self.vol_window, self.ma_period) orelse return false else SCALAR_COUNT_V4;
        if (is_v5 and scalar_count < SCALAR_COUNT_V5_FUNDING_AVG) return false;
        if (is_v5 and fread(@ptrCast(&scalars[SCALAR_COUNT_V4]), @sizeOf(f64), scalar_count - SCALAR_COUNT_V4, fp) != scalar_count - SCALAR_COUNT_V4) return false;

        self.in_position = scalars[1] == 1.0;
        self.entry_price = scalars[2];
        self.entry_time = scalars[3];
        self.size = scalars[4];
        self.peak_price = scalars[5];
        self.capital = scalars[6];
        self.current_trail = scalars[7];
        self.regime = switch (@as(u8, @intFromFloat(scalars[8]))) {
            1 => .bull,
            2 => .sideways,
            else => .bear,
        };
        self.cum_vol_sum = scalars[9];
        self.cum_vol_count = @intFromFloat(scalars[10]);
        self.avg_vol = scalars[11];
        self.last_price = scalars[12];
        self.returns_idx = @intFromFloat(scalars[13]);
        self.returns_count = @intFromFloat(scalars[14]);
        self.price_sum = scalars[15];
        self.price_idx = @intFromFloat(scalars[16]);
        self.price_count = @intFromFloat(scalars[17]);
        self.detector.initialized = scalars[18] == 1.0;
        self.detector.direction = if (self.detector.initialized) (if (scalars[19] == 1.0) .up else .down) else null;
        self.detector.extreme_price = scalars[20];
        self.detector.extreme_time = scalars[21];
        self.tick_count = @intFromFloat(scalars[22]);
        self.last_timestamp = scalars[23];
        self.funding_avg = if (scalar_count >= SCALAR_COUNT_V5_FUNDING_AVG) scalars[24] else 0;
        self.funding_avg_updated_at = if (scalar_count >= SCALAR_COUNT_V5_FUNDING_CACHE) scalars[25] else 0;
        self.funding_latest_time = if (scalar_count >= SCALAR_COUNT) scalars[26] else 0;

        if (fread(@ptrCast(self.returns_buf.ptr), @sizeOf(f64), self.vol_window, fp) != self.vol_window) return false;
        if (fread(@ptrCast(self.price_buf.ptr), @sizeOf(f64), self.ma_period, fp) != self.ma_period) return false;

        return true;
    }

    pub fn loadCheckpointWithBackups(self: *Strategy, path: [*:0]const u8, retention: u8) bool {
        if (self.loadCheckpoint(path)) return true;

        var backup_buf: [4096]u8 = undefined;
        var index: u8 = 1;
        while (index <= retention) : (index += 1) {
            const backup_path = backupPath(&backup_buf, path, index) orelse return false;
            if (self.loadCheckpoint(backup_path)) return true;
        }
        return false;
    }
};

fn checkpointFileSize(fp: *anyopaque) ?usize {
    if (fseek(fp, 0, 2) != 0) return null;
    const size_raw = ftell(fp);
    if (size_raw < 0) return null;
    if (fseek(fp, 0, 0) != 0) return null;
    return @intCast(size_raw);
}

fn checkpointScalarCount(file_size: usize, vol_window: usize, ma_period: usize) ?usize {
    const ring_bytes = (vol_window + ma_period) * @sizeOf(f64);
    if (file_size < ring_bytes) return null;
    const scalar_bytes = file_size - ring_bytes;
    if (scalar_bytes % @sizeOf(f64) != 0) return null;
    const scalar_count = scalar_bytes / @sizeOf(f64);
    return switch (scalar_count) {
        Strategy.SCALAR_COUNT_V4,
        Strategy.SCALAR_COUNT_V5_FUNDING_AVG,
        Strategy.SCALAR_COUNT_V5_FUNDING_CACHE,
        Strategy.SCALAR_COUNT,
        => scalar_count,
        else => null,
    };
}

fn backupPath(buf: []u8, path: [*:0]const u8, index: u8) ?[:0]u8 {
    return std.fmt.bufPrintZ(buf, "{s}.bak.{d}", .{ std.mem.sliceTo(path, 0), index }) catch null;
}

fn copyFile(src: [*:0]const u8, dst: [*:0]const u8) bool {
    const in = fopen(src, "rb") orelse return false;
    defer _ = fclose(in);

    const out = fopen(dst, "wb") orelse return false;
    defer _ = fclose(out);

    var buf: [8192]u8 = undefined;
    while (true) {
        const read_count = fread(&buf, 1, buf.len, in);
        if (read_count == 0) break;
        if (fwrite(&buf, 1, read_count, out) != read_count) return false;
    }
    return true;
}

fn rotateCheckpointBackups(path: [*:0]const u8, retention: u8) void {
    if (retention == 0) return;

    var old_buf: [4096]u8 = undefined;
    var new_buf: [4096]u8 = undefined;

    var index = retention;
    while (index > 1) : (index -= 1) {
        const old_path = backupPath(&old_buf, path, index - 1) orelse return;
        const new_path = backupPath(&new_buf, path, index) orelse return;
        _ = remove(new_path);
        _ = rename(old_path, new_path);
    }

    const first_backup = backupPath(&new_buf, path, 1) orelse return;
    _ = remove(first_backup);
    _ = copyFile(path, first_backup);
}

fn ringStd(buf: []const f64, count: usize) f64 {
    if (count < 2) return 0;
    const n: f64 = @floatFromInt(count);
    var sum: f64 = 0;
    for (buf[0..count]) |v| sum += v;
    const mean = sum / n;
    var sq_sum: f64 = 0;
    for (buf[0..count]) |v| {
        const d = v - mean;
        sq_sum += d * d;
    }
    return @sqrt(sq_sum / (n - 1.0));
}
