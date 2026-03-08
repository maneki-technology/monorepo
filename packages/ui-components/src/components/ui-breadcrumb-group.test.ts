import { describe, it, expect, beforeEach } from "vitest";
import "./ui-breadcrumb-item.js";
import "./ui-breadcrumb-group.js";

describe("ui-breadcrumb-group", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-breadcrumb-group");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-breadcrumb-group")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  // ── Size attribute ──────────────────────────────────────────────────────

  it("reflects size='s' to attribute", () => {
    (el as unknown as { size: string }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects size='m' to attribute", () => {
    (el as unknown as { size: string }).size = "m";
    expect(el.getAttribute("size")).toBe("m");
  });

  it("reflects size='l' to attribute", () => {
    (el as unknown as { size: string }).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Shadow DOM structure ───────────────────────────────────────────────

  it("has nav element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector("nav")).toBeTruthy();
  });

  it("has ol.list element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const ol = shadow.querySelector("ol.list");
    expect(ol).toBeTruthy();
  });

  it("nav has aria-label='Breadcrumb'", () => {
    const shadow = el.shadowRoot!;
    const nav = shadow.querySelector("nav");
    expect(nav!.getAttribute("aria-label")).toBe("Breadcrumb");
  });

  // ── Size propagation ──────────────────────────────────────────────────

  it("propagates size to child breadcrumb items", () => {
    const item1 = document.createElement("ui-breadcrumb-item");
    const item2 = document.createElement("ui-breadcrumb-item");
    item1.setAttribute("href", "/a");
    el.appendChild(item1);
    el.appendChild(item2);

    (el as unknown as { size: string }).size = "l";

    // Trigger slotchange manually since happy-dom may not fire it
    const slot = el.shadowRoot!.querySelector("slot")!;
    slot.dispatchEvent(new Event("slotchange"));

    expect(item1.getAttribute("size")).toBe("l");
    expect(item2.getAttribute("size")).toBe("l");
  });
});
