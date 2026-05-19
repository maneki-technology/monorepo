#!/usr/bin/env python3
"""Backtest: 2-regime (bull/bear) vs 3-regime (bull/sideways/bear).

Compares:
  A) Current strategy: bull=hold, bear=DC+trailing_stop
  B) 3-regime: bull=hold, sideways=DC_only, bear=DC+trailing_stop

Both use ZI-DCT0 logic (buy on DC UP, sell on DC DOWN) with:
  - λ=0.07 DC threshold
  - 60d MA regime filter with 3% buffer
  - 2% vol-trailing stop (72h lookback) in BEAR mode
  - Long-only, 0.1% fees

Usage:
    python scripts/backtest_regimes.py
    python scripts/backtest_regimes.py --since 2023-01-01 --until 2025-01-01
"""

from __future__ import annotations

import argparse
import math
from collections import deque
from dataclasses import dataclass, field
from enum import Enum, auto

import numpy as np
import pandas as pd

from dctrading.data.loader import DataLoader
from dctrading.dc.detector import DCDetector
from dctrading.types import DCEvent, Direction, Tick


# ── Regime definitions ──────────────────────────────────────────────

class Regime2(Enum):
    BULL = auto()
    BEAR = auto()


class Regime3(Enum):
    BULL = auto()
    SIDEWAYS = auto()
    BEAR = auto()


# ── Shared config ───────────────────────────────────────────────────

@dataclass
class StrategyConfig:
    dc_threshold: float = 0.07
    ma_period: int = 60 * 24 * 60  # 60 days in 1-min ticks
    ma_buffer: float = 0.03
    trail_pct: float = 0.02
    trail_window: int = 72 * 60  # 72h in 1-min ticks
    fee_pct: float = 0.001
    initial_capital: float = 10000.0


# ── Trade record ────────────────────────────────────────────────────

@dataclass
class Trade:
    entry_price: float
    entry_time: float
    exit_price: float
    exit_time: float
    pnl: float
    exit_type: str  # "dc_exit", "trailing_stop", "regime_close"


# ── Base strategy with shared MA/vol/DC logic ──────────────────────

