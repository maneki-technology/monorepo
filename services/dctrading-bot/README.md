# DCTrading Bot

A BTC algorithmic trading bot using Directional Change (DC) theory with a 3-regime strategy, built in Zig for production performance.

## Strategy

**ZI-DCT0 Long-Only** with 3-regime filter:

| Regime | Condition | Behavior |
|--------|-----------|----------|
| BULL | Price > MA + 3% | Hold passively |
| SIDEWAYS | MA ± 3% | DC trade (no trailing stop) |
| BEAR | Price < MA - 3% | DC trade + vol-trailing stop |

Parameters: λ=0.07, 60-day MA, 3% buffer, 2% trailing stop (72h vol lookback)

**Backtested**: $1K → $40.7K over 2019-2026 (+3,971%), outperforming buy-and-hold (+1,916%).

## Architecture

```
Binance WebSocket → Zig Bot → Alpaca Paper Trading
                      ↓
                    Turso DB ← Neko Trade App (SwiftUI)
                      ↓
              Telegram + ntfy notifications
```

Single static binary. No Python, no Docker, no runtime dependencies (except curl for Binance REST bootstrap).

## Modules

| File | Purpose |
|------|---------|
| `main.zig` | Entry point, live trading loop, backtest runner |
| `strategy.zig` | 3-regime DC strategy, MA, vol-trailing, checkpoint |
| `feed.zig` | Native Binance WebSocket + REST kline fetcher |
| `dc_detector.zig` | Streaming DC event detector |
| `alpaca.zig` | Alpaca paper trading (sync orders, position queries) |
| `turso.zig` | Turso DB client (equity log, positions, bot status, ledger) |
| `telegram.zig` | Telegram + ntfy push notifications |
| `http_client.zig` | Shared HTTP client (std.http.Client wrapper) |
| `types.zig` | Tick, Trade, DC event types |
| `tests.zig` | 39 unit tests |

## Setup

### Prerequisites
- [Zig 0.16](https://ziglang.org/download/)
- Alpaca paper trading account (free): https://app.alpaca.markets
- Turso database (free tier): https://turso.tech
- Telegram bot (optional): @BotFather
- ntfy.sh (optional): https://ntfy.sh

### Environment Variables

```bash
# Required
export ALPACA_API_KEY=PK...
export ALPACA_API_SECRET=...

# Turso (optional but recommended)
export TURSO_URL=libsql://your-db.turso.io
export TURSO_TOKEN=eyJ...

# Notifications (optional)
export TELEGRAM_BOT_TOKEN=...
export TELEGRAM_CHAT_ID=...
export NTFY_TOPIC=your-topic

# Binance host (default: stream.binance.com / api.binance.com)
export BINANCE_WS_HOST=stream.binance.com
export BINANCE_API_HOST=api.binance.com

# Instance tracking
export BOT_INSTANCE=local
```

### Build & Run

```bash
# Build
zig build -Doptimize=ReleaseFast

# Run live
source .env && ./zig-out/bin/dctrading -

# Run backtest
./zig-out/bin/dctrading data.csv 0.07 1000

# Run tests
zig build test

# Cross-compile for Linux (GCP deployment)
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-linux
```

### GCP Deployment

```bash
# Switch to GCP Tokyo
./scripts/switch-to-gcp.sh

# Switch back to local
./scripts/switch-to-local.sh
```

## Account Ledger

Every capital movement is tracked in `account_ledger`:

```
DEPOSIT      +1000.00   bal=1000.00   "Initial capital"
ENTRY_FEE      -1.00    bal= 999.00   "BUY fee 0.1%"
BUY          -998.00    bal=   1.00   "Bought BTC"
UNSPENT        +0.07    bal=   1.07   "Alpaca qty rounding"
SELL        +1050.00    bal=1051.07   "Sold BTC"
EXIT_FEE      -1.05     bal=1050.02   "SELL fee 0.1%"
```

PnL = current balance - total deposits. No double-counting.

## Checkpoint

Binary checkpoint (DCTRADE4) saves full strategy state every minute:
- Position, capital, regime, MA buffer, vol buffer, DC detector state
- Survives restarts without re-bootstrapping
- Old DCTRADE3 checkpoints rejected (fresh bootstrap on upgrade)

## Companion Projects

- **Neko Trade** (SwiftUI): macOS + iOS dashboard app
- **Python Research Lab**: Backtesting, sentiment analysis, MLX local LLM scoring
- **News Monitor**: Real-time Alpaca news → MLX sentiment → Telegram alerts

## License

Private. © Maneki Technology.
