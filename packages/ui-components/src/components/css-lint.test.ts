/**
 * Lint test: detect duplicate CSS properties in component style template literals.
 *
 * Catches a common AI editing bug where a tokenized line is inserted but the
 * original hardcoded line below it is left intact, e.g.:
 *
 *   height: ${SP_4};
 *   height: 32px;        ← duplicate, overrides the token
 *
 * This test scans all `STYLES` / `*_STYLES` template literals in component
 * files and flags consecutive lines with the same CSS property name.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const COMPONENTS_DIR = join(dirname(fileURLToPath(import.meta.url)), ".");

function findDuplicateCssProperties(css: string): { line: number; property: string; first: string; second: string }[] {
  const lines = css.split("\n");
  const duplicates: { line: number; property: string; first: string; second: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const prev = lines[i - 1].trim();
    const curr = lines[i].trim();

    // Skip empty lines, comments, selectors, braces
    if (!prev || !curr) continue;
    if (prev.startsWith("/*") || prev.startsWith("*") || prev.startsWith("//")) continue;
    if (curr.startsWith("/*") || curr.startsWith("*") || curr.startsWith("//")) continue;
    if (prev.includes("{") || prev.includes("}")) continue;
    if (curr.includes("{") || curr.includes("}")) continue;

    // Extract CSS property name (everything before the colon)
    const prevProp = prev.split(":")[0]?.trim();
    const currProp = curr.split(":")[0]?.trim();

    if (!prevProp || !currProp) continue;

    // Skip CSS custom properties (--var declarations) — they can legitimately repeat
    if (prevProp.startsWith("--") || currProp.startsWith("--")) continue;

    // Skip if either line doesn't end with semicolon (not a property declaration)
    if (!prev.endsWith(";") || !curr.endsWith(";")) continue;

    if (prevProp === currProp) {
      duplicates.push({
        line: i + 1,
        property: currProp,
        first: prev,
        second: curr,
      });
    }
  }

  return duplicates;
}

describe("CSS duplicate property lint", () => {
  const files = readdirSync(COMPONENTS_DIR)
    .filter((f: string) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !f.endsWith(".stories.ts"));

  for (const file of files) {
    it(`${file} has no duplicate consecutive CSS properties`, () => {
      const content = readFileSync(join(COMPONENTS_DIR, file), "utf-8");

      // Extract template literal content from STYLES / *_STYLES constants
      const styleMatches = content.matchAll(/(?:const\s+\w*STYLES?\w*\s*=\s*\/\*\s*css\s*\*\/\s*`|const\s+STYLES\s*=\s*`)([\s\S]*?)`/g);

      for (const match of styleMatches) {
        const css = match[1];
        const duplicates = findDuplicateCssProperties(css);

        if (duplicates.length > 0) {
          const messages = duplicates.map(
            (d) => `  Line ~${d.line}: "${d.property}" declared twice:\n    ${d.first}\n    ${d.second}`,
          );
          expect.fail(
            `${file} has ${duplicates.length} duplicate CSS property(ies):\n${messages.join("\n")}`,
          );
        }
      }
    });
  }
});
