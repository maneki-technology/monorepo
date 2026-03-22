# ADR-009: Dark Elevation: Stronger Shadows

**Status:** Accepted
**Date:** 2026-03
**Context:** Choosing how elevation hierarchy is communicated in dark mode.

## Decision

Dark mode uses stronger box-shadows (higher opacity: 0.3–0.5 vs light mode's 0.14–0.24) to remain visible against dark backgrounds.

## Rationale

Two approaches were evaluated:

### Option 1: Stronger shadows (chosen)
- Same visual language as light mode — shadows indicate depth
- Works through existing `--fd-elevation-*` CSS custom properties
- No component changes needed

### Option 2: Surface tint (rejected)
- Material Design 3 approach: higher elevation = lighter surface color via white overlay
- Attempted using `inset 0 0 0 9999px rgba(255,255,255, 0.05–0.16)` as box-shadow
- **Failed** because `box-shadow` doesn't tint the background — it renders on top, creating a visible overlay edge on rounded corners and clipping with `overflow: hidden`
- Would require component-level changes (background-color per elevation) rather than working through the existing CSS custom property

## Consequences

- Dark shadows use 0.3–0.5 opacity (vs 0.14–0.24 in light mode)
- Elevation hierarchy is subtler in dark mode but still perceptible
- No component code changes — purely a token value change in `dark-theme.ts`

## Alternatives Considered

- **No shadows in dark mode** — loses elevation hierarchy entirely
- **Border-based elevation** — `border: 1px solid rgba(255,255,255,0.1)` for higher elevations. Viable but changes the visual language from shadows to borders.
