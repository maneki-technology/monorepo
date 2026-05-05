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

**Backtested**: $1K → $41.4K over 2019-2024 (+4,039%) with funding filter, outperforming buy-and-hold (+2,437%).

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
| `main.zig` | Entry point, live trading loop, backtest runner, LiveLoop simulator |
| `strategy.zig` | 3-regime DC strategy, MA, vol-trailing, checkpoint |
| `feed.zig` | Native Binance WebSocket + REST kline fetcher |
| `dc_detector.zig` | Streaming DC event detector |
| `exchange.zig` | Exchange vtable interface for sync and async order flow |
| `alpaca.zig` | Alpaca paper trading (sync/async orders, position queries) |
| `live_loop.zig` | Shared live order-flow engine and ledger interface used by production and simulation tests |
| `sim_exchange.zig` | Configurable simulated exchange for integration tests |
| `tick_source.zig` | Tick source interface and simulated feed |
| `integration_tests.zig` | End-to-end LiveLoop scenarios using SimExchange and mock ledger |
| `turso.zig` | Turso DB client (equity log, positions, bot status, two-phase ledger) |
| `telegram.zig` | Telegram + ntfy push notifications |
| `http_client.zig` | Shared HTTP client (std.http.Client wrapper) |
| `types.zig` | Tick, Trade, DC event types |
| `tests.zig` | 179 tests |

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

# Trading pair (optional; default: BTC/USD)
# Alpaca uses BTC/USD; Binance feed/funding maps this to BTCUSDT
export TRADING_SYMBOL=BTC/USD

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

# Funding filter (default: 0.0001 = 0.010%; 0 disables)
# Funding updates are cached, checkpointed, checked hourly, and sent to Telegram/ntfy when Binance publishes a new funding print.
export FUNDING_SKIP_THRESHOLD=0.0001

# Local checkpoint backups (default: 5; 0 disables)
export CHECKPOINT_BACKUP_RETENTION=5

# Checkpoint file path (default: dctrading.checkpoint in the process working directory)
export CHECKPOINT_PATH=dctrading.checkpoint

# Turso remote checkpoint backup interval in seconds (default: 3600; 0 disables)
export CHECKPOINT_REMOTE_BACKUP_INTERVAL=3600

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

# Run LiveLoop simulation against CSV ticks
./zig-out/bin/dctrading sim:data.csv 0.07 1000

# Migrate checkpoint primary/backups offline to the current DCTRADE5 layout
./zig-out/bin/dctrading checkpoint:migrate dctrading.checkpoint 5

# Run tests
zig build test

# Cross-compile for Linux (GCP deployment)
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-linux
```

Known-good historical simulation outputs are recorded in
[`docs/DCTRADING_SIMULATION_BASELINES.md`](../../docs/DCTRADING_SIMULATION_BASELINES.md).

### GCP Deployment

```bash
# Switch to GCP Tokyo
./scripts/switch-to-gcp.sh

# Switch back to local
./scripts/switch-to-local.sh
```

The switch scripts move the checkpoint primary plus local backup files between
hosts and intentionally ignore `dctrading.checkpoint.tmp`. If no local files are
available, startup can still restore from Turso when remote checkpoint backup is
configured.

## Account Ledger

Every capital movement is tracked in `account_ledger`:

```
DEPOSIT      +1000.00   bal=1000.00   "Initial capital"
ENTRY_FEE      -1.00    bal= 999.00   "BUY fee from exchange fill"
BUY          -998.00    bal=   1.00   "Bought BTC"
UNSPENT        +0.07    bal=   1.07   "Alpaca qty rounding"
SELL        +1050.00    bal=1051.07   "Sold BTC"
EXIT_FEE      -1.05     bal=1050.02   "SELL fee from exchange fill"
```

PnL = current balance - total deposits. No double-counting.

Fee transfers are routed by `commission_asset`: `USD`/`USDT` fees reduce `cash`, `BTC` fees reduce `btc_position`, and `BNB` fees reduce `bnb`. Adapter-provided zero commission is treated as an actual zero-fee fill, which is required for Alpaca paper trading. The configured `fee_pct` remains a backtest/simulation estimate and a legacy fallback when an adapter provides no commission metadata. The ledger therefore nets a BTC-paid fee out of the BTC account. The in-memory `strategy.size` still uses the fill quantity supplied by the exchange adapter; if a Binance adapter reports gross executed quantity while charging fees in BTC, that adapter must normalize the fill quantity or the strategy must subtract the base-asset commission in a follow-up.

## Checkpoint

Binary checkpoint (DCTRADE5) saves full strategy state every minute:
- Position, capital, regime, MA buffer, vol buffer, DC detector state
- Current 24h funding-rate average, local cache update timestamp, and latest Binance funding print timestamp used by the funding filter
- Survives restarts without re-bootstrapping
- Old DCTRADE4 checkpoints and earlier DCTRADE5 funding-cache layouts load successfully and are migrated to the current DCTRADE5 layout on the next save or with `checkpoint:migrate`
- Old DCTRADE3 checkpoints rejected (fresh bootstrap on upgrade)
- Live mode writes via `dctrading.checkpoint.tmp` and atomically swaps it into place
- Before each live save, the previous checkpoint is copied into rotated local backups:
  `dctrading.checkpoint.bak.1`, `.bak.2`, and so on
- `CHECKPOINT_BACKUP_RETENTION` controls how many local backups are kept; default is `5`, `0` disables rotation
- `CHECKPOINT_PATH` can pin the checkpoint location; startup prints both cwd and checkpoint path
- Startup tries the primary checkpoint first, then falls back to the newest valid backup
- When Turso is configured, live mode also stores the latest checkpoint in
  `checkpoint_backups` every `CHECKPOINT_REMOTE_BACKUP_INTERVAL` seconds and on clean shutdown
- Turso snapshots include a checksum; restore refuses snapshots whose decoded bytes do not match it
- If all local checkpoint files are missing or corrupt, startup restores the Turso snapshot to
  `dctrading.checkpoint` and loads it before falling back to a fresh bootstrap
- If any local checkpoint file exists but none can be loaded and Turso restore also fails, live mode refuses to bootstrap so it cannot overwrite possibly recoverable checkpoint state
- Checkpoint problems are surfaced in `bot_status.checkpoint_health` and
  `bot_status.checkpoint_error`; Telegram/ntfy sends a warning when health first enters a degraded state

## Companion Projects

- **Neko Trade** (SwiftUI): macOS + iOS dashboard app
- **Python Research Lab**: Backtesting, sentiment analysis, MLX local LLM scoring
- **News Monitor**: Real-time Alpaca news → MLX sentiment → Telegram alerts

## License

Private. © Maneki Technology.
