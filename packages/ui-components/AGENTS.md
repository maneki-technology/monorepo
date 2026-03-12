# packages/ui-components — Design System Components

## OVERVIEW
Web Component library for the Maneki design system. Shadow DOM, CSS custom properties, TypeScript, Storybook 10. Currently ships:

**Primitives:**
- `<ui-badge>` — label/tag with 4 sizes, 3 emphases, 2 shapes, 13 colors, 5 statuses, uppercase text
- `<ui-image>` — image container: 5 aspect ratios (16:9/3:2/1:1/3:1/21:9), 4 object-fit modes (cover/contain/fill/none), placeholder background, fallback slot
- `<ui-button>` — full Figma spec: 5 actions, 3 emphases, 4 sizes, 2 shapes, 4 icon modes, 3 statuses
- `<ui-avatar>` — avatar component: 5 sizes, 3 types (text/icon/image), 2 emphases, 2 shapes, 5 statuses, 14 colors
- `<ui-alert>` — dismissable alert/toast: 3 sizes, 2 emphases, 5 statuses, footer slot
- `<ui-label>` — form field label: 3 sizes (s/m/l), 2 emphases (bold/subtle), disabled state, required indicator
- `<ui-link>` — anchor/span link: 3 sizes (s/m/l), 7 states (enabled/hover/focus/active/visited/disabled/current), standalone/inline modes, external icon, keyboard accessible span mode

**Form Controls:**
- `<ui-checkbox-item>` — checkbox component: 3 sizes (s/m/l), 3 check states (unchecked/checked/indeterminate), 3 label positions (none/right/left), 5 states (enabled/hover/focus/disabled/error)
- `<ui-checkbox-group>` — checkbox group wrapper: 3 sizes (s/m/l), 2 orientations (vertical/horizontal), size propagation to children
- `<ui-radio-item>` — radio button component: 3 sizes (s/m/l), 2 check states (unchecked/checked), 3 label positions (none/right/left), 5 states (enabled/hover/focus/disabled/error), value attribute
- `<ui-radio-group>` — radio group wrapper: 3 sizes (s/m/l), 2 orientations (vertical/horizontal), size propagation to children, mutual exclusion (single selection), roving tabindex
- `<ui-input>` — text input: 3 sizes (s/m/l), 4 types (text/numeric/clearable/password), 7 states (enabled/hover/focus/active/filled/disabled/readonly), 5 statuses (none/warning/error/success/loading), label, secondary label, supportive text, leading/trailing slots
- `<ui-input-group>` — input group wrapper: 3 sizes (s/m/l), prefix/suffix slots with separators, composes `<ui-input>`
- `<ui-file-upload>` — file upload input: 3 sizes (s/m/l), Browse button, accept/multiple attributes, disabled state
- `<ui-select>` — select dropdown: 3 sizes (s/m/l), 7 states, 5 statuses, single/multi-select with tag pills, WAI-ARIA combobox pattern, leading slot, clearable, label/supportive text
**Containers:**
- `<ui-card>` — slot-based card container: 3 sizes (s/m/l), 4 elevations (00/01/02/04), bordered variant, image/default/footer slots
- `<ui-button-group>` — segmented bar that wraps `<ui-button>` elements

**Navigation:**
- `<ui-breadcrumb-item>` — breadcrumb link item: 3 sizes, 7 states (enabled/hover/focus/active/visited/disabled/current), chevron separator
- `<ui-breadcrumb-group>` — breadcrumb nav wrapper with size propagation
- `<ui-side-panel-menu>` — collapsible sidebar navigation: expanded/collapsed states, mobile responsive (auto-collapse), flyout submenu in collapsed mode, overlay mode, selection management with parent highlighting
- `<ui-side-panel-menu-item>` — sidebar menu item: 3 levels (primary/secondary/tertiary), expandable parent with inline children, leading icon slot, selected/disabled states, keyboard navigation

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
- `<ui-modal>` — modal dialog with backdrop, header (title+subtitle+close), scrollable body, footer button slots, 3 sizes, 2 layouts (auto/fluid), dismiss behavior

**Tabs:**
- `<ui-tab-item>` — tab item: 2 sizes (s/m), 3 states (enabled/selected/disabled), 2 orientations (horizontal/vertical), leading/trailing icon slots, sub-menu chevron, smooth transition
- `<ui-tab-group>` — tab group wrapper: size/orientation propagation, single selection, roving tabindex, arrow key navigation

