# ADR-036: MLX Local Sentiment Analysis

## Status

Accepted

## Context

The research lab needed a sentiment scoring system for crypto news to evaluate whether sentiment could improve trade signal quality. Cloud LLM APIs (OpenAI, Anthropic) add latency, cost, and a network dependency for real-time scoring.

## Decision

Use Apple MLX framework with Qwen3.5-9B-4bit for local inference on Apple Silicon. The sentiment module has three layers:

1. **News clients** — `AlpacaNews` (WebSocket real-time), `AlphaVantageNews`, `NewsAPIClient`.
2. **LLM scorer** — `MLXLocalScorer` wraps `mlx-lm` for local inference. Base `LLMScorer` class allows swapping to cloud APIs.
3. **Confidence aggregator** — `SentimentConfidence` combines multiple article scores into a trade confidence signal.

The `news_monitor.py` daemon connects to Alpaca news WebSocket, scores each article with MLX, and sends Telegram/ntfy notifications for BTC/ETH/SOL/BNB.

## Rationale

- **Zero API cost.** Local inference on M-series Mac, no per-token billing.
- **Low latency.** ~2-3s per article on M3, vs 5-10s for cloud API round-trip.
- **Privacy.** No news data leaves the machine.
- **Lazy loading.** Model loads on first use (~5s), then stays in memory.

## Consequences

- Requires Apple Silicon Mac with ≥16GB RAM for the 4-bit model.
- Backtesting showed sentiment filter hurts returns (skipped a $371 winner). Not used for trade gating — monitoring only.
- `--mock` flag on `test_sentiment.py` for fast CI without loading the model.
- News monitor runs as a long-lived daemon (20h+ uptime observed).

## Alternatives Considered

- **OpenAI API** — works but costs money and adds latency for real-time monitoring.
- **FinBERT** — smaller model, faster inference, but less nuanced for crypto-specific sentiment.
- **No sentiment** — the current production choice. Sentiment is research/monitoring only.
