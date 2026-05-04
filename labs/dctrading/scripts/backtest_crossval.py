#!/usr/bin/env python3
"""Cross-validation: run 3-regime backtest and output trade-by-trade CSV for comparison with Zig."""

import pickle
import math
import numpy as np
from numpy.typing import NDArray


def compute_ma(prices: NDArray, period: int) -> NDArray:
    ma = np.full_like(prices, np.nan)
    cs = np.cumsum(prices)
    ma[period - 1:] = (cs[period - 1:] - np.concatenate([[0], cs[:-period]])) / period
    return ma


def detect_dc_events(prices: NDArray, threshold: float) -> NDArray:
    n = len(prices)
    events = np.zeros(n, dtype=np.int8)
    direction = 1
    extreme_price = prices[0]
    for i in range(1, n):
        p = prices[i]
        if direction == 1:
            if p > extreme_price:
                extreme_price = p
            elif extreme_price > 0:
                drop = (extreme_price - p) / extreme_price
                if drop >= threshold:
                    events[i] = -1
                    direction = -1
                    extreme_price = p
        else:
            if p < extreme_price:
                extreme_price = p
            elif extreme_price > 0:
                rise = (p - extreme_price) / extreme_price
                if rise >= threshold:
                    events[i] = 1
                    direction = 1
                    extreme_price = p
    return events


def compute_vol_trail(prices: NDArray, window: int, base_trail: float) -> NDArray:
    n = len(prices)
    trail = np.full(n, base_trail)
    cum_vol_sum = 0.0
    cum_vol_count = 0
    avg_vol = 0.0
    log_rets = np.zeros(n)
    log_rets[1:] = np.log(prices[1:] / prices[:-1])
    for i in range(window, n):
        chunk = log_rets[i - window + 1: i + 1]
        recent_vol = float(np.std(chunk, ddof=1))
        if cum_vol_count > 0 and avg_vol > 0 and recent_vol > 0:
            ratio = max(0.5, min(3.0, recent_vol / avg_vol))
            trail[i] = base_trail * ratio
        cum_vol_sum += recent_vol
        cum_vol_count += 1
        avg_vol = cum_vol_sum / cum_vol_count
    return trail


def run_backtest_with_trades(prices, timestamps, threshold, ma_period, ma_buffer, trail_window, base_trail, fee_pct, initial_capital):
    """Run 3-regime backtest and return list of (entry_price, exit_price, pnl, exit_type, entry_time, exit_time)."""
    n = len(prices)
    dc_events = detect_dc_events(prices, threshold)
    ma = compute_ma(prices, ma_period)
    trail_pcts = compute_vol_trail(prices, trail_window, base_trail)

    capital = initial_capital
    in_position = False
    entry_price = 0.0
    entry_time = 0.0
    size = 0.0
    peak_price = 0.0
    regime = 0  # 0=bear, 1=bull, 2=sideways

    warmup_n = ma_period
    trades = []

    for i in range(n):
        p = prices[i]
        t = timestamps[i]
        is_warmup = i < warmup_n

        # Regime detection
        if not np.isnan(ma[i]):
            upper = ma[i] * (1.0 + ma_buffer)
            lower = ma[i] * (1.0 - ma_buffer)
            if p > upper:
                regime = 1
            elif p < lower:
                regime = 0
            else:
                regime = 2

        # BULL: hold
        if regime == 1:
            if not in_position and not is_warmup and capital > 10.0:
                fee = capital * fee_pct
                usable = capital - fee
                size = usable / p
                entry_price = p
                entry_time = t
                peak_price = p
                in_position = True
            continue

        # BEAR: trailing stop
        if regime == 0 and in_position:
            if p > peak_price:
                peak_price = p
            if trail_pcts[i] > 0 and peak_price > 0:
                drop = (peak_price - p) / peak_price
                if drop >= trail_pcts[i]:
                    if not is_warmup:
                        raw = (p - entry_price) * size
                        fee = size * p * fee_pct
                        net = raw - fee
                        capital += net
                        trades.append((entry_price, p, net, "SL", entry_time, t))
                        in_position = False
                    continue

        # DC events (BEAR + SIDEWAYS)
        ev = dc_events[i]
        if ev == 1 and not in_position and not is_warmup:
            fee = capital * fee_pct
            usable = capital - fee
            size = usable / p
            entry_price = p
            entry_time = t
            peak_price = p
            in_position = True
        elif ev == -1 and in_position and not is_warmup:
            raw = (p - entry_price) * size
            fee = size * p * fee_pct
            net = raw - fee
            capital += net
            trades.append((entry_price, p, net, "DC", entry_time, t))
            in_position = False

    return trades, capital


def main():
    with open("data/cache/train_2019_2024_1m.pkl", "rb") as f:
        all_ticks = pickle.load(f)

    prices = np.array([t.price for t in all_ticks])
    timestamps = np.array([t.timestamp for t in all_ticks])

    trades, final_capital = run_backtest_with_trades(
        prices, timestamps,
        threshold=0.07,
        ma_period=60 * 24 * 60,  # 60 days
        ma_buffer=0.03,
        trail_window=72 * 60,    # 72h
        base_trail=0.02,
        fee_pct=0.001,
        initial_capital=1000.0,
    )

    # Write trade-by-trade CSV
    with open("data/cache/python_trades.csv", "w") as f:
        f.write("entry_price,exit_price,pnl,exit_type,entry_time,exit_time\n")
        for entry, exit_p, pnl, etype, et, xt in trades:
            f.write(f"{entry:.2f},{exit_p:.2f},{pnl:.2f},{etype},{et:.0f},{xt:.0f}\n")

    print(f"Trades: {len(trades)}")
    print(f"Final capital: ${final_capital:.2f}")
    total_pnl = sum(t[2] for t in trades)
    print(f"Total PnL: ${total_pnl:.2f}")
    print(f"Return: {total_pnl / 1000 * 100:.2f}%")
    wins = sum(1 for t in trades if t[2] > 0)
    print(f"Win rate: {wins / len(trades) * 100:.1f}%")
    sl_exits = sum(1 for t in trades if t[3] == "SL")
    dc_exits = sum(1 for t in trades if t[3] == "DC")
    print(f"Exits: {dc_exits} DC, {sl_exits} SL")
    print(f"\nFirst 5 trades:")
    for i, (entry, exit_p, pnl, etype, et, xt) in enumerate(trades[:5]):
        print(f"  #{i+1}: entry=${entry:.2f} exit=${exit_p:.2f} pnl=${pnl:.2f} {etype}")
    print(f"\nLast 5 trades:")
    for i, (entry, exit_p, pnl, etype, et, xt) in enumerate(trades[-5:]):
        print(f"  #{len(trades)-4+i}: entry=${entry:.2f} exit=${exit_p:.2f} pnl=${pnl:.2f} {etype}")
    print(f"\nSaved to data/cache/python_trades.csv")


if __name__ == "__main__":
    main()
