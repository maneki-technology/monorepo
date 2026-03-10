# packages/flex-layout — Panel-Based Flex Layout

## OVERVIEW
Panel-based flex layout Web Component system for dashboard-style interfaces. Three components: `<flex-layout>`, `<flex-panel>`, `<flex-panel-header>`. TypeScript, Vite, Shadow DOM, Constructable Stylesheets. Extracted from Figma "Flex Layout" page.

## STRUCTURE
```
flex-layout/
├── src/
│   ├── components/
│   │   ├── flex-layout.ts           # <flex-layout> container
│   │   ├── flex-layout.test.ts
│   │   ├── flex-panel.ts            # <flex-panel> content panel
│   │   ├── flex-panel.test.ts
│   │   ├── flex-panel-header.ts     # <flex-panel-header> title/tabs header
│   │   └── flex-panel-header.test.ts
│   ├── stories/
│   │   ├── basic.stories.ts         # Size variants (Large, Medium, Small)
│   │   └── title-options.stories.ts # Header variants (Tabs, Title, Title+Tabs)
│   └── index.ts                     # Barrel export
├── package.json
├── tsconfig.json
├── vite.config.ts
└── moon.yml
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add new size variant | `flex-layout.ts` SIZE_CONFIG + CSS `:host([size="..."])` | Also update `flex-panel-header.ts` size presets |
| Add new header variant | `flex-panel-header.ts` | Add CSS for `:host([variant="..."])` |
| Change panel styling | `flex-panel.ts` STYLES | White bg, padding, divider |
| Change container styling | `flex-layout.ts` STYLES | Gap, padding, background |
| Add CSS custom property | Component's STYLES const | Use `var(--flex-*, fallback)` pattern |

## COMPONENTS

### `<flex-layout>`
Flex container with size-based gap/padding presets.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `size` | `"large" \| "medium" \| "small"` | `"medium"` | Controls gap and padding |
| `direction` | `"row" \| "column"` | `"row"` | Flex direction |

Size presets (from Figma):
| Size | Gap | Padding |
|------|-----|---------|
| large | 8px | 8px |
| medium | 8px | 8px |
| small | 4px | 4px |

CSS custom properties: `--flex-bg`, `--flex-gap`, `--flex-padding`, `--flex-direction`, `--flex-align`

### `<flex-panel>`
Content panel with optional header slot.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | `number \| null` | `null` | Fixed width in px (overrides flex) |
| `no-padding` | `boolean` | `false` | Remove content padding |

Slots: `header` (named), default (content)

CSS custom properties: `--flex-panel-flex`, `--flex-panel-bg`, `--flex-panel-padding`, `--flex-panel-divider`

### `<flex-panel-header>`
Panel header bar with title and/or tabs.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | `"title" \| "tabs" \| "title-tabs"` | `"title"` | Header type |
| `size` | `"large" \| "medium" \| "small"` | `"medium"` | Size preset |
| `heading` | `string` | `""` | Title text |

Slots: `action` (named, for icon button), `tabs` (named, for tab content)

Size presets (from Figma):
| Size | Height | Font Size |
|------|--------|-----------|
| large | 32px | 12px |
| medium | 24px | 12px |
| small | 20px | 11px |

CSS custom properties: `--flex-header-bg`, `--flex-header-height`, `--flex-header-color`, `--flex-header-divider`, `--flex-header-font-size`, `--flex-header-font-weight`, `--flex-header-line-height`, `--flex-header-icon-size`, `--flex-header-icon-color`, `--flex-header-padding-*`

## CONVENTIONS
- **`@maneki/foundation` is a production dependency.** Components import `semanticVar`, `spaceVar` for CSS custom property fallbacks.
- **Shadow DOM + Constructable Stylesheets.** `const sheet = new CSSStyleSheet(); sheet.replaceSync(STYLES);` at module level, `shadow.adoptedStyleSheets = [sheet]` in constructor.
- **CSS custom properties** use `--flex-*` prefix.
- **No default ARIA role on `<flex-layout>`** — it's a generic container. Consumers add `role="region"` + `aria-label` if needed.
- **`<flex-panel>` uses `role="group"`**, `<flex-panel-header>` uses `role="toolbar"`.
- **Nesting is supported.** `<flex-layout>` inside `<flex-panel>` for split layouts (top/bottom, left/right).
- **Tests co-located.** `foo.ts` → `foo.test.ts` in same directory.

## ANTI-PATTERNS
- **Don't hardcode colors** — use `semanticVar()` / `spaceVar()` from foundation
- **Don't use `role="banner"` on headers** — causes duplicate landmark violations when multiple headers exist
- **Don't use `role="region"` on layout containers** — causes unique landmark violations when nested

## COMMANDS
```bash
npx vitest --run             # Unit tests (50 tests)
npx tsc --noEmit             # Type check
npx vite build               # Build → dist/
```
