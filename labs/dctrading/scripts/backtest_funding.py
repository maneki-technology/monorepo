#!/usr/bin/env python3
"""Backtest: evaluate futures funding rate as strategy filter.

Compares 3-regime baseline against variants that use funding rate to:
1. Skip entries when funding is extremely positive (overleveraged market)
2. Tighten trailing stop when funding is extreme
3. Both combined

Funding rate data: 8h intervals from Binance futures.
Price data: 1-min OHLCV from spot.
"""
from __future__ import annotations

import argparse
import csv
import math
import pickle
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from numpy.typing import NDArray

from backtest_fast import compute_ma, detect_dc_events, compute_vol_trail, simulate_strategy


def load_funding_rates(path: str | Path) -> tuple[NDArray, NDArray]:
    """Load funding rates CSV. Returns (timestamps, rates) arrays."""
    timestamps = []
    rates = []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            timestamps.append(float(row["timestamp"]))
            rates.append(float(row["funding_rate"]))
    return np.array(timestamps), np.array(rates)


def align_funding_to_prices(
    price_timestamps: NDArray,
    funding_timestamps: NDArray,
    funding_rates: NDArray,
) -> NDArray:
    """Forward-fill funding rates to match 1-min price timestamps.

    Each price tick gets the most recent funding rate at or before its timestamp.
    Returns array same length as price_timestamps.
    """
    aligned = np.zeros(len(price_timestamps))
    fi = 0  # funding index
    for i, pt in enumerate(price_timestamps):
        while fi < len(funding_timestamps) - 1 and funding_timestamps[fi + 1] <= pt:
            fi += 1
        if funding_timestamps[fi] <= pt:
            aligned[i] = funding_rates[fi]
    return aligned


def compute_avg_funding(
    price_timestamps: NDArray,
    funding_timestamps: NDArray,
    funding_rates: NDArray,
    window_hours: int,
) -> NDArray:
    """Compute rolling average funding rate over window_hours for each price tick.

    For each price tick, averages all funding rate records in the preceding window.
    """
    aligned = np.zeros(len(price_timestamps))
    window_sec = window_hours * 3600
    fi_start = 0
    fi_end = 0
    running_sum = 0.0
    running_count = 0

    for i, pt in enumerate(price_timestamps):
        window_start = pt - window_sec
        # Advance fi_end to include new records
        while fi_end < len(funding_timestamps) and funding_timestamps[fi_end] <= pt:
            running_sum += funding_rates[fi_end]
            running_count += 1
            fi_end += 1
        # Advance fi_start to exclude old records
        while fi_start < fi_end and funding_timestamps[fi_start] < window_start:
            running_sum -= funding_rates[fi_start]
            running_count -= 1
            fi_start += 1
        if running_count > 0:
            aligned[i] = running_sum / running_count
    return aligned


