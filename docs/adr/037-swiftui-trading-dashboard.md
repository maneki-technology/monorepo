# ADR-037: SwiftUI Trading Dashboard

## Status

Accepted

## Context

The trading bot writes data to Turso DB and Alpaca, but there was no way to monitor it without SSH-ing into the server or reading raw database rows. A dashboard was needed for real-time monitoring on macOS and iOS.

## Decision

Build a native SwiftUI app ("Neko Trade") with 5 tabs: Dashboard, Ledger, Equity, Trades, Settings. No external dependencies — pure SwiftUI + Swift Charts.

Data sources:
- **BTC price**: Binance REST API (free, no auth)
- **Bot status, equity, trades, ledger**: Turso HTTP API
- **Open position**: Alpaca REST API (source of truth for qty/entry price)

## Rationale

- **Native performance.** SwiftUI renders at 60fps with no web overhead. Charts are native Swift Charts, not a JS charting library in a WebView.
- **Cross-platform.** Single codebase for macOS 13+ and iOS 16+. Same Views, same Services.
- **No server needed.** App reads directly from Turso and Alpaca APIs. No backend to maintain.
- **Credential management.** UserDefaults stores Turso URL/token and Alpaca key/secret. Persistent status indicators show connection health.

## Consequences

- Requires xcodegen to generate `.xcodeproj` from `project.yml`.
- Auto-refresh every 30s via `Timer.publish` on Dashboard.
- Regime colors consistent with bot: BULL=green, SIDEWAYS=orange, BEAR=red.
- Signal vs fill price drift shown on trade history for execution quality analysis.
- No push notifications from the bot — that's handled by Telegram/ntfy.

## Alternatives Considered

- **Web dashboard (React/Vue)** — would need hosting, adds a deployment target. Native app is zero-ops.
- **Streamlit** — prototyped in the Python lab. Good for research, too slow and ugly for daily monitoring.
- **Terminal UI (TUI)** — considered `bubbletea` (Go) or `ratatui` (Rust). Less useful on iOS, no charts.
