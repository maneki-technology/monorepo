import { colors, type ColorFamily } from "./colors.js";
import {
  semanticTokens,
  elevation,
  shadow,
  resolveSemanticValue,
  type SemanticValue,
  type SemanticTokenGroup,
} from "./semantic-tokens.js";
import { darkSemanticTokens, darkElevation, darkShadow } from "./dark-theme.js";

/**
 * Generates CSS custom properties string from the color tokens.
 *
 * Output format: `--fd-color-{family}-{step}: {hex};`
 */
export function colorsToCssProperties(): string {
  const lines: string[] = [];
  for (const [family, steps] of Object.entries(colors)) {
    for (const [step, hex] of Object.entries(steps)) {
      lines.push(`--fd-color-${family}-${step}: ${hex};`);
    }
  }
  return lines.join("\n");
}

/**
 * Injects foundation color tokens as CSS custom properties on :root.
 * Call once at app startup.
 */
export function injectColorTokens(): void {
  if (typeof document === "undefined") return;

  const id = "maneki-foundation-colors";
  if (document.getElementById(id)) return;

  const style = document.createElement("style");
  style.id = id;
  style.textContent = `:root {\n${colorsToCssProperties()}\n}`;
  document.head.appendChild(style);
}

/**
 * Returns a CSS `var()` reference for a given color token.
 */
export function colorVar<F extends ColorFamily>(
  family: F,
  step: keyof (typeof colors)[F],
): string {
  return `var(--fd-color-${family}-${String(step)})`;
}

/** Convert a camelCase key to kebab-case. */
function toKebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Generates CSS custom properties for all semantic color tokens.
 *
 * Output format: `--fd-{group}-{name}: {resolved-color};`
 */
export function semanticToCssProperties(): string {
  const lines: string[] = [];

  for (const [group, tokens] of Object.entries(semanticTokens)) {
    const prefix = `--fd-${toKebab(group)}`;
    for (const [name, value] of Object.entries(tokens)) {
      lines.push(
        `${prefix}-${toKebab(name)}: ${resolveSemanticValue(value as SemanticValue)};`,
      );
    }
  }

  return lines.join("\n");
}

/**
 * Generates CSS custom properties for elevation tokens (box-shadow).
 *
 * Output format: `--fd-elevation-{level}: {box-shadow};`
 */
export function elevationToCssProperties(): string {
  const lines: string[] = [];
  for (const [level, token] of Object.entries(elevation)) {
    lines.push(`--fd-elevation-${level}: ${token.boxShadow};`);
  }
  return lines.join("\n");
}

/**
 * Generates CSS custom properties for dark theme semantic token overrides.
 */
export function darkSemanticToCssProperties(): string {
  const lines: string[] = [];
  for (const [group, tokens] of Object.entries(darkSemanticTokens)) {
    const prefix = `--fd-${toKebab(group)}`;
    for (const [name, value] of Object.entries(tokens)) {
      lines.push(
        `${prefix}-${toKebab(name)}: ${resolveSemanticValue(value as SemanticValue)};`,
      );
    }
  }
  return lines.join("\n");
}

/**
 * Generates CSS custom properties for dark theme elevation overrides.
 */
export function darkElevationToCssProperties(): string {
  const lines: string[] = [];
  for (const [level, token] of Object.entries(darkElevation)) {
    lines.push(`--fd-elevation-${level}: ${token.boxShadow};`);
  }
  return lines.join("\n");
}

/**
 * Generates CSS custom properties for shadow tokens (box-shadow).
 *
 * Output format: `--fd-shadow-{name}: {box-shadow};`
 */
export function shadowToCssProperties(): string {
  const lines: string[] = [];
  for (const [name, token] of Object.entries(shadow)) {
    lines.push(`--fd-shadow-${toKebab(name)}: ${token.boxShadow};`);
  }
  return lines.join("\n");
}

/**
 * Generates CSS custom properties for dark theme shadow overrides.
 */
export function darkShadowToCssProperties(): string {
  const lines: string[] = [];
  for (const [name, token] of Object.entries(darkShadow)) {
    lines.push(`--fd-shadow-${toKebab(name)}: ${token.boxShadow};`);
  }
  return lines.join("\n");
}

/**
 * Injects all foundation tokens (palette + semantic + elevation) on :root.
 * Call once at app startup.
 */
export function injectAllTokens(): void {
  if (typeof document === "undefined") return;

  const css = [
    colorsToCssProperties(),
    semanticToCssProperties(),
    elevationToCssProperties(),
    typographyToCssProperties(),
    spacingToCssProperties(),
    radiusToCssProperties(),
    borderWidthToCssProperties(),
    shadowToCssProperties(),
  ].join("\n");
  const darkCss = [
    darkSemanticToCssProperties(),
    darkElevationToCssProperties(),
    darkShadowToCssProperties(),
  ].join("\n");

  const id = "maneki-foundation-all";
  const existing = document.getElementById(id);
  const cssContent = `:root {\n${css}\n}\n\n[data-theme="dark"] {\n${darkCss}\n}`;

  // In dev mode, replace existing styles so HMR works. In production, skip if already injected.
  if (existing) {
    if ((import.meta as any).hot) {
      existing.textContent = cssContent;
    }
    return;
  }

  const style = document.createElement("style");
  style.id = id;
  style.textContent = cssContent;
  document.head.appendChild(style);
}

