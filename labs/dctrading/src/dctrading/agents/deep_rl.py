"""Deep RL agent wrappers around Stable-Baselines3 (PPO, DQN)."""

from __future__ import annotations

import time
from typing import Any

import numpy as np
from stable_baselines3 import DQN, PPO

from dctrading.envs.dc_trading_env import DCTradingEnv
from dctrading.envs.dc_trading_env_v2 import DCTradingEnvV2
from dctrading.types import DCEvent, DCIndicators, Direction, TradeRecord
from dctrading.types import DCEvent, DCIndicators, Direction, TradeRecord

__all__ = ["DeepRLAgent"]

_ALGORITHMS: dict[str, type[PPO] | type[DQN]] = {
    "PPO": PPO,
    "DQN": DQN,
}


class DeepRLAgent:
    """Wrapper around SB3's PPO and DQN for DC-based trading.

    Provides a unified interface for training, evaluation, saving/loading,
    and single-step prediction on a ``DCTradingEnv``.

    Args:
        algorithm: ``"PPO"`` or ``"DQN"``.
        policy: SB3 policy string (default ``"MlpPolicy"``).
        device: ``"auto"``, ``"cpu"``, or ``"mps"`` (Apple Silicon GPU).
        **kwargs: Forwarded to the SB3 algorithm constructor
            (e.g. ``learning_rate``, ``batch_size``).
    """

    def __init__(
        self,
        algorithm: str = "PPO",
        policy: str = "MlpPolicy",
        device: str = "auto",
        **kwargs: Any,
    ) -> None:
        if algorithm not in _ALGORITHMS:
            msg = f"Unsupported algorithm {algorithm!r}. Choose from {list(_ALGORITHMS)}"
            raise ValueError(msg)

        self._algorithm_name = algorithm
        self._algorithm_cls = _ALGORITHMS[algorithm]
        self._policy = policy
        self._device = device
        self._kwargs = kwargs
        self._model: PPO | DQN | None = None

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train(
        self,
        dc_events: list[DCEvent],
        dc_indicators: list[DCIndicators],
        total_timesteps: int = 50_000,
        initial_capital: float = 10_000.0,
        fee_pct: float = 0.001,
        env_version: str = "v1",
    ) -> dict[str, Any]:
        """Train the agent on a sequence of DC events.

        Creates a ``DCTradingEnv``, instantiates the SB3 model, and runs
        training for *total_timesteps* environment steps.

        Args:
            dc_events: Pre-computed DC events.
            dc_indicators: Corresponding indicators for each event.
            total_timesteps: Number of environment steps to train for.
            initial_capital: Starting capital in quote currency.
            fee_pct: Trading fee as a fraction (e.g. 0.001 = 0.1%).

        Returns:
            Dict with ``total_timesteps``, ``training_time_s``, and
            ``final_reward``.
        """
        env_cls = DCTradingEnvV2 if env_version == "v2" else DCTradingEnv
        env = env_cls(
            dc_events=dc_events,
            dc_indicators=dc_indicators,
            initial_capital=initial_capital,
            trading_fee_pct=fee_pct,
        )

        self._model = self._algorithm_cls(
            policy=self._policy,
            env=env,
            device=self._device,
            **self._kwargs,
        )

        t0 = time.monotonic()
        self._model.learn(total_timesteps=total_timesteps)
        training_time = time.monotonic() - t0

        # Run one final episode to get the terminal reward
        obs, _ = env.reset()
        total_reward = 0.0
        done = False
        while not done:
            action, _ = self._model.predict(obs, deterministic=True)
            obs, reward, terminated, truncated, _ = env.step(int(action))
            total_reward += float(reward)
            done = terminated or truncated

        return {
            "total_timesteps": total_timesteps,
            "training_time_s": round(training_time, 3),
            "final_reward": round(total_reward, 6),
        }

    # ------------------------------------------------------------------
    # Evaluation
    # ------------------------------------------------------------------

    def evaluate(
        self,
        dc_events: list[DCEvent],
        dc_indicators: list[DCIndicators],
        initial_capital: float = 10_000.0,
        fee_pct: float = 0.001,
        env_version: str = "v1",
    ) -> dict[str, Any]:
        """Evaluate the trained agent on a (possibly unseen) dataset.

        Runs the model greedily (deterministic) through a fresh env and
        computes performance metrics from the resulting trade history.

        Args:
            dc_events: DC events for the evaluation period.
            dc_indicators: Corresponding indicators.
            initial_capital: Starting capital.
            fee_pct: Trading fee fraction.

        Returns:
            Dict with ``total_pnl``, ``num_trades``, ``total_return_pct``,
            ``win_rate``, ``sharpe_ratio``, ``max_drawdown``, and ``trades``.

        Raises:
            RuntimeError: If the model has not been trained or loaded yet.
        """
        if self._model is None:
            raise RuntimeError("Model not available. Call train() or load() first.")

        env_cls = DCTradingEnvV2 if env_version == "v2" else DCTradingEnv
        env = env_cls(
            dc_events=dc_events,
            dc_indicators=dc_indicators,
            initial_capital=initial_capital,
            trading_fee_pct=fee_pct,
        )

        obs, _ = env.reset()
        done = False
        while not done:
            action, _ = self._model.predict(obs, deterministic=True)
            obs, _, terminated, truncated, _ = env.step(int(action))
            done = terminated or truncated

        trades: list[TradeRecord] = list(env._trade_history)
        return self._compute_metrics(trades, initial_capital)

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save(self, path: str) -> None:
        """Save the SB3 model to disk.

        Args:
            path: File path (SB3 appends ``.zip`` automatically).

        Raises:
            RuntimeError: If no model has been trained or loaded.
        """
        if self._model is None:
            raise RuntimeError("No model to save. Call train() first.")
        self._model.save(path)

    def load(self, path: str) -> None:
        """Load a previously saved SB3 model from disk.

        Args:
            path: File path to the saved model.
        """
        self._model = self._algorithm_cls.load(path, device=self._device)

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------

    def predict(self, obs: Any) -> int:
        """Return the greedy action for a single observation.

        Args:
            obs: Observation array compatible with the model's policy.

        Returns:
            Integer action (0=HOLD, 1=BUY, 2=SELL).

        Raises:
            RuntimeError: If no model is available.
        """
        if self._model is None:
            raise RuntimeError("No model available. Call train() or load() first.")
        action, _ = self._model.predict(obs, deterministic=True)
        return int(action)

    # ------------------------------------------------------------------
    # Metrics helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _compute_metrics(
        trades: list[TradeRecord], initial_capital: float
    ) -> dict[str, Any]:
        """Derive evaluation metrics from a list of completed trades."""
        num_trades = len(trades)

        if num_trades == 0:
            return {
                "total_pnl": 0.0,
                "num_trades": 0,
                "total_return_pct": 0.0,
                "win_rate": 0.0,
                "sharpe_ratio": 0.0,
                "max_drawdown": 0.0,
                "trades": [],
            }

        pnls = [t.pnl for t in trades]
        total_pnl = sum(pnls)
        wins = sum(1 for p in pnls if p > 0)
        win_rate = wins / num_trades

        total_return_pct = (total_pnl / initial_capital) * 100.0

        # Sharpe ratio (annualised assuming ~252 trading days is irrelevant
        # for DC events — we report the raw ratio over the trade series)
        pnl_array = np.array(pnls, dtype=np.float64)
        mean_pnl = float(np.mean(pnl_array))
        std_pnl = float(np.std(pnl_array))
        sharpe_ratio = mean_pnl / std_pnl if std_pnl > 0 else 0.0

        # Max drawdown from cumulative PnL curve
        cum_pnl = np.cumsum(pnl_array)
        running_max = np.maximum.accumulate(cum_pnl)
        drawdowns = running_max - cum_pnl
        max_drawdown = float(np.max(drawdowns)) if len(drawdowns) > 0 else 0.0

        return {
            "total_pnl": round(total_pnl, 6),
            "num_trades": num_trades,
            "total_return_pct": round(total_return_pct, 4),
            "win_rate": round(win_rate, 4),
            "sharpe_ratio": round(sharpe_ratio, 4),
            "max_drawdown": round(max_drawdown, 6),
            "trades": trades,
        }
