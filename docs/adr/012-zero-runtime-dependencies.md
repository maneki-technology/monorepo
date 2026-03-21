# ADR-012: Zero Runtime Dependencies

**Status:** Accepted
**Date:** 2026-03
**Context:** Deciding the dependency policy for the design system packages.

## Decision

Foundation (`@maneki/foundation`) has zero production dependencies. UI components (`@maneki/ui-components`) depend only on `@maneki/foundation`. Grid layout and flex layout depend only on `@maneki/foundation`.

No external runtime libraries (Lit, Stencil, FAST, etc.) are used.

## Rationale

- **Bundle size.** Every dependency adds weight. A design system is imported by every page in an application — its size impact is multiplied across the entire product.
- **No version conflicts.** External dependencies create version resolution issues when consumers use different versions of the same library. Zero deps = zero conflicts.
- **Long-term stability.** Framework churn is real. Lit 2→3, Stencil 3→4, FAST deprecation — each migration is a breaking change for consumers. Native `HTMLElement` is stable forever.
- **Simplicity.** The Web Components API is small enough that a base class adds more complexity than it removes. `attachShadow()`, `observedAttributes`, `attributeChangedCallback` — that's the entire API.

## Consequences

- More boilerplate per component (no `@property` decorators, no reactive updates, no template DSL).
- DOM is built imperatively with `document.createElement()` — more verbose than template literals but avoids `innerHTML` security concerns.
- CSS is defined as template literal strings with constructable stylesheets (`new CSSStyleSheet()`).
- Testing uses Vitest + happy-dom directly, no component-specific test utilities.

## Exceptions

- **Dev dependencies** are unrestricted: Vite, Vitest, Storybook, Playwright, TypeScript.
- **`@maneki/foundation`** is a production dependency of `@maneki/ui-components` — this is internal, not external.

## Alternatives Considered

- **Lit** — excellent DX with decorators and reactive properties. Rejected because it adds ~7 KB to every consumer's bundle and creates a framework dependency.
- **Stencil** — compiler-based approach. Rejected because the compiler adds build complexity and the output is harder to debug.
- **FAST** — Microsoft's Web Component library. Rejected due to smaller community and uncertain long-term support.
