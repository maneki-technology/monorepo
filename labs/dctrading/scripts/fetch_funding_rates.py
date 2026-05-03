#!/usr/bin/env python3
"""Fetch historical BTCUSDT funding rates from Binance futures API.

Paginates through /fapi/v1/fundingRate with limit=1000 per request.
Saves to data/cache/funding_rates_btcusdt.csv
"""
import csv
import time
import urllib.request
import json
from datetime import datetime, timezone
from pathlib import Path

API_URL = "https://fapi.binance.com/fapi/v1/fundingRate"
SYMBOL = "BTCUSDT"
LIMIT = 1000
# BTCUSDT perpetual launched ~Sept 2019
START_TIME = int(datetime(2019, 9, 1, tzinfo=timezone.utc).timestamp() * 1000)
OUTPUT = Path(__file__).parent.parent / "data" / "cache" / "funding_rates_btcusdt.csv"


def fetch_page(start_time_ms: int) -> list[dict]:
    url = f"{API_URL}?symbol={SYMBOL}&startTime={start_time_ms}&limit={LIMIT}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def main():
    all_rates = []
    current_start = START_TIME
    now_ms = int(time.time() * 1000)
    page = 0

    print(f"Fetching {SYMBOL} funding rates from {datetime.fromtimestamp(START_TIME / 1000, tz=timezone.utc).date()} to now...")

    while current_start < now_ms:
        page += 1
        data = fetch_page(current_start)
        if not data:
            break
        all_rates.extend(data)
        last_time = int(data[-1]["fundingTime"])
        print(f"  Page {page}: {len(data)} records (up to {datetime.fromtimestamp(last_time / 1000, tz=timezone.utc)})")
        current_start = last_time + 1
        time.sleep(0.1)  # rate limit courtesy

    print(f"\nTotal: {len(all_rates)} funding rate records")

    # Write CSV
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "funding_rate", "mark_price"])
        for r in all_rates:
            ts = int(r["fundingTime"]) / 1000  # unix seconds
            rate = float(r["fundingRate"])
            mark = float(r.get("markPrice", 0) or 0)
            writer.writerow([ts, rate, mark])

    print(f"Saved to {OUTPUT}")

    # Quick stats
    rates = [float(r["fundingRate"]) for r in all_rates]
    print(f"\nStats:")
    print(f"  Records:  {len(rates)}")
    print(f"  Mean:     {sum(rates)/len(rates):.6f} ({sum(rates)/len(rates)*100:.4f}%)")
    print(f"  Min:      {min(rates):.6f} ({min(rates)*100:.4f}%)")
    print(f"  Max:      {max(rates):.6f} ({max(rates)*100:.4f}%)")
    extreme_pos = sum(1 for r in rates if r > 0.001)
    extreme_neg = sum(1 for r in rates if r < -0.001)
    print(f"  Extreme+: {extreme_pos} ({extreme_pos/len(rates)*100:.1f}%) > 0.1%")
    print(f"  Extreme-: {extreme_neg} ({extreme_neg/len(rates)*100:.1f}%) < -0.1%")


if __name__ == "__main__":
    main()
