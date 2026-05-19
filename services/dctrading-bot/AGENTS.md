# AGENTS.md — DCTrading Bot

## Project Overview
BTC algorithmic trading bot using Directional Change (DC) theory. Zig 0.16 production binary with Alpaca paper trading, Turso DB, Telegram/ntfy notifications.

## Architecture

### Source Files (`src/`)
- `main.zig` — Entry point. CLI parsing, `runLive()` (WebSocket trading loop), `runBacktest()` (CSV backtest), `runSimulate()` (LiveLoop CSV simulation). Wires all modules together via shared `HttpClient`.
- `strategy.zig` — Core strategy: 3-regime (BULL/SIDEWAYS/BEAR), DC detection, vol-trailing stop, MA regime filter, funding rate entry filter, checkpoint save/load (DCTRADE5 format, 27 scalars + ring buffers; DCTRADE4 and earlier DCTRADE5 funding-cache layout migration).
- `feed.zig` — Binance WebSocket (native TLS via websocket.zig) + REST kline fetcher + funding rate fetcher (Binance futures API). Configurable host via `BINANCE_WS_HOST`/`BINANCE_API_HOST` env vars.
- `dc_detector.zig` — Streaming DC event detector. Emits UP/DOWN events when price reverses by λ threshold.
- `exchange.zig` — Exchange interface (vtable pattern): sync `buy()`/`sell()`, async `submitOrder()`/`checkOrder()`/`cancelOrder()`, `getPosition()`. Shared types: `OrderFill`, `PendingOrder`, `OrderStatus`, `CancelResult`, `Position`, `Side`.
- `alpaca.zig` — Alpaca paper trading, implements Exchange interface. Sync orders (buy/sell with fill polling), async orders (submitOrderAsync/checkOrderStatus/cancelOrderAsync), position queries. Uses `HttpClient`.
- `turso.zig` — Turso/libsql HTTP client. Tables: `accounts`, `transfers` (with `order_id` column), `equity_log`, `bot_status`, `resource_log`. Two-phase transfers (pending/posted/voided, append-only). Async writes via detached threads, sync reads for startup.
- `telegram.zig` — Telegram + ntfy notifications. Async sends via threads, curl fallback for shutdown reliability.
- `http_client.zig` — Thread-safe wrapper around `std.http.Client`. Mutex-protected POST/GET/DELETE with auto-retry on stale connections and per-window request/error/retry/latency metrics.
- `resource_monitor.zig` — Resource health sampler/classifier. Tracks process RSS/CPU, disk free/used, WebSocket feed gaps/lag/reconnects, and HTTP metrics for app-visible status.
- `types.zig` — Core types: `Tick`, `Trade`, `DCEvent`, `Direction`.
- `live_loop.zig` — Extracted core order flow logic: pending order tracking, trailing stop, strategy signals, buy/sell submission, capital_reserved, and ledger vtable. Shared by `runLive()` and integration tests.
- `tick_source.zig` — `TickSource` vtable interface + `SimFeed` (replays ticks from array). For testing.
- `sim_exchange.zig` — `SimExchange` implementing Exchange vtable with configurable fill delay, slippage, partial fills, cancel races, failure injection, order log. For testing.
- `integration_tests.zig` — 32 end-to-end scenarios using LiveLoop + SimExchange + mock ledger.
- `tests.zig` — 182 tests covering DC detector, strategy, checkpoint, regime transitions, JSON parsing, capital accounting, double-entry transfers, exchange interface, funding rate filter, non-blocking order flow, capital_reserved, resource monitoring, integration scenarios.
- CLI `checkpoint:migrate [path] [backups]` migrates checkpoint primary/backups offline to the current DCTRADE5 layout after writing `.pre-migrate` copies.

