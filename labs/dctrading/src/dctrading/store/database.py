"""SQLite persistence layer for the DC trading system.

Uses aiosqlite with WAL mode to allow concurrent reads from the
Streamlit dashboard while the trading engine writes.
"""

from __future__ import annotations

from pathlib import Path

import aiosqlite

from dctrading.types import DCEvent, Direction, Position, TradeRecord

__all__ = ["StateStore"]

_SCHEMA = """
CREATE TABLE IF NOT EXISTS positions (
    symbol        TEXT PRIMARY KEY,
    side          TEXT,
    entry_price   REAL NOT NULL DEFAULT 0.0,
    entry_time    REAL NOT NULL DEFAULT 0.0,
    size          REAL NOT NULL DEFAULT 0.0,
    unrealized_pnl REAL NOT NULL DEFAULT 0.0,
    updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS trades (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol        TEXT NOT NULL,
    side          TEXT NOT NULL,
    entry_price   REAL NOT NULL,
    exit_price    REAL NOT NULL,
    entry_time    REAL NOT NULL,
    exit_time     REAL NOT NULL,
    size          REAL NOT NULL,
    pnl           REAL NOT NULL,
    fees          REAL NOT NULL DEFAULT 0.0,
    dc_threshold  REAL NOT NULL DEFAULT 0.0,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS dc_events (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    direction     TEXT NOT NULL,
    threshold     REAL NOT NULL,
    extreme_price REAL NOT NULL,
    extreme_time  REAL NOT NULL,
    confirm_price REAL NOT NULL,
    confirm_time  REAL NOT NULL,
    symbol        TEXT NOT NULL DEFAULT 'BTC/USDT',
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS daily_pnl (
    date          TEXT PRIMARY KEY,
    pnl           REAL NOT NULL DEFAULT 0.0,
    num_trades    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
"""


