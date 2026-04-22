# Foundation Architecture

*Snapshot: April 2026*

## Overview

`@maneki/foundation` is the root package of the design system. It holds all design tokens extracted from the "Foundation UI Kit (Community)" Figma file and generates CSS custom properties from them. Zero runtime dependencies, pure TypeScript.

Everything downstream (ui-components, grid-layout, flex-layout, charts, both apps) consumes foundation tokens. Nothing in foundation depends on any other package in the monorepo.

## Module Structure

```
packages/foundation/
├── assets/
│   ├── material-symbols-outlined-subset.woff2  # Subsetted icon font (~45 KB)
│   ├── icon-manifest.txt                       # Icon names in the subset
│   └── subset-icons.py                         # Script to regenerate the subset
└── src/
    ├── index.ts              # Barrel export
    ├── colors.ts             # 131 palette tokens (13 families x 10 steps + gray-110)
    ├── semantic-tokens.ts    # Surface, elevation, border, text, icon, global, status, state, form, tag, button tokens
    ├── dark-theme.ts         # Dark theme overrides (mirrors all semantic groups)
    ├── heroui-theme.ts       # HeroUI theme variant (blog-specific)
    ├── typography.ts         # 19 type tokens across 7 groups
    ├── spacing.ts            # 17-step spacing scale (8px base unit)
    ├── shape.ts              # Border-radius + border-width tokens
    ├── breakpoints.ts        # 3 density variants x 7 breakpoints + helpers
    ├── tokens.ts             # CSS generators + var() helpers
    ├── token-constants.ts    # Pre-computed var() references
    ├── icons.ts              # Icon codepoint constants + font/icon registry
    ├── tokens.test.ts        # 32 tests
    └── breakpoints.test.ts   # 27 tests
```

## Token Pipeline

```
Raw data modules
(colors.ts, semantic-tokens.ts, typography.ts, spacing.ts, shape.ts)
    |
    v
CSS generator functions in tokens.ts
(*ToCssProperties() — one per token category)
    |
    v
injectAllTokens()
Writes a single <style id="maneki-foundation-all"> onto :root.
Also writes [data-theme="dark"] overrides from dark-theme.ts.
    |
    v
var() helpers
colorVar(), semanticVar(), elevationVar(), typeVar(), spaceVar(),
radiusVar(), borderWidthVar(), shadowVar()
    |
    v
Pre-computed constants in token-constants.ts
TEXT_PRIMARY, SP_1, TYPE_BODY_02, SURFACE_ACTION, etc.
```

### Raw Data Modules

Each module exports plain TypeScript objects. No CSS, no DOM, no side effects.

- `colors.ts` — 131 hex values keyed by family and step (e.g. `colors.blue[60]`)
- `semantic-tokens.ts` — semantic groups keyed by name. Values are either hex strings, rgba strings, or `PaletteRef` objects (`{ family, step }`) that resolve to hex at generation time via `resolveSemanticValue()`
- `typography.ts` — type tokens with `fontFamily`, `fontSize`, `lineHeight`, `fontWeight` per token
- `spacing.ts` — numeric pixel values keyed by step (e.g. `spacing["2"] = 16`)
- `shape.ts` — border-radius and border-width values

### CSS Generators

`tokens.ts` contains one generator function per token category. Each returns a plain string of CSS declarations, no wrapping selector. The `toKebab()` helper converts camelCase object keys to kebab-case for property names.

`injectAllTokens()` calls all generators, wraps the combined output in `:root { ... }`, appends the dark theme overrides in `[data-theme="dark"] { ... }`, and writes a single `<style>` element to `document.head`. It checks for an existing element by id before injecting, making it idempotent. In dev mode with Vite HMR active, it replaces the existing element instead of skipping.

### var() Helpers

Each token category has a typed helper that returns a `var(--fd-...)` string. The helpers are type-safe: TypeScript enforces valid group/key combinations at call sites.

`typeBlock()` is a convenience helper that emits all four typography properties (font-family, font-size, line-height, font-weight) as a single interpolatable block for use in CSS template literals.

### Pre-Computed Constants

`token-constants.ts` calls the var() helpers once at module load and exports the results as named constants. Components import `TEXT_PRIMARY` instead of calling `semanticVar("text", "primary")` at every use site. This is purely ergonomic — the output is identical.

## CSS Custom Property Naming

All foundation properties use the `--fd-` prefix. The naming pattern after the prefix follows the token category and key.

| Category | Pattern | Example |
|---|---|---|
| Palette colors | `--fd-color-{family}-{step}` | `--fd-color-blue-60` |
| Semantic surface | `--fd-surface-{name}` | `--fd-surface-primary` |
| Semantic border | `--fd-border-{name}` | `--fd-border-minimal` |
| Semantic text | `--fd-text-{name}` | `--fd-text-primary` |
| Semantic icon | `--fd-icon-{name}` | `--fd-icon-action` |
| Global | `--fd-global-{name}` | `--fd-global-brand` |
| Status | `--fd-status-{group}-{name}` | `--fd-status-surface-error-bold` |
| Elevation | `--fd-elevation-{level}` | `--fd-elevation-03` |
| Shadow | `--fd-shadow-{name}` | `--fd-shadow-card` |
| Typography | `--fd-type-{group}-{key}-{prop}` | `--fd-type-heading-01-font-size` |
| Spacing | `--fd-space-{step}` | `--fd-space-2-5` |
| Shape radius | `--fd-radius-{name}` | `--fd-radius-s` |
| Shape border-width | `--fd-border-width-{name}` | `--fd-border-width-s` |
| Tag | `--fd-tag-{name}` | `--fd-tag-bold` |
| Button | `--fd-button-{name}` | `--fd-button-secondary` |
| State | `--fd-state-{group}-{name}` | `--fd-state-hover-border-moderate` |
| Form | `--fd-form-{name}` | `--fd-form-input-border` |

