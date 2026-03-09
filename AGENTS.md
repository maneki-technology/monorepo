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
│   ├── ui-components/       # UI components + Storybook (@maneki/ui-components)
│   │                        # button, button-group, accordion-item, accordion-group, alert, avatar, breadcrumb-item, breadcrumb-group, card, checkbox-item, checkbox-group, radio-item, radio-group, dropdown, dropdown-item, dropdown-heading, dropdown-separator, dropdown-split, menu, modal, badge, side-panel-menu, side-panel-menu-item
│   └── foundation/          # Design tokens: colors, semantic, typography, spacing, elevation, breakpoints (@maneki/foundation)
└── apps/                    # (empty — future apps)
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
| Storybook (all packages) | `.storybook/` | Root-level, aggregates foundation + ui-components + grid-layout |

## CONVENTIONS
- **Zero runtime deps** (except `ui-components` and `grid-layout` → `@maneki/foundation`). Foundation has zero production dependencies.
- **Web Components + Shadow DOM.** All UI is custom elements with `attachShadow({ mode: "open" })`.
- **CSS custom properties.** Each package has its own prefix: `--grid-*` (grid-layout), `--fd-*` (foundation), `--ui-*` (ui-components).
- **Package naming.** npm: `@maneki/*` scope (e.g., `@maneki/foundation`, `@maneki/ui-components`, `@maneki/grid-layout`).
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
