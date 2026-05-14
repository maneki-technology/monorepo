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
| `http_client.zig` | Shared HTTP client (std.http.Client wrapper + request metrics) |
| `resource_monitor.zig` | Process, disk, feed, and HTTP resource health snapshots |
| `types.zig` | Tick, Trade, DC event types |
| `tests.zig` | 182 tests |

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

# App-visible resource monitoring (defaults shown; 0 interval disables)
export RESOURCE_LOG_INTERVAL_SEC=300
export RESOURCE_DISK_PATH=.
export RESOURCE_RSS_WARN_MB=512
export RESOURCE_DISK_FREE_WARN_MB=1024
export RESOURCE_DISK_USED_WARN_PCT=90
export RESOURCE_FEED_GAP_WARN_SEC=180
export RESOURCE_WS_LAG_WARN_SEC=180
export RESOURCE_HTTP_LATENCY_WARN_MS=5000

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

# Cross-compile for x86_64 Linux (legacy AWS/GCP)
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-linux

# Cross-compile for ARM Linux (OCI Ampere A1)
zig build -Doptimize=ReleaseFast -Dtarget=aarch64-linux
```

Known-good historical simulation outputs are recorded in
[`docs/DCTRADING_SIMULATION_BASELINES.md`](../../docs/DCTRADING_SIMULATION_BASELINES.md).

### OCI Ampere A1 Deployment

Requires OCI CLI configured with an API key, plus `jq`, `curl`, and `ssh`.

```bash
# Create the VM once with OCI CLI:
export OCI_REGION=ap-singapore-1
export OCI_COMPARTMENT_OCID=ocid1.compartment...
./scripts/create-oci-instance.sh

# The create script prints these values for your shell or .env:
export CLOUD_TARGET=oci
export OCI_SSH_HOST=...
export OCI_SSH_USER=ubuntu
export OCI_INSTANCE_OCID=ocid1.instance...
export OCI_SSH_KEY=/path/to/dctrading-oci.key

# Quick deploy (update binary + restart, don't touch local bot)
./scripts/deploy-oci.sh

# Switch to OCI
./scripts/switch-to-oci.sh

# Switch back to local
./scripts/switch-to-local.sh
```

OCI Always Free Ampere A1 allows up to 4 OCPUs and 24GB memory total across A1
instances in the tenancy home region. `create-oci-instance.sh` defaults to
using that full pool as one `VM.Standard.A1.Flex` instance: 4 OCPUs, 24GB RAM,
a 50GB boot volume, Ubuntu 22.04, and the Singapore home region
(`ap-singapore-1`). It creates or reuses a VCN, public
subnet, internet gateway, route table, security list with SSH ingress from your
current public IP, SSH key, instance, log file, and `dctrading` systemd
service. Override `OCI_OCPUS`, `OCI_MEMORY_GB`, `OCI_BOOT_VOLUME_GB`,
`OCI_IMAGE_OCID`, `OCI_AVAILABILITY_DOMAIN`, or `OCI_REGION` when needed.
If OCI returns `Out of host capacity`, the create script tries every
availability domain and falls back through `OCI_FALLBACK_SIZES`
(`4:24 3:18 2:12 1:6`) before failing. Rerun later if all sizes are out of
capacity.

`switch-to-oci.sh` stops the local bot, builds an ARM Linux binary
(`aarch64-linux`), uploads the binary, `.env`, and checkpoint state, then starts
the `dctrading` systemd service.
`switch-to-local.sh` now defaults to OCI, downloads checkpoint state, optionally
stops the OCI instance when `OCI_INSTANCE_OCID` and the OCI CLI are configured,
then starts the local tmux process.

The switch scripts move the checkpoint primary plus local backup files between
hosts and intentionally ignore `dctrading.checkpoint.tmp`. If no local files are
available, startup can still restore from Turso when remote checkpoint backup is
configured.

Expected OCI instance setup:
- Always Free eligible `VM.Standard.A1.Flex` shape.
- No more than 4 OCPUs and 24GB memory total across all Always Free A1
  instances.
- Boot volume allocation kept within the Always Free block-volume allowance.
- SSH ingress from your IP and outbound HTTPS. Rerun
  `create-oci-instance.sh` if your public IP changes and SSH stops working.
- SSH access through `OCI_SSH_USER`, `OCI_SSH_HOST`, and `OCI_SSH_KEY`.
- `~/dctrading`, `~/.env`, and a systemd service named `dctrading` managed by
  the scripts.

> **OCI capacity note:** Always Free A1 capacity can be temporarily unavailable
> in a region or availability domain. If provisioning returns an out-of-capacity
> error, try another availability domain or wait and retry.

The previous AWS/GCP flows remain available as legacy targets:

```bash
./scripts/create-aws-instance.sh
./scripts/deploy-aws.sh
./scripts/switch-to-aws.sh
CLOUD_TARGET=aws ./scripts/switch-to-local.sh

./scripts/switch-to-gcp.sh
CLOUD_TARGET=gcp ./scripts/switch-to-local.sh
```

### Nuke

```bash
# Nuke everything — stops remote bot, drops Turso tables, deletes checkpoints, closes Alpaca positions
CLOUD_TARGET=oci ./scripts/nuke.sh

# Or skip remote cleanup and only nuke local state + Turso + Alpaca
CLOUD_TARGET=local ./scripts/nuke.sh
```

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

## Resource Monitoring

Live mode writes resource snapshots to Turso every five minutes by default:
- `resource_log` stores RSS, CPU seconds, disk free/used, ticks/min, feed gap, WebSocket lag, reconnect count, and HTTP request/error/retry/latency metrics
- `bot_status.resource_*` columns expose the current classified health and latest key metrics for Neko Trade
- Disk pressure is classified before secondary warnings (`DISK_LOW`, then `DISK_HIGH`)
- Resource warnings are intentionally not sent to Telegram/ntfy; those channels stay reserved for trading, checkpoint, funding, startup, and shutdown events

## Companion Projects

- **Neko Trade** (SwiftUI): macOS + iOS dashboard app
- **Python Research Lab**: Backtesting, sentiment analysis, MLX local LLM scoring
- **News Monitor**: Real-time Alpaca news → MLX sentiment → Telegram alerts

## License

Private. © Maneki Technology.
