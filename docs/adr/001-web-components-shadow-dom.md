# ADR-001: Web Components + Shadow DOM

**Status:** Accepted
**Date:** 2026-03
**Context:** Choosing a component technology for the Maneki design system.

## Decision

All UI components are built as native Web Components using `customElements.define()` with Shadow DOM (`attachShadow({ mode: "open" })`).

## Rationale

- **Framework-agnostic.** Web Components work in any framework (React, Vue, Svelte, vanilla) or no framework at all. The design system shouldn't force a framework choice on consumers.
- **Style encapsulation.** Shadow DOM prevents component styles from leaking out and external styles from leaking in. Each component is a self-contained unit.
- **Native platform.** No build step required for consumers. Components register themselves and work in any HTML page with a `<script>` tag.
- **Composition over inheritance.** Components compose via slots and CSS custom properties, not class inheritance. This avoids fragile base class hierarchies.

## Consequences

- **CSS custom properties are the theming API.** Shadow DOM blocks external CSS selectors, so all customization happens through `var(--ui-*)` properties that pierce the shadow boundary.
- **Constructable stylesheets** (`new CSSStyleSheet()`) are used for performance — one shared stylesheet instance per component class, not per instance.
- **No light DOM components.** Every component uses Shadow DOM, no exceptions.
- **Font loading requires `@font-face` in Shadow DOM.** The Material Symbols icon font must be declared via `@font-face { src: local(...) }` inside each component that uses icons, since Shadow DOM can't see global `@font-face` rules.

## Alternatives Considered

- **React components** — would limit adoption to React projects.
- **Lit** — considered as a Web Component base class, but adds a runtime dependency. Raw `HTMLElement` keeps the bundle smaller and avoids framework lock-in.
- **Light DOM** — would allow global CSS but loses encapsulation. Components would be fragile in consumer applications with conflicting styles.