class BaseStrategy:
    def __init__(self, cfg: StrategyConfig) -> None:
        self.cfg = cfg
        self.detector = DCDetector(threshold=cfg.dc_threshold)
        self.capital = cfg.initial_capital
        self.in_position = False
        self.entry_price = 0.0
        self.entry_time = 0.0
        self.size = 0.0
        self.peak_price = 0.0
        self.trades: list[Trade] = []

        # MA state
        self.ma_buf: deque[float] = deque(maxlen=cfg.ma_period)
        self.ma_sum: float = 0.0
        self.ma_filled: bool = False

        # Vol-trailing state (matches Zig: log returns, ratio to cumulative avg)
        self.vol_returns: deque[float] = deque(maxlen=cfg.trail_window)
        self.current_trail: float = cfg.trail_pct
        self.last_price: float = 0.0
        self.cum_vol_sum: float = 0.0
        self.cum_vol_count: int = 0
        self.avg_vol: float = 0.0

        self.tick_count = 0

    def update_ma(self, price: float) -> float | None:
        if len(self.ma_buf) == self.cfg.ma_period:
            self.ma_sum -= self.ma_buf[0]
        self.ma_buf.append(price)
        self.ma_sum += price
        if len(self.ma_buf) >= self.cfg.ma_period:
            self.ma_filled = True
            return self.ma_sum / len(self.ma_buf)
        return None

    def update_vol(self, price: float) -> None:
        """Vol-trailing stop matching Zig: log returns, ratio to cumulative avg, clamped [0.5, 3.0]."""
        if self.last_price > 0:
            import math
            ret = math.log(price / self.last_price)
            self.vol_returns.append(ret)

            if len(self.vol_returns) >= self.cfg.trail_window:
                recent_vol = float(np.std(list(self.vol_returns), ddof=1))
                if self.cum_vol_count > 0 and self.avg_vol > 0 and recent_vol > 0:
                    ratio = max(0.5, min(3.0, recent_vol / self.avg_vol))
                    self.current_trail = self.cfg.trail_pct * ratio
                self.cum_vol_sum += recent_vol
                self.cum_vol_count += 1
                self.avg_vol = self.cum_vol_sum / self.cum_vol_count
        self.last_price = price

    def open_position(self, price: float, time: float) -> None:
        fee = self.capital * self.cfg.fee_pct
        usable = self.capital - fee
        self.size = usable / price
        self.entry_price = price
        self.entry_time = time
        self.peak_price = price
        self.in_position = True

    def close_position(self, price: float, time: float, exit_type: str) -> Trade:
        raw_pnl = (price - self.entry_price) * self.size
        exit_fee = self.size * price * self.cfg.fee_pct
        net_pnl = raw_pnl - exit_fee
        trade = Trade(
            entry_price=self.entry_price,
            entry_time=self.entry_time,
            exit_price=price,
            exit_time=time,
            pnl=net_pnl,
            exit_type=exit_type,
        )
        self.capital += net_pnl
        self.in_position = False
        self.size = 0.0
        self.trades.append(trade)
        return trade

    def check_trailing_stop(self, price: float, time: float) -> Trade | None:
        if not self.in_position:
            return None
        if price > self.peak_price:
            self.peak_price = price
        if self.current_trail > 0 and self.peak_price > 0:
            drop = (self.peak_price - price) / self.peak_price
            if drop >= self.current_trail:
                return self.close_position(price, time, "trailing_stop")
        return None

    def summary(self) -> dict:
        if not self.trades:
            return {
                "total_pnl": 0, "return_pct": 0, "num_trades": 0,
                "win_rate": 0, "sharpe": 0, "max_dd": 0,
                "avg_pnl": 0, "dc_exits": 0, "trail_exits": 0, "regime_exits": 0,
            }
        pnls = [t.pnl for t in self.trades]
        wins = sum(1 for p in pnls if p > 0)
        total_pnl = sum(pnls)

        # Equity curve drawdown
        equity = self.cfg.initial_capital
        peak = equity
        max_dd = 0.0
        returns = []
        for t in self.trades:
            ret = t.pnl / equity if equity > 0 else 0.0
            returns.append(ret)
            equity += t.pnl
            if equity > peak:
                peak = equity
            dd = (peak - equity) / peak if peak > 0 else 0.0
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
            "return_pct": round(total_pnl / self.cfg.initial_capital * 100, 2),
            "num_trades": len(self.trades),
            "win_rate": round(wins / len(self.trades), 3),
            "sharpe": round(sharpe, 3),
            "max_dd": round(max_dd * 100, 2),
            "avg_pnl": round(total_pnl / len(self.trades), 2),
            "dc_exits": sum(1 for t in self.trades if t.exit_type == "dc_exit"),
            "trail_exits": sum(1 for t in self.trades if t.exit_type == "trailing_stop"),
            "regime_exits": sum(1 for t in self.trades if t.exit_type == "regime_close"),
        }


# ── Strategy A: legacy 2-regime baseline ────────────────────────────

class TwoRegimeStrategy(BaseStrategy):
    """Legacy bull=hold, bear=DC+trailing_stop baseline."""

    def __init__(self, cfg: StrategyConfig) -> None:
        super().__init__(cfg)
        self.regime = Regime2.BEAR

    def process_tick(self, tick: Tick) -> None:
        price = tick.price
        self.tick_count += 1
        self.update_vol(price)
        ma = self.update_ma(price)

        # Regime transitions
        if ma is not None:
            if self.regime == Regime2.BEAR and price > ma * (1.0 + self.cfg.ma_buffer):
                # Close any BEAR position on regime change
                if self.in_position:
                    self.close_position(price, tick.timestamp, "regime_close")
                self.regime = Regime2.BULL
            elif self.regime == Regime2.BULL and price < ma * (1.0 - self.cfg.ma_buffer):
                self.regime = Regime2.BEAR

        # BULL: hold passively
        if self.regime == Regime2.BULL:
            if not self.in_position:
                self.open_position(price, tick.timestamp)
            # Track equity
            unrealized = (price - self.entry_price) * self.size if self.in_position else 0
            pass  # equity tracking removed for perf
            return

        # BEAR: trailing stop check
        if self.in_position:
            if price > self.peak_price:
                self.peak_price = price
            if self.check_trailing_stop(price, tick.timestamp):
                pass  # equity tracking removed for perf
                return

        # BEAR: DC detection
        event = self.detector.process_tick(tick)
        if event is not None:
            if event.direction is Direction.UP and not self.in_position:
                self.open_position(price, tick.timestamp)
            elif event.direction is Direction.DOWN and self.in_position:
                self.close_position(price, tick.timestamp, "dc_exit")

        unrealized = (price - self.entry_price) * self.size if self.in_position else 0
        pass  # equity tracking removed for perf


# ── Strategy B: 3-regime ────────────────────────────────────────────

