"""Multi-threshold ensemble agent that combines signals from agents trained at different λ values."""

from __future__ import annotations

import json
import os
import time
from collections import Counter
from typing import Any

import numpy as np

from dctrading.agents.deep_rl import DeepRLAgent
from dctrading.agents.recurrent_rl import RecurrentRLAgent
from dctrading.dc.detector import DCDetector
from dctrading.dc.indicators import DCIndicatorCalculator
from dctrading.types import (
    DCEvent,
    DCIndicators,
    Direction,
    Tick,
    TradeRecord,
    TradingAction,
)

__all__ = ["EnsembleAgent"]

_ALGORITHM_AGENT_MAP: dict[str, type[DeepRLAgent] | type[RecurrentRLAgent]] = {
    "PPO": DeepRLAgent,
    "DQN": DeepRLAgent,
    "RecurrentPPO": RecurrentRLAgent,
}


def _detect_events(
    ticks: list[Tick], threshold: float
) -> tuple[list[DCEvent], list[DCIndicators]]:
    """Run DC detection and indicator computation on raw ticks."""
    detector = DCDetector(threshold=threshold)
    calculator = DCIndicatorCalculator()

    events: list[DCEvent] = []
    indicators: list[DCIndicators] = []
    prev_event: DCEvent | None = None

    for tick in ticks:
        event = detector.process_tick(tick)
        if event is not None:
            ind = calculator.update(event, prev_event)
            events.append(event)
            indicators.append(ind)
            prev_event = event

    return events, indicators


