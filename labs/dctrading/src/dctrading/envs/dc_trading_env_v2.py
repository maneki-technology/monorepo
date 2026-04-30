"""Enhanced gymnasium environment for DC-based trading with rich observations.

V2 extends the observation space from 11 to 25 features, adding price momentum,
volatility, DC pattern features, and performance tracking to help the agent
learn WHEN to trade vs sit out.
"""

from __future__ import annotations

from collections import deque
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

# 25-dimensional observation vector
# Group 1 — Current DC event (3): direction, magnitude, threshold
# Group 2 — DC indicators (5): r_ratio, tmv, os_length, dc_length, os_ratio
# Group 3 — Price context (5): normalized_price, momentum_3, momentum_10,
#            volatility_3, volatility_10
# Group 4 — DC pattern features (5): consecutive_same_dir, up_ratio_10,
#            avg_os_ratio_5, time_since_last_event, magnitude_vs_avg
# Group 5 — Position features (4): is_long, is_short, unrealized_pnl_pct,
#            hold_duration
# Group 6 — Performance features (3): win_rate_recent, capital_ratio, drawdown
_OBS_DIM = 25

_MOMENTUM_SHORT = 3
_MOMENTUM_MEDIUM = 10
_ROLLING_OS = 5
_RECENT_TRADES = 10


