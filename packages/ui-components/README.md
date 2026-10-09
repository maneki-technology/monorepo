# @maneki/ui-components

Web Component library for the Maneki design system. Shadow DOM encapsulation, CSS custom properties for theming, TypeScript types included. Runtime dependencies are `@maneki/foundation` and `lit`.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Install

```bash
npm install @maneki/ui-components
```

---

## Usage

Component registration is idempotent: loading another copy of the package or a deep import keeps the first registered constructor. Create elements through their tag names when multiple package copies coexist.

```html
<script type="module">
  import "@maneki/ui-components";
</script>

<ui-button action="primary" emphasis="bold" size="m">Save</ui-button>
<ui-button action="destructive" emphasis="subtle">Delete</ui-button>
```

For a subset, use `.js` deep imports; declarations ship alongside every component:

```ts
import "@maneki/ui-components/components/ui-button.js";
import type { ButtonSize } from "@maneki/ui-components/components/ui-button.js";

const size: ButtonSize = "m";
```

---

## Components

Components can be moved between containers without duplicating their interactions.

78 registered custom elements; 74 use vanilla `HTMLElement`, and the four side-panel components use Lit.

| Component                      | Description                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
|                                | **Primitives**                                                                                                                |
| `<ui-badge>`                   | Label/tag: 4 sizes, 3 emphases, 2 shapes, 13 colors, 5 statuses                                                               |
| `<ui-image>`                   | Image container: 5 aspect ratios, 4 object-fit modes, placeholder, fallback slot                                              |
| `<ui-button>`                  | 5 actions, 3 emphases, 4 sizes, 2 shapes, 4 icon modes, 3 statuses                                                            |
| `<ui-avatar>`                  | 5 sizes, 3 types (text/icon/image), 2 emphases, 2 shapes, 14 colors                                                           |
| `<ui-alert>`                   | Dismissable alert: 3 sizes, 2 emphases, 5 statuses, footer slot                                                               |
| `<ui-label>`                   | Form field label: 3 sizes, 2 emphases, disabled, required indicator                                                           |
| `<ui-link>`                    | Anchor/span link: 3 sizes, 7 states, standalone/inline, external icon                                                         |
|                                | **Form Controls**                                                                                                             |
| `<ui-checkbox-item>`           | 3 sizes, 3 check states, 3 label positions, 5 states                                                                          |
| `<ui-checkbox-group>`          | Group wrapper: 2 orientations, size propagation                                                                               |
| `<ui-radio-item>`              | 3 sizes, 2 check states, 3 label positions, 5 states, value attribute, `--ui-radio-disabled-*` overrides                      |
| `<ui-radio-group>`             | Group wrapper: 2 orientations, size propagation, mutual exclusion                                                             |
| `<ui-input>`                   | Text input: 3 sizes, 4 types (text/numeric/clearable/password), 7 states, 5 statuses, label/supportive                        |
| `<ui-input-group>`             | Input group wrapper: 3 sizes, prefix/suffix slots with separators                                                             |
| `<ui-file-upload>`             | File upload: 3 sizes, Browse button, accept/multiple, disabled                                                                |
| `<ui-dropzone>`                | Drag-and-drop file upload zone: 3 sizes, accept/multiple filtering, browse link, hint, label slot                             |
| `<ui-select>`                  | Select dropdown: 3 sizes, 7 states, 5 statuses, single/multi-select, tag pills, combobox ARIA                                 |
| `<ui-textarea>`                | Textarea: 3 sizes, 7 states, 5 statuses, label with char count, secondary label, resize                                       |
|                                | **Containers**                                                                                                                |
| `<ui-card>`                    | Slot-based container: 3 sizes, 4 elevations, bordered variant                                                                 |
| `<ui-button-group>`            | Segmented bar wrapping `<ui-button>` elements                                                                                 |
| `<ui-scrollbar>`               | Scroll container with keyboard-focusable content                                                                              |
|                                | **Navigation**                                                                                                                |
| `<ui-breadcrumb-item>`         | Breadcrumb link: 3 sizes, 7 states                                                                                            |
| `<ui-breadcrumb-group>`        | Nav wrapper with size propagation                                                                                             |
| `<ui-side-panel-menu>`         | Collapsible sidebar nav: expanded/collapsed, mobile responsive, flyout submenu, overlay                                       |
| `<ui-side-panel-menu-item>`    | Sidebar menu item: 3 levels, expandable parent, leading icon, selected/disabled                                               |
|                                | **Disclosure**                                                                                                                |
| `<ui-accordion-item>`          | Expandable panel: 3 sizes, 2 emphases, 4 statuses                                                                             |
| `<ui-accordion-group>`         | Wrapper with size/emphasis propagation + exclusive mode                                                                       |
|                                | **Menus & Dropdowns**                                                                                                         |
| `<ui-dropdown>`                | Labeled button + floating menu: 4 sizes, 5 actions, opt-in `selectable`                                                       |
| `<ui-dropdown-item>`           | Menu item with select event, checkmark, disabled support                                                                      |
| `<ui-dropdown-heading>`        | Uppercase section heading                                                                                                     |
| `<ui-dropdown-separator>`      | Horizontal divider line                                                                                                       |
| `<ui-dropdown-split>`          | Labeled split button (action + chevron trigger): 4 sizes, 5 actions, opt-in `selectable`                                      |
| `<ui-menu>`                    | Standalone floating menu panel: 3 sizes, open/close animation, dismiss, single/multi-select                                   |
|                                | **Overlays**                                                                                                                  |
| `<ui-modal>`                   | Native modal dialog with inert background, header, scrollable body, footer: 3 sizes, 2 layouts                                |
|                                | **Tabs**                                                                                                                      |
| `<ui-tab-item>`                | Tab item: 2 sizes, 3 states, 2 orientations, leading/trailing icon slots                                                      |
| `<ui-tab-group>`               | Tab group wrapper: size/orientation propagation, roving tabindex, arrow key navigation                                        |
| `<ui-icon>`                    | Material Symbols icon: 5 sizes, 10 states, filled variant, codepoint lookup                                                   |
| `<ui-tag>`                     | Tag pill/toggle: 4 sizes, 3 types (basic/selectable/toggle), 3 emphases, 3 states, dismissible, check, preserves label casing |
|                                | **Data Display**                                                                                                              |
| `<ui-table>`                   | Table container: 3 sizes, 2 separators (minimal/moderate), zebra striping, bordered                                           |
| `<ui-table-row>`               | Table row: header, selected, disabled states                                                                                  |
| `<ui-table-cell>`              | Table cell: header, 3 alignments (left/center/right)                                                                          |
| `<ui-carousel>`                | Keyboard-scrollable carousel with labeled arrows and current-slide indicators                                                 |
|                                | **Calendar**                                                                                                                  |
| `<ui-calendar>`                | Standalone calendar: 3 sizes, daily + monthly views, single/range select, events, min/max                                     |
| `<ui-calendar-quicklinks>`     | Composable quicklinks panel: 3 sizes, 2 orientations (side/bottom), sections, selected state                                  |
| `<ui-calendar-time>`           | Composable inline time: 3 sizes, hour/minute inputs, AM/PM toggle, separator                                                  |
|                                | **Datetime Picker**                                                                                                           |
| `<ui-datetime-picker-input>`   | Date/time input trigger: 4 types, 3 sizes, 7 states, 5 statuses                                                               |
| `<ui-datetime-picker>`         | Datetime picker: input + floating dropdown, 4 types (single-date/range-date/time/datetime), actions bar                       |
| `<ui-clock>`                   | Standalone clock: analog face + 24-hour digital, 3 sizes                                                                      |
| `<ui-calendar-panel>`          | Composable wrapper: elevation, slots (side/bottom), size propagation, actions bar                                             |
|                                | **List**                                                                                                                      |
| `<ui-list-item>`               | List item: 3 sizes, 5 leading elements, 3 paddings, 4 states, trailing icon, description                                      |
| `<ui-list-header>`             | List section header: 3 sizes, collapse button                                                                                 |
| `<ui-list-group>`              | List group wrapper: size propagation, collapsible                                                                             |
|                                | **Additional Components**                                                                                                     |
| `<ui-carousel-item>`           | Carousel slide wrapper                                                                                                        |
| `<ui-metric>`                  | Metric value with label and delta                                                                                             |
| `<ui-metric-group>`            | Metric grouping and layout                                                                                                    |
| `<ui-pagination>`              | Pagination: minimal, basic and data-grid variants                                                                             |
| `<ui-person-item>`             | Person display item                                                                                                           |
| `<ui-person-group>`            | Person grouping                                                                                                               |
| `<ui-popover>`                 | Focus-managed floating panel with trigger                                                                                     |
| `<ui-progress-bar>`            | Linear progress indicator                                                                                                     |
| `<ui-progress-circle>`         | Circular progress indicator                                                                                                   |
| `<ui-pull-to-refresh>`         | Pull-to-refresh indicator                                                                                                     |
| `<ui-queryfield>`              | Query input with composable filters                                                                                           |
| `<ui-queryfield-tag>`          | Query filter tag                                                                                                              |
| `<ui-search>`                  | Search input with categorized results                                                                                         |
| `<ui-separator>`               | Horizontal or vertical separator                                                                                              |
| `<ui-side-panel-menu-section>` | Sidebar section with label, collapse and divider                                                                              |
| `<ui-side-panel>`              | Expandable side panel                                                                                                         |
| `<ui-skeleton>`                | Loading placeholder: text, circle and rectangle                                                                               |
| `<ui-slider>`                  | Range slider                                                                                                                  |
| `<ui-step-item>`               | Step indicator                                                                                                                |
| `<ui-step-group>`              | Step grouping and orientation                                                                                                 |
| `<ui-switch>`                  | Toggle switch with label positioning                                                                                          |
| `<ui-toolbar>`                 | Horizontal or vertical toolbar                                                                                                |
| `<ui-toolbar-separator>`       | Toolbar separator                                                                                                             |
| `<ui-tooltip>`                 | Accessible tooltip with placement and delay                                                                                   |
| `<ui-tree-item>`               | Tree item with expandable children                                                                                            |
| `<ui-tree-group>`              | Tree grouping                                                                                                                 |
| `<ui-wizard>`                  | Multi-step wizard with navigation                                                                                             |

```html
<ui-button action="primary" emphasis="bold" size="m">Save</ui-button>
<ui-button action="destructive" emphasis="subtle">Delete</ui-button>

<ui-dropdown action="primary" selectable>
  <ui-dropdown-item value="a">Option A</ui-dropdown-item>
  <ui-dropdown-item value="b">Option B</ui-dropdown-item>
</ui-dropdown>
```

---

## Development

Interactive previews and visual regression coverage live in **`apps/catalog/`** (`moon run catalog:dev` from the repo root).

```bash
moon run ui-components:build  # vite build + tsc --emitDeclarationOnly → dist/
moon run ui-components:test   # vitest --run (3736 tests)
```

---

## License

MIT
