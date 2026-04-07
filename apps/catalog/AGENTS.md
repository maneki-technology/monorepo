# apps/catalog — Visual Catalog & Playwright Regression Tests

## OVERVIEW
Dedicated visual catalog app for the Maneki design system. Renders all foundation tokens and UI components with key variants on static pages. Used as the target for Playwright screenshot-based visual regression tests (visual + accessibility). Pure Vite + vanilla TypeScript.

## STRUCTURE
```
catalog/
├── index.html              # App shell (sidebar + content area + theme toggle + CSS)
├── vite.config.ts          # Vite config with @maneki/* aliases
├── tsconfig.json           # TypeScript config
├── playwright.config.ts    # Playwright: chromium, 1280×900, vite preview server
├── moon.yml                # Moon tasks: dev, build, test-visual, test-visual-update
├── package.json            # @maneki/catalog — deps on foundation + ui-components
├── src/
│   ├── main.ts             # App entry: injects tokens, registers icon font, imports all pages, History API router, theme toggle
│   └── pages/              # 55 page modules (6 foundation + 49 component)
│       ├── colors.ts
│       ├── spacing.ts
│       ├── typography.ts
│       ├── elevation.ts
│       ├── semantic-tokens.ts
│       ├── shape.ts
│       ├── badge.ts
│       ├── button.ts
│       ├── avatar.ts
│       ├── alert.ts
│       ├── icon.ts
│       ├── image.ts
│       ├── label.ts
│       ├── link.ts
│       ├── tag.ts
│       ├── checkbox.ts
│       ├── radio.ts
│       ├── input.ts
│       ├── textarea.ts
│       ├── file-upload.ts
│       ├── select.ts
│       ├── card.ts
│       ├── breadcrumb.ts
│       ├── accordion.ts
│       ├── dropdown.ts
│       ├── menu.ts
│       ├── modal.ts
│       ├── popover.ts
│       ├── tooltip.ts
│       ├── side-panel-menu.ts
│       ├── side-panel.ts
│       ├── tabs.ts
│       ├── table.ts
│       ├── carousel.ts
│       ├── calendar.ts
│       ├── datetime-picker.ts
│       ├── clock.ts
│       ├── list.ts
│       └── ... (55 pages total)
└── e2e/
    ├── helpers.ts          # Shared page list + test utilities
    ├── visual.spec.ts      # 55 Playwright visual screenshot tests + sidebar + full layout
    ├── a11y.spec.ts        # 55 Playwright accessibility tests (axe-core) + sidebar + full layout
    ├── test-results/        # Playwright test artifacts (gitignored)
    └── snapshots/           # Baseline screenshots (committed)
        └── visual.spec.ts/
            ├── visual-colors/colors-chromium.png
            ├── visual-button/button-chromium.png
            ├── visual-sidebar/sidebar-chromium.png
            ├── visual-full-layout/full-layout-chromium.png
            └── ... (55+ snapshot directories total)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add a new catalog page | `src/pages/` | Create file + import in `main.ts` |
| Add page to visual tests | `e2e/helpers.ts` | Add page ID to shared `pages` array |
| Add page to a11y tests | `e2e/a11y.spec.ts` | Uses same `pages` array from `helpers.ts` |
| Update baseline snapshots | Run `test-visual-update` | After intentional visual changes |
| Modify app shell/layout | `index.html` | Sidebar, content area, theme toggle, CSS classes |
| Change Playwright config | `playwright.config.ts` | Viewport, threshold, browser |

## ARCHITECTURE

### Page Registration
Each page module calls `registerPage(id, { title, section, render, setup? })`:
- `id` — URL path segment (e.g., `"button"` → `/button`)
- `title` — displayed as `<h2>` heading
- `section` — sidebar group (`"Foundation"` or `"Components"`)
- `render()` — returns plain HTML string with web component tags
- `setup()` — optional, runs after render for imperative DOM manipulation (e.g., `setItems()`)

### Router
History API routing. `history.pushState()` + `popstate` event. Sidebar links intercept clicks and push state, `popstate` triggers re-render.

### Theme Toggle
App shell includes a dark/light theme toggle button. Sets `[data-theme="dark"]` on `:root` to switch all semantic tokens to dark values.

### Visual Tests
One screenshot test per page, targeting `#content` element (excludes sidebar for focused component comparison). Plus sidebar and full-layout tests. Shared `pages` array in `e2e/helpers.ts` drives both visual and a11y specs.

### Accessibility Tests
Per-page a11y tests using `@axe-core/playwright`. Each page is loaded and scanned for WCAG violations. Uses the same shared `pages` array from `e2e/helpers.ts`.

## CONVENTIONS
- **Plain HTML strings** — no lit, no JSX. `render()` returns template literal HTML.
- **CSS classes from index.html** — `variant-row`, `variant-col`, `variant-label`, `variant-group` for consistent layout.
- **Components auto-registered** — `import "@maneki/ui-components"` in `main.ts` registers all custom elements globally.
- **Snapshot naming** — `{pageId}-chromium.png` inside `visual-{pageId}/` directory.
- **1% pixel diff threshold** — `maxDiffPixelRatio: 0.01` in Playwright config.

## ANTI-PATTERNS
- **Don't use framework-style story patterns** — no lit `html`, no CSF, no decorators. Plain HTML strings only.
- **Don't open dropdowns/modals by default** — they overlay other content and break screenshots.
- **Don't use external images** — they cause flaky tests. Use colored divs or inline SVGs.
- **Don't forget to add new pages to `main.ts` imports, AND the `pages` array in `e2e/helpers.ts`** (drives both visual.spec.ts and a11y.spec.ts).

## COMMANDS
```bash
# Development
moon run catalog:dev                # Vite dev server on port 5174
npx vite --port 5174               # Same, from apps/catalog/

# Build
moon run catalog:build              # Vite production build → dist/

# Visual regression tests
moon run catalog:test-visual        # Run 114 Playwright tests (55 visual + 55 a11y + sidebar + full layout)
moon run catalog:test-visual-update # Regenerate baseline snapshots

# From apps/catalog/ directly
npx playwright test                 # Run tests
npx playwright test --update-snapshots  # Update baselines
```

## SOP: Adding a New Catalog Page

1. Create `src/pages/{component}.ts`
2. Import `registerPage` from `"../main.js"`
3. Call `registerPage("{id}", { title, section: "Components", render: () => html })`
4. Add `import "./pages/{component}.js"` to `src/main.ts`
5. Add `"{id}"` to the `pages` array in `e2e/helpers.ts` (drives both visual + a11y tests)
6. Run `npx vite build && npx playwright test --update-snapshots` to generate baseline
7. Verify the snapshot looks correct
8. Commit the new page file + snapshot

## NOTES
- Vite aliases resolve `@maneki/foundation` and `@maneki/ui-components` to source (not dist) for HMR in dev
- Playwright uses `vite preview` (production build) for deterministic rendering
- 114 tests (55 visual + 55 a11y + sidebar + full layout) run on Chromium
- Snapshots are platform-specific (chromium on macOS) — CI may need its own baselines
- The `setup()` callback uses `requestAnimationFrame` to ensure DOM is ready before imperative manipulation
