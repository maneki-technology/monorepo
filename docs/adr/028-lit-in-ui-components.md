# ADR-028: Lit in UI Components — Gradual Migration

**Status:** Accepted
**Date:** 2026-04
**Supersedes:** [ADR-012](012-zero-runtime-dependencies.md) (Zero Runtime Dependencies)
**Context:** Deciding whether to add Lit as a runtime dependency to `@maneki/ui-components`.

## Decision

Add `lit` (~7 KB) as a production dependency of `@maneki/ui-components`. Migrate components gradually from vanilla `HTMLElement` to `LitElement` — starting with components that need to interop with Lit-based consumers.

Existing vanilla components continue to work unchanged. New components must use Lit. No big-bang rewrite of existing components.

## Rationale

The blog admin pages use Lit for their page-level components (`<editor-page>`, `<admin-gallery>`, `<admin-hub>`). When Lit renders a template with `@click` bindings on elements that get slotted through multiple vanilla Web Component shadow boundaries, the event bindings silently fail to attach.

Specifically: `<editor-page>` (Lit) → `<ui-side-panel-menu>` (vanilla, Shadow DOM) → `<ui-side-panel-menu-section>` (vanilla, Shadow DOM) → `<ui-button @click=...>`. The `@click` binding on the button never fires. Single-level slot projection works fine (e.g., `slot="header"` in the same menu), but double-nested slots break Lit's binding mechanism.

Investigation confirmed:
- Native `addEventListener` on the same button works
- `getEventListeners()` shows Lit attached zero listeners
- The vanilla components don't intercept or `stopPropagation` on click events
- The issue is Lit's template binding failing to reach elements projected through multiple non-Lit shadow boundaries

Migrating the intermediate component (`ui-side-panel-menu-section`) to Lit fixes the binding because Lit-to-Lit slot projection handles event bindings correctly.

## Consequences

- `@maneki/ui-components` gains a ~7 KB runtime dependency (Lit)
- Components can be migrated incrementally — no breaking changes for consumers
- Lit components use decorators (`@customElement`, `@property`) with `experimentalDecorators` enabled in tsconfig
- Foundation token strings must be wrapped in `unsafeCSS()` when used in Lit's `static styles`
- ADR-012's "zero runtime dependencies" policy is superseded — `@maneki/foundation` remains zero-dep
- The convention section in AGENTS.md should be updated to document both patterns

## Migration Strategy

1. Start with components that cause interop issues (side-panel-menu-section)
2. Migrate related components in the same family when touched (side-panel-menu, side-panel-menu-item)
3. New components must use Lit
4. No obligation to migrate working vanilla components

## Alternatives Considered

- **Imperative `addEventListener` in consumers** — works but requires every Lit consumer to know which ui-components have slot boundary issues. Fragile and undiscoverable.
- **Event delegation on the Lit host element** — works but breaks encapsulation and requires ID-based routing. Not scalable.
- **Migrate only admin pages away from Lit** — the admin pages already use Lit extensively (gallery: 1595 lines, editor: 542 lines). Removing Lit would be a larger effort than adding it to ui-components.

## Known Issues

Lit `@click` bindings silently fail on elements slotted into `ui-side-panel-menu-section` from a parent Lit component's template. The elements remain in the parent's shadow root (confirmed via `getRootNode()`), are not moved or cloned, and manual `addEventListener` works — but `getEventListeners()` shows Lit never attaches the handler. All other `@click` bindings in the same template work correctly. The root cause is unknown.

Workaround: use imperative `addEventListener` in `firstUpdated()` for buttons inside `ui-side-panel-menu-section` slots.