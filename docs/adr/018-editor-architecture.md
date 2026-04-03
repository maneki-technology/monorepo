# ADR-018: Editor Architecture — Reactive Store + Modular Split

**Status:** Accepted
**Date:** 2026-04

## Context

The blog editor grew from a single 1369-line file to a complex application with sidebar, tabs, forms, preview, gallery, context menu, undo/redo, scroll sync, and image upload. State was scattered across module-scope `let` variables, rendering was full DOM rebuilds, and `style.display` toggling was fragile.

## Decision

Split the editor into focused modules with a centralized reactive store and targeted DOM updates.

### Reactive Store

Single `EditorState` object with `setState(partial)` that batches renders via `queueMicrotask`. Selective rendering — only sidebar or tabbar re-renders based on which state keys changed.

```ts
const SIDEBAR_DEPS: (keyof EditorState)[] = ["allPosts", "allProjects", "currentSlug", ...];
const TABBAR_DEPS: (keyof EditorState)[] = ["openTabs", "openProjectTabs", "currentSlug"];
```

### Modular Split

18 focused modules under `src/pages/editor/`:

| Module                  | Lines | Purpose                                       |
| ----------------------- | ----- | --------------------------------------------- |
| `types.ts`              | 30    | Post, Project, EditorUIState interfaces       |
| `state.ts`              | 70    | Reactive store, setState, render dispatch     |
| `api.ts`                | 450   | API calls, DOM helpers, save/load             |
| `sidebar.ts`            | 590   | Map-based DOM patching for post/project lists |
| `tabbar.ts`             | 200   | Map-based DOM patching for tabs               |
| `preview.ts`            | 130   | Shiki markdown rendering                      |
| `toolbar.ts`            | 40    | Formatting actions                            |
| `upload.ts`             | 140   | Drag/drop/paste image upload                  |
| `gallery.ts`            | 210   | Image gallery side panel                      |
| `context-menu.ts`       | 130   | Circular right-click menu                     |
| `undo.ts`               | 110   | Custom undo/redo stack                        |
| `scroll-sync.ts`        | 55    | Proportional scroll sync                      |
| `publish.ts`            | 190   | Publish/unpublish + deploy polling            |
| `delete-modal.ts`       | 60    | Delete confirmation modal                     |
| `fullscreen-preview.ts` | 80    | Post/project detail preview                   |
| `project-preview.ts`    | 160   | Portfolio layout with drag-to-reorder         |
| `init.ts`               | 100   | Load posts/projects, restore UI state         |
| `keyboard.ts`           | 25    | Ctrl+S, Tab key handlers                      |
| `index.ts`              | 430   | Route definition, HTML template, setup wiring |

### Targeted DOM Updates

`SidebarRenderer` and `TabBarRenderer` use `Map<slug, HTMLElement>` to patch existing DOM nodes instead of full rebuilds. On state change: new items created, removed items deleted, existing items patched in-place.

## Consequences

- No file over 590 lines
- Each module has a single responsibility
- Renders batch into 1 microtask per event loop tick
- No focus loss, event listener churn, or scroll position reset on updates
- Custom undo stack replaces deprecated `document.execCommand`
