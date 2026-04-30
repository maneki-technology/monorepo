# MANEKI MONOREPO — KNOWLEDGE BASE

## OVERVIEW
Maneki Technology monorepo. Polyglot: TypeScript, Zig, Swift, Python.

| Area | Projects | Stack |
|------|----------|-------|
| `packages/` | Foundation, UI Components, Grid/Flex Layout | TypeScript, Lit, Vite |
| `apps/` | Blog, Catalog, Neko Trade | TypeScript (blog/catalog), SwiftUI (Neko Trade) |
| `services/` | DCTrading Bot | Zig, Binance WS, Alpaca, Turso |
| `labs/` | DCTrading Research | Python, MLX, sentiment analysis |

Toolchain: proto (version pinning) + Moon (task runner) + npm workspaces.

## STRUCTURE
```
maneki-monorepo/
├── .prototools              # node 22.16.0, moon 2.0.4
├── .moon/
│   ├── workspace.yml        # projects: apps/*, packages/*, services/*, labs/*
│   └── toolchains.yml       # npm package manager
├── .husky/                   # Pre-commit hook (lint-staged → html-validate + stylelint)
├── .htmlvalidate.json       # HTML linting config
├── .npmrc                   # npm config
├── .stylelintrc.json        # CSS linting config
├── docs/                    # Project-level documentation
│   ├── adr/                 # architectural decision records (see docs/adr/README.md)
│   ├── WEB_COMPONENTS_LESSONS.md  # Lessons learned building Web Components
│   └── AI_STREAMING_LESSONS.md   # Lessons learned streaming AI on CF Workers
├── shared/                  # Shared build utilities
│   └── vite-dev-aliases.ts  # Dev aliases for cross-package HMR
├── package.json             # npm workspaces root
├── packages/
│   ├── grid-layout/         # <grid-layout> Web Component library (@maneki/grid-layout)
│   ├── flex-layout/         # Panel-based flex layout Web Components (@maneki/flex-layout)
│   ├── ui-components/       # UI components (@maneki/ui-components)
│   │                        # Primitives: badge, image, button, avatar, alert, label, link
│   │                        # Form Controls: checkbox-item/group, radio-item/group, input, input-group, file-upload, select
│   │                        # Containers: card, button-group
│   │                        # Navigation: breadcrumb-item/group, side-panel-menu/item/section
│   │                        # Disclosure: accordion-item/group
│   │                        # Menus & Dropdowns: dropdown, dropdown-item/heading/separator/split, menu
│   │                        # Overlays: modal, popover (focus mgmt), tooltip (aria-describedby)
│   │                        # Tabs: tab-item, tab-group
│   │                        # Tags: tag (selectable/toggle)
│   └── foundation/          # Design tokens: colors, semantic, typography, spacing, elevation, breakpoints, dark-theme, token-constants, shape (@maneki/foundation)
├── services/
│   └── dctrading-bot/       # BTC trading bot (Zig 0.16, Binance WS, Alpaca, Turso)
│       ├── src/              # main, strategy, feed, alpaca, turso, telegram, http_client, tests
│       ├── scripts/          # switch-to-gcp.sh, switch-to-local.sh
│       └── build.zig
├── labs/
│   └── dctrading/           # Trading research lab (Python, MLX, sentiment)
│       ├── src/dctrading/    # DC strategy, sentiment module, backtest
│       └── scripts/          # backtest_fast, news_monitor, test_sentiment
├── .env.example             # Shared env template (Alpaca, Turso, Telegram, ntfy)
├── apps/
│   ├── catalog/             # Visual catalog app + Playwright regression tests (@maneki/catalog)
│   ├── neko-trade/          # DCTrading dashboard (SwiftUI, macOS + iOS)
│   └── blog/                # Personal blog + portfolio (@maneki/blog)
│       ├── admin.html            # Admin hub entry point (/admin)
│       ├── admin/                # Admin sub-pages
│       │   ├── editor.html       # Editor entry point (/admin/editor)
│       │   └── gallery.html      # Gallery entry point (/admin/gallery)
│       │   └── pages.html        # Pages editor entry point (/admin/pages)
│       ├── functions/        # CF Pages Functions (Hono API adapter)
│       │   └── api/[[route]].ts
│       ├── plugins/          # Vite plugins: markdown-posts (Turso), auto-ui-components, sitemap, rss-feed, photography (virtual:photos, virtual:albums), pages (virtual:pages)
│       ├── scripts/          # prerender.ts, migrate.ts, seed-posts.ts, seed-resume.ts, seed-about.ts
│       ├── wrangler.toml     # CF Pages local dev config
│       └── src/
│           ├── api/           # Hono API backend
│           │   ├── index.ts   # App entry + AppType export for RPC
│           │   ├── db/        # Turso client + SQL schema
│           │   ├── middleware/ # CF Access JWT auth
│           │   └── routes/    # posts CRUD, ui-state, deploy, images (R2), photos CRUD, albums CRUD, pages CRUD, review (AI), brainstorm (AI), review-conversations, brainstorm-conversations
│           ├── admin/            # Admin pages (Lit components)
│           │   ├── hub.ts        # <admin-hub> hub page
│           │   ├── gallery.ts    # <admin-gallery> photo/album CRUD
│           │   ├── theme.ts      # Shared theme utility (backend persistence)
│           │   ├── hub-entry.ts  # Hub bootstrap
│           │   ├── editor-entry.ts # Editor bootstrap
│           │   └── gallery-entry.ts # Gallery bootstrap
│           │   ├── pages.ts       # <admin-pages> page editor
│           │   ├── pages-entry.ts # Pages bootstrap
│           │   ├── deploy-fab.ts  # <deploy-fab> floating deploy button (ui-button based)
│           ├── components/       # Shared vanilla Web Components
│           │   ├── theme-toggle.ts # <theme-toggle> theme switch (vanilla WC, FAB mode via fab attribute)
│           │   └── mute-toggle.ts  # <mute-toggle> contrast mute toggle (vanilla WC, ui-button based)
│           │   └── theme-toggle.ts # <theme-toggle> theme switch (vanilla WC, FAB mode via fab attribute)
│           ├── lib/              # Shared utilities
│           │   └── api.ts        # Typed RPC client (hc<AppType>)
│           ├── config.ts     # Site URL/title config
│           ├── routes.ts     # Route definitions
│           └── pages/        # 6 routes + editor module (Lit sidebar + tabbar, 20 files under editor/ incl. review-panel + brainstorm-panel)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add a new package | `packages/` | Moon auto-discovers via glob |
| Add a new app | `apps/` | Same auto-discovery |
| Pin tool versions | `.prototools` | Flat format: `node = "22.16.0"` |
| Configure Moon tasks | `packages/*/moon.yml` | Per-package task definitions |
| Change package manager | `.moon/toolchains.yml` | Currently npm |
| Design tokens (colors, spacing, type) | `packages/foundation/` | Extracted from Figma |
| UI components | `packages/ui-components/` | Web Components |
| Grid layout library | `packages/grid-layout/` | Has its own detailed AGENTS.md |
| Flex layout library | `packages/flex-layout/` | Panel-based flex layout, has its own AGENTS.md |
| Visual catalog + Playwright tests | `apps/catalog/` | 55 pages, 114 Playwright tests (55 visual + 55 a11y + sidebar + full layout). History API routing, workbox caching. |
| Personal blog + portfolio | `apps/blog/` | Hono API + Turso DB, CF Pages Functions, static prerendering, admin system at /admin, editor with RPC client |
| Blog API routes | `apps/blog/src/api/` | Hono: posts CRUD, ui-state, deploy trigger, image upload (R2), photos CRUD, albums CRUD, review (AI streaming), brainstorm (AI streaming), review-conversations, brainstorm-conversations |
| Blog editor | `apps/blog/src/pages/editor/` | 20 modules: state, sidebar (Lit), tabbar (Lit), preview, toolbar, upload, api, types, review-panel, brainstorm-panel + more |
| Blog Vite plugins | `apps/blog/plugins/` | markdown-posts (Turso), auto-ui-components, sitemap (Turso), rss-feed (Turso), photography (virtual:photos, virtual:albums), pages (virtual:pages) |
| Blog scripts | `apps/blog/scripts/` | prerender.ts, migrate.ts, seed-posts.ts, seed-resume.ts, seed-about.ts |
| Shared Vite config | `shared/` | Dev aliases for cross-package HMR |
| Linting | `.stylelintrc.json`, `.htmlvalidate.json`, `.husky/` | CSS + HTML linting with pre-commit hook |
| Admin hub | `apps/blog/admin.html` | Hub with Editor, Gallery, Pages, View Site cards |
| Admin gallery | `apps/blog/admin/gallery.html` | Photo/album management (Lit component) |
| Admin editor | `apps/blog/admin/editor.html` | Editor at /admin/editor (new URL) |
| Photography backend | `apps/blog/src/api/routes/photos.ts`, `albums.ts` | CRUD for photos + albums, Zod validation, soft delete |
| Pages API + plugin | `apps/blog/src/api/routes/pages.ts`, `plugins/pages.ts` | Generic CRUD + virtual:pages Vite plugin |
| Seed scripts | `apps/blog/scripts/` | prerender.ts, migrate.ts, seed-posts.ts, seed-resume.ts, seed-about.ts |
| Admin pages editor | `apps/blog/admin/pages.html` | Edit about, resume, and other pages |
| AI review panel | `apps/blog/src/pages/editor/review-panel.ts` | Lit side panel, Claude streaming via CF AI Gateway, audience selector, conversation persistence |
| AI brainstorm panel | `apps/blog/src/pages/editor/brainstorm-panel.ts` | Lit side panel, focus areas (structure/hooks/angles/audience/SEO/open), conversation persistence |
| Mute toggle | `apps/blog/src/components/mute-toggle.ts` | Contrast mute toggle (vanilla WC, ui-button based, localStorage persisted) |

## CONVENTIONS
- **Zero runtime deps** (except `ui-components`, `grid-layout`, and `flex-layout` → `@maneki/foundation`). Foundation has zero production dependencies.
- **Web Components + Shadow DOM.** All UI is custom elements with `attachShadow({ mode: "open" })`.
- **CSS custom properties.** Each package has its own prefix: `--grid-*` (grid-layout), `--flex-*` (flex-layout), `--fd-*` (foundation), `--ui-*` (ui-components).
- **Package naming.** npm: `@maneki/*` scope (e.g., `@maneki/foundation`, `@maneki/ui-components`, `@maneki/grid-layout`, `@maneki/flex-layout`).
- **Moon tasks.** kebab-case: `build`, `test`, `test-watch`, `dev`, `test-visual`.
- **Build pipeline.** `vite build && tsc --emitDeclarationOnly` → `dist/`. Vite builds JS first, then tsc generates `.d.ts` files.
- **Testing.** Vitest with happy-dom. Tests co-located: `foo.ts` → `foo.test.ts`. Visual tests via Playwright in `e2e/`. Tests follow the code — when implementation changes (e.g., sync → async), tests adapt their form accordingly. Never shape code to conform to existing tests.
- **TypeScript.** Strict mode, ES2022 target, bundler moduleResolution.
- **Barrel exports.** Each package has `src/index.ts` re-exporting the public API.
- **Dark theme via `[data-theme]` attribute on `:root`.** Two theme systems: default (`[data-theme="dark"]`) and HeroUI (`[data-theme="heroui"]` / `[data-theme="heroui-dark"]`). Blog uses HeroUI theme. Catalog supports both via theme switcher.
- **Custom icons via `registerIcon()` from `@maneki/ui-components`.** Allows registering custom SVG icons alongside Material Symbols.
- **Centralized token constants in `@maneki/foundation`** — import `TEXT_PRIMARY`, `SP_1`, etc. directly instead of calling `semanticVar()`/`spaceVar()` at each use site.
- **Typography via `typeBlock()`** — `${TYPE_BODY_02}` emits font-family + font-size + line-height + font-weight in one interpolation.
- **Composable label slots.** All form components use `<ui-label slot="label">` instead of a `label` attribute.
- **Label positioning.** `ui-checkbox-item`/`ui-radio-item` use `label-position` (not `label`) for positioning.
- **Side panel header slot.** `ui-side-panel-menu` uses `slot="header"` instead of `title` attribute.
- **Multi-entry build for ui-components.** Barrel import + per-component deep imports for tree-shaking.
- **Dev aliases.** `@maneki/*` resolves to source in dev mode for instant HMR (via `shared/vite-dev-aliases.ts`).
- **Geist font.** Lives in `@maneki/foundation/assets/`, registered via `registerGeistFont()`.
- **Pre-commit hook.** husky + lint-staged runs html-validate + stylelint on staged files.
- **Lit for admin components.** Admin pages use Lit (`lit@3.3.2`) for reactive rendering. Public blog pages do NOT import Lit.
- **`<theme-toggle>` for theme switching.** Vanilla Web Component shared across all pages (public + admin). Uses `ui-button` internally, no Lit dependency. Supports `fab` attribute for fixed-position semi-transparent mode.
- **Admin as static HTML files.** Each admin page (`/admin`, `/admin/editor`, `/admin/gallery`, `/admin/pages`) has its own HTML file and entry script. No SPA routing — CF Pages serves them as static files.
- **Blog accent color.** `--blog-accent` (terracotta) used for post card hover, nav underline, post title hover. Light: `#c2785c`, dark: `#d4956e`.
- **FLIP signature animation.** Hero "Kien Nguyen" animates to header site-name on leaving home. Uses `font-size` interpolation (not `transform: scale`) for crisp text rendering.
- **Homeland signature font.** Self-hosted subset woff2 (4.6KB, "Kien Nguyen" chars only), preloaded. Used for hero and header site-name.
- **Generic editable pages system.** pages table in Turso, /api/pages CRUD, virtual:pages Vite plugin. Public pages (about.ts, resume.ts) read from getPage(slug). Content is markdown with inline HTML/web components. Page-specific CSS stored in styles column.
- **Deploy FAB uses ui-button.** <deploy-fab> is a Lit component wrapping ui-button (action="secondary", icon-only, round via --ui-btn-radius:50%). Shows rocket_launch icon, loading/success/error status via ui-button status attribute.
- **Theme toggle FAB.** <theme-toggle fab> renders as fixed-position semi-transparent button (top-right, opacity 0.3 → 1 on hover). Included in all admin HTML files.
- **Published snapshot for change detection.** published_snapshot TEXT column on posts/projects stores JSON content at publish time. hasUnpublishedChanges() compares snapshot vs current fields. Survives page refresh.
- **ui-image placeholder attribute.** Accepts data URL for blur-up effect. Shows placeholder as background-image, crossfades img on load (0.3s). Respects prefers-reduced-motion.
- **`<mute-toggle>` for contrast muting.** Vanilla Web Component using `ui-button` internally. Toggles `data-muted` attribute on `:root`, persisted to `localStorage('blog-muted')`. Softens all text site-wide via CSS overrides.
- **AI panels use raw `fetch` to Anthropic API.** Routed through CF AI Gateway (`gateway.ai.cloudflare.com`) to avoid Anthropic blocking CF Workers IPs. No SDK dependency — raw SSE streaming with `streamText` from Hono.
- **AI conversation persistence.** `review_conversations` and `brainstorm_conversations` tables in Turso. Keyed by `(slug, type)`. Server-side slug cascade on posts/projects rename. Audience and focus selectors persisted on change.
- **Typing animation for AI streaming.** Character queue drips text at 1 char/frame via `requestAnimationFrame` for smooth appearance. `_flushTypeQueue()` on stream end to finalize.
- **Graceful stream disconnect.** If connection drops mid-stream, partial content is saved to messages array and persisted. Error only shown if no content was received.

## ANTI-PATTERNS
- **No `as any`, `@ts-ignore`, `@ts-expect-error`** — never suppress types
- **No runtime dependencies** — if you need a dep, justify it
- **Don't mutate layouts externally** — always use property setters on components
- **Don't inherit Web Components** — use composition (see responsive-grid-layout pattern)
- **Branch per component** — every new component gets its own branch (`feat/ui-*`). Never implement directly on `main`.
- **Fetch + rebase before branching** — always `jj git fetch` and branch off latest `main` before starting a new component. Prevents merge conflicts from stale base.
- **Visual Figma verification** — compare the visual catalog (or local dev) against Figma before marking a component done. Use browser tools to screenshot and verify.
- **Reuse existing primitives** — when adding a new component, review existing components and catalog pages to check if they should consume the new component instead of duplicating markup.
- **No direct pushes to `main`** — all changes go through feature branches and PRs. Use `jj bookmark set <name> -r @` + `jj git push --bookmark <name>` then `gh pr create`.
- **Cross-package imports must use `@maneki/*` scope** — never use relative paths (`../../foundation/`) to import from another package. Always use the npm scope: `import { semanticVar } from "@maneki/foundation"`. Relative paths break when packages are published to npm.

## SOP: Making Changes

Every change — component, fix, refactor, docs — follows this workflow:

1. **Fetch + rebase** — `jj git fetch && jj rebase -d main`
2. **Branch per change** — `jj bookmark set feat/ui-* -r @` (or `fix/`, `refactor/`, `docs/`)
3. **Implement** the change
4. **Run tests** — `npx vitest --run` in affected packages
5. **Verify visually** against Figma (for UI changes) — use the catalog app and/or Playwright screenshots to compare
6. **Update docs before pushing** — follow the "Updating Documentation After Changes" SOP in `packages/ui-components/AGENTS.md`:
   - Test counts in AGENTS.md + README.md
   - Component count if new component
   - Icon constants list if new icons
   - Token mappings if new tokens
   - AGENTS.md structure trees if new files
   - ALWAYS update docs BEFORE the first `jj git push`. Never push code without docs in the same commit.
7. **Ask user to verify visually** — share catalog screenshots or point to the running catalog dev server. Wait for user confirmation before pushing. Never push without user sign-off on visual changes.
8. **Wait for explicit push request** — NEVER push code unless the user explicitly asks. Present the completed work and wait for the user to say "push", "let's push", "push it", etc.
9. **Push** — `jj bookmark set <name> -r @ --allow-backwards && jj git push --bookmark <name>`
10. **Create PR** — `gh pr create --base main --head <name>`
11. **Visual review** — verify in the catalog app, run Playwright visual tests
12. **Never push directly to `main`**

## SOP: Upgrading Dependencies

1. **Never run `npm audit fix --force`** — it downgrades packages, adds spurious deps to wrong packages, and mangles version ranges
2. **Upgrade one package at a time** — `npm install <pkg>@latest` in the correct workspace
3. **Run `npm audit`** to identify vulnerabilities, then upgrade the specific vulnerable package
4. **Run `npm update`** for safe semver-range updates across the monorepo
5. **Verify after each upgrade** — `moon run foundation:build && moon run ui-components:build && npx vitest --run`
6. **Check `npm outdated`** for remaining upgrades
7. **Accept unfixable transitive vulnerabilities** if they're build-time only (e.g., `workbox-build` → `serialize-javascript`) — note them in the PR description

## COMMANDS
# Proto / Moon (run from repo root)
proto use                    # Install pinned tool versions
moon run <pkg>:build         # Build a specific package
moon run <pkg>:test          # Test a specific package
moon check --all             # Run all tasks across all packages

# Per-package (run from package dir)
npx vitest --run             # Unit tests
npx tsc --noEmit             # Type check
npx vite build               # Build

# Blog (run from apps/blog/)
moon run blog:dev            # Vite dev server (builds deps first)
moon run blog:dev-pages      # Full CF Pages dev (builds all → wrangler)
npm run migrate              # Run Turso DB migrations
npm run seed-posts           # Seed markdown posts into Turso (one-time)
```

## NOTES
- Git repo: `maneki-technology/monorepo` on GitHub
- CI/CD: Playwright visual regression tests in `apps/catalog/`. Catalog deployed via Cloudflare Pages.
- CI test pipeline runs on PRs (`.github/workflows/test.yml`). Deploy workflows for both blog (`deploy-blog.yml`) and catalog (`deploy-catalog.yml`).
- `apps/catalog/` — Visual catalog app with 114 Playwright tests (55 visual + 55 a11y + sidebar + full layout). History API routing, workbox caches JS/CSS/fonts only (not HTML).
- Node pinned at 22 (see `.prototools`) for the toolchain (Vite 8, Vitest 4, etc.)
- LSP diagnostics unavailable (no global typescript-language-server) — use `npx tsc --noEmit` instead
- Dark theme: two systems — default (`[data-theme="dark"]`) and HeroUI (`[data-theme="heroui"]` / `[data-theme="heroui-dark"]`). Blog uses HeroUI. Catalog supports both.
- ADRs in `docs/adr/` — 29 architectural decision records
- `apps/blog/` — Personal blog + portfolio. Hono API + Turso DB, CF Pages Functions, CF Access auth, typed RPC client (hc<AppType>), static prerendering via `scripts/prerender.ts`, History API routing, workbox service worker (JS/CSS/fonts cached, HTML from network), Shiki syntax highlighting (build-time + editor preview), SEO meta tags, sitemap generation (Turso), RSS feed (Turso), FOUC prevention, reading progress bar, client-side search, editor at `/admin/editor` with modular architecture (18 files, Lit sidebar + tabbar), sidebar with multi-select + batch operations for posts and projects, tabs with Map-based DOM patching + prefix slot (📝/📦), reactive store (setState + selective rendering), image upload (R2 + client-side WebP optimization + gallery side panel), deploy trigger (GitHub Actions repository_dispatch + status polling), deploy FAB (ui-button based with rocket_launch icon), portfolio management (projects CRUD + reorder + pin), soft delete, unpublished changes tracking (published_snapshot JSON comparison), undo stack (setRangeText-based, avoids execCommand), scroll sync, circular context menu, UI state persistence, resume page, admin system at /admin (hub, editor, gallery, pages), generic editable pages (virtual:pages), published_snapshot change detection, admin pages editor at /admin/pages, theme toggle FAB, photography backend (albums + photos tables in Turso), FLIP signature animation (hero to header, 16 Playwright e2e tests), blur-to-sharp micro-interactions, terracotta accent color (`--blog-accent`), Homeland signature font (self-hosted subset woff2), AI review panel (Claude streaming via CF AI Gateway, audience selector, conversation persistence), AI brainstorm panel (focus areas, conversation persistence), mute toggle (`data-muted` attribute, localStorage persisted). Port 5175. ESLint + Prettier for linting/formatting.