**Icons:**
- `<ui-icon>` — Material Symbols icon: 5 sizes (xxs/xs/s/m/l), 10 states (enabled/hover/active/focus/disabled + inverse variants), filled variant, ICON_CODEPOINTS lookup with ligature fallback, accessible label

## STRUCTURE
```
ui-components/
├── .storybook/
│   ├── main.ts              # @storybook/web-components-vite
│   └── preview.ts           # imports injectAllTokens() from @maneki/foundation
├── src/
│   ├── index.ts             # Barrel export + custom element registration
│   ├── assets/
│   │   └── icons.ts         # Shared SVG icon constants (ICON_CLOSE, ICON_CHEVRON, ICON_USER, etc.)
│   ├── components/
│   │   ├── ui-badge.ts
│   │   ├── ui-image.ts
│   │   ├── ui-button.ts
│   │   ├── ui-button-group.ts
│   │   ├── ui-avatar.ts
│   │   ├── ui-alert.ts
│   │   ├── ui-label.ts
│   │   ├── ui-link.ts
│   │   ├── ui-checkbox-item.ts
│   │   ├── ui-checkbox-group.ts
│   │   ├── ui-radio-item.ts
│   │   ├── ui-radio-group.ts
│   │   ├── ui-input.ts          + ui-input.styles.ts
│   │   ├── ui-input-group.ts
│   │   ├── ui-file-upload.ts
│   │   ├── ui-select.ts         + ui-select.styles.ts
│   │   ├── ui-card.ts
│   │   ├── ui-breadcrumb-item.ts
│   │   ├── ui-breadcrumb-group.ts
│   │   ├── ui-side-panel-menu.ts + ui-side-panel-menu.styles.ts
│   │   ├── ui-side-panel-menu-item.ts
│   │   ├── ui-accordion-item.ts
│   │   ├── ui-accordion-group.ts
│   │   ├── ui-dropdown.ts
│   │   ├── ui-dropdown-item.ts   + ui-dropdown-item.styles.ts
│   │   ├── ui-dropdown-heading.ts
│   │   ├── ui-dropdown-separator.ts
│   │   ├── ui-dropdown-split.ts  + ui-dropdown-split.styles.ts
│   │   ├── ui-menu.ts
│   │   ├── ui-modal.ts
│   │   ├── ui-tab-item.ts
│   │   ├── ui-tab-group.ts
│   │   ├── ui-icon.ts
│   │   └── *.test.ts            # Co-located tests
│   └── stories/
│       └── *.stories.ts     # CSF3 + lit html
└── storybook-static/        # Built Storybook output
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add new component | `src/components/` | Create `ui-foo.ts` + `ui-foo.test.ts` |
| Add stories | `src/stories/` | CSF3 format with `@storybook/web-components` |
| Register element | `src/index.ts` | `customElements.define()` + re-export |
| Add shared icon | `src/assets/icons.ts` | SVG string constant with `currentColor` |
| Storybook config | `.storybook/main.ts` | Framework: `@storybook/web-components-vite` |

## COMPONENT PATTERN
Follow `ui-button.ts` or `ui-alert.ts` as reference implementations:
1. Class extends `HTMLElement`
2. `attachShadow({ mode: "open" })` in constructor
3. DOM built imperatively with `document.createElement()` (not innerHTML)
4. Observed attributes → `attributeChangedCallback`
5. CSS in `STYLES` template literal with token constants at module level
6. CSS uses nested var pattern: `var(--ui-btn-bg, ${BLUE_60})` / `var(--ui-badge-bg, ${GRAY_60})` — consumer override → foundation token
7. `customElements.define("ui-*", Class)` at module level
8. For large components (700+ lines): extract `STYLES` + token constants into `ui-foo.styles.ts`, keep component logic in `ui-foo.ts`

## FOUNDATION TOKEN WIRING
Components import token helpers from `@maneki/foundation`:

```ts
import { colorVar, semanticVar, spaceVar } from '@maneki/foundation';

const BLUE_60 = colorVar('blue', 60);
const TEXT_PRIMARY = semanticVar('text', 'primary');
const SP_2 = spaceVar(2);
```

Token constants are defined at module level and interpolated into the CSS template literal. Invalid token references are compile errors.

## ICONS
Components use a **subsetted Material Symbols Outlined font** (~24 KB) shipped in `@maneki/foundation/assets/`. The font is registered globally via `registerIconFont()` in Storybook preview; components access it through `@font-face { src: local("Material Symbols Outlined") }` in Shadow DOM.

Icons are referenced by **Unicode codepoint constants** (not ligature text) imported from `@maneki/foundation`:
```ts
import { ICON_CLOSE, ICON_EXPAND_MORE, ICON_CHECK_CIRCLE } from "@maneki/foundation";

