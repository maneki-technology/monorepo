# DCTrading Bot Architecture

*Snapshot: April 2026*

## Overview

BTC algorithmic trading bot using Directional Change (DC) theory. Single Zig 0.16 static binary (~4MB), runs 24/7 on AWS EC2 free-tier-compatible Linux in Tokyo or local macOS. The legacy GCP Tokyo script remains available during migration. Processes real-time Binance WebSocket ticks, executes Alpaca paper trades, persists to Turso DB, notifies via Telegram/ntfy.

## Structure

```
services/dctrading-bot/
├── src/
│   ├── main.zig           # Entry point, CLI, runLive(), runBacktest()
│   ├── strategy.zig       # 3-regime DC strategy, checkpoint save/load
│   ├── dc_detector.zig    # Streaming DC event detector (λ threshold)
│   ├── feed.zig           # Binance WebSocket + REST kline bootstrap
│   ├── alpaca.zig         # Alpaca paper trading (sync orders, position queries)
│   ├── turso.zig          # Turso HTTP client (5 tables, async writes, sync reads)
│   ├── telegram.zig       # Telegram + ntfy notifications (async + curl fallback)
│   ├── http_client.zig    # Shared std.http.Client wrapper
│   ├── types.zig          # Core types: Tick, Trade, DCEvent, Direction
│   └── tests.zig          # 39 unit tests
├── scripts/
│   ├── switch-to-aws.sh   # Build Linux binary, upload, start AWS Tokyo instance
│   ├── switch-to-gcp.sh   # Build Linux binary, upload, start GCP instance
│   └── switch-to-local.sh # Stop cloud instance, build macOS binary, start local in tmux
├── build.zig              # Zig build config
└── build.zig.zon          # Dependencies (websocket.zig)
```

## Data Flow

```
Binance WebSocket (1s trades)
    │
    ▼
feed.zig (downsample to 1-min candles)
    │
    ▼
strategy.processTick()
    ├── DC detector: UP/DOWN events when price reverses by λ=0.07
    ├── Regime filter: direct BULL/SIDEWAYS/BEAR from 60-day MA ± 3% buffer
    ├── BULL: buy if flat, then ignore DC trade actions and hold passively
    ├── SIDEWAYS: DC UP → BUY, DC DOWN → SELL, no trailing stop
    ├── BEAR: DC UP → BUY, DC DOWN or vol-trailing stop → SELL
    │
    ▼
main.zig (trade lifecycle)
    ├── alpaca.zig: sync market order → poll for fill (up to 10s)
    ├── turso.zig: log to trade_events, positions, account_ledger (async)
    ├── telegram.zig: notify buy/sell/regime change (async)
    └── strategy: update capital, entry_price, size from Alpaca fill
```

## Strategy (ZI-DCT0)

The core strategy in `strategy.zig` (~371 lines):

**Parameters:**
- λ = 0.07 (DC threshold — 7% price reversal triggers event)
- MA period = 60 days (43,200 one-minute candles)
- MA buffer = 3% (sideways zone width)
- Trailing stop = 2% below peak, 72h volatility window
- Fee = 0.1% per trade (entry + exit)
- Long-only (no shorting)

**Regime behavior:**

| Regime | Entry | Exit | Trailing Stop |
|--------|-------|------|---------------|
| BULL | Immediate buy if flat | None (hold passively) | No |
| SIDEWAYS | DC UP | DC DOWN | No |
| BEAR | DC UP | DC DOWN + trailing | Yes (2% / 72h vol) |

Regime is recomputed directly on each strategy-minute tick:

- `price > MA * 1.03` → `BULL`
- `price < MA * 0.97` → `BEAR`
- otherwise → `SIDEWAYS`

There is no debounce or sticky state between `BULL` and `SIDEWAYS`. This is the
latest production behavior and is mirrored by the Python lab's 3-regime
backtests (`backtest_crossval.py`, `backtest_fast.py` `3reg`, and
`backtest_regimes.py` `ThreeRegimeStrategy`). The Python lab's experimental
`src/dctrading/live/engine.py` is older sticky BULL/BEAR prototype code and is
not production-equivalent.

**Checkpoint (DCTRADE4):**
Binary file with magic number validation (`0x4443_5452_4144_4534`). 24 f64 scalars (capital, entry price, regime, DC state, MA state, vol state) + two ring buffers (volatility window, MA window). Saved every 60 seconds. Old DCTRADE3 format rejected on load.

## Database Schema (Turso)

5 tables, all written asynchronously except startup reads:

| Table | Purpose | Write | Read |
|-------|---------|-------|------|
| `trade_events` | BUY/SELL with price, size, fee, timestamp | Async | — |
| `positions` | OPEN/CLOSED with entry/exit, PnL, signal_price, alpaca_order_id | Async | Startup (reconcile) |
| `equity_log` | Snapshots every 5 min + on trades: capital, equity, unrealized, regime | Async | Startup (fallback capital) |
| `bot_status` | Single row: regime, position, equity, version (DCTRADE4@instance) | Async (upsert) | — |
| `account_ledger` | Cash flow audit: DEPOSIT, ENTRY_FEE, BUY, SELL, EXIT_FEE with running balance | Async | Startup (capital) |

## Concurrency Model

No async runtime. Simple threading model:

- **Main thread**: WebSocket read loop → `processTick()` → trade decisions. All blocking.
- **Fire-and-forget writes**: `std.Thread.spawn` + `detach()` for Turso and Telegram. Context struct heap-allocated (`allocator.create`), freed by worker thread after HTTP call.
- **Sync reads**: Startup queries (capital, position, trade count) block the main thread before the WebSocket loop starts.
- **Shutdown**: SIGINT/SIGTERM handler sets atomic flag. Main loop exits, saves checkpoint, sends final notifications via curl fallback (native HTTP may have stale connections).

## Startup Sequence

1. Parse CLI args (live mode, capital, checkpoint path)
2. Initialize shared `HttpClient`
3. Bootstrap: fetch 87,500 one-minute klines from Binance REST → fill MA + vol ring buffers → detect initial regime
4. Load checkpoint (if exists) → restore strategy state
5. Read capital from account_ledger (falls back to equity_log, then CLI arg)
6. Reconcile with Alpaca position → sync internal state if position exists
7. Log DEPOSIT to ledger (first run only)
8. Start Binance WebSocket → enter main trading loop

## Deployment

Two deployment targets, switched via scripts:

| Target | Instance | Binary | Script |
|--------|----------|--------|--------|
| AWS Tokyo | Free-tier-compatible EC2, ap-northeast-1 | x86_64-linux | `switch-to-aws.sh` |
| GCP Tokyo | e2-micro, asia-northeast1-b | x86_64-linux | `switch-to-gcp.sh` |
| Local macOS | M-series Mac | aarch64-macos | `switch-to-local.sh` |

Only one instance runs at a time. Scripts handle build, upload, checkpoint transfer, and process management. AWS is the default cloud target for `switch-to-local.sh`; set `CLOUD_TARGET=gcp` to use the legacy GCP shutdown path.

## Key Design Decisions

- **ADR-031**: Zig chosen for single static binary, cross-compilation, deterministic memory.
- **ADR-032**: 3-regime strategy beats 2-regime by +931% over 2019–2026.
- **ADR-033**: Alpaca fill data is source of truth for position qty/price.
- **ADR-034**: Account ledger tracks every cash movement with running balance.
- **ADR-035**: Native `std.http.Client` replaces `popen("curl")` for most HTTP calls.

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records.*
