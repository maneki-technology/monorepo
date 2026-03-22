---
title: Building a Design System with Web Components
date: 2026-03-15
excerpt: How I built a zero-dependency design system using custom elements, Shadow DOM, and CSS custom properties — and what I learned along the way.
tags: [Web Components, Design Systems, TypeScript]
---

Design systems are one of those things that sound simple until you actually try to build one. You need tokens, components, documentation, and a way to keep everything in sync.

## Why Web Components?

Framework-agnostic. That was the main driver. I wanted components that work in React, Vue, Svelte, or plain HTML without wrappers or adapters. Web Components give you that for free.

Shadow DOM encapsulation means styles don't leak in or out. CSS custom properties provide the theming escape hatch — you set tokens on the host, and they cascade into the shadow tree.

### The Token Architecture

Everything starts with tokens. Colors, typography, spacing, elevation — all extracted from Figma and generated as CSS custom properties:

```ts
import { injectAllTokens } from "@maneki/foundation";

// Inject all CSS custom properties onto :root
injectAllTokens();
```

The key insight: semantic tokens reference palette tokens. `--fd-text-primary` resolves to `--fd-color-gray-80` in light mode and something lighter in dark mode. One toggle, everything updates.

## Lessons Learned

- Start with tokens, not components. Get the foundation right first.
- Shadow DOM is great for encapsulation but tricky for form participation.
- CSS custom properties are the bridge between Shadow DOM and the outside world.
- Test visually. Unit tests catch logic bugs, but Playwright screenshots catch visual regressions.

> The best design system is the one your team actually uses.

Next up: how I handle responsive layouts with a zero-dependency grid component.
