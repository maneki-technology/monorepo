# ADR-007: Dark Theme via data-theme Attribute

**Status:** Accepted
**Date:** 2026-03
**Context:** Adding dark mode support to the design system.

## Decision

Dark theme is activated by setting `data-theme="dark"` on any ancestor element (typically `<html>`). The foundation injects both light and dark CSS in a single `<style>` block:

```css
:root { --fd-surface-primary: #ffffff; ... }
[data-theme="dark"] { --fd-surface-primary: #0D1826; ... }
```

## Rationale

- **No component changes needed.** Components already reference semantic tokens via `var()`. Dark mode just overrides the token values — the cascade handles the rest.
- **Attribute selector over media query.** `[data-theme="dark"]` allows programmatic toggling (user preference stored in localStorage) independent of OS settings. Can be combined with `prefers-color-scheme` if desired.
- **Single injection point.** `injectAllTokens()` generates both light and dark CSS. No separate dark mode initialization step.
- **Scoped theming possible.** `data-theme="dark"` on a `<div>` creates a dark island within a light page.

## Consequences

- All semantic token groups need dark counterparts in `dark-theme.ts` (17 groups + elevation).
- Components using hardcoded `#ffffff` for backgrounds must be migrated to `SURFACE_PRIMARY`.
- Accent colors (blue-60, red-60, etc.) stay the same in both themes — they work on both light and dark backgrounds.
- The catalog app includes a theme toggle button that persists preference to localStorage.

## Alternatives Considered

- **`prefers-color-scheme` media query only** — no user override, tied to OS setting.
- **CSS class (`.dark`)** — works but `data-*` attributes are more semantic and don't conflict with utility classes.
- **Separate stylesheet** — requires loading/unloading CSS files. More complex, slower theme switching.
