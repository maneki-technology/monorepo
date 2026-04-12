# ADR-024: Blog Micro-Interactions + Signature Animation

**Status:** Accepted
**Date:** 2026-04

## Context

The blog looked like a plain developer template. Clean, functional, but lifeless. Adding a photography section raised the bar — a site showcasing visual work needs to feel considered and alive. The goal was personality without gimmick: animations that reinforce the content direction rather than distract from it.

## Decision

Four interlocking decisions give the blog its visual character:

1. Blur-to-sharp as the primary motion language
2. FLIP shared element transition for the signature
3. Homeland signature font, self-hosted and subsetted
4. Terracotta accent color (`--blog-accent`)

### Blur-to-Sharp Animations

Route transitions and scroll-reveal use a blur-to-sharp entrance instead of the generic fade-up. The effect ties directly into the photography direction — images resolving into focus is a natural metaphor for the content.

```css
@keyframes blur-to-sharp {
  from {
    opacity: 0;
    filter: blur(6px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}
```

Card hover adds a lift + shadow to reinforce interactivity. Nav links animate an underline that grows from the direction of cursor entry (directional underline). Both respect `prefers-reduced-motion`.

### FLIP Signature Animation

The hero "Kien Nguyen" heading animates into the header site-name when the user leaves the home page, and reverses on return. This is a shared element transition implemented with the FLIP technique (First, Last, Invert, Play).

The key implementation detail: font-size interpolation rather than `transform: scale`. Scaling rasterizes text at the source size and blurs it during the animation. Interpolating font-size keeps the text crisp at every frame because the browser re-renders glyphs at the actual size.

```ts
// Invert: compute the transform that maps Last → First
const dx = first.left - last.left;
const dy = first.top - last.top;
const dScale = first.width / last.width;

// Play: animate from inverted position back to natural
element.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${dScale})` }, { transform: "none" }], {
  duration: 400,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
});
```

Font-size is interpolated separately via a CSS custom property transition so the glyph rendering stays sharp throughout.

16 Playwright e2e tests cover:

- Forward transition (home → other page)
- Reverse transition (other page → home)
- `prefers-reduced-motion` (animation skipped, element still moves)
- Direct visits (no animation, correct final state)

### Homeland Signature Font

"Kien Nguyen" uses a self-hosted handwriting font (Homeland) subsetted to exactly the 9 characters needed: K, i, e, n, space, N, g, u, y. The subset woff2 is 4.6KB. It's preloaded in the `<head>` to prevent FOUT on the hero.

```html
<link rel="preload" href="/fonts/homeland-subset.woff2" as="font" type="font/woff2" crossorigin />
```

The same font renders both the hero heading and the header site-name, which is what makes the FLIP transition feel like a genuine shared element rather than a cross-fade.

### SVG Handwriting Underline

The hero signature has an SVG underline that draws in via `clip-path` animation on page load. A hand-drawn SVG path is clipped from left to right over ~600ms, giving the impression of the signature being written.

### Terracotta Accent Color

`--blog-accent` is a warm terracotta used for post card hover states, nav underlines, and post title hover. It's distinct from the foundation design tokens (which are neutral/blue-toned) and lives only in the blog app.

```css
:root {
  --blog-accent: #c2785c;
}
[data-theme="dark"] {
  --blog-accent: #d4956e;
}
```

The dark value is slightly lighter and more saturated to maintain contrast on dark backgrounds.

## Consequences

- All animations respect `prefers-reduced-motion: reduce` — motion is skipped, not just slowed
- FLIP requires both hero and header elements to exist in the DOM simultaneously during transition; the header is always rendered (just hidden on home) to make this work
- Font subsetting is a one-time manual step; adding characters to the signature would require re-subsetting
- `--blog-accent` is intentionally not in `@maneki/foundation` — it's blog-specific personality, not a system token
- 16 Playwright tests add ~8s to the blog e2e suite
