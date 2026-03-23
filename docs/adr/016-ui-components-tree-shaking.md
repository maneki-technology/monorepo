# ADR-016: UI Components Tree-Shaking with Auto-Detection

**Status:** Accepted
**Date:** 2026-03

**Context:** The blog app imports `@maneki/ui-components` but only uses 4 of 75 components. The full barrel import bundles all components (475KB / 83KB gzipped), wasting bandwidth on a content-focused site. As the design system grows, this problem compounds for any consumer that uses a subset.

## Decision

Two changes work together:

### 1. Multi-entry build for `@maneki/ui-components`

The Vite library build now emits individual files per component alongside the barrel:

```
dist/
├── index.js                    # Full barrel (all components)
├── components/
│   ├── ui-badge.js             # Individual component
│   ├── ui-card.js
│   ├── ui-link.js
│   └── ...                     # 75 component entry points
└── shared/
    └── index-[hash].js         # Shared foundation code (deduped)
```

The `package.json` exports map enables deep imports:

```json
{
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./components/*": "./dist/components/*"
  }
}
```

Consumers can import the full barrel (`import "@maneki/ui-components"`) or individual components (`import "@maneki/ui-components/components/ui-badge.js"`). Both work.

### 2. Auto-detection Vite plugin for the blog

Instead of manually importing each component, the blog uses a Vite plugin (`plugins/auto-ui-components.ts`) that:

1. Scans `src/`, `content/`, and `index.html` for `<ui-*>` tag patterns
2. Generates a virtual module (`virtual:ui-components`) with only the matching imports
3. Invalidates on HMR when source files change

```
src/pages/home.ts uses <ui-card>, <ui-badge>
content/posts/*.md uses <ui-link>, <ui-image>
index.html uses <ui-link>
        ↓
virtual:ui-components generates:
  import "@maneki/ui-components/components/ui-badge.js";
  import "@maneki/ui-components/components/ui-card.js";
  import "@maneki/ui-components/components/ui-image.js";
  import "@maneki/ui-components/components/ui-link.js";
```

The generated module includes a comment listing detected components for readability.

## Workflow

To use a new component in the blog:

1. Write the `<ui-*>` tag in any `.ts`, `.html`, or `.md` file
2. The plugin detects it automatically on next build or HMR
3. No manual imports needed

## Results

- Blog vendor-ui bundle: **475KB (83KB gz) → 18KB (4.2KB gz)** — 96% reduction
- Catalog (uses full barrel): unaffected, still imports everything via `index.js`
- Adding a new component to the blog: zero friction, just use the tag

## Consequences

- `@maneki/ui-components` build is slightly slower (~400ms vs ~200ms) due to 76 entry points instead of 1. Acceptable.
- The auto-detection plugin uses regex (`<ui-[a-z][-a-z]*`), not AST parsing. Could false-positive on commented-out tags or strings. Acceptable for a personal blog — a false positive just imports an unused component.
- Shared foundation code is deduped into `dist/shared/` chunks by Rollup. Components that share token imports don't duplicate them.

## Alternatives Considered

- **Manual imports** — explicit but tedious. Forgetting an import means a broken component at runtime.
- **Central registry file** — one file to maintain instead of scattered imports, but still manual.
- **`preserveModules: true`** — mirrors source tree in dist. Simpler config but produces many tiny files and exposes internal structure.
