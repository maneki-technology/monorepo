# packages/ui-components — Design System Components

## OVERVIEW
Web Component library for the Maneki design system. Shadow DOM, CSS custom properties, TypeScript, Storybook 10. Currently ships two components:

- `<ui-button>` — full Figma spec: 5 actions, 3 emphases, 4 sizes, 2 shapes, 4 icon modes, 3 statuses
- `<ui-button-group>` — segmented bar that wraps `<ui-button>` elements

## STRUCTURE
```
ui-components/
├── .storybook/
│   ├── main.ts              # @storybook/web-components-vite
│   └── preview.ts           # imports injectAllTokens() from @maneki/foundation
├── src/
│   ├── index.ts             # Barrel export + custom element registration
│   ├── components/
│   │   ├── ui-button.ts          # <ui-button> Web Component
│   │   ├── ui-button.test.ts     # 27 tests
│   │   ├── ui-button-group.ts    # <ui-button-group> Web Component
│   │   └── ui-button-group.test.ts # 12 tests
│   └── stories/
│       ├── ui-button.stories.ts       # 9 stories (CSF3 + lit html)
│       └── ui-button-group.stories.ts # 4 stories
└── storybook-static/        # Built Storybook output (gitignore candidate)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add new component | `src/components/` | Create `ui-foo.ts` + `ui-foo.test.ts` |
| Add stories | `src/stories/` | CSF3 format with `@storybook/web-components` |
| Register element | `src/index.ts` | `customElements.define()` + re-export |
| Storybook config | `.storybook/main.ts` | Framework: `@storybook/web-components-vite` |

## COMPONENT PATTERN
Follow `ui-button.ts` as the reference implementation:
1. Class extends `HTMLElement`
2. `attachShadow({ mode: "open" })` in constructor
3. Observed attributes → `attributeChangedCallback` → re-render
4. Private `render()` method updates `shadowRoot.innerHTML`
5. CSS uses nested var pattern: `var(--ui-btn-bg, var(--fd-color-blue-60))` — consumer override at the outer var, foundation token as the fallback
6. `customElements.define("ui-*", Class)` at module level

## FOUNDATION TOKEN WIRING
`ui-button.ts` imports `colorVar` and `spaceVar` helpers from `@maneki/foundation`:

```ts
import { colorVar, spaceVar } from '@maneki/foundation';

const BLUE_60 = colorVar('blue', 60);
const SPACE_4 = spaceVar(4);
```

Token constants are defined at module level and interpolated into the CSS template literal. Invalid token references (wrong color name, out-of-range scale value) are compile errors, not runtime surprises.

## TYPE SAFETY
Exported union types cover every attribute:

```ts
export type ButtonAction   = 'primary' | 'secondary' | 'destructive' | 'info' | 'contrast';
export type ButtonEmphasis = 'bold' | 'subtle' | 'minimal';
export type ButtonSize     = 's' | 'm' | 'l' | 'xl';
export type ButtonShape    = 'basic' | 'rounded';
export type ButtonIcon     = 'text-only' | 'leading-icon' | 'trailing-icon' | 'icon-only';
export type ButtonStatus   = 'none' | 'error' | 'loading' | 'success';
```

Property accessors on `UiButton` use these types. `ui-button-group.ts` imports and reuses the same types for its own matching attributes.

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

## ANTI-PATTERNS
- **No hardcoded design values** — never use raw hex colors (`#186ade`), pixel spacing (`4px`, `16px`), or font sizes directly. Always use foundation token helpers (`colorVar()`, `spaceVar()`, `typeVar()`, etc.).
- **No `as any`, `@ts-ignore`, `@ts-expect-error`** — never suppress types
- **No light DOM components** — always Shadow DOM with `attachShadow({ mode: "open" })`
- **No CSS var name mismatches** — component override vars must match exactly between parent and child (e.g., `--ui-btn-radius`, not `--ui-button-radius`)

## COMMANDS
```bash
moon run ui-components:storybook       # Dev server on port 6006
moon run ui-components:storybook-build  # Static build
moon run ui-components:test            # vitest --run (39 tests)
moon run ui-components:build           # vite build + tsc --emitDeclarationOnly
```
