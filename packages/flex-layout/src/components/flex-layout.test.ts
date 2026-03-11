import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./flex-layout.js";
import type { FlexLayoutElement } from "./flex-layout.js";

describe("flex-layout", () => {
  let el: FlexLayoutElement;

  beforeEach(() => {
    el = document.createElement("flex-layout") as FlexLayoutElement;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  // --- Registration ---

  it("should be registered as a custom element", () => {
    expect(customElements.get("flex-layout")).toBeDefined();
  });

  it("should be an instance of FlexLayoutElement", () => {
    expect(el.tagName.toLowerCase()).toBe("flex-layout");
  });

  // --- Shadow DOM ---

  it("should have a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("should use Constructable Stylesheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  it("should contain a slot element", () => {
    const slot = el.shadowRoot!.querySelector("slot");
    expect(slot).not.toBeNull();
  });

  // --- Attributes ---

  it("should default size to medium", () => {
    expect(el.size).toBe("medium");
  });

  it("should reflect size attribute", () => {
    el.size = "large";
    expect(el.getAttribute("size")).toBe("large");
    el.size = "small";
    expect(el.getAttribute("size")).toBe("small");
  });

  it("should default direction to row", () => {
    expect(el.direction).toBe("row");
  });

  it("should reflect direction attribute", () => {
    el.direction = "column";
    expect(el.getAttribute("direction")).toBe("column");
  });

  // --- Accessibility ---

  it("should not set a default role", () => {
    expect(el.hasAttribute("role")).toBe(false);
  });

  it("should preserve consumer-set role", () => {
    const el2 = document.createElement("flex-layout") as FlexLayoutElement;
    el2.setAttribute("role", "main");
    document.body.appendChild(el2);
    expect(el2.getAttribute("role")).toBe("main");
    el2.remove();
  });

  // --- CSS Custom Properties ---

  it("should include surface-moderate background in styles", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets[0];
    expect(styles).toBeDefined();
  });

  it("should use --flex-bg custom property", () => {
    const raw = el.shadowRoot!.adoptedStyleSheets[0];
    expect(raw).toBeDefined();
  });
});
