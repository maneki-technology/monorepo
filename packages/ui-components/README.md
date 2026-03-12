# @maneki/ui-components

Web Component library for the Maneki design system. Shadow DOM encapsulation, CSS custom properties for theming, TypeScript types included, zero runtime dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Install

```bash
npm install @maneki/ui-components
```

---

## Usage

```html
<script type="module">
  import '@maneki/ui-components';
</script>

<ui-button action="primary" emphasis="bold" size="m">Save</ui-button>
<ui-button action="destructive" emphasis="subtle">Delete</ui-button>
```

---

## Components

| Component | Description |
|---|---|
| | **Primitives** |
| `<ui-badge>` | Label/tag: 4 sizes, 3 emphases, 2 shapes, 13 colors, 5 statuses |
| `<ui-image>` | Image container: 5 aspect ratios, 4 object-fit modes, placeholder, fallback slot |
| `<ui-button>` | 5 actions, 3 emphases, 4 sizes, 2 shapes, 4 icon modes, 3 statuses |
| `<ui-avatar>` | 5 sizes, 3 types (text/icon/image), 2 emphases, 2 shapes, 14 colors |
| `<ui-alert>` | Dismissable alert: 3 sizes, 2 emphases, 5 statuses, footer slot |
| `<ui-label>` | Form field label: 3 sizes, 2 emphases, disabled, required indicator |
| `<ui-link>` | Anchor/span link: 3 sizes, 7 states, standalone/inline, external icon |
| | **Form Controls** |
| `<ui-checkbox-item>` | 3 sizes, 3 check states, 3 label positions, 5 states |
| `<ui-checkbox-group>` | Group wrapper: 2 orientations, size propagation |
| `<ui-radio-item>` | 3 sizes, 2 check states, 3 label positions, 5 states, value attribute |
| `<ui-radio-group>` | Group wrapper: 2 orientations, size propagation, mutual exclusion |
| `<ui-input>` | Text input: 3 sizes, 4 types (text/numeric/clearable/password), 7 states, 5 statuses, label/supportive |
| `<ui-input-group>` | Input group wrapper: 3 sizes, prefix/suffix slots with separators |
| `<ui-file-upload>` | File upload: 3 sizes, Browse button, accept/multiple, disabled |
| `<ui-select>` | Select dropdown: 3 sizes, 7 states, 5 statuses, single/multi-select, tag pills, combobox ARIA |
| | **Containers** |
| `<ui-card>` | Slot-based container: 3 sizes, 4 elevations, bordered variant |
| `<ui-button-group>` | Segmented bar wrapping `<ui-button>` elements |
| | **Navigation** |
| `<ui-breadcrumb-item>` | Breadcrumb link: 3 sizes, 7 states |
| `<ui-breadcrumb-group>` | Nav wrapper with size propagation |
| `<ui-side-panel-menu>` | Collapsible sidebar nav: expanded/collapsed, mobile responsive, flyout submenu, overlay |
| `<ui-side-panel-menu-item>` | Sidebar menu item: 3 levels, expandable parent, leading icon, selected/disabled |
| | **Disclosure** |
| `<ui-accordion-item>` | Expandable panel: 3 sizes, 2 emphases, 4 statuses |
| `<ui-accordion-group>` | Wrapper with size/emphasis propagation + exclusive mode |
| | **Menus & Dropdowns** |
| `<ui-dropdown>` | Button + floating menu: 4 sizes, 5 actions, opt-in `selectable` |
| `<ui-dropdown-item>` | Menu item with select event, checkmark, disabled support |
| `<ui-dropdown-heading>` | Uppercase section heading |
| `<ui-dropdown-separator>` | Horizontal divider line |
| `<ui-dropdown-split>` | Split button (action + chevron trigger): 4 sizes, 5 actions, opt-in `selectable` |
| `<ui-menu>` | Standalone floating menu panel: 2 sizes, open/close animation, dismiss, single/multi-select |
| | **Overlays** |
| `<ui-modal>` | Dialog with backdrop, header, scrollable body, footer: 3 sizes, 2 layouts |
| | **Tabs** |
| `<ui-tab-item>` | Tab item: 2 sizes, 3 states, 2 orientations, leading/trailing icon slots |
| `<ui-tab-group>` | Tab group wrapper: size/orientation propagation, roving tabindex, arrow key navigation |
| `<ui-icon>` | Material Symbols icon: 5 sizes, 10 states, filled variant, codepoint lookup |

```html
<ui-button action="primary" emphasis="bold" size="m">Save</ui-button>
<ui-button action="destructive" emphasis="subtle">Delete</ui-button>

<ui-dropdown action="primary" selectable>
  <ui-dropdown-item value="a">Option A</ui-dropdown-item>
  <ui-dropdown-item value="b">Option B</ui-dropdown-item>
</ui-dropdown>
```

---

## Storybook

```bash
moon run ui-components:storybook        # Dev server on port 6006
moon run ui-components:storybook-build  # Static build → storybook-static/
```

33 components with stories covering all variants, sizes, actions, emphases, shapes, and statuses.

---

## Development

```bash
moon run ui-components:build  # vite build + tsc --emitDeclarationOnly → dist/
moon run ui-components:test   # vitest --run (1314 tests)
```

---

## License

MIT
