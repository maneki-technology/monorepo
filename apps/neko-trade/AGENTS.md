# AGENTS.md — Neko Trade

## Project Overview
SwiftUI dashboard app for the DCTrading bot. Displays bot status, equity, trades, ledger, and live active-symbol price. macOS + iOS, no external dependencies.

## Architecture

### App Entry
- `DCTradingViewerApp.swift` — App entry point. Dark mode by default, macOS window 1000×680.

### Views (`Views/`)
- `ContentView.swift` — Tab container: Dashboard, Ledger, Equity, Trades, Settings.
- `DashboardView.swift` — Bot status, regime (BULL=green, SIDE=orange, BEAR=red), managed equity from app-managed BTC/BNB quantities marked at Binance spot, realized P&L, unrealized P&L, active-symbol price from Binance. Auto-refreshes every 30s.
- `LedgerView.swift` — Transfer ledger with cash balance summary, BNB allocation top-up, and running balance per entry.
- `EquityChartView.swift` — Equity over time using Swift Charts.
- `TradeHistoryView.swift` — Buy/sell transfers from double-entry ledger, Alpaca position, active-symbol price chart with trade markers.
- `SettingsView.swift` — Turso + Alpaca credential input with persistent connection status indicators.

### Services (`Services/`)
- `TursoClient.swift` — Turso HTTP client. Queries: accounts, transfers, equity_log, bot_status. Pipeline support for atomic multi-statement operations. Also contains `AppSettings` (singleton, UserDefaults-backed).
- `AlpacaClient.swift` — Alpaca REST client. Position queries (qty, entry price, market value).
- `BinanceClient.swift` — Binance REST client. Current active-symbol price + kline history (free, no auth).

### Models (`Models/`)
- `Models.swift` — Data types: `Transfer`, `Position`, `EquityLog`, `BotStatus`, plus Turso API types.

### Key Patterns
- **Alpaca as position source of truth**: Open position qty and entry price come from Alpaca, not Turso.
- **Active symbol from bot_status**: `trading_symbol`, `base_asset`, `quote_asset`, and `mark_symbol` drive labels, quote-currency formatting, and Binance price lookups. Old databases fall back to `BTC/USD`.
- **Price from Binance**: Free API, avoids unnecessary Turso reads. `BTC/USD` mode marks with `BTCUSDT`; BNB is marked with `BNBUSDT` and treated as USD-equivalent in USD mode.
- **Realized PnL formula**: `(cash_balance + btc_balance + bnb_balance) - total_deposits`; transfer amounts are historical quote-currency values, while native BTC/BNB fee quantities live in transfer `size`.
- **Estimated equity/PnL formula**: `cash_balance + managed_btc_qty * active mark price + managed_bnb_qty * BNBUSDT`; managed quantities are derived from posted transfer `size`, so exchange assets outside bot-managed transfers are ignored.
- **BNB allocation top-up**: Ledger top-up records `debit=bnb`, `credit=equity`, `code=deposit`, quote-currency `amount`, native BNB `size`, and `BNBUSDT` `price`. It allocates bot-managed BNB only; it does not reconcile the full exchange account.
- **Account-aware ledger balances**: Running cash balance uses the transfer debit/credit accounts, so BTC/BNB fee transfers do not change displayed cash.
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
