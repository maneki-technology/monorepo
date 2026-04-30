# DCTrading Research Lab Architecture

*Snapshot: April 2026*

## Overview

Python research environment for the DCTrading system. Vectorized backtesting, MLX-based sentiment analysis, and real-time Alpaca news monitoring. Python 3.12, numpy/pandas for backtesting, Apple MLX for local LLM inference.

## Structure

```
labs/dctrading/
├── src/dctrading/
│   ├── dc/                     # Directional Change core
│   │   ├── detector.py         # Streaming DC event detector
│   │   ├── indicators.py       # Technical indicators (MA, volatility)
│   │   └── regime.py           # 3-regime classification (BULL/SIDEWAYS/BEAR)
│   ├── backtest/
│   │   └── runner.py           # Backtest engine
│   ├── sentiment/
│   │   ├── news_client.py      # AlpacaNews (WS), AlphaVantageNews, NewsAPIClient
│   │   ├── llm_scorer.py       # LLMScorer base, MLXLocalScorer (Qwen3.5-9B-4bit)
│   │   └── confidence.py       # SentimentConfidence aggregator
│   ├── data/
│   │   └── loader.py           # Binance kline data loading + caching
│   ├── agents/                 # RL agents (experimental)
│   │   ├── zi_dct0.py          # Zero-intelligence DC agent
│   │   ├── dcrl.py             # DC + RL hybrid
│   │   ├── deep_rl.py          # Deep RL agent
│   │   ├── recurrent_rl.py     # Recurrent RL agent
│   │   └── ensemble.py         # Ensemble agent
│   ├── envs/                   # Gymnasium environments (experimental)
│   │   ├── dc_trading_env.py   # DC trading environment v1
│   │   ├── dc_trading_env_v2.py # DC trading environment v2
│   │   └── adaptive_sl_env.py  # Adaptive stop-loss environment
│   ├── live/                   # Live trading modules (experimental)
│   │   ├── engine.py           # Live trading engine
│   │   ├── executor.py         # Order executor
│   │   └── feed.py             # Live data feed
│   ├── risk/
│   │   └── manager.py          # Risk management
│   ├── store/
│   │   └── database.py         # SQLite/aiosqlite storage
│   ├── training/
│   │   └── pipeline.py         # Training pipeline
│   ├── dashboard/
│   │   └── app.py              # Streamlit dashboard (experimental)
│   └── types.py                # Shared type definitions
├── scripts/
│   ├── backtest_fast.py        # Vectorized 3-regime backtest (numpy, ~100x faster)
│   ├── backtest_regimes.py     # 2-regime vs 3-regime comparison
│   ├── backtest_sentiment.py   # Backtest with sentiment filter
│   ├── backtest_yearly.py      # Year-by-year breakdown
│   ├── fetch_1m_data.py        # Fetch Binance 1-min klines
│   ├── news_monitor.py         # Real-time daemon: Alpaca WS → MLX → Telegram
│   ├── test_sentiment.py       # Sentiment smoke test (--mock for CI)
│   └── run_adaptive_sl.py      # Adaptive stop-loss experiment
└── pyproject.toml              # Python 3.12, dependencies, ruff config
```

## Backtesting Pipeline

The primary research tool. `backtest_fast.py` uses vectorized numpy operations for ~100x speedup over per-tick Python loops.

```
Binance 1-min klines (pickle cache)
    │
    ▼
numpy arrays: prices, timestamps
    │
    ├── compute_ma() — rolling mean via cumsum trick
    ├── detect_dc_events() — vectorized λ threshold detection
    ├── classify_regime() — BULL/SIDEWAYS/BEAR from MA ± buffer
    │
    ▼
simulate_trades() — walk forward through events
    ├── Entry: DC UP event → buy (capital × (1 - fee))
    ├── Exit: DC DOWN or trailing stop (BEAR only)
    ├── Track: capital, equity, drawdown per trade
    │
    ▼
Results: total return, max drawdown, Sharpe, trade count, win rate
```

**Key results (2019–2026, $1K initial):**
- 3-regime: +4,071% ($40.7K), 47 trades
- 2-regime: +3,140% ($31.4K), 52 trades
- Sentiment filter: hurts returns (skipped $371 winner)

## Sentiment Pipeline

Real-time news monitoring with local LLM scoring (ADR-036).

```
Alpaca News WebSocket
    │ (BTC, ETH, SOL, BNB)
    ▼
news_monitor.py
    │
    ├── Parse article (headline + summary)
    ├── MLXLocalScorer (Qwen3.5-9B-4bit, lazy-loaded)
    │   └── Prompt: "Score sentiment -1.0 to +1.0 for crypto trading"
    ├── SentimentConfidence (aggregate if multiple articles)
    │
    ▼
Telegram + ntfy notification
    └── Symbol, headline, score, confidence
```

**Design choices:**
- Lazy model loading (~5s on first article, then stays in memory)
- `--mock` flag for testing without loading the 9B model
- Monitoring only — not used for trade gating (backtesting showed it hurts returns)

## Module Maturity

| Module | Status | Used in Production |
|--------|--------|-------------------|
| `dc/` | Stable | Yes (logic mirrored in Zig bot) |
| `backtest/` | Stable | Research tool |
| `sentiment/` | Stable | News monitor daemon |
| `data/` | Stable | Data loading for backtests |
| `scripts/` | Stable | Daily use |
| `agents/` | Experimental | No |
| `envs/` | Experimental | No |
| `live/` | Experimental | No (Zig bot is production) |
| `risk/` | Experimental | No |
| `training/` | Experimental | No |
| `dashboard/` | Experimental | No (Neko Trade is production) |

The experimental modules (`agents/`, `envs/`, `live/`, `risk/`, `training/`, `dashboard/`) were early prototypes before the Zig bot and Neko Trade app were built. They remain for reference but are not actively maintained.

## Key Design Decisions

- **ADR-032**: 3-regime strategy validated here before Zig implementation.
- **ADR-036**: MLX local sentiment chosen over cloud APIs for cost and latency.
- **Vectorized backtesting**: numpy operations avoid Python per-tick overhead.
- **Research-first**: This lab validates ideas. Production runs in Zig.

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records.*
