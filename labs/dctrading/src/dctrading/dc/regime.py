"""HMM-based regime detection from DC indicators.

Based on Chen & Tsang (2021) "Detecting Regime Change in Computational
Finance using DC indicators with HMM".  Uses a Gaussian HMM to classify
market micro-regimes (trending / mean-reverting / volatile) from the three
most discriminative DC features: r_ratio, tmv, and os_ratio.
"""

from __future__ import annotations

import pickle
from collections import deque
from pathlib import Path

import numpy as np
from hmmlearn.hmm import GaussianHMM
from numpy.typing import NDArray

from dctrading.types import DCIndicators

__all__ = ["RegimeDetector"]

# Minimum context window used by predict_single / regime_probabilities
_MIN_CONTEXT = 10


class RegimeDetector:
    """Hidden Markov Model regime detector for DC indicator sequences.

    Parameters
    ----------
    n_regimes:
        Number of hidden states.  Default ``3`` corresponds to
        *trending*, *mean-reverting*, and *volatile*.
    n_iter:
        Maximum EM iterations for model fitting.
    random_state:
        Seed for reproducibility.
    """

    def __init__(
        self,
        n_regimes: int = 3,
        n_iter: int = 100,
        random_state: int = 42,
    ) -> None:
        self.n_regimes = n_regimes
        self.n_iter = n_iter
        self.random_state = random_state

        self._model = GaussianHMM(
            n_components=n_regimes,
            covariance_type="full",
            n_iter=n_iter,
            random_state=random_state,
        )
        self._fitted = False
        self._buffer: deque[DCIndicators] = deque(maxlen=_MIN_CONTEXT)

    # ------------------------------------------------------------------
    # Feature extraction
    # ------------------------------------------------------------------

    @staticmethod
    def get_feature_matrix(indicators: list[DCIndicators]) -> NDArray[np.floating]:
        """Convert a list of DC indicators to an (N, 3) feature matrix.

        Features (per Chen & Tsang 2021):
            0 – r_ratio
            1 – tmv
            2 – os_ratio
        """
        return np.array(
            [[ind.r_ratio, ind.tmv, ind.os_ratio] for ind in indicators],
            dtype=np.float64,
        )

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def fit(self, indicators: list[DCIndicators]) -> None:
        """Fit the Gaussian HMM on a sequence of DC indicators.

        Parameters
        ----------
        indicators:
            Chronologically ordered DC indicator observations.
        """
        X = self.get_feature_matrix(indicators)
        self._model.fit(X)
        self._fitted = True

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def predict(self, indicators: list[DCIndicators]) -> list[int]:
        """Predict the most-likely regime label for each observation.

        Returns
        -------
        list[int]
            Regime ids in ``[0, n_regimes)``.
        """
        X = self.get_feature_matrix(indicators)
        states: NDArray[np.intp] = self._model.predict(X)
        return states.tolist()

    def predict_single(self, indicator: DCIndicators) -> int:
        """Predict the regime for a single (streaming) observation.

        Maintains an internal sliding buffer so the Viterbi path has
        enough context to be meaningful.

        Returns
        -------
        int
            Regime id for the latest observation.
        """
        self._buffer.append(indicator)
        X = self.get_feature_matrix(list(self._buffer))
        states: NDArray[np.intp] = self._model.predict(X)
        return int(states[-1])

    def regime_probabilities(self, indicator: DCIndicators) -> list[float]:
        """Return posterior state probabilities for *indicator*.

        Uses the internal context buffer (same as :meth:`predict_single`)
        to compute the forward-filtered posterior at the last time-step.

        Returns
        -------
        list[float]
            Length-``n_regimes`` vector of probabilities summing to 1.
        """
        self._buffer.append(indicator)
        X = self.get_feature_matrix(list(self._buffer))
        posteriors: NDArray[np.floating] = self._model.predict_proba(X)
        return posteriors[-1].tolist()

    # ------------------------------------------------------------------
    # Regime labelling
    # ------------------------------------------------------------------

    def label_regimes(
        self, indicators: list[DCIndicators]
    ) -> dict[int, str]:
        """Assign human-readable labels to each regime after fitting.

        Heuristic (Chen & Tsang 2021 §4):
            * High TMV + low R-ratio  → ``"trending"``
            * High R-ratio + low TMV  → ``"mean_reverting"``
            * High variance across features → ``"volatile"``

        Parameters
        ----------
        indicators:
            The same (or representative) sequence used for fitting.

        Returns
        -------
        dict[int, str]
            ``{regime_id: label}`` for every regime.
        """
        X = self.get_feature_matrix(indicators)
        states = self._model.predict(X)

        labels: dict[int, str] = {}
        regime_variances: dict[int, float] = {}

        for regime in range(self.n_regimes):
            mask = states == regime
            if not np.any(mask):
                labels[regime] = "volatile"
                continue
            subset = X[mask]
            regime_variances[regime] = float(np.mean(np.var(subset, axis=0)))

        # Rank regimes by variance – highest gets "volatile"
        sorted_by_var = sorted(
            regime_variances, key=lambda r: regime_variances[r], reverse=True
        )

        for rank, regime in enumerate(sorted_by_var):
            if regime in labels:
                continue
            if rank == 0:
                # Highest overall feature variance → volatile
                labels[regime] = "volatile"
            else:
                # Discriminate trending vs mean-reverting via means
                mask = states == regime
                mean_tmv = float(np.mean(X[mask, 1]))
                mean_r = float(np.mean(X[mask, 0]))
                if mean_tmv >= mean_r:
                    labels[regime] = "trending"
                else:
                    labels[regime] = "mean_reverting"

        return labels

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save(self, path: str) -> None:
        """Serialize the fitted HMM to *path* using pickle."""
        payload = {
            "model": self._model,
            "n_regimes": self.n_regimes,
            "n_iter": self.n_iter,
            "random_state": self.random_state,
        }
        with Path(path).open("wb") as fh:
            pickle.dump(payload, fh)

    def load(self, path: str) -> None:
        """Deserialize a previously saved HMM from *path*."""
        with Path(path).open("rb") as fh:
            payload: dict = pickle.load(fh)  # noqa: S301
        self._model = payload["model"]
        self.n_regimes = payload["n_regimes"]
        self.n_iter = payload["n_iter"]
        self.random_state = payload["random_state"]
        self._fitted = True
