# Neko Trade

SwiftUI dashboard for the DCTrading bot. macOS + iOS.

## Features

- **Dashboard** — Bot status, regime, managed equity from app-managed BTC/BNB marked at Binance spot, realized P&L, unrealized P&L, active symbol price
- **Ledger** — Quote-currency account ledger with cash balance summary, BNB allocation top-up, and account-aware running cash balance
- **Equity** — Equity chart over time from Turso snapshots, formatted in the active quote currency
- **Trades** — Trade history with entry/exit prices, PnL, signal vs fill price drift, and active symbol chart
- **Settings** — Turso + Alpaca credential management with persistent status indicators

## Data Sources

| Data | Source | Notes |
|------|--------|-------|
| Active symbol price | Binance API | Free, no auth needed; mark symbol comes from bot_status |
| Bot status, equity, trades, ledger | Turso DB | Requires URL + token; transfer amounts are historical quote-currency values, native asset quantities live in transfer size |
| Estimated equity prices | Binance API | Marks app-managed native quantities at current spot; BNB is marked via BNBUSDT |
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

BNB top-up in the Ledger tab allocates bot-managed BNB for fee accounting. It records native BNB in transfer `size`, `BNBUSDT` in transfer `price`, and quote-currency value in transfer `amount`; it does not read or move the full Binance account balance.

## Targets

| Platform | Min Version |
|----------|-------------|
| macOS | 13.0 |
| iOS | 16.0 |

Swift 5.9. No external dependencies.
