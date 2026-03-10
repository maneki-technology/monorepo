# packages/ui-components — Design System Components

## OVERVIEW
Web Component library for the Maneki design system. Shadow DOM, CSS custom properties, TypeScript, Storybook 10. Currently ships:

- `<ui-button>` — full Figma spec: 5 actions, 3 emphases, 4 sizes, 2 shapes, 4 icon modes, 3 statuses
- `<ui-button-group>` — segmented bar that wraps `<ui-button>` elements
- `<ui-accordion-item>` — expandable panel: 3 sizes, 2 emphases, 4 statuses, smooth CSS transition
- `<ui-accordion-group>` — wrapper with size/emphasis propagation + exclusive mode
- `<ui-alert>` — dismissable alert/toast: 3 sizes, 2 emphases, 5 statuses, footer slot
- `<ui-avatar>` — avatar component: 5 sizes, 3 types (text/icon/image), 2 emphases, 2 shapes, 5 statuses, 14 colors
- `<ui-breadcrumb-item>` — breadcrumb link item: 3 sizes, 7 states (enabled/hover/focus/active/visited/disabled/current), chevron separator
- `<ui-breadcrumb-group>` — breadcrumb nav wrapper with size propagation
- `<ui-card>` — slot-based card container: 3 sizes (s/m/l), 4 elevations (00/01/02/04), bordered variant, image/default/footer slots
- `<ui-checkbox-item>` — checkbox component: 3 sizes (s/m/l), 3 check states (unchecked/checked/indeterminate), 3 label positions (none/right/left), 5 states (enabled/hover/focus/disabled/error)
- `<ui-checkbox-group>` — checkbox group wrapper: 3 sizes (s/m/l), 2 orientations (vertical/horizontal), size propagation to children
- `<ui-radio-item>` — radio button component: 3 sizes (s/m/l), 2 check states (unchecked/checked), 3 label positions (none/right/left), 5 states (enabled/hover/focus/disabled/error), value attribute
- `<ui-radio-group>` — radio group wrapper: 3 sizes (s/m/l), 2 orientations (vertical/horizontal), size propagation to children, mutual exclusion (single selection), roving tabindex
- `<ui-dropdown>` — dropdown button with floating menu: 4 sizes (s/m/l/xl), 5 actions, 3 emphases, 2 shapes, opt-in `selectable` attribute for single/multi-select, composes `<ui-button>` as trigger
- `<ui-dropdown-item>` — menu item: 3 sizes (s/m/l), 4 leading elements (icon/checkbox/radio/avatar), secondary label, description, submenu arrow, 6 states (enabled/hover/active/focus/selected/disabled), select event, checkmark, value attribute
- `<ui-dropdown-heading>` — section heading: 3 sizes (s/m/l), uppercase, non-interactive
- `<ui-dropdown-separator>` — horizontal divider line
- `<ui-modal>` — modal dialog with backdrop, header (title+subtitle+close), scrollable body, footer button slots, 3 sizes, 2 layouts (auto/fluid), dismiss behavior
- `<ui-badge>` — label/tag with 4 sizes, 3 emphases, 2 shapes, 13 colors, 5 statuses, uppercase text
- `<ui-dropdown-split>` — split button with action (left) + chevron trigger (right) + floating menu: 4 sizes (s/m/l/xl), 5 actions, 3 emphases, 2 shapes, 4 icon modes, opt-in `selectable` for single/multi-select, independent hover/active/focus per button half, full-height divider (hidden for minimal/contrast)
- `<ui-menu>` — standalone floating menu panel: 3 sizes (s/m/l), open/close animation, outside-click + Escape dismiss, opt-in `selectable` for single/multi-select, size propagation to children, composes `<ui-dropdown-item>` / `<ui-dropdown-heading>` / `<ui-dropdown-separator>`
- `<ui-side-panel-menu>` — collapsible sidebar navigation: expanded/collapsed states, mobile responsive (auto-collapse), flyout submenu in collapsed mode, overlay mode, selection management with parent highlighting
- `<ui-side-panel-menu-item>` — sidebar menu item: 3 levels (primary/secondary/tertiary), expandable parent with inline children, leading icon slot, selected/disabled states, keyboard navigation
- `<ui-image>` — image container: 5 aspect ratios (16:9/3:2/1:1/3:1/21:9), 4 object-fit modes (cover/contain/fill/none), placeholder background, fallback slot

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
│   │   ├── ui-button.ts
│   │   ├── ui-button-group.ts
│   │   ├── ui-accordion-item.ts
│   │   ├── ui-accordion-group.ts
│   │   ├── ui-alert.ts
│   │   ├── ui-avatar.ts
│   │   ├── ui-card.ts
│   │   ├── ui-image.ts
│   │   ├── ui-breadcrumb-item.ts
│   │   ├── ui-breadcrumb-group.ts
│   │   ├── ui-checkbox-item.ts
│   │   ├── ui-checkbox-group.ts
│   │   ├── ui-radio-item.ts
│   │   ├── ui-radio-group.ts
│   │   ├── ui-dropdown.ts
│   │   ├── ui-dropdown-item.ts
│   │   ├── ui-dropdown-heading.ts
│   │   ├── ui-dropdown-separator.ts
│   │   ├── ui-modal.ts
│   │   ├── ui-badge.ts
│   │   ├── ui-dropdown-split.ts
│   │   ├── ui-menu.ts
│   │   ├── ui-side-panel-menu.ts
│   │   ├── ui-side-panel-menu-item.ts
│   │   └── *.test.ts        # Co-located tests
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

## FOUNDATION TOKEN WIRING
Components import token helpers from `@maneki/foundation`:

```ts
import { colorVar, semanticVar, spaceVar } from '@maneki/foundation';

const BLUE_60 = colorVar('blue', 60);
const TEXT_PRIMARY = semanticVar('text', 'primary');
const SP_2 = spaceVar(2);
```

Token constants are defined at module level and interpolated into the CSS template literal. Invalid token references are compile errors.

## SHARED ICONS
SVG icons are centralized in `src/assets/icons.ts`:

```ts
import { ICON_CLOSE, ICON_CHEVRON } from '../assets/icons.js';
```

All icons use `currentColor` for stroke/fill so they inherit the parent's `color`. Available: `ICON_CLOSE`, `ICON_CHEVRON`, `ICON_CHEVRON_RIGHT`, `ICON_ERROR`, `ICON_SUCCESS`, `ICON_WARNING`, `ICON_LOADING`, `ICON_USER`.

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
- **No inline SVG duplication** — add new icons to `src/assets/icons.ts` and import
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
## COMMANDS
```bash
moon run ui-components:storybook       # Dev server on port 6006
moon run ui-components:storybook-build  # Static build
moon run ui-components:test            # vitest --run (834 tests)
moon run ui-components:build           # vite build + tsc --emitDeclarationOnly
moon run ui-components:chromatic       # Publish to Chromatic
```
