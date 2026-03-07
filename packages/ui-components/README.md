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

### `<ui-button>`

A button component matching the full Figma spec: 5 actions, 3 emphases, 4 sizes, 2 shapes, 4 icon modes, 3 statuses.

**Attributes**

| Attribute | Type | Default | Description |
|---|---|---|---|
| `action` | `"primary" \| "secondary" \| "destructive" \| "info" \| "contrast"` | `"primary"` | Action style |
| `emphasis` | `"bold" \| "subtle" \| "minimal"` | `"bold"` | Emphasis level |
| `size` | `"s" \| "m" \| "l" \| "xl"` | `"m"` | Button size |
| `shape` | `"basic" \| "rounded"` | `"basic"` | Border radius style |
| `icon` | `"text-only" \| "leading-icon" \| "trailing-icon" \| "icon-only"` | `"text-only"` | Icon layout |
| `status` | `"none" \| "error" \| "loading" \| "success"` | `"none"` | Status indicator |
| `disabled` | `boolean` | `false` | Disabled state |

---

### `<ui-button-group>`

A segmented bar that wraps `<ui-button>` elements. Propagates shared attributes to its children.

**Attributes**

| Attribute | Type | Default | Description |
|---|---|---|---|
| `action` | `ButtonAction` | `"primary"` | Shared action style |
| `emphasis` | `ButtonEmphasis` | `"bold"` | Shared emphasis level |
| `size` | `ButtonSize` | `"m"` | Shared button size |
| `shape` | `ButtonShape` | `"basic"` | Shared border radius style |

```html
<ui-button-group action="secondary" size="m">
  <ui-button>Day</ui-button>
  <ui-button>Week</ui-button>
  <ui-button>Month</ui-button>
</ui-button-group>
```

---

## Storybook

```bash
moon run ui-components:storybook        # Dev server on port 6006
moon run ui-components:storybook-build  # Static build → storybook-static/
```

13 stories cover all actions, emphases, sizes, shapes, icon modes, statuses, and group configurations (9 button + 4 group).

---

## Development

```bash
moon run ui-components:build  # vite build + tsc --emitDeclarationOnly → dist/
moon run ui-components:test   # vitest --run (39 tests)
```

---

## License

MIT
