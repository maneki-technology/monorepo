#!/usr/bin/env python3
"""Lead-lag analysis: does extreme funding rate precede DC reversal events?

For each DC DOWN event (market top) and DC UP event (market bottom),
look at the funding rate in the 1–7 days before. If funding is
consistently elevated before tops, it could serve as an early warning.
"""
from __future__ import annotations

import csv
import pickle
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from numpy.typing import NDArray

from backtest_fast import compute_ma, detect_dc_events


def load_funding_rates(path: str | Path) -> tuple[NDArray, NDArray]:
    timestamps = []
    rates = []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            timestamps.append(float(row["timestamp"]))
            rates.append(float(row["funding_rate"]))
    return np.array(timestamps), np.array(rates)


def get_funding_at(ts: float, fr_ts: NDArray, fr_rates: NDArray) -> float:
    """Get the most recent funding rate at or before timestamp ts."""
    idx = np.searchsorted(fr_ts, ts, side="right") - 1
    if idx < 0:
        return 0.0
    return fr_rates[idx]


def get_avg_funding_window(ts: float, window_hours: int, fr_ts: NDArray, fr_rates: NDArray) -> float:
    """Average funding rate in the window_hours before timestamp ts."""
    window_start = ts - window_hours * 3600
    mask = (fr_ts >= window_start) & (fr_ts <= ts)
    if not np.any(mask):
        return 0.0
    return float(np.mean(fr_rates[mask]))


def get_max_funding_window(ts: float, window_hours: int, fr_ts: NDArray, fr_rates: NDArray) -> float:
    """Max funding rate in the window_hours before timestamp ts."""
    window_start = ts - window_hours * 3600
    mask = (fr_ts >= window_start) & (fr_ts <= ts)
    if not np.any(mask):
        return 0.0
    return float(np.max(fr_rates[mask]))


