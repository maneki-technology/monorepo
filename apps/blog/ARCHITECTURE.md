# Blog Architecture

*Snapshot: April 2026*

## Overview

Full-stack blog and portfolio app deployed on Cloudflare Pages. Two distinct frontends — a static public site (vanilla TS) and a Lit-based admin system — share a single Hono API backend backed by Turso (libSQL). All public content is baked into the JS bundle at build time via Vite virtual modules.

## System Diagram

```
+---------------------------------------------------------------+
|                      Cloudflare Pages                         |
|                                                               |
|  Static Assets (dist/)         CF Pages Functions             |
|  +----------------------+      +-----------------------+      |
|  | index.html (SPA)     |      | functions/api/        |      |
|  | admin.html           |      |   [[route]].ts        |      |
|  | admin/editor.html    |      |     v                 |      |
|  | admin/gallery.html   |      |   Hono app            |      |
|  | admin/pages.html     |      |     v                 |      |
|  | JS/CSS/woff2         |      |   Turso (libSQL)      |      |
|  +----------------------+      |   R2 (images)         |      |
|                                |   CF AI Gateway       |      |
|                                +-----------------------+      |
|                                                               |
|  CF Access (JWT auth on /admin + /api)                        |
+---------------------------------------------------------------+
```

## Build System

### Vite Plugin Chain

9 custom plugins run during build, in this order:

| Plugin | Phase | Responsibility |
|---|---|---|
| `admin-html-routes` | dev server | Rewrites `/admin/*` URLs to HTML files before SPA fallback |
| `inject-tokens` | transformIndexHtml | Injects foundation + HeroUI CSS tokens into `<head>` (eliminates FOUC) |
| `markdown-posts` | virtual module | `virtual:posts`, `virtual:drafts` — Turso → markdown-it + Shiki → HTML |
| `portfolio-projects` | virtual module | `virtual:projects` — Turso → HTML |
| `photography` | virtual module | `virtual:photos`, `virtual:albums` — Turso → JSON |
| `auto-ui-components` | transform | Auto-registers `@maneki/ui-components` |
| `sitemap` | closeBundle | Generates `sitemap.xml` from Turso slugs |
| `rss-feed` | closeBundle | Generates `rss.xml` from Turso posts |
| `pages` | virtual module | `virtual:pages` — generic CMS pages from Turso → HTML |

### Virtual Modules

The core architectural pattern: all content is fetched from Turso at build time and embedded as static data in the JS bundle.

```
Turso DB ──(build time)──→ Vite plugin ──→ virtual module ──→ JS bundle
                                              │
                              import { posts } from "virtual:posts"
```

6 virtual modules:
- `virtual:posts` — published blog posts (markdown → HTML with Shiki highlighting)
- `virtual:drafts` — draft posts (same pipeline)
- `virtual:projects` — portfolio projects
- `virtual:photos` — published photos with EXIF, tags, thumbhash
- `virtual:albums` — published albums with photo counts
- `virtual:pages` — generic CMS pages (about, resume)

The markdown plugins also transform rendered HTML: `<a>` → `<ui-link>`, `<img>` → `<ui-image>`, so the output uses design system components.

### Multi-Page Build

5 HTML entry points built via Rolldown:

```
rolldownOptions.input:
  main          → index.html          (public site)
  admin         → admin.html          (admin hub)
  admin-editor  → admin/editor.html   (post/project editor)
  admin-gallery → admin/gallery.html  (photo management)
  admin-pages   → admin/pages.html    (generic page editor)
```

Foundation tokens are extracted into a `vendor-foundation` manual chunk for caching across pages.

### FOUC Prevention

The `inject-tokens` plugin generates all CSS custom properties at build time and injects them into `<head>` before any JS executes. The runtime `injectAllTokens()` call becomes a no-op (idempotent check for existing `<style>` element).

## API Layer

### Hono App Structure

```
src/api/index.ts
├── CORS middleware (all routes)
├── DB middleware (creates Turso client per request)
├── CF Access JWT auth middleware (all routes)
└── 13 route modules mounted at /api/*
```

The CF Pages Functions adapter is a single file: `functions/api/[[route]].ts` calls `handle(app)` to route all `/api/*` requests to Hono.

### Route Surface

| Route | Purpose |
|---|---|
| `/api/posts` | Blog post CRUD |
| `/api/projects` | Portfolio project CRUD |
| `/api/tags` | Tag management (shared across posts + photos) |
| `/api/pages` | Generic CMS page CRUD |
| `/api/photos` | Photo CRUD (R2 storage) |
| `/api/albums` | Album CRUD |
| `/api/images` | Image upload to R2 |
| `/api/ui-state` | Per-user UI state persistence |
| `/api/deploy` | GitHub Actions `repository_dispatch` trigger |
| `/api/review` | AI review (Claude streaming via CF AI Gateway) |
| `/api/review-conversations` | Review conversation persistence |
| `/api/brainstorm` | AI brainstorm (Claude streaming) |
| `/api/brainstorm-conversations` | Brainstorm conversation persistence |

