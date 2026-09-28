# ADR-017: Blog Backend — Hono API + Turso DB (Supersedes ADR-015)

**Status:** Accepted
**Date:** 2026-03
**Supersedes:** [ADR-015](015-blog-markdown-pipeline.md)

**Context:** The blog started as a static markdown pipeline (ADR-015) with posts as `.md` files in `content/posts/`. This worked for authoring in VS Code but lacked a proper editing experience, required git commits to publish, and couldn't support features like draft management, UI state persistence, or one-click publishing.

## Decision

Replace the file-based content pipeline with a Hono API backend + Turso (libSQL) database, deployed as Cloudflare Pages Functions. The blog remains a static site for readers (prerendered HTML), but content is now managed through a browser-based editor backed by a REST API.

## Architecture

```
Author (editor UI)
    │
    │  hc<AppType>  ← typed RPC client, zero codegen
    ▼
Hono API (src/api/)
    │
    │  @libsql/client
    ▼
Turso (libSQL)
    │
    ├── posts        (title, slug, body_md, excerpt, tags, status, timestamps)
    ├── ui_state     (per-user, per-page JSON state)
    └── deployments  (deploy tracking)

Build pipeline (CI):
    Turso (published posts) → Vite plugin → markdown-it + Shiki → prerender → static HTML → CF Pages
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Hono app | `src/api/index.ts` | API entry, exports `AppType` for RPC |
| Posts CRUD | `src/api/routes/posts.ts` | Full CRUD + publish/unpublish + batch ops |
| UI state | `src/api/routes/ui-state.ts` | Generic per-page state persistence |
| Deploy | `src/api/routes/deploy.ts` | Deploy status polling (GitHub Actions) |
| Images | `src/api/routes/images.ts` | Upload to R2, list, serve, delete |
| CF Access auth | `src/api/middleware/auth.ts` | JWT verification + dev bypass |
| Turso client | `src/api/db/client.ts` | Per-request client from env bindings |
| DB schema | `src/api/db/schema.ts` | SQL schema (posts + ui_state + deployments) |
| RPC client | `src/lib/api.ts` | `hc<AppType>` typed client |
| CF Pages adapter | `functions/api/[[route]].ts` | Routes all `/api/*` to Hono |
| Editor | `src/pages/editor/` | 8 modules: state, sidebar, tabbar, preview, toolbar, upload, api, types |
| Vite plugin | `plugins/markdown-posts.ts` | Fetches from Turso at build time |
| Sitemap plugin | `plugins/sitemap.ts` | Fetches slugs from Turso |
| RSS plugin | `plugins/rss-feed.ts` | Fetches posts from Turso |

### Technology Choices

- **Hono** — Ultralight (14KB), Web Standards, runs on CF Workers/Node/Bun/Deno. Zero lock-in. RPC gives end-to-end type safety without codegen.
- **Turso (libSQL)** — SQLite-compatible, edge-replicated, generous free tier. No Cloudflare lock-in — works from any runtime.
- **CF Access** — Zero-code auth at the edge. Protects `/editor` and `/api/*`. JWT verification in middleware. Dev bypass when `CF_ACCESS_AUD` is empty.
- **Shiki (fine-grained bundle)** — `createHighlighterCore` + `createJavaScriptRegexEngine` + explicit lang/theme imports. 10 languages, 2 themes, no WASM. Bundle: 1.4MB (down from 10MB with full Shiki).

### Editor Features

- Collapsible sidebar (`ui-side-panel-menu`) with post list
- Multi-select with checkboxes + batch delete/publish/unpublish
- Tab management with Map-based DOM patching (open/close ≠ delete)
- Delete confirmation via `ui-modal`, soft delete (status='deleted')
- Publish/Export via `ui-dropdown-split` with deploy status polling
- Unpublished changes tracking via `published_at` column (‘*’ indicator)
- Reactive store (`setState` + selective rendering via dependency tracking)
- Auto-save (2s debounce) to API
- UI state persistence (open tabs, active tab, sidebar, theme) to API
- Image upload: drag & drop, paste, toolbar button → R2 storage
- Client-side image optimization (resize to 1200px, WebP conversion)
- Shiki syntax highlighting in split preview + fullscreen preview
- `ui-scrollbar` for preview panes and code blocks
- Deploy trigger via GitHub Actions `repository_dispatch`
- Deploy status polling with per-post spinner indicator

### Post Statuses

| Status | Meaning |
|--------|---------|
| `draft` | Not published, only visible in editor |
| `published` | Live on site after next deploy |
| `deleted` | Soft-deleted, hidden from list |

### API Endpoints

```
GET    /api/posts              List all posts (excludes deleted)
GET    /api/posts/:slug        Get single post
POST   /api/posts              Create post (Zod validated)
PUT    /api/posts/:slug        Update post fields
DELETE /api/posts/:slug        Soft delete (status='deleted')
PUT    /api/posts/:slug/publish    Save + set published + trigger deploy
PUT    /api/posts/:slug/unpublish  Set draft + trigger deploy
POST   /api/posts/batch/delete     Batch soft delete
POST   /api/posts/batch/publish    Batch publish + single deploy
POST   /api/posts/batch/unpublish  Batch unpublish + single deploy

GET    /api/ui-state/:page     Get UI state for current user + page
PUT    /api/ui-state/:page     Upsert UI state (JSON blob)

GET    /api/deploy/status      Poll latest deploy status (GitHub Actions)

POST   /api/images             Upload image to R2
GET    /api/images             List all images
GET    /api/images/:name       Serve image (behind auth)
DELETE /api/images/:name       Delete image
```

## What Changed from ADR-015

| Aspect | ADR-015 (before) | ADR-017 (now) |
|--------|-------------------|---------------|
| Content source | `content/posts/*.md` files | Turso DB (`posts` table) |
| Authoring | VS Code + git commit | Browser editor at `/editor` |
| Publishing | git push → CI build | Save in editor → CI build |
| Content format | Markdown + YAML frontmatter | Markdown body + DB columns |
| Build plugin | Reads filesystem | Fetches from Turso |
| Dependencies | `gray-matter` | `hono`, `@libsql/client`, `zod` |
| Auth | None (static files) | CF Access JWT |
| State persistence | `localStorage` | Turso `ui_state` table |
| Syntax highlighting (editor) | None | Shiki (fine-grained, JS engine) |

## What Stayed the Same

- Static prerendered HTML for readers (SEO, performance)
- Vite virtual module plugin (`virtual:posts`)
- Shiki + markdown-it for build-time rendering
- CF Pages deployment
- History API routing + workbox service worker
- Dark theme via `[data-theme="dark"]`
- Design system components in rendered output (`ui-link`, `ui-image`, `ui-badge`)

## Rationale

- **Better authoring UX.** A browser editor with live preview, tabs, and auto-save is faster than editing markdown in VS Code + committing.
- **No git dependency for content.** Non-technical authors (future) don't need git. Content lives in a database.
- **UI state persistence.** Open tabs, sidebar state, theme preference survive across sessions and devices.
- **Still static for readers.** No runtime DB calls for visitors. Posts are prerendered HTML — same performance as before.
- **Minimal infrastructure.** Turso free tier + CF Pages Functions. No servers to manage.
- **Zero lock-in.** Hono runs anywhere. Turso is SQLite-compatible. CF Access can be swapped for GitHub OAuth.

## Consequences

- Publishing triggers a GitHub Actions deploy via `repository_dispatch`. Requires `GH_DEPLOY_TOKEN` with `repo` scope.
- Turso credentials needed in CI (`TURSO_URL`, `TURSO_AUTH_TOKEN` as GitHub secrets).
- Local dev requires `.dev.vars` with Turso credentials (loaded by `vite.config.ts`).
- `moon run blog:dev-pages` must be used instead of `npm run dev` to get the full API + static serving.
- Editor bundle includes Shiki (~294KB gzip: 111KB) — acceptable for an admin-only page.
- Images stored in Cloudflare R2 (`maneki-blog-images` bucket), served via custom domain `blog-images.maneki.tech`.
- `IMAGES_BASE_URL` env var controls image URL prefix (production: R2 domain, local: `/api/images`).

## Future

- **Image gallery** — browse uploaded images from the editor sidebar.
- **Scheduled publishing** — set a future publish date, auto-deploy at that time.
