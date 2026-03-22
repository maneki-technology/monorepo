# ADR-005: Typography typeBlock() Helper

**Status:** Accepted
**Date:** 2026-03
**Context:** Components hardcoded `font-size`, `line-height`, and `font-weight` as raw pixel values (478 occurrences). These need to reference typography tokens for consistency and dark mode font-family support.

## Decision

A `typeBlock()` helper returns all four typography CSS properties as a single interpolatable string:

```ts
${typeBlock("body", "02")}
// → font-family: var(--fd-type-body-02-font-family);
//   font-size: var(--fd-type-body-02-font-size);
//   line-height: var(--fd-type-body-02-line-height);
//   font-weight: var(--fd-type-body-02-font-weight);
```

Pre-computed `TYPE_*` constants wrap `typeBlock()` for use in component styles:

```ts
export const TYPE_BODY_02 = typeBlock("body", "02");
```

## Rationale

- **One line replaces four.** `${TYPE_BODY_02}` instead of separate font-size + line-height + font-weight + font-family declarations.
- **Font-family included.** Adding `font-family` to `typeBlock()` means components automatically get the correct font without hardcoding `"Geist"` everywhere.
- **CSS var() references.** Typography values are runtime-overridable via CSS custom properties, enabling future typography customization.
- **197 blocks replaced** across 42 component files.

## Consequences

- 94 hardcoded font-sizes remain as intentional exceptions (non-standard sizes like 8/9/10/18px, standalone font-size without line-height).
- `FONT_PRIMARY` constant (`'Geist', sans-serif`) handles the remaining 84 `font-family` declarations in `:host` base blocks.
- Tests that asserted raw pixel values now assert `var(--fd-type-*)` references.

## Alternatives Considered

- **Per-property replacement** — three `typeVar()` calls per location. More verbose, same result.
- **CSS `font` shorthand** — `font: 400 14px/20px 'Geist'`. Compact but resets unspecified properties (`font-variant`, `font-stretch`), causing subtle bugs.
