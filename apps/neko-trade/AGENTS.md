# AGENTS.md — Neko Trade

## Project Overview
SwiftUI dashboard app for the DCTrading bot. Displays bot status, equity, trades, ledger, and live BTC price. macOS + iOS, no external dependencies.

## Architecture

### App Entry
- `DCTradingViewerApp.swift` — App entry point. Dark mode by default, macOS window 1000×680.

### Views (`Views/`)
- `ContentView.swift` — Tab container: Dashboard, Ledger, Equity, Trades, Settings.
- `DashboardView.swift` — Bot status, regime (BULL=green, SIDE=orange, BEAR=red), equity, BTC price from Binance, open position with unrealized PnL. Auto-refreshes every 30s.
- `LedgerView.swift` — Transfer ledger with cash balance summary + running balance per entry.
- `EquityChartView.swift` — Equity over time using Swift Charts.
- `TradeHistoryView.swift` — Buy/sell transfers from double-entry ledger, Alpaca position, BTC price chart with trade markers.
- `SettingsView.swift` — Turso + Alpaca credential input with persistent connection status indicators.

### Services (`Services/`)
- `TursoClient.swift` — Turso HTTP client. Queries: accounts, transfers, equity_log, bot_status. Pipeline support for atomic multi-statement operations. Also contains `AppSettings` (singleton, UserDefaults-backed).
- `AlpacaClient.swift` — Alpaca REST client. Position queries (qty, entry price, market value).
- `BinanceClient.swift` — Binance REST client. Current BTC price + kline history (free, no auth).

### Models (`Models/`)
- `Models.swift` — Data types: `Transfer`, `Position`, `EquityLog`, `BotStatus`, plus Turso API types.

### Key Patterns
- **Alpaca as position source of truth**: Open position qty and entry price come from Alpaca, not Turso.
- **BTC price from Binance**: Free API, avoids unnecessary Turso reads.
- **UserDefaults for credentials**: `AppSettings` singleton persists Turso URL/token and Alpaca key/secret.
- **Auto-refresh**: Dashboard polls every 30s via `Timer.publish`.
- **Regime colors**: BULL=green, SIDEWAYS=orange, BEAR=red throughout the UI.

### Build
```bash
xcodegen                    # Generate .xcodeproj from project.yml
moon run neko-trade:build   # Full build (xcodegen + xcodebuild)
```

### Project Config (`project.yml`)
- Bundle ID: `tech.maneki.nekotrade`
- Product name: Neko Trade
- Platforms: macOS 13.0+, iOS 16.0+
- Swift 5.9

## Companion Projects
- **DCTrading Bot** (`services/dctrading-bot/`) — Zig production bot (data source).
- **Research Lab** (`labs/dctrading/`) — Python backtesting and sentiment analysis.
