# DCTrading Bot — Requirements

## Functional Requirements

### FR-1: Trading Strategy

| ID | Requirement | Status |
|----|-------------|--------|
| FR-1.1 | Detect Directional Change (DC) events from streaming price data with configurable threshold | ✅ |
| FR-1.2 | Classify market regime (BULL / SIDEWAYS / BEAR) using moving average with configurable buffer | ✅ |
| FR-1.3 | Open long position immediately in BULL regime if capital available (buy-and-hold) | ✅ |
| FR-1.4 | Open long positions on DC UP events in SIDEWAYS and BEAR regimes | ✅ |
| FR-1.5 | No DC-based entry or exit in BULL regime — hold passively | ✅ |
| FR-1.6 | Close positions on DC DOWN events in SIDEWAYS and BEAR regimes | ✅ |
| FR-1.7 | Apply volatility-adjusted trailing stop in BEAR regime | ✅ |
| FR-1.8 | Disable trailing stop in SIDEWAYS regime | ✅ |
| FR-1.9 | Downsample real-time tick data to ~1 tick/minute for strategy decisions | ✅ |
| FR-1.10 | Support offline backtest mode from historical CSV data | ✅ |
| FR-1.11 | Skip DC entries when 24h average futures funding rate exceeds configurable threshold | ✅ |

### FR-2: Order Management