class EnsembleAgent:
    """Multi-threshold ensemble that addresses DC threshold sensitivity.

    Trains separate RL agents at different λ thresholds and combines their
    trading signals via majority or weighted voting.  Different thresholds
    capture different market dynamics — small thresholds react to minor
    fluctuations while large thresholds filter for major regime changes.

    Args:
        thresholds: List of λ values to train on.
            Defaults to ``[0.03, 0.05, 0.08]``.
        algorithm: ``"PPO"``, ``"DQN"``, or ``"RecurrentPPO"``.
        voting: ``"majority"`` (most common action wins) or ``"weighted"``
            (weighted by each sub-agent's recent cumulative PnL).
        env_version: ``"v1"`` or ``"v2"`` (forwarded to sub-agents).
        **agent_kwargs: Forwarded to each sub-agent constructor.
    """

    def __init__(
        self,
        thresholds: list[float] | None = None,
        algorithm: str = "PPO",
        voting: str = "majority",
        env_version: str = "v2",
        **agent_kwargs: Any,
    ) -> None:
        if algorithm not in _ALGORITHM_AGENT_MAP:
            msg = f"Unsupported algorithm {algorithm!r}. Choose from {list(_ALGORITHM_AGENT_MAP)}"
            raise ValueError(msg)
        if voting not in ("majority", "weighted"):
            msg = f"Unsupported voting {voting!r}. Choose 'majority' or 'weighted'."
            raise ValueError(msg)

        self._thresholds = thresholds if thresholds is not None else [0.03, 0.05, 0.08]
        self._algorithm = algorithm
        self._voting = voting
        self._env_version = env_version
        self._agent_kwargs = agent_kwargs

        # Keyed by threshold → trained agent
        self._agents: dict[float, DeepRLAgent | RecurrentRLAgent] = {}
        # Keyed by threshold → cumulative PnL (used for weighted voting)
        self._agent_weights: dict[float, float] = {}

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train(
        self,
        ticks: list[Tick],
        total_timesteps: int = 50_000,
    ) -> dict[str, Any]:
        """Train a separate agent for each threshold on the given tick data.

        For each threshold: runs DC detection, computes indicators, and
        trains an RL agent on the resulting event sequence.

        Args:
            ticks: Raw price ticks to process.
            total_timesteps: Training steps per sub-agent.

        Returns:
            Dict with ``thresholds``, ``events_per_threshold``, and
            ``training_time_s``.
        """
        t0 = time.monotonic()
        events_per_threshold: dict[str, int] = {}

        for threshold in self._thresholds:
            events, indicators = _detect_events(ticks, threshold)

            if len(events) < 2:
                # Not enough events to train meaningfully — skip
                events_per_threshold[str(threshold)] = len(events)
                continue

            agent = self._create_agent()

            if isinstance(agent, RecurrentRLAgent):
                agent.train(
                    dc_events=events,
                    dc_indicators=indicators,
                    total_timesteps=total_timesteps,
                    env_version=self._env_version,
                )
            else:
                agent.train(
                    dc_events=events,
                    dc_indicators=indicators,
                    total_timesteps=total_timesteps,
                )

            self._agents[threshold] = agent
            self._agent_weights[threshold] = 1.0  # equal initial weight
            events_per_threshold[str(threshold)] = len(events)

        training_time = time.monotonic() - t0

        return {
            "thresholds": self._thresholds,
            "events_per_threshold": events_per_threshold,
            "training_time_s": round(training_time, 3),
        }

    # ------------------------------------------------------------------
    # Evaluation
    # ------------------------------------------------------------------

    def evaluate(self, ticks: list[Tick]) -> dict[str, Any]:
        """Evaluate the ensemble on tick data by combining sub-agent signals.

        For each threshold, DC events are detected from the ticks.  All
        event timestamps are merged into a common timeline.  At each
        timeline point the ensemble collects votes from every sub-agent
        that has an event at (or before) that time, applies the voting
        strategy, and records the resulting action.

        The combined signal sequence is then executed as a simple
        long/short/flat strategy to compute performance metrics.

        Args:
            ticks: Raw price ticks for the evaluation period.

        Returns:
            Dict with ``total_pnl``, ``num_trades``, ``total_return_pct``,
            ``win_rate``, ``sharpe_ratio``, ``max_drawdown``, and
            ``votes_log``.

        Raises:
            RuntimeError: If no agents have been trained.
        """
        if not self._agents:
            raise RuntimeError("No trained agents. Call train() or load() first.")

        # 1. Detect events per threshold and get agent actions
        threshold_data: dict[float, _ThresholdEvalData] = {}
        for threshold, agent in self._agents.items():
            events, indicators = _detect_events(ticks, threshold)
            if len(events) == 0:
                continue

            actions = self._get_agent_actions(agent, events, indicators)
            threshold_data[threshold] = _ThresholdEvalData(
                events=events,
                indicators=indicators,
                actions=actions,
            )

        if not threshold_data:
            return self._empty_metrics()

        # 2. Build unified timeline from all DC event confirmation times
        all_times: set[float] = set()
        for data in threshold_data.values():
            for ev in data.events:
                all_times.add(ev.confirm_time)
        timeline = sorted(all_times)

        # 3. For each timeline point, collect votes and decide action
        votes_log: list[dict[str, Any]] = []
        ensemble_actions: list[tuple[float, float, int]] = []  # (time, price, action)

        # Build index cursors: for each threshold, track which event we're at
        cursors: dict[float, int] = {th: 0 for th in threshold_data}

        for t in timeline:
            votes: list[int] = []
            vote_weights: list[float] = []
            price_at_t = 0.0

            for threshold, data in threshold_data.items():
                # Advance cursor to the latest event at or before time t
                while (
                    cursors[threshold] < len(data.events) - 1
                    and data.events[cursors[threshold] + 1].confirm_time <= t
                ):
                    cursors[threshold] += 1

                idx = cursors[threshold]
                if data.events[idx].confirm_time <= t:
                    votes.append(data.actions[idx])
                    vote_weights.append(self._agent_weights.get(threshold, 1.0))
                    if price_at_t == 0.0:
                        price_at_t = data.events[idx].confirm_price

            if not votes:
                continue

            final_action = self._apply_voting(votes, vote_weights)
            ensemble_actions.append((t, price_at_t, final_action))
            votes_log.append({
                "time": t,
                "price": price_at_t,
                "votes": votes,
                "action": final_action,
            })

        # 4. Execute ensemble signals and compute metrics
        trades = self._execute_signals(ensemble_actions)

        # Update agent weights based on per-threshold performance
        if self._voting == "weighted":
            self._update_weights(ticks, threshold_data)

        initial_capital = 10_000.0
        metrics = self._compute_metrics(trades, initial_capital)
        metrics["votes_log"] = votes_log
        return metrics

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save(self, dir_path: str) -> None:
        """Save all sub-agents and ensemble metadata to a directory.

        Args:
            dir_path: Directory to save into (created if needed).

        Raises:
            RuntimeError: If no agents have been trained.
        """
        if not self._agents:
            raise RuntimeError("No agents to save. Call train() first.")

        os.makedirs(dir_path, exist_ok=True)

        # Save metadata
        meta = {
            "thresholds": self._thresholds,
            "algorithm": self._algorithm,
            "voting": self._voting,
            "env_version": self._env_version,
            "agent_weights": {str(k): v for k, v in self._agent_weights.items()},
        }
        meta_path = os.path.join(dir_path, "ensemble_meta.json")
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)

        # Save each sub-agent
        for threshold, agent in self._agents.items():
            agent_path = os.path.join(dir_path, f"agent_{threshold}")
            agent.save(agent_path)

    def load(self, dir_path: str) -> None:
        """Load all sub-agents and ensemble metadata from a directory.

        Args:
            dir_path: Directory containing saved ensemble data.
        """
        meta_path = os.path.join(dir_path, "ensemble_meta.json")
        with open(meta_path) as f:
            meta = json.load(f)

        self._thresholds = meta["thresholds"]
        self._algorithm = meta["algorithm"]
        self._voting = meta["voting"]
        self._env_version = meta["env_version"]
        self._agent_weights = {float(k): v for k, v in meta["agent_weights"].items()}

        self._agents = {}
        for threshold in self._thresholds:
            agent_path = os.path.join(dir_path, f"agent_{threshold}")
            # Check if the saved model file exists (sb3 appends .zip)
            if not (
                os.path.exists(agent_path)
                or os.path.exists(agent_path + ".zip")
            ):
                continue
            agent = self._create_agent()
            agent.load(agent_path)
            self._agents[threshold] = agent

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _create_agent(self) -> DeepRLAgent | RecurrentRLAgent:
        """Instantiate a fresh sub-agent based on the configured algorithm."""
        if self._algorithm == "RecurrentPPO":
            return RecurrentRLAgent(**self._agent_kwargs)
        return DeepRLAgent(algorithm=self._algorithm, **self._agent_kwargs)

    def _get_agent_actions(
        self,
        agent: DeepRLAgent | RecurrentRLAgent,
        events: list[DCEvent],
        indicators: list[DCIndicators],
    ) -> list[int]:
        """Run the agent through events and collect its action at each step."""
        if isinstance(agent, RecurrentRLAgent):
            return self._get_recurrent_actions(agent, events, indicators)
        return self._get_standard_actions(agent, events, indicators)

    @staticmethod
    def _get_standard_actions(
        agent: DeepRLAgent,
        events: list[DCEvent],
        indicators: list[DCIndicators],
    ) -> list[int]:
        """Collect actions from a standard (non-recurrent) agent."""
        # Build a temporary env to generate observations
        from dctrading.envs.dc_trading_env import DCTradingEnv

        env = DCTradingEnv(
            dc_events=events,
            dc_indicators=indicators,
        )
        obs, _ = env.reset()
        actions: list[int] = []
        for _ in range(len(events)):
            action = agent.predict(obs)
            actions.append(action)
            obs, _, terminated, truncated, _ = env.step(action)
            if terminated or truncated:
                break
        return actions

    @staticmethod
    def _get_recurrent_actions(
        agent: RecurrentRLAgent,
        events: list[DCEvent],
        indicators: list[DCIndicators],
    ) -> list[int]:
        """Collect actions from a recurrent (LSTM) agent."""
        from dctrading.envs.dc_trading_env import DCTradingEnv

        env = DCTradingEnv(
            dc_events=events,
            dc_indicators=indicators,
        )
        obs, _ = env.reset()
        actions: list[int] = []
        lstm_states = None
        episode_start = np.ones((1,), dtype=bool)
        for _ in range(len(events)):
            action, lstm_states = agent.predict(
                obs, state=lstm_states, episode_start=episode_start
            )
            actions.append(action)
            obs, _, terminated, truncated, _ = env.step(action)
            episode_start = np.array([terminated or truncated])
            if terminated or truncated:
                break
        return actions

    def _apply_voting(self, votes: list[int], weights: list[float]) -> int:
        """Combine votes into a single action using the configured strategy."""
        if self._voting == "majority":
            counts = Counter(votes)
            return counts.most_common(1)[0][0]

        # Weighted voting: sum weights per action, pick highest
        action_scores: dict[int, float] = {}
        for vote, weight in zip(votes, weights):
            action_scores[vote] = action_scores.get(vote, 0.0) + weight
        return max(action_scores, key=lambda a: action_scores[a])

    def _update_weights(
        self,
        ticks: list[Tick],
        threshold_data: dict[float, _ThresholdEvalData],
    ) -> None:
        """Update agent weights based on per-threshold trade performance."""
        for threshold, data in threshold_data.items():
            trades = self._execute_signals(
                [
                    (ev.confirm_time, ev.confirm_price, act)
                    for ev, act in zip(data.events, data.actions)
                ]
            )
            total_pnl = sum(t.pnl for t in trades)
            # Softmax-style: shift to positive range, minimum weight of 0.1
            self._agent_weights[threshold] = max(0.1, 1.0 + total_pnl / 10_000.0)

    @staticmethod
    def _execute_signals(
        signals: list[tuple[float, float, int]],
    ) -> list[TradeRecord]:
        """Execute a sequence of (time, price, action) signals into trades.

        Simulates a simple long/short/flat strategy with 0.1% fees.
        """
        trades: list[TradeRecord] = []
        position_side: Direction | None = None
        entry_price = 0.0
        entry_time = 0.0
        fee_pct = 0.001

        for sig_time, price, action in signals:
            trading_action = TradingAction(action)

            if trading_action is TradingAction.BUY:
                # Close short if open
                if position_side is Direction.DOWN:
                    fee = price * fee_pct
                    pnl = entry_price - price - fee
                    trades.append(TradeRecord(
                        symbol="BTC/USDT",
                        side=Direction.DOWN,
                        entry_price=entry_price,
                        exit_price=price,
                        entry_time=entry_time,
                        exit_time=sig_time,
                        size=1.0,
                        pnl=pnl,
                        fees=fee * 2,
                    ))
                    position_side = None

                # Open long if flat
                if position_side is None:
                    fee = price * fee_pct
                    position_side = Direction.UP
                    entry_price = price + fee
                    entry_time = sig_time

            elif trading_action is TradingAction.SELL:
                # Close long if open
                if position_side is Direction.UP:
                    fee = price * fee_pct
                    pnl = price - entry_price - fee
                    trades.append(TradeRecord(
                        symbol="BTC/USDT",
                        side=Direction.UP,
                        entry_price=entry_price,
                        exit_price=price,
                        entry_time=entry_time,
                        exit_time=sig_time,
                        size=1.0,
                        pnl=pnl,
                        fees=fee * 2,
                    ))
                    position_side = None

                # Open short if flat
                if position_side is None:
                    fee = price * fee_pct
                    position_side = Direction.DOWN
                    entry_price = price - fee
                    entry_time = sig_time

        # Force-close any open position at the last signal
        if position_side is not None and signals:
            last_time, last_price, _ = signals[-1]
            fee = last_price * fee_pct
            if position_side is Direction.UP:
                pnl = last_price - entry_price - fee
            else:
                pnl = entry_price - last_price - fee
            trades.append(TradeRecord(
                symbol="BTC/USDT",
                side=position_side,
                entry_price=entry_price,
                exit_price=last_price,
                entry_time=entry_time,
                exit_time=last_time,
                size=1.0,
                pnl=pnl,
                fees=fee * 2,
            ))

        return trades

    @staticmethod
    def _compute_metrics(
        trades: list[TradeRecord], initial_capital: float
    ) -> dict[str, Any]:
        """Derive evaluation metrics from completed trades."""
        num_trades = len(trades)

        if num_trades == 0:
            return {
                "total_pnl": 0.0,
                "num_trades": 0,
                "total_return_pct": 0.0,
                "win_rate": 0.0,
                "sharpe_ratio": 0.0,
                "max_drawdown": 0.0,
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
        }

    @staticmethod
    def _empty_metrics() -> dict[str, Any]:
        """Return zeroed metrics when no events are available."""
        return {
            "total_pnl": 0.0,
            "num_trades": 0,
            "total_return_pct": 0.0,
            "win_rate": 0.0,
            "sharpe_ratio": 0.0,
            "max_drawdown": 0.0,
            "votes_log": [],
        }


class _ThresholdEvalData:
    """Internal container for per-threshold evaluation data."""

    __slots__ = ("events", "indicators", "actions")

    def __init__(
        self,
        events: list[DCEvent],
        indicators: list[DCIndicators],
        actions: list[int],
    ) -> None:
        self.events = events
        self.indicators = indicators
        self.actions = actions
