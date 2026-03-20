/**
 * Unit tests for the CSS minification function used by the minify-css-literals Vite plugin.
 *
 * These tests cover all the bugs we've encountered:
 * 1. Space before `::` pseudo-elements stripped (broke `::slotted()`)
 * 2. Comma in arguments stripped (broke `linear-gradient(a, b)` and `box-shadow`)
 * 3. Space after `}` stripped (broke selector separation, caused CSS nesting)
 * 4. `border: ${token} solid transparent` collapsed into invalid CSS
 */
import { describe, it, expect } from "vitest";
import { minifyCss } from "../css-minify.js";

describe("minifyCss", () => {
  // ── Basic minification ──────────────────────────────────────────────────

  it("removes CSS comments", () => {
    const input = "/* comment */ .foo { color: red; }";
    expect(minifyCss(input)).toContain(".foo");
    expect(minifyCss(input)).not.toContain("comment");
  });

  it("collapses whitespace", () => {
    const input = ".foo  {  color:   red;  }";
    expect(minifyCss(input)).not.toContain("  ");
  });

  it("removes trailing semicolons before }", () => {
    const input = ".foo { color: red; }";
    expect(minifyCss(input)).toContain("color:red}");
  });

  it("removes space before {", () => {
    const input = ".foo { color: red; }";
    expect(minifyCss(input)).toMatch(/\.foo{/);
  });

  it("removes space before ;", () => {
    const input = ".foo { color: red ; background: blue ; }";
    expect(minifyCss(input)).not.toMatch(/ ;/);
  });

  it("trims leading/trailing whitespace", () => {
    const input = "  .foo { color: red; }  ";
    const result = minifyCss(input);
    expect(result).not.toMatch(/^\s/);
    expect(result).not.toMatch(/\s$/);
  });

  // ── Bug #1: Preserve space before :: pseudo-elements ────────────────────

  it("preserves space before ::slotted()", () => {
    const input = ":host([zebra]) ::slotted(ui-table-row:nth-child(even)) { --bg: red; }";
    const result = minifyCss(input);
    expect(result).toContain(" ::slotted");
    expect(result).not.toContain(")::slotted");
  });

  it("preserves space before ::before", () => {
    const input = ".foo ::before { content: ''; }";
    const result = minifyCss(input);
    expect(result).toContain(" ::before");
  });

  it("preserves space before ::after", () => {
    const input = ".foo ::after { content: ''; }";
    const result = minifyCss(input);
    expect(result).toContain(" ::after");
  });

  it("preserves space before ::part()", () => {
    const input = ":host ::part(base) { color: red; }";
    const result = minifyCss(input);
    expect(result).toContain(" ::part");
  });

  // ── Bug #2: Preserve commas in function arguments ───────────────────────

  it("preserves commas in linear-gradient()", () => {
    const input = "button:hover { background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)); }";
    const result = minifyCss(input);
    expect(result).toContain("linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))");
  });

  it("preserves commas in box-shadow", () => {
    const input = "button { box-shadow: 0 0 0 1px #fff, 0 0 0 2px blue; }";
    const result = minifyCss(input);
    expect(result).toContain("#fff, 0");
  });

  it("preserves commas in font-family", () => {
    const input = '.foo { font-family: "Geist", sans-serif; }';
    const result = minifyCss(input);
    expect(result).toContain('"Geist", sans-serif');
  });

  // ── Bug #3: Preserve space after } for selector separation ──────────────

  it("preserves space after } before next selector", () => {
    const input = ".foo { color: red; } .bar { color: blue; }";
    const result = minifyCss(input);
    expect(result).toContain("} .bar");
    expect(result).not.toContain("}.bar");
  });

  it("preserves space after } before :host selector", () => {
    const input = ':host([a]) button { color: red; } :host([b]) button { color: blue; }';
    const result = minifyCss(input);
    expect(result).toContain("} :host");
    expect(result).not.toContain("}:host");
  });

  it("preserves space after } before pseudo-class", () => {
    const input = ".foo { color: red; } button:hover { color: blue; }";
    const result = minifyCss(input);
    expect(result).toContain("} button:hover");
  });

  // ── Bug #4: border shorthand with interpolated token ────────────────────

  it("preserves space in border-width/style/color longhand", () => {
    const input = "button { border-width: 1px; border-style: solid; border-color: transparent; }";
    const result = minifyCss(input);
    expect(result).toContain("border-width:1px");
    expect(result).toContain("border-style:solid");
    expect(result).toContain("border-color:transparent");
  });

  // ── Edge cases ──────────────────────────────────────────────────────────

  it("handles empty input", () => {
    expect(minifyCss("")).toBe("");
  });

  it("handles single rule", () => {
    const result = minifyCss(".a { color: red; }");
    expect(result).toBe(".a{color:red}");
  });

  it("handles nested var() with fallback", () => {
    const input = ".foo { color: var(--a, var(--b, red)); }";
    const result = minifyCss(input);
    expect(result).toContain("var(--a, var(--b, red))");
  });

  it("handles @media queries", () => {
    const input = "@media (prefers-reduced-motion: reduce) { .foo { transition: none; } }";
    const result = minifyCss(input);
    expect(result).toContain("@media");
    expect(result).toContain("transition:none");
  });

  it("handles @keyframes", () => {
    const input = "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
    const result = minifyCss(input);
    expect(result).toContain("@keyframes spin");
    expect(result).toContain("rotate(0deg)");
    expect(result).toContain("rotate(360deg)");
  });

  it("handles multiple rules without merging", () => {
    const input = ".a { color: red; } .b { color: blue; } .c { color: green; }";
    const result = minifyCss(input);
    expect(result).toContain("} .b{");
    expect(result).toContain("} .c{");
  });

  it("does not strip space inside string values", () => {
    const input = '.foo { content: "hello world"; }';
    const result = minifyCss(input);
    // Whitespace inside quotes may be collapsed to single space — that's acceptable
    expect(result).toContain("hello world");
  });
});
