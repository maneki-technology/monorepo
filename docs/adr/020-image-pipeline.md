# ADR-020: Image Pipeline — R2 Storage + Client Optimization

**Status:** Accepted
**Date:** 2026-04

## Context

Blog posts and projects need images. Needed a storage solution, upload UX, and optimization pipeline that fits the zero-infrastructure philosophy.

## Decision

Use Cloudflare R2 for storage with client-side image optimization before upload.

### Storage

- R2 bucket `maneki-blog-images` with custom domain `blog-images.maneki.tech`
- Images served directly from R2 (no Worker proxy needed for readers)
- Upload/delete/list behind CF Access auth at `/api/images`
- `IMAGES_BASE_URL` env var controls URL prefix (production: R2 domain, local: `/api/images`)

### Upload UX (3 entry points)

1. **Drag & drop** onto textarea
2. **Paste from clipboard** (Cmd+V)
3. **Toolbar button** (file picker)

### Client-Side Optimization

Before upload: images > 100KB are resized (max 1200px wide) and converted to WebP at 85% quality using Canvas API. SVGs pass through unchanged. If optimized version is larger, original is kept.

### Image Gallery

Side panel (`ui-side-panel position="right" dismissible`) with:

- 2-column grid of `ui-card` thumbnails
- "Select" to pick (callback-based — gallery doesn't know about textarea or project fields)
- "Delete" to remove from R2
- "Upload" button in header
- Reused for both markdown insertion and project image field

### Project Image Field

- Upload/Gallery buttons in empty state
- Thumbnail with hover overlay (Upload/Gallery/Remove) in filled state
- `ui-image` component for preview

## Consequences

- Zero server-side image processing (CF Workers can't do it)
- WebP transparency issue: lossy WebP fills alpha with black (known limitation)
- Images cached with immutable headers (1 year)
- Gallery is callback-based — reusable for any "pick an image" use case
