import { describe, expect, it } from "vitest";
import { darkSemanticTokens } from "./dark-theme.js";
import { herouiDarkSemanticTokens, herouiSemanticTokens } from "./heroui-theme.js";
import { resolveSemanticValue, semanticTokens, type SemanticValue } from "./semantic-tokens.js";

function luminance(value: SemanticValue): number {
  const hex = resolveSemanticValue(value);
  const channels = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function expectContrast(foreground: SemanticValue, background: SemanticValue, minimum: number): void {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  expect((values[0] + 0.05) / (values[1] + 0.05)).toBeGreaterThanOrEqual(minimum);
}

describe("semantic token contrast", () => {
  it("keeps Foundation text, icons, and input borders visible", () => {
    expectContrast(semanticTokens.text.tertiary, semanticTokens.surface.primary, 4.5);
    expectContrast(semanticTokens.icon.secondary, semanticTokens.surface.primary, 3);
    expectContrast(semanticTokens.form.inputBorder, semanticTokens.form.inputBackground, 3);
    expectContrast(darkSemanticTokens.form.inputBorder, darkSemanticTokens.form.inputBackground, 3);
  });

  it("keeps HeroUI light action and danger content readable", () => {
    const theme = herouiSemanticTokens;
    for (const fill of [
      theme.surface.action,
      theme.surface.actionHover,
      theme.surface.destructive,
      theme.surface.destructiveHover,
      theme.tag.bold,
      theme.statusSurface.informationBold,
      theme.statusSurface.errorBold,
    ]) {
      expectContrast(theme.text.light, fill, 4.5);
    }
    expectContrast(theme.text.destructive, theme.surface.primary, 4.5);
    expectContrast(theme.text.tertiary, theme.surface.primary, 4.5);
    expectContrast(theme.form.inputBorder, theme.form.inputBackground, 3);
  });

  it("keeps HeroUI dark text and field boundaries visible", () => {
    const theme = herouiDarkSemanticTokens;
    for (const fill of [
      theme.surface.action,
      theme.surface.actionHover,
      theme.surface.destructive,
      theme.surface.destructiveHover,
      theme.tag.bold,
    ]) {
      expectContrast(theme.text.light, fill, 4.5);
    }
    expectContrast(theme.text.tertiary, theme.surface.primary, 4.5);
    expectContrast(theme.form.inputBorder, theme.form.inputBackground, 3);
    expectContrast(theme.form.inputBorder, theme.surface.primary, 3);
  });
});
