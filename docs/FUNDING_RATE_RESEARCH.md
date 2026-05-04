# Funding Rate Entry Filter — Research Results

## Summary

Skipping DC entry signals when the 24h average Binance futures funding rate exceeds 0.010% improves out-of-sample returns by +77.6% with identical max drawdown. Integrated into the bot in PR #448.

## Background

Binance perpetual futures funding rate is a periodic payment (every 8h) between longs and shorts. Positive rate means longs pay shorts (market is overleveraged bullish). The hypothesis: elevated funding rate precedes losing DC entries at market tops.

## Data

- 7,281 historical BTCUSDT funding rate records (2019–2026)
- Source: Binance public API (`GET /fapi/v1/fundingRate`, no auth)
- Scripts: `labs/dctrading/scripts/fetch_funding_rates.py`, `analyze_funding_leadlag.py`, `backtest_funding.py`, `backtest_funding_traintest.py`

## Key Finding

Funding rate is elevated 1.8x in the 24h before DC DOWN events (tops) vs UP events (bottoms). Signal strongest at 8–24h lookback, fades by 48h+.

## Train/Test Validation (2017–2020 / 2021–2026)

| Metric | Test Baseline | Test w/ Funding | Delta |
|--------|--------------|-----------------|-------|
| Return | 192.5% | 270.1% | **+77.6%** |
| Sharpe | 2.378 | 2.944 | **+23.8%** |
| Max DD | 42.5% | 42.5% | same |
| Trades | 142 | 126 | -16 skipped |
| Win Rate | 33.1% | 34.1% | +1.0pp |

Not overfit — test improvement (+77.6%) exceeds training improvement (+41.1%).

## Variants Tested

17 variants including spot rate, 24h average, trailing stop tightening, and combined. The 24h rolling average with skip threshold was the clear winner.

## Integration

- Fetch funding rate from Binance every 8h (3 most recent periods → 24h average)
- Skip DC entries when avg > 0.010%
- BULL buy-and-hold unaffected
- Configurable via `FUNDING_SKIP_THRESHOLD` env var (default: 0.0001)
- Backtest uses `funding_rates.csv` with sliding window

## Limitations

- Funding rate is a lagging indicator of leverage, not a leading indicator of price
- Filters bad entries but doesn't predict good ones
- Requires Binance futures API access (public, no auth, but may be blocked in some regions)

## References

- Issue #445: Research proposal
- PR #446: Research scripts and backtest results
- PR #448: Bot integration
