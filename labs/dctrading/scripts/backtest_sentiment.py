#!/usr/bin/env python3
"""Backtest sentiment filter against historical trades using Alpaca news + local MLX scoring.

For each trade from the 3-regime backtest, fetches news from 2h before entry,
scores with Qwen3.5, and evaluates whether the sentiment filter would improve returns.
"""

import json
import os
import pickle
import sys
import time
from datetime import datetime, timezone, timedelta

sys.path.insert(0, "scripts")

import numpy as np
from backtest_fast import detect_dc_events, compute_ma, compute_vol_trail

from dctrading.sentiment import AlpacaNews, MLXLocalScorer
from dctrading.sentiment.news_client import NewsItem


def extract_trades(prices, timestamps, threshold=0.07, ma_buffer=0.03, trail_pct=0.02, capital=1000.0):
    """Run 3-regime strategy and extract trade details."""
    ma_period = 60 * 24 * 60
    trail_window = 72 * 60
    fee_pct = 0.001

    dc_events = detect_dc_events(prices, threshold)
    ma = compute_ma(prices, ma_period)
    trail_pcts = compute_vol_trail(prices, trail_window, trail_pct)

    n = len(prices)
    in_position = False
    entry_price = 0.0
    entry_time = 0.0
    size = 0.0
    peak_price = 0.0
    regime = 0  # 0=bear, 1=bull, 2=sideways
    trades = []

    for i in range(n):
        p = prices[i]
        t = timestamps[i]

        if not np.isnan(ma[i]):
            upper = ma[i] * (1.0 + ma_buffer)
            lower = ma[i] * (1.0 - ma_buffer)
            if p > upper: regime = 1
            elif p < lower: regime = 0
            else: regime = 2

        if regime == 1:
            if not in_position:
                fee = capital * fee_pct
                size = (capital - fee) / p
                entry_price = p
                entry_time = t
                peak_price = p
                in_position = True
            continue

        if regime == 0 and in_position:
            if p > peak_price: peak_price = p
            if trail_pcts[i] > 0 and peak_price > 0:
                drop = (peak_price - p) / peak_price
                if drop >= trail_pcts[i]:
                    raw = (p - entry_price) * size
                    fee = size * p * fee_pct
                    net = raw - fee
                    trades.append({
                        'entry_time': entry_time, 'entry_price': entry_price,
                        'exit_time': t, 'exit_price': p, 'pnl': net,
                        'exit_type': 'trail', 'regime': 'bear',
                    })
                    capital += net
                    in_position = False
                    continue

        if regime in (0, 2):
            ev = dc_events[i]
            if ev == 1 and not in_position:
                fee = capital * fee_pct
                size = (capital - fee) / p
                entry_price = p
                entry_time = t
                peak_price = p
                in_position = True
            elif ev == -1 and in_position:
                raw = (p - entry_price) * size
                fee = size * p * fee_pct
                net = raw - fee
                r = 'bear' if regime == 0 else 'sideways'
                trades.append({
                    'entry_time': entry_time, 'entry_price': entry_price,
                    'exit_time': t, 'exit_price': p, 'pnl': net,
                    'exit_type': 'dc', 'regime': r,
                })
                capital += net
                in_position = False

    return trades


