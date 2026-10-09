# packages/ui-components — Design System Components

## OVERVIEW

Web Component library for the Maneki design system. Shadow DOM, CSS custom properties, TypeScript. Runtime dependencies: `@maneki/foundation` and `lit`. Ships 78 registered elements: 74 vanilla components and four Lit side-panel components. Currently ships:

**Primitives:**

- `<ui-badge>` — label/tag with 4 sizes, 3 emphases, 2 shapes, 13 colors, 5 statuses, uppercase text
- `<ui-image>` — image container: 5 aspect ratios (16:9/3:2/1:1/3:1/21:9), 4 object-fit modes (cover/contain/fill/none), placeholder blur-up (data URL), fallback slot
- `<ui-button>` — full Figma spec: 5 actions, 3 emphases, 4 sizes, 2 shapes, 4 icon modes, 3 statuses
- `<ui-avatar>` — avatar component: 5 sizes, 3 types (text/icon/image), 2 emphases, 2 shapes, 5 statuses, 14 colors
- `<ui-alert>` — dismissable alert/toast: 3 sizes, 2 emphases, 5 statuses, footer slot
- `<ui-label>` — form field label: 3 sizes (s/m/l), 2 emphases (bold/subtle), disabled state, required indicator
- `<ui-link>` — anchor/span link: 3 sizes (s/m/l), 7 states (enabled/hover/focus/active/visited/disabled/current), standalone/inline modes, external icon, keyboard accessible span mode
- `<ui-tag>` — tag pill/toggle: 4 sizes (xs/s/m/l), 3 types (basic/selectable/toggle), 3 emphases (bold/subtle/minimal), 3 states (enabled/selected/disabled), dismissible + check icon, preserves label casing; HeroUI dark coloured subtle/minimal variants use theme palette overrides

**Form Controls:**

- `<ui-checkbox-item>` — checkbox component: 3 sizes (s/m/l), 3 check states (unchecked/checked/indeterminate), 3 label positions (none/right/left), 5 states (enabled/hover/focus/disabled/error)
- `<ui-checkbox-group>` — checkbox group wrapper: 3 sizes (s/m/l), 2 orientations (vertical/horizontal), size propagation to children
- `<ui-radio-item>` — radio button component: 3 sizes (s/m/l), 2 check states (unchecked/checked), 3 label positions (none/right/left), 5 states (enabled/hover/focus/disabled/error), value attribute
- `<ui-radio-group>` — radio group wrapper: 3 sizes (s/m/l), 2 orientations (vertical/horizontal), size propagation to children, mutual exclusion (single selection), roving tabindex
- `<ui-input>` — text input: 3 sizes (s/m/l), 4 types (text/numeric/clearable/password), 7 states (enabled/hover/focus/active/filled/disabled/readonly), 5 statuses (none/warning/error/success/loading), label, secondary label, supportive text, leading/trailing slots
- `<ui-input-group>` — input group wrapper: 3 sizes (s/m/l), prefix/suffix slots with separators, composes `<ui-input>`
- `<ui-file-upload>` — file upload input: 3 sizes (s/m/l), Browse button, accept/multiple attributes, disabled state
- `<ui-dropzone>` — drag-and-drop file upload zone: 3 sizes (s/m/l), drag-over visual feedback, accept/multiple filtering, browse link, hint text, label slot, disabled state
- `<ui-select>` — select dropdown: 3 sizes (s/m/l), 7 states, 5 statuses, single/multi-select with tag pills, WAI-ARIA combobox pattern, leading slot, clearable, label/supportive text
- `<ui-textarea>` — textarea: 3 sizes (s/m/l), 7 states (enabled/hover/focus/active/filled/disabled/readonly), 5 statuses (none/warning/error/success/loading), label with char count, secondary label, resize handle

**Data Display:**

- `<ui-table>` — table container: 3 sizes (s/m/l), 2 separators (minimal/moderate), zebra striping, bordered, size propagation to children
- `<ui-table-row>` — table row: header, selected, disabled states, hover highlight
- `<ui-table-cell>` — table cell: header (columnheader ARIA), 3 alignments (left/center/right), size-dependent typography

