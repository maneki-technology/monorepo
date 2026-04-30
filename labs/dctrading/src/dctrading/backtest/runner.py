"""VectorBT-based backtest runner with DC threshold parameter sweep.

Runs DC detection across multiple lambda values, evaluates trading
performance using both a simple ZI-DCT0 simulation and VectorBT's
vectorised portfolio engine.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import vectorbt as vbt

from dctrading.agents.zi_dct0 import ZiDCT0
from dctrading.dc.detector import DCDetector
from dctrading.types import DCEvent, Direction, Tick, TradingAction

__all__ = ["BacktestRunner"]

_DEFAULT_THRESHOLDS: list[float] = [
    0.001, 0.002, 0.005, 0.01, 0.015, 0.02, 0.03, 0.05, 0.08, 0.10,
]


class BacktestRunner:
    """Backtest runner for DC-based trading strategies.

    Takes historical tick data, runs DC detection across multiple lambda
    values, and evaluates trading performance using both a lightweight
    ZI-DCT0 loop and VectorBT's vectorised portfolio simulation.
    """

    def __init__(
        self,
        ticks: list[Tick],
        fee_pct: float = 0.001,
        initial_capital: float = 10000.0,
    ) -> None:
        """Initialise the runner.

        Args:
            ticks: Historical tick data, ordered by timestamp.
            fee_pct: Fee as a fraction of trade value (e.g. 0.001 = 0.1%).
            initial_capital: Starting capital in quote currency.
        """
        self.ticks = ticks
        self.fee_pct = fee_pct
        self.initial_capital = initial_capital

    def _detect_events(self, threshold: float) -> list[DCEvent]:
        """Run DC detection on all ticks for a given threshold.

        Args:
            threshold: The DC lambda threshold.

        Returns:
            List of detected DC events.
        """
        detector = DCDetector(threshold=threshold)
        events: list[DCEvent] = []
        for tick in self.ticks:
            event = detector.process_tick(tick)
            if event is not None:
                events.append(event)
        return events

    def run_single(self, threshold: float) -> dict:
        """Run DC detection + ZI-DCT0 for a single threshold.

        Args:
            threshold: The DC lambda threshold.

        Returns:
            Summary dict with performance metrics.
        """
        events = self._detect_events(threshold)
        strategy = ZiDCT0(threshold=threshold)
        trades = strategy.run(
            events,
            initial_capital=self.initial_capital,
            fee_pct=self.fee_pct,
        )
        summary = strategy.summary(trades)
        summary["threshold"] = threshold
        return summary

    def sweep_thresholds(
        self, thresholds: list[float] | None = None
    ) -> pd.DataFrame:
        """Run ZI-DCT0 across multiple DC thresholds.

        Args:
            thresholds: List of lambda values to test. Uses a sensible
                default range if None.

        Returns:
            DataFrame with columns: threshold, total_pnl, total_return_pct,
            num_trades, win_rate, sharpe_ratio, max_drawdown.
        """
        if thresholds is None:
            thresholds = _DEFAULT_THRESHOLDS

        rows: list[dict] = []
        for th in thresholds:
            row = self.run_single(th)
            rows.append(row)

        df = pd.DataFrame(rows)
        return df[
            [
                "threshold",
                "total_pnl",
                "total_return_pct",
                "num_trades",
                "win_rate",
                "sharpe_ratio",
                "max_drawdown",
            ]
        ]

    def _build_signals(
        self, events: list[DCEvent]
    ) -> tuple[pd.DatetimeIndex, pd.Series, pd.Series, pd.Series]:
        """Convert ticks and DC events into VectorBT-compatible signal arrays.

        Builds a price series indexed by datetime and boolean entry/exit
        signal arrays aligned to the same index.

        Args:
            events: DC events detected for a given threshold.

        Returns:
            Tuple of (index, close_prices, entries, exits).
        """
        # Build price series from ticks
        timestamps = pd.to_datetime(
            [t.timestamp for t in self.ticks], unit="s", utc=True
        )
        prices = pd.Series(
            [t.price for t in self.ticks], index=timestamps, name="Close"
        )

        # Map event confirmation times to nearest tick index positions
        entries = pd.Series(np.zeros(len(self.ticks), dtype=bool), index=timestamps)
        exits = pd.Series(np.zeros(len(self.ticks), dtype=bool), index=timestamps)

        # Build a lookup from timestamp to index position for fast matching
        ts_array = np.array([t.timestamp for t in self.ticks])

        for event in events:
            # Find the tick closest to the confirmation time
            idx = int(np.searchsorted(ts_array, event.confirm_time))
            idx = min(idx, len(self.ticks) - 1)

            action = (
                TradingAction.BUY
                if event.direction is Direction.UP
                else TradingAction.SELL
            )
            if action is TradingAction.BUY:
                entries.iloc[idx] = True
            else:
                exits.iloc[idx] = True

        return timestamps, prices, entries, exits

    def run_vectorbt(self, threshold: float) -> vbt.Portfolio:
        """Run a VectorBT portfolio simulation for a single threshold.

        Converts DC events to entry/exit signals and uses VectorBT's
        Portfolio.from_signals() for vectorised simulation.

        Args:
            threshold: The DC lambda threshold.

        Returns:
            A VectorBT Portfolio object for detailed analysis.
        """
        events = self._detect_events(threshold)
        _index, prices, entries, exits = self._build_signals(events)

        portfolio = vbt.Portfolio.from_signals(
            close=prices,
            entries=entries,
            exits=exits,
            init_cash=self.initial_capital,
            fees=self.fee_pct,
            freq="1T",  # tick-level, approximate as 1-minute
        )
        return portfolio

    def sweep_vectorbt(
        self, thresholds: list[float] | None = None
    ) -> pd.DataFrame:
        """Run VectorBT simulation across multiple DC thresholds.

        Args:
            thresholds: List of lambda values to test. Uses a sensible
                default range if None.

        Returns:
            DataFrame with VectorBT metrics: total_return, sharpe,
            max_drawdown, num_trades, win_rate.
        """
        if thresholds is None:
            thresholds = _DEFAULT_THRESHOLDS

        rows: list[dict] = []
        for th in thresholds:
            pf = self.run_vectorbt(th)
            stats = pf.stats()
            rows.append(
                {
                    "threshold": th,
                    "total_return": float(stats.get("Total Return [%]", 0.0)),
                    "sharpe": float(stats.get("Sharpe Ratio", 0.0)),
                    "max_drawdown": float(stats.get("Max Drawdown [%]", 0.0)),
                    "num_trades": int(stats.get("Total Trades", 0)),
                    "win_rate": float(stats.get("Win Rate [%]", 0.0)) / 100.0,
                }
            )

        return pd.DataFrame(
            rows,
            columns=[
                "threshold",
                "total_return",
                "sharpe",
                "max_drawdown",
                "num_trades",
                "win_rate",
            ],
        )
