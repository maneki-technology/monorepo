"""DCRL: Tabular Q-Learning DC Trading Agent.

Implements the DCRL/QDCRL approach from Aloud & Alkhamees (2021).
Uses a Q-table to learn optimal trading actions from discretized
DC indicator states. Supports training (epsilon-greedy) and inference.
"""

from __future__ import annotations

import math
import pickle
import random
from pathlib import Path

from dctrading.types import (
    DCEvent,
    DCIndicators,
    Direction,
    TradeRecord,
    TradingAction,
)

__all__ = ["DCRL"]


class DCRL:
    """Tabular Q-learning agent for DC-based trading.

    Discretizes continuous DC indicators into bins and maintains a
    Q-table mapping (state, action) pairs to expected returns.
    """

    def __init__(
        self,
        n_bins: int = 10,
        alpha: float = 0.1,
        gamma: float = 0.95,
        epsilon: float = 1.0,
        epsilon_decay: float = 0.995,
        epsilon_min: float = 0.01,
    ) -> None:
        """Initialise the Q-learning agent.

        Args:
            n_bins: Number of bins for discretizing continuous features.
            alpha: Learning rate for Q-value updates.
            gamma: Discount factor for future rewards.
            epsilon: Initial exploration probability.
            epsilon_decay: Multiplicative decay applied to epsilon each episode.
            epsilon_min: Floor for epsilon during training.
        """
        self.n_bins = n_bins
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min

        # Q-table: state tuple → [Q(HOLD), Q(BUY), Q(SELL)]
        self.q_table: dict[tuple, list[float]] = {}

        # Adaptive binning ranges — updated during training
        self._feature_min: dict[str, float] = {
            "magnitude": float("inf"),
            "r_ratio": float("inf"),
            "tmv": float("inf"),
            "os_ratio": float("inf"),
        }
        self._feature_max: dict[str, float] = {
            "magnitude": float("-inf"),
            "r_ratio": float("-inf"),
            "tmv": float("-inf"),
            "os_ratio": float("-inf"),
        }
        self._fitted = False

    # ------------------------------------------------------------------
    # State discretization
    # ------------------------------------------------------------------

    def _update_ranges(self, event: DCEvent, indicators: DCIndicators) -> None:
        """Track min/max of each continuous feature for adaptive binning."""
        values = {
            "magnitude": event.magnitude,
            "r_ratio": indicators.r_ratio,
            "tmv": indicators.tmv,
            "os_ratio": indicators.os_ratio,
        }
        for key, val in values.items():
            if val < self._feature_min[key]:
                self._feature_min[key] = val
            if val > self._feature_max[key]:
                self._feature_max[key] = val

    def _bin_value(self, value: float, feature: str) -> int:
        """Map a continuous value to a discrete bin index.

        Args:
            value: The raw continuous value.
            feature: Feature name (used to look up min/max range).

        Returns:
            Integer bin index in [0, n_bins - 1].
        """
        lo = self._feature_min[feature]
        hi = self._feature_max[feature]
        if hi <= lo:
            return 0
        ratio = (value - lo) / (hi - lo)
        ratio = max(0.0, min(1.0, ratio))
        idx = int(ratio * self.n_bins)
        return min(idx, self.n_bins - 1)

    def _discretize(
        self,
        event: DCEvent,
        indicators: DCIndicators,
        position: str,
    ) -> tuple:
        """Convert continuous state into a discrete tuple for Q-table lookup.

        Args:
            event: The current DC event.
            indicators: Computed DC indicators for this event.
            position: Current position status — "flat", "long", or "short".

        Returns:
            Tuple of discrete values representing the state.
        """
        direction_val = 0 if event.direction is Direction.UP else 1
        magnitude_bin = self._bin_value(event.magnitude, "magnitude")
        r_ratio_bin = self._bin_value(indicators.r_ratio, "r_ratio")
        tmv_bin = self._bin_value(indicators.tmv, "tmv")
        os_ratio_bin = self._bin_value(indicators.os_ratio, "os_ratio")

        position_map = {"flat": 0, "long": 1, "short": 2}
        position_val = position_map.get(position, 0)

        return (
            direction_val,
            magnitude_bin,
            r_ratio_bin,
            tmv_bin,
            os_ratio_bin,
            position_val,
        )

    # ------------------------------------------------------------------
    # Q-table helpers
    # ------------------------------------------------------------------

    def _get_q_values(self, state: tuple) -> list[float]:
        """Return Q-values for a state, initialising to zeros if unseen."""
        if state not in self.q_table:
            self.q_table[state] = [0.0, 0.0, 0.0]
        return self.q_table[state]

    # ------------------------------------------------------------------
    # Action selection
    # ------------------------------------------------------------------

    def select_action(self, state: tuple, training: bool = True) -> TradingAction:
        """Choose an action using epsilon-greedy (training) or greedy (inference).

        Args:
            state: Discretized state tuple.
            training: If True, use epsilon-greedy exploration.

        Returns:
            The selected TradingAction.
        """
        if training and random.random() < self.epsilon:
            return TradingAction(random.randint(0, 2))

        q_values = self._get_q_values(state)
        max_q = max(q_values)
        # Break ties randomly
        best_actions = [i for i, q in enumerate(q_values) if q == max_q]
        return TradingAction(random.choice(best_actions))

    # ------------------------------------------------------------------
    # Q-learning update
    # ------------------------------------------------------------------

    def update(
        self,
        state: tuple,
        action: TradingAction,
        reward: float,
        next_state: tuple,
    ) -> None:
        """Apply the standard Q-learning update rule.

        Q(s, a) += alpha * (reward + gamma * max(Q(s')) - Q(s, a))

        Args:
            state: Current state tuple.
            action: Action taken.
            reward: Observed reward.
            next_state: Resulting state tuple.
        """
        q_values = self._get_q_values(state)
        next_q_values = self._get_q_values(next_state)
        best_next = max(next_q_values)

        a = action.value
        q_values[a] += self.alpha * (reward + self.gamma * best_next - q_values[a])

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train(
        self,
        events: list[DCEvent],
        indicators: list[DCIndicators],
        initial_capital: float = 10000.0,
        fee_pct: float = 0.001,
        n_episodes: int = 100,
    ) -> dict:
        """Train the agent over multiple episodes on the same event sequence.

        Args:
            events: Ordered list of DC events.
            indicators: Corresponding DC indicators (same length as events).
            initial_capital: Starting capital in quote currency.
            fee_pct: Fee as a fraction of trade value.
            n_episodes: Number of training episodes.

        Returns:
            Dict with keys: episode_rewards, final_epsilon, q_table_size.
        """
        if not events:
            return {
                "episode_rewards": [],
                "final_epsilon": self.epsilon,
                "q_table_size": len(self.q_table),
            }

        # First pass: collect feature ranges for adaptive binning
        for event, ind in zip(events, indicators):
            self._update_ranges(event, ind)
        self._fitted = True

        episode_rewards: list[float] = []

        for _ in range(n_episodes):
            episode_reward = self._run_episode(
                events, indicators, initial_capital, fee_pct, training=True
            )
            episode_rewards.append(episode_reward)

            # Decay epsilon
            self.epsilon = max(
                self.epsilon_min, self.epsilon * self.epsilon_decay
            )

        return {
            "episode_rewards": episode_rewards,
            "final_epsilon": self.epsilon,
            "q_table_size": len(self.q_table),
        }

    def _run_episode(
        self,
        events: list[DCEvent],
        indicators: list[DCIndicators],
        initial_capital: float,
        fee_pct: float,
        training: bool,
    ) -> float:
        """Execute one episode through the event sequence.

        Returns:
            Total reward accumulated during the episode.
        """
        capital = initial_capital
        position_side: Direction | None = None
        entry_price = 0.0
        size = 0.0
        total_reward = 0.0
        position_str = "flat"

        for i, (event, ind) in enumerate(zip(events, indicators)):
            state = self._discretize(event, ind, position_str)
            action = self.select_action(state, training=training)
            price = event.confirm_price

            reward = 0.0

            if action is TradingAction.BUY:
                if position_side is None:
                    # Open long
                    fee = capital * fee_pct
                    usable = capital - fee
                    size = usable / price
                    entry_price = price
                    position_side = Direction.UP
                    position_str = "long"
                elif position_side is Direction.DOWN:
                    # Close short, open long
                    raw_pnl = (entry_price - price) * size
                    exit_fee = size * price * fee_pct
                    net_pnl = raw_pnl - exit_fee
                    reward = net_pnl / (entry_price * size) if entry_price * size > 0 else 0.0
                    capital += net_pnl
                    fee = capital * fee_pct
                    usable = capital - fee
                    size = usable / price if price > 0 else 0.0
                    entry_price = price
                    position_side = Direction.UP
                    position_str = "long"
                # else: already long, treat as hold
                elif position_side is Direction.UP:
                    reward = -0.0001 if size > 0 else 0.0

            elif action is TradingAction.SELL:
                if position_side is None:
                    # Open short
                    fee = capital * fee_pct
                    usable = capital - fee
                    size = usable / price
                    entry_price = price
                    position_side = Direction.DOWN
                    position_str = "short"
                elif position_side is Direction.UP:
                    # Close long, open short
                    raw_pnl = (price - entry_price) * size
                    exit_fee = size * price * fee_pct
                    net_pnl = raw_pnl - exit_fee
                    reward = net_pnl / (entry_price * size) if entry_price * size > 0 else 0.0
                    capital += net_pnl
                    fee = capital * fee_pct
                    usable = capital - fee
                    size = usable / price if price > 0 else 0.0
                    entry_price = price
                    position_side = Direction.DOWN
                    position_str = "short"
                # else: already short, treat as hold
                elif position_side is Direction.DOWN:
                    reward = -0.0001 if size > 0 else 0.0

            elif action is TradingAction.HOLD:
                if position_side is not None:
                    reward = -0.0001
                # else: flat, reward = 0.0

            total_reward += reward

            # Compute next state for Q-update
            if training and i + 1 < len(events):
                next_event = events[i + 1]
                next_ind = indicators[i + 1]
                next_state = self._discretize(next_event, next_ind, position_str)
                self.update(state, action, reward, next_state)
            elif training:
                # Terminal step — no next state, use current state as terminal
                terminal_state = self._discretize(event, ind, position_str)
                self.update(state, action, reward, terminal_state)

        return total_reward

    # ------------------------------------------------------------------
    # Evaluation
    # ------------------------------------------------------------------

    def evaluate(
        self,
        events: list[DCEvent],
        indicators: list[DCIndicators],
        initial_capital: float = 10000.0,
        fee_pct: float = 0.001,
    ) -> list[TradeRecord]:
        """Run the trained policy (greedy) and return trade records.

        Args:
            events: Ordered list of DC events.
            indicators: Corresponding DC indicators.
            initial_capital: Starting capital in quote currency.
            fee_pct: Fee as a fraction of trade value.

        Returns:
            List of completed TradeRecord objects.
        """
        if not events:
            return []

        # Update ranges if not fitted yet
        if not self._fitted:
            for event, ind in zip(events, indicators):
                self._update_ranges(event, ind)
            self._fitted = True

        trades: list[TradeRecord] = []
        capital = initial_capital
        position_side: Direction | None = None
        entry_price = 0.0
        entry_time = 0.0
        size = 0.0
        position_str = "flat"

        for event, ind in zip(events, indicators):
            state = self._discretize(event, ind, position_str)
            action = self.select_action(state, training=False)
            price = event.confirm_price
            time = event.confirm_time
            symbol = event.symbol

            if action is TradingAction.BUY:
                if position_side is None:
                    fee = capital * fee_pct
                    usable = capital - fee
                    size = usable / price
                    entry_price = price
                    entry_time = time
                    position_side = Direction.UP
                    position_str = "long"
                elif position_side is Direction.DOWN:
                    # Close short
                    raw_pnl = (entry_price - price) * size
                    exit_fee = size * price * fee_pct
                    net_pnl = raw_pnl - exit_fee
                    trades.append(
                        TradeRecord(
                            symbol=symbol,
                            side=Direction.DOWN,
                            entry_price=entry_price,
                            exit_price=price,
                            entry_time=entry_time,
                            exit_time=time,
                            size=size,
                            pnl=net_pnl,
                            fees=exit_fee + (size * entry_price * fee_pct),
                            dc_threshold=event.threshold,
                        )
                    )
                    capital += net_pnl
                    fee = capital * fee_pct
                    usable = capital - fee
                    size = usable / price
                    entry_price = price
                    entry_time = time
                    position_side = Direction.UP
                    position_str = "long"

            elif action is TradingAction.SELL:
                if position_side is None:
                    fee = capital * fee_pct
                    usable = capital - fee
                    size = usable / price
                    entry_price = price
                    entry_time = time
                    position_side = Direction.DOWN
                    position_str = "short"
                elif position_side is Direction.UP:
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
                            dc_threshold=event.threshold,
                        )
                    )
                    capital += net_pnl
                    fee = capital * fee_pct
                    usable = capital - fee
                    size = usable / price
                    entry_price = price
                    entry_time = time
                    position_side = Direction.DOWN
                    position_str = "short"

        return trades

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save(self, path: str) -> None:
        """Serialize the Q-table and binning state to disk.

        Args:
            path: File path for the pickle output.
        """
        data = {
            "q_table": self.q_table,
            "feature_min": self._feature_min,
            "feature_max": self._feature_max,
            "n_bins": self.n_bins,
            "alpha": self.alpha,
            "gamma": self.gamma,
            "epsilon": self.epsilon,
            "epsilon_decay": self.epsilon_decay,
            "epsilon_min": self.epsilon_min,
            "fitted": self._fitted,
        }
        filepath = Path(path)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with filepath.open("wb") as f:
            pickle.dump(data, f)

    def load(self, path: str) -> None:
        """Deserialize a saved Q-table and binning state from disk.

        Args:
            path: File path to the pickle file.
        """
        with Path(path).open("rb") as f:
            data = pickle.load(f)  # noqa: S301
        self.q_table = data["q_table"]
        self._feature_min = data["feature_min"]
        self._feature_max = data["feature_max"]
        self.n_bins = data["n_bins"]
        self.alpha = data["alpha"]
        self.gamma = data["gamma"]
        self.epsilon = data["epsilon"]
        self.epsilon_decay = data["epsilon_decay"]
        self.epsilon_min = data["epsilon_min"]
        self._fitted = data["fitted"]

    # ------------------------------------------------------------------
    # Summary metrics (same as ZiDCT0)
    # ------------------------------------------------------------------

    @staticmethod
    def summary(trades: list[TradeRecord]) -> dict:
        """Compute performance metrics from completed trades.

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
        result["total_return_pct"] = (
            (total_pnl / initial_capital) * 100 if initial_capital > 0 else 0.0
        )
        result["num_trades"] = num_trades
        result["win_rate"] = wins / num_trades if num_trades > 0 else 0.0
        result["avg_trade_pnl"] = total_pnl / num_trades if num_trades > 0 else 0.0
        result["max_drawdown"] = max_dd
        result["sharpe_ratio"] = sharpe

        return result
