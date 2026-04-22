# Flex Layout Architecture

*Snapshot: April 2026*

## Overview

`@maneki/flex-layout` is a panel-based flex layout Web Component system for dashboard-style interfaces. Three custom elements (`<flex-layout>`, `<flex-panel>`, `<flex-panel-header>`) extracted from the Figma "Flex Layout" page. TypeScript, Vite, Shadow DOM, Constructable Stylesheets. 50 unit tests.

## Structure

```
packages/flex-layout/
├── src/
│   ├── components/
│   │   ├── flex-layout.ts           # <flex-layout> container
│   │   ├── flex-layout.test.ts
│   │   ├── flex-panel.ts            # <flex-panel> content panel
│   │   ├── flex-panel.test.ts
│   │   ├── flex-panel-header.ts     # <flex-panel-header> title/tabs header
│   │   └── flex-panel-header.test.ts
│   └── index.ts                     # Barrel export
├── package.json
├── tsconfig.json
├── vite.config.ts
└── moon.yml
```

## Components

### `<flex-layout>`

Flex container with size-based gap and padding presets. The `size` attribute selects a preset derived from Figma measurements. `direction` controls flex axis.

| Attribute | Type | Default |
|---|---|---|
| `size` | `"large" \| "medium" \| "small"` | `"medium"` |
| `direction` | `"row" \| "column"` | `"row"` |

Size presets:

| Size | Gap | Padding |
|---|---|---|
| large | 8px | 8px |
| medium | 8px | 8px |
| small | 4px | 4px |

CSS custom properties: `--flex-bg`, `--flex-gap`, `--flex-padding`, `--flex-direction`, `--flex-align`.

No ARIA role is set on the container. Consumers add `role="region"` and `aria-label` when the layout represents a named region.

### `<flex-panel>`

Content panel with an optional named `header` slot. Grows to fill available space by default. A `width` attribute pins the panel to a fixed pixel width, overriding flex growth. `no-padding` removes the default content padding for panels that need edge-to-edge content.

| Attribute | Type | Default |
|---|---|---|
| `width` | `number \| null` | `null` |
| `no-padding` | boolean | `false` |

Carries `role="group"`. CSS custom properties: `--flex-panel-flex`, `--flex-panel-bg`, `--flex-panel-padding`, `--flex-panel-divider`.

### `<flex-panel-header>`

Header bar with title text and/or tab content. Three variants cover the common Figma patterns: title-only, tabs-only, and title-with-tabs. Size presets control height and font size.

| Attribute | Type | Default |
|---|---|---|
| `variant` | `"title" \| "tabs" \| "title-tabs"` | `"title"` |
| `size` | `"large" \| "medium" \| "small"` | `"medium"` |
| `heading` | `string` | `""` |

Slots: `action` (named, for an icon button), `tabs` (named, for tab content).

Size presets:

| Size | Height | Font Size |
|---|---|---|
| large | 32px | 12px |
| medium | 24px | 12px |
| small | 20px | 11px |

Carries `role="toolbar"`. CSS custom properties: `--flex-header-bg`, `--flex-header-height`, `--flex-header-color`, `--flex-header-divider`, `--flex-header-font-size`, `--flex-header-font-weight`, `--flex-header-line-height`, `--flex-header-icon-size`, `--flex-header-icon-color`, `--flex-header-padding-*`.

## Constructable Stylesheets

All three components use Constructable Stylesheets rather than injecting `<style>` elements. A `CSSStyleSheet` is created at module level (`const sheet = new CSSStyleSheet(); sheet.replaceSync(STYLES)`), then adopted in the constructor (`shadow.adoptedStyleSheets = [sheet]`). The sheet is shared across all instances of a component, avoiding per-instance style parsing.

## Nesting

`<flex-layout>` inside `<flex-panel>` is supported and the primary way to build split layouts (top/bottom, left/right, or mixed). There's no depth limit.

## Design Decisions

**Constructable Stylesheets over template literals.** Injecting a `<style>` element per instance works but parses the CSS string once per element. Constructable Stylesheets parse once at module load and share the result across all instances. For a layout primitive that may appear many times on a page, this is a meaningful difference.

**No default ARIA role on `<flex-layout>`.** The container is a generic layout primitive. Assigning `role="region"` unconditionally would require a unique `aria-label` on every instance to avoid landmark violations. Leaving it to consumers avoids false positives in accessibility audits.

**`role="group"` on panels, `role="toolbar"` on headers.** Panels group related content without creating a landmark. Headers carry toolbar semantics because they typically contain interactive controls (action buttons, tabs).

**`role="banner"` is explicitly avoided on headers.** Multiple `role="banner"` elements on a page cause duplicate landmark violations. `role="toolbar"` is the correct role for a panel header bar.

## Testing

50 unit tests (Vitest + happy-dom), co-located with source files.

## Known Issues

1. **No Playwright visual tests.** Unlike grid-layout, flex-layout has no screenshot regression tests. Visual correctness is verified manually against the catalog.

2. **Inconsistent build order.** `moon.yml` runs `tsc && vite build` while every other package runs `vite build && tsc --emitDeclarationOnly`. The tsc-first order means `.d.ts` files get wiped by Vite's `emptyOutDir`. This is tracked in the monorepo known issues.

3. **No Moon build dependency on foundation.** Depends on `@maneki/foundation` at runtime but doesn't declare it in `moon.yml`. Same issue as grid-layout.

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records.*