Dots in spacing steps become hyphens in property names (`--fd-space-0-75`, not `--fd-space-0.75`). camelCase semantic keys are converted to kebab-case by `toKebab()` at generation time.

## Dark Theme System

Foundation ships two parallel token sets: light (default) and dark.

Light values live in `semantic-tokens.ts`. Dark overrides live in `dark-theme.ts`, which mirrors every semantic group with dark-appropriate values. `injectAllTokens()` writes both into the same `<style>` block:

```css
:root {
  /* all light tokens */
}

[data-theme="dark"] {
  /* semantic + elevation + shadow overrides */
}
```

Toggling dark mode is a single attribute change on `:root`. Palette color tokens (`--fd-color-*`) are not overridden — they're static. Only semantic tokens change between themes.

Breakpoints, typography, spacing, and shape tokens have no dark variants.

## HeroUI Theme System

`heroui-theme.ts` is a second semantic token set targeting the HeroUI design language. It exports parallel data structures (`herouiSemanticTokens`, `herouiDarkSemanticTokens`, etc.) and a dedicated injection function `injectHerouiTheme()`.

HeroUI tokens are scoped to `[data-theme="heroui"]` and `[data-theme="heroui-dark"]` selectors rather than `:root`. The blog app uses HeroUI exclusively. The catalog app supports both the default theme and HeroUI via a theme switcher.

The two theme systems are independent. A page uses one or the other, not both simultaneously.

## Breakpoints

`breakpoints.ts` defines three layout densities (compact, standard, spacious), each with seven named breakpoints (xs through xxxl). Breakpoints are JS-only — no CSS custom properties are generated for them.

The module exports helper functions: `getBreakpoint()` resolves a pixel width to a breakpoint name, `getBreakpointConfig()` returns the full config object for a given width and density, and `breakpointMediaQuery()` generates a media query string. Components and apps call these at runtime or build time rather than reading CSS variables.

## Icon System

### Subset Font

Foundation ships a subsetted woff2 of Material Symbols Outlined (~45 KB). The subset contains only the glyphs used by the design system, identified by `assets/icon-manifest.txt`. The full Material Symbols font is not a dependency — the subset is committed directly to the repo.

`registerIconFont()` injects a `@font-face` rule pointing at the woff2. Components render icons by setting `font-family: "Material Symbols Outlined"` and placing the Unicode codepoint character as text content.

### Codepoint Constants

`icons.ts` exports a named constant for each icon (e.g. `ICON_CLOSE = "\uE5CD"`). Components reference these constants rather than raw Unicode escapes or ligature strings. This keeps the font file small and makes icon usage greedable across the codebase.

### Custom Icon Registry

`registerIcon()`, `resolveIcon()`, `hasIcon()`, `unregisterIcon()`, and `clearIcons()` form a runtime registry for custom SVG icons. Custom icons are stored as SVG strings keyed by name. Components call `resolveIcon()` to get either a codepoint (Material Symbol) or an SVG string (custom), then render accordingly. This allows apps to extend the icon set without modifying foundation.

`registerGeistFont()` is a separate utility that injects the Geist font face (self-hosted in foundation's assets) for use in the blog's signature animation.

## Design Decisions

### Zero Runtime Dependencies

Foundation has no production dependencies. Token data is plain TypeScript objects. CSS generation is string concatenation. No build-time CSS preprocessor, no runtime CSS-in-JS library. This keeps the package trivially consumable and avoids version conflicts for downstream packages.

### Figma as Source of Truth

All token values are extracted from the "Foundation UI Kit (Community)" Figma file. Foundation does not invent tokens. The one exception is interactive state tokens (e.g. `text.linkHover`, `text.linkActive`) which may be added when components need them, even if Figma doesn't define them explicitly.

Semantic tokens that resolve to the same hex value today are kept separate if they serve different semantic purposes in Figma. They may diverge in future Figma updates.

### Idempotent Injection

`injectAllTokens()` checks for an existing `<style id="maneki-foundation-all">` before writing. Calling it multiple times (e.g. from multiple components) is safe. In dev mode, HMR replaces the element so token changes are reflected without a full page reload.

### JS-Only Breakpoints

Breakpoints are not injected as CSS custom properties. The design system uses a JS-driven responsive layout model (via `grid-layout` and `flex-layout`) rather than CSS media queries in component stylesheets. Keeping breakpoints in JS makes them composable and testable without a browser.

### PaletteRef Resolution at Generation Time

Semantic tokens can reference palette colors by `{ family, step }` rather than hardcoding hex values. `resolveSemanticValue()` resolves these references when generating CSS, not at runtime. The generated CSS contains resolved hex values, so there's no runtime lookup cost and no dependency on the palette object after injection.

### Single Injected Style Block

All tokens are written into one `<style>` element rather than one per category. This minimizes DOM nodes and keeps the injection atomic. The element id (`maneki-foundation-all`) is stable, so HMR replacement is reliable.

## Known Issues

1. `injectColorTokens()` is exported as a standalone function but `injectAllTokens()` already includes palette colors. Calling both would inject colors twice (the second call is a no-op due to the id check, but the standalone function uses a different id `maneki-foundation-colors`, so they don't conflict — they just duplicate the palette properties).

2. Typography font sizes are stored as numbers in `typography.ts` but emitted as `{value}px` in `typographyToCssProperties()`. The `typeVar()` helper returns a `var()` reference to the px value. Direct access via `typography.heading["01"].fontSize` returns the raw number, not a px string — callers must be aware of the unit difference.

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records.*