### Scripts (`scripts/`)
- `create-aws-instance.sh` — One-time AWS infrastructure setup: security group, key pair, EC2 instance (with optional IAM instance profile), systemd service, and CloudWatch agent.
- `deploy-aws.sh` — Build Linux binary, upload to running AWS EC2 instance, restart systemd. Does not stop local bot or migrate checkpoints. Ensures CloudWatch agent, log file, and IAM instance profile attachment exist.
- `switch-to-aws.sh` — Stop local bot, start AWS Tokyo EC2 instance + systemd service. Copies binary plus checkpoint primary/local backups, excluding temp files. Ensures CloudWatch agent, log file, and IAM instance profile attachment exist.
- `setup-aws-iam.sh` — Standalone IAM instance profile creation for CloudWatch. Creates the role, attaches `CloudWatchAgentServerPolicy`, creates the instance profile, and waits for propagation.
- `switch-to-gcp.sh` — Stop local bot, start GCP Tokyo instance + systemd service. Copies binary plus checkpoint primary/local backups, excluding temp files.
- `switch-to-local.sh` — Stop cloud bot + instance, download checkpoint primary/local backups, start local bot in tmux. Defaults to AWS; use `CLOUD_TARGET=gcp` for the legacy GCP path.
- `nuke.sh` — Destructive reset for Turso state, local + remote checkpoint primary/backups, and Alpaca positions. Uses `CLOUD_TARGET` to stop and clear remote state.

### Key Patterns
- **HTTP calls**: All modules use shared `HttpClient` (native `std.http.Client`). Exception: `feed.zig` bootstrap uses `popen("curl")` for Binance REST, and `telegram.zig` shutdown uses curl fallback.
- **Async writes**: Turso and Telegram fire-and-forget via `std.Thread.spawn` + `detach()`. Context struct heap-allocated, freed in worker.
- **Sync reads**: Startup queries (capital, position, trade count) are blocking HTTP calls.
- **Checkpoint**: Binary file with magic number validation. DCTRADE5 writes 27 f64 scalars, including `funding_avg`, `funding_avg_updated_at`, and `funding_latest_time`, plus two ring buffers (vol, MA). DCTRADE4 and earlier DCTRADE5 funding-cache files are still accepted and migrated on the next save. Saved every minute through an atomic temp-file swap. Live mode keeps rotated local backups (`dctrading.checkpoint.bak.N`) and falls back to the newest valid backup if the primary checkpoint cannot be loaded.
- **Checkpoint startup guard**: Live mode prints cwd/checkpoint path and refuses to bootstrap if any local checkpoint primary/backup exists but none can be loaded and Turso restore fails. Use `checkpoint:migrate` or manually promote a known-good backup instead.
- **Regime**: `enum { bull, sideways, bear }`. Encoded as 0/1/2 in checkpoint scalar[8].

