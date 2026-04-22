# Catalog Architecture

*Snapshot: April 2026*

## Overview

`@maneki/catalog` is a visual catalog app for the Maneki design system. It renders all foundation tokens and UI components with key variants on static pages, and serves as the target for Playwright visual regression and accessibility tests. Pure Vite + vanilla TypeScript — no framework.

55 pages (6 foundation + 49 component). 114 Playwright tests (55 visual + 55 a11y + sidebar + full layout).

## Structure

```
catalog/
├── index.html              # App shell (sidebar + content area + theme toggle)
├── src/
│   ├── main.ts             # Entry: token injection, icon font, page imports, router
│   └── pages/              # 55 page modules
│       ├── colors.ts       # Foundation pages (6)
│       ├── spacing.ts
│       ├── typography.ts
│       ├── elevation.ts
│       ├── semantic-tokens.ts
│       ├── shape.ts
│       ├── badge.ts        # Component pages (49)
│       ├── button.ts
│       └── ...
├── e2e/
│   ├── helpers.ts          # Shared page list + test utilities
│   ├── visual.spec.ts      # 55 visual screenshot tests + sidebar + full layout
│   ├── a11y.spec.ts        # 55 accessibility tests (axe-core)
│   └── snapshots/          # Baseline screenshots (committed)
├── vite.config.ts
├── playwright.config.ts
└── moon.yml
```

## Page Registration System

Each page module calls `registerPage(id, { title, section, render, setup? })`:

- `id` — URL path segment (e.g., `"button"` → `/button`)
- `title` — displayed as `<h2>` heading
- `section` — sidebar group (`"Foundation"` or `"Components"`)
- `render()` — returns plain HTML string with web component tags
- `setup()` — optional post-render callback for imperative DOM manipulation (e.g., `setItems()`)

Pages are imported in `main.ts`. The import triggers `registerPage()`, which adds the page to the sidebar and router.

## Routing

History API routing. `history.pushState()` + `popstate` event. Sidebar links intercept clicks and push state. `popstate` triggers re-render of the content area.

No SPA framework, no hash routing. Clean URLs like `/button`, `/colors`.

## Visual Regression Testing

Playwright screenshots target the `#content` element (excludes sidebar for focused component comparison). One test per page, plus sidebar and full-layout tests.

Configuration:
- Browser: Chromium only
- Viewport: 1280×900
- Pixel diff threshold: 1% (`maxDiffPixelRatio: 0.01`)
- Server: `vite preview` (production build) for deterministic rendering
- Snapshots: platform-specific (chromium on macOS), committed to repo

The shared `pages` array in `e2e/helpers.ts` drives both visual and a11y specs — adding a page ID there automatically creates both test types.

## Accessibility Testing

Per-page a11y tests using `@axe-core/playwright`. Each page is loaded and scanned for WCAG violations. Uses the same shared `pages` array from `helpers.ts`.

## Theme Support

Two theme systems supported via a toggle in the app shell:
- Default: `[data-theme="dark"]` on `:root`
- HeroUI: `[data-theme="heroui"]` / `[data-theme="heroui-dark"]`

All semantic tokens switch to dark values when the theme attribute changes.

## Design Decisions

1. **Plain HTML strings, no framework.** `render()` returns template literal HTML. No Lit, no JSX, no CSF stories. This keeps the catalog simple and ensures screenshots capture the actual component rendering, not framework artifacts.

2. **CSS classes from index.html.** Layout utilities (`variant-row`, `variant-col`, `variant-label`, `variant-group`) are defined in the app shell HTML, not per-page. Consistent layout across all pages.

3. **Components auto-registered.** `import "@maneki/ui-components"` in `main.ts` registers all custom elements globally. Pages just write the HTML tags.

4. **Production build for tests.** Playwright runs against `vite preview` (not dev server) for deterministic rendering. No HMR artifacts, no dev-only behavior.

5. **Single `pages` array drives all tests.** Adding a page ID to `e2e/helpers.ts` automatically creates both a visual screenshot test and an a11y scan. No separate test registration needed.

## Known Issues

1. **Snapshots are platform-specific.** Baseline screenshots are generated on macOS Chromium. CI environments may need their own baselines if font rendering differs.

2. **No open overlays in screenshots.** Dropdowns, modals, and popovers are not opened by default in page renders — they would overlay other content and break screenshots. This means overlay styling is not visually regression-tested.

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records.*