class ThreeRegimeStrategy(BaseStrategy):
    """bull=hold, sideways=DC_only (no trailing stop), bear=DC+trailing_stop."""

    def __init__(self, cfg: StrategyConfig) -> None:
        super().__init__(cfg)
        self.regime = Regime3.BEAR

    def process_tick(self, tick: Tick) -> None:
        price = tick.price
        self.tick_count += 1
        self.update_vol(price)
        ma = self.update_ma(price)

        # Regime transitions (3-way)
        if ma is not None:
            upper = ma * (1.0 + self.cfg.ma_buffer)
            lower = ma * (1.0 - self.cfg.ma_buffer)

            if price > upper:
                new_regime = Regime3.BULL
            elif price < lower:
                new_regime = Regime3.BEAR
            else:
                new_regime = Regime3.SIDEWAYS

            # Handle regime transitions
            if new_regime != self.regime:
                old = self.regime
                self.regime = new_regime

                # Entering BULL: close any active trade, then hold
                if new_regime == Regime3.BULL and self.in_position and old != Regime3.BULL:
                    # Keep position — we're going to hold it
                    pass
                # Leaving BULL: position stays open, now managed by DC/trailing
                # Entering BEAR from SIDEWAYS: trailing stop activates (position stays)

        # BULL: hold passively
        if self.regime == Regime3.BULL:
            if not self.in_position:
                self.open_position(price, tick.timestamp)
            unrealized = (price - self.entry_price) * self.size if self.in_position else 0
            pass  # equity tracking removed for perf
            return

        # BEAR: trailing stop check
        if self.regime == Regime3.BEAR and self.in_position:
            if price > self.peak_price:
                self.peak_price = price
            if self.check_trailing_stop(price, tick.timestamp):
                pass  # equity tracking removed for perf
                return

        # SIDEWAYS + BEAR: DC detection
        event = self.detector.process_tick(tick)
        if event is not None:
            if event.direction is Direction.UP and not self.in_position:
                self.open_position(price, tick.timestamp)
            elif event.direction is Direction.DOWN and self.in_position:
                self.close_position(price, tick.timestamp, "dc_exit")

        unrealized = (price - self.entry_price) * self.size if self.in_position else 0
        pass  # equity tracking removed for perf


# ── Strategy C: Adaptive 3-regime ───────────────────────────────────

class AdaptiveRegimeStrategy(BaseStrategy):
    """Adaptive sideways: bull→sideways=hold, bear→sideways=DC only."""

    def __init__(self, cfg: StrategyConfig) -> None:
        super().__init__(cfg)
        self.regime = Regime3.BEAR
        self.prev_non_sideways = Regime3.BEAR  # last BULL or BEAR

    def process_tick(self, tick: Tick) -> None:
        price = tick.price
        self.tick_count += 1
        self.update_vol(price)
        ma = self.update_ma(price)

        # Regime transitions (3-way)
        if ma is not None:
            upper = ma * (1.0 + self.cfg.ma_buffer)
            lower = ma * (1.0 - self.cfg.ma_buffer)

            if price > upper:
                new_regime = Regime3.BULL
            elif price < lower:
                new_regime = Regime3.BEAR
            else:
                new_regime = Regime3.SIDEWAYS

            if new_regime != self.regime:
                self.regime = new_regime
                if new_regime != Regime3.SIDEWAYS:
                    self.prev_non_sideways = new_regime

        # BULL: hold passively
        if self.regime == Regime3.BULL:
            if not self.in_position:
                self.open_position(price, tick.timestamp)
            return

        # BEAR: trailing stop + DC
        if self.regime == Regime3.BEAR:
            if self.in_position:
                if price > self.peak_price:
                    self.peak_price = price
                if self.check_trailing_stop(price, tick.timestamp):
                    return
            event = self.detector.process_tick(tick)
            if event is not None:
                if event.direction is Direction.UP and not self.in_position:
                    self.open_position(price, tick.timestamp)
                elif event.direction is Direction.DOWN and self.in_position:
                    self.close_position(price, tick.timestamp, 'dc_exit')
            return

        # SIDEWAYS: behavior depends on where we came from
        if self.prev_non_sideways == Regime3.BULL:
            # bull→sideways: hold (don't sell, don't DCT)
            if not self.in_position:
                self.open_position(price, tick.timestamp)
            return
        else:
            # bear→sideways: DCT only (no trailing stop)
            event = self.detector.process_tick(tick)
            if event is not None:
                if event.direction is Direction.UP and not self.in_position:
                    self.open_position(price, tick.timestamp)
                elif event.direction is Direction.DOWN and self.in_position:
                    self.close_position(price, tick.timestamp, 'dc_exit')

