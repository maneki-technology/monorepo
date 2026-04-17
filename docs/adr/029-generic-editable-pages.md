# ADR-029: Generic Editable Pages System

## Status

Accepted

## Context

The blog needed editable content pages (about, resume, and potentially more). Initial approaches (#305, #306) created separate tables and APIs per page type, with structured fields (resume_sections) and page-specific meta fields. This led to duplicated infrastructure and inflexible schemas.

## Decision

Implement a single generic `pages` table with:

- `slug` — unique identifier and URL path
- `title`, `content` (markdown + inline HTML), `description` (SEO), `styles` (page-specific CSS)
- `status`, `created_at`, `updated_at`

No `meta` field — all page-specific content lives in the markdown itself (badges, links, layout divs as inline HTML/web components).

Infrastructure:

- One API (`/api/pages` — CRUD with Zod validation)
- One Vite plugin (`virtual:pages` — fetches from Turso, renders markdown → HTML, exposes `getPage(slug)`)
- Thin page route files (`about.ts`, `resume.ts`) that call `getPage(slug)` and return HTML
- Admin editor at `/admin/pages` (Lit component with sidebar, split-pane markdown editor, live preview, auto-save)
- Page-specific CSS stored in `styles` column, injected as `<style>` tag on public pages

## Consequences

- Adding a new page = inserting a row in the DB (no new code needed)
- All pages share the same editor, API, and rendering pipeline
- Page-specific styling is self-contained in the `styles` column
- No schema changes needed per page type
- Trade-off: no structured fields (e.g., drag-to-reorder sections) — content structure lives in markdown
