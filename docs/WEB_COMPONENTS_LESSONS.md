# Web Components & Shadow DOM — Lessons Learned

After building 50+ components, a catalog app, dark theme, and accessibility audit, these are the practical lessons learned about Web Components with Shadow DOM.

## Shadow DOM: Encapsulation vs Integration

### What works well

- **Style isolation is bulletproof.** No CSS conflicts across 50+ components, ever. Consumer stylesheets cannot break component internals.
- **CSS custom properties pierce the boundary.** Dark mode was implemented as a pure token swap — no component code changes needed for the core theme switch.
- **True portability.** Components work identically in the catalog app and any consumer application. No framework adapter needed.
- **Composition via slots.** `<slot>` elements provide clean content projection without inheritance hierarchies.

### What causes recurring pain

**1. Fonts must be re-declared in every Shadow DOM.**

The icon font requires `@font-face { src: local("Material Symbols Outlined") }` in 14 separate component files. If you forget one, icons silently render as empty boxes. There's no way to inherit a global `@font-face` into Shadow DOM.

```css
/* Required in EVERY component that uses icons */
@font-face {
  font-family: "Material Symbols Outlined";
  font-style: normal;
  src: local("Material Symbols Outlined");
  font-display: swap;
}
```

**2. Focus management breaks at shadow boundaries.**

`document.activeElement` stops at the shadow root — it returns the host element, not the focused element inside. The modal focus trap required a recursive walker:

```ts
private _getDeepActiveElement(): Element | null {
  let active: Element | null = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}
```

Every overlay component (modal, popover, dropdown, select) needs this pattern.

**3. Accessibility tooling can't see through Shadow DOM.**

axe-core cannot detect `disabled` state on custom elements — it sees the host element but not the internal `<button disabled>`. We had to exclude `color-contrast` checks from the a11y test suite because it flagged every disabled component as a violation.

ARIA attributes must be set on the host element (light DOM) for screen readers, even when the interactive element is inside Shadow DOM.

**4. DOM queries don't cross boundaries.**

`document.getElementById()`, `document.querySelector()` — none of these reach into Shadow DOM. A button placed as a child of a Web Component (via slot) is accessible, but one created inside Shadow DOM is invisible to the parent document.

We hit this when the theme toggle button was placed inside `<ui-side-panel-menu>` — `getElementById("theme-toggle")` returned null. Had to move it outside the component.

**5. Event retargeting.**

Events from inside Shadow DOM are retargeted — `event.target` becomes the host element, not the actual clicked element. Components must use `event.composedPath()` or handle events internally and re-dispatch composed events.

## Imperative DOM Construction

Without Lit or a template DSL, every component builds its DOM with `document.createElement()` chains. A 50-line HTML template becomes 150+ lines of imperative code:

```ts
// What we write (no template DSL)
const btn = document.createElement("button");
btn.className = "base";
btn.type = "button";
const slot = document.createElement("slot");
btn.appendChild(slot);
shadow.appendChild(btn);

// What Lit would give us
render() { return html`<button class="base" type="button"><slot></slot></button>`; }
```

We accepted this tradeoff for zero runtime dependencies (ADR-012), but it's the single biggest DX cost. Components average 400-600 lines where a Lit equivalent would be 200-300.

## CSS Custom Properties: The Two-Layer Tax

Every customizable property needs nested `var()`:

```css
background: var(--ui-btn-bg, var(--fd-surface-action));
/*           ↑ consumer API    ↑ foundation default     */
```

With 50 components × 10+ customizable properties each, this is ~500 `var()` declarations. It's the right architecture (ADR-002) but verbose. The centralized token constants (ADR-004) helped reduce the boilerplate at the default value layer.

## Server-Side Rendering Compatibility

**Current status: NOT SSR-compatible.**

### Why

1. **DOM required.** `attachShadow()`, `document.createElement()`, `customElements.define()` all require a browser DOM. There is no HTML string output path.

2. **No Declarative Shadow DOM.** The platform supports `<template shadowrootmode="open">` for static Shadow DOM in HTML, but our components build DOM imperatively — they don't generate `<template>` tags.

3. **No hydration.** Even if we pre-rendered HTML, there's no mechanism to adopt an existing Shadow DOM. The component would rebuild it from scratch in `connectedCallback()`, causing a flash.

### What SSR would require

