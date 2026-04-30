# ADR-032: Three-Regime Directional Change Strategy

## Status

Accepted

## Context

The initial 2-regime strategy (BULL/BEAR) used a 60-day MA to determine regime and applied DC trading + trailing stop in both. Backtesting showed the trailing stop was too aggressive in sideways markets, exiting positions prematurely during consolidation.

## Decision

Adopt a 3-regime strategy: BULL, SIDEWAYS, BEAR. Regime is determined by price relative to the 60-day MA with a 3% buffer zone:

- **BULL** (price > MA + 3%): Hold position, no trailing stop, DC exits only.
- **SIDEWAYS** (MA - 3% ≤ price ≤ MA + 3%): DC trading only, no trailing stop.
- **BEAR** (price < MA - 3%): DC trading + vol-trailing stop (2% / 72h).

Parameters: λ=0.07 (DC threshold), 60-day MA, 3% buffer, long-only.

## Rationale

Backtesting over 2019–2026 on $1K:
- 3-regime: +4,071% ($40.7K), lower drawdown, higher Sharpe
- 2-regime: +3,140% ($31.4K)

The buffer zone prevents whipsawing at the MA boundary. Trailing stop only activates in BEAR, where downside protection matters most. SIDEWAYS lets DC theory work without premature exits.

## Consequences

- Checkpoint format upgraded to DCTRADE4 (magic `0x4443_5452_4144_4534`) with regime encoded as scalar[8]: 0=bear, 1=bull, 2=sideways.
- Old DCTRADE3 checkpoints are rejected on load (test covers this).
- Regime transitions logged to Turso and notified via Telegram.
- 3 additional unit tests for regime transitions and sideways behavior.

## Alternatives Considered

- **2-regime (BULL/BEAR)** — simpler but worse returns and higher drawdown in sideways markets.
- **HMM-based regime detection** — tested in Python lab (`hmmlearn`). More complex, no significant improvement over MA + buffer for this strategy.
- **Adaptive λ** — varying DC threshold by regime. Tested, marginal improvement, added complexity.