clearIcon.textContent = ICON_CLOSE;       // "\uE5CD"
chevronIcon.textContent = ICON_EXPAND_MORE; // "\uE5CF"
```

Shadow DOM requires a local `@font-face` declaration to access the globally-loaded font:
```css
@font-face { font-family: "Material Symbols Outlined"; font-style: normal; src: local("Material Symbols Outlined"); }
.material-symbols-outlined { font-family: "Material Symbols Outlined"; font-variation-settings: "FILL" 0; }
```

Available icon constants: `ICON_WARNING`, `ICON_ERROR`, `ICON_CHECK_CIRCLE`, `ICON_PROGRESS_ACTIVITY`, `ICON_CLOSE`, `ICON_CANCEL`, `ICON_EXPAND_MORE`, `ICON_EXPAND_LESS`, `ICON_VISIBILITY`, `ICON_VISIBILITY_OFF`, `ICON_ARROW_DROP_UP`, `ICON_ARROW_DROP_DOWN`, `ICON_INFO`, `ICON_NOTIFICATIONS`, `ICON_SEARCH`, `ICON_ATTACH_MONEY`, `ICON_MAIL`, `ICON_ACCOUNT_CIRCLE`, `ICON_ADD_CIRCLE`, `ICON_SHARE`, `ICON_DOWNLOAD`, `ICON_UPLOAD`, `ICON_MORE_VERT`, `ICON_HOME`, `ICON_PERSON`, `ICON_BAR_CHART`, `ICON_SETTINGS`, `ICON_GROUP`, `ICON_CHEVRON_RIGHT`, `ICON_CHEVRON_LEFT`.
For stories, use `ICON_CODEPOINTS` record for dynamic lookup: `ICON_CODEPOINTS["home"]`.
Status icons use filled variant: `font-variation-settings: 'FILL' 1`.
Chevron icon: `ICON_EXPAND_MORE` (not `ICON_ARROW_DROP_DOWN`). Clear button: `ICON_CANCEL` with filled variant.
Chevron and clear button use `semanticVar("icon", "secondary")` token.

To add a new icon, see the SOP in `packages/foundation/AGENTS.md`.

Legacy SVG icons in `src/assets/icons.ts` are deprecated. Only `ICON_CHECK` remains (used by `ui-checkbox-item`). All other components use `<ui-icon>` or direct Material Symbols codepoints.

## TYPE SAFETY
Exported union types cover every attribute:

```ts
export type ButtonAction   = 'primary' | 'secondary' | 'destructive' | 'info' | 'contrast';
export type ButtonEmphasis = 'bold' | 'subtle' | 'minimal';
export type AlertStatus    = 'none' | 'information' | 'success' | 'error' | 'warning';
```

Property accessors use these types. Invalid values are compile errors.

## STORY PATTERN
- CSF3 format (export const Story = { args: {...} })
- Use `@storybook/web-components` types
- Render with lit `html` tagged template
- One story file per component in `src/stories/`

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

Currently extracted: ui-input, ui-select, ui-dropdown-item, ui-dropdown-split, ui-side-panel-menu.
## CONVENTIONS
- **Component prefix:** `ui-*` for element names
- **Shadow DOM:** Always. No light DOM components.
- **Tests co-located:** `ui-button.ts` → `ui-button.test.ts` in same directory
- **Storybook 10:** Consolidated — no separate `@storybook/addon-essentials` or `@storybook/blocks` needed
- **`@maneki/foundation` is a production dependency.** Tokens are consumed via CSS custom property references (`var(--fd-*)`) and type-safe JS helpers (`colorVar`, `spaceVar`). Foundation code is bundled into the built output.
- **All components MUST use type-safe foundation tokens.** No hardcoded color hex values, spacing pixel values, or typography values. Use `colorVar()`, `spaceVar()`, `typeVar()`, `semanticVar()`, `elevationVar()` from `@maneki/foundation`. The only exceptions are: `#ffffff` (white, not in palette), `rgba()` overlays for hover/active/focus states, and shape constants like `2px`/`999px` border-radius that have no token equivalent.
- **Branch per component.** Every new component implementation MUST happen on a dedicated branch (e.g., `feat/ui-checkbox`). Do not implement directly on `main`.
- **Visual Figma verification required.** Before a component is considered done, visually compare the Storybook rendering against the Figma source using the Playwright/browser tool. Verify sizes, colors, spacing, and states match. No component ships without this step.
- **Reuse existing primitives.** When adding a new component, review existing components and stories to check if they should consume the new component instead of duplicating markup (e.g., stories using inline `<button>` elements should use `<ui-button>` once it exists). Applies to both component implementations and Storybook stories.
- **No direct pushes to `main`.** All changes go through feature branches and PRs. Use `jj bookmark set <name> -r @` + `jj git push --bookmark <name>` then `gh pr create`.

