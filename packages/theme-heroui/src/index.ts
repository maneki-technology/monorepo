/**
 * @maneki/theme-heroui — HeroUI v3-inspired theme for the Maneki design system.
 *
 * Usage:
 * ```ts
 * import { injectAllTokens, injectTheme } from "@maneki/foundation";
 * import { heroTheme, heroThemeDark } from "@maneki/theme-heroui";
 *
 * injectAllTokens();
 * injectTheme(heroTheme, heroThemeDark);
 * ```
 */

import { resolveSemanticValue, type ManekiTheme, type SemanticValue } from "@maneki/foundation";
import {
  heroSemanticTokens,
  heroElevation,
  heroRadius,
  heroBorderWidth,
} from "./theme.js";

function toKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function generateSemanticCss(tokens: Record<string, Record<string, SemanticValue>>): string {
  const lines: string[] = [];
  for (const [group, groupTokens] of Object.entries(tokens)) {
    const prefix = `--fd-${toKebab(group)}`;
    for (const [name, value] of Object.entries(groupTokens)) {
      lines.push(`${prefix}-${toKebab(name)}: ${resolveSemanticValue(value)};`);
    }
  }
  return lines.join("\n");
}

function generateElevationCss(elevation: Record<string, { boxShadow: string }>): string {
  return Object.entries(elevation)
    .map(([level, token]) => `--fd-elevation-${level}: ${token.boxShadow};`)
    .join("\n");
}

function generateShapeCss(
  radius: Record<string, string>,
  borderWidth: Record<string, string>,
): string {
  const lines: string[] = [];
  for (const [step, value] of Object.entries(radius)) {
    lines.push(`--fd-radius-${step}: ${value};`);
  }
  for (const [step, value] of Object.entries(borderWidth)) {
    lines.push(`--fd-border-width-${step}: ${value};`);
  }
  return lines.join("\n");
}

const heroCss = [
  generateSemanticCss(heroSemanticTokens as unknown as Record<string, Record<string, SemanticValue>>),
  generateElevationCss(heroElevation),
  generateShapeCss(heroRadius, heroBorderWidth),
  // Component-level overrides
  "--ui-btn-radius: 9999px;",
  "--ui-card-radius: 16px;",
  "--ui-alert-radius: 24px;",
].join("\n");

/** HeroUI v3 light theme. Apply via `injectTheme(heroTheme)`. */
export const heroTheme: ManekiTheme = {
  selector: '[data-theme="heroui"]',
  css: heroCss,
};

/** HeroUI v3 dark theme. Apply via `injectTheme(heroThemeDark)`. */
export const heroThemeDark: ManekiTheme = {
  selector: '[data-theme="heroui-dark"]',
  css: heroCss, // Same overrides — dark base comes from foundation's dark theme
};
