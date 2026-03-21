# ADR-004: Centralized Token Constants

**Status:** Accepted
**Date:** 2026-03
**Context:** Every component file defined its own local token constants (e.g., `const TEXT_PRIMARY = semanticVar("text", "primary")`), duplicated across 70+ files.

## Decision

All pre-computed token constants are defined once in `packages/foundation/src/token-constants.ts` and exported from `@maneki/foundation`. Components import constants directly instead of calling helper functions.

```ts
// Before (in every component)
const TEXT_PRIMARY = semanticVar("text", "primary");
const SP_1 = spaceVar("1");

// After (single import)
import { TEXT_PRIMARY, SP_1 } from "@maneki/foundation";
```

## Rationale

- **DRY.** 791 local constant definitions removed across 72 files.
- **Consistent naming.** Canonical names enforced: `SP_0_5` (not `SP_05`), `STATUS_SURFACE_ERROR_BOLD` (not `SURF_ERROR_BOLD`), `HOVER_BORDER_MODERATE` (not `HOVER_BORDER`).
- **Discoverability.** One file to see all available tokens. IDE autocomplete works across the entire design system.
- **Tree-shakeable.** Unused constants are eliminated by Vite's bundler — no bundle size penalty.

## Naming Conventions

- Spacing: `SP_` + scale step, underscores for decimals (`SP_1_25` = step 1.25)
- Colors: `{FAMILY}_{STEP}` (`BLUE_60`, `GRAY_110`)
- Semantic: descriptive name matching token group/key (`TEXT_PRIMARY`, `BORDER_FOCUS`)
- Status: full prefix (`STATUS_SURFACE_ERROR_BOLD`, `STATUS_GENERAL_WARNING`)
- Shape: `RADIUS_*`, `BW_*` (border-width)
- Elevation: `ELEVATION_*`

## Consequences

- Helper functions (`semanticVar`, `colorVar`, etc.) are no longer needed in component files — only in `token-constants.ts` itself.
- Adding a new token requires updating `token-constants.ts` and rebuilding foundation.
- Naming conflicts must be resolved at the constant level (e.g., `ICON_PRIMARY` for semantic icon vs `ICON_*` codepoint constants).

## Alternatives Considered

- **Shared module in ui-components** — keeps constants local to the package. Rejected because grid-layout and other packages also need them.
- **Keep local constants** — simpler per-file but 791 duplicates is unmaintainable.
