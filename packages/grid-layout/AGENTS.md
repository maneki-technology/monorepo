# PROJECT KNOWLEDGE BASE

## OVERVIEW
Zero-dependency Web Component grid layout library (`<grid-layout>`, `<grid-item>`, `<responsive-grid-layout>`) inspired by react-grid-layout. TypeScript, Vite, ~3700 lines. Features: drag/resize, responsive breakpoints, keyboard accessibility (ARIA + keyboard nav), external drag-and-drop, CSS custom properties, lifecycle hooks.

## STRUCTURE
```
@maneki/grid-layout/
├── src/
│   ├── core/          # Pure logic engine (no DOM). Types, math, collision, compaction, layout engine, responsive utils
│   ├── components/    # Web Components with Shadow DOM. grid-item, grid-layout, responsive-grid-layout
│   └── index.ts       # Barrel export — all types, utilities, and components
├── e2e/
│   ├── fixtures.html  # Test fixture page with 8 grid scenarios
│   ├── visual.spec.ts # Playwright screenshot tests (16 tests)
│   └── snapshots/     # Baseline screenshots (auto-generated)
├── demo.html          # Three demos: basic grid, responsive grid, customization (themes + hooks)
├── stress-test.html   # Performance stress test with FPS counter, auto-drag/resize
├── playwright.config.ts # Playwright config (chromium, Vite webServer)
├── vite.config.ts     # Vite build (ES module lib) + Vitest config (happy-dom)
└── tsconfig.json      # ES2022, strict, bundler moduleResolution
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add new layout algorithm | `src/core/compact.ts` | Vertical + horizontal compaction live here |
| Add new event type | `src/core/types.ts` → `GridLayoutEventMap` | Then emit in `grid-layout.ts` |
| Add CSS customization | Component's `STYLES` const | Use `var(--grid-*, fallback)` pattern |
| Add lifecycle hook | `src/core/types.ts` (type) → `grid-layout.ts` (field + usage) → `responsive-grid-layout.ts` (forward) |
| Debug drag/resize | `grid-layout.ts` → `startDrag`/`onDrag`/`endDrag` or `startResize`/`onResize`/`endResize` |
| Debug keyboard nav | `grid-layout.ts` → `handleKeyDown` (~line 657) | Enter/Space=drag, R=resize, arrows=move |
| Debug external drop | `grid-layout.ts` → `handleDragEnter`/`handleDragOver`/`handleDragLeave`/`handleDrop` |
| Responsive breakpoints | `src/core/responsive.ts` | Pure functions, no DOM |
| Collision detection | `src/core/collision.ts` | AABB overlap check |
| Accessibility / ARIA | `grid-item.ts` (role, tabindex, aria-grabbed) + `grid-layout.ts` (role, live region, keyboard handlers) |

## CONVENTIONS
- **No dependencies.** Zero runtime deps. Only devDeps: typescript, vite, vitest, happy-dom, @playwright/test.
- **Shadow DOM everywhere.** All three components use `attachShadow({ mode: "open" })`.
- **CSS custom properties** use `--grid-*` prefix. Defined inline in component style constants, not external CSS.
- **Lifecycle hooks** are JS property setters (not attributes). Return `false` to cancel/reject.
- **Tests co-located.** `foo.ts` → `foo.test.ts` in same directory. Benchmarks in `benchmark.test.ts`.
- **Visual tests in `e2e/`.** Playwright screenshot tests with baseline snapshots. Separate from unit tests.
- **No classes for core logic.** Core modules are pure functions. Only components are classes (extending HTMLElement).
- **Layout is always cloned** on get/set boundaries to prevent external mutation.
- **Accessibility first.** ARIA roles (`role="grid"`, `role="gridcell"`), `tabindex="0"`, `aria-grabbed`, `aria-roledescription`, live region for announcements.
- **Keyboard navigation.** Enter/Space to grab → Arrow keys to move → Enter to drop, Escape to cancel. R for resize mode. All in `grid-layout.ts` `handleKeyDown`.
- **External drag-and-drop.** HTML5 drag events (dragenter/dragover/dragleave/drop). Controlled via `isDroppable` + `droppingItem` properties. Emits `external-drop` event.
- **Animation polish.** `prefers-reduced-motion` respected, container height transition suppressed during drag/resize (`[interacting]` attr), placeholder fades via opacity/visibility, `will-change: transform` on placeholder, `no-animation` attribute disables all transitions globally.

## ANTI-PATTERNS
- **Never suppress types**: no `as any`, `@ts-ignore`, `@ts-expect-error`
- **Never mutate layout externally**: always go through `grid.layout = ...` setter
- **Collision resolution uses bounded loop** (max 100 attempts) in `layout-engine.ts` — was previously recursive and caused infinite recursion
- **Don't inherit components**: `responsive-grid-layout` uses composition (wraps `grid-layout`), not inheritance

## COMMANDS
```bash
npm run dev              # Vite dev server, opens demo.html
npm run build            # tsc + vite build → dist/index.js (ES module)
npm test                 # vitest --run (220 tests, happy-dom)
npm run test:watch       # vitest in watch mode
npm run test:visual      # playwright screenshot tests (21 tests, needs chromium)
npm run test:visual:update  # regenerate baseline snapshots
```

## NOTES
- Build output: ~44 kB / ~9.9 kB gzip
- `src/styles/` directory exists but is empty — CSS lives inside component files as template literals
- `demo.html` uses Vite's HTML entry with `<script type="module">` importing `./src/index.ts` directly
- No git repo initialized yet
- `grid-layout.ts` is the largest file (~923 lines) — contains drag/resize, keyboard nav, external drop, and ARIA logic
- Keyboard state tracked via `_kbDragActive`, `_kbResizeActive`, `_kbFocusedItemId`, `_kbOldLayout` private fields
- External drop state tracked via `_isDroppable`, `_droppingItem`, `_externalDragOver`, `_externalPlaceholderItem` private fields
