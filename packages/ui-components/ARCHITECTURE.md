# UI Components Architecture

_Verified against the package on 9 October 2026._

## Overview

`@maneki/ui-components` ships 78 registered custom elements and 3,736 unit tests. All components use open Shadow DOM and CSS custom properties for theming. Runtime dependencies are `@maneki/foundation` and `lit`.

The [README](README.md) lists all elements. [AGENTS.md](AGENTS.md) describes component conventions and the source tree. Co-located component source and tests provide attribute, property and event details.

## Component Inventory

| Category          | Components                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitives        | `<ui-badge>`, `<ui-image>`, `<ui-button>`, `<ui-avatar>`, `<ui-alert>`, `<ui-label>`, `<ui-link>`, `<ui-tag>`                                                                                           |
| Form Controls     | `<ui-checkbox-item>`, `<ui-checkbox-group>`, `<ui-radio-item>`, `<ui-radio-group>`, `<ui-input>`, `<ui-input-group>`, `<ui-file-upload>`, `<ui-dropzone>`, `<ui-select>`, `<ui-textarea>`               |
| Containers        | `<ui-card>`, `<ui-button-group>`, `<ui-toolbar>`, `<ui-toolbar-separator>`                                                                                                                              |
| Navigation        | `<ui-breadcrumb-item>`, `<ui-breadcrumb-group>`, `<ui-side-panel-menu>`, `<ui-side-panel-menu-item>`, `<ui-side-panel-menu-section>`                                                                    |
| Disclosure        | `<ui-accordion-item>`, `<ui-accordion-group>`                                                                                                                                                           |
| Menus & Dropdowns | `<ui-dropdown>`, `<ui-dropdown-item>`, `<ui-dropdown-heading>`, `<ui-dropdown-separator>`, `<ui-dropdown-split>`, `<ui-menu>`                                                                           |
| Overlays          | `<ui-modal>`, `<ui-popover>`, `<ui-tooltip>`                                                                                                                                                            |
| Tabs              | `<ui-tab-item>`, `<ui-tab-group>`                                                                                                                                                                       |
| Icons             | `<ui-icon>`                                                                                                                                                                                             |
| Data Display      | `<ui-table>`, `<ui-table-row>`, `<ui-table-cell>`, `<ui-metric>`, `<ui-metric-group>`                                                                                                                   |
| Carousel          | `<ui-carousel>`, `<ui-carousel-item>`                                                                                                                                                                   |
| Calendar          | `<ui-calendar>`, `<ui-calendar-panel>`, `<ui-calendar-quicklinks>`, `<ui-calendar-time>`                                                                                                                |
| Datetime Picker   | `<ui-datetime-picker-input>`, `<ui-datetime-picker>`, `<ui-clock>`                                                                                                                                      |
| List              | `<ui-list-item>`, `<ui-list-header>`, `<ui-list-group>`                                                                                                                                                 |
| Steps             | `<ui-step-item>`, `<ui-step-group>`                                                                                                                                                                     |
| Tree              | `<ui-tree-item>`, `<ui-tree-group>`                                                                                                                                                                     |
| Search            | `<ui-search>`, `<ui-queryfield>`, `<ui-queryfield-tag>`                                                                                                                                                 |
| Progress          | `<ui-progress-bar>`, `<ui-progress-circle>`                                                                                                                                                             |
| Misc              | `<ui-pagination>`, `<ui-person-item>`, `<ui-person-group>`, `<ui-scrollbar>`, `<ui-separator>`, `<ui-side-panel>`, `<ui-skeleton>`, `<ui-slider>`, `<ui-switch>`, `<ui-pull-to-refresh>`, `<ui-wizard>` |

## Component Implementations

74 components extend `HTMLElement`. The four Lit components are `ui-side-panel`, `ui-side-panel-menu`, `ui-side-panel-menu-item` and `ui-side-panel-menu-section`.

Vanilla components create their shadow tree in the constructor and update it through attribute callbacks. Lit components use `@property()`, `render()` and `static styles`. Both register through the shared `defineCustomElement()` helper:

```ts
import { defineCustomElement } from "../define-custom-element.js";

// After the component class:
defineCustomElement("ui-button", UiButton);
```

Registration is idempotent: repeated package or deep-module loads retain the first registered constructor. When multiple copies coexist, create elements by tag name instead of constructing a class exported by a later copy.

[ADR-028](../../docs/adr/028-lit-in-ui-components.md) requires Lit for new components; working vanilla components do not need a wholesale migration.

## Tokens and Theming

Components import constants such as `TEXT_PRIMARY`, `SP_2` and `TYPE_BODY_02` from `@maneki/foundation`. Typography constants emit font family, size, line height and weight. Lit styles wrap token strings with `unsafeCSS()`.

Component override properties (`--ui-*`) fall back to foundation properties (`--fd-*`). Both theme systems are supported:

- Default light and `[data-theme="dark"]`.
- HeroUI `[data-theme="heroui"]` and `[data-theme="heroui-dark"]`.

The catalog supports both; the blog uses HeroUI. HeroUI can supply component-specific overrides beneath consumer overrides. Existing raw palette values and pixel values remain in legacy styles; their cleanup is tracked in issues #497 and #507.

Material Symbols codepoint constants and custom SVG registration come from foundation. Apps load the font using `registerIconFont()`; components provide the local font declaration needed inside Shadow DOM. `ui-icon` supports named icons, sizes, states and the custom icon registry. Set `--ui-icon-size` when embedding an icon; parent font size does not control it.

## Build and Imports

`vite build && tsc --emitDeclarationOnly` emits JavaScript followed by declarations:

```text
dist/
  index.js
  index.d.ts
  components/
    ui-button.js
    ui-button.d.ts
    ...
  shared/
    [name]-[hash].js
```

Vite scans `src/components/ui-*.ts`, excluding tests and style modules, to create all 78 component entries. The barrel registers the full library; deep imports register only the selected component and its component dependencies.

```ts
import "@maneki/ui-components/components/ui-button.js";
import type { ButtonSize } from "@maneki/ui-components/components/ui-button.js";
```

The `./components/*` export maps deep imports to `dist/components/`, and TypeScript resolves each `.js` target to its sibling `.d.ts`. `sideEffects: true` keeps registration imports. The blog uses deep imports and its auto-component Vite plugin; the catalog loads components through page modules.

The build deduplicates shared code into chunks. The `minifyCssLiterals` plugin minifies `/* css */` template literals only during builds. Declaration-only style modules need not have standalone JavaScript entries.

## Styles and Composition

Large vanilla components can extract their styles into co-located `ui-*.styles.ts` modules. These are bundled through the component entry. The actual modules are listed in the [AGENTS structure tree](AGENTS.md#structure).

Components compose existing primitives rather than inheriting from other custom elements. Form controls use `ui-label` slots. Dropdowns, menus and popovers use opacity/visibility transitions and reduced-motion alternatives.

## Verification and Maintenance

Run `moon run ui-components:test` for the 3,736 tests and `moon run ui-components:build` for JavaScript and declarations. The catalog supplies Playwright visual and accessibility coverage; see [its instructions](../../apps/catalog/AGENTS.md).

Before pushing, update component inventories, source trees and test counts from the package. Verify both barrel and deep-import declarations against built files. UI changes also need visual review.

Custom Elements Manifest generation is tracked separately in issue #500. Until then, inventories are maintained alongside changes. Form association and connection-listener cleanup remain tracked in #489 and #494.
