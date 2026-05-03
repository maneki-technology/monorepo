#!/usr/bin/env python3
"""Train/test validation: find optimal funding threshold on 2017-2020, test on 2021-2026.

Funding rate data starts Sept 2019, so the funding filter only applies to
the 2019-2020 portion of training. The 2017-2018 data validates the baseline.
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
from backtest_funding import (
    load_funding_rates,
    align_funding_to_prices,
    compute_avg_funding,
    simulate_with_funding,
)


def load_all_ticks(data_dir: Path) -> list:
    """Load and merge all price data files, sorted by timestamp."""
    all_ticks = []

    for pkl in ["test_2017_2018_1m.pkl", "train_2019_2024_1m.pkl", "test_2025_1m.pkl", "test_2026_q1_1m.pkl"]:
        path = data_dir / pkl
        if path.exists():
            with open(path, "rb") as f:
                ticks = pickle.load(f)
                all_ticks.extend(ticks)
                yr_start = datetime.fromtimestamp(ticks[0].timestamp, tz=timezone.utc).year
                yr_end = datetime.fromtimestamp(ticks[-1].timestamp, tz=timezone.utc).year
                print(f"  Loaded {pkl}: {len(ticks):,} ticks ({yr_start}-{yr_end})")

    # Sort by timestamp (in case of overlap)
    all_ticks.sort(key=lambda t: t.timestamp)

    # Deduplicate by timestamp
    seen = set()
    deduped = []
    for t in all_ticks:
        if t.timestamp not in seen:
            seen.add(t.timestamp)
            deduped.append(t)

    return deduped


def split_by_year(ticks: list, cutoff_year: int) -> tuple[list, list]:
    """Split ticks into train (< cutoff_year) and test (>= cutoff_year)."""
    train = [t for t in ticks if datetime.fromtimestamp(t.timestamp, tz=timezone.utc).year < cutoff_year]
    test = [t for t in ticks if datetime.fromtimestamp(t.timestamp, tz=timezone.utc).year >= cutoff_year]
    return train, test


def run_backtest(
    ticks: list,
    fr_ts: NDArray,
    fr_rates: NDArray,
    threshold: float,
    trail: float,
    buffer: float,
    capital: float,
    ma_period: int,
    trail_window: int,
    fee_pct: float,
    funding_skip: float,  # 0 = no funding filter
    label: str,
) -> dict:
    """Run a single backtest on given ticks with optional funding filter."""
    prices = np.array([t.price for t in ticks], dtype=np.float64)
    timestamps = np.array([t.timestamp for t in ticks], dtype=np.float64)

    dc_events = detect_dc_events(prices, threshold)
    ma = compute_ma(prices, ma_period)
    trail_pcts = compute_vol_trail(prices, trail_window, trail)
    warmup_n = ma_period

    if funding_skip > 0:
        funding_24h = compute_avg_funding(timestamps, fr_ts, fr_rates, 24)
        result = simulate_with_funding(
            prices, timestamps, dc_events, ma, trail_pcts, funding_24h,
            buffer, fee_pct, capital, warmup_n,
            skip_threshold=funding_skip, trail_tighten=0, trail_funding_threshold=0,
        )
    else:
        result = simulate_strategy(
            prices, timestamps, dc_events, ma, trail_pcts,
            buffer, fee_pct, capital, "3reg", warmup_n,
        )
        result["skipped_entries"] = 0

    return result


def main():
    parser = argparse.ArgumentParser(description="Train/test funding rate validation")
    parser.add_argument("--capital", type=float, default=1000.0)
    parser.add_argument("--threshold", type=float, default=0.07)
    parser.add_argument("--trail", type=float, default=0.02)
    parser.add_argument("--buffer", type=float, default=0.03)
    args = parser.parse_args()

    ma_period = 60 * 24 * 60  # 60 days
    trail_window = 72 * 60    # 72h
    fee_pct = 0.001
    data_dir = Path(__file__).parent.parent / "data" / "cache"

    # Load all data
    print("Loading price data...")
    all_ticks = load_all_ticks(data_dir)
    print(f"  Total: {len(all_ticks):,} ticks")

    # Load funding rates
    fr_ts, fr_rates = load_funding_rates(data_dir / "funding_rates_btcusdt.csv")
    print(f"\nLoaded {len(fr_rates):,} funding rate records")

    # Split: train 2017-2020, test 2021-2026
    train_ticks, test_ticks = split_by_year(all_ticks, 2021)
    train_start = datetime.fromtimestamp(train_ticks[0].timestamp, tz=timezone.utc)
    train_end = datetime.fromtimestamp(train_ticks[-1].timestamp, tz=timezone.utc)
    test_start = datetime.fromtimestamp(test_ticks[0].timestamp, tz=timezone.utc)
    test_end = datetime.fromtimestamp(test_ticks[-1].timestamp, tz=timezone.utc)

    print(f"\nTrain: {len(train_ticks):,} ticks ({train_start.date()} to {train_end.date()})")
    print(f"Test:  {len(test_ticks):,} ticks ({test_start.date()} to {test_end.date()})")

    # ========================================
    # PHASE 1: Find optimal threshold on TRAIN
    # ========================================
    print(f"\n{'='*100}")
    print(f"PHASE 1: TRAINING (2017-2020) — Find optimal funding skip threshold")
    print(f"{'='*100}\n")

    skip_thresholds = [0, 0.00010, 0.00015, 0.00020, 0.00025, 0.00030, 0.00035, 0.00040]
    train_results = {}

    for skip in skip_thresholds:
        label = f"Skip > {skip*100:.3f}%" if skip > 0 else "Baseline (no funding)"
        result = run_backtest(
            train_ticks, fr_ts, fr_rates,
            args.threshold, args.trail, args.buffer, args.capital,
            ma_period, trail_window, fee_pct,
            funding_skip=skip, label=label,
        )
        train_results[skip] = result

    print(f"{'Strategy':<35} {'PnL':>10} {'Return':>8} {'Trades':>7} {'Win%':>6} {'Sharpe':>7} {'MaxDD':>7} {'Skip':>5}")
    print("─" * 95)

    for skip, r in train_results.items():
        label = f"Skip > {skip*100:.3f}%" if skip > 0 else "Baseline (no funding)"
        marker = " ◀" if skip == 0 else ""
        print(
            f"{label:<35} "
            f"${r['total_pnl']:>9,.0f} "
            f"{r['return_pct']:>7.1f}% "
            f"{r['num_trades']:>6d} "
            f"{r.get('win_rate', 0)*100:>5.1f}% "
            f"{r.get('sharpe', 0):>7.2f} "
            f"{r.get('max_dd', 0):>6.1f}% "
            f"{r.get('skipped_entries', 0):>5d}"
            f"{marker}"
        )

    # Find best by Sharpe on train
    best_skip = max(skip_thresholds, key=lambda s: train_results[s].get("sharpe", 0))
    print(f"\nBest on train (by Sharpe): Skip > {best_skip*100:.3f}%")

    # ========================================
    # PHASE 2: Validate on TEST
    # ========================================
    print(f"\n{'='*100}")
    print(f"PHASE 2: TESTING (2021-2026) — Validate with threshold from training")
    print(f"{'='*100}\n")

    test_results = {}
    # Test baseline + best from train + a few neighbors
    test_thresholds = sorted(set([0, best_skip] + [t for t in skip_thresholds if abs(t - best_skip) <= 0.0001]))

    for skip in test_thresholds:
        label = f"Skip > {skip*100:.3f}%" if skip > 0 else "Baseline (no funding)"
        result = run_backtest(
            test_ticks, fr_ts, fr_rates,
            args.threshold, args.trail, args.buffer, args.capital,
            ma_period, trail_window, fee_pct,
            funding_skip=skip, label=label,
        )
        test_results[skip] = result

    print(f"{'Strategy':<35} {'PnL':>10} {'Return':>8} {'Trades':>7} {'Win%':>6} {'Sharpe':>7} {'MaxDD':>7} {'Skip':>5}")
    print("─" * 95)

    baseline_test = test_results[0]
    for skip, r in test_results.items():
        label = f"Skip > {skip*100:.3f}%" if skip > 0 else "Baseline (no funding)"
        is_best = skip == best_skip
        marker = " ◀ TRAIN BEST" if is_best else (" ◀ BASELINE" if skip == 0 else "")
        print(
            f"{label:<35} "
            f"${r['total_pnl']:>9,.0f} "
            f"{r['return_pct']:>7.1f}% "
            f"{r['num_trades']:>6d} "
            f"{r.get('win_rate', 0)*100:>5.1f}% "
            f"{r.get('sharpe', 0):>7.2f} "
            f"{r.get('max_dd', 0):>6.1f}% "
            f"{r.get('skipped_entries', 0):>5d}"
            f"{marker}"
        )

    # ========================================
    # VERDICT
    # ========================================
    print(f"\n{'='*100}")
    print(f"VERDICT")
    print(f"{'='*100}")

    best_test = test_results[best_skip]
    train_baseline = train_results[0]
    train_best = train_results[best_skip]

    print(f"\n  Optimal threshold (from train): Skip 24h avg FR > {best_skip*100:.3f}%")
    print(f"\n  {'Metric':<20} {'Train Baseline':>15} {'Train Best':>15} {'Test Baseline':>15} {'Test Best':>15}")
    print(f"  {'─'*80}")
    print(f"  {'Return':<20} {train_baseline['return_pct']:>14.1f}% {train_best['return_pct']:>14.1f}% {baseline_test['return_pct']:>14.1f}% {best_test['return_pct']:>14.1f}%")
    print(f"  {'Sharpe':<20} {train_baseline.get('sharpe',0):>15.3f} {train_best.get('sharpe',0):>15.3f} {baseline_test.get('sharpe',0):>15.3f} {best_test.get('sharpe',0):>15.3f}")
    print(f"  {'Max DD':<20} {train_baseline.get('max_dd',0):>14.1f}% {train_best.get('max_dd',0):>14.1f}% {baseline_test.get('max_dd',0):>14.1f}% {best_test.get('max_dd',0):>14.1f}%")
    print(f"  {'Trades':<20} {train_baseline['num_trades']:>15d} {train_best['num_trades']:>15d} {baseline_test['num_trades']:>15d} {best_test['num_trades']:>15d}")
    print(f"  {'Win Rate':<20} {train_baseline.get('win_rate',0)*100:>14.1f}% {train_best.get('win_rate',0)*100:>14.1f}% {baseline_test.get('win_rate',0)*100:>14.1f}% {best_test.get('win_rate',0)*100:>14.1f}%")

    # Does it generalize?
    train_improvement = train_best["return_pct"] - train_baseline["return_pct"]
    test_improvement = best_test["return_pct"] - baseline_test["return_pct"]

    print(f"\n  Train improvement: {train_improvement:+.1f}%")
    print(f"  Test improvement:  {test_improvement:+.1f}%")

    if test_improvement > 0 and best_test.get("sharpe", 0) > baseline_test.get("sharpe", 0):
        print(f"\n  ✅ GENERALIZES: Funding rate filter improves out-of-sample performance.")
        print(f"     Recommend integrating into production bot.")
    elif test_improvement > 0:
        print(f"\n  ⚠️  MIXED: Returns improve but Sharpe doesn't. Proceed with caution.")
    else:
        print(f"\n  ❌ OVERFIT: Improvement doesn't generalize to test set.")
        print(f"     Do NOT integrate into production bot.")


if __name__ == "__main__":
    main()
