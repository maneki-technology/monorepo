"""Core types and dataclasses for the DC trading system."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto
from typing import Self


class Direction(Enum):
    """Market direction as determined by DC events."""

    UP = auto()
    DOWN = auto()

    @property
    def opposite(self) -> Self:
        return Direction.DOWN if self is Direction.UP else Direction.UP


class TradingAction(Enum):
    """Actions the RL agent can take."""

    HOLD = 0
    BUY = 1
    SELL = 2


@dataclass(frozen=True, slots=True)
class Tick:
    """A single price observation from the exchange."""

    timestamp: float  # Unix timestamp in seconds
    price: float
    volume: float = 0.0
    symbol: str = "BTC/USDT"


@dataclass(frozen=True, slots=True)
class DCEvent:
    """A confirmed Directional Change event.

    Emitted when price moves by at least `threshold` from the last extreme,
    confirming a reversal in direction.
    """

    direction: Direction  # New confirmed direction
    threshold: float  # Lambda threshold that triggered this event
    extreme_price: float  # Price at the last extreme point
    extreme_time: float  # Timestamp of the extreme point
    confirm_price: float  # Price at the confirmation point
    confirm_time: float  # Timestamp of the confirmation point
    symbol: str = "BTC/USDT"

    @property
    def magnitude(self) -> float:
        """Actual percentage move from extreme to confirmation."""
        return abs(self.confirm_price - self.extreme_price) / self.extreme_price


@dataclass(slots=True)
class DCIndicators:
    """Computed indicators from DC event history (per Tsang et al.)."""

    r_ratio: float = 0.0  # Ratio of OS length to DC length (mean reversion signal)
    tmv: float = 0.0  # Time-adjusted return of the DC trend
    os_length: float = 0.0  # Duration of the overshoot period
    dc_length: float = 0.0  # Duration of the DC confirmation period
    os_ratio: float = 0.0  # Price move during overshoot / threshold
    tick_count: int = 0  # Number of ticks in the current event period


@dataclass(slots=True)
class Position:
    """Current trading position state."""

    symbol: str = "BTC/USDT"
    side: Direction | None = None  # None = flat
    entry_price: float = 0.0
    entry_time: float = 0.0
    size: float = 0.0  # In base currency units
    unrealized_pnl: float = 0.0

    @property
    def is_flat(self) -> bool:
        return self.side is None or self.size == 0.0


@dataclass(slots=True)
class RiskLimits:
    """Risk management parameters."""

    max_position_pct: float = 0.02  # Max 2% of capital per trade
    max_drawdown_pct: float = 0.10  # 10% daily drawdown circuit breaker
    max_exposure_pct: float = 0.25  # Max 25% in any single pair
    stop_loss_multiplier: float = 2.0  # Stop-loss at 2x lambda from entry
    cash_buffer_pct: float = 0.30  # Maintain 30% cash minimum


@dataclass(slots=True)
class TradeRecord:
    """Completed trade for logging and analysis."""

    symbol: str
    side: Direction
    entry_price: float
    exit_price: float
    entry_time: float
    exit_time: float
    size: float
    pnl: float
    fees: float = 0.0
    dc_threshold: float = 0.0

    @property
    def return_pct(self) -> float:
        if self.entry_price == 0:
            return 0.0
        sign = 1.0 if self.side is Direction.UP else -1.0
        return sign * (self.exit_price - self.entry_price) / self.entry_price
