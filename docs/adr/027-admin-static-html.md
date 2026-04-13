# ADR-027: Admin Static HTML Architecture

**Status:** Accepted
**Date:** 2026-04

## Context

The blog needed an admin system with three distinct pages: a hub (/admin), the existing editor (/admin/editor), and a new gallery (/admin/gallery). The editor was already a separate entry point at `/editor`. Moving it to `/admin/editor` and adding the hub and gallery required a routing strategy.

Cloudflare Pages has strong opinions about URLs. Several approaches were tried before landing on the current solution.

## Alternatives Considered

### SPA Routing with `_redirects`

The obvious first attempt: a single `admin.html` entry with client-side routing, and a `_redirects` rule to send all `/admin/*` requests to `admin.html`.

```
/admin/*  /admin.html  200
```

CF Pages ignored the 200 rewrite and issued a 308 redirect from `/admin/editor` to `/admin/editor/` (trailing slash normalization), then couldn't find the file. The redirect loop was unresolvable without disabling CF Pages' built-in redirect behavior, which isn't configurable per-path.

### Hash Routing

`/admin#editor`, `/admin#gallery` — worked technically. URLs were ugly and bookmarking a specific admin page landed on the hub with a hash that the JS then had to parse. Acceptable as a fallback but not the right answer.

### CF Pages Function Catch-All

A `functions/admin/[[route]].ts` that served `admin.html` for all sub-paths. This created an infinite redirect loop because the function itself was at `/admin/*` and CF Pages' static file serving conflicted with the function's response.

## Decision

One static HTML file per admin page. Each file is its own Vite entry point with its own entry script.

```
apps/blog/
├── admin.html          → /admin       (hub)
├── admin/
│   ├── editor.html     → /admin/editor
│   └── gallery.html    → /admin/gallery
```

CF Pages serves static HTML files directly with no routing logic needed. No `_redirects`. No functions. No SPA.

### Entry Scripts

Each page has a dedicated entry script in `src/admin/`:

| Page                 | Entry              | Component                      |
| -------------------- | ------------------ | ------------------------------ |
| `admin.html`         | `hub-entry.ts`     | `<admin-hub>` (Lit)            |
| `admin/editor.html`  | `editor-entry.ts`  | mounts existing editor modules |
| `admin/gallery.html` | `gallery-entry.ts` | `<admin-gallery>` (Lit)        |

The editor entry is identical to the old `editor-entry.ts` — it just lives at a new path. No editor code changed.

### Theme Persistence

Theme state needs to be consistent across all three admin pages and the public blog. Two layers:

1. `localStorage` — read on page load before first paint (FOUC prevention, same as public pages)
2. Backend persistence via the `ui-state` API — theme preference saved to Turso, restored on login from any device

`src/admin/theme.ts` is a shared utility that handles both layers. All three entry scripts import it.

### `<theme-toggle>` Component

A vanilla Web Component (no Lit) shared across public blog pages and all admin pages. It wraps `<ui-button>` from `@maneki/ui-components` and toggles `data-theme` on `:root`. Keeping it vanilla means it can be imported in public pages without pulling in Lit.

```ts
// No Lit dependency — safe for public pages
class ThemeToggle extends HTMLElement {
  connectedCallback() {
    // render ui-button, wire click handler
  }
}
customElements.define("theme-toggle", ThemeToggle);
```

### Gallery as a Lit Component

`<admin-gallery>` is a full Lit component handling photo upload, album management, drag-to-reorder, and soft delete. It was built fresh in Lit rather than migrated from vanilla DOM code — there was no existing gallery admin to migrate.

## Consequences

- Three separate HTML files means three separate page loads with no shared JS bundle between admin pages (Vite code-splitting handles shared chunks via `manualChunks`)
- CF Pages' auth (CF Access) protects the entire `/admin*` path — no per-page auth logic needed
- Adding a fourth admin page is trivial: new HTML file + new entry script
- The editor at `/admin/editor` has a different URL than the old `/editor` — old bookmarks break (acceptable, it's a personal tool)
- No back-button navigation between admin pages — each is a full page load. Acceptable for an admin tool used occasionally.
