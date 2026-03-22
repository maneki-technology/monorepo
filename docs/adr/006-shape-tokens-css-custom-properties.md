# ADR-006: Shape Tokens as CSS Custom Properties

**Status:** Accepted
**Date:** 2026-03
**Context:** `radiusVar()` and `borderWidthVar()` originally returned raw values (`"2px"`, `"999px"`) instead of CSS `var()` references, unlike all other token helpers.

## Decision

Wire shape tokens through CSS custom properties, consistent with all other token types:

- `radiusVar("sm")` → `var(--fd-radius-sm)` (was `"2px"`)
- `borderWidthVar("md")` → `var(--fd-border-width-md)` (was `"2px"`)
- `radiusToCssProperties()` and `borderWidthToCssProperties()` generate the `:root` declarations
- Both are included in `injectAllTokens()`

## Rationale

- **Consistency.** Every other token type (`colorVar`, `semanticVar`, `spaceVar`, `elevationVar`, `typeVar`) returns a `var()` reference. Shape tokens were the exception.
- **Runtime themeable.** Consumers can override `--fd-radius-sm: 4px` to change all component radii globally. Not possible with raw values.
- **Negative values work correctly.** `outline-offset: calc(-1 * var(--fd-border-width-md))` is valid CSS. The previous `-${BW_MD}` produced `-2px` which worked by accident but was semantically wrong.

## Consequences

- All `outline-offset: -2px` patterns changed to `calc(-1 * var(--fd-border-width-md))` across 11 files.
- Tests checking for raw values like `border-radius: 999px` updated to check for `var(--fd-radius-pill)`.
- Foundation barrel exports updated to include `radiusToCssProperties` and `borderWidthToCssProperties`.

## Alternatives Considered

- **Keep raw values** — simpler but inconsistent. Consumers can't override shape tokens at runtime.
