"""Async WebSocket tick feed from Binance via CCXT Pro.

Provides real-time trade data as an async generator of Tick objects.
Falls back to REST polling if ccxt.pro is not installed.
"""

from __future__ import annotations

import asyncio
import logging
import time
from collections.abc import AsyncGenerator
from typing import Any

from dctrading.types import Tick

logger = logging.getLogger(__name__)

# Attempt to import ccxt.pro for WebSocket support; fall back to REST ccxt.
try:
    import ccxt.pro as ccxtpro

    _HAS_PRO = True
except ImportError:
    _HAS_PRO = False
    logger.warning(
        "ccxt.pro not available — falling back to REST polling. "
        "Install ccxt[pro] for WebSocket streaming (recommended)."
    )
    import ccxt as ccxtpro  # type-alias so the rest of the module works

__all__ = ["LiveFeed"]

_DEFAULT_SYMBOLS: list[str] = ["BTC/USDT"]
_MAX_RETRIES = 5
_BASE_BACKOFF_S = 1.0


class LiveFeed:
    """Async real-time tick feed backed by Binance WebSocket (ccxt.pro).

    Usage::

        async with LiveFeed(symbols=["BTC/USDT", "ETH/USDT"]) as feed:
            async for tick in feed.stream_ticks():
                print(tick)
    """

    def __init__(
        self,
        symbols: list[str] | None = None,
        exchange: str = "binance",
        testnet: bool = False,
    ) -> None:
        """Initialise the feed configuration.

        Args:
            symbols: Trading pairs to subscribe to. Defaults to ``["BTC/USDT"]``.
            exchange: CCXT exchange id. Defaults to ``"binance"``.
            testnet: If ``True``, connect to the Binance testnet.
        """
        self.symbols: list[str] = symbols if symbols is not None else list(_DEFAULT_SYMBOLS)
        self._exchange_id: str = exchange
        self._testnet: bool = testnet
        self._exchange: Any | None = None
        self._closed: bool = False

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def connect(self) -> None:
        """Initialise the CCXT (pro) exchange instance."""
        exchange_cls = getattr(ccxtpro, self._exchange_id, None)
        if exchange_cls is None:
            raise ValueError(f"Exchange '{self._exchange_id}' not found in ccxt")

        options: dict[str, Any] = {}
        if self._testnet:
            options["defaultType"] = "future"

        self._exchange = exchange_cls(
            {
                "enableRateLimit": True,
                "options": options,
            }
        )

        if self._testnet:
            self._exchange.set_sandbox_mode(True)

        self._closed = False
        logger.info(
            "LiveFeed connected: exchange=%s testnet=%s symbols=%s ws=%s",
            self._exchange_id,
            self._testnet,
            self.symbols,
            _HAS_PRO,
        )

    async def close(self) -> None:
        """Cleanly close the exchange / WebSocket connection."""
        self._closed = True
        if self._exchange is not None:
            await self._exchange.close()
            self._exchange = None
            logger.info("LiveFeed connection closed.")

    # ------------------------------------------------------------------
    # Streaming
    # ------------------------------------------------------------------

    async def stream_ticks(self) -> AsyncGenerator[Tick, None]:
        """Yield ``Tick`` objects from the live trade stream.

        Uses ``watch_trades`` (WebSocket) when ccxt.pro is available,
        otherwise falls back to ``fetch_trades`` REST polling.

        Reconnects automatically on transient errors with exponential
        backoff (up to ``_MAX_RETRIES`` consecutive failures).
        """
        if self._exchange is None:
            raise RuntimeError("Call connect() before streaming.")

        if _HAS_PRO:
            async for tick in self._stream_ws():
                yield tick
        else:
            async for tick in self._stream_poll():
                yield tick

    # -- WebSocket path (preferred) ------------------------------------

    async def _stream_ws(self) -> AsyncGenerator[Tick, None]:
        """Stream ticks via ccxt.pro ``watch_trades``."""
        retries = 0

        while not self._closed:
            try:
                for symbol in self.symbols:
                    assert self._exchange is not None
                    trades: list[dict[str, Any]] = await self._exchange.watch_trades(symbol)
                    for trade in trades:
                        yield self._trade_to_tick(trade, symbol)
                # Successful iteration resets the retry counter.
                retries = 0
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                retries += 1
                if retries > _MAX_RETRIES:
                    logger.error(
                        "Max retries (%d) exceeded — stopping feed.", _MAX_RETRIES
                    )
                    raise
                backoff = _BASE_BACKOFF_S * (2 ** (retries - 1))
                logger.warning(
                    "WebSocket error (%s), retry %d/%d in %.1fs",
                    exc,
                    retries,
                    _MAX_RETRIES,
                    backoff,
                )
                await asyncio.sleep(backoff)

    # -- REST polling fallback -----------------------------------------

    async def _stream_poll(self) -> AsyncGenerator[Tick, None]:
        """Fallback: poll ``fetch_trades`` when ccxt.pro is unavailable.

        Note:
            WebSocket streaming via ccxt.pro is strongly preferred for
            lower latency and reduced API rate-limit pressure.
        """
        poll_interval = 1.0  # seconds between polls
        last_trade_ids: dict[str, str | None] = {s: None for s in self.symbols}

        while not self._closed:
            for symbol in self.symbols:
                try:
                    assert self._exchange is not None
                    params: dict[str, Any] = {}
                    since_id = last_trade_ids.get(symbol)
                    if since_id is not None:
                        params["fromId"] = since_id

                    trades: list[dict[str, Any]] = await self._exchange.fetch_trades(
                        symbol, limit=100, params=params
                    )
                    for trade in trades:
                        tid = trade.get("id")
                        if tid is not None and tid == last_trade_ids.get(symbol):
                            continue
                        yield self._trade_to_tick(trade, symbol)
                        if tid is not None:
                            last_trade_ids[symbol] = tid
                except asyncio.CancelledError:
                    raise
                except Exception as exc:
                    logger.warning("Polling error for %s: %s", symbol, exc)

            await asyncio.sleep(poll_interval)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _trade_to_tick(trade: dict[str, Any], symbol: str) -> Tick:
        """Convert a CCXT trade dict to a ``Tick``."""
        ts_ms = trade.get("timestamp")
        timestamp = ts_ms / 1000.0 if ts_ms is not None else time.time()
        return Tick(
            timestamp=timestamp,
            price=float(trade.get("price", 0.0)),
            volume=float(trade.get("amount", 0.0)),
            symbol=trade.get("symbol", symbol),
        )

    # ------------------------------------------------------------------
    # Context manager
    # ------------------------------------------------------------------

    async def __aenter__(self) -> LiveFeed:
        await self.connect()
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()
