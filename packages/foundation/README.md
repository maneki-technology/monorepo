# @maneki/foundation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Design tokens extracted from the "Foundation UI Kit (Community)" Figma file. Generates CSS custom properties for colors, semantic tokens, elevation, typography, spacing, and responsive breakpoints. Zero dependencies, pure TypeScript.

- 131 palette colors (13 families × 10 steps + Gray 110)
- Semantic tokens: surface, elevation, border, text, icon, global, status
- 19 typography tokens across 7 groups (display, heading, body, ui, caption, badge, code)
- 17-step spacing scale based on 8px base unit
- 5 elevation levels
- Responsive breakpoints: 3 densities × 7 breakpoints
- CSS custom property injection with `var()` helpers
- TypeScript types included
- Zero runtime dependencies

## Install

```bash
npm install @maneki/foundation
```

## Quick Start

```ts
import { injectAllTokens } from '@maneki/foundation';

// Inject all CSS custom properties onto :root
injectAllTokens();
```

## Usage

### Colors

13 families: Red, Orange, Yellow, Lime, Green, Teal, Turquoise, Aqua, Blue, Ultramarine, Purple, Pink, Gray. Steps 10–100 (plus Gray 110).

```ts
import { colors, colorVar } from '@maneki/foundation';

// Direct value access
colors.blue[60]; // "#2680EB"

// CSS var() reference
colorVar("blue", 60); // "var(--fd-color-blue-60)"
```

### Semantic Tokens

```ts
import { semanticVar, elevationVar } from '@maneki/foundation';

semanticVar("surface", "primary");            // "var(--fd-surface-primary)"
semanticVar("text", "primary");               // "var(--fd-text-primary)"
semanticVar("border", "minimal");             // "var(--fd-border-minimal)"
semanticVar("icon", "action");                // "var(--fd-icon-action)"
semanticVar("global", "brand");               // "var(--fd-global-brand)"
semanticVar("status", "surface-error-bold");  // "var(--fd-status-surface-error-bold)"
elevationVar("03");                           // "var(--fd-elevation-03)"
```

### Typography

Groups: display (xl/lg/md), heading (01–07), body (01–03), ui (01–02), caption (01), badge (01), code (01–02). Font families: Goldman Sans (primary), Roboto Mono (code).

```ts
import { typeVar, typography } from '@maneki/foundation';

typeVar("heading", "01", "fontSize");   // "var(--fd-type-heading-01-font-size)"
typeVar("body", "01", "lineHeight");    // "var(--fd-type-body-01-line-height)"

// Direct access
typography.heading["01"].fontSize;      // "2rem"
```

### Spacing

17-step scale with an 8px base unit.

```ts
import { spaceVar, spacing } from '@maneki/foundation';

spaceVar("2");    // "var(--fd-space-2)"   → 16px
spaceVar("0.5");  // "var(--fd-space-0-5)" → 4px

// Direct access
spacing["2"];     // 16
```

| Step | Value |
|------|-------|
| 0 | 0px |
| 1px | 1px |
| 0.25 | 2px |
| 0.5 | 4px |
| 0.75 | 6px |
| 1 | 8px |
| 1.5 | 12px |
| 2 | 16px |
| 2.5 | 20px |
| 3 | 24px |
| 4 | 32px |
| 5 | 40px |
| 6 | 48px |
| 7 | 56px |
| 8 | 64px |
| 9 | 72px |
| 10 | 80px |

### Responsive Breakpoints

3 densities: compact, standard, spacious. 7 breakpoints: xs (360), s (600), m (768), l (1024), xl (1280), xxl (1440), xxxl (1600+). Breakpoints are JS-only — no CSS custom properties are generated for them.

```ts
import { getBreakpoint, getBreakpointConfig, breakpointMediaQuery } from '@maneki/foundation';

getBreakpoint(1024);                    // "l"
getBreakpoint(1024, "compact");         // "l"
getBreakpointConfig(1024, "standard");  // { minWidth: 1024, maxWidth: 1279, columns: 12, margin: 32, gutter: 24 }
breakpointMediaQuery("l", "standard");  // "(min-width: 1024px) and (max-width: 1279px)"
```

## CSS Custom Properties

All tokens (except breakpoints) are injected as CSS custom properties on `:root` via `injectAllTokens()`.

| Token Type | Prefix | Example |
|---|---|---|
| Palette | `--fd-color-{family}-{step}` | `--fd-color-blue-60` |
| Surface | `--fd-surface-{name}` | `--fd-surface-primary` |
| Border | `--fd-border-{name}` | `--fd-border-minimal` |
| Text | `--fd-text-{name}` | `--fd-text-primary` |
| Icon | `--fd-icon-{name}` | `--fd-icon-action` |
| Global | `--fd-global-{name}` | `--fd-global-brand` |
| Status | `--fd-status-{group}-{name}` | `--fd-status-surface-error-bold` |
| Elevation | `--fd-elevation-{level}` | `--fd-elevation-03` |
| Typography | `--fd-type-{group}-{key}-{prop}` | `--fd-type-heading-01-font-size` |
| Spacing | `--fd-space-{step}` | `--fd-space-2-5` |

## Development

```bash
moon run foundation:build    # vite build + tsc --emitDeclarationOnly → dist/
moon run foundation:test     # vitest --run (55 tests)
```

## License

MIT