def main():
    # Load 2024-2025 tick data
    with open("data/cache/train_2019_2024_1m.pkl", "rb") as f:
        all_ticks = pickle.load(f)
    with open("data/cache/test_2025_1m.pkl", "rb") as f:
        ticks_2025 = pickle.load(f)

    ticks_24 = [t for t in all_ticks if datetime.fromtimestamp(t.timestamp, tz=timezone.utc).year == 2024]
    ticks = ticks_24 + ticks_2025
    print(f"Loaded {len(ticks):,} ticks (2024-2025)")

    prices = np.array([t.price for t in ticks], dtype=np.float64)
    timestamps = np.array([t.timestamp for t in ticks], dtype=np.float64)

    trades = extract_trades(prices, timestamps)
    print(f"Extracted {len(trades)} trades")
    print(f"  Winners: {sum(1 for t in trades if t['pnl'] > 0)}")
    print(f"  Losers:  {sum(1 for t in trades if t['pnl'] <= 0)}")
    print(f"  Total PnL: ${sum(t['pnl'] for t in trades):,.2f}")
    print()

    # Init clients
    news_client = AlpacaNews()
    print("Loading MLX model...")
    scorer = MLXLocalScorer()
    print("Model loaded.\n")

    # Score each trade
    results = []
    for i, tr in enumerate(trades):
        entry_dt = datetime.fromtimestamp(tr['entry_time'], tz=timezone.utc)
        sign = '+' if tr['pnl'] > 0 else ''

        # Skip trades before 2024 (no Alpaca news)
        if entry_dt.year < 2024:
            continue

        print(f"[{i+1}/{len(trades)}] {entry_dt.strftime('%Y-%m-%d %H:%M')} pnl={sign}${tr['pnl']:,.2f} [{tr['exit_type']}]")

        # Fetch news from 2h before entry
        start = (entry_dt - timedelta(hours=2)).strftime('%Y-%m-%dT%H:%M:%SZ')
        end = entry_dt.strftime('%Y-%m-%dT%H:%M:%SZ')

        try:
            items = news_client.fetch(symbols="BTC/USD", limit=15)
            # Use start/end params via raw request for historical
            import requests
            resp = requests.get(
                "https://data.alpaca.markets/v1beta1/news",
                params={"symbols": "BTC/USD", "start": start, "end": end, "limit": 15, "sort": "desc"},
                headers={
                    "APCA-API-KEY-ID": os.environ["ALPACA_API_KEY"],
                    "APCA-API-SECRET-KEY": os.environ["ALPACA_API_SECRET"],
                },
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            items = []
            for article in data.get("news", []):
                pub_str = article.get("created_at", "")
                try:
                    pub = datetime.fromisoformat(pub_str.replace("Z", "+00:00"))
                except (ValueError, AttributeError):
                    pub = datetime.now(timezone.utc)
                items.append(NewsItem(
                    title=article.get("headline", ""),
                    summary=article.get("summary", "") or "",
                    source=article.get("source", ""),
                    published_at=pub,
                    url=article.get("url", ""),
                ))
            print(f"  Fetched {len(items)} articles")
        except Exception as e:
            print(f"  News fetch failed: {e}")
            items = []

        if items:
            result = scorer.score(items)
            conf = abs(result.directional_score)
            if conf >= 0.7:
                action = "FULL"
            elif conf >= 0.4:
                action = "HALF"
            else:
                action = "SKIP"
            print(f"  LLM: {result.sentiment} conf={result.confidence:.2f} mat={result.materiality:.2f} → {action}")
        else:
            result = None
            action = "NO_DATA"
            print(f"  No news data")

        results.append({
            'trade_idx': i,
            'entry_date': entry_dt.strftime('%Y-%m-%d %H:%M'),
            'pnl': tr['pnl'],
            'exit_type': tr['exit_type'],
            'regime': tr['regime'],
            'sentiment': result.sentiment if result else 'unknown',
            'confidence': result.confidence if result else 0,
            'materiality': result.materiality if result else 0,
            'directional_score': result.directional_score if result else 0,
            'action': action,
            'news_count': len(items),
        })
        print()

    # Analysis
    print("=" * 80)
    print("SENTIMENT FILTER BACKTEST RESULTS")
    print("=" * 80)

    original_pnl = sum(r['pnl'] for r in results)
    filtered_pnl = 0
    skipped_trades = []
    halved_trades = []
    full_trades = []

    for r in results:
        if r['action'] == 'SKIP':
            skipped_trades.append(r)
        elif r['action'] == 'HALF':
            halved_trades.append(r)
            filtered_pnl += r['pnl'] * 0.5
        elif r['action'] == 'FULL':
            full_trades.append(r)
            filtered_pnl += r['pnl']
        else:
            filtered_pnl += r['pnl']  # no data = take trade

    print(f"\n  Total trades scored:  {len(results)}")
    print(f"  FULL positions:       {len(full_trades)}")
    print(f"  HALF positions:       {len(halved_trades)}")
    print(f"  SKIPPED:              {len(skipped_trades)}")
    print(f"\n  Original PnL:         ${original_pnl:,.2f}")
    print(f"  Filtered PnL:         ${filtered_pnl:,.2f}")
    print(f"  Improvement:          ${filtered_pnl - original_pnl:+,.2f}")

    # Breakdown
    print(f"\n  SKIPPED trades breakdown:")
    skipped_winners = [r for r in skipped_trades if r['pnl'] > 0]
    skipped_losers = [r for r in skipped_trades if r['pnl'] <= 0]
    print(f"    Losers avoided:     {len(skipped_losers)} (saved ${abs(sum(r['pnl'] for r in skipped_losers)):,.2f})")
    print(f"    Winners missed:     {len(skipped_winners)} (missed ${sum(r['pnl'] for r in skipped_winners):,.2f})")

    print(f"\n  HALVED trades breakdown:")
    halved_winners = [r for r in halved_trades if r['pnl'] > 0]
    halved_losers = [r for r in halved_trades if r['pnl'] <= 0]
    print(f"    Losers halved:      {len(halved_losers)} (saved ${abs(sum(r['pnl'] for r in halved_losers)) * 0.5:,.2f})")
    print(f"    Winners halved:     {len(halved_winners)} (lost ${sum(r['pnl'] for r in halved_winners) * 0.5:,.2f})")

    # Per-trade detail
    print(f"\n  {'Date':<18} {'PnL':>10} {'Sentiment':>10} {'Score':>8} {'Action':>8}")
    print("  " + "-" * 60)
    for r in results:
        sign = '+' if r['pnl'] > 0 else ''
        print(f"  {r['entry_date']:<18} {sign}${r['pnl']:>8,.2f} {r['sentiment']:>10} {r['directional_score']:>+8.3f} {r['action']:>8}")

    # Save results
    with open("/tmp/sentiment_backtest_alpaca.json", "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved to /tmp/sentiment_backtest_alpaca.json")


if __name__ == "__main__":
    main()