class StateStore:
    """Async SQLite store for positions, trades, DC events, and daily PnL.

    Uses WAL journal mode so the Streamlit dashboard can read while
    the trading engine writes without blocking.
    """

    def __init__(self, db_path: str = "data/dctrading.db") -> None:
        self._db_path = Path(db_path)
        self._db: aiosqlite.Connection | None = None

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def initialize(self) -> None:
        """Create the database file, enable WAL mode, and ensure tables exist."""
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._db = await aiosqlite.connect(str(self._db_path))
        await self._db.execute("PRAGMA journal_mode=WAL")
        await self._db.executescript(_SCHEMA)
        await self._db.commit()

    async def close(self) -> None:
        """Close the database connection."""
        if self._db is not None:
            await self._db.close()
            self._db = None

    async def __aenter__(self) -> StateStore:
        """Enter async context manager."""
        await self.initialize()
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object,
    ) -> None:
        """Exit async context manager."""
        await self.close()

    # ------------------------------------------------------------------
    # Positions (upsert — one row per symbol)
    # ------------------------------------------------------------------

    async def save_position(self, position: Position) -> None:
        """Upsert the current position for a symbol."""
        assert self._db is not None
        await self._db.execute(
            """
            INSERT INTO positions (symbol, side, entry_price, entry_time, size, unrealized_pnl, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            ON CONFLICT(symbol) DO UPDATE SET
                side           = excluded.side,
                entry_price    = excluded.entry_price,
                entry_time     = excluded.entry_time,
                size           = excluded.size,
                unrealized_pnl = excluded.unrealized_pnl,
                updated_at     = excluded.updated_at
            """,
            (
                position.symbol,
                position.side.name if position.side is not None else None,
                position.entry_price,
                position.entry_time,
                position.size,
                position.unrealized_pnl,
            ),
        )
        await self._db.commit()

    async def get_position(self, symbol: str) -> Position | None:
        """Load the current position for *symbol*, or ``None`` if flat/missing."""
        assert self._db is not None
        cursor = await self._db.execute(
            "SELECT symbol, side, entry_price, entry_time, size, unrealized_pnl "
            "FROM positions WHERE symbol = ?",
            (symbol,),
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        return Position(
            symbol=row[0],
            side=Direction[row[1]] if row[1] is not None else None,
            entry_price=row[2],
            entry_time=row[3],
            size=row[4],
            unrealized_pnl=row[5],
        )

    # ------------------------------------------------------------------
    # Trades
    # ------------------------------------------------------------------

    async def save_trade(self, trade: TradeRecord) -> None:
        """Insert a completed trade record."""
        assert self._db is not None
        await self._db.execute(
            """
            INSERT INTO trades (symbol, side, entry_price, exit_price, entry_time,
                                exit_time, size, pnl, fees, dc_threshold)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                trade.symbol,
                trade.side.name,
                trade.entry_price,
                trade.exit_price,
                trade.entry_time,
                trade.exit_time,
                trade.size,
                trade.pnl,
                trade.fees,
                trade.dc_threshold,
            ),
        )
        await self._db.commit()

    async def get_trades(
        self, symbol: str | None = None, limit: int = 100
    ) -> list[TradeRecord]:
        """Return recent trades, optionally filtered by *symbol*."""
        assert self._db is not None
        if symbol is not None:
            cursor = await self._db.execute(
                "SELECT symbol, side, entry_price, exit_price, entry_time, "
                "exit_time, size, pnl, fees, dc_threshold "
                "FROM trades WHERE symbol = ? ORDER BY id DESC LIMIT ?",
                (symbol, limit),
            )
        else:
            cursor = await self._db.execute(
                "SELECT symbol, side, entry_price, exit_price, entry_time, "
                "exit_time, size, pnl, fees, dc_threshold "
                "FROM trades ORDER BY id DESC LIMIT ?",
                (limit,),
            )
        rows = await cursor.fetchall()
        return [
            TradeRecord(
                symbol=r[0],
                side=Direction[r[1]],
                entry_price=r[2],
                exit_price=r[3],
                entry_time=r[4],
                exit_time=r[5],
                size=r[6],
                pnl=r[7],
                fees=r[8],
                dc_threshold=r[9],
            )
            for r in rows
        ]

    # ------------------------------------------------------------------
    # DC Events
    # ------------------------------------------------------------------

    async def save_dc_event(self, event: DCEvent) -> None:
        """Insert a confirmed DC event."""
        assert self._db is not None
        await self._db.execute(
            """
            INSERT INTO dc_events (direction, threshold, extreme_price, extreme_time,
                                   confirm_price, confirm_time, symbol)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event.direction.name,
                event.threshold,
                event.extreme_price,
                event.extreme_time,
                event.confirm_price,
                event.confirm_time,
                event.symbol,
            ),
        )
        await self._db.commit()

    async def get_dc_events(
        self, symbol: str | None = None, limit: int = 100
    ) -> list[DCEvent]:
        """Return recent DC events, optionally filtered by *symbol*."""
        assert self._db is not None
        if symbol is not None:
            cursor = await self._db.execute(
                "SELECT direction, threshold, extreme_price, extreme_time, "
                "confirm_price, confirm_time, symbol "
                "FROM dc_events WHERE symbol = ? ORDER BY id DESC LIMIT ?",
                (symbol, limit),
            )
        else:
            cursor = await self._db.execute(
                "SELECT direction, threshold, extreme_price, extreme_time, "
                "confirm_price, confirm_time, symbol "
                "FROM dc_events ORDER BY id DESC LIMIT ?",
                (limit,),
            )
        rows = await cursor.fetchall()
        return [
            DCEvent(
                direction=Direction[r[0]],
                threshold=r[1],
                extreme_price=r[2],
                extreme_time=r[3],
                confirm_price=r[4],
                confirm_time=r[5],
                symbol=r[6],
            )
            for r in rows
        ]

    # ------------------------------------------------------------------
    # Daily PnL (upsert — one row per date)
    # ------------------------------------------------------------------

    async def update_daily_pnl(
        self, date: str, pnl: float, num_trades: int
    ) -> None:
        """Upsert the daily PnL summary for *date* (``YYYY-MM-DD``)."""
        assert self._db is not None
        await self._db.execute(
            """
            INSERT INTO daily_pnl (date, pnl, num_trades)
            VALUES (?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET
                pnl        = excluded.pnl,
                num_trades = excluded.num_trades
            """,
            (date, pnl, num_trades),
        )
        await self._db.commit()

    async def get_daily_pnl(self, date: str) -> dict | None:
        """Return the daily PnL row for *date*, or ``None`` if missing."""
        assert self._db is not None
        cursor = await self._db.execute(
            "SELECT date, pnl, num_trades FROM daily_pnl WHERE date = ?",
            (date,),
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        return {"date": row[0], "pnl": row[1], "num_trades": row[2]}
