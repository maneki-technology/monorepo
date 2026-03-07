import { colors, type ColorFamily } from "./colors.js";

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

// ---------------------------------------------------------------------------
// Semantic tokens → CSS custom properties
// ---------------------------------------------------------------------------

import {
  semanticTokens,
  elevation,
  resolveSemanticValue,
  type SemanticValue,
  type SemanticTokenGroup,
} from "./semantic-tokens.js";

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
 * Injects all foundation tokens (palette + semantic + elevation) on :root.
 * Call once at app startup.
 */
export function injectAllTokens(): void {
  if (typeof document === "undefined") return;

  const id = "maneki-foundation-all";
  if (document.getElementById(id)) return;

  const css = [
    colorsToCssProperties(),
    semanticToCssProperties(),
    elevationToCssProperties(),
    typographyToCssProperties(),
    spacingToCssProperties(),
  ].join("\n");

  const style = document.createElement("style");
  style.id = id;
  style.textContent = `:root {\n${css}\n}`;
  document.head.appendChild(style);
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
