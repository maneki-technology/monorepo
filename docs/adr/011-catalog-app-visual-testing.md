# ADR-011: Catalog App for Visual Testing

**Status:** Accepted
**Date:** 2026-03
**Context:** Need a reliable way to visually verify all components and catch regressions. Chromatic (cloud-based Storybook visual testing) was previously used.

## Decision

Replace Chromatic with a dedicated catalog app (`apps/catalog/`) that renders all components as static pages, tested via Playwright screenshot comparison + axe-core accessibility audits.

## Rationale

- **Deterministic rendering.** The catalog is a plain Vite SPA — no Storybook runtime, no addon interference. What you see is what Playwright screenshots.
- **Local-first.** Tests run locally in ~50 seconds. No cloud dependency, no API keys, no per-snapshot billing.
- **Dogfooding.** The catalog itself uses the design system components (sidebar = `<ui-side-panel-menu>`, cards = `<ui-card>`, etc.), catching integration issues that isolated Storybook stories miss.
- **Accessibility built-in.** axe-core scans every page for WCAG 2.1 AA violations as part of the test suite — not a separate tool.
- **PWA.** The catalog is deployed as a PWA on Cloudflare Pages, accessible to designers and stakeholders without running a dev server.

## Architecture

- 57 page modules (6 foundation + 51 component), each calling `registerPage()`
- Hash-based router (`/#button`, `/#colors`)
- Playwright tests: 57 visual screenshots + 57 axe-core a11y audits + sidebar + full layout = ~115 tests
- Shared `e2e/helpers.ts` with page list and navigation helper

## Consequences

- Storybook is still available for development (interactive props, controls) but is not the source of truth for visual testing.
- Chromatic integration removed (PR #112).
- Baseline snapshots are platform-specific (Chromium on macOS). CI may need its own baselines.
- New components must be added to both `main.ts` (page import), `manifest.ts` (sidebar entry), `helpers.ts` (page list), and `visual.spec.ts`/`a11y.spec.ts` (test coverage).

## Alternatives Considered

- **Chromatic** — cloud-based, per-snapshot pricing, depends on Storybook rendering which can differ from production.
- **Storybook test runner** — runs in Storybook's iframe context, not representative of real usage.
- **Percy/Applitools** — similar cloud-based visual testing with vendor lock-in.
