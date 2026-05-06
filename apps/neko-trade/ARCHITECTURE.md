# Neko Trade Architecture

*Snapshot: April 2026*

## Overview

SwiftUI dashboard app for monitoring the DCTrading bot. 5 tabs: Dashboard, Ledger, Equity, Trades, Settings. Native macOS 13+ / iOS 16+, no external dependencies. Reads from Turso DB, Alpaca API, and Binance API.

## Structure

```
apps/neko-trade/
├── Sources/DCTradingViewer/
│   ├── DCTradingViewerApp.swift    # App entry, dark mode, macOS window size
│   ├── Models/
│   │   └── Models.swift            # Data types (EquityLog, TradeEvent, Position, BotStatus, LedgerEntry)
│   ├── Services/
│   │   ├── TursoClient.swift       # Turso HTTP client + AppSettings singleton
│   │   ├── AlpacaClient.swift      # Alpaca REST client (position queries)
│   │   └── BinanceClient.swift     # Binance REST client (active-symbol price + klines)
│   ├── Views/
│   │   ├── ContentView.swift       # Tab container (5 tabs)
│   │   ├── AppCardSurface.swift    # Shared material card surface
│   │   ├── DashboardView.swift     # Bot status, regime, equity, active-symbol price, open position (~470 lines)
│   │   ├── LedgerView.swift        # Account ledger with cash balance summary + BNB allocation
│   │   ├── EquityChartView.swift   # Equity over time (Swift Charts)
│   │   ├── TradeHistoryView.swift  # Trade list with PnL, signal vs fill drift (~474 lines)
│   │   └── SettingsView.swift      # Credential management with status indicators
│   └── Assets.xcassets/            # App icon
└── project.yml                     # xcodegen project spec
```

## Data Sources

The app reads from three independent APIs. No backend server needed.

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Binance API │     │   Turso DB   │     │  Alpaca API  │
│  (free, no   │     │  (bot writes │     │  (source of  │
│   auth)      │     │   here)      │     │   truth for  │
└──────┬───────┘     └──────┬───────┘     │   position)  │
       │                    │             └──────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
  Mark price         Bot status            Open position
  Price history      Equity log            Qty, entry price
                     Trade events          Market value
                     Account ledger
                     ┌──────────────────────────────┐
                     │        Neko Trade App         │
                     │  Dashboard │ Ledger │ Equity  │
                     │  Trades   │ Settings          │
                     └──────────────────────────────┘
```

## Views

### DashboardView (~470 lines)
The main monitoring view. Shows:
- Bot regime with color coding (BULL=green, SIDEWAYS=orange, BEAR=red)
- Current equity and total PnL
- Live active-symbol price from Binance (free, avoids Turso reads)
- Open position with unrealized PnL (from Alpaca)
- Mini equity chart (last 24h)
- Auto-refreshes every 30s via `Timer.publish`

### LedgerView
Account ledger from Turso transfers and accounts. Shows cash balance summary at top, scrollable entry list below, quote-currency deposits, and BNB allocation top-up. Each entry: type, amount, balance_after, note, timestamp.

### EquityChartView
Equity over time using Swift Charts. Reads from `equity_log` table. Supports time range selection.

### TradeHistoryView (~474 lines)
Trade list with entry/exit prices, PnL per trade, and signal vs fill price drift for execution quality analysis.

### SettingsView
Credential management for Turso (URL + token) and Alpaca (key + secret). Persistent status indicators show connection health. Credentials stored in UserDefaults.

## Services

### TursoClient
HTTP client for Turso's REST API. Queries all 5 bot tables. Also contains `AppSettings` — an `ObservableObject` singleton backed by UserDefaults for credential persistence.

### AlpacaClient
Alpaca REST client. Queries open position (qty, entry price, market value). Used by DashboardView for real-time position data.

### BinanceClient
Binance REST client. Current active-symbol price and kline history. Free API, no authentication needed. The bot publishes `trading_symbol`, `quote_asset`, and `mark_symbol` in `bot_status`; Neko uses that metadata for labels, USD vs USDT formatting, and Binance price URLs.

## Key Design Decisions

- **ADR-037**: SwiftUI chosen for native performance, cross-platform (macOS + iOS), zero-ops deployment.
- **Alpaca as position source of truth** (ADR-033): App reads position from Alpaca, not Turso, matching the bot's own convention.
- **Binance for price**: Free API avoids unnecessary Turso reads for data that's publicly available.
- **No push notifications**: Telegram/ntfy handle alerts from the bot. The app is for monitoring, not alerting.

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records.*
