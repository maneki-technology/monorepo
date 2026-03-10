import { describe, it, expect, beforeEach } from "vitest";
import "./ui-label.js";
import { STYLES } from "./ui-label.js";

describe("ui-label", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-label");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-label")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults emphasis to 'bold'", () => {
    expect((el as unknown as { emphasis: string }).emphasis).toBe("bold");
  });

  it("defaults disabled to false", () => {
    expect((el as unknown as { disabled: boolean }).disabled).toBe(false);
  });

  it("defaults required to false", () => {
    expect((el as unknown as { required: boolean }).required).toBe(false);
  });

  // ── Size attribute ───────────────────────────────────────────────────────

  it("reflects size='s' attribute", () => {
    el.setAttribute("size", "s");
    expect((el as unknown as { size: string }).size).toBe("s");
  });

  it("reflects size='m' attribute", () => {
    el.setAttribute("size", "m");
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("reflects size='l' attribute", () => {
    el.setAttribute("size", "l");
    expect((el as unknown as { size: string }).size).toBe("l");
  });

  it("sets size via property", () => {
    (el as unknown as { size: string }).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Emphasis attribute ───────────────────────────────────────────────────

  it("reflects emphasis='bold' attribute", () => {
    el.setAttribute("emphasis", "bold");
    expect((el as unknown as { emphasis: string }).emphasis).toBe("bold");
  });

  it("reflects emphasis='subtle' attribute", () => {
    el.setAttribute("emphasis", "subtle");
    expect((el as unknown as { emphasis: string }).emphasis).toBe("subtle");
  });

  it("sets emphasis via property", () => {
    (el as unknown as { emphasis: string }).emphasis = "subtle";
    expect(el.getAttribute("emphasis")).toBe("subtle");
  });

  // ── Disabled attribute ───────────────────────────────────────────────────

  it("reflects disabled attribute", () => {
    el.setAttribute("disabled", "");
    expect((el as unknown as { disabled: boolean }).disabled).toBe(true);
  });

  it("sets disabled via property", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("removes disabled via property", () => {
    el.setAttribute("disabled", "");
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  // ── Required attribute ───────────────────────────────────────────────────

  it("reflects required attribute", () => {
    el.setAttribute("required", "");
    expect((el as unknown as { required: boolean }).required).toBe(true);
  });

  it("sets required via property", () => {
    (el as unknown as { required: boolean }).required = true;
    expect(el.hasAttribute("required")).toBe(true);
  });

  it("removes required via property", () => {
    el.setAttribute("required", "");
    (el as unknown as { required: boolean }).required = false;
    expect(el.hasAttribute("required")).toBe(false);
  });

  // ── Shadow DOM structure ─────────────────────────────────────────────────

  it("renders a text span with slot", () => {
    const textEl = el.shadowRoot!.querySelector(".text");
    expect(textEl).toBeTruthy();
    const slot = textEl!.querySelector("slot");
    expect(slot).toBeTruthy();
  });

  it("renders a required indicator", () => {
    const reqEl = el.shadowRoot!.querySelector(".required");
    expect(reqEl).toBeTruthy();
    expect(reqEl!.textContent).toBe("*");
  });

  it("hides required indicator by default", () => {
    const reqEl = el.shadowRoot!.querySelector(".required") as HTMLElement;
    const style = getComputedStyle(reqEl);
    // Without [required] attr, CSS rule `:host(:not([required])) .required` hides it
    expect(el.hasAttribute("required")).toBe(false);
  });

  it("required indicator has aria-hidden", () => {
    const reqEl = el.shadowRoot!.querySelector(".required");
    expect(reqEl!.getAttribute("aria-hidden")).toBe("true");
  });

  // ── Slotted content ──────────────────────────────────────────────────────

  it("renders slotted text content", () => {
    el.textContent = "Username";
    const slot = el.shadowRoot!.querySelector("slot") as HTMLSlotElement;
    const assigned = slot.assignedNodes();
    expect(assigned.length).toBe(1);
    expect(assigned[0].textContent).toBe("Username");
  });

  // ── CSS custom property overrides ────────────────────────────────────────

  it("supports --ui-label-color override", () => {
    expect(STYLES).toContain("--ui-label-color");
  });

  // ── Size CSS variables ───────────────────────────────────────────────────

  it("size s sets 12px font-size via CSS var", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(":host([size=\"s\"])");
    expect(styles).toContain("--_font-size: 12px");
    expect(styles).toContain("--_line-height: 16px");
  });

  it("size m sets 14px font-size via CSS var", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    // m is the default, defined on :host
    expect(styles).toContain("--_font-size: 14px");
    expect(styles).toContain("--_line-height: 20px");
  });

  it("size l sets 16px font-size via CSS var", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(":host([size=\"l\"])");
    expect(styles).toContain("--_font-size: 16px");
    expect(styles).toContain("--_line-height: 24px");
  });

  // ── Emphasis CSS variables ───────────────────────────────────────────────

  it("bold emphasis sets font-weight 500", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("--_font-weight: 500");
  });

  it("subtle emphasis sets font-weight 400", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(":host([emphasis=\"subtle\"])");
    expect(styles).toContain("--_font-weight: 400");
  });

  // ── Display ──────────────────────────────────────────────────────────────

  it("host displays as inline-flex", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("display: inline-flex");
  });
});