### Environment Variables
| Variable | Required | Used By |
|----------|----------|---------|
| `ALPACA_API_KEY` | Yes | alpaca.zig |
| `ALPACA_API_SECRET` | Yes | alpaca.zig |
| `TRADING_SYMBOL` | No | main.zig/alpaca.zig/feed.zig (default: BTC/USD; Binance maps USD quote to USDT) |
| `TURSO_URL` | No | turso.zig |
| `TURSO_TOKEN` | No | turso.zig |
| `TELEGRAM_BOT_TOKEN` | No | telegram.zig |
| `TELEGRAM_CHAT_ID` | No | telegram.zig |
| `NTFY_TOPIC` | No | telegram.zig |
| `FUNDING_SKIP_THRESHOLD` | No | main.zig (default: 0.0001 = 0.010%) |
| `CHECKPOINT_PATH` | No | main.zig (default: dctrading.checkpoint in cwd) |
| `CHECKPOINT_BACKUP_RETENTION` | No | main.zig (default: 5) |
| `CHECKPOINT_REMOTE_BACKUP_INTERVAL` | No | main.zig (default: 3600s, 0 disables) |
| `RESOURCE_LOG_INTERVAL_SEC` | No | main.zig/resource_monitor.zig (default: 300s, 0 disables) |
| `RESOURCE_DISK_PATH` | No | resource_monitor.zig (default: current working directory) |
| `RESOURCE_RSS_WARN_MB` | No | resource_monitor.zig (default: 512) |
| `RESOURCE_DISK_FREE_WARN_MB` | No | resource_monitor.zig (default: 1024) |
| `RESOURCE_DISK_USED_WARN_PCT` | No | resource_monitor.zig (default: 90) |
| `RESOURCE_FEED_GAP_WARN_SEC` | No | resource_monitor.zig (default: 180) |
| `RESOURCE_WS_LAG_WARN_SEC` | No | resource_monitor.zig (default: 180) |
| `RESOURCE_HTTP_LATENCY_WARN_MS` | No | resource_monitor.zig (default: 5000) |
| `BINANCE_WS_HOST` | No | feed.zig (default: stream.binance.com) |
| `BINANCE_API_HOST` | No | feed.zig (default: api.binance.com) |
| `BOT_INSTANCE` | No | main.zig (default: "local") |
| `CHECKPOINT_BACKUP_RETENTION` | No | main.zig (default: 5 local rotated backups; 0 disables) |
| `CHECKPOINT_REMOTE_BACKUP_INTERVAL` | No | main.zig/Turso (default: 3600 seconds; 0 disables) |
| `CLOUD_TARGET` | No | switch-to-local.sh (default: aws; set gcp for legacy GCP) |
| `AWS_REGION` | No | switch-to-aws.sh/switch-to-local.sh (default: ap-northeast-1) |
| `AWS_INSTANCE_ID` | Yes for AWS scripts | switch-to-aws.sh/switch-to-local.sh |
| `AWS_SSH_USER` | No | switch-to-aws.sh/switch-to-local.sh (default: ec2-user) |
| `AWS_SSH_KEY` | No | switch-to-aws.sh/switch-to-local.sh |
| `AWS_SSH_HOST` | No | switch-to-aws.sh/switch-to-local.sh; overrides AWS CLI DNS lookup |
| `AWS_REMOTE_DIR` | No | switch-to-aws.sh/switch-to-local.sh (default: remote home via `.`) |
| `AWS_SERVICE_NAME` | No | switch-to-aws.sh/switch-to-local.sh (default: dctrading) |
| `AWS_PROFILE` | No | All AWS scripts (default: AdministratorAccess-118740508718) |
| `AWS_IAM_INSTANCE_PROFILE` | No | create-aws-instance.sh — IAM instance profile name to attach to the EC2 instance. Must have `CloudWatchAgentServerPolicy` for CloudWatch Logs/Metrics.
| `CLOUD_TARGET` | No | nuke.sh/switch-to-local.sh (default: aws; set gcp or local) |
| `GCP_ZONE` | No | switch-to-gcp.sh/switch-to-local.sh (default: asia-northeast1-b) |
| `GCP_INSTANCE` | No | switch-to-gcp.sh/switch-to-local.sh (default: dctrading-asia) |
| `GCP_REMOTE_DIR` | No | switch-to-gcp.sh (default: remote home via `.`) |
| `GCP_SERVICE_NAME` | No | switch-to-gcp.sh (default: dctrading) |

### Database Schema (Turso)
- `accounts` — Double-entry accounts (TigerBeetle-inspired): cash, btc_position, fees, equity, pnl, bnb. 4 balance fields: debits_pending, debits_posted, credits_pending, credits_posted.
- `transfers` — Immutable append-only transfer log. Two-phase (pending/posted/voided). Codes: 1=deposit, 2=buy, 3=sell, 4=fee, 5=pnl. Atomic BEGIN/COMMIT pipelines.
- Fee routing: adapter-provided `commission_asset` routes fees to the paying asset account (`USD`/`USDT` → cash, `BTC` → btc_position, `BNB` → bnb), even when commission is zero. Transfer `amount` is historical quote-currency value at fill time; native fee quantity is stored in transfer `size`, with the fill-time asset quote valuation rate in `price`. `strategy.size` remains whatever the exchange adapter reports as fill quantity. `fee_pct` is for backtest/simulation estimates and legacy fills with no commission metadata, not for Alpaca paper fills.
- `equity_log` — Periodic snapshots (every 5 min + on trades): capital, equity, unrealized, regime, price.
- `bot_status` — Single row (id=1): regime, position, equity, version (DCTRADE5@instance), active symbol metadata, checkpoint health/error, and latest resource health/metrics for Neko.
- `resource_log` — Periodic process/feed/HTTP resource snapshots used for dashboard status and diagnostics. Resource degradation is app-visible only; Telegram/ntfy stays reserved for trading, checkpoint, funding, startup/shutdown events.
- `checkpoint_backups` — Single remote checkpoint snapshot (id=1): base64-encoded DCTRADE5 checkpoint, byte length, checksum, tick count, and update time. Used only if local primary/backups cannot be loaded.
### Build
```bash
zig build -Doptimize=ReleaseFast              # macOS arm64
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-linux  # cloud Linux
zig build test                                 # 182 tests
./zig-out/bin/dctrading checkpoint:migrate dctrading.checkpoint 5
```

