# ADR-034: Account Ledger for Capital Audit Trail

## Status

Accepted

## Context

The bot tracked equity via periodic snapshots (`equity_log` table, every 5 min), but there was no record of individual cash movements. Debugging capital discrepancies required reconstructing the flow from trade events manually.

## Decision

Add an `account_ledger` table that records every cash movement with a running balance:

| Entry Type | Amount | When |
|---|---|---|
| `DEPOSIT` | +initial_capital | First run |
| `ENTRY_FEE` | -(price × qty × 0.1%) | On buy |
| `BUY` | -(price × qty) | On buy |
| `SELL` | +(price × qty) | On sell |
| `EXIT_FEE` | -(price × qty × 0.1%) | On sell |

Each row stores: `type`, `amount`, `balance_after`, `note`, `timestamp`.

PnL is derived from SELL - BUY, not stored as a separate entry.

## Rationale

- **Full audit trail.** Every dollar is accounted for. Balance can be reconstructed from the ledger alone.
- **Startup capital restoration.** Bot reads `balance_after` from the latest ledger entry on startup (falls back to `equity_log` for backward compatibility).
- **Debuggability.** Neko Trade's Ledger tab shows the full cash flow history.

## Consequences

- 5 entry types (DEPOSIT, ENTRY_FEE, BUY, SELL, EXIT_FEE). No UNSPENT entry — the BUY amount already reflects actual Alpaca fill qty.
- Async writes via `std.Thread.spawn` + `detach()` (same pattern as other Turso writes).
- Blocking read on startup (`logLedgerSync`) to restore capital before trading begins.
- Neko Trade LedgerView consumes this table directly.

## Alternatives Considered

- **Derive everything from trade_events** — possible but requires fee recalculation and doesn't capture deposits.
- **Store PnL as a ledger entry** — redundant since PnL = SELL - BUY. Removed TRADE_PNL entry during implementation.
- **Store UNSPENT as a ledger entry** — removed because BUY already uses actual fill qty, so unspent capital was never deducted from the ledger in the first place.
