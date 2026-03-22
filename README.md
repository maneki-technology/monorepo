# maneki-monorepo

Design system monorepo with Web Components and design tokens extracted from Figma "Foundation UI Kit (Community)". TypeScript, Vite, Vitest.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Toolchain

- [proto](https://moonrepo.dev/proto) — version pinning (Node 22.16.0, Moon 2.0.4)
- [Moon](https://moonrepo.dev/moon) — task runner and build orchestration
- npm workspaces — package linking

---

## Structure

```
maneki-monorepo/
├── .prototools              # node 22.16.0, moon 2.0.4
├── .moon/                   # Moon workspace + toolchain config
├── .storybook/              # Root Storybook config (aggregates all packages)
├── docs/                    # ADRs + lessons learned
├── package.json             # npm workspaces root + Storybook scripts
├── packages/
│   ├── foundation/          # Design tokens (@maneki/foundation)
│   ├── ui-components/       # Web Components + Storybook (@maneki/ui-components)
│   ├── grid-layout/         # Grid layout library (@maneki/grid-layout)
│   └── flex-layout/         # Panel-based flex layout (@maneki/flex-layout)
```

---

## Packages

| Package | npm name | Description |
|---|---|---|
| `foundation` | `@maneki/foundation` | Design tokens: 131 colors, semantic tokens, typography, spacing, elevation, breakpoints, dark theme, shape, token constants |
| `ui-components` | `@maneki/ui-components` | 50 Web Components (button, badge, image, icon, tag, avatar, alert, label, link, checkbox, radio, input, textarea, file-upload, select, card, breadcrumb, accordion, dropdown, menu, modal, side-panel-menu, tabs, table, carousel, calendar, calendar-quicklinks, calendar-time, datetime-picker, clock, list-item, list-header, list-group) with Storybook 10 |
| `grid-layout` | `@maneki/grid-layout` | Zero-dep drag/resize grid layout (220 tests) |
| `flex-layout` | `@maneki/flex-layout` | Panel-based flex layout for dashboard-style interfaces (3 components, 50 tests) |

### Apps

| App | Description |
|---|---|
| `catalog` | Visual catalog for all foundation tokens + UI components. 57 pages, 115 Playwright tests (57 visual + 57 a11y + sidebar). Dark theme toggle. |
| `blog` | Personal blog + portfolio. Markdown posts with frontmatter, Vite virtual module plugin, static generation, dark theme. 5 routes. |

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

# Storybook (all packages)
npm run storybook            # Dev server on port 6006
npm run storybook:build      # Static build → storybook-static/
```

---

## Conventions

- Zero runtime dependencies (except ui-components depends on foundation)
- Web Components with Shadow DOM
- CSS custom properties, prefixed per package: `--fd-*`, `--ui-*`, `--grid-*`, `--flex-*`
- TypeScript strict mode, ES2022 target
- Tests co-located: `foo.ts` → `foo.test.ts`
- Moon tasks in kebab-case: `build`, `test`, `test-watch`, `dev`, `storybook`
- Dark theme support via `[data-theme="dark"]` attribute
- Architectural Decision Records in `docs/adr/`

## Visual Catalog

Browse all components: [Maneki Catalog](https://maneki-catalog.pages.dev/)
---

## License

MIT
