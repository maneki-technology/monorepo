import { describe, it, expect, beforeEach } from "vitest";
import "./ui-card.js";

describe("ui-card", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-card");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-card")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults elevation to '02'", () => {
    expect((el as unknown as { elevation: string }).elevation).toBe("02");
  });

  it("defaults bordered to false", () => {
    expect((el as unknown as { bordered: boolean }).bordered).toBe(false);
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

  // ── Elevation attribute ─────────────────────────────────────────────────

  it("reflects elevation='00' to attribute", () => {
    (el as unknown as { elevation: string }).elevation = "00";
    expect(el.getAttribute("elevation")).toBe("00");
  });

  it("reflects elevation='01' to attribute", () => {
    (el as unknown as { elevation: string }).elevation = "01";
    expect(el.getAttribute("elevation")).toBe("01");
  });

  it("reflects elevation='02' to attribute", () => {
    (el as unknown as { elevation: string }).elevation = "02";
    expect(el.getAttribute("elevation")).toBe("02");
  });

  it("reflects elevation='04' to attribute", () => {
    (el as unknown as { elevation: string }).elevation = "04";
    expect(el.getAttribute("elevation")).toBe("04");
  });

  // ── Bordered attribute ──────────────────────────────────────────────────

  it("sets bordered attribute when property is true", () => {
    (el as unknown as { bordered: boolean }).bordered = true;
    expect(el.hasAttribute("bordered")).toBe(true);
  });

  it("removes bordered attribute when property is false", () => {
    (el as unknown as { bordered: boolean }).bordered = true;
    (el as unknown as { bordered: boolean }).bordered = false;
    expect(el.hasAttribute("bordered")).toBe(false);
  });

  // ── Shadow DOM structure ───────────────────────────────────────────────

  it("has .base element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".base")).toBeTruthy();
  });

  it("has .content element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".content")).toBeTruthy();
  });

  it("has image slot in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const slot = shadow.querySelector('slot[name="image"]');
    expect(slot).toBeTruthy();
  });

  it("has default slot in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const slots = shadow.querySelectorAll("slot");
    const defaultSlot = Array.from(slots).find((s) => !s.name);
    expect(defaultSlot).toBeTruthy();
  });

  it("has footer slot in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const slot = shadow.querySelector('slot[name="footer"]');
    expect(slot).toBeTruthy();
  });

  // ── Footer visibility ─────────────────────────────────────────────────

  it("footer is hidden by default (no has-footer attribute)", () => {
    const shadow = el.shadowRoot!;
    const footer = shadow.querySelector(".footer");
    expect(footer).toBeTruthy();
    expect(el.hasAttribute("has-footer")).toBe(false);
  });

  // ── Part attributes ───────────────────────────────────────────────────

  it(".base has part='base'", () => {
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base");
    expect(base!.getAttribute("part")).toBe("base");
  });

  it(".content has part='content'", () => {
    const shadow = el.shadowRoot!;
    const content = shadow.querySelector(".content");
    expect(content!.getAttribute("part")).toBe("content");
  });

  // ── Property accessors ────────────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      elevation: string;
      bordered: boolean;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.elevation = "04";
    expect(component.elevation).toBe("04");

    component.bordered = true;
    expect(component.bordered).toBe(true);
  });
});