| ID | Requirement | Status |
|----|-------------|--------|
| FR-2.1 | Pluggable exchange backend — trading loop is exchange-agnostic | ✅ |
| FR-2.2 | Submit market orders and wait for fill confirmation | ✅ |
| FR-2.3 | Handle partial fills and quantity rounding (return unspent capital) | ✅ |
| FR-2.4 | Reconcile position with exchange on startup — exchange is source of truth | ✅ |
| FR-2.5 | Retry transparently on transient connection failures | ✅ |
| FR-2.6 | Support Alpaca paper trading | ✅ |
| FR-2.7 | Support Binance live trading | 🔲 Planned |
| FR-2.8 | Configurable fee rate per exchange | 🔲 Planned (#425) |

### FR-3: Market Data

| ID | Requirement | Status |
|----|-------------|--------|
| FR-3.1 | Stream real-time BTC/USDT trades via WebSocket | ✅ |
| FR-3.2 | Bootstrap strategy indicators from ~60 days of historical candles | ✅ |
| FR-3.3 | Catch up missed candles when resuming from checkpoint | ✅ |
| FR-3.4 | Auto-reconnect on feed disconnection | ✅ |
| FR-3.5 | Configurable data source endpoints | ✅ |

### FR-4: Accounting

| ID | Requirement | Status |
|----|-------------|--------|
| FR-4.1 | Double-entry ledger: every money movement recorded as a debit + credit transfer | ✅ |
| FR-4.2 | Separate accounts for cash, BTC position, fees, equity (deposits), and realized PnL | ✅ |
| FR-4.3 | All transfers are immutable and append-only (post/void create new records, never update) | 🔲 Planned (#439) |
| FR-4.4 | Multi-statement writes are atomic (all-or-nothing) | ✅ |
| FR-4.5 | Account balances derived from transfer history, never stored as a single mutable field | ✅ |
| FR-4.6 | Two-phase transfers: pending orders can be posted or voided | ✅ |
| FR-4.7 | Each trade transfer records fill price and quantity | ✅ |
| FR-4.8 | Ledger is self-verifying: total debits must equal total credits | ✅ |

### FR-5: Capital Management

| ID | Requirement | Status |
|----|-------------|--------|
| FR-5.1 | Detect deposits from companion app (poll periodically) | ✅ |
| FR-5.2 | Auto-buy BTC with new deposit if in BULL regime with open position | ✅ |
| FR-5.3 | Blend entry price on additional buys (weighted average) | ✅ |
| FR-5.4 | Track total deposits across restarts | ✅ |
| FR-5.5 | Refuse to open position when capital is below minimum threshold | ✅ |
| FR-5.6 | Support manual trade reconciliation via correcting transfers | 🔲 Planned (#427) |

### FR-6: State Persistence

| ID | Requirement | Status |
|----|-------------|--------|
| FR-6.1 | Save full strategy state to disk periodically (every minute) | ✅ |
| FR-6.2 | Resume from saved state without re-bootstrapping indicators | ✅ |
| FR-6.3 | Reject incompatible checkpoint versions on upgrade | ✅ |
| FR-6.4 | Restore capital from database when no checkpoint exists | ✅ |
| FR-6.5 | Inspect checkpoint contents without running the bot | ✅ |
| FR-6.6 | Transfer checkpoint between deployment environments | ✅ |

### FR-7: Monitoring

| ID | Requirement | Status |
|----|-------------|--------|
| FR-7.1 | Log equity snapshots to database periodically and on trade events | ✅ |
| FR-7.2 | Publish bot status (regime, position, equity) to database on every tick | ✅ |
| FR-7.3 | Send push notifications on: buy, sell, deposit, regime change, startup, shutdown | ✅ |
| FR-7.4 | Support multiple notification channels (Telegram + ntfy) | ✅ |
| FR-7.5 | Print strategy state to stdout every minute | ✅ |
| FR-7.6 | Companion dashboard app showing equity, trades, ledger, position, live active-symbol price | ✅ |

### FR-8: Deployment

| ID | Requirement | Status |
|----|-------------|--------|
| FR-8.1 | One-command switch between local and cloud deployment | ✅ |
| FR-8.2 | Cross-compile for target deployment platform | ✅ |
| FR-8.3 | Auto-restart on crash in cloud deployment | ✅ |
| FR-8.4 | Prevent host sleep during local execution | ✅ |
| FR-8.5 | Support AWS Tokyo free-tier-compatible deployment while preserving the legacy GCP path | ✅ |

---

## Non-Functional Requirements

### NFR-1: Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1.1 | Single static binary with zero runtime dependencies | 0 deps |
| NFR-1.2 | Strategy tick processing latency | < 1ms |
| NFR-1.3 | Memory footprint | < 50MB |
| NFR-1.4 | Cold bootstrap time (60 days of candles) | < 30s |
| NFR-1.5 | Checkpoint save/load time | < 10ms |

### NFR-2: Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-2.1 | Survive restarts without data loss | 100% |
| NFR-2.2 | Auto-reconnect on feed disconnect | < 5s |
| NFR-2.3 | Graceful shutdown preserves all state | Always |
| NFR-2.4 | Concurrent HTTP requests don't corrupt shared state | Thread-safe |
| NFR-2.5 | Database writes don't block the trading loop | Non-blocking |
| NFR-2.6 | Notification failures don't affect trading decisions | Isolated |

### NFR-3: Data Integrity

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-3.1 | Ledger always balanced (total debits = total credits) | Invariant |
| NFR-3.2 | Transfers are never modified after creation | Append-only |
| NFR-3.3 | Related writes succeed or fail together | Atomic |
| NFR-3.4 | Exchange position is the authoritative source for holdings | Always |
| NFR-3.5 | Corrupted or incompatible checkpoints are rejected, not silently loaded | Validated |

### NFR-4: Security

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-4.1 | Credentials stored in environment variables only | Enforced |
| NFR-4.2 | No real capital at risk during development | Paper trading |
| NFR-4.3 | Database access authenticated | Token-based |

### NFR-5: Testability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-5.1 | Core strategy logic covered by unit tests | Comprehensive |
| NFR-5.2 | Strategy reproducible via deterministic backtest | CSV replay |
| NFR-5.3 | Checkpoint round-trip verified for all regime states | All regimes |
| NFR-5.4 | Exchange layer testable with mock implementations | Pluggable |
| NFR-5.5 | Accounting logic verified with full trading cycle simulation | Balanced |

### NFR-6: Portability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-6.1 | Runs on macOS (arm64) and Linux (x86_64) | Both |
| NFR-6.2 | Trading loop independent of specific exchange | Abstracted |
| NFR-6.3 | External service endpoints configurable via environment | Flexible |
| NFR-6.4 | No platform-specific code in strategy or accounting | Pure logic |

### NFR-7: Observability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-7.1 | Equity history queryable from database | 5-min granularity |
| NFR-7.2 | Notifications delivered via redundant channels | Multi-channel |
| NFR-7.3 | Bot status visible from companion app in real time | Live |
| NFR-7.4 | Strategy state inspectable without running the bot | Offline tool |
| NFR-7.5 | Complete audit trail of all capital movements | Immutable log |
