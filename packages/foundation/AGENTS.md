# packages/foundation — Design Tokens

## OVERVIEW
Design tokens extracted from the "Foundation UI Kit (Community)" Figma file. Generates CSS custom properties for colors, semantic tokens, elevation, typography, and spacing. Zero deps, pure TypeScript.

## STRUCTURE
```
foundation/
├── .storybook/
│   ├── main.ts              # @storybook/web-components-vite
│   └── preview.ts           # imports injectAllTokens()
└── src/
    ├── index.ts              # Barrel export (all modules)
    ├── colors.ts             # 131 palette tokens (13 families × 10 steps + gray-110)
    ├── semantic-tokens.ts    # Surface, elevation, border, text, icon, global, status tokens
    ├── typography.ts         # 19 type tokens across 7 groups (display, heading, body, ui, caption, badge, code)
    ├── spacing.ts            # 17-step spacing scale based on 8px base unit (0 through 10, plus 1px and fractional)
    ├── breakpoints.ts        # 3 density variants (compact/standard/spacious) × 7 breakpoints + helpers
    ├── tokens.ts             # CSS custom property generators + var() helpers
    ├── tokens.test.ts        # 28 tests
    ├── breakpoints.test.ts   # 27 tests
    └── stories/
        ├── colors.stories.ts           # Color palette grid (13 families × 10-11 steps)
        ├── semantic-tokens.stories.ts  # Surface, border, text, icon, global, status
        ├── typography.stories.ts       # All 7 typography groups with live samples
        ├── spacing.stories.ts          # Visual spacing scale (17 steps)
        └── elevation.stories.ts        # Elevation levels with box-shadow samples
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add new color family | `colors.ts` | Add to `colors` object, 10 steps (10–100) |
| Add semantic token group | `semantic-tokens.ts` | Add group + update `semanticTokens` aggregate |
| Add new typography token | `typography.ts` | Add to appropriate group, update `typography` aggregate |
| Add spacing step | `spacing.ts` | Add to `spacing` object |
| Wire new token type to CSS | `tokens.ts` | Add `*ToCssProperties()` + `*Var()` + add to `injectAllTokens()` |
| Update barrel exports | `index.ts` | Re-export new functions/types |

## TOKEN ARCHITECTURE
```
Raw data (colors.ts, semantic-tokens.ts, typography.ts, spacing.ts)
    ↓
CSS generators (tokens.ts) — *ToCssProperties() functions
    ↓
injectAllTokens() — creates <style> on :root with all tokens
    ↓
var() helpers — colorVar(), semanticVar(), elevationVar(), typeVar(), spaceVar()
```

## CSS CUSTOM PROPERTY PREFIXES
| Module | Prefix | Example |
|--------|--------|---------|
| Palette colors | `--fd-color-{family}-{step}` | `--fd-color-blue-60` |
| Semantic surface | `--fd-surface-{name}` | `--fd-surface-primary` |
| Semantic border | `--fd-border-{name}` | `--fd-border-minimal` |
| Semantic text | `--fd-text-{name}` | `--fd-text-primary` |
| Semantic icon | `--fd-icon-{name}` | `--fd-icon-action` |
| Global | `--fd-global-{name}` | `--fd-global-brand` |
| Status | `--fd-status-{group}-{name}` | `--fd-status-surface-error-bold` |
| Elevation | `--fd-elevation-{level}` | `--fd-elevation-03` |
| Typography | `--fd-type-{group}-{key}-{prop}` | `--fd-type-heading-01-font-size` |
| Spacing | `--fd-space-{step}` | `--fd-space-2-5` |

## CONVENTIONS
- **Figma is source of truth.** All values extracted from "Foundation UI Kit (Community)".
- **Semantic tokens reference palette.** `SemanticValue` is either a hex string, rgba string, or `PaletteRef` (`{ family, step }`).
- **`resolveSemanticValue()`** resolves `PaletteRef` → hex at CSS generation time (not runtime).
- **Typography uses two font families.** "Inter" (primary), "Roboto Mono" (code).
- **Spacing base unit is 8px.** 17 steps: 0 (0px), 1px (1px), 0.25 (2px), 0.5 (4px), 0.75 (6px), 1 (8px) through 10 (80px). CSS property names use hyphens instead of dots (e.g., `--fd-space-0-75` not `--fd-space-0.75`).
- **`toKebab()` helper** converts camelCase keys to kebab-case for CSS property names.
- **`injectAllTokens()`** is idempotent — checks for existing `<style id="maneki-foundation-all">` before injecting.
- **Breakpoints are JS-only.** Not injected as CSS custom properties — use `getBreakpoint()`, `getBreakpointConfig()`, `breakpointMediaQuery()` helpers.
- **Three layout densities.** Compact (tightest), standard (moderate), spacious (widest margins/gutters).

## ANTI-PATTERNS
- **Don't hardcode color values in components** — use `colorVar()` / `semanticVar()` helpers
- **Don't add tokens not in Figma** — this is a faithful extraction, not a creative exercise. Exception: interactive state tokens (e.g., `text.linkHover`, `text.linkActive`) may be added when needed by components, even if not explicitly defined in Figma.
- **Don't forget to update `injectAllTokens()`** when adding a new token category

## COMMANDS
```bash
moon run foundation:storybook       # Dev server on port 6007
moon run foundation:storybook-build  # Static build
moon run foundation:test            # vitest --run (55 tests)
moon run foundation:build           # vite build + tsc --emitDeclarationOnly
```