```html
<!-- Declarative Shadow DOM (what SSR needs to emit) -->
<ui-button action="primary">
  <template shadowrootmode="open">
    <style>/* component styles */</style>
    <button class="base"><slot></slot></button>
  </template>
  Click me
</ui-button>
```

Options to get there:
- **Add Lit** — provides `@lit-labs/ssr` for free, but adds a runtime dependency (contradicts ADR-012)
- **Custom `renderToString()`** — per-component server rendering function. Huge effort, fragile to maintain.
- **Accept client-side hydration** — the pragmatic choice. Framework SSR renders `<ui-button>` as an empty tag, component hydrates client-side.

### Practical impact

For SPAs (React, Vue, Next.js, Nuxt), client-side hydration works fine:
- Server emits `<ui-button>Click me</ui-button>` as a string
- Browser registers the custom element and upgrades it
- Brief flash of unstyled content (FOUC) until JS loads
- Most Web Component design systems (Shoelace, Spectrum Web Components, FAST) work this way

For content-heavy sites where FOUC is unacceptable, Web Components with Shadow DOM are not the right choice today.

## Recommendations for Future Work

1. **Consider Lit adoption** if SSR becomes a requirement. The DX improvement (templates, reactive properties) would also reduce component code by ~40%.
2. **Declarative Shadow DOM** support is improving in browsers. When all target browsers support it, a build-time pre-renderer could generate static Shadow DOM without Lit.
3. **CSS `@scope`** (shipping in Chrome/Edge) may eventually replace Shadow DOM for style encapsulation without the integration pain points.
4. **`ElementInternals`** can improve form participation — custom elements can participate in native `<form>` validation without wrapper hacks.

## Shadow DOM vs Light DOM: The Theming Tax

### The problem

Shadow DOM blocks global CSS cascade. This means app-level theme overrides (like `[data-theme="heroui-dark"]`) cannot reach into component internals. Every themeable property must be explicitly exposed as a CSS custom property (`--ui-search-bg`, `--ui-search-border`, etc.).

We hit this concretely when the blog's `ui-search` input became invisible in dark mode — its `surface-primary` background matched the page background exactly. The fix required adding a dark mode override in the consuming app:

```css
/* Consumer must know which custom properties exist and override them */
[data-theme="heroui-dark"] ui-search {
  --ui-search-bg: var(--fd-surface-tertiary);
  --ui-search-border: var(--fd-border-minimal);
}
```

This is a per-component, per-context fix. Every component on every page may need its own dark mode overrides depending on what surface it sits on. The component library can't anticipate every consumer's surface hierarchy.

### Light DOM alternative

Custom elements without Shadow DOM (`this.innerHTML = ...` instead of `attachShadow()`) let global CSS cascade naturally. The dark mode search fix would have been unnecessary — `[data-theme="heroui-dark"] .input-wrapper { background: ... }` just works.

```js
class MySearch extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div class="ui-search__wrapper">...</div>`;
  }
}
```

**Tradeoffs:**

| | Shadow DOM | Light DOM |
|---|---|---|
| Style encapsulation | Bulletproof | Requires naming convention (BEM, prefixes) |
| Global theming | Blocked — needs explicit `--custom-prop` hooks | Just works — CSS cascade applies |
| Font inheritance | Broken — `@font-face` must be re-declared per component | Works naturally |
| Form participation | Needs `ElementInternals` | Native |
| SSR | Painful (Declarative Shadow DOM) | Trivial |
| DOM queries | Blocked at shadow boundary | Normal |
| Consumer CSS accidents | Impossible | Possible without discipline |
| Debugging | Extra clicks in DevTools | Normal |

### Hybrid approach (worth considering)

Use Shadow DOM selectively based on component complexity:

- **Shadow DOM** for complex interactive components (dropdown, modal, select, popover) where encapsulation prevents real bugs — consumer CSS accidentally breaking focus traps, overlay z-index, or internal state indicators.
- **Light DOM** for simpler/presentational components (badge, card, alert, label, link) where global theming is more valuable than isolation, and there's little internal state to protect.

Libraries like Lit support both modes per-component via `static shadowRootOptions`. This would let us migrate incrementally without rewriting everything.

### Current decision

We stay with Shadow DOM across all components (ADR-002) for consistency. The theming tax is real but manageable via CSS custom property hooks. If the number of per-context overrides grows significantly, revisit the hybrid approach.