**Carousel:**

- `<ui-carousel>` — horizontal scroll carousel: snap scrolling, prev/next arrows, dot indicators, auto-play, loop, gap control
- `<ui-carousel-item>` — carousel slide wrapper

**Calendar:**

- `<ui-calendar>` — standalone calendar: 3 sizes (s/m/l), daily + monthly views, single/range selection, today highlight, outside-month, min/max, event dots + legend, hover/focus states
- `<ui-calendar-quicklinks>` — composable quicklinks panel: 3 sizes (s/m/l), 2 orientations (side/bottom), section headings, selected state, click events
- `<ui-calendar-time>` — composable inline time panel: 3 sizes (s/m/l), hour/minute inputs, AM/PM toggle switch, separator line, 12h/24h conversion

**Datetime Picker:**

- `<ui-datetime-picker-input>` — date/time input trigger: 4 types (single-date/range-date/time/datetime), 3 sizes, 7 states, 5 statuses, label, supportive text, spin controls for time
- `<ui-datetime-picker>` — datetime picker orchestrator: input + floating dropdown, 4 types (single-date/range-date/time/datetime), calendar or clock panel, min/max, actions bar (Cancel/OK)
- `<ui-clock>` — standalone clock: analog face + 24-hour digital mode, 3 sizes, hour/minute toggle selection

**List:**

- `<ui-list-item>` — list item: 3 sizes (s/m/l), 5 leading elements (none/icon/avatar/radio/checkbox), 3 paddings, 4 states, top border, trailing icon, description, selected tick
- `<ui-list-header>` — list section header: 3 sizes (s/m/l), collapse button, top border toggle
- `<ui-list-group>` — list group wrapper: size propagation, collapsible, header + items slots

**Containers:**

- `<ui-card>` — slot-based card container: 3 sizes (s/m/l), 4 elevations (00/01/02/04), bordered variant, image/default/footer slots
- `<ui-button-group>` — segmented bar that wraps `<ui-button>` elements

**Navigation:**

- `<ui-breadcrumb-item>` — breadcrumb link item: 3 sizes, 7 states (enabled/hover/focus/active/visited/disabled/current), chevron separator
- `<ui-breadcrumb-group>` — breadcrumb nav wrapper with size propagation
- `<ui-side-panel-menu>` — collapsible sidebar navigation: expanded/collapsed states, mobile responsive (auto-collapse), flyout submenu in collapsed mode, overlay mode, selection management with parent highlighting
- `<ui-side-panel-menu-item>` — sidebar menu item: 3 levels (primary/secondary/tertiary), expandable parent with inline children, leading icon slot, selected/disabled states, keyboard navigation
- `<ui-side-panel-menu-section>` — sidebar section grouping: heading label, collapsible, divider line

**Disclosure:**

- `<ui-accordion-item>` — expandable panel: 3 sizes, 2 emphases, 4 statuses, smooth CSS transition
- `<ui-accordion-group>` — wrapper with size/emphasis propagation + exclusive mode

**Menus & Dropdowns:**

- `<ui-dropdown>` — dropdown button with floating menu: 4 sizes (s/m/l/xl), 5 actions, 3 emphases, 2 shapes, opt-in `selectable` attribute for single/multi-select, composes `<ui-button>` as trigger
- `<ui-dropdown-item>` — menu item: 3 sizes (s/m/l), 4 leading elements (icon/checkbox/radio/avatar), secondary label, description, submenu arrow, 6 states (enabled/hover/active/focus/selected/disabled), select event, checkmark, value attribute
- `<ui-dropdown-heading>` — section heading: 3 sizes (s/m/l), uppercase, non-interactive
- `<ui-dropdown-separator>` — horizontal divider line
- `<ui-dropdown-split>` — split button with action (left) + chevron trigger (right) + floating menu: 4 sizes (s/m/l/xl), 5 actions, 3 emphases, 2 shapes, 4 icon modes, opt-in `selectable` for single/multi-select, independent hover/active/focus per button half, full-height divider (hidden for minimal/contrast)
- `<ui-menu>` — standalone floating menu panel: 3 sizes (s/m/l), open/close animation, outside-click + Escape dismiss, opt-in `selectable` for single/multi-select, size propagation to children, composes `<ui-dropdown-item>` / `<ui-dropdown-heading>` / `<ui-dropdown-separator>`

