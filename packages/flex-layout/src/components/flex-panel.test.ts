import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./flex-panel.js";
import type { FlexPanelElement } from "./flex-panel.js";

describe("flex-panel", () => {
  let el: FlexPanelElement;

  beforeEach(() => {
    el = document.createElement("flex-panel") as FlexPanelElement;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  // --- Registration ---

  it("should be registered as a custom element", () => {
    expect(customElements.get("flex-panel")).toBeDefined();
  });

  it("should be an instance of FlexPanelElement", () => {
    expect(el.tagName.toLowerCase()).toBe("flex-panel");
  });

  // --- Shadow DOM ---

  it("should have a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("should use Constructable Stylesheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  it("should contain a named header slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="header"]');
    expect(slot).not.toBeNull();
  });

  it("should contain a default content slot", () => {
    const slot = el.shadowRoot!.querySelector("slot:not([name])");
    expect(slot).not.toBeNull();
  });

  it("should contain a divider element", () => {
    const divider = el.shadowRoot!.querySelector(".divider");
    expect(divider).not.toBeNull();
  });

  // --- Attributes ---

  it("should default width to null", () => {
    expect(el.width).toBeNull();
  });

  it("should reflect width attribute", () => {
    el.width = 300;
    expect(el.getAttribute("width")).toBe("300");
    expect(el.style.width).toBe("300px");
    expect(el.style.flex).toMatch(/none|0 0 auto/);
  });

  it("should clear width styles when width is removed", () => {
    el.width = 300;
    el.width = null;
    expect(el.hasAttribute("width")).toBe(false);
    expect(el.style.width).toBe("");
  });

  it("should default noPadding to false", () => {
    expect(el.noPadding).toBe(false);
  });

  it("should reflect no-padding attribute", () => {
    el.noPadding = true;
    expect(el.hasAttribute("no-padding")).toBe(true);
    el.noPadding = false;
    expect(el.hasAttribute("no-padding")).toBe(false);
  });

  // --- Accessibility ---

  it("should set role=group by default", () => {
    expect(el.getAttribute("role")).toBe("group");
  });

  it("should not override existing role", () => {
    const el2 = document.createElement("flex-panel") as FlexPanelElement;
    el2.setAttribute("role", "complementary");
    document.body.appendChild(el2);
    expect(el2.getAttribute("role")).toBe("complementary");
    el2.remove();
  });

  // --- Divider visibility ---

  it("should hide divider when no header is slotted", () => {
    const divider = el.shadowRoot!.querySelector(".divider") as HTMLElement;
    expect(divider.style.display).toBe("none");
  });
});
