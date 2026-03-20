/**
 * Minifies a CSS string by removing comments, collapsing whitespace,
 * and stripping unnecessary characters.
 *
 * Used by the minify-css-literals Vite plugin at build time.
 * Exported separately for unit testing.
 */
export function minifyCss(css: string): string {
  return css
    // Remove CSS comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    // Remove space around CSS punctuation (except } and ,)
    .replace(/\s*([{;>~+])\s*/g, "$1")
    // Remove space around property colons (color : red → color:red)
    // but not selector pseudo colons (} :host, .foo ::before)
    .replace(/(\w)\s*:(?!:)\s*/g, "$1:")
    // Remove space before } only (preserve space after for selector separation)
    .replace(/\s*}/g, "}")
    // Remove trailing semicolons before }
    .replace(/;}/g, "}")
    // Remove leading/trailing whitespace
    .trim();
}
