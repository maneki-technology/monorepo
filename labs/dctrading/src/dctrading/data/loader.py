"""Historical data loader for fetching and caching OHLCV and tick-level data from Binance."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

import ccxt
import pandas as pd
import ccxt
import pandas as pd

from dctrading.types import Tick

__all__ = ["DataLoader"]


class DataLoader:
    """Fetches and caches historical OHLCV and tick-level data from Binance."""

    def __init__(self, cache_dir: str = "data/cache", exchange: str = "binance") -> None:
        """Initialize DataLoader with cache directory and exchange.

        Args:
            cache_dir: Directory to cache Parquet files. Created if it doesn't exist.
            exchange: Exchange name (default: "binance").
        """
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.exchange_name = exchange
        self.exchange = getattr(ccxt, exchange)()

    def _parse_date(self, date_str: str) -> float:
        """Parse ISO date string to Unix timestamp in milliseconds.

        Args:
            date_str: ISO date string like "2024-01-01".

        Returns:
            Unix timestamp in milliseconds.
        """
        dt = datetime.fromisoformat(date_str)
        return int(dt.timestamp() * 1000)

    def _get_cache_path(self, symbol: str, timeframe: str, since: str, until: str | None) -> Path:
        """Generate cache file path based on symbol, timeframe, and date range.

        Args:
            symbol: Trading pair symbol (e.g., "BTC/USDT").
            timeframe: Timeframe (e.g., "1m", "1h").
            since: Start date as ISO string.
            until: End date as ISO string or None.

        Returns:
            Path to cache file.
        """
        until_str = until or "latest"
        cache_name = f"{symbol.replace('/', '_')}_{timeframe}_{since}_{until_str}.parquet"
        return self.cache_dir / cache_name

    def fetch_ohlcv(
        self,
        symbol: str,
        timeframe: str,
        since: str,
        until: str | None = None,
        limit: int = 1000,
    ) -> pd.DataFrame:
        """Fetch OHLCV data from Binance via CCXT with caching.

        Args:
            symbol: Trading pair symbol (e.g., "BTC/USDT").
            timeframe: Timeframe (e.g., "1m", "1h", "1d").
            since: Start date as ISO string (e.g., "2024-01-01").
            until: End date as ISO string or None for latest.
            limit: Max candles per API call (default: 1000).

        Returns:
            DataFrame with columns: timestamp, open, high, low, close, volume.
        """
        cache_path = self._get_cache_path(symbol, timeframe, since, until)

        # Check if cached file exists and covers the requested range
        if cache_path.exists():
            df = pd.read_parquet(cache_path)
            if len(df) > 0:
                return df

        # Fetch from Binance with pagination
        since_ms = self._parse_date(since)
        until_ms = self._parse_date(until) if until else None

        all_ohlcv = []
        current_since = since_ms

        while True:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, since=current_since, limit=limit)

            if not ohlcv:
                break

            all_ohlcv.extend(ohlcv)

            # Check if we've reached the until date
            last_timestamp = ohlcv[-1][0]
            if until_ms and last_timestamp >= until_ms:
                break

            # Move to next batch
            current_since = ohlcv[-1][0] + 1

        # Convert to DataFrame
        df = pd.DataFrame(
            all_ohlcv,
            columns=["timestamp", "open", "high", "low", "close", "volume"],
        )

        # Convert timestamp from milliseconds to seconds
        df["timestamp"] = df["timestamp"] / 1000.0

        # Filter by until date if specified
        if until_ms:
            df = df[df["timestamp"] <= until_ms / 1000.0]

        # Cache as Parquet
        df.to_parquet(cache_path, index=False)

        return df

    def ohlcv_to_ticks(self, df: pd.DataFrame, symbol: str = "BTC/USDT") -> list[Tick]:
        """Convert OHLCV DataFrame to Tick objects.

        Each candle becomes one Tick at the candle's timestamp with the close price and volume.

        Args:
            df: DataFrame with columns: timestamp, open, high, low, close, volume.
            symbol: Trading pair symbol (default: "BTC/USDT").

        Returns:
            List of Tick objects.
        """
        ticks = []
        for _, row in df.iterrows():
            tick = Tick(
                timestamp=row["timestamp"],
                price=row["close"],
                volume=row["volume"],
                symbol=symbol,
            )
            ticks.append(tick)
        return ticks

    def fetch_ticks(self, symbol: str, since: str, until: str | None = None) -> list[Tick]:
        """Fetch tick-level data from Binance and convert to Tick objects.

        Convenience method that fetches 1m OHLCV and converts to ticks for best granularity.

        Args:
            symbol: Trading pair symbol (e.g., "BTC/USDT").
            since: Start date as ISO string (e.g., "2024-01-01").
            until: End date as ISO string or None for latest.

        Returns:
            List of Tick objects.
        """
        df = self.fetch_ohlcv(symbol, "1m", since, until)
        return self.ohlcv_to_ticks(df, symbol)

    def load_csv(self, path: str, symbol: str = "BTC/USDT") -> list[Tick]:
        """Load tick data from a CSV file.

        Supports both Unix timestamps and ISO date strings in the timestamp column.

        Args:
            path: Path to CSV file with columns: timestamp, price, volume.
            symbol: Trading pair symbol (default: "BTC/USDT").

        Returns:
            List of Tick objects.
        """
        df = pd.read_csv(path)

        ticks = []
        for _, row in df.iterrows():
            # Parse timestamp: try Unix timestamp first, then ISO string
            ts = row["timestamp"]
            if isinstance(ts, str):
                try:
                    # Try ISO format
                    dt = datetime.fromisoformat(ts)
                    timestamp = dt.timestamp()
                except ValueError:
                    # Try Unix timestamp as string
                    timestamp = float(ts)
            else:
                timestamp = float(ts)

            tick = Tick(
                timestamp=timestamp,
                price=float(row["price"]),
                volume=float(row.get("volume", 0.0)),
                symbol=symbol,
            )
            ticks.append(tick)

        return ticks
