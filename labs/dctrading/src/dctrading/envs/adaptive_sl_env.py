"""Gymnasium environment where RL learns adaptive stop-loss levels.

ZI-DCT0 handles entry/exit decisions (deterministic).
The RL agent's ONLY job: pick the stop-loss % when entering each trade.
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

__all__ = ["AdaptiveSLEnv"]

# Stop-loss levels the agent can choose from
SL_LEVELS = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.0]  # 0.0 = no stop-loss
_N_ACTIONS = len(SL_LEVELS)

# Observation: 25 features (same as EnvV2) + 1 for current SL level = 26
_OBS_DIM = 26

_MOMENTUM_SHORT = 3
_MOMENTUM_MEDIUM = 10
_ROLLING_OS = 5
_RECENT_TRADES = 10


class AdaptiveSLEnv(gym.Env[NDArray[np.float32], int]):
    """RL environment for learning per-trade stop-loss levels.

    Entry/exit logic is handled by ZI-DCT0 (buy on UP DC, sell on DOWN DC).
    The agent chooses a stop-loss percentage at each DC event.
    When flat + UP DC: agent picks SL level, position opens.
    When long + DOWN DC: position closes (DC exit).
    When long + price drops >= SL: position closes (stop-loss exit).
    When long + UP DC: agent can adjust SL level.

    Action space: Discrete(9) — maps to SL_LEVELS.
    """

    metadata: dict[str, Any] = {"render_modes": []}

    def __init__(
        self,
        dc_events: list[DCEvent],
        dc_indicators: list[DCIndicators],
        ticks: list[Any] | None = None,
        initial_capital: float = 10000.0,
        trading_fee_pct: float = 0.001,
    ) -> None:
        super().__init__()

        if len(dc_events) != len(dc_indicators):
            raise ValueError(f"dc_events ({len(dc_events)}) != dc_indicators ({len(dc_indicators)})")
        if not dc_events:
            raise ValueError("dc_events must not be empty")

        self._dc_events = dc_events
        self._dc_indicators = dc_indicators
        self._initial_capital = initial_capital
        self._trading_fee_pct = trading_fee_pct

        # Build tick-level price data between DC events for realistic SL checking
        self._inter_event_prices: list[list[float]] = []
        if ticks:
            # Map: for each DC event i, store all tick prices between event i-1 and event i
            tick_idx = 0
            for i, ev in enumerate(dc_events):
                prices = []
                prev_time = dc_events[i - 1].confirm_time if i > 0 else 0.0
                while tick_idx < len(ticks) and ticks[tick_idx].timestamp <= ev.confirm_time:
                    if ticks[tick_idx].timestamp > prev_time:
                        prices.append(ticks[tick_idx].price)
                    tick_idx += 1
                self._inter_event_prices.append(prices)
        self._has_ticks = len(self._inter_event_prices) > 0

        self.action_space = spaces.Discrete(_N_ACTIONS)
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf, shape=(_OBS_DIM,), dtype=np.float32
        )

        # State
        self._step_idx: int = 0
        self._capital: float = initial_capital
        self._peak_capital: float = initial_capital
        self._position_side: Direction | None = None
        self._entry_price: float = 0.0
        self._entry_time: float = 0.0
        self._current_sl: float = 0.0  # active stop-loss pct
        self._trade_history: list[TradeRecord] = []

        # Rolling windows
        self._recent_magnitudes: deque[float] = deque(maxlen=_MOMENTUM_MEDIUM)
        self._recent_directions: deque[float] = deque(maxlen=_MOMENTUM_MEDIUM)
        self._recent_os_ratios: deque[float] = deque(maxlen=_ROLLING_OS)
        self._recent_trade_wins: deque[bool] = deque(maxlen=_RECENT_TRADES)

        # Episode tracking
        self._start_price: float = 0.0
        self._max_time_gap: float = 1.0
        self._prev_event_time: float = 0.0
        self._consecutive_same_dir: int = 0
        self._last_direction: Direction | None = None

    def reset(
        self, *, seed: int | None = None, options: dict[str, Any] | None = None,
    ) -> tuple[NDArray[np.float32], dict[str, Any]]:
        super().reset(seed=seed, options=options)

        self._step_idx = 0
        self._capital = self._initial_capital
        self._peak_capital = self._initial_capital
        self._position_side = None
        self._entry_price = 0.0
        self._entry_time = 0.0
        self._current_sl = 0.0
        self._trade_history = []

        self._recent_magnitudes.clear()
        self._recent_directions.clear()
        self._recent_os_ratios.clear()
        self._recent_trade_wins.clear()

        first = self._dc_events[0]
        self._start_price = first.confirm_price
        self._prev_event_time = first.confirm_time
        self._max_time_gap = 1.0
        self._consecutive_same_dir = 1
        self._last_direction = first.direction

        self._recent_magnitudes.append(first.magnitude)
        self._recent_directions.append(1.0 if first.direction is Direction.UP else 0.0)
        self._recent_os_ratios.append(self._dc_indicators[0].os_ratio)

        return self._get_obs(), self._get_info()

    def step(
        self, action: int,
    ) -> tuple[NDArray[np.float32], float, bool, bool, dict[str, Any]]:
        """Agent picks a stop-loss level. ZI-DCT0 handles entry/exit."""
        event = self._dc_events[self._step_idx]
        price = event.confirm_price
        reward = 0.0
        chosen_sl = SL_LEVELS[action]

        # Check stop-loss using tick-level prices between DC events
        if self._position_side is Direction.UP and self._current_sl > 0:
            sl_triggered = False
            if self._has_ticks and self._step_idx < len(self._inter_event_prices):
                # Check every tick price between previous and current DC event
                for tick_price in self._inter_event_prices[self._step_idx]:
                    loss_pct = (self._entry_price - tick_price) / self._entry_price
                    if loss_pct >= self._current_sl:
                        sl_exit_price = self._entry_price * (1 - self._current_sl)
                        reward = self._close_position(sl_exit_price, event, is_sl_exit=True)
                        sl_triggered = True
                        break
            else:
                # Fallback: use DC event prices as proxy
                worst_price = event.confirm_price if event.direction is Direction.DOWN else event.extreme_price
                loss_pct = (self._entry_price - worst_price) / self._entry_price
                if loss_pct >= self._current_sl:
                    sl_exit_price = self._entry_price * (1 - self._current_sl)
                    reward = self._close_position(sl_exit_price, event, is_sl_exit=True)

        # ZI-DCT0 logic: UP → buy, DOWN → sell
        if event.direction is Direction.UP:
            if self._position_side is None:
                fee = price * self._trading_fee_pct
                self._position_side = Direction.UP
                self._entry_price = price + fee
                self._entry_time = event.confirm_time
                self._capital -= fee
                self._current_sl = chosen_sl
            else:
                # Already long — agent can adjust SL
                self._current_sl = chosen_sl
                # Shaping reward: encourage tightening SL when losing, loosening when winning
                if self._entry_price > 0:
                    unrealized = (price - self._entry_price) / self._entry_price
                    if unrealized < 0 and chosen_sl > 0 and chosen_sl < 0.03:
                        reward += 0.001  # good: tight SL while losing
                    elif unrealized > 0.02 and (chosen_sl == 0 or chosen_sl > 0.03):
                        reward += 0.001  # good: loose SL while winning big

        elif event.direction is Direction.DOWN:
            if self._position_side is Direction.UP:
                reward = self._close_position(price, event, is_sl_exit=False)

        self._peak_capital = max(self._peak_capital, self._capital)

        # Advance
        self._step_idx += 1
        terminated = self._step_idx >= len(self._dc_events)

        if terminated and self._position_side is not None:
            reward += self._close_position(price, event, is_sl_exit=False)

        if not terminated:
            self._update_rolling_state()

        obs = self._get_obs() if not terminated else np.zeros(_OBS_DIM, dtype=np.float32)
        return obs, reward, terminated, False, self._get_info()

    def _close_position(self, price: float, event: DCEvent, is_sl_exit: bool = False) -> float:
        if self._position_side is None:
            return 0.0

        fee = price * self._trading_fee_pct
        pnl = price - self._entry_price - fee
        self._capital += pnl

        self._trade_history.append(TradeRecord(
            symbol=event.symbol, side=Direction.UP,
            entry_price=self._entry_price, exit_price=price,
            entry_time=self._entry_time, exit_time=event.confirm_time,
            size=1.0, pnl=pnl, fees=fee * 2,
            dc_threshold=event.threshold,
        ))
        self._recent_trade_wins.append(pnl > 0)

        # --- Improved reward for SL selection ---
        norm_pnl = pnl / self._entry_price if self._entry_price > 0 else 0.0

        if is_sl_exit:
            # SL fired — reward PnL + discipline bonus for cutting losses
            reward = norm_pnl + 0.005
        else:
            # DC exit — amplify signal so agent learns consequences of SL choice
            if pnl > 0:
                reward = norm_pnl * 1.5  # winner: good SL (didn't get stopped)
            else:
                reward = norm_pnl * 2.0  # loser: should have had tighter SL

        self._position_side = None
        self._entry_price = 0.0
        self._entry_time = 0.0
        self._current_sl = 0.0
        return reward

    def _update_rolling_state(self) -> None:
        idx = self._step_idx
        if idx >= len(self._dc_events):
            return
        event = self._dc_events[idx]
        indicators = self._dc_indicators[idx]

        self._recent_magnitudes.append(event.magnitude)
        self._recent_directions.append(1.0 if event.direction is Direction.UP else 0.0)
        self._recent_os_ratios.append(indicators.os_ratio)

        time_gap = abs(event.confirm_time - self._prev_event_time)
        self._max_time_gap = max(self._max_time_gap, time_gap)
        self._prev_event_time = event.confirm_time

        if event.direction == self._last_direction:
            self._consecutive_same_dir += 1
        else:
            self._consecutive_same_dir = 1
            self._last_direction = event.direction

    def _get_obs(self) -> NDArray[np.float32]:
        idx = min(self._step_idx, len(self._dc_events) - 1)
        event = self._dc_events[idx]
        indicators = self._dc_indicators[idx]

        mags = list(self._recent_magnitudes)
        dirs = list(self._recent_directions)
        os_ratios = list(self._recent_os_ratios)

        mom_3 = float(np.mean(mags[-_MOMENTUM_SHORT:])) if mags else 0.0
        mom_10 = float(np.mean(mags)) if mags else 0.0
        vol_3 = float(np.std(mags[-_MOMENTUM_SHORT:])) if len(mags) >= 2 else 0.0
        vol_10 = float(np.std(mags)) if len(mags) >= 2 else 0.0
        up_ratio = float(np.mean(dirs)) if dirs else 0.5
        avg_os = float(np.mean(os_ratios)) if os_ratios else 0.0
        avg_mag = float(np.mean(mags)) if mags else event.magnitude
        mag_vs_avg = event.magnitude / avg_mag if avg_mag > 0 else 1.0

        time_gap = abs(event.confirm_time - self._prev_event_time)
        norm_gap = time_gap / self._max_time_gap if self._max_time_gap > 0 else 0.0

        norm_price = event.confirm_price / self._start_price if self._start_price > 0 else 1.0

        unrealized = 0.0
        hold_dur = 0.0
        if self._position_side is Direction.UP and self._entry_price > 0:
            unrealized = (event.confirm_price - self._entry_price) / self._entry_price
            hold_dur = (event.confirm_time - self._entry_time) / self._max_time_gap if self._max_time_gap > 0 else 0.0

        recent_wins = list(self._recent_trade_wins)
        win_rate = sum(recent_wins) / len(recent_wins) if recent_wins else 0.5
        cap_ratio = self._capital / self._initial_capital
        drawdown = (self._peak_capital - self._capital) / self._peak_capital if self._peak_capital > 0 else 0.0

        obs = np.array([
            # DC event (3)
            1.0 if event.direction is Direction.UP else 0.0,
            event.magnitude,
            event.threshold,
            # DC indicators (5)
            indicators.r_ratio, indicators.tmv, indicators.os_length,
            indicators.dc_length, indicators.os_ratio,
            # Price context (5)
            norm_price, mom_3, mom_10, vol_3, vol_10,
            # DC patterns (5)
            float(self._consecutive_same_dir), up_ratio, avg_os,
            norm_gap, mag_vs_avg,
            # Position (4)
            1.0 if self._position_side is Direction.UP else 0.0,
            0.0,  # no short
            unrealized, hold_dur,
            # Performance (3)
            win_rate, cap_ratio, drawdown,
            # Current SL level (1)
            self._current_sl,
        ], dtype=np.float32)
        return obs

    def _get_info(self) -> dict[str, Any]:
        return {
            "capital": self._capital,
            "position": "long" if self._position_side is Direction.UP else "flat",
            "trade_count": len(self._trade_history),
            "total_pnl": self._capital - self._initial_capital,
            "current_sl": self._current_sl,
        }
