# AGENTS.md — DCTrading Bot

## Project Overview
BTC algorithmic trading bot using Directional Change (DC) theory. Zig 0.16 production binary with Alpaca paper trading, Turso DB, Telegram/ntfy notifications.

## Architecture

### Source Files (`src/`)
- `main.zig` — Entry point. CLI parsing, `runLive()` (WebSocket trading loop), `runBacktest()` (CSV backtest). Wires all modules together via shared `HttpClient`.
- `strategy.zig` — Core strategy: 3-regime (BULL/SIDEWAYS/BEAR), DC detection, vol-trailing stop, MA regime filter, checkpoint save/load (DCTRADE4 format, 24 scalars + ring buffers).
- `feed.zig` — Binance WebSocket (native TLS via websocket.zig) + REST kline fetcher (popen curl). Configurable host via `BINANCE_WS_HOST`/`BINANCE_API_HOST` env vars.
- `dc_detector.zig` — Streaming DC event detector. Emits UP/DOWN events when price reverses by λ threshold.
- `alpaca.zig` — Alpaca paper trading. Sync market orders (buy/sell with fill polling up to 10s), position queries. Uses `HttpClient`.
- `turso.zig` — Turso/libsql HTTP client. Tables: `trade_events`, `positions`, `equity_log`, `bot_status`, `account_ledger`. Async writes via detached threads, sync reads for startup.
- `telegram.zig` — Telegram + ntfy notifications. Async sends via threads, curl fallback for shutdown reliability.
- `http_client.zig` — Shared wrapper around `std.http.Client`. POST/GET/DELETE with custom headers. Connection pooling.
- `types.zig` — Core types: `Tick`, `Trade`, `DCEvent`, `Direction`.
- `tests.zig` — 39 unit tests covering DC detector, strategy, checkpoint, regime transitions, JSON parsing, capital accounting.

### Scripts (`scripts/`)
- `switch-to-gcp.sh` — Stop local bot, start GCP Tokyo instance + systemd service.
- `switch-to-local.sh` — Stop GCP bot + instance, start local bot in tmux.

### Key Patterns
- **HTTP calls**: All modules use shared `HttpClient` (native `std.http.Client`). Exception: `feed.zig` bootstrap uses `popen("curl")` for Binance REST, and `telegram.zig` shutdown uses curl fallback.
- **Async writes**: Turso and Telegram fire-and-forget via `std.Thread.spawn` + `detach()`. Context struct heap-allocated, freed in worker.
- **Sync reads**: Startup queries (capital, position, trade count) are blocking HTTP calls.
- **Checkpoint**: Binary file with magic number validation. 24 f64 scalars + two ring buffers (vol, MA). Saved every minute.
- **Regime**: `enum { bull, sideways, bear }`. Encoded as 0/1/2 in checkpoint scalar[8].

### Environment Variables
| Variable | Required | Used By |
|----------|----------|---------|
| `ALPACA_API_KEY` | Yes | alpaca.zig |
| `ALPACA_API_SECRET` | Yes | alpaca.zig |
| `TURSO_URL` | No | turso.zig |
| `TURSO_TOKEN` | No | turso.zig |
| `TELEGRAM_BOT_TOKEN` | No | telegram.zig |
| `TELEGRAM_CHAT_ID` | No | telegram.zig |
| `NTFY_TOPIC` | No | telegram.zig |
| `BINANCE_WS_HOST` | No | feed.zig (default: stream.binance.com) |
| `BINANCE_API_HOST` | No | feed.zig (default: api.binance.com) |
| `BOT_INSTANCE` | No | main.zig (default: "local") |

### Database Schema (Turso)
- `accounts` — Double-entry accounts (TigerBeetle-inspired): cash, btc_position, fees, equity, pnl. 4 balance fields: debits_pending, debits_posted, credits_pending, credits_posted.
- `transfers` — Immutable append-only transfer log. Two-phase (pending/posted/voided). Codes: 1=deposit, 2=buy, 3=sell, 4=fee, 5=pnl. Atomic BEGIN/COMMIT pipelines.
- `equity_log` — Periodic snapshots (every 5 min + on trades): capital, equity, unrealized, regime, price.
- `bot_status` — Single row (id=1): regime, position, equity, version (DCTRADE4@instance).
### Build
```bash
zig build -Doptimize=ReleaseFast              # macOS arm64
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-linux  # GCP
zig build test                                 # 78 tests
```

### Trading Flow
1. Bootstrap: fetch 87,500 1-min klines → fill MA + vol buffers → detect initial regime
2. Reconcile: read Alpaca position → sync internal state
3. Stream: Binance WebSocket → downsample to 1-min → `processTick()`
4. On BUY signal: Alpaca sync order → update state with fill → log to Turso ledger → notify
5. On SELL signal: Alpaca sync sell → log to Turso ledger → notify
6. Every 5 min: log equity to Turso, upsert bot_status
7. Shutdown (SIGINT/SIGTERM): save checkpoint, log to Turso, notify via curl fallback

### Companion Projects
- **Neko Trade** — SwiftUI dashboard app (macOS + iOS). Separate repo.
- **Python Research Lab** — Backtesting, sentiment analysis, MLX local LLM, news monitor. Separate repo.
