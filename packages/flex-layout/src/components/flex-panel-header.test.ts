import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./flex-panel-header.js";
import type { FlexPanelHeaderElement } from "./flex-panel-header.js";

describe("flex-panel-header", () => {
  let el: FlexPanelHeaderElement;

  beforeEach(() => {
    el = document.createElement("flex-panel-header") as FlexPanelHeaderElement;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  // --- Registration ---

  it("should be registered as a custom element", () => {
    expect(customElements.get("flex-panel-header")).toBeDefined();
  });

  it("should be an instance of FlexPanelHeaderElement", () => {
    expect(el.tagName.toLowerCase()).toBe("flex-panel-header");
  });

  // --- Shadow DOM ---

  it("should have a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("should use Constructable Stylesheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  it("should contain a title-bar element", () => {
    const titleBar = el.shadowRoot!.querySelector(".title-bar");
    expect(titleBar).not.toBeNull();
  });

  it("should contain a title-text element", () => {
    const titleText = el.shadowRoot!.querySelector(".title-text");
    expect(titleText).not.toBeNull();
  });

  it("should contain a tabs-bar element", () => {
    const tabsBar = el.shadowRoot!.querySelector(".tabs-bar");
    expect(tabsBar).not.toBeNull();
  });

  it("should contain a divider element", () => {
    const divider = el.shadowRoot!.querySelector(".divider");
    expect(divider).not.toBeNull();
  });

  it("should contain an action slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="action"]');
    expect(slot).not.toBeNull();
  });

  it("should contain a tabs slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="tabs"]');
    expect(slot).not.toBeNull();
  });

  // --- Attributes ---

  it("should default variant to title", () => {
    expect(el.variant).toBe("title");
  });

  it("should reflect variant attribute", () => {
    el.variant = "tabs";
    expect(el.getAttribute("variant")).toBe("tabs");
    el.variant = "title-tabs";
    expect(el.getAttribute("variant")).toBe("title-tabs");
  });

  it("should default size to medium", () => {
    expect(el.size).toBe("medium");
  });

  it("should reflect size attribute", () => {
    el.size = "large";
    expect(el.getAttribute("size")).toBe("large");
    el.size = "small";
    expect(el.getAttribute("size")).toBe("small");
  });

  it("should default heading to empty string", () => {
    expect(el.heading).toBe("");
  });

  it("should reflect heading attribute", () => {
    el.heading = "Card Heading";
    expect(el.getAttribute("heading")).toBe("Card Heading");
  });

  it("should update title text when heading changes", () => {
    el.heading = "Test Title";
    const titleText = el.shadowRoot!.querySelector(".title-text");
    expect(titleText!.textContent).toBe("Test Title");
  });

  it("should update title text when heading attribute is set directly", () => {
    el.setAttribute("heading", "Direct Attr");
    const titleText = el.shadowRoot!.querySelector(".title-text");
    expect(titleText!.textContent).toBe("Direct Attr");
  });

  // --- Accessibility ---

  it("should set role=toolbar by default", () => {
    expect(el.getAttribute("role")).toBe("toolbar");
  });

  it("should not override existing role", () => {
    const el2 = document.createElement("flex-panel-header") as FlexPanelHeaderElement;
    el2.setAttribute("role", "heading");
    document.body.appendChild(el2);
    expect(el2.getAttribute("role")).toBe("heading");
    el2.remove();
  });

  // --- Size presets ---

  it("should apply large size styles", () => {
    el.size = "large";
    expect(el.getAttribute("size")).toBe("large");
  });

  it("should apply small size styles", () => {
    el.size = "small";
    expect(el.getAttribute("size")).toBe("small");
  });
});