# ── Runner ──────────────────────────────────────────────────────────


def run_backtest(ticks: list[Tick], cfg: StrategyConfig) -> tuple[dict, dict, dict]:
    """Run all three strategies on the same tick data."""
    strat_2 = TwoRegimeStrategy(cfg)
    strat_3 = ThreeRegimeStrategy(cfg)
    strat_a = AdaptiveRegimeStrategy(cfg)
    for tick in ticks:
        strat_2.process_tick(tick)
        strat_3.process_tick(tick)
        strat_a.process_tick(tick)
    return strat_2.summary(), strat_3.summary(), strat_a.summary()

def run_single(args: tuple) -> tuple[float, dict, dict, dict]:
    """Run all strategies for a single threshold. Picklable for multiprocessing."""
    ticks_data, threshold, trail_pct, ma_buffer = args
    ticks = [Tick(timestamp=t, price=p, volume=v) for t, p, v in ticks_data]
    cfg = StrategyConfig(
        dc_threshold=threshold,
        trail_pct=trail_pct,
        ma_buffer=ma_buffer,
    )
    s2, s3, sa = run_backtest(ticks, cfg)
    return threshold, s2, s3, sa


def main() -> None:
    import multiprocessing as mp

    parser = argparse.ArgumentParser(description="2-regime vs 3-regime backtest")
    parser.add_argument("--since", default="2019-01-01", help="Start date (ISO)")
    parser.add_argument("--until", default="2025-12-31", help="End date (ISO)")
    parser.add_argument("--trail", type=float, default=0.02, help="Trailing stop %%")
    parser.add_argument("--buffer", type=float, default=0.03, help="MA buffer %%")
    args = parser.parse_args()

    thresholds = [0.03, 0.05, 0.07, 0.10, 0.15]

    print("=" * 90)
    print("DC Trading — 2-Regime vs 3-Regime Sweep (Parallel)")
    print("=" * 90)
    print(f"  Period:     {args.since} → {args.until}")
    print(f"  Thresholds: {thresholds}")
    print(f"  MA buffer:  {args.buffer * 100:.0f}%")
    print(f"  Trail stop: {args.trail * 100:.0f}%")
    print(f"  Capital:    $10,000")
    print()

    print("Fetching data...")
    loader = DataLoader()
    df = loader.fetch_ohlcv("BTC/USDT", "1m", args.since, args.until)
    ticks = loader.ohlcv_to_ticks(df)
    print(f"  {len(ticks):,} 1-min ticks loaded")
    print()

    # Serialize tick data for multiprocessing
    ticks_data = [(t.timestamp, t.price, t.volume) for t in ticks]
    work = [(ticks_data, th, args.trail, args.buffer) for th in thresholds]

    print(f"Running {len(thresholds)} threshold sweeps on {mp.cpu_count()} cores...")
    with mp.Pool(processes=min(len(thresholds), mp.cpu_count())) as pool:
        results = pool.map(run_single, work)
    print("Done.\n")

    # Summary table
    print(f"{'λ':>6} │ {'2R PnL':>10} {'2R Sharpe':>10} {'2R MaxDD':>9} {'2R #Tr':>6} │ {'3R PnL':>10} {'3R Sharpe':>10} {'3R MaxDD':>9} {'3R #Tr':>6} │ {'ΔPnL':>8} {'ΔSharpe':>8} {'ΔMaxDD':>8}")
    print("─" * 120)

    for threshold, s2, s3 in sorted(results, key=lambda x: x[0]):
        dp = s3['total_pnl'] - s2['total_pnl']
        ds = s3['sharpe'] - s2['sharpe']
        dd = s3['max_dd'] - s2['max_dd']
        print(
            f"{threshold:>6.2f} │"
            f" ${s2['total_pnl']:>9,.0f} {s2['sharpe']:>10.2f} {s2['max_dd']:>8.1f}% {s2['num_trades']:>6d} │"
            f" ${s3['total_pnl']:>9,.0f} {s3['sharpe']:>10.2f} {s3['max_dd']:>8.1f}% {s3['num_trades']:>6d} │"
            f" {dp:>+8,.0f} {ds:>+8.2f} {dd:>+7.1f}%"
            f"{'  ✓' if ds > 0 and dd <= 0 else ''}"
        )

    print("─" * 120)
    print()
    print("✓ = 3-regime has better Sharpe AND same/lower drawdown")
    print()


if __name__ == "__main__":
    main()
