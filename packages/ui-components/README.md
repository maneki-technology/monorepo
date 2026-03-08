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
| `<ui-button>` | 5 actions, 3 emphases, 4 sizes, 2 shapes, 4 icon modes, 3 statuses |
| `<ui-button-group>` | Segmented bar wrapping `<ui-button>` elements |
| `<ui-accordion-item>` | Expandable panel: 3 sizes, 2 emphases, 4 statuses |
| `<ui-accordion-group>` | Wrapper with size/emphasis propagation + exclusive mode |
| `<ui-alert>` | Dismissable alert: 3 sizes, 2 emphases, 5 statuses, footer slot |
| `<ui-avatar>` | 5 sizes, 3 types (text/icon/image), 2 emphases, 2 shapes, 14 colors |
| `<ui-breadcrumb-item>` | Breadcrumb link: 3 sizes, 7 states |
| `<ui-breadcrumb-group>` | Nav wrapper with size propagation |
| `<ui-card>` | Slot-based container: 3 sizes, 4 elevations, bordered variant |
| `<ui-checkbox-item>` | 3 sizes, 3 check states, 3 label positions, 5 states |
| `<ui-checkbox-group>` | Group wrapper: 2 orientations, size propagation |
| `<ui-dropdown>` | Button + floating menu: 4 sizes, 5 actions, opt-in `selectable` |
| `<ui-dropdown-item>` | Menu item with select event, checkmark, disabled support |
| `<ui-dropdown-heading>` | Uppercase section heading |
| `<ui-dropdown-separator>` | Horizontal divider line |
| `<ui-dropdown-split>` | Split button (action + chevron trigger): 4 sizes, 5 actions, opt-in `selectable` |
| `<ui-menu>` | Standalone floating menu panel: 2 sizes, open/close animation, dismiss, single/multi-select |
| `<ui-side-panel-menu>` | Collapsible sidebar nav: expanded/collapsed, mobile responsive, flyout submenu, overlay |
| `<ui-side-panel-menu-item>` | Sidebar menu item: 3 levels, expandable parent, leading icon, selected/disabled |
| `<ui-modal>` | Dialog with backdrop, header, scrollable body, footer: 3 sizes, 2 layouts |
| `<ui-badge>` | Label/tag: 4 sizes, 3 emphases, 2 shapes, 13 colors, 5 statuses |

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

21 components with stories covering all variants, sizes, actions, emphases, shapes, and statuses.

---

## Development

```bash
moon run ui-components:build  # vite build + tsc --emitDeclarationOnly → dist/
moon run ui-components:test   # vitest --run (767 tests)
```

---

## License

MIT
