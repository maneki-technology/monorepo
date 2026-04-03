# ADR-019: Portfolio Management — Dual Content Types

**Status:** Accepted
**Date:** 2026-04

## Context

The blog editor managed only posts. Portfolio projects were hardcoded in `data.ts`. Needed a way to manage projects through the same editor with CRUD, publish/unpublish, batch operations, and drag-to-reorder.

## Decision

Add a `projects` table alongside `posts` with its own CRUD API, and extend the editor to support both content types.

### Database

```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL DEFAULT '',
  tech TEXT NOT NULL DEFAULT '[]',
  url TEXT,
  repo TEXT,
  image TEXT,
  pinned INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT
);
```

### API

Full CRUD at `/api/projects` mirroring the posts API: list, get, create, update, soft delete, publish/unpublish with deploy trigger, reorder, batch delete/publish/unpublish.

### Editor UX

- Sidebar: "Posts" and "Projects" sections with `ui-side-panel-menu-section`
- Tabs: 📝 prefix for posts, 📦 prefix for projects, via `prefix` slot on `ui-tab-item`
- Form: swaps between post fields (title, date, tags, excerpt) and project fields (title, description, tech, URL, repo, image, pin) based on active tab type
- Shared markdown editor + preview for both types
- Multi-select + batch operations for both
- Portfolio fullscreen preview with drag-to-reorder + pin toggle

### Build Pipeline

`portfolio-projects` Vite plugin fetches published projects from Turso at build time, exposes as `virtual:projects`. Portfolio page, homepage (pinned), and project detail pages all consume this.

## Consequences

- Projects managed through the same editor as posts
- Removed hardcoded `data.ts`
- `Post` type renamed from `Draft` for clarity
- Slug cleanup on publish: `project-xxx` → proper slug from title
- Project detail pages prerendered at `/project/:slug`
