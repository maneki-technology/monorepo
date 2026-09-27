# @maneki/catalog

Visual catalog app for the Maneki design system. Renders all foundation tokens and UI components with key variants on deterministic pages. Used as the target for Playwright visual and accessibility regression tests.

- 56 pages (6 foundation + 48 component + 2 layout)
- 122 Playwright tests per browser project (56 visual + 56 a11y + icon-only button, layout, and mobile checks)
- History API routing, sidebar navigation, dark theme toggle
- Pure Vite + vanilla TypeScript

## Quick Start

```bash
# Development
moon run catalog:dev          # http://localhost:5174

# Visual regression tests
moon run catalog:test-visual  # Run 244 Playwright tests across both browser projects
```

## Pages

### Foundation
| Page | Description |
|------|-------------|
| Colors | 13 color families × 10 steps |
| Spacing | 17-step spacing scale |
| Typography | 7 groups (display, heading, body, ui, caption, badge, code) |
| Elevation | 6 elevation levels |
| Semantic Tokens | Surface, border, text, icon token swatches |
| Shape | Border-radius + border-width tokens |

### Components
| Page | Variants |
|------|----------|
| Badge | Sizes, emphases, colors, shapes, statuses |
| Button | Actions × emphases, sizes, shapes, states, icon modes |
| Avatar | Types, sizes, colors, emphases, shapes, statuses |
| Alert | Statuses, sizes, emphases |
| Icon | All 34 icons, sizes, filled |
| Image | Aspect ratios, object fit |
| Label | Sizes, emphases, states |
| Link | Sizes, states, external |
| Tag | Sizes, types, emphases, dismissible |
| Checkbox | Sizes, states, label positions, groups |
| Radio | Sizes, states, label positions, groups |
| Input | Sizes, types, states, statuses |
| Textarea | Sizes, states, statuses |
| File Upload | Sizes, disabled |
| Select | Sizes, statuses |
| Card | Sizes, elevations, bordered |
| Breadcrumb | Sizes |
| Accordion | Sizes, emphases |
| Dropdown | Sizes, split variant |
| Menu | Items, headings, separators |
| Modal | Trigger button |
| Side Panel Menu | Expanded with primary/secondary items |
| Tabs | Sizes, orientations |
| Table | Sizes, zebra, bordered |
| Carousel | Basic with colored slides |
| Calendar | Sizes, range, monthly, quicklinks, time |
| Datetime Picker | Single-date, range-date, time, datetime |
| Clock | Sizes |
| List | Sizes, description, leading/trailing, groups |

## Visual & Accessibility Tests

```bash
# Run tests (requires build first)
moon run catalog:test-visual

# Update baselines after intentional changes
moon run catalog:test-visual-update
```

122 tests per browser project: 56 visual screenshots, 56 a11y scans, an icon-only button check, sidebar and full-layout checks, and five mobile checks. Chromium runs at desktop and mobile viewports with a 1% pixel diff threshold.

## Development

```bash
moon run catalog:dev              # Vite dev server on port 5174
moon run catalog:build            # Production build → dist/
moon run catalog:test-visual      # Playwright screenshot tests
moon run catalog:test-visual-update  # Regenerate baselines
```

## License

MIT
