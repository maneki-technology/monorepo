# DCTrading Research Lab

Python research environment for the DCTrading system. Backtesting, sentiment analysis, and real-time news monitoring.

## Production Strategy Reference

Production trading runs in `services/dctrading-bot` (`src/strategy.zig`). The
current production strategy is the direct 3-regime ZI-DCT0 model:

| Regime | Condition | Behavior |
|--------|-----------|----------|
| BULL | Price > 60d MA + 3% | Buy if flat, then hold passively. DC trade actions are ignored. |
| SIDEWAYS | Inside the 60d MA ± 3% band | DC UP entry, DC DOWN exit. No trailing stop. |
| BEAR | Price < 60d MA - 3% | DC UP entry, DC DOWN exit, plus vol-trailing stop. |

The Python scripts that mirror Zig production behavior are:

- `scripts/backtest_crossval.py`
- `scripts/backtest_fast.py` in `3reg` mode
- `scripts/backtest_regimes.py` `ThreeRegimeStrategy`
- funding backtests that use the same direct BULL/SIDEWAYS/BEAR classifier

The experimental async live engine at `src/dctrading/live/engine.py` is not the
production reference. It uses older sticky BULL/BEAR transitions and does not
model production `SIDEWAYS` behavior.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Scripts

### Backtesting

```bash
# Vectorized 3-regime backtest (fast, ~100x vs per-tick loop)
python scripts/backtest_fast.py --capital 1000

# Regime comparison (2-regime vs 3-regime)
python scripts/backtest_regimes.py --since 2023-01-01 --until 2025-12-31

# Sentiment filter backtest
python scripts/backtest_sentiment.py

# Yearly breakdown
python scripts/backtest_yearly.py
```

### News Monitor

Real-time news sentiment daemon. Connects to Alpaca news WebSocket, scores articles with local MLX (Qwen3.5-9B-4bit), sends Telegram/ntfy notifications.

```bash
python scripts/news_monitor.py
```

Requires: `ALPACA_API_KEY`, `ALPACA_API_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

### Sentiment Testing

```bash
python scripts/test_sentiment.py --mock   # Mock LLM (fast)
python scripts/test_sentiment.py          # Real MLX inference
```

### Data

```bash
python scripts/fetch_1m_data.py   # Fetch Binance 1-min klines
```

## Moon Tasks

```bash
moon run dctrading:backtest-fast      # Vectorized backtest ($1K)
moon run dctrading:backtest-regimes   # Regime comparison
moon run dctrading:news-monitor       # Real-time news daemon
moon run dctrading:test-sentiment     # Sentiment mock test
```

## Key Results

- Production 3-regime cross-validation: +4,039% over 2019-2024 on $1K with funding filter (λ=0.07, 60d MA, buf=3%)
- Historical 2-regime baseline study: +3,140% over the prior 2019-2026 research window
- Sentiment filter: hurts returns (skipped a $371 winner), not used for trade gating

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ALPACA_API_KEY` | For news | Alpaca API key |
| `ALPACA_API_SECRET` | For news | Alpaca API secret |
| `TELEGRAM_BOT_TOKEN` | For news | Telegram bot token |
| `TELEGRAM_CHAT_ID` | For news | Telegram chat ID |
| `NTFY_TOPIC` | No | ntfy topic for push notifications |
