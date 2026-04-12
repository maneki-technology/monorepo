# ADR-026: Editor Lit Migration

**Status:** Accepted
**Date:** 2026-04

## Context

The editor's sidebar and tabbar were built with manual DOM manipulation: `createElement`, `setAttribute`, `Map<slug, HTMLElement>` diffing, and dedicated renderer classes (`SidebarRenderer`, `TabBarRenderer`). This worked, but the pattern was verbose and hard to extend. Building the admin gallery as a new Lit component made the contrast stark — the same UI complexity that took 200 lines of manual DOM code took 80 lines of Lit templates.

The editor couldn't be rewritten wholesale without risking regressions across 18 modules. An incremental migration was needed.

## Decision

Migrate sidebar and tabbar to Lit components while keeping the existing `state.ts` reactive store and all other modules unchanged. A bridge controller connects the two systems.

### EditorStoreController

Lit's update cycle is driven by `requestUpdate()`. The existing `state.ts` store dispatches renders via `queueMicrotask`. `EditorStoreController` is a Lit reactive controller that subscribes to state changes and calls `requestUpdate()` on the host element.

```ts
class EditorStoreController implements ReactiveController {
  constructor(private host: ReactiveControllerHost, private deps: (keyof EditorState)[]) {
    host.addController(this);
  }

  hostConnected() {
    // subscribe to state changes for the relevant keys
    registerRenderer(this.deps, () => this.host.requestUpdate());
  }

  hostDisconnected() {
    unregisterRenderer(...);
  }

  get state() {
    return getState();
  }
}
```

This means `state.ts` is untouched. `init.ts` is untouched. The Lit components slot into the existing wiring via the same exported `initSidebar()` / `initTabBar()` functions.

### Light DOM Rendering

Both components use `createRenderRoot() { return this; }` to render into light DOM instead of shadow DOM. This is intentional:

- The editor's existing CSS targets element IDs and classes directly
- Shadow DOM would require duplicating or importing all editor styles
- The components sit inside a flex layout — shadow DOM wrapper elements would break the parent layout without `display: contents`

### Sidebar Migration

`SidebarRenderer` (Map-based DOM patching, ~200 lines) replaced by Lit `html` templates with `repeat()` directive. The `repeat()` keyed renderer handles DOM reuse more efficiently than the manual Map approach.

Before: 613 lines
After: 478 lines (-22%)

Key simplifications:

- No `SidebarRenderer` class
- No manual `Map<slug, HTMLElement>` management
- No `patchItem()` / `removeStale()` methods
- Conditional rendering via `${condition ? html`...` : nothing}` instead of `style.display` toggling

### Tabbar Migration

`TabBarRenderer` replaced by a Lit template with `repeat()`.

Before: 208 lines
After: 178 lines (-14%)

### Backward Compatibility

Both modules export the same `initSidebar()` and `initTabBar()` functions as before. `init.ts` calls them identically. No other module needed changes.

### tsconfig Changes

Lit decorators require two tsconfig flags:

```json
{
  "experimentalDecorators": true,
  "useDefineForClassFields": false
}
```

`useDefineForClassFields: false` is required because Lit's `@property()` decorator relies on the TypeScript decorator semantics, not the native class fields proposal. Without it, decorated properties are overwritten by the class field initializer.

## Consequences

- `lit@3.3.2` added as a dependency to `apps/blog/` — first runtime dep in the blog app, justified by the admin system requiring it for the gallery component anyway
- Light DOM means editor CSS continues to work without changes
- `EditorStoreController` pattern is reusable for any future Lit components that need to read editor state
- The remaining 16 editor modules stay as vanilla TypeScript — no pressure to migrate everything
- `experimentalDecorators` is a legacy TypeScript flag; Lit 4 will support TC39 decorators when they stabilize
