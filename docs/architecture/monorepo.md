# Monorepo Architecture

*Snapshot: April 2026*

## Overview

Design system monorepo shipping Web Components, design tokens, and layout primitives — plus a full-stack blog/portfolio app built on top of them. Everything is TypeScript, built with Vite, tested with Vitest and Playwright.

## Toolchain

| Tool | Role | Version |
|---|---|---|
| proto | Version pinning (Node, Moon) | `.prototools` |
| Moon | Task runner, build orchestration | 2.0.4+ |
| npm workspaces | Package linking | — |
| Vite | Build (libraries + apps) | 8.x |
| Vitest | Unit tests (happy-dom) | 4.x |
| Playwright | Visual regression + a11y tests | — |
| TypeScript | Strict mode, ES2022, bundler moduleResolution | 5.x |
| ESLint + Prettier | Linting + formatting | — |
| husky + lint-staged | Pre-commit: html-validate + stylelint + eslint + prettier | — |

No Webpack, no Lerna, no Turborepo. The stack is intentionally minimal.

## Dependency Graph

```
                    @maneki/foundation (zero deps)
                   /     |      |       \        \
                  /      |      |        \        \
    ui-components  grid-layout  flex-layout  charts
         (+ lit)
                   \     |      |       /        /
                    \    |      |      /        /
                   ┌─────┴──────┴─────┴────────┘
                   │                            │
              @maneki/catalog               @maneki/blog
           (all 5 packages)          (foundation + ui-components
                                      + grid-layout + hono/turso/lit)
```

Foundation is the root — zero runtime dependencies, pure token generation. The four library packages (ui-components, grid-layout, flex-layout, charts) are siblings that don't depend on each other. The two apps sit at the top of the graph.

### Dependency Details

| Package | Production deps | Notes |
|---|---|---|
| foundation | none | Pure TypeScript, zero deps |
| ui-components | foundation, lit | Lit for new components only |
| grid-layout | foundation | Zero-dep layout engine |
| flex-layout | foundation | ui-components is devDep only |
| charts | foundation | SVG chart components |
| catalog (app) | all 5 packages | Visual catalog + Playwright tests |
| blog (app) | foundation, ui-components, grid-layout, hono, @libsql/client, lit, zod, leaflet | Full-stack app |

## Build Orchestration

Moon auto-discovers projects via `apps/*` and `packages/*` globs. Build tasks declare dependencies using Moon's `deps` and `dependsOn` fields.

### Build Pipeline

Libraries: `vite build && tsc --emitDeclarationOnly` → `dist/`
- Vite builds JS first, then tsc generates `.d.ts` files
- Order matters: tsc first would have its output wiped by Vite's `emptyOutDir`

Apps: `vite build` → `dist/`

### Moon Task Dependencies

| Package | Build deps | Effect |
|---|---|---|
| foundation | none | Builds first, standalone |
| ui-components | `^:build` | Waits for foundation |
| charts | `foundation:build` | Waits for foundation (explicit) |
| grid-layout | none declared | Builds independently |
| flex-layout | none declared | Builds independently |
| catalog | `^:build` | Waits for all npm deps to build |
| blog | `^:build` | Waits for all npm deps to build |

### Dev-Time Resolution

`shared/vite-dev-aliases.ts` maps all `@maneki/*` imports to source (`src/index.ts`) during `vite serve`. This bypasses `dist/` entirely, giving instant HMR across package boundaries without rebuilding. Covers: foundation (+ assets + heroui-theme), ui-components (barrel + deep imports), grid-layout, flex-layout, charts.

Production builds use `dist/` via package `exports` maps — no aliases.

## Architectural Principles

### Zero Runtime Dependencies (libraries)

Foundation has zero deps. Layout packages depend only on foundation. ui-components adds Lit as its sole external dep (for new components). This keeps bundle sizes small and avoids version conflicts for consumers.

### Web Components + Shadow DOM

All UI is custom elements with Shadow DOM encapsulation. CSS custom properties (`--fd-*`, `--ui-*`, `--grid-*`, `--flex-*`, `--chart-*`) are the theming API. No global CSS leakage, no specificity wars.

### Two Component Paradigms

Existing components use vanilla `HTMLElement` with imperative DOM construction. New components use Lit (`LitElement`, decorators, `html` templates). This is a conscious transitional state documented in ADR-028 — no obligation to migrate existing components.

### Design Tokens as Source of Truth

Figma "Foundation UI Kit (Community)" is the source of truth. Tokens are extracted into TypeScript, generated as CSS custom properties via `injectAllTokens()`, and consumed by components through type-safe helpers (`colorVar()`, `semanticVar()`, `spaceVar()`). Pre-computed constants (`TEXT_PRIMARY`, `SP_1`) avoid repeated function calls.

### Dark Theme via Data Attribute

Two theme systems coexist:
- Default: `[data-theme="dark"]` on `:root`
- HeroUI: `[data-theme="heroui"]` / `[data-theme="heroui-dark"]`

Blog uses HeroUI exclusively. Catalog supports both via theme switcher.

### Branch-Per-Change Workflow

Every change gets its own branch (`feat/ui-*`, `fix/*`, `refactor/*`). No direct pushes to `main`. PRs required. Visual Figma verification required for UI changes.

## Testing Strategy

| Layer | Tool | Scope |
|---|---|---|
| Unit tests | Vitest + happy-dom | All packages, co-located (`foo.ts` → `foo.test.ts`) |
| Visual regression | Playwright screenshots | Catalog (55 pages), grid-layout (fixtures) |
| Accessibility | axe-core via Playwright | Catalog (55 pages) |
| Type checking | `tsc --noEmit` | Per-package |
| Linting | ESLint, stylelint, html-validate | Pre-commit hook |

CI runs on PRs (`.github/workflows/test.yml`). Deploy workflows for blog and catalog.

## Deployment

| App | Platform | Strategy |
|---|---|---|
| Catalog | Cloudflare Pages | Static site, deploy on PR merge |
| Blog | Cloudflare Pages + Functions | Static + serverless API, deploy via GitHub Actions `repository_dispatch` |

## Known Issues

1. **Missing Moon build deps for grid-layout and flex-layout.** Both depend on `@maneki/foundation` at runtime but don't declare `^:build` or `foundation:build` in their moon.yml. Clean builds from scratch could fail if foundation hasn't been built yet.

2. **Inconsistent build order in flex-layout.** Runs `tsc && vite build` while every other package runs `vite build && tsc --emitDeclarationOnly`. The tsc-first order means `.d.ts` files get wiped by Vite's `emptyOutDir`.

3. **Incomplete `dependsOn` in catalog moon.yml.** Lists foundation and ui-components but not grid-layout, flex-layout, or charts. The `^:build` dep catches these at build time, but Moon's project graph is incomplete.

4. **Duplicate admin route entries in blog vite.config.** `/admin/gallery` and `/admin` appear twice in the `adminRoutes` object. No bug (second overwrites first), but dead code.

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records.*