class DCTradingEnvV2(gym.Env[NDArray[np.float32], int]):
    """Gymnasium environment that steps through pre-computed DC events.

    Unlike traditional trading envs that tick on fixed time intervals,
    this environment advances in *intrinsic time* — one step per
    Directional Change event. This filters out noise and focuses the
    agent on structurally meaningful price movements.

    V2 provides a 25-dimensional observation with price momentum,
    volatility regimes, DC pattern features, and performance context.

    Compatible with Stable-Baselines3 (PPO, DQN) and SB3-Contrib
    (RecurrentPPO with LSTM).

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
        stop_loss_pct: float = 0.0,
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
        self._stop_loss_pct = stop_loss_pct

        # Spaces
        self.action_space = spaces.Discrete(3)
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf, shape=(_OBS_DIM,), dtype=np.float32
        )

        # State — initialised in reset()
        self._step_idx: int = 0
        self._capital: float = initial_capital
        self._peak_capital: float = initial_capital
        self._position_side: Direction | None = None
        self._entry_price: float = 0.0
        self._entry_time: float = 0.0
        self._trade_history: list[TradeRecord] = []

        # Rolling windows for momentum / volatility / pattern features
        self._recent_magnitudes: deque[float] = deque(maxlen=_MOMENTUM_MEDIUM)
        self._recent_directions: deque[float] = deque(maxlen=_MOMENTUM_MEDIUM)
        self._recent_os_ratios: deque[float] = deque(maxlen=_ROLLING_OS)
        self._recent_trade_wins: deque[bool] = deque(maxlen=_RECENT_TRADES)

        # Episode-level tracking
        self._start_price: float = 0.0
        self._max_time_gap: float = 1.0  # avoid div-by-zero; updated during episode
        self._prev_event_time: float = 0.0
        self._consecutive_same_dir: int = 0
        self._last_direction: Direction | None = None

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
        self._peak_capital = self._initial_capital
        self._position_side = None
        self._entry_price = 0.0
        self._entry_time = 0.0
        self._trade_history = []

        self._recent_magnitudes.clear()
        self._recent_directions.clear()
        self._recent_os_ratios.clear()
        self._recent_trade_wins.clear()

        first_event = self._dc_events[0]
        self._start_price = first_event.confirm_price
        self._prev_event_time = first_event.confirm_time
        self._max_time_gap = 1.0
        self._consecutive_same_dir = 1
        self._last_direction = first_event.direction

        # Seed rolling windows with first event
        self._recent_magnitudes.append(first_event.magnitude)
        self._recent_directions.append(
            1.0 if first_event.direction is Direction.UP else 0.0
        )
        self._recent_os_ratios.append(self._dc_indicators[0].os_ratio)

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

        # --- Check stop-loss before action ---
        if (self._stop_loss_pct > 0 and self._position_side is Direction.UP
                and self._entry_price > 0):
            loss_pct = (self._entry_price - price) / self._entry_price
            if loss_pct >= self._stop_loss_pct:
                reward = self._close_position(price, event)
                # After stop-loss, skip the agent's action this step
                trading_action = TradingAction.HOLD
        # --- Execute action ---
        if trading_action is TradingAction.BUY:
            reward = self._handle_buy(price, event)
        elif trading_action is TradingAction.SELL:
            reward = self._handle_sell(price, event)
        else:
            reward = self._hold_cost(price)

        # Track peak capital for drawdown
        self._peak_capital = max(self._peak_capital, self._capital)

        # Advance to next event
        self._step_idx += 1
        terminated = self._step_idx >= len(self._dc_events)

        # Force-close position at episode end
        if terminated and self._position_side is not None:
            reward += self._close_position(price, event)

        # Update rolling windows for the NEW step (if not terminated)
        if not terminated:
            self._update_rolling_state()

        obs = self._get_obs() if not terminated else self._terminal_obs()
        return obs, reward, terminated, False, self._get_info()

    # ------------------------------------------------------------------
    # Trade execution helpers
    # ------------------------------------------------------------------

    def _handle_buy(self, price: float, event: DCEvent) -> float:
        """Handle a BUY action. Opens long if flat, no-op if already long."""
        if self._position_side is not None:
            return 0.0

        fee = price * self._trading_fee_pct
        self._position_side = Direction.UP
        self._entry_price = price + fee
        self._entry_time = event.confirm_time
        self._capital -= fee
        return 0.0

    def _handle_sell(self, price: float, event: DCEvent) -> float:
        """Handle a SELL action. Closes long if in position, no-op if flat."""
        if self._position_side is not Direction.UP:
            return 0.0

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

        trade = TradeRecord(
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
        self._trade_history.append(trade)
        self._recent_trade_wins.append(pnl > 0)

        # Normalize reward by entry price so the agent learns percentages
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
        if self._position_side is Direction.UP:
            unrealized = (price - self._entry_price) / self._entry_price
        else:
            unrealized = (self._entry_price - price) / self._entry_price
        if unrealized < 0:
            return unrealized * 0.01
        return -0.0001

    # ------------------------------------------------------------------
    # Rolling state updates
    # ------------------------------------------------------------------

    def _update_rolling_state(self) -> None:
        """Update rolling windows and pattern trackers for the current step."""
        event = self._dc_events[self._step_idx]
        indicators = self._dc_indicators[self._step_idx]

        # Rolling magnitudes and directions
        self._recent_magnitudes.append(event.magnitude)
        self._recent_directions.append(
            1.0 if event.direction is Direction.UP else 0.0
        )
        self._recent_os_ratios.append(indicators.os_ratio)

        # Time gap tracking
        time_gap = event.confirm_time - self._prev_event_time
        if time_gap > self._max_time_gap:
            self._max_time_gap = time_gap
        self._prev_event_time = event.confirm_time

        # Consecutive same direction
        if event.direction == self._last_direction:
            self._consecutive_same_dir += 1
        else:
            self._consecutive_same_dir = 1
            self._last_direction = event.direction

    # ------------------------------------------------------------------
    # Observation helpers
    # ------------------------------------------------------------------

    def _get_obs(self) -> NDArray[np.float32]:
        """Build the 25-dimensional observation vector.

        Returns:
            Numpy array of shape (25,) with dtype float32.
        """
        idx = min(self._step_idx, len(self._dc_events) - 1)
        event = self._dc_events[idx]
        indicators = self._dc_indicators[idx]
        price = event.confirm_price

        # --- Group 1: Current DC event (3) ---
        direction = 1.0 if event.direction is Direction.UP else 0.0
        magnitude = event.magnitude
        threshold = event.threshold

        # --- Group 2: DC indicators (5) ---
        r_ratio = indicators.r_ratio
        tmv = indicators.tmv
        os_length = indicators.os_length
        dc_length = indicators.dc_length
        os_ratio = indicators.os_ratio

        # --- Group 3: Price context (5) ---
        normalized_price = price / self._start_price if self._start_price > 0 else 1.0

        mags = list(self._recent_magnitudes)
        price_momentum_3 = float(np.mean(mags[-_MOMENTUM_SHORT:])) if mags else 0.0
        price_momentum_10 = float(np.mean(mags)) if mags else 0.0
        volatility_3 = (
            float(np.std(mags[-_MOMENTUM_SHORT:])) if len(mags) >= 2 else 0.0
        )
        volatility_10 = float(np.std(mags)) if len(mags) >= 2 else 0.0

        # --- Group 4: DC pattern features (5) ---
        consecutive_same_dir = float(self._consecutive_same_dir)

        dirs = list(self._recent_directions)
        up_ratio_10 = float(np.mean(dirs)) if dirs else 0.5

        os_ratios = list(self._recent_os_ratios)
        avg_os_ratio_5 = float(np.mean(os_ratios)) if os_ratios else 0.0

        time_gap = event.confirm_time - self._prev_event_time
        time_since_last_event = (
            time_gap / self._max_time_gap if self._max_time_gap > 0 else 0.0
        )
        # Clamp to [0, 1] — at step 0 the gap is 0
        time_since_last_event = max(0.0, min(1.0, time_since_last_event))

        rolling_avg_mag = float(np.mean(mags)) if mags else magnitude
        magnitude_vs_avg = (
            magnitude / rolling_avg_mag if rolling_avg_mag > 0 else 1.0
        )

        # --- Group 5: Position features (4) ---
        is_long = 1.0 if self._position_side is Direction.UP else 0.0
        is_short = 1.0 if self._position_side is Direction.DOWN else 0.0

        unrealized_pnl_pct = 0.0
        if self._position_side is not None and self._entry_price > 0:
            if self._position_side is Direction.UP:
                unrealized_pnl_pct = (price - self._entry_price) / self._entry_price
            else:
                unrealized_pnl_pct = (self._entry_price - price) / self._entry_price

        hold_duration = 0.0
        if self._position_side is not None and self._entry_time > 0:
            raw_duration = event.confirm_time - self._entry_time
            hold_duration = (
                raw_duration / self._max_time_gap if self._max_time_gap > 0 else 0.0
            )

        # --- Group 6: Performance features (3) ---
        wins = list(self._recent_trade_wins)
        win_rate_recent = float(np.mean(wins)) if wins else 0.5

        capital_ratio = self._capital / self._initial_capital

        drawdown = 0.0
        if self._peak_capital > 0:
            drawdown = (self._peak_capital - self._capital) / self._peak_capital

        obs = np.array(
            [
                # Group 1 — Current DC event
                direction,
                magnitude,
                threshold,
                # Group 2 — DC indicators
                r_ratio,
                tmv,
                os_length,
                dc_length,
                os_ratio,
                # Group 3 — Price context
                normalized_price,
                price_momentum_3,
                price_momentum_10,
                volatility_3,
                volatility_10,
                # Group 4 — DC pattern features
                consecutive_same_dir,
                up_ratio_10,
                avg_os_ratio_5,
                time_since_last_event,
                magnitude_vs_avg,
                # Group 5 — Position features
                is_long,
                is_short,
                unrealized_pnl_pct,
                hold_duration,
                # Group 6 — Performance features
                win_rate_recent,
                capital_ratio,
                drawdown,
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
            Dict with capital, position, trade_count, total_pnl,
            peak_capital, and drawdown.
        """
        total_pnl = self._capital - self._initial_capital
        position: str
        if self._position_side is Direction.UP:
            position = "long"
        elif self._position_side is Direction.DOWN:
            position = "short"
        else:
            position = "flat"

        drawdown = 0.0
        if self._peak_capital > 0:
            drawdown = (self._peak_capital - self._capital) / self._peak_capital

        return {
            "capital": self._capital,
            "position": position,
            "trade_count": len(self._trade_history),
            "total_pnl": total_pnl,
            "peak_capital": self._peak_capital,
            "drawdown": drawdown,
        }
