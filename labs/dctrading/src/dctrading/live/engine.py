"""Main trading engine — async event loop tying WS feed → DC detect → signal → risk → execute."""

from __future__ import annotations

import asyncio
import logging
import signal
import time
from typing import Any

import numpy as np
import logging
import signal
import time
from typing import Any

from dctrading.agents.zi_dct0 import ZiDCT0
from dctrading.dc.detector import DCDetector
from dctrading.dc.indicators import DCIndicatorCalculator
from dctrading.live.executor import DryRunExecutor, OrderExecutor
from dctrading.live.feed import LiveFeed
from dctrading.risk.manager import RiskManager
from dctrading.store.database import StateStore
from dctrading.types import (
    DCEvent,
    DCIndicators,
    Direction,
    Position,
    RiskLimits,
    Tick,
    TradeRecord,
    TradingAction,
)

__all__ = ["TradingEngine"]

logger = logging.getLogger(__name__)


class TradingEngine:
    """Central orchestrator for live DC-based trading.

    Consumes a real-time tick stream, detects directional changes,
    generates trading signals (via RL model or ZI-DCT0 fallback),
    validates them against risk limits, and executes orders.
    """

    def __init__(
        self,
        symbols: list[str] | None = None,
        threshold: float = 0.02,
        model_path: str | None = None,
        testnet: bool = True,
        dry_run: bool = True,
        risk_limits: RiskLimits | None = None,
        initial_capital: float = 10000.0,
        db_path: str = "data/dctrading.db",
        api_key: str = "",
        api_secret: str = "",
    ) -> None:
        self._symbols = symbols or ["BTC/USDT"]
        self._threshold = threshold
        self._model_path = model_path
        self._testnet = testnet
        self._dry_run = dry_run
        self._risk_limits = risk_limits or RiskLimits()
        self._initial_capital = initial_capital
        self._db_path = db_path
        self._api_key = api_key
        self._api_secret = api_secret

        # Components — initialised in start()
        self._feed: LiveFeed | None = None
        self._executor: OrderExecutor | DryRunExecutor | None = None
        self._store: StateStore | None = None
        self._risk: RiskManager | None = None

        # Per-symbol state
        self._detectors: dict[str, DCDetector] = {}
        self._indicators: dict[str, DCIndicatorCalculator] = {}
        self._prev_events: dict[str, DCEvent | None] = {}
        self._positions: dict[str, Position] = {}

        # RL model (lazy-loaded)
        self._rl_agent: Any = None
        self._fallback = ZiDCT0(threshold)

        # Runtime state
        self._shutdown = asyncio.Event()
        self._running = False
        self._capital = initial_capital
        self._daily_pnl = 0.0
        self._events_processed = 0
        self._trades_executed = 0

        # --- Final strategy params ---
        # Vol-trailing stop
        self._base_trail = 0.02
        self._vol_window = 4320  # 72h in minutes
        self._current_trail = self._base_trail
        self._cum_vol_sum = 0.0
        self._cum_vol_count = 0
        self._avg_vol = 0.0
        self._recent_returns: list[float] = []
        self._last_price: float = 0.0
        self._peak_price: dict[str, float] = {}

        # 60d MA regime filter with 3% buffer
        self._ma_period = 60 * 1440  # 60 days in minutes
        self._ma_buffer = 0.03
        self._price_history: list[float] = []
        self._regime: str = "bear"  # start conservative
    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def start(self) -> None:
        """Initialise all components and run the main event loop."""
        logger.info("Starting TradingEngine (dry_run=%s, testnet=%s)", self._dry_run, self._testnet)

        # Feed
        self._feed = LiveFeed(self._symbols, testnet=self._testnet)

        # Executor
        if self._dry_run:
            self._executor = DryRunExecutor()
        else:
            self._executor = OrderExecutor(
                api_key=self._api_key,
                api_secret=self._api_secret,
                testnet=self._testnet,
            )

        # Persistence
        self._store = StateStore(self._db_path)

        # Risk
        self._risk = RiskManager(self._risk_limits, self._initial_capital)

        # Per-symbol detectors and positions
        for sym in self._symbols:
            self._detectors[sym] = DCDetector(self._threshold)
            self._indicators[sym] = DCIndicatorCalculator()
            self._prev_events[sym] = None
            self._positions[sym] = Position(symbol=sym)

        # Lazy-load RL model if path provided
        if self._model_path is not None:
            try:
                from dctrading.agents.deep_rl import DeepRLAgent

                self._rl_agent = DeepRLAgent()
                self._rl_agent.load(self._model_path)
                logger.info("Loaded RL model from %s", self._model_path)
            except Exception:
                logger.exception("Failed to load RL model, falling back to ZI-DCT0")
                self._rl_agent = None

        # Register signal handlers for graceful shutdown
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, self._request_shutdown)

        self._running = True
        try:
            await self._run()
        except KeyboardInterrupt:
            logger.info("KeyboardInterrupt received")
        finally:
            await self.stop()

    async def stop(self) -> None:
        """Graceful shutdown: close feed, executor, store and log final state."""
        if not self._running:
            return
        self._running = False
        self._shutdown.set()

        logger.info("Shutting down TradingEngine...")

        if self._feed is not None:
            try:
                await self._feed.close()
            except Exception:
                logger.exception("Error closing feed")

        if self._executor is not None:
            try:
                await self._executor.close()
            except Exception:
                logger.exception("Error closing executor")

        if self._store is not None:
            try:
                await self._store.close()
            except Exception:
                logger.exception("Error closing store")

        logger.info(
            "Engine stopped — events=%d trades=%d daily_pnl=%.4f",
            self._events_processed,
            self._trades_executed,
            self._daily_pnl,
        )

    # ------------------------------------------------------------------
    # Main loop
    # ------------------------------------------------------------------

    async def _run(self) -> None:
        """Consume ticks from the feed and drive the full pipeline."""
        assert self._feed is not None  # noqa: S101

        try:
            async for tick in self._feed.stream_ticks():
                if self._shutdown.is_set():
                    break

                try:
                    await self._process_tick(tick)
                except Exception:
                    logger.exception("Error processing tick %s", tick)
        except Exception:
            if not self._shutdown.is_set():
                logger.exception("Feed stream error — attempting reconnect")

    async def _process_tick(self, tick: Tick) -> None:
        """Process a single tick through the full pipeline."""
        symbol = tick.symbol
        detector = self._detectors.get(symbol)
        if detector is None:
            return

        price = tick.price

        # --- Update vol-trailing stop params ---
        if self._last_price > 0:
            ret = np.log(price / self._last_price)
            self._recent_returns.append(ret)
            if len(self._recent_returns) > self._vol_window:
                self._recent_returns = self._recent_returns[-self._vol_window:]
            if len(self._recent_returns) >= self._vol_window:
                recent_vol = float(np.std(self._recent_returns))
                if self._cum_vol_count > 0 and self._avg_vol > 0 and recent_vol > 0:
                    vol_ratio = max(0.5, min(3.0, recent_vol / self._avg_vol))
                    self._current_trail = self._base_trail * vol_ratio
                self._cum_vol_sum += recent_vol
                self._cum_vol_count += 1
                self._avg_vol = self._cum_vol_sum / self._cum_vol_count
        self._last_price = price

        # --- Update MA regime ---
        self._price_history.append(price)
        if len(self._price_history) >= self._ma_period:
            ma = sum(self._price_history[-self._ma_period:]) / self._ma_period
            if self._regime == "bear" and price > ma * (1 + self._ma_buffer):
                self._regime = "bull"
                logger.info("Regime switch → BULL (price=%.2f > MA=%.2f × %.2f)", price, ma, 1 + self._ma_buffer)
            elif self._regime == "bull" and price < ma * (1 - self._ma_buffer):
                self._regime = "bear"
                logger.info("Regime switch → BEAR (price=%.2f < MA=%.2f × %.2f)", price, ma, 1 - self._ma_buffer)

        # --- BULL mode: hold passively ---
        if self._regime == "bull":
            position = self._positions[symbol]
            if position.is_flat:
                # Buy and hold
                assert self._risk is not None
                size = self._risk.compute_position_size(self._capital, price, DCEvent(
                    direction=Direction.UP, threshold=self._threshold,
                    extreme_price=price, extreme_time=tick.timestamp,
                    confirm_price=price, confirm_time=tick.timestamp, symbol=symbol))
                if size > 0:
                    side = "buy"
                    try:
                        assert self._executor is not None
                        await self._executor.submit_order(symbol, side, size)
                        self._positions[symbol] = Position(
                            symbol=symbol, side=Direction.UP, entry_price=price,
                            entry_time=tick.timestamp, size=size)
                        self._peak_price[symbol] = price
                        logger.info("BULL: bought %s %.6f @ %.2f", symbol, size, price)
                    except Exception:
                        logger.exception("BULL buy failed")
            return  # no DC processing in bull mode

        # --- BEAR/SIDEWAYS mode: vol-trailing stop on every tick ---
        await self._check_stop_loss(tick)

        # Feed tick to DC detector
        event = detector.process_tick(tick)
        if event is None:
            return

        # DC event detected — compute indicators
        self._events_processed += 1
        calc = self._indicators[symbol]
        prev = self._prev_events[symbol]
        indicators = calc.update(event, prev)
        self._prev_events[symbol] = event

        logger.info(
            "DC event: %s %s @ %.2f (threshold=%.4f)",
            event.direction.name,
            symbol,
            event.confirm_price,
            event.threshold,
        )

        # Persist the DC event
        if self._store is not None:
            try:
                await self._store.save_dc_event(event)
            except Exception:
                logger.exception("Failed to persist DC event")

        await self._handle_dc_event(event, indicators)

    # ------------------------------------------------------------------
    # DC event pipeline
    # ------------------------------------------------------------------

    async def _handle_dc_event(self, event: DCEvent, indicators: DCIndicators) -> None:
        """Process a DC event through signal → risk → execute."""
        symbol = event.symbol
        position = self._positions[symbol]

        # Get trading signal
        action = await self._get_signal(event, indicators)
        if action is TradingAction.HOLD:
            return

        # Risk check
        assert self._risk is not None  # noqa: S101
        approved, reason = self._risk.check_trade(
            action, position, event.confirm_price, self._capital, event,
        )
        if not approved:
            logger.info("Trade rejected by risk manager: %s", reason)
            return

        # Compute position size
        size = self._risk.compute_position_size(
            self._capital, event.confirm_price, event,
        )
        if size <= 0:
            logger.info("Position size is zero, skipping trade")
            return

        # Execute
        side = "buy" if action is TradingAction.BUY else "sell"
        try:
            assert self._executor is not None  # noqa: S101
            result = await self._executor.submit_order(symbol, side, size)
            logger.info("Order executed: %s %s %.6f %s → %s", side, symbol, size, event.confirm_price, result)
        except Exception:
            logger.exception("Order execution failed for %s %s", side, symbol)
            return

        # Update position state
        now = time.time()
        if not position.is_flat and (
            (action is TradingAction.BUY and position.side is Direction.DOWN)
            or (action is TradingAction.SELL and position.side is Direction.UP)
        ):
            # Closing existing position — record trade
            pnl = self._compute_pnl(position, event.confirm_price)
            trade = TradeRecord(
                symbol=symbol,
                side=position.side,
                entry_price=position.entry_price,
                exit_price=event.confirm_price,
                entry_time=position.entry_time,
                exit_time=now,
                size=position.size,
                pnl=pnl,
                dc_threshold=self._threshold,
            )
            self._capital += pnl
            self._daily_pnl += pnl
            self._trades_executed += 1

            logger.info("Trade closed: pnl=%.4f capital=%.2f", pnl, self._capital)

            if self._store is not None:
                try:
                    await self._store.save_trade(trade)
                except Exception:
                    logger.exception("Failed to persist trade")

        # Open new position
        new_side = Direction.UP if action is TradingAction.BUY else Direction.DOWN
        self._positions[symbol] = Position(
            symbol=symbol,
            side=new_side,
            entry_price=event.confirm_price,
            entry_time=now,
            size=size,
        )

        if self._store is not None:
            try:
                await self._store.save_position(self._positions[symbol])
            except Exception:
                logger.exception("Failed to persist position")

    # ------------------------------------------------------------------
    # Stop-loss
    # ------------------------------------------------------------------

    async def _check_stop_loss(self, tick: Tick) -> None:
        """Vol-trailing stop: exit at current_trail below peak price since entry."""
        symbol = tick.symbol
        position = self._positions.get(symbol)
        if position is None or position.is_flat:
            return
        if position.side is not Direction.UP:
            return  # long-only

        price = tick.price
        # Update peak
        peak = self._peak_price.get(symbol, position.entry_price)
        peak = max(peak, price)
        self._peak_price[symbol] = peak

        # Check trailing stop
        if self._current_trail > 0 and peak > 0:
            drop_from_peak = (peak - price) / peak
            triggered = drop_from_peak >= self._current_trail
        else:
            triggered = False

        if not triggered:
            return

        logger.warning(
            "Stop-loss triggered for %s %s @ %.2f (stop=%.2f)",
            position.side.name,
            symbol,
            tick.price,
            stop_price,
        )

        # Close position
        pnl = self._compute_pnl(position, tick.price)
        now = time.time()
        trade = TradeRecord(
            symbol=symbol,
            side=position.side,
            entry_price=position.entry_price,
            exit_price=tick.price,
            entry_time=position.entry_time,
            exit_time=now,
            size=position.size,
            pnl=pnl,
            dc_threshold=self._threshold,
        )
        self._capital += pnl
        self._daily_pnl += pnl
        self._trades_executed += 1

        logger.info("Stop-loss trade closed: pnl=%.4f capital=%.2f", pnl, self._capital)

        if self._store is not None:
            try:
                await self._store.save_trade(trade)
            except Exception:
                logger.exception("Failed to persist stop-loss trade")

        # Flatten position
        self._positions[symbol] = Position(symbol=symbol)

        if self._store is not None:
            try:
                await self._store.save_position(self._positions[symbol])
            except Exception:
                logger.exception("Failed to persist flat position")

        # Execute the closing order
        side = "sell" if position.side is Direction.UP else "buy"
        try:
            assert self._executor is not None  # noqa: S101
            await self._executor.submit_order(symbol, side, position.size)
        except Exception:
            logger.exception("Stop-loss order execution failed for %s", symbol)

    # ------------------------------------------------------------------
    # Signal generation
    # ------------------------------------------------------------------

    async def _get_signal(self, event: DCEvent, indicators: DCIndicators) -> TradingAction:
        """Get trading action from the RL model or ZI-DCT0 fallback."""
        if self._rl_agent is not None:
            try:
                calc = self._indicators[event.symbol]
                obs = calc.get_feature_vector()
                action_id = self._rl_agent.predict(obs)
                return TradingAction(action_id)
            except Exception:
                logger.exception("RL prediction failed, using fallback")

        return self._fallback.on_event(event)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _compute_pnl(position: Position, exit_price: float) -> float:
        """Compute PnL for closing a position at *exit_price*."""
        if position.side is Direction.UP:
            return (exit_price - position.entry_price) * position.size
        return (position.entry_price - exit_price) * position.size

    def _request_shutdown(self) -> None:
        """Signal handler callback to initiate graceful shutdown."""
        logger.info("Shutdown signal received")
        self._shutdown.set()

    def get_status(self) -> dict[str, Any]:
        """Return current engine state snapshot."""
        positions_summary: dict[str, dict[str, Any]] = {}
        for sym, pos in self._positions.items():
            positions_summary[sym] = {
                "side": pos.side.name if pos.side else "FLAT",
                "entry_price": pos.entry_price,
                "size": pos.size,
            }

        return {
            "running": self._running,
            "positions": positions_summary,
            "daily_pnl": round(self._daily_pnl, 4),
            "events_processed": self._events_processed,
            "trades_executed": self._trades_executed,
            "capital": round(self._capital, 2),
        }
