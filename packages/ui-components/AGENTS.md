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
│   │   ├── ui-breadcrumb-item.ts
│   │   ├── ui-breadcrumb-group.ts
│   │   ├── ui-checkbox-item.ts
│   │   ├── ui-checkbox-group.ts
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
6. CSS uses nested var pattern: `var(--ui-btn-bg, ${BLUE_60})` — consumer override → foundation token
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
## COMMANDS
```bash
moon run ui-components:storybook       # Dev server on port 6006
moon run ui-components:storybook-build  # Static build
moon run ui-components:test            # vitest --run (230 tests)
moon run ui-components:build           # vite build + tsc --emitDeclarationOnly
moon run ui-components:chromatic       # Publish to Chromatic
```
