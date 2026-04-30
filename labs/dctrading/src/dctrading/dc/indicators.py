"""DC indicator calculations (per Tsang et al.).

Computes streaming indicators from consecutive DCEvent pairs:
R ratio, TMV, overshoot length/ratio, and tick counts.
"""

from __future__ import annotations

from collections import deque

from dctrading.types import DCEvent, DCIndicators

__all__ = ["DCIndicatorCalculator"]


class DCIndicatorCalculator:
    """Streaming calculator for Directional Change indicators.

    Maintains a rolling window of recent indicator snapshots so that
    averaged / smoothed values can be derived downstream (e.g. as RL
    state features).

    Args:
        window_size: Number of recent indicator snapshots to retain for
            rolling statistics.  Defaults to ``20``.
    """

    def __init__(self, window_size: int = 20) -> None:
        self._window_size = window_size
        self._history: deque[DCIndicators] = deque(maxlen=window_size)
        self._tick_count: int = 0

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def update(self, event: DCEvent, prev_event: DCEvent | None) -> DCIndicators:
        """Compute indicators for the latest DC event pair.

        The *DC leg* of the current event runs from its extreme point to
        its confirmation point.  The *overshoot leg* of the previous event
        runs from the previous confirmation to the current extreme (i.e.
        the market continued past the last confirmation before reversing
        again).

        Args:
            event: The newly confirmed DC event.
            prev_event: The immediately preceding DC event, or ``None``
                if this is the first event.

        Returns:
            A ``DCIndicators`` snapshot for this event pair.
        """
        self._tick_count += 1

        # DC leg of the current event: extreme → confirmation
        dc_length = abs(event.confirm_time - event.extreme_time)

        # Overshoot leg of the *previous* event: prev confirmation → current extreme
        if prev_event is not None:
            os_length = abs(event.extreme_time - prev_event.confirm_time)
        else:
            os_length = 0.0

        # R ratio — OS duration relative to DC duration
        r_ratio = os_length / dc_length if dc_length > 0.0 else 0.0

        # TMV — time-adjusted return over the DC leg
        if dc_length > 0.0 and event.extreme_price != 0.0:
            price_change = abs(event.confirm_price - event.extreme_price) / event.extreme_price
            tmv = price_change / dc_length
        else:
            tmv = 0.0

        # OS ratio — overshoot price move relative to threshold
        if prev_event is not None and prev_event.confirm_price != 0.0 and event.threshold > 0.0:
            os_price_move = abs(event.extreme_price - prev_event.confirm_price) / prev_event.confirm_price
            os_ratio = os_price_move / event.threshold
        else:
            os_ratio = 0.0

        indicators = DCIndicators(
            r_ratio=r_ratio,
            tmv=tmv,
            os_length=os_length,
            dc_length=dc_length,
            os_ratio=os_ratio,
            tick_count=self._tick_count,
        )

        self._history.append(indicators)
        return indicators

    def get_feature_vector(self) -> list[float]:
        """Return the most recent indicators as a flat list for RL state.

        Order: ``[r_ratio, tmv, os_length, dc_length, os_ratio, tick_count]``.

        If no indicators have been computed yet, returns a zero vector of
        the same length.

        Returns:
            A list of six floats representing the current indicator state.
        """
        if not self._history:
            return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

        latest = self._history[-1]
        return [
            latest.r_ratio,
            latest.tmv,
            latest.os_length,
            latest.dc_length,
            latest.os_ratio,
            float(latest.tick_count),
        ]

    def get_rolling_averages(self) -> DCIndicators:
        """Compute element-wise averages over the rolling window.

        Useful for smoothing noisy per-event indicators before feeding
        them into a model.

        Returns:
            A ``DCIndicators`` with each field set to the mean of the
            corresponding field across the window.  Returns a zero-valued
            instance if the window is empty.
        """
        n = len(self._history)
        if n == 0:
            return DCIndicators()

        sum_r = 0.0
        sum_tmv = 0.0
        sum_os = 0.0
        sum_dc = 0.0
        sum_osr = 0.0
        sum_tc = 0

        for ind in self._history:
            sum_r += ind.r_ratio
            sum_tmv += ind.tmv
            sum_os += ind.os_length
            sum_dc += ind.dc_length
            sum_osr += ind.os_ratio
            sum_tc += ind.tick_count

        return DCIndicators(
            r_ratio=sum_r / n,
            tmv=sum_tmv / n,
            os_length=sum_os / n,
            dc_length=sum_dc / n,
            os_ratio=sum_osr / n,
            tick_count=sum_tc // n,
        )

    def reset(self) -> None:
        """Clear all internal state."""
        self._history.clear()
        self._tick_count = 0

    @property
    def window_size(self) -> int:
        """Configured rolling window size."""
        return self._window_size

    @property
    def history_length(self) -> int:
        """Number of indicator snapshots currently stored."""
        return len(self._history)