### RPC Typing

End-to-end type safety with zero codegen:

```typescript
// Server: Hono app exports its type
export type AppType = typeof app;

// Client: typed RPC client infers all routes
import { hc } from "hono/client";
import type { AppType } from "../api/index.js";
export const api = hc<AppType>("/");
```

Route paths, request bodies, and response shapes are all inferred from the Hono route definitions.

### Authentication

CF Access sits in front of admin pages and API routes. The auth middleware:
1. Reads `Cf-Access-Jwt-Assertion` header
2. Fetches CF's public RSA certs (cached after first call)
3. Validates JWT signature, expiration, issuer, audience
4. Extracts email claim → sets on Hono context
5. In local dev: bypasses auth entirely (`dev@localhost`)

## Database Schema

10 tables in Turso (libSQL):

| Table | Purpose | Key patterns |
|---|---|---|
| `posts` | Blog posts | Soft delete (draft/published/deleted), `published_snapshot` JSON for change detection |
| `projects` | Portfolio items | Same soft delete + snapshot pattern, `pinned` + `sort_order` for ordering |
| `pages` | Generic CMS pages | Markdown content + custom CSS (`styles` column) |
| `albums` | Photo albums | Location + lat/lng, `cover_photo_id` FK |
| `photos` | Individual photos | R2 key, thumbhash, EXIF JSON, `featured` flag |
| `tags` | Shared tag registry | Name + slug |
| `post_tags` | Post↔tag junction | Cascade delete |
| `photo_tags` | Photo↔tag junction | Cascade delete |
| `ui_state` | Per-user UI state | Composite PK (user_email, page), JSON state |
| `deployments` | Deploy tracking | Status (building/deploying/success/failure) |
| `review_conversations` | AI review chat | Composite PK (slug, type), messages JSON |
| `brainstorm_conversations` | AI brainstorm chat | Composite PK (slug, type), messages JSON |

### Data Patterns

- Soft delete throughout: `status IN ('draft', 'published', 'deleted')`
- Published snapshot: JSON snapshot stored at publish time, compared against current fields to detect unpublished changes
- Tags are denormalized: stored as JSON array in `posts.tags` column AND normalized in `post_tags` junction table (kept in sync by the API)

## Frontend — Public Site

### Routing

History API routing with lazy-loaded page modules. 7 static routes + 3 dynamic routes:

```
routes.ts → Route[]
  /              → home.ts
  /blog          → blog.ts        (virtual:posts)
  /portfolio     → portfolio.ts   (virtual:projects)
  /photography   → photography.ts (virtual:photos, virtual:albums)
  /map           → map.ts         (Leaflet, photo locations)
  /resume        → resume.ts      (virtual:pages)
  /about         → about.ts       (virtual:pages)
  /post/:slug    → post.ts        (virtual:posts)
  /project/:slug → project.ts     (virtual:projects)
  /draft/:slug   → draft.ts       (virtual:drafts)
```

Each route has `meta` (title, description for SEO) and a lazy `load()` returning `{ render, setup? }`. No framework — vanilla TS with template literal HTML.

### PWA

Workbox service worker caches JS/CSS/woff2 only. HTML always comes from network (`navigateFallback: null`). This ensures content updates are visible immediately after deploy.

## Frontend — Admin System

4 separate HTML pages, each with its own entry script. No SPA routing — CF Pages serves them as static files.

| Page | Entry | Component | Purpose |
|---|---|---|---|
| `/admin` | `hub-entry.ts` | `<admin-hub>` | Dashboard with cards linking to editor, gallery, pages |
| `/admin/editor` | `editor-entry.ts` | `editor-page.ts` | Post/project editor |
| `/admin/gallery` | `gallery-entry.ts` | `<admin-gallery>` | Photo/album CRUD with upload wizard |
| `/admin/pages` | `pages-entry.ts` | `<admin-pages>` | Generic page editor (about, resume) |

All admin pages share: `<theme-toggle fab>` (top-right), `<deploy-fab>` (floating deploy button), HeroUI theme.

### Editor Architecture (20 modules)

The editor is the most complex piece — a modular system with custom reactive state management:

