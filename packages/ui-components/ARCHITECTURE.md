# UI Components Architecture

*Snapshot: April 2026*

## Overview

`@maneki/ui-components` is the largest package in the monorepo. It ships 78 Web Components covering the full Figma "Foundation UI Kit" spec: primitives, form controls, navigation, overlays, data display, calendar, datetime picker, and more. Shadow DOM encapsulation throughout. CSS custom properties for theming. TypeScript types for every attribute. 3564 unit tests.

Dependencies: `@maneki/foundation` (production), `lit` (production, new components only).

## Component Inventory

| Category | Components |
|---|---|
| Primitives | `<ui-badge>`, `<ui-image>`, `<ui-button>`, `<ui-avatar>`, `<ui-alert>`, `<ui-label>`, `<ui-link>`, `<ui-tag>` |
| Form Controls | `<ui-checkbox-item>`, `<ui-checkbox-group>`, `<ui-radio-item>`, `<ui-radio-group>`, `<ui-input>`, `<ui-input-group>`, `<ui-file-upload>`, `<ui-dropzone>`, `<ui-select>`, `<ui-textarea>` |
| Containers | `<ui-card>`, `<ui-button-group>`, `<ui-toolbar>`, `<ui-toolbar-separator>` |
| Navigation | `<ui-breadcrumb-item>`, `<ui-breadcrumb-group>`, `<ui-side-panel-menu>`, `<ui-side-panel-menu-item>`, `<ui-side-panel-menu-section>` |
| Disclosure | `<ui-accordion-item>`, `<ui-accordion-group>` |
| Menus & Dropdowns | `<ui-dropdown>`, `<ui-dropdown-item>`, `<ui-dropdown-heading>`, `<ui-dropdown-separator>`, `<ui-dropdown-split>`, `<ui-menu>` |
| Overlays | `<ui-modal>`, `<ui-popover>`, `<ui-tooltip>` |
| Tabs | `<ui-tab-item>`, `<ui-tab-group>` |
| Icons | `<ui-icon>` |
| Data Display | `<ui-table>`, `<ui-table-row>`, `<ui-table-cell>`, `<ui-metric>`, `<ui-metric-group>` |
| Carousel | `<ui-carousel>`, `<ui-carousel-item>` |
| Calendar | `<ui-calendar>`, `<ui-calendar-panel>`, `<ui-calendar-quicklinks>`, `<ui-calendar-time>` |
| Datetime Picker | `<ui-datetime-picker-input>`, `<ui-datetime-picker>`, `<ui-clock>` |
| List | `<ui-list-item>`, `<ui-list-header>`, `<ui-list-group>` |
| Steps | `<ui-step-item>`, `<ui-step-group>` |
| Tree | `<ui-tree-item>`, `<ui-tree-group>` |
| Search | `<ui-search>`, `<ui-queryfield>`, `<ui-queryfield-tag>` |
| Progress | `<ui-progress-bar>`, `<ui-progress-circle>` |
| Misc | `<ui-pagination>`, `<ui-person-item>`, `<ui-person-group>`, `<ui-scrollbar>`, `<ui-separator>`, `<ui-side-panel>`, `<ui-skeleton>`, `<ui-slider>`, `<ui-switch>`, `<ui-pull-to-refresh>`, `<ui-wizard>` |

Full API for each component is in `packages/ui-components/AGENTS.md`.

## Two Component Paradigms

The package contains two generations of components, coexisting without obligation to migrate.

### Vanilla HTMLElement (existing components)

The original pattern. Used by `<ui-button>`, `<ui-alert>`, most form controls, and the majority of the catalog.

```ts
class UiButton extends HTMLElement {
  static observedAttributes = ["action", "emphasis", "size"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // DOM built imperatively with document.createElement()
  }

  attributeChangedCallback(name: string, _old: string, value: string) {
    // update shadow DOM in response to attribute changes
  }
}

customElements.define("ui-button", UiButton);
```

Key points:
- `attachShadow({ mode: "open" })` in the constructor
- DOM built with `document.createElement()`, not `innerHTML`
- CSS lives in a `STYLES` template literal at module level
- `customElements.define()` at module level (side-effectful import)

### Lit / LitElement (new components, ADR-028)

Required for all new components. Used by `<ui-side-panel-menu-section>`, `<ui-switch>`, `<ui-skeleton>`, and others added after ADR-028.

