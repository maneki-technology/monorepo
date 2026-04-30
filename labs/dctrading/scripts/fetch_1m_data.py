"""Robust 1-minute data fetcher with incremental saves and resume support."""

import sys
import time
import pickle
from pathlib import Path
from datetime import datetime, timedelta

import ccxt
import pandas as pd


CACHE_DIR = Path("data/cache/1m_chunks")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

SYMBOL = "BTC/USDT"
TIMEFRAME = "1m"
LIMIT = 1000  # Binance max per request
MAX_RETRIES = 5
RETRY_DELAY = 2.0  # seconds, doubles on each retry


def fetch_chunk(exchange, since_ms: int, until_ms: int) -> pd.DataFrame:
    """Fetch all 1m candles between since_ms and until_ms with pagination and retries."""
    all_ohlcv = []
    current = since_ms

    while current < until_ms:
        for attempt in range(MAX_RETRIES):
            try:
                ohlcv = exchange.fetch_ohlcv(SYMBOL, TIMEFRAME, since=current, limit=LIMIT)
                break
            except Exception as e:
                wait = RETRY_DELAY * (2 ** attempt)
                print(f"    Retry {attempt+1}/{MAX_RETRIES} after error: {e} (waiting {wait:.0f}s)")
                time.sleep(wait)
        else:
            print(f"    FAILED after {MAX_RETRIES} retries at {current}. Saving progress and continuing.")
            break

        if not ohlcv:
            break

        all_ohlcv.extend(ohlcv)
        last_ts = ohlcv[-1][0]

        if last_ts >= until_ms:
            break

        current = last_ts + 1
        time.sleep(0.05)  # rate limit courtesy

    if not all_ohlcv:
        return pd.DataFrame(columns=["timestamp", "open", "high", "low", "close", "volume"])

    df = pd.DataFrame(all_ohlcv, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df["timestamp"] = df["timestamp"] / 1000.0
    df = df[df["timestamp"] < until_ms / 1000.0]
    return df


def generate_weeks(start_date: str, end_date: str) -> list[tuple[str, str]]:
    """Generate weekly date ranges."""
    start = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date)
    weeks = []
    current = start
    while current < end:
        week_end = min(current + timedelta(days=7), end)
        weeks.append((current.isoformat(), week_end.isoformat()))
        current = week_end
    return weeks


def chunk_path(since: str, until: str) -> Path:
    """Cache file path for a chunk."""
    s = since.replace("-", "").replace(":", "").replace("T", "")[:8]
    u = until.replace("-", "").replace(":", "").replace("T", "")[:8]
    return CACHE_DIR / f"{SYMBOL.replace('/', '_')}_{s}_{u}.parquet"


def fetch_range(exchange, start_date: str, end_date: str, label: str) -> list:
    """Fetch a full date range in weekly chunks with resume support."""
    weeks = generate_weeks(start_date, end_date)
    total = len(weeks)
    all_ticks = []
    skipped = 0
    fetched = 0

    print(f"\n{'='*60}")
    print(f"  {label}: {start_date} to {end_date} ({total} weeks)")
    print(f"{'='*60}")

    for i, (since, until) in enumerate(weeks):
        path = chunk_path(since, until)

        if path.exists():
            df = pd.read_parquet(path)
            if len(df) > 0:
                skipped += 1
                all_ticks.extend(df.values.tolist())
                if skipped % 20 == 0:
                    print(f"  [{i+1}/{total}] Cached: {since} ({len(df)} candles) [skipped {skipped} total]")
                continue

        since_ms = int(datetime.fromisoformat(since).timestamp() * 1000)
        until_ms = int(datetime.fromisoformat(until).timestamp() * 1000)

        df = fetch_chunk(exchange, since_ms, until_ms)
        fetched += 1

        if len(df) > 0:
            df.to_parquet(path, index=False)
            all_ticks.extend(df.values.tolist())

        print(f"  [{i+1}/{total}] Fetched: {since} → {len(df)} candles (total so far: {len(all_ticks):,})")
        time.sleep(0.1)

    print(f"  Done: {len(all_ticks):,} candles ({skipped} cached, {fetched} fetched)")
    return all_ticks


def to_ticks(rows: list, symbol: str = "BTC/USDT"):
    """Convert raw OHLCV rows to Tick objects."""
    from dctrading.types import Tick
    ticks = []
    for row in rows:
        ticks.append(Tick(timestamp=float(row[0]), price=float(row[4]), volume=float(row[5]), symbol=symbol))
    return ticks


def main():
    exchange = ccxt.binance()

    # --- Training data: 2019-2024 ---
    train_rows = fetch_range(exchange, "2019-01-01", "2025-01-01", "TRAINING (2019-2024)")
    train_df = pd.DataFrame(train_rows, columns=["timestamp", "open", "high", "low", "close", "volume"])
    train_df = train_df.drop_duplicates(subset="timestamp").sort_values("timestamp").reset_index(drop=True)
    train_ticks = to_ticks(train_df.values.tolist())
    print(f"\n  Train ticks: {len(train_ticks):,}")
    print(f"  Price range: ${train_df['close'].min():.2f} - ${train_df['close'].max():.2f}")
    with open("data/cache/train_2019_2024_1m.pkl", "wb") as f:
        pickle.dump(train_ticks, f)
    print("  Saved to data/cache/train_2019_2024_1m.pkl")

    # --- Test data: 2025 ---
    test_rows = fetch_range(exchange, "2025-01-01", "2026-01-01", "TESTING (2025)")
    test_df = pd.DataFrame(test_rows, columns=["timestamp", "open", "high", "low", "close", "volume"])
    test_df = test_df.drop_duplicates(subset="timestamp").sort_values("timestamp").reset_index(drop=True)
    test_ticks = to_ticks(test_df.values.tolist())
    print(f"\n  Test ticks: {len(test_ticks):,}")
    print(f"  Price range: ${test_df['close'].min():.2f} - ${test_df['close'].max():.2f}")
    with open("data/cache/test_2025_1m.pkl", "wb") as f:
        pickle.dump(test_ticks, f)
    print("  Saved to data/cache/test_2025_1m.pkl")

    bh = (test_ticks[-1].price - test_ticks[0].price) / test_ticks[0].price * 100
    print(f"\n  Buy&Hold 2025: {bh:+.2f}%")
    print("\nAll data fetched successfully.")


if __name__ == "__main__":
    main()
