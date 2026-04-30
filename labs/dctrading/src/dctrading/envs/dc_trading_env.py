"""Gymnasium environment for DC-based (intrinsic time) trading."""

from __future__ import annotations

from typing import Any

import gymnasium as gym
import numpy as np
from gymnasium import spaces
from numpy.typing import NDArray

from dctrading.types import (
    DCEvent,
    DCIndicators,
    Direction,
    TradeRecord,
    TradingAction,
)

# Observation dimension: 11 floats
# DC event features (3): direction, magnitude, threshold
# DC indicators (5): r_ratio, tmv, os_length, dc_length, os_ratio
# Position features (3): is_long, is_short, unrealized_pnl_pct
_OBS_DIM = 11


class DCTradingEnv(gym.Env[NDArray[np.float32], int]):
    """Gymnasium environment that steps through pre-computed DC events.

    Unlike traditional trading envs that tick on fixed time intervals,
    this environment advances in *intrinsic time* — one step per
    Directional Change event. This filters out noise and focuses the
    agent on structurally meaningful price movements.

    Compatible with Stable-Baselines3 (PPO, DQN, etc.).

    Args:
        dc_events: Pre-computed DC events from historical data.
        dc_indicators: Corresponding indicators for each DC event.
        initial_capital: Starting capital in quote currency.
        trading_fee_pct: Fee as a fraction of trade value (e.g. 0.001 = 0.1%).
    """

    metadata: dict[str, Any] = {"render_modes": []}

    def __init__(
        self,
        dc_events: list[DCEvent],
        dc_indicators: list[DCIndicators],
        initial_capital: float = 10000.0,
        trading_fee_pct: float = 0.001,
    ) -> None:
        super().__init__()

        if len(dc_events) != len(dc_indicators):
            msg = (
                f"dc_events length ({len(dc_events)}) must match "
                f"dc_indicators length ({len(dc_indicators)})"
            )
            raise ValueError(msg)
        if len(dc_events) == 0:
            raise ValueError("dc_events must not be empty")

        self._dc_events = dc_events
        self._dc_indicators = dc_indicators
        self._initial_capital = initial_capital
        self._trading_fee_pct = trading_fee_pct

        # Spaces
        self.action_space = spaces.Discrete(3)
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf, shape=(_OBS_DIM,), dtype=np.float32
        )

        # State — initialised in reset()
        self._step_idx: int = 0
        self._capital: float = initial_capital
        self._position_side: Direction | None = None  # None = flat
        self._entry_price: float = 0.0
        self._entry_time: float = 0.0
        self._trade_history: list[TradeRecord] = []

    # ------------------------------------------------------------------
    # Gym API
    # ------------------------------------------------------------------

    def reset(
        self,
        *,
        seed: int | None = None,
        options: dict[str, Any] | None = None,
    ) -> tuple[NDArray[np.float32], dict[str, Any]]:
        """Reset the environment to the beginning of the episode.

        Returns:
            Tuple of (initial observation, info dict).
        """
        super().reset(seed=seed, options=options)

        self._step_idx = 0
        self._capital = self._initial_capital
        self._position_side = None
        self._entry_price = 0.0
        self._entry_time = 0.0
        self._trade_history = []

        return self._get_obs(), self._get_info()

    def step(
        self, action: int
    ) -> tuple[NDArray[np.float32], float, bool, bool, dict[str, Any]]:
        """Execute one trading action at the current DC event.

        Args:
            action: 0=HOLD, 1=BUY, 2=SELL.

        Returns:
            Tuple of (obs, reward, terminated, truncated, info).
        """
        trading_action = TradingAction(action)
        event = self._dc_events[self._step_idx]
        price = event.confirm_price
        reward = 0.0

        # --- Execute action ---
        if trading_action is TradingAction.BUY:
            reward = self._handle_buy(price, event)
        elif trading_action is TradingAction.SELL:
            reward = self._handle_sell(price, event)
        else:
            # HOLD — small carry cost if we have an open position
            reward = self._hold_cost(price)

        # Advance to next event
        self._step_idx += 1
        terminated = self._step_idx >= len(self._dc_events)

        # Force-close position at episode end
        if terminated and self._position_side is not None:
            reward += self._close_position(price, event)

        obs = self._get_obs() if not terminated else self._terminal_obs()
        return obs, reward, terminated, False, self._get_info()

    # ------------------------------------------------------------------
    # Trade execution helpers
    # ------------------------------------------------------------------

    def _handle_buy(self, price: float, event: DCEvent) -> float:
        """Handle a BUY action. Opens long if flat, no-op if already long."""
        if self._position_side is not None:
            return 0.0  # already in position

        fee = price * self._trading_fee_pct
        self._position_side = Direction.UP
        self._entry_price = price + fee
        self._entry_time = event.confirm_time
        self._capital -= fee
        return 0.0

    def _handle_sell(self, price: float, event: DCEvent) -> float:
        """Handle a SELL action. Closes long if in position, no-op if flat."""
        if self._position_side is not Direction.UP:
            return 0.0  # nothing to close

        return self._close_position(price, event)

    def _close_position(self, price: float, event: DCEvent) -> float:
        """Close the current position and return normalized PnL reward."""
        if self._position_side is None:
            return 0.0

        fee = price * self._trading_fee_pct

        if self._position_side is Direction.UP:
            pnl = price - self._entry_price - fee
        else:
            pnl = self._entry_price - price - fee

        self._capital += pnl

        self._trade_history.append(
            TradeRecord(
                symbol=event.symbol,
                side=self._position_side,
                entry_price=self._entry_price,
                exit_price=price,
                entry_time=self._entry_time,
                exit_time=event.confirm_time,
                size=1.0,
                pnl=pnl,
                fees=fee * 2,
                dc_threshold=event.threshold,
            )
        )

        # Normalize reward by entry price so the agent learns percentages, not dollars
        reward = pnl / self._entry_price if self._entry_price > 0 else 0.0

        self._position_side = None
        self._entry_price = 0.0
        self._entry_time = 0.0
        return reward

    def _hold_cost(self, price: float) -> float:
        """Reward/penalty for HOLD action.

        Flat + HOLD = zero (no penalty for sitting out).
        Open position + HOLD = small carry cost scaled by unrealized loss.
        """
        if self._position_side is None:
            return 0.0
        # Carry cost proportional to how underwater the position is
        if self._position_side is Direction.UP:
            unrealized = (price - self._entry_price) / self._entry_price
        else:
            unrealized = (self._entry_price - price) / self._entry_price
        # Losing positions get penalized more; winning positions get tiny penalty
        if unrealized < 0:
            return unrealized * 0.01  # amplify pain of holding losers
        return -0.0001  # tiny cost for holding winners (opportunity cost)

    # ------------------------------------------------------------------
    # Observation helpers
    # ------------------------------------------------------------------

    def _get_obs(self) -> NDArray[np.float32]:
        """Build the 11-dimensional observation vector.

        Returns:
            Numpy array of shape (11,) with dtype float32.
        """
        idx = min(self._step_idx, len(self._dc_events) - 1)
        event = self._dc_events[idx]
        indicators = self._dc_indicators[idx]

        # Unrealised PnL as percentage of entry price
        unrealized_pnl_pct = 0.0
        if self._position_side is not None and self._entry_price > 0:
            current_price = event.confirm_price
            if self._position_side is Direction.UP:
                unrealized_pnl_pct = (
                    (current_price - self._entry_price) / self._entry_price
                )
            else:
                unrealized_pnl_pct = (
                    (self._entry_price - current_price) / self._entry_price
                )

        obs = np.array(
            [
                # DC event features
                1.0 if event.direction is Direction.UP else 0.0,
                event.magnitude,
                event.threshold,
                # DC indicators
                indicators.r_ratio,
                indicators.tmv,
                indicators.os_length,
                indicators.dc_length,
                indicators.os_ratio,
                # Position features
                1.0 if self._position_side is Direction.UP else 0.0,
                1.0 if self._position_side is Direction.DOWN else 0.0,
                unrealized_pnl_pct,
            ],
            dtype=np.float32,
        )
        return obs

    def _terminal_obs(self) -> NDArray[np.float32]:
        """Return a zeroed observation for the terminal state."""
        return np.zeros(_OBS_DIM, dtype=np.float32)

    def _get_info(self) -> dict[str, Any]:
        """Build the info dict returned by reset() and step().

        Returns:
            Dict with capital, position, trade_count, total_pnl.
        """
        total_pnl = self._capital - self._initial_capital
        position: str
        if self._position_side is Direction.UP:
            position = "long"
        elif self._position_side is Direction.DOWN:
            position = "short"
        else:
            position = "flat"

        return {
            "capital": self._capital,
            "position": position,
            "trade_count": len(self._trade_history),
            "total_pnl": total_pnl,
        }