### CloudWatch Observability
CloudWatch Logs and Metrics are automatically configured on AWS instances.

**What is collected:**
- **Logs:** `/var/log/dctrading.log` → CloudWatch log group `dctrading` (stream = `{instance_id}`)
- **Metrics:** `mem_used_percent`, `disk_used_percent` → CloudWatch namespace `dctrading` every **5 minutes**

**IAM Role Setup:**
All AWS scripts automatically create the IAM instance profile if it does not exist, provided your AWS principal has IAM permissions (`iam:CreateRole`, `iam:AttachRolePolicy`, `iam:CreateInstanceProfile`, `iam:AddRoleToInstanceProfile`).

1. Set `AWS_IAM_INSTANCE_PROFILE=dctrading-ec2-role` in your `.env`.
2. For new instances: run `./scripts/create-aws-instance.sh`.
3. For existing instances: run `./scripts/setup-aws-iam.sh` to create the IAM profile, then `./scripts/deploy-aws.sh` (or `./scripts/switch-to-aws.sh`) to attach it to the running instance and install the CloudWatch agent.

If you do not have IAM permissions, create the role manually:
- In the AWS Console, go to **IAM → Roles → Create role**.
- Trusted entity: **AWS service → EC2**.
- Attach the managed policy **CloudWatchAgentServerPolicy**.
- Name the role `dctrading-ec2-role`.
- Run `create-aws-instance.sh` with `AWS_IAM_INSTANCE_PROFILE=dctrading-ec2-role`.

**For existing instances without the profile:**
`deploy-aws.sh` and `switch-to-aws.sh` will detect a missing profile and attach it automatically if `AWS_IAM_INSTANCE_PROFILE` is set. The instance does not need to be stopped.

**Estimated CloudWatch cost (Tokyo, 24/7):**
| Item | Monthly |
|------|---------|
| 2 custom metrics | ~$0.60 |
| `PutMetricData` API (5-min interval) | ~$0.17 |
| Logs (~0.5–1 GB) | ~$0.25–0.50 |
| **Total** | **~$1.05** |

### Trading Flow
1. Bootstrap: fetch 87,500 1-min klines → fill MA + vol buffers → detect initial regime
2. Reconcile: read Alpaca position → sync internal state. Resolve pending transfers from Turso.
3. Stream: Binance WebSocket → downsample to 1-min → `LiveLoop.processTick()`
4. On BUY signal: `submitOrder()` (non-blocking) → pending transfer in Turso → `checkOrder()` each tick → fill → post transfer
5. On SELL signal: cancel pending buys → `submitOrder()` sell → pending transfer → fill → post transfer + PnL
6. Every 5 min: log equity/resource snapshots to Turso, upsert bot_status, check deposits
7. Hourly: refresh cached funding rate before strategy-minute processing; notify only when Binance publishes a new funding print
8. Shutdown (SIGINT/SIGTERM): save checkpoint with backup rotation, log to Turso, notify via curl fallback

### Companion Projects
- **Neko Trade** — SwiftUI dashboard app (macOS + iOS). Separate repo.
- **Python Research Lab** — Backtesting, sentiment analysis, MLX local LLM, news monitor. Production-equivalent strategy references are `labs/dctrading/scripts/backtest_crossval.py`, `backtest_fast.py` in `3reg` mode, and `backtest_regimes.py` `ThreeRegimeStrategy`; the experimental Python `live/engine.py` is older sticky BULL/BEAR prototype code and does not match current Zig production.
