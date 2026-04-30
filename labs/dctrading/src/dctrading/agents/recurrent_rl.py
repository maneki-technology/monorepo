"""Recurrent PPO (LSTM) agent wrapper using sb3-contrib."""

from __future__ import annotations

import time
from typing import Any

import numpy as np
from sb3_contrib import RecurrentPPO

from dctrading.envs.dc_trading_env import DCTradingEnv
from dctrading.envs.dc_trading_env_v2 import DCTradingEnvV2
from dctrading.types import DCEvent, DCIndicators, TradeRecord

__all__ = ["RecurrentRLAgent"]

_ENV_VERSIONS: dict[str, type[DCTradingEnv] | type[DCTradingEnvV2]] = {
    "v1": DCTradingEnv,
    "v2": DCTradingEnvV2,
}


class RecurrentRLAgent:
    """LSTM-based PPO agent for DC trading via sb3-contrib's RecurrentPPO.

    Wraps :class:`sb3_contrib.RecurrentPPO` with an ``MlpLstmPolicy`` to
    capture temporal dependencies across DC event sequences.  The LSTM
    hidden state is carried across steps during evaluation and prediction,
    enabling the agent to learn patterns that span multiple DC events.

    Args:
        policy: sb3-contrib policy string (default ``"MlpLstmPolicy"``).
        device: ``"auto"``, ``"cpu"``, or ``"mps"``.
        lstm_hidden_size: Number of units in each LSTM layer.
        n_lstm_layers: Number of stacked LSTM layers.
        **kwargs: Forwarded to the ``RecurrentPPO`` constructor
            (e.g. ``learning_rate``, ``batch_size``).
    """

    def __init__(
        self,
        policy: str = "MlpLstmPolicy",
        device: str = "auto",
        lstm_hidden_size: int = 64,
        n_lstm_layers: int = 1,
        **kwargs: Any,
    ) -> None:
        self._policy = policy
        self._device = device
        self._lstm_hidden_size = lstm_hidden_size
        self._n_lstm_layers = n_lstm_layers
        self._kwargs = kwargs
        self._model: RecurrentPPO | None = None

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
        env_version: str = "v2",
    ) -> dict[str, Any]:
        """Train the recurrent agent on a sequence of DC events.

        Creates the appropriate DC trading environment, instantiates
        ``RecurrentPPO`` with an LSTM policy, and runs training.

        Args:
            dc_events: Pre-computed DC events.
            dc_indicators: Corresponding indicators for each event.
            total_timesteps: Number of environment steps to train for.
            initial_capital: Starting capital in quote currency.
            fee_pct: Trading fee as a fraction (e.g. 0.001 = 0.1%).
            env_version: ``"v1"`` for :class:`DCTradingEnv`,
                ``"v2"`` for :class:`DCTradingEnvV2`.

        Returns:
            Dict with ``total_timesteps``, ``training_time_s``, and
            ``final_reward``.
        """
        env = self._make_env(
            dc_events, dc_indicators, initial_capital, fee_pct, env_version
        )

        self._model = RecurrentPPO(
            policy=self._policy,
            env=env,
            device=self._device,
            policy_kwargs={
                "lstm_hidden_size": self._lstm_hidden_size,
                "n_lstm_layers": self._n_lstm_layers,
            },
            **self._kwargs,
        )

        t0 = time.monotonic()
        self._model.learn(total_timesteps=total_timesteps)
        training_time = time.monotonic() - t0

        # Run one final episode to capture terminal reward
        total_reward = 0.0
        lstm_states = None
        episode_start = np.ones((1,), dtype=bool)
        obs, _ = env.reset()
        done = False
        while not done:
            action, lstm_states = self._model.predict(
                obs, state=lstm_states, episode_start=episode_start, deterministic=True
            )
            obs, reward, terminated, truncated, _ = env.step(int(action))
            episode_start = np.array([terminated or truncated])
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
        env_version: str = "v2",
    ) -> dict[str, Any]:
        """Evaluate the trained agent deterministically.

        Runs the model through a fresh environment while properly managing
        LSTM hidden states across steps.

        Args:
            dc_events: DC events for the evaluation period.
            dc_indicators: Corresponding indicators.
            initial_capital: Starting capital.
            fee_pct: Trading fee fraction.
            env_version: ``"v1"`` or ``"v2"``.

        Returns:
            Dict with ``total_pnl``, ``num_trades``, ``total_return_pct``,
            ``win_rate``, ``sharpe_ratio``, ``max_drawdown``, and ``trades``.

        Raises:
            RuntimeError: If the model has not been trained or loaded yet.
        """
        if self._model is None:
            raise RuntimeError("Model not available. Call train() or load() first.")

        env = self._make_env(
            dc_events, dc_indicators, initial_capital, fee_pct, env_version
        )

        lstm_states = None
        episode_start = np.ones((1,), dtype=bool)
        obs, _ = env.reset()
        done = False
        while not done:
            action, lstm_states = self._model.predict(
                obs, state=lstm_states, episode_start=episode_start, deterministic=True
            )
            obs, _, terminated, truncated, _ = env.step(int(action))
            episode_start = np.array([terminated or truncated])
            done = terminated or truncated

        trades: list[TradeRecord] = list(env._trade_history)
        return self._compute_metrics(trades, initial_capital)

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save(self, path: str) -> None:
        """Save the RecurrentPPO model to disk.

        Args:
            path: File path (sb3 appends ``.zip`` automatically).

        Raises:
            RuntimeError: If no model has been trained or loaded.
        """
        if self._model is None:
            raise RuntimeError("No model to save. Call train() first.")
        self._model.save(path)

    def load(self, path: str) -> None:
        """Load a previously saved RecurrentPPO model from disk.

        Args:
            path: File path to the saved model.
        """
        self._model = RecurrentPPO.load(path, device=self._device)

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------

    def predict(
        self, obs: Any, state: Any = None, episode_start: Any = None
    ) -> tuple[int, Any]:
        """Return the greedy action and updated LSTM state for a single observation.

        Args:
            obs: Observation array compatible with the model's policy.
            state: LSTM hidden states from the previous step, or ``None``
                to start fresh.
            episode_start: Boolean array indicating episode boundaries.
                Defaults to ``[True]`` if ``None``.

        Returns:
            Tuple of (action, lstm_states) where action is an integer
            (0=HOLD, 1=BUY, 2=SELL) and lstm_states should be passed
            back on the next call.

        Raises:
            RuntimeError: If no model is available.
        """
        if self._model is None:
            raise RuntimeError("No model available. Call train() or load() first.")
        if episode_start is None:
            episode_start = np.ones((1,), dtype=bool)
        action, state = self._model.predict(
            obs, state=state, episode_start=episode_start, deterministic=True
        )
        return int(action), state

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _make_env(
        dc_events: list[DCEvent],
        dc_indicators: list[DCIndicators],
        initial_capital: float,
        fee_pct: float,
        env_version: str,
    ) -> DCTradingEnv | DCTradingEnvV2:
        """Instantiate the appropriate environment version."""
        if env_version not in _ENV_VERSIONS:
            msg = f"Unknown env_version {env_version!r}. Choose from {list(_ENV_VERSIONS)}"
            raise ValueError(msg)
        env_cls = _ENV_VERSIONS[env_version]
        return env_cls(
            dc_events=dc_events,
            dc_indicators=dc_indicators,
            initial_capital=initial_capital,
            trading_fee_pct=fee_pct,
        )

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

        pnl_array = np.array(pnls, dtype=np.float64)
        mean_pnl = float(np.mean(pnl_array))
        std_pnl = float(np.std(pnl_array))
        sharpe_ratio = mean_pnl / std_pnl if std_pnl > 0 else 0.0

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
