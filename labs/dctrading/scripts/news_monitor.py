#!/usr/bin/env python3
"""Real-time BTC news monitor — Alpaca WS → MLX sentiment → Telegram.

Connects to Alpaca news WebSocket, scores each article with local Qwen3.5,
and sends a Telegram notification with sentiment analysis.

Usage:
    python scripts/news_monitor.py

Env vars required:
    ALPACA_API_KEY, ALPACA_API_SECRET
    TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
    NTFY_TOPIC (optional)
"""

import json
import os
import sys
import time
import threading
import requests
import websocket

# Lazy-load MLX scorer (takes a few seconds to load model)
_scorer = None

def get_scorer():
    global _scorer
    if _scorer is None:
        from dctrading.sentiment import MLXLocalScorer
        print("[news] Loading Qwen3.5-9B-4bit...")
        _scorer = MLXLocalScorer()
        print("[news] Model loaded.")
    return _scorer


def send_telegram(text: str) -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
    if not token or not chat_id:
        return
    try:
        requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text},
            timeout=10,
        )
    except Exception as e:
        print(f"[telegram] Error: {e}")


def send_ntfy(text: str) -> None:
    topic = os.environ.get("NTFY_TOPIC", "")
    if not topic:
        return
    try:
        requests.post(
            f"https://ntfy.sh/{topic}",
            data=text.encode(),
            headers={"Title": "DCT News"},
            timeout=10,
        )
    except Exception as e:
        print(f"[ntfy] Error: {e}")


def score_and_notify(article: dict) -> None:
    """Score a news article and send notifications."""
    headline = article.get("headline", "")
    summary = article.get("summary", "")
    source = article.get("source", "")
    symbols = article.get("symbols", [])
    created = article.get("created_at", "")[:19]

    # Only process if crypto-related
    crypto_symbols = {"BTC", "BTCUSD", "BTC/USD", "ETH", "ETHUSD", "ETH/USD", "SOL", "SOLUSD", "SOL/USD", "BNB", "BNBUSD", "BNB/USD"}
    if not any(s in crypto_symbols for s in symbols):
        return

    print(f"\n[news] [{source}] {headline[:80]}")

    # Score with MLX
    from dctrading.sentiment.news_client import NewsItem
    from datetime import datetime, timezone

    try:
        pub = datetime.fromisoformat(created.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        pub = datetime.now(timezone.utc)

    item = NewsItem(
        title=headline,
        summary=summary,
        source=source,
        published_at=pub,
        url=article.get("url", ""),
    )

    scorer = get_scorer()
    result = scorer.score([item])

    # Format message
    emoji = {"bullish": "🟢", "bearish": "🔴", "neutral": "⚪"}.get(result.sentiment, "⚪")
    conf_bar = "█" * int(result.confidence * 10) + "░" * (10 - int(result.confidence * 10))

    msg = (
        f"{emoji} BTC NEWS\n"
        f"[{source}] {headline}\n\n"
        f"Sentiment: {result.sentiment.upper()}\n"
        f"Confidence: {conf_bar} {result.confidence:.0%}\n"
        f"Materiality: {result.materiality:.0%}\n"
        f"Score: {result.directional_score:+.3f}\n"
    )
    if result.key_factors:
        msg += f"\nFactors: {', '.join(result.key_factors[:3])}"
    if result.reasoning:
        msg += f"\n\n{result.reasoning}"

    print(f"[news] {result.sentiment} conf={result.confidence:.2f} mat={result.materiality:.2f}")

    # Send notifications
    send_telegram(msg)
    send_ntfy(f"{emoji} {headline}\n{result.sentiment.upper()} {result.confidence:.0%}")


def on_message(ws, message):
    try:
        data = json.loads(message)
        if isinstance(data, list):
            for item in data:
                if item.get("T") == "n":
                    # Run scoring in a thread to not block WS
                    threading.Thread(
                        target=score_and_notify, args=(item,), daemon=True
                    ).start()
                elif item.get("T") == "success":
                    print(f"[ws] {item.get('msg', '')}")
                elif item.get("T") == "subscription":
                    print(f"[ws] Subscribed: {item}")
                elif item.get("T") == "error":
                    print(f"[ws] Error: {item}")
    except Exception as e:
        print(f"[ws] Parse error: {e}")


def on_open(ws):
    print("[ws] Connected, authenticating...")
    ws.send(json.dumps({
        "action": "auth",
        "key": os.environ["ALPACA_API_KEY"],
        "secret": os.environ["ALPACA_API_SECRET"],
    }))
    # Subscribe after a short delay for auth to complete
    def subscribe():
        time.sleep(1)
        ws.send(json.dumps({
            "action": "subscribe",
            "news": ["BTC", "ETH", "SOL", "BNB"],
        }))
        print("[ws] Subscribed to BTC, ETH, SOL, BNB news")
    threading.Thread(target=subscribe, daemon=True).start()


def on_error(ws, error):
    print(f"[ws] Error: {error}")


def on_close(ws, close_status_code, close_msg):
    print(f"[ws] Disconnected: {close_status_code} {close_msg}")


def main():
    api_key = os.environ.get("ALPACA_API_KEY")
    api_secret = os.environ.get("ALPACA_API_SECRET")
    if not api_key or not api_secret:
        print("ERROR: Set ALPACA_API_KEY + ALPACA_API_SECRET")
        sys.exit(1)

    tg_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not tg_token:
        print("WARNING: TELEGRAM_BOT_TOKEN not set, notifications disabled")

    # Pre-load the model
    get_scorer()

    # Send startup notification
    send_telegram("📰 News monitor started\nListening for BTC news...")
    send_ntfy("📰 News monitor started")

    url = "wss://stream.data.alpaca.markets/v1beta1/news"
    print(f"[ws] Connecting to {url}")

    while True:
        try:
            ws = websocket.WebSocketApp(
                url,
                on_open=on_open,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close,
            )
            ws.run_forever(ping_interval=30, ping_timeout=10)
        except Exception as e:
            print(f"[ws] Connection failed: {e}")

        print("[ws] Reconnecting in 10s...")
        time.sleep(10)


if __name__ == "__main__":
    main()
