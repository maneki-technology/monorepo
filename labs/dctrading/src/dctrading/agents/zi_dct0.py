"""ZI-DCT0: Zero-Intelligence Directional Change Trading Strategy.

The simplest DC trading rule from Aloud et al. (2012).
On every confirmed DC event, take a position in the confirmed direction:
  - UP DC → BUY (go long)
  - DOWN DC → SELL (close long / go short)

Serves as a baseline benchmark for comparing RL agents.
"""

from __future__ import annotations

import math

from dctrading.types import DCEvent, Direction, TradeRecord, TradingAction

__all__ = ["ZiDCT0"]


class ZiDCT0:
    """Zero-Intelligence DCT0 baseline strategy.

    Always trades in the direction of the most recent DC event.
    No intelligence, no indicators — pure trend-following on DC signals.
    """

    def __init__(self, threshold: float) -> None:
        """Initialise the strategy.

        Args:
            threshold: The DC threshold (lambda) this strategy operates on.
        """
        self.threshold = threshold

    def on_event(self, event: DCEvent) -> TradingAction:
        """Decide the trading action for a DC event.

        Args:
            event: A confirmed DC event.

        Returns:
            BUY on UP events, SELL on DOWN events.
        """
        if event.direction is Direction.UP:
            return TradingAction.BUY
        return TradingAction.SELL

    def run(
        self,
        events: list[DCEvent],
        initial_capital: float = 10000.0,
        fee_pct: float = 0.001,
    ) -> list[TradeRecord]:
        """Simulate the strategy over a sequence of DC events.

        Executes trades at the confirmation price of each DC event.
        Position sizing uses full available capital (all-in).

        Args:
            events: Ordered list of DC events to process.
            initial_capital: Starting capital in quote currency.
            fee_pct: Fee as a fraction of trade value (e.g. 0.001 = 0.1%).

        Returns:
            List of completed TradeRecord objects.
        """
        if not events:
            return []

        trades: list[TradeRecord] = []
        capital = initial_capital
        position_side: Direction | None = None
        entry_price = 0.0
        entry_time = 0.0
        size = 0.0

        for event in events:
            action = self.on_event(event)
            price = event.confirm_price
            time = event.confirm_time
            symbol = event.symbol

            if action is TradingAction.BUY and position_side is None:
                # Open long
                fee = capital * fee_pct
                usable = capital - fee
                size = usable / price
                entry_price = price
                entry_time = time
                position_side = Direction.UP

            elif action is TradingAction.SELL and position_side is Direction.UP:
                # Close long
                raw_pnl = (price - entry_price) * size
                exit_fee = size * price * fee_pct
                net_pnl = raw_pnl - exit_fee

                trades.append(
                    TradeRecord(
                        symbol=symbol,
                        side=Direction.UP,
                        entry_price=entry_price,
                        exit_price=price,
                        entry_time=entry_time,
                        exit_time=time,
                        size=size,
                        pnl=net_pnl,
                        fees=exit_fee + (size * entry_price * fee_pct),
                        dc_threshold=self.threshold,
                    )
                )

                capital += net_pnl
                position_side = None
                size = 0.0

        return trades

    @staticmethod
    def summary(trades: list[TradeRecord]) -> dict:
        """Compute performance metrics from a list of completed trades.

        Args:
            trades: List of TradeRecord objects.

        Returns:
            Dict with keys: total_pnl, total_return_pct, num_trades,
            win_rate, avg_trade_pnl, max_drawdown, sharpe_ratio.
        """
        result: dict = {
            "total_pnl": 0.0,
            "total_return_pct": 0.0,
            "num_trades": 0,
            "win_rate": 0.0,
            "avg_trade_pnl": 0.0,
            "max_drawdown": 0.0,
            "sharpe_ratio": 0.0,
        }

        if not trades:
            return result

        num_trades = len(trades)
        pnls = [t.pnl for t in trades]
        total_pnl = sum(pnls)
        wins = sum(1 for p in pnls if p > 0)

        # Reconstruct equity curve for drawdown and Sharpe
        # Assume initial capital from first trade entry
        first = trades[0]
        initial_capital = first.entry_price * first.size + first.fees / 2
        equity = initial_capital
        peak = equity
        max_dd = 0.0
        returns: list[float] = []

        for t in trades:
            ret = t.pnl / equity if equity > 0 else 0.0
            returns.append(ret)
            equity += t.pnl
            if equity > peak:
                peak = equity
            dd = (peak - equity) / peak if peak > 0 else 0.0
            if dd > max_dd:
                max_dd = dd

        # Annualised Sharpe (365 trading days for crypto)
        sharpe = 0.0
        if len(returns) >= 2:
            mean_ret = sum(returns) / len(returns)
            var = sum((r - mean_ret) ** 2 for r in returns) / (len(returns) - 1)
            std_ret = math.sqrt(var)
            if std_ret > 0:
                sharpe = (mean_ret / std_ret) * math.sqrt(365)

        result["total_pnl"] = total_pnl
        result["total_return_pct"] = (total_pnl / initial_capital) * 100 if initial_capital > 0 else 0.0
        result["num_trades"] = num_trades
        result["win_rate"] = wins / num_trades if num_trades > 0 else 0.0
        result["avg_trade_pnl"] = total_pnl / num_trades if num_trades > 0 else 0.0
        result["max_drawdown"] = max_dd
        result["sharpe_ratio"] = sharpe

        return result