```ts
@customElement("ui-foo")
class UiFoo extends LitElement {
  @property() size: "s" | "m" | "l" = "m";

  static styles = css`
    :host { display: block; }
  `;

  render() {
    return html`<div class="foo"><slot></slot></div>`;
  }
}
```

Key points:
- `@customElement()` decorator handles registration
- `@property()` decorators replace `observedAttributes` + `attributeChangedCallback`
- `static styles` replaces the `STYLES` constant
- `render()` returns a `html` template literal
- Foundation tokens wrapped in `unsafeCSS()` inside `css` tagged literals

The rationale is in [ADR-028](../adr/028-lit-in-ui-components.md). The short version: Lit eliminates the boilerplate of manual DOM diffing and attribute observation while keeping Shadow DOM encapsulation intact.

## Shadow DOM Pattern

Every component uses `attachShadow({ mode: "open" })`. No light DOM components exist.

### CSS Custom Properties

The theming API is CSS custom properties with the `--ui-*` prefix. Each component exposes override vars that fall back to foundation tokens:

```css
/* nested var pattern: consumer override → foundation token */
:host {
  background: var(--ui-btn-bg, var(--fd-color-blue-60));
  color: var(--ui-btn-color, var(--fd-semantic-text-primary));
}
```

This gives consumers a stable override surface without breaking the token chain. The foundation token is always the last fallback.

### Font Access in Shadow DOM

The Material Symbols font is loaded globally by the app (`registerIconFont()`), but Shadow DOM can't see global `@font-face` rules. Every component that uses icons declares a local `@font-face` pointing to `local("Material Symbols Outlined")`:

```css
@font-face {
  font-family: "Material Symbols Outlined";
  font-style: normal;
  src: local("Material Symbols Outlined");
}
```

This re-uses the already-loaded font without re-downloading it.

## Foundation Token Wiring

Components import token helpers from `@maneki/foundation` and define constants at module level:

```ts
import { colorVar, semanticVar, spaceVar, typeBlock } from "@maneki/foundation";
import { TEXT_PRIMARY, SP_2, TYPE_BODY_02, BLUE_60 } from "@maneki/foundation";
```

Pre-computed constants (`TEXT_PRIMARY`, `SP_1`, etc.) are preferred over calling helpers inline. They're defined once in foundation and imported directly, avoiding repeated function calls at module evaluation time.

Typography uses `typeBlock()` via the `TYPE_*` constants, which emit `font-family + font-size + line-height + font-weight` in a single interpolation:

```css
:host {
  ${TYPE_BODY_02}  /* expands to all four font properties */
}
```

The only values not covered by tokens: `#ffffff` (white, absent from the palette), `rgba()` overlays for hover/active/focus states, and shape constants like `2px`/`999px` border-radius.

## Icon System

Icons use a subsetted Material Symbols Outlined font (~45 KB) shipped in `@maneki/foundation/assets/`. The subset contains only the icons actually used by the design system.

Icons are referenced by Unicode codepoint constants, not ligature strings:

```ts
import { ICON_CLOSE, ICON_EXPAND_MORE } from "@maneki/foundation";

clearIcon.textContent = ICON_CLOSE;        // "\uE5CD"
chevronIcon.textContent = ICON_EXPAND_MORE; // "\uE5CF"
```

Codepoints are compile-time constants. A typo in the import name is a build error, not a silent missing icon at runtime.

The `<ui-icon>` component wraps this system with a `name` attribute API, `ICON_CODEPOINTS` lookup, ligature fallback, 5 sizes, 10 states, and filled variant support. Custom SVG icons can be registered alongside Material Symbols via `registerIcon()` / `registerIcons()`, re-exported from the package root.

One constraint: `<ui-icon>` must be created in `connectedCallback()`, not the constructor. Creating custom elements with attributes in the constructor throws `NotSupportedError` when the parent is parsed from HTML.

## Multi-Entry Build

The Vite config emits two kinds of outputs:

```
dist/
  index.js                    # barrel — all 78 components
  components/
    ui-badge.js               # per-component entry
    ui-button.js
    ...
  shared/
    [name]-[hash].js          # deduped foundation chunks
```

The entry map is generated dynamically at build time by scanning `src/components/` for files matching `ui-*.ts` (excluding `.test.ts` and `.styles.ts`):

```ts
entry: {
  index: resolve(__dirname, "src/index.ts"),
  ...Object.fromEntries(
    readdirSync(resolve(__dirname, "src/components"))
      .filter((f) => f.startsWith("ui-") && f.endsWith(".ts")
                  && !f.includes(".test.") && !f.includes(".styles."))
      .map((f) => [`components/${f.replace(".ts", "")}`, ...])
  ),
}
```

