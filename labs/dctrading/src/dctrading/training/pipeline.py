"""End-to-end training pipeline: data → DC detect → indicators → train → MLflow."""

from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Any

import mlflow
import pandas as pd

from dctrading.agents.deep_rl import DeepRLAgent
from dctrading.dc.detector import DCDetector
from dctrading.dc.indicators import DCIndicatorCalculator
from dctrading.types import DCEvent, DCIndicators, Tick

__all__ = ["TrainingPipeline"]


class TrainingPipeline:
    """Orchestrates the full DC trading experiment lifecycle.

    Handles data preparation (tick → DC events → indicators), agent
    training, evaluation, and MLflow experiment logging — all with
    local file-based tracking (no server required).

    Args:
        experiment_name: MLflow experiment name.
        mlflow_tracking_uri: Path to the local ``mlruns/`` directory.
    """

    def __init__(
        self,
        experiment_name: str = "dctrading",
        mlflow_tracking_uri: str = "mlruns",
    ) -> None:
        self._experiment_name = experiment_name
        self._tracking_uri = mlflow_tracking_uri

    # ------------------------------------------------------------------
    # Data preparation
    # ------------------------------------------------------------------

    def prepare_data(
        self, ticks: list[Tick], threshold: float
    ) -> tuple[list[DCEvent], list[DCIndicators]]:
        """Run DC detection and indicator computation on raw ticks.

        Args:
            ticks: Chronologically ordered price observations.
            threshold: Lambda threshold for the DC detector.

        Returns:
            Tuple of ``(dc_events, dc_indicators)`` aligned by index.
        """
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

    # ------------------------------------------------------------------
    # Train + log
    # ------------------------------------------------------------------

    def train_and_log(
        self,
        ticks: list[Tick],
        threshold: float,
        algorithm: str = "PPO",
        total_timesteps: int = 50_000,
        **agent_kwargs: Any,
    ) -> str:
        """Full pipeline: prepare data → train → evaluate → log to MLflow.

        Args:
            ticks: Raw tick data.
            threshold: DC detection threshold.
            algorithm: ``"PPO"`` or ``"DQN"``.
            total_timesteps: Training budget in env steps.
            **agent_kwargs: Forwarded to ``DeepRLAgent`` constructor
                (e.g. ``learning_rate``, ``batch_size``).

        Returns:
            The MLflow ``run_id`` for this experiment run.
        """
        events, indicators = self.prepare_data(ticks, threshold)

        agent = DeepRLAgent(algorithm=algorithm, **agent_kwargs)
        train_stats = agent.train(
            dc_events=events,
            dc_indicators=indicators,
            total_timesteps=total_timesteps,
        )
        eval_metrics = agent.evaluate(dc_events=events, dc_indicators=indicators)

        # --- MLflow logging ---
        mlflow.set_tracking_uri(self._tracking_uri)
        mlflow.set_experiment(self._experiment_name)

        with mlflow.start_run() as run:
            # Parameters
            mlflow.log_params(
                {
                    "threshold": threshold,
                    "algorithm": algorithm,
                    "total_timesteps": total_timesteps,
                    **{k: str(v) for k, v in agent_kwargs.items()},
                }
            )

            # Metrics
            mlflow.log_metrics(
                {
                    "total_pnl": eval_metrics["total_pnl"],
                    "num_trades": eval_metrics["num_trades"],
                    "win_rate": eval_metrics["win_rate"],
                    "sharpe_ratio": eval_metrics["sharpe_ratio"],
                    "max_drawdown": eval_metrics["max_drawdown"],
                    "training_time_s": train_stats["training_time_s"],
                }
            )

            # Artifact: saved model
            with tempfile.TemporaryDirectory() as tmpdir:
                model_path = str(Path(tmpdir) / "model")
                agent.save(model_path)
                mlflow.log_artifacts(tmpdir, artifact_path="model")

            return run.info.run_id

    # ------------------------------------------------------------------
    # Multi-algorithm comparison
    # ------------------------------------------------------------------

    def compare_agents(
        self,
        ticks: list[Tick],
        threshold: float,
        algorithms: list[str] | None = None,
        total_timesteps: int = 50_000,
    ) -> pd.DataFrame:
        """Train and evaluate multiple algorithms on the same data.

        Each algorithm gets its own MLflow run. Results are collected
        into a comparison DataFrame.

        Args:
            ticks: Raw tick data.
            threshold: DC detection threshold.
            algorithms: List of algorithm names (default ``["PPO", "DQN"]``).
            total_timesteps: Training budget per algorithm.

        Returns:
            DataFrame with one row per algorithm and columns for each
            evaluation metric.
        """
        if algorithms is None:
            algorithms = ["PPO", "DQN"]

        events, indicators = self.prepare_data(ticks, threshold)
        rows: list[dict[str, Any]] = []

        for algo in algorithms:
            agent = DeepRLAgent(algorithm=algo)
            train_stats = agent.train(
                dc_events=events,
                dc_indicators=indicators,
                total_timesteps=total_timesteps,
            )
            eval_metrics = agent.evaluate(dc_events=events, dc_indicators=indicators)

            rows.append(
                {
                    "algorithm": algo,
                    "total_pnl": eval_metrics["total_pnl"],
                    "num_trades": eval_metrics["num_trades"],
                    "total_return_pct": eval_metrics["total_return_pct"],
                    "win_rate": eval_metrics["win_rate"],
                    "sharpe_ratio": eval_metrics["sharpe_ratio"],
                    "max_drawdown": eval_metrics["max_drawdown"],
                    "training_time_s": train_stats["training_time_s"],
                }
            )

        return pd.DataFrame(rows)
