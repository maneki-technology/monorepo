#!/usr/bin/env python3
"""Per-year 1m backtest: 2-regime vs 3-regime vs adaptive at λ=0.07. Parallel."""

import pickle
import sys
import multiprocessing as mp
from datetime import datetime, timezone

sys.path.insert(0, "scripts")
from backtest_regimes import run_single
from dctrading.types import Tick


def run_period(args):
    label, ticks_data = args
    _, s2, s3 = run_single((ticks_data, 0.07, 0.02, 0.03))
    return label, s2, s3


def main():
    with open("data/cache/train_2019_2024_1m.pkl", "rb") as f:
        all_ticks = pickle.load(f)
    print(f"Loaded {len(all_ticks):,} ticks")

    year_ticks: dict[int, list] = {}
    for t in all_ticks:
        yr = datetime.fromtimestamp(t.timestamp, tz=timezone.utc).year
        year_ticks.setdefault(yr, []).append(t)

    for yr in sorted(year_ticks):
        print(f"  {yr}: {len(year_ticks[yr]):,} ticks")

    # Per-year only, no combined range (too slow for 3M+ ticks)
    work = []
    years = []
    for yr in sorted(year_ticks):
        if yr < 2019:
            continue
        td = [(t.timestamp, t.price, t.volume) for t in year_ticks[yr]]
        work.append((td, 0.07, 0.02, 0.03))
        years.append(yr)

    print()
    print(
        f"{'Period':<8} │"
        f" {'2R PnL':>10} {'2R Shrp':>8} {'2R DD':>7} {'#':>4} │"
        f" {'3R PnL':>10} {'3R Shrp':>8} {'3R DD':>7} {'#':>4} │"
        f" {'AD PnL':>10} {'AD Shrp':>8} {'AD DD':>7} {'#':>4} │"
        f" {'Best':>8}"
    )
    print('─' * 115)

    with mp.Pool(processes=len(work)) as pool:
        results = pool.map(run_single, work)

    for yr, (_, s2, s3, sa) in zip(years, results):
        best = 'Adapt'
        best_sharpe = sa['sharpe']
        if s2['sharpe'] > best_sharpe:
            best, best_sharpe = '2-Reg', s2['sharpe']
        if s3['sharpe'] > best_sharpe:
            best, best_sharpe = '3-Reg', s3['sharpe']
        print(
            f'{yr:<8} │'
            f' ${s2["total_pnl"]:>9,.0f} {s2["sharpe"]:>8.2f} {s2["max_dd"]:>6.1f}% {s2["num_trades"]:>4d} │'
            f' ${s3["total_pnl"]:>9,.0f} {s3["sharpe"]:>8.2f} {s3["max_dd"]:>6.1f}% {s3["num_trades"]:>4d} │'
            f' ${sa["total_pnl"]:>9,.0f} {sa["sharpe"]:>8.2f} {sa["max_dd"]:>6.1f}% {sa["num_trades"]:>4d} │'
            f' {best:>8}'
        )
    print('─' * 115)


if __name__ == "__main__":
    main()