The `package.json` exports map exposes deep imports:

```ts
// imports only ui-badge + its foundation deps
import "@maneki/ui-components/components/ui-badge.js";
```

The blog app uses this to import only the 4 components it needs, keeping its bundle lean. The catalog imports the barrel.

A custom Vite plugin (`minifyCssLiterals`) minifies CSS inside `/* css */`-tagged template literals at build time. This strips comments and collapses whitespace without affecting DX during development or test runs.

## Styles Extraction

Components that grow past ~700 lines split into two files:

- `ui-foo.ts` — component class, DOM construction, event handling
- `ui-foo.styles.ts` — `STYLES` constant, token constants, shared maps (e.g., `STATUS_ICON_MAP`)

Currently extracted: `ui-input`, `ui-select`, `ui-textarea`, `ui-dropdown-item`, `ui-dropdown-split`, `ui-side-panel-menu`, `ui-calendar`, `ui-calendar-quicklinks`, `ui-calendar-time`, `ui-calendar-panel`, `ui-datetime-picker-input`, `ui-datetime-picker`, `ui-clock`, `ui-list-item`, `ui-list-header`, `ui-popover`.

The `.styles.ts` files are excluded from the Vite entry map — they're imported by their companion `.ts` file and bundled into the same output chunk.

## Panel Transition Pattern

Dropdown, menu, select, and popover panels share a consistent open/close animation:

```css
.panel {
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0.15s ease, transform 0.15s ease;
}

.panel[open] {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  pointer-events: auto;
}

@media (prefers-reduced-motion: reduce) {
  .panel { transition: none; }
}
```

`visibility: hidden` (not `display: none`) keeps the panel in the layout tree so transitions work. `pointer-events: none` prevents interaction while hidden.

## Type Safety

Every attribute has a corresponding exported union type:

```ts
export type ButtonAction   = "primary" | "secondary" | "destructive" | "info" | "contrast";
export type ButtonEmphasis = "bold" | "subtle" | "minimal";
export type AlertStatus    = "none" | "information" | "success" | "error" | "warning";
```

Property setters accept these types. Passing an invalid value is a TypeScript error. The barrel export re-exports all types alongside the class, so consumers get full type coverage from a single import.

## Design Decisions

**Shadow DOM always.** No light DOM components. Encapsulation is non-negotiable — it's what makes the components safe to drop into any host app without style leakage.

**Composition over inheritance.** Components don't extend each other. `<ui-dropdown>` composes `<ui-button>` as its trigger. `<ui-input-group>` wraps `<ui-input>`. This keeps the inheritance chain flat and avoids the fragile base class problem.

**Lit for new components.** The vanilla pattern works but requires significant boilerplate for attribute observation and DOM diffing. Lit eliminates that without changing the Shadow DOM model. Existing components stay vanilla — migration is not required.

**Type-safe tokens, no hardcoded values.** Raw hex colors, pixel spacing, and font sizes are banned. Every design value traces back to a foundation token. The only exceptions are white (`#ffffff`), `rgba()` overlays, and a handful of shape constants with no token equivalent.

**Codepoint constants over ligature strings.** Icon ligatures are fragile — a missing glyph silently renders as text. Codepoints are explicit Unicode values. A wrong import is a compile error.

**Branch per component.** Every new component lives on its own branch. No direct pushes to `main`. Visual Figma verification is required before merge.

## Known Issues

1. **AGENTS.md component list is behind the index.** The AGENTS.md overview section documents the original ~50 components. The actual `src/index.ts` exports 78. The newer categories (metric, pagination, person, progress, queryfield, scrollbar, search, separator, side-panel, skeleton, slider, steps, switch, tree, wizard) are missing from the AGENTS.md overview.

2. **`<ui-icon>` size not inherited from parent `font-size`.** Because `<ui-icon>` uses Shadow DOM, `font-size` on a parent element doesn't control icon size. Every component that embeds `<ui-icon>` must set `--ui-icon-size` explicitly for each size variant. Easy to miss when adding a new size.

3. **No lazy registration.** Importing the barrel (`import "@maneki/ui-components"`) registers all 78 custom elements immediately. Apps that need only a subset should use deep imports via the exports map.

---

*This document describes the architecture as of April 2026. See `docs/adr/` for individual decision records, and `packages/ui-components/AGENTS.md` for the full component API reference.*
