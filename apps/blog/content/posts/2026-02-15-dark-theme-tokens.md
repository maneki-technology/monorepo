---
title: Dark Theme Done Right with Semantic Tokens
date: 2026-02-15
excerpt: "Forget toggling classes on every element. With semantic tokens, dark mode is a single attribute change on :root."
tags: [CSS, Design Tokens, Dark Mode]
---

Dark mode shouldn't be an afterthought bolted on with `.dark` classes everywhere. It should be a first-class citizen of your token system.

## The Approach

Every semantic token has two values: light and dark. The light values are injected on `:root`, the dark values on `[data-theme="dark"]`. Toggle one attribute, everything updates.

```ts
// Toggle dark mode
document.documentElement.setAttribute("data-theme", "dark");
```

That's it. Every `var(--fd-text-primary)`, `var(--fd-surface-primary)`, and `var(--fd-border-minimal)` automatically resolves to its dark variant.

### What Changes in Dark Mode

- Surface colors invert (white → near-black)
- Text colors lighten (gray-80 → gray-20)
- Borders soften (less contrast, not more)
- Elevation shadows deepen
- Accent colors stay the same (blue-60 works in both modes)

The trick is that your components never reference raw colors. They only use semantic tokens. The token layer handles the mapping.