## ANTI-PATTERNS
- **No hardcoded design values** — never use raw hex colors (`#186ade`), pixel spacing (`4px`, `16px`), or font sizes directly. Always use foundation token helpers (`colorVar()`, `spaceVar()`, `typeVar()`, etc.).
- **No `as any`, `@ts-ignore`, `@ts-expect-error`** — never suppress types
- **No light DOM components** — always Shadow DOM with `attachShadow({ mode: "open" })`
- **No CSS var name mismatches** — component override vars must match exactly between parent and child (e.g., `--ui-btn-radius`, not `--ui-button-radius`)
- **No inline SVG icons in new components** — use Material Symbols font instead (see ICONS section)
- **Read Figma semantic tokens carefully.** Figma uses domain-specific token names (e.g., `Form/input-border`, `State/Selected/Surface/selected-bold`) that map to foundation tokens. Always check the Figma design context for the exact token names and map them to the closest foundation equivalent:
  - `Form/input-border` → `semanticVar("form", "inputBorder")` (`#9FB1BD`) — form control border
  - `Form/input-background` → `#ffffff` (white, no token needed)
  - `Border/border-contrast` → `semanticVar("border", "contrast")` (`#1C2B36`)
  - `State/Hover/Border/border-moderate-hover` → `semanticVar("stateHover", "borderModerate")` (`#7A909E`) — hover border
  - `State/Selected/Surface/selected-bold` → `semanticVar("stateSelected", "surfaceBold")` (`#186ADE`) — checked/selected fill
  - `State/Focus/border-Focus` → `semanticVar("border", "focus")` (`#186ADE`)
  - `State/Disabled/border-disabled` → `semanticVar("stateDisabled", "border")` (`rgba(91,114,130,0.4)`) — outer ring in disabled state
  - `State/Disabled/minimal-disabled` → `semanticVar("stateDisabled", "minimal")` (`rgba(91,114,130,0.2)`) — inner fill/dot in disabled state
  - `State/Disabled/text-disabled` → `semanticVar("stateDisabled", "text")` (`rgba(91,114,130,0.5)`) — label text in disabled state
  - `Status/Surface/status-error-bold` → `semanticVar("statusSurface", "errorBold")` (`#D91F11`)
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
   :host([size="s"]) .icon-wrapper { --ui-icon-size: 16px; }
   :host([size="m"]) .icon-wrapper { --ui-icon-size: 20px; }
   :host([size="l"]) .icon-wrapper { --ui-icon-size: 24px; }
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
   - `packages/ui-components/README.md` → Components table + story count
   - `packages/ui-components/AGENTS.md` → OVERVIEW component list
3. **Icon constants** — if new icons were added to foundation:
   - `packages/ui-components/AGENTS.md` → ICONS section → "Available icon constants" list
   - `packages/foundation/AGENTS.md` — no icon list (covered by SOP)
4. **AGENTS.md structure trees** — if new files were added (components, styles, stories)
5. **Storybook config** — if a new package was added to root `.storybook/main.ts`

### Quick Checklist
```
[ ] Test counts match `npx vitest --run` output
[ ] Component count matches actual registered elements
[ ] Icon constants list matches `ICON_CODEPOINTS` keys in foundation
[ ] AGENTS.md file trees reflect actual directory structure
[ ] No duplicate lines or stale references
```

## COMMANDS
```bash
moon run ui-components:storybook       # Dev server on port 6006
moon run ui-components:storybook-build  # Static build
moon run ui-components:test            # vitest --run (1314 tests)
moon run ui-components:build           # vite build + tsc --emitDeclarationOnly
moon run ui-components:chromatic       # Publish to Chromatic
```
