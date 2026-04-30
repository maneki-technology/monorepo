# Neko Trade

SwiftUI dashboard for the DCTrading bot. macOS + iOS.

## Features

- **Dashboard** — Bot status, regime, equity, BTC price (Binance), open position with unrealized PnL
- **Ledger** — Account ledger with cash balance summary (DEPOSIT, ENTRY_FEE, BUY, SELL, EXIT_FEE)
- **Equity** — Equity chart over time from Turso snapshots
- **Trades** — Trade history with entry/exit prices, PnL, signal vs fill price drift
- **Settings** — Turso + Alpaca credential management with persistent status indicators

## Data Sources

| Data | Source | Notes |
|------|--------|-------|
| BTC price | Binance API | Free, no auth needed |
| Bot status, equity, trades, ledger | Turso DB | Requires URL + token |
| Open position (qty, entry price) | Alpaca API | Source of truth for position |

## Setup

Requires [xcodegen](https://github.com/yonaskolb/XcodeGen):

```bash
brew install xcodegen
xcodegen                    # Generate .xcodeproj from project.yml
open DCTradingViewer.xcodeproj
```

## Build

```bash
# Via Moon
moon run neko-trade:build

# Direct
xcodegen && xcodebuild -project DCTradingViewer.xcodeproj -scheme DCTradingViewer_macOS -destination 'platform=macOS' build
```

## Configuration

Enter credentials in the Settings tab:
- **Turso URL** — `libsql://dctrading-*.turso.io`
- **Turso Token** — Auth token for Turso DB
- **Alpaca Key/Secret** — Paper trading API credentials

Credentials are stored in UserDefaults and persist across launches.

## Targets

| Platform | Min Version |
|----------|-------------|
| macOS | 13.0 |
| iOS | 16.0 |

Swift 5.9. No external dependencies.
