# DCTrading Simulation Baselines

This file records known-good historical simulation outputs so PRs do not need to
rerun the full multi-year replay unless strategy, fee, fill, funding, or
simulation logic changes.

## 2019-2024 BTC LiveLoop Simulation

Purpose: validate the Zig `LiveLoop` order-flow path against the historical BTC
research dataset.

Inputs:

| Input | Value |
| --- | --- |
| Tick data | `labs/dctrading/data/cache/backtest_2019_2024.csv` |
| Funding data | `services/dctrading-bot/funding_rates.csv` |
| Threshold | `0.07` |
| Initial capital | `1000` |
| Funding skip threshold | default `0.0001` |

Command:

```bash
cd services/dctrading-bot
zig build -Doptimize=ReleaseFast
./zig-out/bin/dctrading sim:../../labs/dctrading/data/cache/backtest_2019_2024.csv 0.07 1000
```

Expected headline output:

| Metric | Expected |
| --- | ---: |
| Ticks | 3,152,369 |
| Funding rates | 7,281 |
| PnL | $40,390.77 |
| Return | 4,039.08% |
| Buy and hold | 2,436.87% |
| Trades | 136 |
| Buys filled | 137 / 137 |
| Sells filled | 136 / 136 |
| Cancels | 0 |
| Pending | 0 |
| Capital | $41,390.77 |

Per-trade baseline:

| Artifact | Value |
| --- | --- |
| CSV | [`dctrading_simulation_trades_2019_2024.csv`](./dctrading_simulation_trades_2019_2024.csv) |
| Rows | 136 trades plus header |
| SHA-256 | `4d822298e9bd369e833b60a4b930ea339df7c17a05435ded6dccbbc19bd68735` |

Columns:

| Column | Meaning |
| --- | --- |
| `entry_price` | Trade entry price |
| `exit_price` | Trade exit price |
| `pnl` | Net trade PnL after fee estimate |
| `exit_type` | `DC` directional-change exit or `SL` trailing-stop exit |
| `entry_time` | Unix timestamp in seconds |
| `exit_time` | Unix timestamp in seconds |

Python cross-validation:

```bash
cd labs/dctrading
PYTHONPATH=src python3 scripts/backtest_crossval.py
```

The Python lab's production-equivalent strategy reference is
`scripts/backtest_crossval.py`, which uses the same direct 3-regime classifier
as Zig production:

- `price > 60d MA * 1.03` -> `BULL`
- `price < 60d MA * 0.97` -> `BEAR`
- otherwise -> `SIDEWAYS`

The Python `With Funding Filter` result should match the Zig LiveLoop simulation
on the key totals when the Zig process sees `funding_rates.csv` in its working
directory:

| Metric | Expected |
| --- | ---: |
| Trades | 136 |
| PnL | $40,390.77 |
| Return | 4,039.08% |
| Capital | $41,390.77 |
| Funding skips | 22 |

The Python `Without Funding Filter` result matches Zig direct backtest and
`sim:` LiveLoop when Zig is run from a directory without `funding_rates.csv`:

| Metric | Expected |
| --- | ---: |
| Trades | 156 |
| PnL | $30,128.23 |
| Return | 3,012.82% |
| Capital | $31,128.23 |

Do not compare these production baselines to
`labs/dctrading/src/dctrading/live/engine.py`; that module is an older
experimental sticky BULL/BEAR prototype and does not implement the current
production `SIDEWAYS` behavior.
