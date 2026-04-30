# AGENTS.md — DCTrading Research Lab

## Project Overview
Python research environment for the DCTrading system. Vectorized backtesting, MLX-based sentiment analysis, and real-time Alpaca news monitoring with Telegram notifications.

## Architecture

### Source Modules (`src/dctrading/`)
- `dc/detector.py` — Directional Change event detector (streaming, same logic as Zig bot).
- `dc/indicators.py` — Technical indicators (MA, volatility).
- `dc/regime.py` — 3-regime classification (BULL/SIDEWAYS/BEAR) from MA + buffer.
- `backtest/runner.py` — Backtest engine.
- `sentiment/__init__.py` — Public API: `AlpacaNews`, `MLXLocalScorer`, `SentimentConfidence`.
- `sentiment/news_client.py` — News sources: `AlpacaNews`, `AlphaVantageNews`, `NewsAPIClient`.
- `sentiment/llm_scorer.py` — LLM scoring: `LLMScorer` (base), `MLXLocalScorer` (Qwen3.5-9B-4bit local inference).
- `sentiment/confidence.py` — `SentimentConfidence` — aggregates scores into trade confidence.
- `data/` — Data loading and caching.
- `types.py` — Shared type definitions.
- `agents/`, `envs/`, `live/`, `risk/`, `store/`, `training/`, `dashboard/` — RL and live trading modules (experimental).

### Scripts (`scripts/`)
- `backtest_fast.py` — Vectorized 3-regime backtest using numpy (~100x faster than per-tick).
- `backtest_regimes.py` — 2-regime vs 3-regime comparison with date range.
- `backtest_sentiment.py` — Backtest with sentiment filter overlay.
- `backtest_yearly.py` — Year-by-year performance breakdown.
- `fetch_1m_data.py` — Fetch Binance 1-min kline data.
- `news_monitor.py` — Real-time daemon: Alpaca WS → MLX scoring → Telegram/ntfy. Subscribes to BTC/ETH/SOL/BNB.
- `test_sentiment.py` — Sentiment module smoke test (supports `--mock` for fast CI).
- `run_adaptive_sl.py` — Adaptive stop-loss experiment.

### Key Patterns
- **Vectorized backtesting**: numpy arrays for price/MA/DC detection, no per-tick Python loop.
- **Lazy MLX loading**: `news_monitor.py` lazy-loads the MLX model on first use (takes a few seconds).
- **Alpaca WebSocket**: `websocket-client` library for real-time news stream.
- **Telegram + ntfy**: Dual notification channels for sentiment alerts.

### Dependencies
- Core: numpy, pandas, torch, stable-baselines3, gymnasium, ccxt, vectorbt, hmmlearn
- Sentiment: MLX (via mlx-lm), websocket-client, requests
- Monitoring: streamlit, mlflow, prometheus-client
- Dev: pytest, pytest-asyncio, ruff

## Environment Variables

| Variable | Required | Used By |
|----------|----------|---------|
| `ALPACA_API_KEY` | For news | news_monitor.py |
| `ALPACA_API_SECRET` | For news | news_monitor.py |
| `TELEGRAM_BOT_TOKEN` | For news | news_monitor.py |
| `TELEGRAM_CHAT_ID` | For news | news_monitor.py |
| `NTFY_TOPIC` | No | news_monitor.py |

## Companion Projects
- **DCTrading Bot** (`services/dctrading-bot/`) — Zig production bot.
- **Neko Trade** (`apps/neko-trade/`) — SwiftUI dashboard app.
