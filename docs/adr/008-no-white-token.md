# ADR-008: No Generic "White" Token

**Status:** Accepted
**Date:** 2026-03
**Context:** 109 hardcoded `#ffffff` values across components. Should there be a `WHITE` or `text.inverse` semantic token?

## Decision

No generic "white" token. The `#ffffff` values fall into two categories, each handled differently:

1. **Surface backgrounds** (cards, inputs, panels) → `SURFACE_PRIMARY`, which flips to dark in dark mode
2. **Text on colored backgrounds** (badge, tag, avatar bold text) → stays `#ffffff`, handled by per-ramp color maps

## Rationale

Verified against Figma specs for badge, tag, avatar, and dropdown-split:

- Each color ramp has its own text token: `Ramp/Text/blue-ramp-bold-text: #FFFFFF`
- **Yellow is the exception**: `Ramp/Text/yellow-ramp-bold-text: #1C2B36` (dark text on light yellow)
- This proves `#ffffff` is not a single semantic concept — it's per-ramp, and yellow proves the values can diverge

A generic "white" token would be wrong for yellow badges and would prevent future per-ramp customization in dark mode (e.g., lighter purple background with dark text).

## Consequences

- `#ffffff` in badge/tag/avatar color maps stays as raw values — they're intentionally per-ramp.
- `#ffffff` for backgrounds is replaced with `SURFACE_PRIMARY` (flips in dark mode).
- `#ffffff` in focus rings is replaced with `SURFACE_PRIMARY`.
- `#ffffff` for text on dark overlays (tooltip, popover) stays as raw values — these overlays don't change between themes.

## Alternatives Considered

- **`text.reversed` token** — exists but maps to `#ffffff` in light and `gray-110` in dark. Wrong for badge text which should stay white on blue-60 in both themes.
- **`WHITE` constant** — a named constant for `#ffffff`. Doesn't solve the semantic problem and suggests it should be tokenized.
