# ADR-015: Blog App — Markdown Pipeline with Static Generation

**Status:** Accepted
**Date:** 2026-03

**Context:** Need a personal blog + portfolio app within the monorepo. Must support mixed content (technical posts with code blocks, prose, images), dark theme, and leverage the existing Maneki design system. The blog should be easy to write for and produce WYSIWYG results.

## Decision

Build the blog as a static Vite SPA (`apps/blog/`) that reads markdown files from `content/posts/` at build time via a custom Vite virtual module plugin. Posts are authored as `.md` files with YAML frontmatter. No backend, no database, no CMS.

## Design Principles

1. **Content-first typography.** Anchored on the foundation type scale: `display-03` for hero, `heading-02` for post titles, `body-01` (16px/24px) for reading, `code-01`/`code-02` (Roboto Mono) for code blocks.
2. **Single-column layout.** 720px max-width centered content. No sidebar. Minimal top nav (Blog, Portfolio, About) + theme toggle.
3. **Generous whitespace, spacious density.** 48–80px between major sections, 24–32px between content blocks, 8px grid spacing scale.
4. **Minimal elevation.** Flat design with `border-minimal`/`border-subtle` for separation. Cards only for portfolio project previews.
5. **Color restraint.** `text-primary` (gray-80) for body, `text-secondary` for metadata, blue-60 as the single accent (links, active states, tags).
6. **Dark theme from day one.** All styles use semantic tokens (`--fd-*`). Theme toggle via `[data-theme="dark"]` on `:root`.
7. **Component reuse.** `ui-card`, `ui-badge`, `ui-link`, `ui-icon` from `@maneki/ui-components` — no custom component implementations.

## Content Pipeline

```
content/posts/2026-03-15-my-post.md   (author writes here)
        ↓
plugins/markdown-posts.ts             (Vite plugin: gray-matter + markdown-it)
        ↓
virtual:posts                          (virtual module: Post[] with HTML content)
        ↓
src/pages/{home,blog,post}.ts          (consume posts, render to DOM)
```

- **Frontmatter** provides title, date, excerpt, tags.
- **Read time** is auto-calculated (~200 words/min).
- **Filename convention:** `YYYY-MM-DD-slug.md` — sorted reverse-chronologically.
- **HMR:** The Vite plugin watches `content/posts/` and invalidates the virtual module on file changes. Edit markdown, save, see the real result instantly with your actual CSS and components.
- **Images:** Stored in `public/images/`, referenced as `![alt](/images/foo.png)`. Blog CSS applies `max-width: 100%` and `border-radius: 8px` automatically.

## Rationale

- **WYSIWYG without a WYSIWYG editor.** The dev server IS the preview. No external editor can render with Maneki tokens, so the blog itself is the source of truth for how content looks.
- **Git-native workflow.** Posts are version-controlled, PR-reviewable, diffable. No external CMS dependency.
- **Zero infrastructure.** Static output deploys to Cloudflare Pages (like the catalog). No server, no database, no API keys.
- **Familiar tooling.** Write in VS Code (or Obsidian/Typora), preview in browser with Vite HMR.
- **Incremental complexity.** Start static, add dynamic features later (giscus for comments, pagefind for search) without rewriting the core.

## Consequences

- Publishing requires a build + deploy (no instant publish from a CMS UI).
- No server-side features (comments, search, analytics) without external services.
- All posts are bundled into the client JS — acceptable for a personal blog (dozens of posts, not thousands). If post count grows significantly, switch to per-post code splitting.
- Images must be committed to the repo or hosted externally.

## Alternatives Considered

- **Headless CMS (Sanity, Contentful)** — nice editing UI but adds external dependency, API limits, overkill for a dev blog.
- **Custom Node.js backend** — full control but requires hosting, maintenance, and is unnecessary for static content.
- **Existing SSG (Astro, 11ty)** — would work but adds another framework. Staying with Vite keeps the toolchain consistent with the rest of the monorepo.
