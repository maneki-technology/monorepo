# ADR-010: Material Symbols Subsetted Font

**Status:** Accepted
**Date:** 2026-03
**Context:** Components need icons. The full Material Symbols Outlined font is ~300 KB.

## Decision

Ship a subsetted Material Symbols Outlined font (~24 KB) containing only the icons used by the design system. Icons are referenced by Unicode codepoint constants, not ligature text.

```ts
import { ICON_CLOSE } from "@maneki/foundation";
clearIcon.textContent = ICON_CLOSE; // "\uE5CD"
```

## Rationale

- **24 KB vs 300 KB.** The subset font is 92% smaller than the full font. Only ~32 icons are included.
- **Codepoints over ligatures.** Ligature text (`"close"`) requires the browser to perform OpenType substitution, which can flash the raw text before the font loads. Codepoints (`"\uE5CD"`) render as empty boxes (invisible) until the font loads — no FOUT.
- **Single font file.** One `.woff2` file registered globally via `registerIconFont()`. Shadow DOM components access it through `@font-face { src: local("Material Symbols Outlined") }`.
- **Deterministic subset.** `assets/subset-icons.py` + `assets/icon-manifest.txt` define exactly which icons are included. Adding a new icon is a documented SOP.

## Consequences

- New icons require running the subset script and committing the updated `.woff2`.
- `<ui-icon>` component handles both codepoint lookup (via `name` attribute) and ligature fallback.
- Shadow DOM requires a local `@font-face` declaration in every component that uses icons (with `font-display: swap`).
- The font is preloaded in the catalog app via a Vite plugin that injects `<link rel="preload">` with the hashed URL.

## Alternatives Considered

- **Inline SVG icons** — no font dependency but increases bundle size per icon, harder to style with `currentColor`, and requires SVG management.
- **Full Material Symbols font** — simpler (no subsetting) but 300 KB is too large for a design system that uses ~32 icons.
- **Icon sprites** — SVG sprite sheet. Works but doesn't integrate with Shadow DOM's `currentColor` inheritance as cleanly as a font.