**Overlays:**

- `<ui-modal>` — native modal dialog with top-layer backdrop and inert background, header (title+subtitle+close), scrollable body, footer button slots, 3 sizes, 2 layouts (auto/fluid), dismiss behavior
- `<ui-popover>` — focus-managed popover: trigger element, floating panel, outside-click + Escape dismiss, focus trap, arrow key navigation
- `<ui-tooltip>` — tooltip with aria-describedby: hover/focus trigger, configurable placement, delay, accessible label

**Tabs:**

- `<ui-tab-item>` — tab item: 2 sizes (s/m), 3 states (enabled/selected/disabled), 2 orientations (horizontal/vertical), leading/trailing icon slots, sub-menu chevron, smooth transition
- `<ui-tab-group>` — tab group wrapper: size/orientation propagation, single selection, roving tabindex, arrow key navigation

**Icons:**

- `<ui-icon>` — Material Symbols icon: 5 sizes (xxs/xs/s/m/l), 10 states (enabled/hover/active/focus/disabled + inverse variants), filled variant, ICON_CODEPOINTS lookup with ligature fallback, accessible label, custom icon registry via `registerIcon()`

**Metrics, navigation and utilities:**

- `<ui-metric>` — Metric value with label and delta
- `<ui-metric-group>` — Metric grouping and layout
- `<ui-pagination>` — Pagination: minimal, basic and data-grid variants
- `<ui-person-item>` — Person display item
- `<ui-person-group>` — Person grouping
- `<ui-progress-bar>` — Linear progress indicator
- `<ui-progress-circle>` — Circular progress indicator
- `<ui-pull-to-refresh>` — Pull-to-refresh indicator
- `<ui-queryfield>` — Query input with composable filters
- `<ui-queryfield-tag>` — Query filter tag
- `<ui-search>` — Search input with categorized results
- `<ui-separator>` — Horizontal or vertical separator
- `<ui-side-panel>` — Expandable side panel
- `<ui-skeleton>` — Loading placeholder: text, circle and rectangle
- `<ui-slider>` — Range slider
- `<ui-step-item>` — Step indicator
- `<ui-step-group>` — Step grouping and orientation
- `<ui-switch>` — Toggle switch with label positioning
- `<ui-toolbar>` — Horizontal or vertical toolbar
- `<ui-toolbar-separator>` — Toolbar separator
- `<ui-tree-item>` — Tree item with expandable children
- `<ui-tree-group>` — Tree grouping
- `<ui-calendar-panel>` — Calendar wrapper with side/bottom slots and actions
- `<ui-scrollbar>` — Scrollable container with emphasis and orientation
- `<ui-wizard>` — Multi-step wizard with navigation

## STRUCTURE

