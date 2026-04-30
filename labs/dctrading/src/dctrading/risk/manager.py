"""Risk management module for the DC trading system.

Enforces position sizing, stop-loss, drawdown circuit breaker, and exposure
limits before any trade is executed.
"""

from __future__ import annotations

import logging
from typing import Final

from dctrading.types import (
    DCEvent,
    Direction,
    Position,
    RiskLimits,
    TradingAction,
)

logger: Final = logging.getLogger(__name__)

__all__ = ["RiskManager"]


class RiskManager:
    """Gate-keeper between RL agent signals and order execution.

    Validates every proposed trade against risk limits and can reject,
    cap, or force-close positions to protect capital.
    """

    def __init__(
        self,
        limits: RiskLimits | None = None,
        initial_capital: float = 10_000.0,
    ) -> None:
        self._limits = limits if limits is not None else RiskLimits()
        self._initial_capital = initial_capital
        self._daily_pnl: float = 0.0

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def check_trade(
        self,
        action: TradingAction,
        position: Position,
        current_price: float,
        capital: float,
        dc_event: DCEvent,
    ) -> tuple[bool, str]:
        """Evaluate whether *action* is permitted under current risk limits.

        Args:
            action: The proposed trading action.
            position: Current open position (may be flat).
            current_price: Latest market price.
            capital: Available capital (cash + unrealised PnL).
            dc_event: The DC event that triggered this signal.

        Returns:
            A ``(allowed, reason)`` tuple.  *reason* is ``""`` when allowed.
        """
        # HOLD is always allowed — nothing to risk-check.
        if action is TradingAction.HOLD:
            return True, ""

        # 1. Circuit breaker — hard stop on all trading.
        if self.is_circuit_breaker_active():
            reason = (
                f"Circuit breaker active: daily PnL {self._daily_pnl:.2f} "
                f"exceeds max drawdown {self._limits.max_drawdown_pct:.1%} "
                f"of initial capital {self._initial_capital:.2f}"
            )
            logger.warning(reason)
            return False, reason

        # 5. Stop-loss check — force-close takes priority over new entries.
        if not position.is_flat and self.check_stop_loss(
            position, current_price, dc_event.threshold
        ):
            # If the action is already closing the position, allow it.
            is_closing = (
                (action is TradingAction.SELL and position.side is Direction.UP)
                or (action is TradingAction.BUY and position.side is Direction.DOWN)
            )
            if is_closing:
                logger.info("Stop-loss triggered — allowing close action.")
                return True, ""
            # Otherwise reject: must close first.
            reason = (
                f"Stop-loss triggered: unrealised loss on {position.symbol} "
                f"exceeds {self._limits.stop_loss_multiplier}x threshold "
                f"({dc_event.threshold:.4f}). Close position first."
            )
            logger.warning(reason)
            return False, reason

        # For closing trades, no further sizing/exposure checks needed.
        is_closing = (
            not position.is_flat
            and (
                (action is TradingAction.SELL and position.side is Direction.UP)
                or (action is TradingAction.BUY and position.side is Direction.DOWN)
            )
        )
        if is_closing:
            return True, ""

        # --- Checks below apply to new entries / position increases ---

        size = self.compute_position_size(capital, current_price, dc_event)
        notional = size * current_price

        # 2. Cash buffer — ensure minimum cash is retained.
        cash_after = capital - notional
        min_cash = capital * self._limits.cash_buffer_pct
        if cash_after < min_cash:
            reason = (
                f"Cash buffer violated: trade notional {notional:.2f} would "
                f"leave {cash_after:.2f} cash, below minimum {min_cash:.2f} "
                f"({self._limits.cash_buffer_pct:.0%} of {capital:.2f})"
            )
            logger.warning(reason)
            return False, reason

        # 4. Exposure limit — total exposure must stay within bounds.
        existing_exposure = 0.0 if position.is_flat else position.size * current_price
        total_exposure = existing_exposure + notional
        max_exposure = capital * self._limits.max_exposure_pct
        if total_exposure > max_exposure:
            reason = (
                f"Exposure limit exceeded: total exposure {total_exposure:.2f} "
                f"would exceed {self._limits.max_exposure_pct:.0%} of capital "
                f"({max_exposure:.2f})"
            )
            logger.warning(reason)
            return False, reason

        logger.debug(
            "Trade approved: action=%s size=%.6f notional=%.2f",
            action.name,
            size,
            notional,
        )
        return True, ""

    def compute_position_size(
        self,
        capital: float,
        current_price: float,
        dc_event: DCEvent,
    ) -> float:
        """Compute position size in base-currency units.

        Applies ``max_position_pct`` and ``cash_buffer_pct`` limits so the
        returned size never exceeds what the risk rules allow.

        Args:
            capital: Available capital.
            current_price: Latest market price.
            dc_event: The triggering DC event (used for threshold context).

        Returns:
            Position size in base-currency units (e.g. BTC).
        """
        if current_price <= 0:
            return 0.0

        # Cap by max_position_pct of capital.
        max_notional = capital * self._limits.max_position_pct
        # Also respect cash buffer.
        available_cash = capital * (1.0 - self._limits.cash_buffer_pct)
        notional = min(max_notional, available_cash)
        notional = max(notional, 0.0)

        return notional / current_price

    def check_stop_loss(
        self,
        position: Position,
        current_price: float,
        threshold: float,
    ) -> bool:
        """Return ``True`` if the stop-loss is triggered for *position*.

        Stop-loss fires when the adverse price move from entry exceeds
        ``stop_loss_multiplier * threshold``.

        Args:
            position: The open position to evaluate.
            current_price: Latest market price.
            threshold: The DC lambda threshold for this instrument.

        Returns:
            Whether the position should be force-closed.
        """
        if position.is_flat:
            return False

        stop_distance = self._limits.stop_loss_multiplier * threshold

        if position.side is Direction.UP:
            # Long — adverse move is price dropping below entry.
            adverse_pct = (position.entry_price - current_price) / position.entry_price
        else:
            # Short — adverse move is price rising above entry.
            adverse_pct = (current_price - position.entry_price) / position.entry_price

        triggered = adverse_pct >= stop_distance
        if triggered:
            logger.info(
                "Stop-loss triggered for %s %s position: adverse move %.4f >= %.4f",
                position.side.name if position.side else "FLAT",
                position.symbol,
                adverse_pct,
                stop_distance,
            )
        return triggered

    def update_daily_pnl(self, pnl: float) -> None:
        """Accumulate realised PnL for the current trading day.

        Args:
            pnl: The PnL from a completed trade (positive = profit).
        """
        self._daily_pnl += pnl
        logger.debug("Daily PnL updated: %+.2f (cumulative: %+.2f)", pnl, self._daily_pnl)

    def reset_daily_pnl(self) -> None:
        """Reset daily PnL accumulator — call at the start of each trading day."""
        logger.info("Daily PnL reset (was %+.2f)", self._daily_pnl)
        self._daily_pnl = 0.0

    def is_circuit_breaker_active(self) -> bool:
        """Return ``True`` if the daily drawdown limit has been breached."""
        max_loss = self._initial_capital * self._limits.max_drawdown_pct
        return self._daily_pnl <= -max_loss

    def get_status(self) -> dict:
        """Return a snapshot of the current risk state.

        Returns:
            Dictionary with ``daily_pnl``, ``circuit_breaker_active``, and
            ``limits`` (as a dict).
        """
        return {
            "daily_pnl": self._daily_pnl,
            "circuit_breaker_active": self.is_circuit_breaker_active(),
            "limits": {
                "max_position_pct": self._limits.max_position_pct,
                "max_drawdown_pct": self._limits.max_drawdown_pct,
                "max_exposure_pct": self._limits.max_exposure_pct,
                "stop_loss_multiplier": self._limits.stop_loss_multiplier,
                "cash_buffer_pct": self._limits.cash_buffer_pct,
            },
        }
