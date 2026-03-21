# ADR-003: Semantic Token Architecture

**Status:** Accepted
**Date:** 2026-03
**Context:** Bridging the gap between raw color palette values and component usage.

## Decision

Design tokens are organized in three layers:

1. **Palette** (`colors.ts`) — raw color values: 13 families × 10 steps (e.g., `blue-60: #186ADE`)
2. **Semantic** (`semantic-tokens.ts`) — purpose-driven references: `surface.primary`, `text.link`, `border.focus`
3. **Component** — CSS custom properties: `--ui-btn-bg` defaulting to a semantic token

Semantic tokens reference palette values via `PaletteRef` objects (`{ family: "blue", step: 60 }`), resolved to hex at CSS generation time.

## Rationale

- **Figma alignment.** The Figma source file uses the same three-layer architecture. Semantic tokens map 1:1 to Figma's token groups (Surface, Border, Text, Icon, Status, State).
- **Theme independence.** Components reference `surface.primary` not `#ffffff`. In dark mode, `surface.primary` resolves to `gray-100` instead — no component code changes.
- **Semantic clarity.** `border.focus` communicates intent better than `blue-60`. When the focus color changes, only the token mapping updates.
- **Group-based organization.** Tokens are grouped by domain: `surface.*`, `text.*`, `stateHover.*`, `statusSurface.*`. Each group is independently overridable for theming.

## Consequences

- Adding a new semantic purpose requires a new token, not reusing an existing one (even if the resolved color is the same today).
- The `resolveSemanticValue()` function must handle both `PaletteRef` objects and raw strings (hex, rgba).
- All 17 semantic groups must have dark theme counterparts in `dark-theme.ts`.

## Alternatives Considered

- **Flat token list** — simpler but loses the semantic grouping. Hard to maintain at scale.
- **Runtime palette references** — resolve `PaletteRef` at runtime instead of build time. Adds complexity for no benefit since palette values don't change at runtime.
