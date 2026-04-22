# Architecture Documentation

Historical architecture documentation for the Maneki monorepo. These documents capture the system design at a point in time — how things are built, why they're built that way, and what the known trade-offs are.

Unlike ADRs (which record individual decisions), these docs describe the overall shape of the system.

## Documents

| Document | Location | Description |
|---|---|---|
| [Monorepo](./monorepo.md) | `docs/architecture/` | Toolchain, dependency graph, build orchestration, conventions |
| [Foundation](../../packages/foundation/ARCHITECTURE.md) | `packages/foundation/` | Token architecture, CSS generation pipeline |
| [UI Components](../../packages/ui-components/ARCHITECTURE.md) | `packages/ui-components/` | Component patterns, Lit migration, multi-entry build |
| [Grid Layout](../../packages/grid-layout/ARCHITECTURE.md) | `packages/grid-layout/` | Core engine, drag/resize, keyboard a11y |
| [Flex Layout](../../packages/flex-layout/ARCHITECTURE.md) | `packages/flex-layout/` | Panel system, constructable stylesheets |
| [Charts](../../packages/charts/ARCHITECTURE.md) | `packages/charts/` | SVG chart components |
| [Catalog](../../apps/catalog/ARCHITECTURE.md) | `apps/catalog/` | Visual regression testing, page registration |
| [Blog](../../apps/blog/ARCHITECTURE.md) | `apps/blog/` | Full-stack architecture, build-time data baking, editor |

## When to Update

Update these docs when:
- A major architectural change lands (new package, new build strategy, new deployment target)
- A significant pattern shifts (e.g., vanilla → Lit migration)
- The dependency graph changes materially

These are living documents, not contracts. They describe what *is*, not what *must be*.

---

*Last updated: April 2026*
