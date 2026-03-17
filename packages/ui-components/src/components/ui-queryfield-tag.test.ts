import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-queryfield-tag.js";
import type { QueryfieldTagSize } from "./ui-queryfield-tag.js";
import { TAG_STYLES } from "./ui-queryfield-tag.styles.js";

describe("ui-queryfield-tag", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-queryfield-tag");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-queryfield-tag")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  it("exports TAG_STYLES string", () => {
    expect(typeof TAG_STYLES).toBe("string");
    expect(TAG_STYLES.length).toBeGreaterThan(0);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .category element", () => {
    const cat = el.shadowRoot!.querySelector(".category");
    expect(cat).not.toBeNull();
  });

  it("renders a .value element", () => {
    const val = el.shadowRoot!.querySelector(".value");
    expect(val).not.toBeNull();
  });

  it("renders a .value-text element", () => {
    const vt = el.shadowRoot!.querySelector(".value-text");
    expect(vt).not.toBeNull();
  });

  it("renders a dismiss button", () => {
    const btn = el.shadowRoot!.querySelector("button.dismiss");
    expect(btn).not.toBeNull();
  });

  it("dismiss button has aria-label", () => {
    const btn = el.shadowRoot!.querySelector("button.dismiss") as HTMLButtonElement;
    expect(btn.getAttribute("aria-label")).toBe("Remove filter");
  });

  it("dismiss button has type=button", () => {
    const btn = el.shadowRoot!.querySelector("button.dismiss") as HTMLButtonElement;
    expect(btn.type).toBe("button");
  });

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  // ── observedAttributes ─────────────────────────────────────────────────────

  it("observes size, category, expression", () => {
    const Ctor = customElements.get("ui-queryfield-tag") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual(["size", "category", "expression", "filter-name", "operator", "values"]);
  });

  // ── Attributes: size ──────────────────────────────────────────────────────

  it("reflects size=s as attribute", () => {
    el.setAttribute("size", "s");
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects size=m as attribute", () => {
    el.setAttribute("size", "m");
    expect(el.getAttribute("size")).toBe("m");
  });

  it("reflects size=l as attribute", () => {
    el.setAttribute("size", "l");
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Attributes: category ──────────────────────────────────────────────────

  it("renders category text from attribute", () => {
    el.setAttribute("category", "City");
    const cat = el.shadowRoot!.querySelector(".category");
    expect(cat!.textContent).toBe("City");
  });

  it("clears category text when attribute removed", () => {
    el.setAttribute("category", "City");
    el.removeAttribute("category");
    const cat = el.shadowRoot!.querySelector(".category");
    expect(cat!.textContent).toBe("");
  });

  // ── Attributes: expression ────────────────────────────────────────────────

  it("renders expression text from attribute", () => {
    el.setAttribute("expression", "equals London");
    const vt = el.shadowRoot!.querySelector(".value-text");
    expect(vt!.textContent!.trim()).toBe("equals London");
  });

  it("clears expression when attribute removed", () => {
    el.setAttribute("expression", "equals London");
    el.removeAttribute("expression");
    const vt = el.shadowRoot!.querySelector(".value-text");
    expect(vt!.textContent!.trim()).toBe("");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns current attribute", () => {
    el.setAttribute("size", "l");
    expect((el as unknown as { size: QueryfieldTagSize }).size).toBe("l");
  });

  it("size setter updates attribute", () => {
    (el as unknown as { size: QueryfieldTagSize }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("category getter returns current attribute", () => {
    el.setAttribute("category", "Status");
    expect((el as unknown as { category: string }).category).toBe("Status");
  });

  it("category setter updates attribute", () => {
    (el as unknown as { category: string }).category = "Region";
    expect(el.getAttribute("category")).toBe("Region");
  });

  it("expression getter returns current attribute", () => {
    el.setAttribute("expression", "contains foo");
    expect((el as unknown as { expression: string }).expression).toBe(
      "contains foo",
    );
  });

  it("expression setter updates attribute", () => {
    (el as unknown as { expression: string }).expression = "not bar";
    expect(el.getAttribute("expression")).toBe("not bar");
  });

  it("category getter defaults to empty string", () => {
    expect((el as unknown as { category: string }).category).toBe("");
  });

  it("expression getter defaults to empty string", () => {
    expect((el as unknown as { expression: string }).expression).toBe("");
  });

  // ── Expression parsing ────────────────────────────────────────────────────

  it("parses operator 'equals' with .operator class", () => {
    el.setAttribute("expression", "equals London");
    const ops = el.shadowRoot!.querySelectorAll(".operator");
    expect(ops.length).toBe(1);
    expect(ops[0].textContent!.trim()).toBe("equals");
  });

  it("parses operator 'contains' with .operator class", () => {
    el.setAttribute("expression", "contains test");
    const ops = el.shadowRoot!.querySelectorAll(".operator");
    expect(ops.length).toBe(1);
    expect(ops[0].textContent!.trim()).toBe("contains");
  });

  it("parses multi-word operator 'starts with'", () => {
    el.setAttribute("expression", "starts with foo");
    const ops = el.shadowRoot!.querySelectorAll(".operator");
    expect(ops.length).toBe(1);
    expect(ops[0].textContent!.trim()).toBe("starts with");
  });

  it("parses multi-word operator 'ends with'", () => {
    el.setAttribute("expression", "ends with bar");
    const ops = el.shadowRoot!.querySelectorAll(".operator");
    expect(ops.length).toBe(1);
    expect(ops[0].textContent!.trim()).toBe("ends with");
  });

  it("parses operator 'not'", () => {
    el.setAttribute("expression", "not baz");
    const ops = el.shadowRoot!.querySelectorAll(".operator");
    expect(ops.length).toBe(1);
    expect(ops[0].textContent!.trim()).toBe("not");
  });

  it("parses values with .filter-value class", () => {
    el.setAttribute("expression", "equals London");
    const vals = el.shadowRoot!.querySelectorAll(".filter-value");
    expect(vals.length).toBe(1);
    expect(vals[0].textContent!.trim()).toBe("London");
  });

  it("parses conjunction 'or' with .conjunction class", () => {
    el.setAttribute("expression", "equals London or Bengaluru");
    const conj = el.shadowRoot!.querySelectorAll(".conjunction");
    expect(conj.length).toBe(1);
    expect(conj[0].textContent!.trim()).toBe("or");
  });

  it("parses conjunction 'and' with .conjunction class", () => {
    el.setAttribute("expression", "equals A and B");
    const conj = el.shadowRoot!.querySelectorAll(".conjunction");
    expect(conj.length).toBe(1);
    expect(conj[0].textContent!.trim()).toBe("and");
  });

  it("parses complex expression with operator, values, and conjunction", () => {
    el.setAttribute("expression", "equals London or Bengaluru");
    const vt = el.shadowRoot!.querySelector(".value-text")!;
    const children = vt.children;
    expect(children.length).toBe(4);
    expect(children[0].className).toBe("operator");
    expect(children[1].className).toBe("filter-value");
    expect(children[2].className).toBe("conjunction");
    expect(children[3].className).toBe("filter-value");
  });

  it("re-renders expression when attribute changes", () => {
    el.setAttribute("expression", "equals A");
    expect(el.shadowRoot!.querySelectorAll(".filter-value").length).toBe(1);
    el.setAttribute("expression", "equals A or B");
    expect(el.shadowRoot!.querySelectorAll(".filter-value").length).toBe(2);
  });

  // ── Dismiss event ─────────────────────────────────────────────────────────

  it("dispatches dismiss event on button click", () => {
    const handler = vi.fn();
    el.addEventListener("dismiss", handler);
    const btn = el.shadowRoot!.querySelector("button.dismiss") as HTMLButtonElement;
    btn.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it("dismiss event bubbles", () => {
    const handler = vi.fn();
    document.body.addEventListener("dismiss", handler);
    const btn = el.shadowRoot!.querySelector("button.dismiss") as HTMLButtonElement;
    btn.click();
    expect(handler).toHaveBeenCalledOnce();
    document.body.removeEventListener("dismiss", handler);
  });

  it("dismiss event is composed", () => {
    let composed = false;
    el.addEventListener("dismiss", (e) => {
      composed = e.composed;
    });
    const btn = el.shadowRoot!.querySelector("button.dismiss") as HTMLButtonElement;
    btn.click();
    expect(composed).toBe(true);
  });
});
