import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-scrollbar.js";
import type { ScrollbarEmphasis, ScrollbarOrientation } from "./ui-scrollbar.js";
import { STYLES } from "./ui-scrollbar.styles.js";

describe("ui-scrollbar", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-scrollbar");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-scrollbar")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .container element", () => {
    const container = el.shadowRoot!.querySelector(".container");
    expect(container).not.toBeNull();
  });

  it("renders a <slot> inside the container", () => {
    const slot = el.shadowRoot!.querySelector(".container slot");
    expect(slot).not.toBeNull();
  });

  // ── Default attributes ─────────────────────────────────────────────────────

  it("defaults emphasis to 'bold'", () => {
    expect(el.getAttribute("emphasis")).toBe("bold");
  });

  it("defaults orientation to 'vertical'", () => {
    expect(el.getAttribute("orientation")).toBe("vertical");
  });

  // ── Emphasis attribute ─────────────────────────────────────────────────────

  it("accepts emphasis='bold'", () => {
    el.setAttribute("emphasis", "bold");
    expect(el.getAttribute("emphasis")).toBe("bold");
  });

  it("accepts emphasis='minimal'", () => {
    el.setAttribute("emphasis", "minimal");
    expect(el.getAttribute("emphasis")).toBe("minimal");
  });

  // ── Orientation attribute ──────────────────────────────────────────────────

  it("accepts orientation='vertical'", () => {
    el.setAttribute("orientation", "vertical");
    expect(el.getAttribute("orientation")).toBe("vertical");
  });

  it("accepts orientation='horizontal'", () => {
    el.setAttribute("orientation", "horizontal");
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  // ── Property accessors ─────────────────────────────────────────────────────

  it("emphasis getter returns the attribute value", () => {
    el.setAttribute("emphasis", "minimal");
    expect((el as any).emphasis).toBe("minimal");
  });

  it("emphasis setter updates the attribute", () => {
    (el as any).emphasis = "minimal";
    expect(el.getAttribute("emphasis")).toBe("minimal");
  });

  it("emphasis getter defaults to 'bold'", () => {
    expect((el as any).emphasis).toBe("bold");
  });

  it("orientation getter returns the attribute value", () => {
    el.setAttribute("orientation", "horizontal");
    expect((el as any).orientation).toBe("horizontal");
  });

  it("orientation setter updates the attribute", () => {
    (el as any).orientation = "horizontal";
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  it("orientation getter defaults to 'vertical'", () => {
    expect((el as any).orientation).toBe("vertical");
  });

  // ── observedAttributes ─────────────────────────────────────────────────────

  it("observes 'emphasis' attribute", () => {
    const observed = (customElements.get("ui-scrollbar") as any).observedAttributes;
    expect(observed).toContain("emphasis");
  });

  it("observes 'orientation' attribute", () => {
    const observed = (customElements.get("ui-scrollbar") as any).observedAttributes;
    expect(observed).toContain("orientation");
  });

  it("observedAttributes has exactly 2 entries", () => {
    const observed = (customElements.get("ui-scrollbar") as any).observedAttributes;
    expect(observed).toHaveLength(2);
  });

  // ── STYLES ─────────────────────────────────────────────────────────────────

  it("STYLES contains ::-webkit-scrollbar rule", () => {
    expect(STYLES).toContain("::-webkit-scrollbar");
  });

  it("STYLES contains ::-webkit-scrollbar-track rule", () => {
    expect(STYLES).toContain("::-webkit-scrollbar-track");
  });

  it("STYLES contains ::-webkit-scrollbar-thumb rule", () => {
    expect(STYLES).toContain("::-webkit-scrollbar-thumb");
  });

  it("STYLES contains scrollbar-color for Firefox", () => {
    expect(STYLES).toContain("scrollbar-color");
  });

  it("STYLES contains scrollbar-width for Firefox", () => {
    expect(STYLES).toContain("scrollbar-width");
  });

  // ── Slotted content ────────────────────────────────────────────────────────

  it("projects slotted content through the default slot", () => {
    const child = document.createElement("div");
    child.textContent = "scrollable content";
    el.appendChild(child);
    const slot = el.shadowRoot!.querySelector("slot") as HTMLSlotElement;
    const assigned = slot.assignedNodes();
    expect(assigned).toContain(child);
  });

  // ── No default attributes before connectedCallback ─────────────────────────

  it("does not set defaults before being added to DOM", () => {
    const detached = document.createElement("ui-scrollbar");
    expect(detached.hasAttribute("emphasis")).toBe(false);
    expect(detached.hasAttribute("orientation")).toBe(false);
  });

  // ── Preserves user-set attributes ──────────────────────────────────────────

  it("preserves emphasis if already set before connection", () => {
    const fresh = document.createElement("ui-scrollbar");
    fresh.setAttribute("emphasis", "minimal");
    document.body.appendChild(fresh);
    expect(fresh.getAttribute("emphasis")).toBe("minimal");
  });

  it("preserves orientation if already set before connection", () => {
    const fresh = document.createElement("ui-scrollbar");
    fresh.setAttribute("orientation", "horizontal");
    document.body.appendChild(fresh);
    expect(fresh.getAttribute("orientation")).toBe("horizontal");
  });
});
