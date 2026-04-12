# ADR-025: Photography Backend

**Status:** Accepted
**Date:** 2026-04

## Context

Adding a photography section to the blog required a data layer before any public pages could be built. Photos need metadata (dimensions, captions, EXIF, thumbhash for blur-up), album grouping, and build-time access for static generation. The existing Turso + Hono stack was the natural fit — no new infrastructure needed.

## Decision

Extend the existing Turso database with `albums` and `photos` tables, add Hono CRUD routes under `/api/photos` and `/api/albums`, and expose build-time data via Vite virtual modules.

### Schema

**albums**

```sql
CREATE TABLE albums (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  description  TEXT,
  cover_photo_id INTEGER REFERENCES photos(id),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**photos**

```sql
CREATE TABLE photos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  r2_key       TEXT NOT NULL UNIQUE,
  url          TEXT NOT NULL,
  title        TEXT,
  caption      TEXT,
  album_id     INTEGER REFERENCES albums(id),
  category     TEXT,
  width        INTEGER,
  height       INTEGER,
  thumbhash    TEXT,
  exif_json    TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  featured     INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'active', -- 'active' | 'deleted'
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Soft delete via `status = 'deleted'` — consistent with the posts pattern in ADR-017.

### API Routes

`/api/photos` — list (with album/category/featured filters), create, update, soft delete, reorder
`/api/albums` — list, create, update, delete, reorder, set cover photo

All routes use Zod for request validation. Auth is handled by the existing CF Access JWT middleware (ADR-017).

### Vite Virtual Modules

Two virtual modules fetch from Turso at build time:

```ts
// vite.config.ts
import { photographyPlugin } from "./plugins/photography";

photographyPlugin(); // provides virtual:photos and virtual:albums
```

```ts
import photos from "virtual:photos";
import albums from "virtual:albums";
```

The plugin runs a single Turso query per module during the Vite build, serializes the result as JSON, and injects it as a virtual module. Public photography pages import these directly — no runtime API calls needed for static content.

### Sitemap Integration

Album routes are added to the sitemap generation with a separate `try/catch` block. If the photos query fails (e.g., empty table during initial deploy), sitemap generation continues without album entries rather than failing the entire build.

```ts
try {
  const albums = await db.execute("SELECT slug FROM albums WHERE status = ?", ["published"]);
  for (const album of albums.rows) {
    urls.push(`/photos/${album.slug}`);
  }
} catch {
  // photos not yet populated — skip silently
}
```

## Consequences

- Schema migrations run via `npm run migrate` in `apps/blog/` — same flow as existing tables
- `thumbhash` enables blur-up placeholders without storing separate thumbnail files in R2
- `exif_json` stores raw EXIF as a JSON string — parsed client-side only when needed, no server-side EXIF processing at request time
- Virtual modules are build-time snapshots; new photos require a redeploy to appear on public pages (acceptable for a personal portfolio)
- The gallery admin page (`/admin/gallery`) manages both tables via the same API routes
