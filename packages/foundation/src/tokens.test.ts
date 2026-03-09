import { describe, it, expect } from "vitest";
import { colors } from "./colors.js";
import { colorsToCssProperties, colorVar, semanticToCssProperties, elevationToCssProperties, semanticVar, elevationVar, typographyToCssProperties, typeVar, spacingToCssProperties, spaceVar } from "./tokens.js";

describe("colors", () => {
  it("has 13 color families", () => {
    expect(Object.keys(colors)).toHaveLength(13);
  });

  it("each family has 10 steps (except gray with 11)", () => {
    for (const [family, steps] of Object.entries(colors)) {
      const count = Object.keys(steps).length;
      if (family === "gray") {
        expect(count).toBe(11);
      } else {
        expect(count).toBe(10);
      }
    }
  });

  it("all values are valid hex colors", () => {
    for (const steps of Object.values(colors)) {
      for (const hex of Object.values(steps)) {
        expect(hex).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });
});

describe("colorsToCssProperties", () => {
  it("generates CSS custom properties", () => {
    const css = colorsToCssProperties();
    expect(css).toContain("--fd-color-red-10: #fcf3f2;");
    expect(css).toContain("--fd-color-gray-110: #090f14;");
  });

  it("generates 131 properties", () => {
    const css = colorsToCssProperties();
    const lines = css.split("\n").filter(Boolean);
    expect(lines).toHaveLength(131);
  });
});

describe("colorVar", () => {
  it("returns a CSS var() reference", () => {
    expect(colorVar("blue", 60)).toBe("var(--fd-color-blue-60)");
  });
});

describe("semanticToCssProperties", () => {
  it("generates surface tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-surface-primary: #ffffff;");
    expect(css).toContain("--fd-surface-secondary: #f2f5f7;");
    expect(css).toContain("--fd-surface-overlay: rgba(28, 43, 54, 0.8);");
  });

  it("generates border tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-border-minimal: #dce3e8;");
    expect(css).toContain("--fd-border-contrast: #1c2b36;");
  });

  it("generates text tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-text-primary: #1c2b36;");
    expect(css).toContain("--fd-text-link: #186ade;");
    expect(css).toContain("--fd-text-destructive: #d91f11;");
  });

  it("generates icon tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-icon-action: #186ade;");
    expect(css).toContain("--fd-icon-contrast: #000000;");
  });

  it("generates global tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-global-brand: #7399c6;");
    expect(css).toContain("--fd-global-global-header: #11294d;");
  });

  it("generates status surface tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-status-surface-none-bold: #5b7282;");
    expect(css).toContain("--fd-status-surface-error-bold: #d91f11;");
    expect(css).toContain("--fd-status-surface-warning-subtle: #faf6cf;");
  });

  it("generates status text tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-status-text-none-bold-text: #ffffff;");
    expect(css).toContain("--fd-status-text-warning-bold-text: #090f14;");
  });

  it("generates status icon tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-status-icon-warning-subtle-icon: #e86427;");
  });

  it("generates status general tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-status-general-none: #5b7282;");
    expect(css).toContain("--fd-status-general-warning: #e86427;");
  });

  it("generates state disabled tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-state-disabled-border: rgba(91, 114, 130, 0.4);");
    expect(css).toContain("--fd-state-disabled-minimal: rgba(91, 114, 130, 0.2);");
    expect(css).toContain("--fd-state-disabled-text: rgba(91, 114, 130, 0.5);");
  });
  it("generates form tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-form-input-border: #9fb1bd;");
    expect(css).toContain("--fd-form-input-background: #ffffff;");
  });

  it("generates state hover tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-state-hover-border-moderate: #7a909e;");
  });

  it("generates state selected tokens", () => {
    const css = semanticToCssProperties();
    expect(css).toContain("--fd-state-selected-surface-bold: #186ade;");
  });
});

describe("elevationToCssProperties", () => {
  it("generates elevation box-shadow tokens", () => {
    const css = elevationToCssProperties();
    expect(css).toContain("--fd-elevation-00: none;");
    expect(css).toContain("--fd-elevation-01:");
    expect(css).toContain("--fd-elevation-08:");
  });

  it("generates 9 elevation levels", () => {
    const css = elevationToCssProperties();
    const lines = css.split("\n").filter(Boolean);
    expect(lines).toHaveLength(9);
  });
});