// HMR: re-inject tokens when any token source file changes
if ((import.meta as any).hot) {
  (import.meta as any).hot.accept(
    [
      "./colors.js",
      "./semantic-tokens.js",
      "./dark-theme.js",
      "./typography.js",
      "./spacing.js",
      "./shape.js",
    ],
    () => {
      // Force re-injection with updated values
      const el = document.getElementById("maneki-foundation-all");
      if (el) el.remove();
      injectAllTokens();
    },
  );
}

/**
 * Valid token names for a given semantic group.
 */
type SemanticTokenName<G extends SemanticTokenGroup> =
  string & keyof (typeof semanticTokens)[G];

/**
 * Returns a CSS `var()` reference for a semantic token.
 */
export function semanticVar<G extends SemanticTokenGroup>(
  group: G,
  name: SemanticTokenName<G>,
): string {
  return `var(--fd-${toKebab(group)}-${toKebab(name)})`;
}

/**
 * Returns a CSS `var()` reference for an elevation token.
 */
export function elevationVar(level: keyof typeof elevation): string {
  return `var(--fd-elevation-${level})`;
}

/**
 * Returns a CSS `var()` reference for a shadow token.
 */
export function shadowVar(name: keyof typeof shadow): string {
  return `var(--fd-shadow-${toKebab(name)})`;
}

// ---------------------------------------------------------------------------
// Typography → CSS custom properties
// ---------------------------------------------------------------------------

import {
  typography,
  type TypographyGroup,
  type TypeToken,
} from "./typography.js";

/**
 * Generates CSS custom properties for all typography tokens.
 *
 * For each token generates:
 *   --fd-type-{group}-{key}-font-family
 *   --fd-type-{group}-{key}-font-size
 *   --fd-type-{group}-{key}-line-height
 *   --fd-type-{group}-{key}-font-weight
 */
export function typographyToCssProperties(): string {
  const lines: string[] = [];
  for (const [group, tokens] of Object.entries(typography)) {
    const prefix = `--fd-type-${toKebab(group)}`;
    for (const [key, token] of Object.entries(tokens)) {
      const t = token as TypeToken;
      lines.push(`${prefix}-${key}-font-family: ${t.fontFamily};`);
      lines.push(`${prefix}-${key}-font-size: ${t.fontSize}px;`);
      lines.push(`${prefix}-${key}-line-height: ${t.lineHeight}px;`);
      lines.push(`${prefix}-${key}-font-weight: ${t.fontWeight};`);
    }
  }
  return lines.join("\n");
}

/**
 * Valid token keys for a given typography group.
 */
type TypographyKey<G extends TypographyGroup> =
  string & keyof (typeof typography)[G];

/**
 * Returns a CSS `var()` reference for a typography token property.
 */
export function typeVar<G extends TypographyGroup>(
  group: G,
  key: TypographyKey<G>,
  prop: "font-family" | "font-size" | "line-height" | "font-weight",
): string {
  return `var(--fd-type-${toKebab(group)}-${key}-${prop})`;
}

/**
 * Returns a CSS block with font-family, font-size, line-height, and font-weight
 * properties as `var()` references for a typography token.
 *
 * Usage in template literals:
 * ```ts
 * ${typeBlock("body", "02")}
 * // → font-family: var(--fd-type-body-02-font-family);
 * //   font-size: var(--fd-type-body-02-font-size);
 * //   line-height: var(--fd-type-body-02-line-height);
 * //   font-weight: var(--fd-type-body-02-font-weight);
 * ```
 */
export function typeBlock<G extends TypographyGroup>(
  group: G,
  key: TypographyKey<G>,
): string {
  return [
    `font-family: ${typeVar(group, key, "font-family")};`,
    `font-size: ${typeVar(group, key, "font-size")};`,
    `line-height: ${typeVar(group, key, "line-height")};`,
    `font-weight: ${typeVar(group, key, "font-weight")};`,
  ].join("\n    ");
}

// ---------------------------------------------------------------------------
// Spacing → CSS custom properties
// ---------------------------------------------------------------------------

import { spacing, type SpacingStep } from "./spacing.js";

/** Sanitize spacing step for CSS property name (dots → hyphens). */
function spaceKey(step: string): string {
  return step.replace(/\./g, "-");
}

/**
 * Generates CSS custom properties for all spacing tokens.
 *
 * Output format: `--fd-space-{step}: {value}px;`
 */
export function spacingToCssProperties(): string {
  const lines: string[] = [];
  for (const [step, value] of Object.entries(spacing)) {
    lines.push(`--fd-space-${spaceKey(step)}: ${value}px;`);
  }
  return lines.join("\n");
}

/**
 * Returns a CSS `var()` reference for a spacing token.
 */
export function spaceVar(step: SpacingStep): string {
  return `var(--fd-space-${spaceKey(String(step))})`;
}

// ─── Shape tokens ────────────────────────────────────────────────────────────

import { radius, type RadiusStep, borderWidth, type BorderWidthStep } from "./shape.js";

/** Generates CSS custom properties for border-radius tokens. */
export function radiusToCssProperties(): string {
  return Object.entries(radius)
    .map(([step, value]) => `--fd-radius-${step}: ${value};`)
    .join("\n");
}

/** Generates CSS custom properties for border-width tokens. */
export function borderWidthToCssProperties(): string {
  return Object.entries(borderWidth)
    .map(([step, value]) => `--fd-border-width-${step}: ${value};`)
    .join("\n");
}

/**
 * Returns a CSS `var()` reference for a border-radius token.
 */
export function radiusVar(step: RadiusStep): string {
  return `var(--fd-radius-${step})`;
}

/**
 * Returns a CSS `var()` reference for a border-width token.
 */
export function borderWidthVar(step: BorderWidthStep): string {
  return `var(--fd-border-width-${step})`;
}