def simulate_with_funding(
    prices: NDArray,
    timestamps: NDArray,
    dc_events: NDArray,
    ma: NDArray,
    trail_pcts: NDArray,
    funding: NDArray,
    ma_buffer: float,
    fee_pct: float,
    initial_capital: float,
    warmup_n: int,
    skip_threshold: float,      # skip entry if funding > this (0 = disabled)
    trail_tighten: float,       # multiply trail by this when funding extreme (0 = disabled)
    trail_funding_threshold: float,  # funding level to trigger tightening
) -> dict:
    """3-regime strategy with funding rate filters."""
    n = len(prices)
    capital = initial_capital
    in_position = False
    entry_price = 0.0
    size = 0.0
    peak_price = 0.0
    regime = 0  # 0=bear, 1=bull, 2=sideways

    trades_pnl: list[float] = []
    trades_exit_type: list[str] = []
    skipped_entries = 0

    for i in range(n):
        p = prices[i]
        is_warmup = i < warmup_n
        fr = funding[i]

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

        # Effective trailing stop (tighten when funding extreme)
        effective_trail = trail_pcts[i]
        if trail_tighten > 0 and abs(fr) > trail_funding_threshold:
            effective_trail = trail_pcts[i] * trail_tighten

        # BULL: hold (funding filter does NOT apply to BULL buy-and-hold)
        if regime == 1:
            if not in_position and not is_warmup:
                fee = capital * fee_pct
                usable = capital - fee
                size = usable / p
                entry_price = p
                peak_price = p
                in_position = True
            continue

        # BEAR: trailing stop + DC
        if regime == 0 and in_position:
            if p > peak_price:
                peak_price = p
            if effective_trail > 0 and peak_price > 0:
                drop = (peak_price - p) / peak_price
                if drop >= effective_trail:
                    raw = (p - entry_price) * size
                    fee = size * p * fee_pct
                    net = raw - fee
                    capital += net
                    trades_pnl.append(net)
                    trades_exit_type.append("trailing_stop")
                    in_position = False
                    continue

        # BEAR + SIDEWAYS: DC detection
        if regime in (0, 2):
            ev = dc_events[i]
            if ev == 1 and not in_position and not is_warmup:
                # Check funding skip
                if skip_threshold > 0 and fr > skip_threshold:
                    skipped_entries += 1
                    continue
                fee = capital * fee_pct
                usable = capital - fee
                size = usable / p
                entry_price = p
                peak_price = p
                in_position = True
            elif ev == -1 and in_position:
                raw = (p - entry_price) * size
                fee = size * p * fee_pct
                net = raw - fee
                capital += net
                trades_pnl.append(net)
                trades_exit_type.append("dc_exit")
                in_position = False

    # Summary
    num_trades = len(trades_pnl)
    if num_trades == 0:
        return {
            "total_pnl": 0, "return_pct": 0, "num_trades": 0,
            "win_rate": 0, "sharpe": 0, "max_dd": 0,
            "skipped_entries": skipped_entries,
            "final_equity": initial_capital,
        }

    total_pnl = sum(trades_pnl)
    wins = sum(1 for p in trades_pnl if p > 0)

    equity = initial_capital
    peak_eq = equity
    max_dd = 0.0
    returns = []
    for pnl in trades_pnl:
        ret = pnl / equity if equity > 0 else 0.0
        returns.append(ret)
        equity += pnl
        if equity > peak_eq:
            peak_eq = equity
        dd = (peak_eq - equity) / peak_eq if peak_eq > 0 else 0.0
        max_dd = max(max_dd, dd)

    sharpe = 0.0
    if len(returns) >= 2:
        mean_r = sum(returns) / len(returns)
        var = sum((r - mean_r) ** 2 for r in returns) / (len(returns) - 1)
        std_r = math.sqrt(var)
        if std_r > 0:
            sharpe = (mean_r / std_r) * math.sqrt(365)

    return {
        "total_pnl": round(total_pnl, 2),
        "return_pct": round(total_pnl / initial_capital * 100, 2),
        "num_trades": num_trades,
        "win_rate": round(wins / num_trades, 3),
        "sharpe": round(sharpe, 3),
        "max_dd": round(max_dd * 100, 2),
        "skipped_entries": skipped_entries,
        "final_equity": round(initial_capital + total_pnl, 2),
        "dc_exits": sum(1 for e in trades_exit_type if e == "dc_exit"),
        "trail_exits": sum(1 for e in trades_exit_type if e == "trailing_stop"),
    }