```
editor/
├── state.ts              — Global state + setState() with selective rendering
├── editor-store.ts       — Lit ReactiveController bridge
├── types.ts              — Post, Project, snapshot types
├── editor-page.ts        — Main orchestrator
├── sidebar.ts            — Lit: post/project list, multi-select, batch ops
├── tabbar.ts             — Lit: open tabs, Map-based DOM patching
├── toolbar.ts            — Formatting toolbar
├── preview.ts            — Live markdown preview (Shiki)
├── project-preview.ts    — Project-specific preview
├── api.ts                — Editor API calls (wraps RPC client)
├── upload.ts             — Image upload (R2 + client-side WebP)
├── gallery.ts            — Image gallery side panel
├── publish.ts            — Publish/unpublish with snapshot tracking
├── delete-modal.ts       — Soft delete confirmation
├── context-menu.ts       — Circular context menu
├── scroll-sync.ts        — Editor↔preview scroll sync
├── undo.ts               — setRangeText-based undo stack
├── review-panel.ts       — AI review (Claude streaming, audience selector)
├── brainstorm-panel.ts   — AI brainstorm (focus areas, streaming)
└── streaming-chat-panel.ts — Shared streaming chat base
```

### State Management

Hand-rolled reactive store. `setState()` tracks which keys changed, maps them to dependency lists (sidebar deps, tabbar deps, form deps), and batches renders via `queueMicrotask`. Lit components connect through `EditorStoreController` which subscribes to render callbacks.

```
setState({ currentSlug: "foo" })
  → key "currentSlug" matches SIDEBAR_DEPS and TABBAR_DEPS
  → pendingRenders.sidebar = true, pendingRenders.tabbar = true
  → queueMicrotask fires registered callbacks
  → Lit components call requestUpdate()
```

This avoids a full reactive framework while keeping selective re-rendering.

### AI Panels

Review and brainstorm panels stream Claude responses via CF AI Gateway (avoids Anthropic blocking CF Workers IPs). Raw `fetch` + SSE parsing, no SDK. Character queue drips text at 1 char/frame via `requestAnimationFrame` for smooth typing animation. Conversations are persisted server-side keyed by `(slug, type)`.

### Gallery Module

7 files for photo/album management:
- `gallery.ts` — main Lit component
- `gallery-album-modal.ts` — album create/edit modal
- `gallery-photo-modal.ts` — photo detail/edit modal
- `gallery-upload-wizard.ts` — multi-step upload flow
- `gallery-types.ts` — shared types
- `gallery-utils.ts` — utility functions
- `theme.ts` — shared theme utility (backend persistence)

## Deployment Pipeline

```
Editor "Publish" → API saves to Turso → API triggers GitHub Actions (repository_dispatch)
  → GitHub Actions runs: vite build (fetches from Turso) → deploys to CF Pages
  → Deploy FAB polls status → shows success/failure
```

Content changes require a full rebuild because all data is baked at build time. The deploy trigger automates this: the editor's publish flow saves to Turso, then fires a `repository_dispatch` event to GitHub Actions, which rebuilds and deploys.

## Design Decisions

1. **Build-time data baking.** All public content is embedded in the JS bundle at build time. The public site makes zero API calls at runtime. Trade-off: every content change requires rebuild + deploy, but the site is fully static and fast.

2. **Two rendering paradigms.** Public pages use vanilla TS (zero framework overhead for readers). Admin pages use Lit (reactive rendering for complex CRUD UIs). The boundary is clean — they share design system components but not rendering approach.

3. **Custom state management over framework.** The editor's `setState()` with dependency tracking is a simplified version of what Solid or Preact signals do. It works well for this specific component structure (sidebar/tabbar/form) without adding a framework dependency.

4. **Separate HTML entry points for admin.** No SPA routing in admin — each page is a separate HTML file. Simpler deployment (CF Pages serves static files), simpler code splitting, independent loading.

5. **CF AI Gateway for Claude.** Anthropic blocks requests from CF Workers IPs. Routing through CF AI Gateway solves this without an SDK dependency.

6. **Denormalized tags.** Tags are stored both as a JSON array on posts (for fast reads) and in a junction table (for relational queries). The API keeps them in sync.

## Known Issues

1. **Duplicate admin route entries in vite.config.** `/admin/gallery` and `/admin` appear twice in the `adminRoutes` object. Second entries silently overwrite the first — no bug, but dead code.

2. **Markdown renderer duplication.** The `markdown-posts` and `pages` plugins both create their own MarkdownIt instances with identical `<a>` → `<ui-link>` and `<img>` → `<ui-image>` renderer rules. Could be extracted into a shared utility.

3. **Build-time DB dependency.** All virtual module plugins require Turso credentials at build time. If the DB is unavailable, the build fails. There's no graceful fallback for the production build (dev mode falls back to empty arrays).

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records.*
