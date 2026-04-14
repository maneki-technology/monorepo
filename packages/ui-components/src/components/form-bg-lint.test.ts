/**
 * Lint test: form control components must use FORM_INPUT_BG for background,
 * not SURFACE_PRIMARY. Prevents dark mode regression where inputs blend
 * into the page background.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const FORM_COMPONENTS = [
  "ui-input.styles.ts",
  "ui-textarea.styles.ts",
  "ui-select.styles.ts",
  "ui-search.styles.ts",
  "ui-file-upload.ts",
  "ui-dropzone.ts",
  "ui-input-group.ts",
  "ui-datetime-picker-input.styles.ts",
];

const COMPONENTS_DIR = resolve(__dirname, ".");

describe("form-bg-lint", () => {
  for (const file of FORM_COMPONENTS) {
    it(`${file} should not use SURFACE_PRIMARY for input background`, () => {
      const content = readFileSync(resolve(COMPONENTS_DIR, file), "utf-8");

      // Find all background-color lines with SURFACE_PRIMARY
      const lines = content.split("\n");
      const violations: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Match background or background-color using SURFACE_PRIMARY as fallback
        if (
          (line.includes("background-color:") || line.includes("background:")) &&
          line.includes("SURFACE_PRIMARY") &&
          // Only flag var(--ui-*-bg, ...) pattern — that's the input background
          // Bare ${SURFACE_PRIMARY} without var() is typically panels/containers
          line.includes("var(") &&
          !line.includes("panel") &&
          !line.includes("menu")
        ) {
          violations.push(`  Line ${i + 1}: ${line.trim()}`);
        }
      }

      expect(
        violations,
        `Form input background should use FORM_INPUT_BG, not SURFACE_PRIMARY.\n` +
          `Found ${violations.length} violation(s) in ${file}:\n${violations.join("\n")}`,
      ).toHaveLength(0);
    });
  }
});
