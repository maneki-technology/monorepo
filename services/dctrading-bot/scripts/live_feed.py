#!/usr/bin/env python3
"""Pipe Binance WebSocket ticks to stdout as CSV lines.

Usage:
    python3 scripts/live_feed.py | ./zig-out/bin/dctrading -
    python3 scripts/live_feed.py BTC/USDT | ./zig-out/bin/dctrading - 0.07 10000
"""
import sys
import time
import ccxt

def main():
    symbol = sys.argv[1] if len(sys.argv) > 1 else "BTC/USDT"
    exchange = ccxt.binance()

    print(f"# Streaming {symbol} ticks to stdout...", file=sys.stderr)
    print(f"# Pipe to: ./zig-out/bin/dctrading -", file=sys.stderr)

    last_id = None
    while True:
        try:
            trades = exchange.fetch_trades(symbol, limit=50)
            for t in trades:
                if last_id and t["id"] <= last_id:
                    continue
                ts = t["timestamp"] / 1000.0
                price = t["price"]
                volume = t["amount"]
                line = f"{ts},{price},{volume}"
                print(line, flush=True)
                last_id = t["id"]
            time.sleep(1)
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"# Error: {e}", file=sys.stderr)
            time.sleep(5)

if __name__ == "__main__":
    main()