def main():
    parser = argparse.ArgumentParser(description="Funding rate backtest")
    parser.add_argument("--capital", type=float, default=1000.0)
    parser.add_argument("--threshold", type=float, default=0.07)
    parser.add_argument("--trail", type=float, default=0.02)
    parser.add_argument("--buffer", type=float, default=0.03)
    args = parser.parse_args()

    ma_period = 60 * 24 * 60  # 60 days
    trail_window = 72 * 60    # 72h
    fee_pct = 0.001

    # Load price data
    data_dir = Path(__file__).parent.parent / "data" / "cache"
    with open(data_dir / "train_2019_2024_1m.pkl", "rb") as f:
        all_ticks = pickle.load(f)
    print(f"Loaded {len(all_ticks):,} price ticks")

    # Load funding rates
    fr_ts, fr_rates = load_funding_rates(data_dir / "funding_rates_btcusdt.csv")
    print(f"Loaded {len(fr_rates):,} funding rate records")
    print(f"  Funding range: {datetime.fromtimestamp(fr_ts[0], tz=timezone.utc).date()} to {datetime.fromtimestamp(fr_ts[-1], tz=timezone.utc).date()}")

    # Build arrays
    prices = np.array([t.price for t in all_ticks], dtype=np.float64)
    timestamps = np.array([t.timestamp for t in all_ticks], dtype=np.float64)

    # Align funding to price timestamps (spot + 24h avg)
    funding_spot = align_funding_to_prices(timestamps, fr_ts, fr_rates)
    funding_24h = compute_avg_funding(timestamps, fr_ts, fr_rates, 24)
    funded_pct = np.count_nonzero(funding_spot) / len(funding_spot) * 100
    print(f"  Aligned: {funded_pct:.1f}% of price ticks have funding data")

    # Compute indicators
    dc_events = detect_dc_events(prices, args.threshold)
    ma = compute_ma(prices, ma_period)
    trail_pcts = compute_vol_trail(prices, trail_window, args.trail)

    warmup_n = ma_period  # skip first 60 days

    print(f"\nRunning backtests (capital=${args.capital:,.0f}, \u03bb={args.threshold}, trail={args.trail}, buf={args.buffer})...\n")

    # Baseline: 3-regime without funding
    baseline = simulate_strategy(
        prices, timestamps, dc_events, ma, trail_pcts,
        args.buffer, fee_pct, args.capital, "3reg", warmup_n
    )

    variants = {
        "Baseline (no funding)": baseline,
    }

    # === V1: Spot funding (original approach) ===
    for skip in [0.0005, 0.001]:
        label = f"[Spot] Skip FR > {skip*100:.2f}%"
        result = simulate_with_funding(
            prices, timestamps, dc_events, ma, trail_pcts, funding_spot,
            args.buffer, fee_pct, args.capital, warmup_n,
            skip_threshold=skip, trail_tighten=0, trail_funding_threshold=0,
        )
        variants[label] = result

    # === V2: 24h avg funding — lower thresholds (from lead-lag analysis) ===
    for skip in [0.00015, 0.0002, 0.00025, 0.0003]:
        label = f"[24h avg] Skip FR > {skip*100:.3f}%"
        result = simulate_with_funding(
            prices, timestamps, dc_events, ma, trail_pcts, funding_24h,
            args.buffer, fee_pct, args.capital, warmup_n,
            skip_threshold=skip, trail_tighten=0, trail_funding_threshold=0,
        )
        variants[label] = result

    # === V3: 24h avg — trail tightening ===
    for tighten in [0.5, 0.7]:
        for fr_thresh in [0.00015, 0.0002, 0.0003]:
            label = f"[24h avg] Trail \u00d7{tighten} |FR|>{fr_thresh*100:.3f}%"
            result = simulate_with_funding(
                prices, timestamps, dc_events, ma, trail_pcts, funding_24h,
                args.buffer, fee_pct, args.capital, warmup_n,
                skip_threshold=0, trail_tighten=tighten, trail_funding_threshold=fr_thresh,
            )
            variants[label] = result

    # === V4: 24h avg — combined skip + tighten ===
    for skip in [0.0002, 0.00025]:
        for tighten in [0.5, 0.7]:
            label = f"[24h avg] Skip>{skip*100:.3f}% + Trail\u00d7{tighten} |FR|>0.020%"
            result = simulate_with_funding(
                prices, timestamps, dc_events, ma, trail_pcts, funding_24h,
                args.buffer, fee_pct, args.capital, warmup_n,
                skip_threshold=skip, trail_tighten=tighten, trail_funding_threshold=0.0002,
            )
            variants[label] = result
    # Print results
    print(f"{'Strategy':<50} {'PnL':>10} {'Return':>8} {'Trades':>7} {'Win%':>6} {'Sharpe':>7} {'MaxDD':>7} {'Skip':>5}")
    print("─" * 110)

    for name, r in variants.items():
        skip = r.get("skipped_entries", 0)
        marker = " ◀ BASELINE" if name.startswith("Baseline") else ""
        pnl_color = "+" if r["total_pnl"] > baseline["total_pnl"] else ""
        print(
            f"{name:<50} "
            f"${r['total_pnl']:>9,.0f} "
            f"{r['return_pct']:>7.1f}% "
            f"{r['num_trades']:>6d} "
            f"{r['win_rate']*100:>5.1f}% "
            f"{r['sharpe']:>7.2f} "
            f"{r['max_dd']:>6.1f}% "
            f"{skip:>5d}"
            f"{marker}"
        )

    # Summary
    best_name = max(variants, key=lambda k: variants[k]["sharpe"])
    best = variants[best_name]
    print(f"\n{'='*110}")
    print(f"Best by Sharpe: {best_name}")
    print(f"  Sharpe: {best['sharpe']:.3f} (baseline: {baseline['sharpe']:.3f})")
    print(f"  Return: {best['return_pct']:.1f}% (baseline: {baseline['return_pct']:.1f}%)")
    print(f"  MaxDD:  {best['max_dd']:.1f}% (baseline: {baseline['max_dd']:.1f}%)")

    best_return = max(variants, key=lambda k: variants[k]["return_pct"])
    if best_return != best_name:
        br = variants[best_return]
        print(f"\nBest by Return: {best_return}")
        print(f"  Return: {br['return_pct']:.1f}% (baseline: {baseline['return_pct']:.1f}%)")
        print(f"  Sharpe: {br['sharpe']:.3f}")


if __name__ == "__main__":
    main()
