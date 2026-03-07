# src/core — Pure Logic Engine

## OVERVIEW
All layout math, collision detection, compaction, and responsive utilities. Zero DOM dependencies — pure functions only.

## DEPENDENCY GRAPH
```
types.ts ← utils.ts ← collision.ts ← sort.ts ← compact.ts ← layout-engine.ts
                                                    ↑
types.ts ← compact.ts ← responsive.ts ← utils.ts
```

## MODULES
| File | Purpose | Key Exports |
|------|---------|-------------|
| `types.ts` | All interfaces, type aliases, defaults, lifecycle hook types, external drop types | `LayoutItem`, `Layout`, `GridConfig`, `CompactType`, `BeforeDragStartHook`, `AfterDropHook`, `DroppingItem`, `ExternalDropEvent`, etc. |
| `utils.ts` | Grid math: pixel↔grid conversion, constraints, cloning | `calcPosition`, `calcXY`, `calcWH`, `constrainSize`, `cloneLayout` |
| `collision.ts` | AABB overlap detection | `collides`, `getFirstCollision`, `getAllCollisions` |
| `sort.ts` | Layout sorting for compaction order | `sortLayoutItems` (vertical/horizontal), `getStatics` |
| `compact.ts` | Compaction algorithms + bounds correction | `compact` (vertical/horizontal/null), `correctBounds` |
| `layout-engine.ts` | Move element + collision resolution | `moveElement`, `moveElementAwayFromCollision` |
| `responsive.ts` | Breakpoint detection + layout generation | `getBreakpointFromWidth`, `findOrGenerateResponsiveLayout` |

## CONVENTIONS
- Every function is stateless — no module-level state
- `LayoutItem` is the atomic unit; `Layout` is `LayoutItem[]`
- Functions that return layouts always clone — never return internal references
- `compact()` with `null` compactType returns a clone without compacting

## GOTCHAS
- `moveElementAwayFromCollision` uses a bounded loop (max 100), not recursion — previous recursive version caused stack overflow
- `correctBounds` clamps items but does NOT compact — call `compact()` after
- `sortLayoutItems` returns a new array (non-mutating), but `moveElement` mutates items in-place
- `DroppingItem` defines shape `{ i: string; w: number; h: number }` for external drag-and-drop placeholder sizing
- `ExternalDropEvent` defines the `external-drop` event detail: `{ layout, item, event }`
