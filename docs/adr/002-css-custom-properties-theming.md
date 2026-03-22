# ADR-002: CSS Custom Properties for Theming

**Status:** Accepted
**Date:** 2026-03
**Context:** Defining how consumers customize component appearance.

## Decision

All design tokens are injected as CSS custom properties on `:root` via `injectAllTokens()`. Components reference tokens through a two-layer `var()` pattern:

```css
background: var(--ui-btn-bg, var(--fd-surface-action));
```

- `--ui-btn-bg` — component-level override (consumer API)
- `--fd-surface-action` — foundation token (default)

## Rationale

- **Pierces Shadow DOM.** CSS custom properties are the only CSS mechanism that crosses shadow boundaries. External stylesheets can't target Shadow DOM internals, but custom properties inherit through.
- **Two-layer pattern.** Consumers override specific components (`--ui-btn-bg`) without touching the design system tokens (`--fd-*`). Foundation tokens provide sensible defaults.
- **Runtime themeable.** Changing a custom property value instantly updates all components — no rebuild needed. This enables dark mode, density variants, and brand customization.
- **Predictable naming.** `--fd-*` for foundation tokens, `--ui-*` for component overrides. No collisions.

## Consequences

- Every visual property that should be customizable must be wrapped in `var()`.
- Foundation must generate and inject all token CSS before components render.
- Token names are part of the public API — renaming is a breaking change.

## Alternatives Considered

- **CSS parts (`::part()`)** — exposes internal elements for styling but is verbose and fragile. Custom properties are more ergonomic.
- **JS-based theming** — setting properties via JavaScript. Works but loses the cascade and doesn't integrate with CSS tooling.
- **CSS-in-JS** — adds runtime overhead and framework dependency.
