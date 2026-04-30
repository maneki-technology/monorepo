# ADR-033: Alpaca as Source of Truth for Positions

## Status

Accepted

## Context

The bot calculates position size internally (`capital / price`), but Alpaca may fill a different quantity due to precision limits and price drift between signal and execution. This creates a discrepancy between internal state and actual position.

## Decision

Alpaca fill data is the source of truth for position quantity and entry price. After every buy order:

1. Poll Alpaca for fill status (up to 10s).
2. Use `fill_price` and `fill_qty` to update internal `strategy.entry_price` and `strategy.size`.
3. Add back unspent capital from qty rounding to `strategy.capital` (internal adjustment only, not logged to ledger since the BUY ledger entry already uses actual fill qty).

On startup, reconcile internal state with Alpaca's position endpoint.

## Rationale

- **Prevents PnL drift.** If internal state says 9.605 BTC but Alpaca holds 9.60, every equity calculation is wrong.
- **Signal vs fill tracking.** `signal_price` is preserved in the `positions` table alongside `alpaca_order_id` for post-trade analysis of execution quality.
- **Startup resilience.** If the bot restarts mid-position, Alpaca reconciliation restores correct state without relying on checkpoint freshness.

## Consequences

- `positions` table has `signal_price` and `alpaca_order_id` columns.
- Bot fails to start without Alpaca credentials (intentional — no paper trading = no trading).
- Neko Trade app reads position from Alpaca directly, not from Turso.
- 3 unit tests cover qty rounding, exact fill, and price drift scenarios.

## Alternatives Considered

- **Internal state as source of truth** — simpler but accumulates drift over multiple trades.
- **Turso as source of truth** — adds latency and a failure point. Alpaca is already the execution venue.