```
ui-components/
├── src/
│   ├── index.ts             # Barrel export + custom element registration
│   ├── define-custom-element.ts # Idempotent registration; first constructor wins
│   ├── css-minify.ts        # Build-time CSS literal minification
│   ├── registration.test.ts # Duplicate package-loading regression
│   ├── test/setup.ts        # happy-dom ElementInternals shim
│   ├── components/
│   │   ├── ui-accordion-group.ts
│   │   ├── ui-accordion-item.ts
│   │   ├── ui-alert.ts
│   │   ├── ui-avatar.ts
│   │   ├── ui-badge.ts
│   │   ├── ui-breadcrumb-group.ts
│   │   ├── ui-breadcrumb-item.ts
│   │   ├── ui-button-group.ts
│   │   ├── ui-button.ts
│   │   ├── ui-calendar-panel.ts + ui-calendar-panel.styles.ts
│   │   ├── ui-calendar-quicklinks.ts + ui-calendar-quicklinks.styles.ts
│   │   ├── ui-calendar-time.ts + ui-calendar-time.styles.ts
│   │   ├── ui-calendar.ts + ui-calendar.styles.ts
│   │   ├── ui-card.ts
│   │   ├── ui-carousel-item.ts
│   │   ├── ui-carousel.ts
│   │   ├── ui-checkbox-group.ts
│   │   ├── ui-checkbox-item.ts
│   │   ├── ui-clock.ts + ui-clock.styles.ts
│   │   ├── ui-datetime-picker-input.ts + ui-datetime-picker-input.styles.ts
│   │   ├── ui-datetime-picker.ts + ui-datetime-picker.styles.ts
│   │   ├── ui-dropdown-heading.ts
│   │   ├── ui-dropdown-item.ts + ui-dropdown-item.styles.ts
│   │   ├── ui-dropdown-separator.ts
│   │   ├── ui-dropdown-split.ts + ui-dropdown-split.styles.ts
│   │   ├── ui-dropdown.ts
│   │   ├── ui-dropzone.ts
│   │   ├── ui-file-upload.ts
│   │   ├── ui-icon.ts
│   │   ├── ui-image.ts
│   │   ├── ui-input-group.ts
│   │   ├── ui-input.ts + ui-input.styles.ts
│   │   ├── ui-label.ts
│   │   ├── ui-link.ts
│   │   ├── ui-list-group.ts + ui-list-group.styles.ts
│   │   ├── ui-list-header.ts + ui-list-header.styles.ts
│   │   ├── ui-list-item.ts + ui-list-item.styles.ts
│   │   ├── ui-menu.ts
│   │   ├── ui-metric-group.ts
│   │   ├── ui-metric.ts + ui-metric.styles.ts
│   │   ├── ui-modal.ts
│   │   ├── ui-pagination.ts + ui-pagination.styles.ts
│   │   ├── ui-person-group.ts
│   │   ├── ui-person-item.ts + ui-person-item.styles.ts
│   │   ├── ui-popover.ts + ui-popover.styles.ts
│   │   ├── ui-progress-bar.ts + ui-progress-bar.styles.ts
│   │   ├── ui-progress-circle.ts
│   │   ├── ui-pull-to-refresh.ts + ui-pull-to-refresh.styles.ts
│   │   ├── ui-queryfield-tag.ts + ui-queryfield-tag.styles.ts
│   │   ├── ui-queryfield.ts + ui-queryfield.styles.ts
│   │   ├── ui-radio-group.ts
│   │   ├── ui-radio-item.ts
│   │   ├── ui-scrollbar.ts + ui-scrollbar.styles.ts
│   │   ├── ui-search.ts + ui-search.styles.ts
│   │   ├── ui-select.ts + ui-select.styles.ts
│   │   ├── ui-separator.ts
│   │   ├── ui-side-panel-menu-item.ts
│   │   ├── ui-side-panel-menu-section.ts
│   │   ├── ui-side-panel-menu.ts
│   │   ├── ui-side-panel.ts + ui-side-panel.styles.ts
│   │   ├── ui-skeleton.ts
│   │   ├── ui-slider.ts + ui-slider.styles.ts
│   │   ├── ui-step-group.ts
│   │   ├── ui-step-item.ts + ui-step-item.styles.ts
│   │   ├── ui-switch.ts
│   │   ├── ui-tab-group.ts
│   │   ├── ui-tab-item.ts
│   │   ├── ui-table-cell.ts
│   │   ├── ui-table-row.ts
│   │   ├── ui-table.ts
│   │   ├── ui-tag.ts
│   │   ├── ui-textarea.ts + ui-textarea.styles.ts
│   │   ├── ui-toolbar-separator.ts
│   │   ├── ui-toolbar.ts
│   │   ├── ui-tooltip.ts
│   │   ├── ui-tree-group.ts
│   │   ├── ui-tree-item.ts + ui-tree-item.styles.ts
│   │   ├── ui-wizard.ts
│   │   ├── constructor-attributes.test.ts # Registered-element construction
│   │   └── *.test.ts            # Co-located tests
```