describe("semanticVar", () => {
  it("returns a CSS var() reference for semantic tokens", () => {
    expect(semanticVar("surface", "primary")).toBe("var(--fd-surface-primary)");
    expect(semanticVar("statusSurface", "noneBold")).toBe("var(--fd-status-surface-none-bold)");
  });
});

describe("elevationVar", () => {
  it("returns a CSS var() reference for elevation tokens", () => {
    expect(elevationVar("03")).toBe("var(--fd-elevation-03)");
  });
});

describe("typographyToCssProperties", () => {
  it("generates display tokens", () => {
    const css = typographyToCssProperties();
    expect(css).toContain("--fd-type-display-01-font-size: 78px;");
    expect(css).toContain("--fd-type-display-01-line-height: 104px;");
    expect(css).toContain("--fd-type-display-01-font-weight: 300;");
    expect(css).toContain("--fd-type-display-03-font-size: 48px;");
  });
  it("generates heading tokens", () => {
    const css = typographyToCssProperties();
    expect(css).toContain("--fd-type-heading-01-font-size: 40px;");
    expect(css).toContain("--fd-type-heading-01-font-weight: 500;");
    expect(css).toContain("--fd-type-heading-07-font-size: 12px;");
  });
  it("generates body tokens", () => {
    const css = typographyToCssProperties();
    expect(css).toContain("--fd-type-body-01-font-size: 16px;");
    expect(css).toContain("--fd-type-body-01-font-weight: 400;");
    expect(css).toContain("--fd-type-body-03-font-size: 12px;");
  });
  it("generates code tokens with Roboto Mono", () => {
    const css = typographyToCssProperties();
    expect(css).toContain("--fd-type-code-01-font-family: 'Roboto Mono', monospace;");
    expect(css).toContain("--fd-type-code-02-font-size: 12px;");
  });
  it("generates 4 properties per token", () => {
    const css = typographyToCssProperties();
    const lines = css.split("\n").filter(Boolean);
    // 3 display + 7 heading + 3 body + 2 ui + 1 caption + 1 badge + 2 code = 19 tokens x 4 props
    expect(lines).toHaveLength(19 * 4);
  });
});

describe("typeVar", () => {
  it("returns a CSS var() reference for typography tokens", () => {
    expect(typeVar("heading", "01", "font-size")).toBe("var(--fd-type-heading-01-font-size)");
    expect(typeVar("body", "02", "line-height")).toBe("var(--fd-type-body-02-line-height)");
  });
});

describe("spacingToCssProperties", () => {
  it("generates spacing tokens with --fd-space- prefix", () => {
    const css = spacingToCssProperties();
    expect(css).toContain("--fd-space-0: 0px;");
    expect(css).toContain("--fd-space-1px: 1px;");
    expect(css).toContain("--fd-space-0-25: 2px;");
    expect(css).toContain("--fd-space-0-5: 4px;");
    expect(css).toContain("--fd-space-0-75: 6px;");
    expect(css).toContain("--fd-space-1: 8px;");
    expect(css).toContain("--fd-space-1-5: 12px;");
    expect(css).toContain("--fd-space-2: 16px;");
    expect(css).toContain("--fd-space-2-5: 20px;");
    expect(css).toContain("--fd-space-7: 56px;");
    expect(css).toContain("--fd-space-8: 64px;");
    expect(css).toContain("--fd-space-9: 72px;");
    expect(css).toContain("--fd-space-10: 80px;");
  });
  it("generates 17 spacing properties", () => {
    const css = spacingToCssProperties();
    const lines = css.split("\n").filter(Boolean);
    expect(lines).toHaveLength(17);
  });
});
describe("spaceVar", () => {
  it("returns a CSS var() reference for spacing tokens", () => {
    expect(spaceVar("1")).toBe("var(--fd-space-1)");
    expect(spaceVar("2.5")).toBe("var(--fd-space-2-5)");
  });
});
