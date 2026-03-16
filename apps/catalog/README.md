# @maneki/catalog

Visual catalog app for the Maneki design system. Renders all foundation tokens and 50 UI components with key variants on deterministic pages. Used as the target for Playwright screenshot-based visual regression tests.

- 34 pages (5 foundation + 29 component)
- 36 Playwright visual regression tests
- Hash-based routing, sidebar navigation
- Pure Vite + vanilla TypeScript — no Storybook dependency

## Quick Start

```bash
# Development
moon run catalog:dev          # http://localhost:5174

# Visual regression tests
moon run catalog:test-visual  # Run 36 screenshot tests
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

## Visual Regression Tests

```bash
# Run tests (requires build first)
moon run catalog:test-visual

# Update baselines after intentional changes
moon run catalog:test-visual-update
```

36 tests: one screenshot per page (targeting `#content`), plus sidebar and full-layout screenshots. Chromium only, 1280×900 viewport, 1% pixel diff threshold.

## Development

```bash
moon run catalog:dev              # Vite dev server on port 5174
moon run catalog:build            # Production build → dist/
moon run catalog:test-visual      # Playwright screenshot tests
moon run catalog:test-visual-update  # Regenerate baselines
```

## License

MIT