## WHERE TO LOOK

| Task                        | Location                   | Notes                                                                  |
| --------------------------- | -------------------------- | ---------------------------------------------------------------------- |
| Add new component           | `src/components/`          | Create `ui-foo.ts` + `ui-foo.test.ts`                                  |
| Visual preview / regression | `apps/catalog/`            | Static pages + Playwright (see `apps/catalog/AGENTS.md`)               |
| Register element            | `src/components/ui-foo.ts` | `defineCustomElement()` after the class; re-export from `src/index.ts` |
| Add new icon                | See foundation SOP         | Add to foundation, use `<ui-icon>` in components                       |

## COMPONENT PATTERN

### New Components (Lit — required for all new components)

Follow `ui-side-panel-menu-section.ts` as reference:

1. Class extends `LitElement`
2. `defineCustomElement("ui-foo", UiFoo)` from `../define-custom-element.js` after the class for idempotent registration (also used by vanilla components)
3. `@property()` decorators for observed attributes
4. ``static styles = css`...` `` with foundation tokens wrapped in `unsafeCSS()`
5. `render()` returns `html\`...\`` template
6. CSS uses nested var pattern: `var(--ui-btn-bg, ${unsafeCSS(BLUE_60)})` — consumer override → foundation token
7. For large components (700+ lines): extract styles into `ui-foo.styles.ts`
8. See [ADR-028](../../docs/adr/028-lit-in-ui-components.md) for rationale

### Existing Components (vanilla HTMLElement — no obligation to migrate)

Follow `ui-button.ts` or `ui-alert.ts` as reference:

1. Class extends `HTMLElement`
2. `attachShadow({ mode: "open" })` in constructor
3. DOM built imperatively with `document.createElement()` (not innerHTML)
4. Observed attributes → `attributeChangedCallback`
5. CSS in `STYLES` template literal with token constants at module level
6. CSS uses nested var pattern: `var(--ui-btn-bg, ${BLUE_60})` / `var(--ui-badge-bg, ${GRAY_60})` — consumer override → foundation token
7. `defineCustomElement("ui-*", Class)` from `../define-custom-element.js` after the class; registration retains the first constructor
8. For large components (700+ lines): extract `STYLES` + token constants into `ui-foo.styles.ts`, keep component logic in `ui-foo.ts`

## FOUNDATION TOKEN WIRING

Components import token constants from `@maneki/foundation`:

```ts
import { BLUE_60, TEXT_PRIMARY, SP_2, TYPE_BODY_02 } from "@maneki/foundation";
```

Foundation exports token constants that components interpolate into CSS template literals. Typography constants include font family, size, line height and weight. Missing exports are compile errors.

## ICONS

Components use a **subsetted Material Symbols Outlined font** (~45 KB) shipped in `@maneki/foundation/assets/`. Apps call `registerIconFont()` once at startup; components access the font through `@font-face { src: local("Material Symbols Outlined") }` in Shadow DOM.

Icons are referenced by **Unicode codepoint constants** (not ligature text) imported from `@maneki/foundation`:

```ts
import { ICON_CLOSE, ICON_EXPAND_MORE, ICON_CHECK_CIRCLE } from "@maneki/foundation";

clearIcon.textContent = ICON_CLOSE; // "\uE5CD"
chevronIcon.textContent = ICON_EXPAND_MORE; // "\uE5CF"
```

Shadow DOM requires a local `@font-face` declaration to access the globally-loaded font:

```css
@font-face {
  font-family: "Material Symbols Outlined";
  font-style: normal;
  src: local("Material Symbols Outlined");
}
.material-symbols-outlined {
  font-family: "Material Symbols Outlined";
  font-variation-settings: "FILL" 0;
}
```

