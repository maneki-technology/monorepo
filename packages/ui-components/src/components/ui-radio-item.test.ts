import { describe, it, expect, beforeEach } from "vitest";
import "./ui-radio-item.js";

describe("ui-radio-item", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-radio-item");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-radio-item")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults label to 'none'", () => {
    expect((el as unknown as { label: string }).label).toBe("none");
  });

  it("defaults checked to false", () => {
    expect((el as unknown as { checked: boolean }).checked).toBe(false);
  });

  it("defaults disabled to false", () => {
    expect((el as unknown as { disabled: boolean }).disabled).toBe(false);
  });

  it("defaults error to false", () => {
    expect((el as unknown as { error: boolean }).error).toBe(false);
  });

  it("defaults value to empty string", () => {
    expect((el as unknown as { value: string }).value).toBe("");
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

  // ── Label attribute ─────────────────────────────────────────────────────

  it("reflects label='none' to attribute", () => {
    (el as unknown as { label: string }).label = "none";
    expect(el.getAttribute("label")).toBe("none");
  });

  it("reflects label='right' to attribute", () => {
    (el as unknown as { label: string }).label = "right";
    expect(el.getAttribute("label")).toBe("right");
  });

  it("reflects label='left' to attribute", () => {
    (el as unknown as { label: string }).label = "left";
    expect(el.getAttribute("label")).toBe("left");
  });

  // ── Boolean attributes ──────────────────────────────────────────────────

  it("sets checked attribute when property is true", () => {
    (el as unknown as { checked: boolean }).checked = true;
    expect(el.hasAttribute("checked")).toBe(true);
  });

  it("removes checked attribute when property is false", () => {
    (el as unknown as { checked: boolean }).checked = true;
    (el as unknown as { checked: boolean }).checked = false;
    expect(el.hasAttribute("checked")).toBe(false);
  });

  it("sets disabled attribute when property is true", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("removes disabled attribute when property is false", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("sets error attribute when property is true", () => {
    (el as unknown as { error: boolean }).error = true;
    expect(el.hasAttribute("error")).toBe(true);
  });

  it("removes error attribute when property is false", () => {
    (el as unknown as { error: boolean }).error = true;
    (el as unknown as { error: boolean }).error = false;
    expect(el.hasAttribute("error")).toBe(false);
  });

  // ── Value attribute ─────────────────────────────────────────────────────

  it("reflects value to attribute", () => {
    (el as unknown as { value: string }).value = "option-a";
    expect(el.getAttribute("value")).toBe("option-a");
  });

  // ── Shadow DOM structure ───────────────────────────────────────────────

  it("has .base element in shadow DOM", () => {
    expect(el.shadowRoot!.querySelector(".base")).toBeTruthy();
  });

  it("has .outer element in shadow DOM", () => {
    expect(el.shadowRoot!.querySelector(".outer")).toBeTruthy();
  });

  it("has .radio element in shadow DOM", () => {
    expect(el.shadowRoot!.querySelector(".radio")).toBeTruthy();
  });

  it("has .label element in shadow DOM", () => {
    expect(el.shadowRoot!.querySelector(".label")).toBeTruthy();
  });

  it("has default slot in shadow DOM", () => {
    const slots = el.shadowRoot!.querySelectorAll("slot");
    const defaultSlot = Array.from(slots).find((s) => !s.name);
    expect(defaultSlot).toBeTruthy();
  });

  it("has .dot element in shadow DOM", () => {
    expect(el.shadowRoot!.querySelector(".dot")).toBeTruthy();
  });

  // ── Accessibility ──────────────────────────────────────────────────────

  it("sets role='radio' on connected", () => {
    expect(el.getAttribute("role")).toBe("radio");
  });

  it("sets tabindex='0' on connected", () => {
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("sets aria-checked='false' by default", () => {
    expect(el.getAttribute("aria-checked")).toBe("false");
  });

  it("sets aria-checked='true' when checked", () => {
    (el as unknown as { checked: boolean }).checked = true;
    expect(el.getAttribute("aria-checked")).toBe("true");
  });

  it("sets aria-disabled='true' when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  // ── Select behavior ────────────────────────────────────────────────────

  it("selects on click", () => {
    el.click();
    expect((el as unknown as { checked: boolean }).checked).toBe(true);
  });

  it("does not uncheck on second click (radio stays checked)", () => {
    el.click();
    el.click();
    expect((el as unknown as { checked: boolean }).checked).toBe(true);
  });

  it("does not select when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    el.click();
    expect((el as unknown as { checked: boolean }).checked).toBe(false);
  });

  // ── Change event ───────────────────────────────────────────────────────

  it("dispatches change event on select", () => {
    let fired = false;
    el.addEventListener("change", () => {
      fired = true;
    });
    el.click();
    expect(fired).toBe(true);
  });

  it("does not dispatch change event when already checked", () => {
    (el as unknown as { checked: boolean }).checked = true;
    let fired = false;
    el.addEventListener("change", () => {
      fired = true;
    });
    el.click();
    expect(fired).toBe(false);
  });

  it("change event bubbles and is composed", () => {
    let event: Event | null = null;
    el.addEventListener("change", (e) => {
      event = e;
    });
    el.click();
    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  // ── Keyboard interaction ───────────────────────────────────────────────

  it("selects on Space key", () => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect((el as unknown as { checked: boolean }).checked).toBe(true);
  });

  it("selects on Enter key", () => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect((el as unknown as { checked: boolean }).checked).toBe(true);
  });

  it("does not select on other keys", () => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect((el as unknown as { checked: boolean }).checked).toBe(false);
  });

  // ── Property accessors ────────────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      label: string;
      checked: boolean;
      disabled: boolean;
      error: boolean;
      value: string;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.label = "right";
    expect(component.label).toBe("right");

    component.checked = true;
    expect(component.checked).toBe(true);

    component.disabled = true;
    expect(component.disabled).toBe(true);

    component.error = true;
    expect(component.error).toBe(true);

    component.value = "test";
    expect(component.value).toBe("test");
  });
});
