"""Async order executor for live and paper trading via CCXT.

Provides ``OrderExecutor`` for real order submission and ``DryRunExecutor``
for paper trading that logs every action without touching the exchange.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from dctrading.types import Direction, Position, TradeRecord, TradingAction

logger = logging.getLogger(__name__)

try:
    import ccxt.pro as ccxtpro

    _HAS_PRO = True
except ImportError:
    _HAS_PRO = False
    import ccxt as ccxtpro

__all__ = ["OrderExecutor", "DryRunExecutor"]


class OrderExecutor:
    """Submit orders to Binance (live or testnet) via the CCXT async API.

    Usage::

        async with OrderExecutor(api_key="...", api_secret="...") as exe:
            resp = await exe.submit_order("BTC/USDT", "buy", 0.001)
            print(resp)
    """

    def __init__(
        self,
        exchange: str = "binance",
        testnet: bool = True,
        api_key: str = "",
        api_secret: str = "",
    ) -> None:
        """Initialise executor configuration.

        Args:
            exchange: CCXT exchange id.
            testnet: Use sandbox / testnet endpoints (``True`` by default for safety).
            api_key: Exchange API key. Never hardcode — pass at runtime.
            api_secret: Exchange API secret.
        """
        self._exchange_id: str = exchange
        self._testnet: bool = testnet
        self._api_key: str = api_key
        self._api_secret: str = api_secret
        self._exchange: Any | None = None

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def connect(self) -> None:
        """Initialise the CCXT exchange instance with credentials."""
        exchange_cls = getattr(ccxtpro, self._exchange_id, None)
        if exchange_cls is None:
            raise ValueError(f"Exchange '{self._exchange_id}' not found in ccxt")

        self._exchange = exchange_cls(
            {
                "apiKey": self._api_key,
                "secret": self._api_secret,
                "enableRateLimit": True,
            }
        )

        if self._testnet:
            self._exchange.set_sandbox_mode(True)

        logger.info(
            "OrderExecutor connected: exchange=%s testnet=%s",
            self._exchange_id,
            self._testnet,
        )

    async def close(self) -> None:
        """Close the exchange connection and release resources."""
        if self._exchange is not None:
            await self._exchange.close()
            self._exchange = None
            logger.info("OrderExecutor connection closed.")

    # ------------------------------------------------------------------
    # Order operations
    # ------------------------------------------------------------------

    async def submit_order(
        self,
        symbol: str,
        side: str,
        amount: float,
        order_type: str = "market",
        price: float | None = None,
    ) -> dict[str, Any]:
        """Submit an order to the exchange.

        Args:
            symbol: Trading pair, e.g. ``"BTC/USDT"``.
            side: ``"buy"`` or ``"sell"``.
            amount: Order size in base currency units.
            order_type: ``"market"`` or ``"limit"``.
            price: Required for limit orders; ignored for market orders.

        Returns:
            The raw CCXT order response dictionary.

        Raises:
            RuntimeError: If the executor is not connected.
            ccxt.BaseError: On exchange-level failures.
        """
        if self._exchange is None:
            raise RuntimeError("Call connect() before submitting orders.")

        logger.info(
            "Submitting %s %s order: symbol=%s amount=%.8f price=%s",
            order_type,
            side,
            symbol,
            amount,
            price,
        )

        try:
            response: dict[str, Any] = await self._exchange.create_order(
                symbol=symbol,
                type=order_type,
                side=side,
                amount=amount,
                price=price,
            )
            logger.info(
                "Order filled: id=%s status=%s filled=%.8f avg_price=%s",
                response.get("id"),
                response.get("status"),
                response.get("filled", 0.0),
                response.get("average"),
            )
            return response
        except Exception as exc:
            logger.error("Order submission failed: %s", exc)
            raise

    async def cancel_order(self, order_id: str, symbol: str) -> dict[str, Any]:
        """Cancel an open order.

        Args:
            order_id: Exchange order id to cancel.
            symbol: Trading pair the order belongs to.

        Returns:
            The CCXT cancellation response dictionary.
        """
        if self._exchange is None:
            raise RuntimeError("Call connect() before cancelling orders.")

        logger.info("Cancelling order: id=%s symbol=%s", order_id, symbol)
        try:
            response: dict[str, Any] = await self._exchange.cancel_order(order_id, symbol)
            logger.info("Order cancelled: id=%s", order_id)
            return response
        except Exception as exc:
            logger.error("Cancel failed for order %s: %s", order_id, exc)
            raise

    async def get_balance(self, currency: str = "USDT") -> float:
        """Fetch the free balance for a given currency.

        Args:
            currency: Currency code, e.g. ``"USDT"``, ``"BTC"``.

        Returns:
            Available (free) balance as a float.
        """
        if self._exchange is None:
            raise RuntimeError("Call connect() before querying balance.")

        try:
            balance: dict[str, Any] = await self._exchange.fetch_balance()
            free: float = float(balance.get(currency, {}).get("free", 0.0))
            logger.info("Balance for %s: %.8f", currency, free)
            return free
        except Exception as exc:
            logger.error("Failed to fetch balance for %s: %s", currency, exc)
            raise

    async def get_position(self, symbol: str) -> dict[str, Any]:
        """Fetch the current position for a symbol.

        Args:
            symbol: Trading pair, e.g. ``"BTC/USDT"``.

        Returns:
            Position information dictionary from the exchange.
        """
        if self._exchange is None:
            raise RuntimeError("Call connect() before querying positions.")

        try:
            positions: list[dict[str, Any]] = await self._exchange.fetch_positions([symbol])
            for pos in positions:
                if pos.get("symbol") == symbol:
                    logger.info("Position for %s: %s", symbol, pos)
                    return pos
            logger.info("No open position for %s", symbol)
            return {}
        except Exception as exc:
            logger.error("Failed to fetch position for %s: %s", symbol, exc)
            raise

    # ------------------------------------------------------------------
    # Context manager
    # ------------------------------------------------------------------

    async def __aenter__(self) -> OrderExecutor:
        await self.connect()
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.close()


# ======================================================================
# Dry-run (paper trading) executor
# ======================================================================


class DryRunExecutor(OrderExecutor):
    """Paper-trading executor that logs every action without hitting the exchange.

    Mirrors the ``OrderExecutor`` interface so it can be used as a drop-in
    replacement during backtesting or paper-trading phases.

    Usage::

        async with DryRunExecutor() as exe:
            resp = await exe.submit_order("BTC/USDT", "buy", 0.001)
            # Nothing is sent to the exchange; the order is only logged.
    """

    def __init__(
        self,
        exchange: str = "binance",
        testnet: bool = True,
        api_key: str = "",
        api_secret: str = "",
        initial_balance: float = 10_000.0,
    ) -> None:
        """Initialise the dry-run executor.

        Args:
            exchange: Exchange id (used only for logging context).
            testnet: Ignored — no real connection is made.
            api_key: Ignored.
            api_secret: Ignored.
            initial_balance: Simulated starting balance in quote currency.
        """
        super().__init__(
            exchange=exchange,
            testnet=testnet,
            api_key=api_key,
            api_secret=api_secret,
        )
        self._initial_balance: float = initial_balance
        self._simulated_balance: float = initial_balance
        self._order_counter: int = 0
        self._open_orders: dict[str, dict[str, Any]] = {}
        self._positions: dict[str, dict[str, Any]] = {}

    # ------------------------------------------------------------------
    # Lifecycle (no-ops — no real connection needed)
    # ------------------------------------------------------------------

    async def connect(self) -> None:
        """No-op: dry-run executor does not connect to an exchange."""
        logger.info(
            "[DRY RUN] Executor ready (exchange=%s, simulated balance=%.2f)",
            self._exchange_id,
            self._simulated_balance,
        )

    async def close(self) -> None:
        """No-op: nothing to close."""
        logger.info("[DRY RUN] Executor closed.")

    # ------------------------------------------------------------------
    # Simulated order operations
    # ------------------------------------------------------------------

    async def submit_order(
        self,
        symbol: str,
        side: str,
        amount: float,
        order_type: str = "market",
        price: float | None = None,
    ) -> dict[str, Any]:
        """Log the order without submitting it.

        Returns a synthetic order response that mirrors the CCXT structure.
        """
        self._order_counter += 1
        order_id = f"dry-{self._order_counter}"
        now = time.time()

        response: dict[str, Any] = {
            "id": order_id,
            "symbol": symbol,
            "type": order_type,
            "side": side,
            "amount": amount,
            "price": price,
            "filled": amount,
            "remaining": 0.0,
            "status": "closed",
            "average": price,
            "timestamp": int(now * 1000),
            "datetime": None,
            "info": {"dry_run": True},
        }

        logger.info(
            "[DRY RUN] %s %s order: symbol=%s amount=%.8f price=%s → id=%s",
            order_type,
            side,
            symbol,
            amount,
            price,
            order_id,
        )
        return response

    async def cancel_order(self, order_id: str, symbol: str) -> dict[str, Any]:
        """Log the cancellation without touching the exchange."""
        logger.info("[DRY RUN] Cancel order: id=%s symbol=%s", order_id, symbol)
        return {"id": order_id, "status": "canceled", "info": {"dry_run": True}}

    async def get_balance(self, currency: str = "USDT") -> float:
        """Return the simulated balance."""
        logger.info(
            "[DRY RUN] Balance for %s: %.8f", currency, self._simulated_balance
        )
        return self._simulated_balance

    async def get_position(self, symbol: str) -> dict[str, Any]:
        """Return the simulated position (empty by default)."""
        pos = self._positions.get(symbol, {})
        logger.info("[DRY RUN] Position for %s: %s", symbol, pos or "flat")
        return pos