The exported icon constants and `ICON_CODEPOINTS` keys are defined in [foundation's icons module](../foundation/src/icons.ts) and re-exported from its index. Use that module as the inventory instead of maintaining a second list here.
Use the `ICON_CODEPOINTS` record for dynamic lookup: `ICON_CODEPOINTS["home"]`.
Status icons use filled variant: `font-variation-settings: 'FILL' 1`.
Chevron icon: `ICON_EXPAND_MORE` (not `ICON_ARROW_DROP_DOWN`). Clear button: `ICON_CANCEL` with filled variant.
Chevron and clear button use `semanticVar("icon", "secondary")` token.

To add a new icon, see the SOP in `packages/foundation/AGENTS.md`.

Components render icons with `<ui-icon>` or Material Symbols codepoints from `@maneki/foundation`.

## TYPE SAFETY

Components export union types for variant attributes:

```ts
export type ButtonAction = "primary" | "secondary" | "destructive" | "info" | "contrast";
export type ButtonEmphasis = "bold" | "subtle" | "minimal";
export type AlertStatus = "none" | "information" | "success" | "error" | "warning";
```

Property accessors use these types. Invalid values are compile errors.

## VISUAL PREVIEW

Component demos and Playwright regression coverage live in **`apps/catalog/`**. When adding a component, wire a catalog page and tests per `apps/catalog/AGENTS.md`.

## PANEL TRANSITIONS

Dropdown, menu, and select panels use smooth open/close animation:

- Default: `opacity: 0; visibility: hidden; transform: translateY(-4px); pointer-events: none;`
- Open: `opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto;`
- Transition: `opacity 0.15s ease, visibility 0.15s ease, transform 0.15s ease`
- Include `@media (prefers-reduced-motion: reduce)` fallback (instant transition)

## STYLES EXTRACTION

For components with 700+ lines, split into two files:

- `ui-foo.ts` — component class, DOM construction, event handling
- `ui-foo.styles.ts` — `STYLES` constant, token constants, shared maps (e.g., `STATUS_ICON_MAP`)

Style modules are the co-located `ui-*.styles.ts` files shown in the structure tree. Lit components can keep their `static styles` inline.

## CONVENTIONS

- **Component prefix:** `ui-*` for element names
- **Shadow DOM:** Always. No light DOM components.
- **Tests co-located:** `ui-button.ts` → `ui-button.test.ts` in same directory
- **`@maneki/foundation` is a production dependency.** Tokens are consumed via CSS custom property references (`var(--fd-*)`) and type-safe JS helpers (`colorVar`, `spaceVar`). Foundation code is bundled into the built output.
- **Multi-entry build.** Vite emits both a barrel (`dist/index.js`) and per-component files (`dist/components/ui-*.js`). Consumers can import everything or cherry-pick. Shared foundation code is deduped into `dist/shared/` chunks.
- **Deep imports via exports map.** `import "@maneki/ui-components/components/ui-badge.js"` imports only that component + its dependencies. Use for apps that need a subset (e.g., the blog app).
- **All components MUST use type-safe foundation tokens.** No hardcoded color hex values, spacing pixel values, or typography values. Use `colorVar()`, `spaceVar()`, `typeVar()`, `semanticVar()`, `elevationVar()` from `@maneki/foundation`. The only exceptions are: `#ffffff` (white, not in palette), `rgba()` overlays for hover/active/focus states, and shape constants like `2px`/`999px` border-radius that have no token equivalent.
- **Branch per component.** Every new component implementation MUST happen on a dedicated branch (e.g., `feat/ui-checkbox`). Do not implement directly on `main`.
- **Visual Figma verification required.** Before a component is considered done, visually compare the catalog (or local dev) against the Figma source using the Playwright/browser tool. Verify sizes, colors, spacing, and states match. No component ships without this step.
- **Reuse existing primitives.** When adding a new component, review existing components and catalog pages to check if they should consume the new component instead of duplicating markup.
- **No direct pushes to `main`.** All changes go through feature branches and PRs. Use `jj bookmark set <name> -r @` + `jj git push --bookmark <name>` then `gh pr create`.
- **Import token constants from `@maneki/foundation`** — no local `const X = semanticVar(...)` definitions. Use pre-computed constants like `TEXT_PRIMARY`, `SP_1`, etc.
- **Typography via `${TYPE_BODY_02}`** — emits font-family + font-size + line-height + font-weight in one interpolation via `typeBlock()` from foundation.
- **Custom icons:** `registerIcon()` / `registerIcons()` re-exported from ui-components. Allows registering custom SVG icons alongside Material Symbols.
- **Accessibility:** components carry proper roles, accessible names, keyboard navigation and visible focus; the catalog a11y suite (axe) checks every page, with known exceptions listed in `apps/catalog/e2e/a11y.spec.ts`.

## ANTI-PATTERNS

- **No hardcoded design values** — never use raw hex colors (`#186ade`), pixel spacing (`4px`, `16px`), or font sizes directly. Always use foundation token helpers (`colorVar()`, `spaceVar()`, `typeVar()`, etc.).
- **No `as any`, `@ts-ignore`, `@ts-expect-error`** — never suppress types
- **No light DOM components** — always Shadow DOM with `attachShadow({ mode: "open" })`
- **No CSS var name mismatches** — component override vars must match exactly between parent and child (e.g., `--ui-btn-radius`, not `--ui-button-radius`)
- **No duplicate consecutive CSS properties** — when replacing hardcoded values with tokens, always use range replace (`pos` + `end`) to cover multi-line blocks (e.g., width + height). Single-line replace leaves the original line intact, creating a duplicate that silently overrides the token. Enforced by `css-lint.test.ts`.
- **No inline SVG icons in new components** — use Material Symbols font instead (see ICONS section)
- **Read Figma semantic tokens carefully.** Figma uses domain-specific token names (e.g., `Form/input-border`, `State/Selected/Surface/selected-bold`) that map to foundation tokens. Always check the Figma design context for the exact token names and map them to the closest foundation equivalent:
  - `Form/input-border` → `semanticVar("form", "inputBorder")` (`#9FB1BD`) — form control border
  - `Form/input-background` → `FORM_INPUT_BG` / `semanticVar("form", "inputBackground")` — form control background. **Never use `SURFACE_PRIMARY` for form input backgrounds** — it's invisible in dark mode. Enforced by `form-bg-lint.test.ts`.
  - `Border/border-contrast` → `semanticVar("border", "contrast")` (`#1C2B36`)
  - `State/Hover/Border/border-moderate-hover` → `semanticVar("stateHover", "borderModerate")` (`#7A909E`) — hover border
  - `State/Selected/Surface/selected-bold` → `semanticVar("stateSelected", "surfaceBold")` (`#186ADE`) — checked/selected fill
  - `State/Focus/border-Focus` → `semanticVar("border", "focus")` (`#186ADE`)
  - `State/Disabled/border-disabled` → `semanticVar("stateDisabled", "border")` (`rgba(91,114,130,0.4)`) — outer ring in disabled state
  - `State/Disabled/minimal-disabled` → `semanticVar("stateDisabled", "minimal")` (`rgba(91,114,130,0.2)`) — inner fill/dot in disabled state
  - `State/Disabled/text-disabled` → `semanticVar("stateDisabled", "text")` (`rgba(91,114,130,0.5)`) — label text in disabled state
  - `Status/Surface/status-error-bold` → `semanticVar("statusSurface", "errorBold")` (`#D91F11`)
  - `Tag/tag-bold` → `semanticVar("tag", "bold")` (`#186ADE`) — tag bold background
  - `Tag/tag-subtle` → `semanticVar("tag", "subtle")` (`#D4E4FA`) — tag subtle background
  - `Tag/tag-minimal` → `semanticVar("tag", "minimal")` (`#FFFFFF`) — tag minimal background
  - `Tag/Text/tag-text-bold` → `semanticVar("tag", "textBold")` (`#FFFFFF`) — tag bold text
  - `Tag/Text/tag-text-subtle` → `semanticVar("tag", "textSubtle")` (`#0D4EA6`) — tag subtle text
  - `Tag/Text/tag-text-minimal` → `semanticVar("tag", "textMinimal")` (`#3E5463`) — tag minimal text
  - `Button/button-secondary` → `semanticVar("button", "secondary")` (`#DCE3E8`) — selectable/toggle tag background

## SOP: Using `<ui-icon>` in Components

When a component needs to render a Material Symbols icon internally:

1. **Import the icon codepoint** from `@maneki/foundation`:
   ```ts
   import { ICON_CLOSE, ICON_EXPAND_MORE } from "@maneki/foundation";
   ```
2. **Create `<ui-icon>` in `connectedCallback()`**, NOT in the constructor. Creating custom elements with attributes in the constructor violates the Web Components spec and throws `NotSupportedError` when the parent is parsed from HTML.
   ```ts
   connectedCallback() {
     const icon = document.createElement("ui-icon") as UIIcon;
     icon.setAttribute("name", "close");
     icon.setAttribute("size", "s");
     this.shadowRoot!.querySelector(".icon-slot")!.appendChild(icon);
   }
   ```
3. **Do NOT set a color on `<ui-icon>`** unless you need to override the parent's text color. `<ui-icon>` defaults to `currentColor`, which inherits semantic colors from wrapper elements (status icons, links, etc.).
4. **Set `--ui-icon-size` in CSS** for every size variant. Since `<ui-icon>` uses Shadow DOM, parent `font-size` does NOT control icon size. You must set the custom property explicitly:
   ```css
   :host([size="s"]) .icon-wrapper {
     --ui-icon-size: 16px;
   }
   :host([size="m"]) .icon-wrapper {
     --ui-icon-size: 20px;
   }
   :host([size="l"]) .icon-wrapper {
     --ui-icon-size: 24px;
   }
   ```
5. **Use `name` attribute** (not codepoint text) when creating `<ui-icon>` — it handles `ICON_CODEPOINTS` lookup and ligature fallback automatically.
6. **For rotation/animation** (e.g., accordion chevron), apply `transform` on the `<ui-icon>` element itself, not a wrapper. Ensure `transform-origin: center` for centered rotation.
7. **Verify visually** that icons inherit correct semantic colors in all states (enabled, hover, disabled, error, etc.).

### Common Pitfalls

- **Missing `}`** — when adding `--ui-icon-size` lines to size-variant CSS blocks, double-check that every block's closing brace is intact. A missing `}` silently breaks the entire stylesheet.
- **Missing icon in subset font** — if the icon shows literal text (e.g., "chevron_right"), the icon is not in the subset. Follow the "Adding a New Icon" SOP in `packages/foundation/AGENTS.md`.
- **Constructor `setAttribute`** — will crash at runtime when the element is created inside another component's Shadow DOM. Always defer to `connectedCallback()`.

## SOP: Updating Documentation After Changes

After merging a PR that adds/modifies components, icons, or tests, update these files:

1. **Test counts** — update in all locations where test counts appear:
   - `packages/ui-components/AGENTS.md` → COMMANDS section
   - `packages/ui-components/README.md` → Development section
   - `packages/foundation/AGENTS.md` → COMMANDS section (if foundation tests changed)
   - `packages/foundation/README.md` → Development section (if foundation tests changed)
   - `README.md` (root) — no test counts currently, but verify package descriptions
2. **Component count** — if a new component was added:
   - `README.md` (root) → Packages table ("N Web Components")
   - `packages/ui-components/README.md` → Components table
   - `packages/ui-components/AGENTS.md` → OVERVIEW component list
3. **Icon constants** — update foundation's icon module and subset font per its SOP; this document links to the authoritative inventory.
4. **AGENTS.md structure trees** — if new files were added (components, styles)

### Quick Checklist

```
[ ] Test counts match `npx vitest --run` output
[ ] Component count matches actual registered elements
[ ] Icon inventory link points to foundation's `ICON_CODEPOINTS` module
[ ] AGENTS.md file trees reflect actual directory structure
[ ] No duplicate lines or stale references
```

## COMMANDS

```bash
moon run ui-components:test            # vitest --run (3721 tests)
moon run ui-components:build           # vite build + tsc --emitDeclarationOnly
moon run catalog:dev                   # visual catalog (apps/catalog)
```
