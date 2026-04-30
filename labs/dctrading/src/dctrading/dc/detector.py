"""Directional Change event detector (Aloud, Tsang, Olsen, Dupuis 2012).

Processes a stream of Tick objects one at a time and emits DCEvent objects
when a directional change is confirmed — i.e. when price moves by at least
lambda from the last extreme point.
"""

from __future__ import annotations

from dctrading.types import DCEvent, Direction, Tick

__all__ = ["DCDetector"]


class DCDetector:
    """Streaming DC event detector with asymmetric threshold support.

    Tracks the current market mode (UP or DOWN), maintains the last extreme
    price/time, and emits a DCEvent whenever price reverses by at least the
    configured threshold from that extreme.

    Args:
        threshold: Default lambda threshold for both directions.
        up_threshold: Override threshold for detecting upward reversals.
            Defaults to *threshold* if not provided.
        down_threshold: Override threshold for detecting downward reversals.
            Defaults to *threshold* if not provided.
    """

    def __init__(
        self,
        threshold: float,
        up_threshold: float | None = None,
        down_threshold: float | None = None,
    ) -> None:
        self._threshold = threshold
        self._up_threshold = up_threshold if up_threshold is not None else threshold
        self._down_threshold = down_threshold if down_threshold is not None else threshold

        # Mutable state — initialised on first tick via reset()
        self._direction: Direction | None = None
        self._extreme_price: float = 0.0
        self._extreme_time: float = 0.0
        self._tick_count: int = 0
        self._initialised: bool = False

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def process_tick(self, tick: Tick) -> DCEvent | None:
        """Feed a single tick and return a DCEvent if a reversal is confirmed.

        On the very first tick the detector seeds its internal state and
        returns ``None``.  Subsequent ticks are compared against the current
        extreme; if the move exceeds the active threshold a DCEvent is emitted
        and the detector flips direction.

        Args:
            tick: The incoming price observation.

        Returns:
            A ``DCEvent`` if a directional change was confirmed, otherwise
            ``None``.
        """
        if not self._initialised:
            self._seed(tick)
            return None

        self._tick_count += 1

        if self._direction is Direction.UP:
            return self._process_up_mode(tick)
        return self._process_down_mode(tick)

    def reset(self) -> None:
        """Clear all internal state so the detector can be reused."""
        self._direction = None
        self._extreme_price = 0.0
        self._extreme_time = 0.0
        self._tick_count = 0
        self._initialised = False

    @property
    def direction(self) -> Direction | None:
        """Current market direction tracked by the detector."""
        return self._direction

    @property
    def extreme_price(self) -> float:
        """Price at the current extreme point."""
        return self._extreme_price

    @property
    def extreme_time(self) -> float:
        """Timestamp of the current extreme point."""
        return self._extreme_time

    @property
    def tick_count(self) -> int:
        """Number of ticks processed since the last DC event (or start)."""
        return self._tick_count

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _seed(self, tick: Tick) -> None:
        """Initialise state from the very first tick."""
        self._extreme_price = tick.price
        self._extreme_time = tick.timestamp
        self._direction = Direction.UP  # arbitrary; first real event corrects it
        self._tick_count = 0
        self._initialised = True

    def _process_up_mode(self, tick: Tick) -> DCEvent | None:
        """Handle a tick while in UP mode (tracking a rising extreme).

        Updates the extreme if price makes a new high.  If price drops by
        >= down_threshold from the extreme, emit a DOWN DCEvent.
        """
        if tick.price > self._extreme_price:
            self._extreme_price = tick.price
            self._extreme_time = tick.timestamp
            return None

        # Check for downward reversal
        if self._extreme_price == 0.0:
            return None

        drop = (self._extreme_price - tick.price) / self._extreme_price
        if drop >= self._down_threshold:
            event = DCEvent(
                direction=Direction.DOWN,
                threshold=self._down_threshold,
                extreme_price=self._extreme_price,
                extreme_time=self._extreme_time,
                confirm_price=tick.price,
                confirm_time=tick.timestamp,
                symbol=tick.symbol,
            )
            # Flip direction; new extreme starts at confirmation price
            self._direction = Direction.DOWN
            self._extreme_price = tick.price
            self._extreme_time = tick.timestamp
            self._tick_count = 0
            return event

        return None

    def _process_down_mode(self, tick: Tick) -> DCEvent | None:
        """Handle a tick while in DOWN mode (tracking a falling extreme).

        Updates the extreme if price makes a new low.  If price rises by
        >= up_threshold from the extreme, emit an UP DCEvent.
        """
        if tick.price < self._extreme_price:
            self._extreme_price = tick.price
            self._extreme_time = tick.timestamp
            return None

        # Check for upward reversal
        if self._extreme_price == 0.0:
            return None

        rise = (tick.price - self._extreme_price) / self._extreme_price
        if rise >= self._up_threshold:
            event = DCEvent(
                direction=Direction.UP,
                threshold=self._up_threshold,
                extreme_price=self._extreme_price,
                extreme_time=self._extreme_time,
                confirm_price=tick.price,
                confirm_time=tick.timestamp,
                symbol=tick.symbol,
            )
            # Flip direction; new extreme starts at confirmation price
            self._direction = Direction.UP
            self._extreme_price = tick.price
            self._extreme_time = tick.timestamp
            self._tick_count = 0
            return event

        return None
