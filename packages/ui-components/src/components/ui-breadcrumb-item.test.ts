import { describe, it, expect, beforeEach } from "vitest";
import "./ui-breadcrumb-item.js";

describe("ui-breadcrumb-item", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-breadcrumb-item");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-breadcrumb-item")).toBeDefined();
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

  // ── href attribute ──────────────────────────────────────────────────────

  it("reflects href to attribute", () => {
    (el as unknown as { href: string | null }).href = "/home";
    expect(el.getAttribute("href")).toBe("/home");
  });

  it("removes href attribute when set to null", () => {
    (el as unknown as { href: string | null }).href = "/home";
    (el as unknown as { href: string | null }).href = null;
    expect(el.hasAttribute("href")).toBe(false);
  });

  // ── disabled attribute ──────────────────────────────────────────────────

  it("sets disabled attribute when property is true", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("removes disabled attribute when property is false", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  // ── Shadow DOM structure ───────────────────────────────────────────────

  it("has .base element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".base")).toBeTruthy();
  });

  it("has .link element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".link")).toBeTruthy();
  });

  it("has .separator element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".separator")).toBeTruthy();
  });

  // ── Link element type based on href ───────────────────────────────────

  it("renders <a> element when href is set", () => {
    el.setAttribute("href", "/home");
    const shadow = el.shadowRoot!;
    const link = shadow.querySelector(".link");
    expect(link).toBeTruthy();
    expect(link!.tagName).toBe("A");
    expect(link!.getAttribute("href")).toBe("/home");
  });

  it("renders <span> with class 'current' when href is absent", () => {
    const shadow = el.shadowRoot!;
    const link = shadow.querySelector(".link");
    expect(link).toBeTruthy();
    expect(link!.tagName).toBe("SPAN");
    expect(link!.classList.contains("current")).toBe(true);
  });

  // ── Separator visibility ──────────────────────────────────────────────

  it("hides separator when href is absent", () => {
    const shadow = el.shadowRoot!;
    const separator = shadow.querySelector(".separator");
    expect(separator).toBeTruthy();
    expect(separator!.classList.contains("hidden")).toBe(true);
  });

  it("shows separator when href is set", () => {
    el.setAttribute("href", "/home");
    const shadow = el.shadowRoot!;
    const separator = shadow.querySelector(".separator");
    expect(separator).toBeTruthy();
    expect(separator!.classList.contains("hidden")).toBe(false);
  });

  // ── aria-current ──────────────────────────────────────────────────────

  it("sets aria-current='page' when no href", () => {
    expect(el.getAttribute("aria-current")).toBe("page");
  });

  it("removes aria-current when href is set", () => {
    el.setAttribute("href", "/home");
    expect(el.hasAttribute("aria-current")).toBe(false);
  });

  // ── Disabled pointer events ───────────────────────────────────────────

  it("disabled attribute is present when disabled", () => {
    el.setAttribute("disabled", "");
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  // ── Property accessors ────────────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      href: string | null;
      disabled: boolean;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.href = "/test";
    expect(component.href).toBe("/test");

    component.disabled = true;
    expect(component.disabled).toBe(true);

    component.href = null;
    expect(component.href).toBeNull();

    component.disabled = false;
    expect(component.disabled).toBe(false);
  });
});
