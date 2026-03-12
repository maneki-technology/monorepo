# packages/foundation — Design Tokens

## OVERVIEW
Design tokens extracted from the "Foundation UI Kit (Community)" Figma file. Generates CSS custom properties for colors, semantic tokens, elevation, typography, and spacing. Zero deps, pure TypeScript.

## STRUCTURE
```
foundation/
├── assets/
│   ├── material-symbols-outlined-subset.woff2  # Subsetted icon font (~24 KB)
│   ├── icon-manifest.txt                       # Icon names included in subset
│   └── subset-icons.py                         # Script to regenerate subset font
├── .storybook/
│   ├── main.ts              # @storybook/web-components-vite
│   └── preview.ts           # imports injectAllTokens()
└── src/
    ├── index.ts              # Barrel export (all modules)
    ├── icons.ts              # Icon codepoint constants + registerIconFont()
    ├── colors.ts             # 131 palette tokens (13 families × 10 steps + gray-110)
    ├── semantic-tokens.ts    # Surface, elevation, border, text, icon, global, status tokens
    ├── typography.ts         # 19 type tokens across 7 groups (display, heading, body, ui, caption, badge, code)
    ├── spacing.ts            # 17-step spacing scale based on 8px base unit (0 through 10, plus 1px and fractional)
    ├── breakpoints.ts        # 3 density variants (compact/standard/spacious) × 7 breakpoints + helpers
    ├── tokens.ts             # CSS custom property generators + var() helpers
    ├── tokens.test.ts        # 32 tests
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
| Add new icon | `assets/icon-manifest.txt` | See SOP below |

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
| Tag | `--fd-tag-{name}` | `--fd-tag-bold` |
| Button | `--fd-button-{name}` | `--fd-button-secondary` |

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

## SOP: Adding New Semantic Tokens

When a Figma design uses a token that doesn't exist in foundation:

1. **Check Figma variable defs** — use `figma_get_variable_defs` or `figma_get_design_context` for the exact token name, value, and opacity.
2. **Check existing foundation tokens** — does an existing token resolve to the same color?
3. **Same color, different semantic group in Figma → create new group.** Don't alias. Figma's `Form/input-border` and `Border/border-moderate` may resolve to the same hex today but serve different semantic purposes. They may diverge in the future.
4. **Watch for opacity!** Figma tokens often use rgba with specific opacity levels (e.g., `rgba(91,114,130,0.4)` = gray-60 @40%). Use literal rgba strings as `SemanticValue`, not palette refs. Double-check the opacity value in Figma — don't guess.
5. **Add group to `semantic-tokens.ts`** — define the group object + add to `semanticTokens` aggregate.
6. **Wire CSS generation in `tokens.ts`** — the `semanticToCssProperties()` function auto-iterates `semanticTokens`, so no changes needed there. Just ensure the group is in the aggregate.
7. **Add tests in `tokens.test.ts`** — verify the generated CSS properties include the new tokens.
8. **Update `index.ts` barrel export** — re-export the new group.
9. **Rebuild foundation** — `npx vite build && npx tsc --emitDeclarationOnly` in `packages/foundation/`.
10. **Update AGENTS.md** — add the new Figma→foundation token mapping to both `packages/foundation/AGENTS.md` and `packages/ui-components/AGENTS.md`.

### Naming Convention

| Figma group | Foundation group name | CSS prefix | Example |
|---|---|---|---|
| `Form/*` | `form` | `--fd-form-*` | `--fd-form-input-border` |
| `State/Hover/*` | `stateHover` | `--fd-state-hover-*` | `--fd-state-hover-border-moderate` |
| `State/Selected/*` | `stateSelected` | `--fd-state-selected-*` | `--fd-state-selected-surface-bold` |
| `State/Disabled/*` | `stateDisabled` | `--fd-state-disabled-*` | `--fd-state-disabled-border` |
| `State/Focus/*` | (use `border.focus`) | `--fd-border-focus` | already exists |

## COMMANDS
```bash
moon run foundation:storybook       # Dev server on port 6007
moon run foundation:storybook-build  # Static build
moon run foundation:test            # vitest --run (59 tests)
moon run foundation:build           # vite build + tsc --emitDeclarationOnly
```

## SOP: Adding a New Icon

When a component needs a Material Symbols icon not yet in the subset font:

1. **Find the icon name** on [Material Symbols](https://fonts.google.com/icons?icon.set=Material+Symbols).
2. **Find its Unicode codepoint** in the [official codepoints file](https://github.com/google/material-design-icons/blob/master/variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints).
3. **Add the icon name** to `assets/icon-manifest.txt` (one name per line, alphabetical).
4. **Add the codepoint** to the `CODEPOINTS` dict in `assets/subset-icons.py`.
5. **Add the constant** to `src/icons.ts`:
   - Add `export const ICON_FOO = "\uXXXX";` with the codepoint
   - Add `foo: ICON_FOO` to the `ICON_CODEPOINTS` record
6. **Re-export** from `src/index.ts`.
7. **Regenerate the subset font**:
   ```bash
   # Requires: pip install fonttools brotli
   # Also requires the full font file — either keep material-symbols installed
   # as a devDependency or download MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].woff2
   # from Google Fonts and pass the path as argument.
   python3 packages/foundation/assets/subset-icons.py [path-to-full-font.woff2]
   ```
8. **Commit** the updated `icon-manifest.txt`, `subset-icons.py`, `icons.ts`, `index.ts`, and the regenerated `.woff2`.
