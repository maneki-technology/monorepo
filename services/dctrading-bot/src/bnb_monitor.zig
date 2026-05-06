const std = @import("std");

pub const AlertState = struct {
    was_low: bool = false,
    last_alert_ts: f64 = 0,
};

pub const CheckResult = struct {
    enabled: bool,
    quantity: f64,
    price: f64,
    value_quote: f64,
    threshold_quote: f64,
    is_low: bool,
    should_alert: bool,
};

pub const AlertMode = enum { auto, on, off };

pub fn parseAlertMode(raw: []const u8) AlertMode {
    if (std.ascii.eqlIgnoreCase(raw, "on") or std.ascii.eqlIgnoreCase(raw, "true") or std.ascii.eqlIgnoreCase(raw, "1")) return .on;
    if (std.ascii.eqlIgnoreCase(raw, "off") or std.ascii.eqlIgnoreCase(raw, "false") or std.ascii.eqlIgnoreCase(raw, "0")) return .off;
    return .auto;
}

pub fn alertModeLabel(mode: AlertMode) []const u8 {
    return switch (mode) {
        .auto => "auto",
        .on => "on",
        .off => "off",
    };
}

pub fn shouldMonitor(mode: AlertMode, has_bnb_fee: bool) bool {
    return switch (mode) {
        .auto => has_bnb_fee,
        .on => true,
        .off => false,
    };
}

pub fn evaluate(quantity: f64, price: f64, threshold_quote: f64, now: f64, cooldown_sec: f64, state: *AlertState) CheckResult {
    const enabled = threshold_quote > 0 and price > 0;
    const qty = @max(quantity, 0);
    const value_quote = qty * @max(price, 0);

    if (!enabled) {
        return .{
            .enabled = false,
            .quantity = qty,
            .price = price,
            .value_quote = value_quote,
            .threshold_quote = threshold_quote,
            .is_low = false,
            .should_alert = false,
        };
    }

    const is_low = value_quote < threshold_quote;
    var should_alert = false;
    if (is_low) {
        const cooldown_elapsed = state.last_alert_ts <= 0 or now - state.last_alert_ts >= cooldown_sec;
        should_alert = !state.was_low or cooldown_elapsed;
        state.was_low = true;
        if (should_alert) state.last_alert_ts = now;
    } else {
        state.was_low = false;
    }

    return .{
        .enabled = true,
        .quantity = qty,
        .price = price,
        .value_quote = value_quote,
        .threshold_quote = threshold_quote,
        .is_low = is_low,
        .should_alert = should_alert,
    };
}
