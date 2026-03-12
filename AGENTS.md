# MANEKI MONOREPO — KNOWLEDGE BASE

## OVERVIEW
Design system monorepo. Web Components + design tokens extracted from Figma "Foundation UI Kit (Community)". TypeScript, Vite, Vitest. Toolchain: proto (version pinning) + Moon (task runner) + npm workspaces.

## STRUCTURE
```
maneki-monorepo/
├── .prototools              # node 22.16.0, moon 2.0.4
├── .moon/
│   ├── workspace.yml        # projects: apps/*, packages/*
│   └── toolchains.yml       # npm package manager
├── .storybook/              # Root Storybook config (aggregates all packages)
│   ├── main.ts              # stories from foundation + ui-components + grid-layout
│   └── preview.ts           # injects tokens + registers components
├── package.json             # npm workspaces root + Storybook scripts
├── packages/
│   ├── grid-layout/         # <grid-layout> Web Component library (@maneki/grid-layout)
│   ├── flex-layout/         # Panel-based flex layout Web Components (@maneki/flex-layout)
│   ├── ui-components/       # UI components + Storybook (@maneki/ui-components)
│   │                        # Primitives: badge, image, button, avatar, alert, label, link
│   │                        # Form Controls: checkbox-item/group, radio-item/group, input, input-group, file-upload, select
│   │                        # Containers: card, button-group
│   │                        # Navigation: breadcrumb-item/group, side-panel-menu/item
│   │                        # Disclosure: accordion-item/group
│   │                        # Menus & Dropdowns: dropdown, dropdown-item/heading/separator/split, menu
│   │                        # Overlays: modal
│   │                        # Tabs: tab-item, tab-group
│   └── foundation/          # Design tokens: colors, semantic, typography, spacing, elevation, breakpoints (@maneki/foundation)
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
| UI components + Storybook | `packages/ui-components/` | Web Components with stories |
| Grid layout library | `packages/grid-layout/` | Has its own detailed AGENTS.md |
| Flex layout library | `packages/flex-layout/` | Panel-based flex layout, has its own AGENTS.md |
| Storybook (all packages) | `.storybook/` | Root-level, aggregates foundation + ui-components + grid-layout + flex-layout |

## CONVENTIONS
- **Zero runtime deps** (except `ui-components`, `grid-layout`, and `flex-layout` → `@maneki/foundation`). Foundation has zero production dependencies.
- **Web Components + Shadow DOM.** All UI is custom elements with `attachShadow({ mode: "open" })`.
- **CSS custom properties.** Each package has its own prefix: `--grid-*` (grid-layout), `--flex-*` (flex-layout), `--fd-*` (foundation), `--ui-*` (ui-components).
- **Package naming.** npm: `@maneki/*` scope (e.g., `@maneki/foundation`, `@maneki/ui-components`, `@maneki/grid-layout`, `@maneki/flex-layout`).
- **Moon tasks.** kebab-case: `build`, `test`, `test-watch`, `dev`, `storybook`, `storybook-build`, `test-visual`.
- **Build pipeline.** `vite build && tsc --emitDeclarationOnly` → `dist/`. Vite builds JS first, then tsc generates `.d.ts` files.
- **Testing.** Vitest with happy-dom. Tests co-located: `foo.ts` → `foo.test.ts`. Visual tests via Playwright in `e2e/`.
- **TypeScript.** Strict mode, ES2022 target, bundler moduleResolution.
- **Barrel exports.** Each package has `src/index.ts` re-exporting the public API.

## ANTI-PATTERNS
- **No `as any`, `@ts-ignore`, `@ts-expect-error`** — never suppress types
- **No runtime dependencies** — if you need a dep, justify it
- **Don't mutate layouts externally** — always use property setters on components
- **Don't inherit Web Components** — use composition (see responsive-grid-layout pattern)
- **Branch per component** — every new component gets its own branch (`feat/ui-*`). Never implement directly on `main`.
- **Fetch + rebase before branching** — always `jj git fetch` and branch off latest `main` before starting a new component. Prevents merge conflicts from stale base.
- **Visual Figma verification** — compare Storybook rendering against Figma before marking a component done. Use browser tools to screenshot and verify.
- **Reuse existing primitives** — when adding a new component, review existing components and stories to check if they should consume the new component instead of duplicating markup. Applies to both component implementations and Storybook stories.
- **No direct pushes to `main`** — all changes go through feature branches and PRs. Use `jj bookmark set <name> -r @` + `jj git push --bookmark <name>` then `gh pr create`.

## SOP: Making Changes

Every change — component, fix, refactor, docs — follows this workflow:

1. **Fetch + rebase** — `jj git fetch && jj rebase -d main`
2. **Branch per change** — `jj bookmark set feat/ui-* -r @` (or `fix/`, `refactor/`, `docs/`)
3. **Implement** the change
4. **Run tests** — `npx vitest --run` in affected packages
5. **Verify visually** in Storybook against Figma (for UI changes) — use Playwright to screenshot and compare
6. **Update docs before pushing** — follow the "Updating Documentation After Changes" SOP in `packages/ui-components/AGENTS.md`:
   - Test counts in AGENTS.md + README.md
   - Component count if new component
   - Icon constants list if new icons
   - Token mappings if new tokens
   - AGENTS.md structure trees if new files
   - ALWAYS update docs BEFORE the first `jj git push`. Never push code without docs in the same commit.
7. **Ask user to verify visually** — share Storybook screenshots or point to the running Storybook. Wait for user confirmation before pushing. Never push without user sign-off on visual changes.
8. **Push** — `jj bookmark set <name> -r @ --allow-backwards && jj git push --bookmark <name>`
9. **Create PR** — `gh pr create --base main --head <name>`
10. **Chromatic review** — wait for visual regression tests to pass
11. **Never push directly to `main`**

## COMMANDS
```bash
# Proto / Moon (run from repo root)
proto use                    # Install pinned tool versions
moon run <pkg>:build         # Build a specific package
moon run <pkg>:test          # Test a specific package
moon check --all             # Run all tasks across all packages

# Root Storybook (all packages)
npm run storybook            # Dev server on port 6006
npm run storybook:build      # Static build → storybook-static/

# Per-package (run from package dir)
npx vitest --run             # Unit tests
npx tsc --noEmit             # Type check
npx vite build               # Build
```

## NOTES
- Git repo: `maneki-technology/monorepo` on GitHub
- CI/CD: Chromatic for Storybook visual review (`.github/workflows/chromatic.yml`). Storybook: https://www.chromatic.com/library?appId=69ac56bb2124263f2f04fadc
- `apps/` directory exists but is empty — reserved for future consumer apps
- Root `package.json` has Storybook scripts (`storybook`, `storybook:build`) and devDependencies for the root-level Storybook
- Node pinned at 22 because Storybook 10 requires Node 20.19+
- LSP diagnostics unavailable (no global typescript-language-server) — use `npx tsc --noEmit` instead