def main():
    data_dir = Path(__file__).parent.parent / "data" / "cache"

    # Load price data
    with open(data_dir / "train_2019_2024_1m.pkl", "rb") as f:
        all_ticks = pickle.load(f)
    prices = np.array([t.price for t in all_ticks], dtype=np.float64)
    timestamps = np.array([t.timestamp for t in all_ticks], dtype=np.float64)
    print(f"Loaded {len(prices):,} price ticks")

    # Load funding rates
    fr_ts, fr_rates = load_funding_rates(data_dir / "funding_rates_btcusdt.csv")
    print(f"Loaded {len(fr_rates):,} funding rate records")

    # Detect DC events
    threshold = 0.07
    dc_events = detect_dc_events(prices, threshold)

    # Find DC DOWN (tops) and DC UP (bottoms)
    down_indices = np.where(dc_events == -1)[0]
    up_indices = np.where(dc_events == 1)[0]

    # Filter to only events after funding data starts
    fr_start = fr_ts[0]
    down_indices = down_indices[timestamps[down_indices] > fr_start]
    up_indices = up_indices[timestamps[up_indices] > fr_start]

    print(f"\nDC events (after funding data starts):")
    print(f"  DOWN (tops):    {len(down_indices)}")
    print(f"  UP (bottoms):   {len(up_indices)}")

    # Analyze funding rate before each event at different lookback windows
    windows = [8, 24, 48, 72, 120, 168]  # hours

    print(f"\n{'='*100}")
    print(f"LEAD-LAG ANALYSIS: Funding Rate Before DC Events")
    print(f"{'='*100}")

    print(f"\n--- Average Funding Rate Before Events ---")
    print(f"{'Window':<12} {'Before DOWN (tops)':>20} {'Before UP (bottoms)':>20} {'Diff':>12} {'Signal?':>10}")
    print(f"{'─'*76}")

    for hours in windows:
        down_avgs = [get_avg_funding_window(timestamps[i], hours, fr_ts, fr_rates) for i in down_indices]
        up_avgs = [get_avg_funding_window(timestamps[i], hours, fr_ts, fr_rates) for i in up_indices]

        down_mean = np.mean(down_avgs) if down_avgs else 0
        up_mean = np.mean(up_avgs) if up_avgs else 0
        diff = down_mean - up_mean
        signal = "✓ YES" if diff > 0.00005 else "✗ no"

        print(f"{hours:>4}h       {down_mean*100:>18.4f}%  {up_mean*100:>18.4f}%  {diff*100:>10.4f}%  {signal:>10}")

    print(f"\n--- Max Funding Rate Before Events ---")
    print(f"{'Window':<12} {'Before DOWN (tops)':>20} {'Before UP (bottoms)':>20} {'Diff':>12} {'Signal?':>10}")
    print(f"{'─'*76}")

    for hours in windows:
        down_maxs = [get_max_funding_window(timestamps[i], hours, fr_ts, fr_rates) for i in down_indices]
        up_maxs = [get_max_funding_window(timestamps[i], hours, fr_ts, fr_rates) for i in up_indices]

        down_mean = np.mean(down_maxs) if down_maxs else 0
        up_mean = np.mean(up_maxs) if up_maxs else 0
        diff = down_mean - up_mean
        signal = "✓ YES" if diff > 0.00005 else "✗ no"

        print(f"{hours:>4}h       {down_mean*100:>18.4f}%  {up_mean*100:>18.4f}%  {diff*100:>10.4f}%  {signal:>10}")

    # Distribution: how often was funding elevated before DOWN vs UP?
    print(f"\n--- Elevated Funding (>0.05%) Before Events ---")
    print(f"{'Window':<12} {'Before DOWN':>15} {'Before UP':>15} {'Ratio':>10}")
    print(f"{'─'*56}")

    for hours in windows:
        down_elevated = sum(1 for i in down_indices
                          if get_max_funding_window(timestamps[i], hours, fr_ts, fr_rates) > 0.0005)
        up_elevated = sum(1 for i in up_indices
                        if get_max_funding_window(timestamps[i], hours, fr_ts, fr_rates) > 0.0005)

        down_pct = down_elevated / len(down_indices) * 100 if down_indices.size else 0
        up_pct = up_elevated / len(up_indices) * 100 if up_indices.size else 0
        ratio = down_pct / up_pct if up_pct > 0 else 0

        print(f"{hours:>4}h       {down_pct:>13.1f}%  {up_pct:>13.1f}%  {ratio:>9.2f}x")

    # Extreme funding (>0.1%) before events
    print(f"\n--- Extreme Funding (>0.1%) Before Events ---")
    print(f"{'Window':<12} {'Before DOWN':>15} {'Before UP':>15} {'Ratio':>10}")
    print(f"{'─'*56}")

    for hours in windows:
        down_extreme = sum(1 for i in down_indices
                         if get_max_funding_window(timestamps[i], hours, fr_ts, fr_rates) > 0.001)
        up_extreme = sum(1 for i in up_indices
                       if get_max_funding_window(timestamps[i], hours, fr_ts, fr_rates) > 0.001)

        down_pct = down_extreme / len(down_indices) * 100 if down_indices.size else 0
        up_pct = up_extreme / len(up_indices) * 100 if up_indices.size else 0
        ratio = down_pct / up_pct if up_pct > 0 else 0

        print(f"{hours:>4}h       {down_pct:>13.1f}%  {up_pct:>13.1f}%  {ratio:>9.2f}x")

    # Timeline: show the 10 biggest losing trades and their pre-trade funding
    print(f"\n{'='*100}")
    print(f"TOP 10 DC DOWN EVENTS WITH HIGHEST PRE-EVENT FUNDING (7-day max)")
    print(f"{'='*100}")

    down_with_funding = []
    for i in down_indices:
        ts = timestamps[i]
        price = prices[i]
        max_fr_7d = get_max_funding_window(ts, 168, fr_ts, fr_rates)
        avg_fr_7d = get_avg_funding_window(ts, 168, fr_ts, fr_rates)
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        down_with_funding.append((dt, price, max_fr_7d, avg_fr_7d))

    down_with_funding.sort(key=lambda x: x[2], reverse=True)

    print(f"{'Date':<22} {'Price':>12} {'Max FR (7d)':>12} {'Avg FR (7d)':>12}")
    print(f"{'─'*60}")
    for dt, price, max_fr, avg_fr in down_with_funding[:10]:
        print(f"{dt.strftime('%Y-%m-%d %H:%M'):<22} ${price:>10,.0f}  {max_fr*100:>10.4f}%  {avg_fr*100:>10.4f}%")

    # Overall conclusion
    print(f"\n{'='*100}")
    print(f"CONCLUSION")
    print(f"{'='*100}")

    # Check if there's a meaningful difference
    down_avg_168 = np.mean([get_avg_funding_window(timestamps[i], 168, fr_ts, fr_rates) for i in down_indices])
    up_avg_168 = np.mean([get_avg_funding_window(timestamps[i], 168, fr_ts, fr_rates) for i in up_indices])
    diff = down_avg_168 - up_avg_168

    if diff > 0.0001:
        print(f"  Funding rate IS elevated before DC DOWN events (tops).")
        print(f"  7-day avg before tops: {down_avg_168*100:.4f}% vs bottoms: {up_avg_168*100:.4f}%")
        print(f"  Difference: {diff*100:.4f}% — potentially useful as early warning.")
    elif diff > 0.00005:
        print(f"  Weak signal: funding slightly elevated before tops.")
        print(f"  7-day avg before tops: {down_avg_168*100:.4f}% vs bottoms: {up_avg_168*100:.4f}%")
        print(f"  Difference: {diff*100:.4f}% — marginal, likely noise.")
    else:
        print(f"  No meaningful lead-lag relationship found.")
        print(f"  7-day avg before tops: {down_avg_168*100:.4f}% vs bottoms: {up_avg_168*100:.4f}%")
        print(f"  Funding rate does not predict DC reversals.")


if __name__ == "__main__":
    main()
