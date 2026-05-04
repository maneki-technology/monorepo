# maneki-monorepo

Polyglot engineering monorepo: a design system built with Web Components, a full-stack blog/portfolio app, an algorithmic BTC trading bot (Zig), a SwiftUI trading dashboard, and a Python research lab. TypeScript, Zig, Swift, Python.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🐱 **[Browse the Visual Catalog](https://ui.maneki.tech)**

---

## Toolchain

- [proto](https://moonrepo.dev/proto) — version pinning (Node 22.16.0, Moon 2.2.1)
- [Moon](https://moonrepo.dev/moon) — task runner and build orchestration
- npm workspaces — package linking

---

## Structure

```
maneki-monorepo/
├── .prototools              # node 22.16.0, moon 2.2.1
├── .moon/                   # Moon workspace + toolchain config
├── docs/                    # ADRs + lessons learned
├── shared/                  # Dev aliases for cross-package HMR
├── package.json             # npm workspaces root
├── packages/
│   ├── foundation/          # Design tokens (@maneki/foundation)
│   ├── ui-components/       # 78 Web Components (@maneki/ui-components)
│   ├── charts/              # 11 SVG chart components (@maneki/charts)
│   ├── grid-layout/         # Drag/resize grid layout (@maneki/grid-layout)
│   └── flex-layout/         # Panel-based flex layout (@maneki/flex-layout)
├── services/
│   └── dctrading-bot/       # BTC trading bot (Zig 0.16, Binance WS, Alpaca)
├── labs/
│   └── dctrading/           # Trading research lab (Python, MLX, backtesting)
├── apps/
│   ├── catalog/             # Visual catalog + Playwright tests (@maneki/catalog)
│   ├── blog/                # Full-stack blog + portfolio (@maneki/blog)
│   └── neko-trade/          # Trading dashboard (SwiftUI, macOS + iOS)
```

---

## Packages

| Package | npm name | Description |
|---|---|---|
| `foundation` | `@maneki/foundation` | Design tokens: 131 colors, semantic tokens, typography, spacing, elevation, breakpoints, dark theme, shape, token constants |
| `ui-components` | `@maneki/ui-components` | 78 Web Components: primitives, form controls, data display, navigation, disclosure, menus, overlays, tabs, calendar, datetime picker, list, tree, steps, progress, carousel, and more |
| `charts` | `@maneki/charts` | 11 SVG chart Web Components: bar, line, pie, radar, scatter, polar, stacked bar, horizontal bar, stacked horizontal bar, multi-line, multitype |
| `grid-layout` | `@maneki/grid-layout` | Zero-dep drag/resize grid layout (3 components, 220 tests) |
| `flex-layout` | `@maneki/flex-layout` | Panel-based flex layout for dashboard-style interfaces (3 components, 50 tests) |

### Apps

| App | Description |
|---|---|
| `catalog` | Visual catalog for all design system packages. 69 pages, 120 Playwright tests (58 visual + 58 a11y + sidebar + full layout). Lazy-loaded pages, History API routing, PWA, theme switcher. |
| `blog` | Full-stack blog + portfolio. Hono API + Turso DB, CF Pages Functions, static prerendering, admin system (`/admin` hub, editor, gallery, pages editor), AI review/brainstorm panels (Claude via CF AI Gateway), photography management, deploy trigger, History API routing, PWA. |
| `neko-trade` | SwiftUI dashboard for the DCTrading bot. Bot status, equity chart, trade history, account ledger, live BTC price. macOS 13+ / iOS 16+. |

### Services

| Service | Stack | Description |
|---|---|---|
| `dctrading-bot` | Zig 0.16 | BTC algorithmic trading bot. Directional Change theory, 3-regime strategy (BULL/SIDEWAYS/BEAR), Binance WebSocket, Alpaca paper trading, Turso DB, Telegram/ntfy notifications. Non-blocking order flow, two-phase transfers. 155 tests. |

### Labs

| Lab | Stack | Description |
|---|---|---|
| `dctrading` | Python 3.12 | Trading research: vectorized backtesting (numpy), MLX sentiment analysis (Qwen3.5-9B-4bit), real-time Alpaca news monitor, regime comparison. |
---

## Getting Started

```bash
# Install toolchain
proto use

# Install dependencies
npm install

# Build all packages
moon check --all

# Run tests for a specific package
moon run foundation:test
moon run ui-components:test
moon run grid-layout:test
moon run flex-layout:test
moon run charts:test

# Visual catalog (dev)
moon run catalog:dev

# Blog (dev)
moon run blog:dev

# Trading bot (build + test)
moon run dctrading-bot:build
moon run dctrading-bot:test

# Trading research (backtest)
moon run dctrading:backtest-fast

# Neko Trade (build)
moon run neko-trade:build
```

---

## Conventions

- Web Components with Shadow DOM, CSS custom properties
- CSS prefixes per package: `--fd-*`, `--ui-*`, `--grid-*`, `--flex-*`, `--chart-*`
- TypeScript strict mode, ES2022 target
- Tests co-located: `foo.ts` → `foo.test.ts`
- Moon tasks in kebab-case: `build`, `test`, `test-watch`, `dev`, `test-visual`
- Dark theme via `[data-theme]` attribute on `:root`
- Architectural Decision Records in `docs/adr/`

---

## License

MIT
