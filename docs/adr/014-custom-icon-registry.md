# ADR-014: Custom Icon Registry

**Status:** Accepted
**Date:** 2026-03
**Context:** `<ui-icon>` only supports Material Symbols icons from the subsetted font. Consumers need to use custom icons (brand logos, product-specific icons, third-party icon sets) alongside the built-in icons.

## Decision

Add an icon registry to `@maneki/foundation` that allows consumers to register custom icon factories. `<ui-icon>` checks the registry before falling back to Material Symbols.

```ts
import { registerIcon } from "@maneki/foundation";

registerIcon("brand-logo", () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.innerHTML = '<path d="M12 2L2 22h20L12 2z"/>';
  return svg;
});

// Then use it anywhere:
// <ui-icon name="brand-logo"></ui-icon>
```

### API

| Function | Description |
|----------|-------------|
| `registerIcon(name, factory)` | Register a single custom icon |
| `registerIcons({ name: factory })` | Register multiple icons at once |
| `resolveIcon(name)` | Get the element for a custom icon (null if not registered) |
| `hasIcon(name)` | Check if a custom icon is registered |
| `unregisterIcon(name)` | Remove a registered icon |
| `clearIcons()` | Remove all registered icons |

### Resolution order in `<ui-icon>`

1. Check custom icon registry → if found, render the factory's element
2. Check `ICON_CODEPOINTS` → if found, render Material Symbols codepoint
3. Fall back to ligature text (the name string itself)

## Rationale

- **Framework-agnostic.** The registry is a plain `Map<string, () => Element>`. Works with any framework or none.
- **No Lit needed.** This was the key question — Lit doesn't help with the registry pattern. The hard part is the lookup, not the rendering.
- **Factory pattern.** Each call creates a fresh DOM element. No shared mutable state, no cloneNode issues with SVG.
- **Backward compatible.** Existing `<ui-icon name="home">` usage is unchanged. The registry is opt-in.
- **CSS integration.** Custom icons inherit `currentColor` via `fill: currentColor` and `color: currentColor` on the `.has-custom > *` selector. They also inherit size from the host's `--ui-icon-size` property.

## Consequences

- Custom icons must be registered before components render. Typically done at app startup alongside `injectAllTokens()` and `registerIconFont()`.
- The `part="icon"` attribute is set on custom icon elements, allowing consumer CSS to style them via `::part(icon)`.
- Custom icons don't get Material Symbols font styles (font-variation-settings, etc.) — the `.has-custom` class resets those.
- The registry is global (module-level Map). Multiple micro-frontends sharing the same foundation bundle share the same registry.

## Alternatives Considered

- **Slot-based override** — expose internal icons as named slots (`<ui-modal><svg slot="close-icon">...</svg></ui-modal>`). Works for component-level overrides but doesn't solve the general `<ui-icon>` use case.
- **CSS custom property for icon font** — `--ui-icon-font: "My Icons"`. Only works if the consumer's icon font uses the same codepoints, which is unlikely.
- **Lit adoption** — would give nicer template syntax for rendering icons but doesn't change the registry architecture at all.
