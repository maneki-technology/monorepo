import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-slider.js";
import type { SliderSize } from "./ui-slider.js";

describe("ui-slider", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-slider");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-slider")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .track-area element", () => {
    expect(el.shadowRoot!.querySelector(".track-area")).not.toBeNull();
  });

  it("renders a .track element", () => {
    expect(el.shadowRoot!.querySelector(".track")).not.toBeNull();
  });

  it("renders a .fill element", () => {
    expect(el.shadowRoot!.querySelector(".fill")).not.toBeNull();
  });

  it("renders a low handle with role=slider", () => {
    const handles = el.shadowRoot!.querySelectorAll(".handle");
    expect(handles.length).toBeGreaterThanOrEqual(1);
    expect(handles[0].getAttribute("role")).toBe("slider");
  });

  it("renders a high handle element", () => {
    const handles = el.shadowRoot!.querySelectorAll(".handle");
    expect(handles.length).toBe(2);
  });

  it("renders a .labels element", () => {
    expect(el.shadowRoot!.querySelector(".labels")).not.toBeNull();
  });

  it("renders tooltip elements inside handles", () => {
    const tooltips = el.shadowRoot!.querySelectorAll(".tooltip");
    expect(tooltips.length).toBe(2);
  });

  // ── Default attribute values ──────────────────────────────────────────────

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults min to 0", () => {
    expect(el.getAttribute("min")).toBe("0");
  });

  it("defaults max to 100", () => {
    expect(el.getAttribute("max")).toBe("100");
  });

  it("defaults value to 0", () => {
    expect(el.getAttribute("value")).toBe("0");
  });

  it("defaults step to 1", () => {
    expect(el.getAttribute("step")).toBe("1");
  });

  // ── Attribute: size ───────────────────────────────────────────────────────

  it("accepts size=s", () => {
    el.setAttribute("size", "s");
    expect(el.getAttribute("size")).toBe("s");
  });

  it("accepts size=m", () => {
    el.setAttribute("size", "m");
    expect(el.getAttribute("size")).toBe("m");
  });

  it("accepts size=l", () => {
    el.setAttribute("size", "l");
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Attribute: min / max ──────────────────────────────────────────────────

  it("accepts min attribute", () => {
    el.setAttribute("min", "10");
    expect(el.getAttribute("min")).toBe("10");
  });

  it("accepts max attribute", () => {
    el.setAttribute("max", "200");
    expect(el.getAttribute("max")).toBe("200");
  });

  // ── Attribute: value ──────────────────────────────────────────────────────

  it("accepts value attribute", () => {
    el.setAttribute("value", "50");
    expect(el.getAttribute("value")).toBe("50");
  });

  // ── Attribute: value-high ─────────────────────────────────────────────────

  it("accepts value-high attribute", () => {
    el.setAttribute("range", "");
    el.setAttribute("value-high", "75");
    expect(el.getAttribute("value-high")).toBe("75");
  });

  // ── Attribute: step ───────────────────────────────────────────────────────

  it("accepts step attribute", () => {
    el.setAttribute("step", "5");
    expect(el.getAttribute("step")).toBe("5");
  });

  // ── Attribute: labels ─────────────────────────────────────────────────────

  it("accepts labels attribute", () => {
    el.setAttribute("labels", "");
    expect(el.hasAttribute("labels")).toBe(true);
  });

  // ── Attribute: tooltip ────────────────────────────────────────────────────

  it("accepts tooltip attribute", () => {
    el.setAttribute("tooltip", "");
    expect(el.hasAttribute("tooltip")).toBe(true);
  });

  // ── Attribute: disabled ───────────────────────────────────────────────────

  it("accepts disabled attribute", () => {
    el.setAttribute("disabled", "");
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  // ── Attribute: range ──────────────────────────────────────────────────────

  it("accepts range attribute", () => {
    el.setAttribute("range", "");
    expect(el.hasAttribute("range")).toBe(true);
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns current attribute", () => {
    el.setAttribute("size", "l");
    expect((el as unknown as { size: SliderSize }).size).toBe("l");
  });

  it("size setter updates attribute", () => {
    (el as unknown as { size: SliderSize }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("min getter returns numeric value", () => {
    el.setAttribute("min", "10");
    expect((el as unknown as { min: number }).min).toBe(10);
  });

  it("min setter updates attribute", () => {
    (el as unknown as { min: number }).min = 5;
    expect(el.getAttribute("min")).toBe("5");
  });

  it("max getter returns numeric value", () => {
    el.setAttribute("max", "200");
    expect((el as unknown as { max: number }).max).toBe(200);
  });

  it("max setter updates attribute", () => {
    (el as unknown as { max: number }).max = 50;
    expect(el.getAttribute("max")).toBe("50");
  });

  it("value getter returns numeric value", () => {
    el.setAttribute("value", "42");
    expect((el as unknown as { value: number }).value).toBe(42);
  });

  it("value setter updates attribute", () => {
    (el as unknown as { value: number }).value = 30;
    expect(el.getAttribute("value")).toBe("30");
  });

  it("valueHigh getter returns numeric value", () => {
    el.setAttribute("range", "");
    el.setAttribute("value-high", "80");
    expect((el as unknown as { valueHigh: number }).valueHigh).toBe(80);
  });

  it("valueHigh setter updates attribute", () => {
    (el as unknown as { valueHigh: number }).valueHigh = 90;
    expect(el.getAttribute("value-high")).toBe("90");
  });

  it("step getter returns numeric value", () => {
    el.setAttribute("step", "5");
    expect((el as unknown as { step: number }).step).toBe(5);
  });

  it("step setter updates attribute", () => {
    (el as unknown as { step: number }).step = 10;
    expect(el.getAttribute("step")).toBe("10");
  });

  it("isRange getter returns true when range attribute present", () => {
    el.setAttribute("range", "");
    expect((el as unknown as { isRange: boolean }).isRange).toBe(true);
  });

  it("isRange getter returns false when range attribute absent", () => {
    expect((el as unknown as { isRange: boolean }).isRange).toBe(false);
  });

  it("disabled getter returns true when disabled attribute present", () => {
    el.setAttribute("disabled", "");
    expect((el as unknown as { disabled: boolean }).disabled).toBe(true);
  });

  it("disabled getter returns false when disabled attribute absent", () => {
    expect((el as unknown as { disabled: boolean }).disabled).toBe(false);
  });

  it("disabled setter adds attribute when true", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("disabled setter removes attribute when false", () => {
    el.setAttribute("disabled", "");
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  // ── Single mode ───────────────────────────────────────────────────────────

  it("shows low handle in single mode", () => {
    el.setAttribute("value", "50");
    const handles = el.shadowRoot!.querySelectorAll(".handle") as NodeListOf<HTMLElement>;
    expect(handles[0].style.display).not.toBe("none");
  });

  it("hides high handle in single mode", () => {
    el.setAttribute("value", "50");
    const handles = el.shadowRoot!.querySelectorAll(".handle") as NodeListOf<HTMLElement>;
    expect(handles[1].style.display).toBe("none");
  });

  // ── Range mode ────────────────────────────────────────────────────────────

  it("shows both handles in range mode", () => {
    el.setAttribute("range", "");
    el.setAttribute("value", "25");
    el.setAttribute("value-high", "75");
    const handles = el.shadowRoot!.querySelectorAll(".handle") as NodeListOf<HTMLElement>;
    expect(handles[0].style.display).not.toBe("none");
    expect(handles[1].style.display).not.toBe("none");
  });

  it("positions fill between handles in range mode", () => {
    el.setAttribute("range", "");
    el.setAttribute("value", "25");
    el.setAttribute("value-high", "75");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.left).toBe("25%");
    expect(fill.style.right).toBe("25%");
  });

  it("positions fill from 0 in single mode", () => {
    el.setAttribute("value", "60");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.left).toMatch(/^0(px)?$/);
    expect(fill.style.right).toBe("40%");
  });

  // ── Value clamping ────────────────────────────────────────────────────────

  it("clamps fill for value below min", () => {
    el.setAttribute("min", "0");
    el.setAttribute("max", "100");
    el.setAttribute("value", "-10");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    // Value is clamped to min (0), so fill right = 100%
    expect(fill.style.right).toBe("100%");
  });

  it("clamps fill for value above max", () => {
    el.setAttribute("min", "0");
    el.setAttribute("max", "100");
    el.setAttribute("value", "200");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    // Value is clamped to max (100), so fill right = 0%
    expect(fill.style.right).toBe("0%");
  });

  // ── Step snapping ─────────────────────────────────────────────────────────

  it("step getter defaults to 1 for invalid step", () => {
    el.setAttribute("step", "0");
    expect((el as unknown as { step: number }).step).toBe(1);
  });

  it("step getter returns correct value for valid step", () => {
    el.setAttribute("step", "10");
    expect((el as unknown as { step: number }).step).toBe(10);
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("sets role=slider on low handle", () => {
    const handles = el.shadowRoot!.querySelectorAll(".handle");
    expect(handles[0].getAttribute("role")).toBe("slider");
  });

  it("sets role=slider on high handle", () => {
    const handles = el.shadowRoot!.querySelectorAll(".handle");
    expect(handles[1].getAttribute("role")).toBe("slider");
  });

  it("sets aria-valuenow on low handle", () => {
    el.setAttribute("value", "42");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0];
    expect(handle.getAttribute("aria-valuenow")).toBe("42");
  });

  it("sets aria-valuemin on low handle", () => {
    el.setAttribute("min", "10");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0];
    expect(handle.getAttribute("aria-valuemin")).toBe("10");
  });

  it("sets aria-valuemax on low handle in single mode", () => {
    el.setAttribute("max", "200");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0];
    expect(handle.getAttribute("aria-valuemax")).toBe("200");
  });

  it("sets aria-valuemax on low handle to valueHigh in range mode", () => {
    el.setAttribute("range", "");
    el.setAttribute("value", "20");
    el.setAttribute("value-high", "80");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0];
    expect(handle.getAttribute("aria-valuemax")).toBe("80");
  });

  it("sets aria-valuemin on high handle to value in range mode", () => {
    el.setAttribute("range", "");
    el.setAttribute("value", "20");
    el.setAttribute("value-high", "80");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[1];
    expect(handle.getAttribute("aria-valuemin")).toBe("20");
  });

  it("sets aria-valuemax on high handle in range mode", () => {
    el.setAttribute("range", "");
    el.setAttribute("max", "200");
    el.setAttribute("value-high", "150");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[1];
    expect(handle.getAttribute("aria-valuemax")).toBe("200");
  });

  it("sets aria-valuenow on high handle in range mode", () => {
    el.setAttribute("range", "");
    el.setAttribute("value-high", "60");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[1];
    expect(handle.getAttribute("aria-valuenow")).toBe("60");
  });

  it("updates aria-valuenow when value changes", () => {
    el.setAttribute("value", "10");
    el.setAttribute("value", "90");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0];
    expect(handle.getAttribute("aria-valuenow")).toBe("90");
  });

  // ── Labels ────────────────────────────────────────────────────────────────

  it("shows min value in label", () => {
    el.setAttribute("min", "10");
    const labels = el.shadowRoot!.querySelector(".labels");
    const spans = labels!.querySelectorAll("span");
    expect(spans[0].textContent).toBe("10");
  });

  it("shows max value in label", () => {
    el.setAttribute("max", "200");
    const labels = el.shadowRoot!.querySelector(".labels");
    const spans = labels!.querySelectorAll("span");
    expect(spans[1].textContent).toBe("200");
  });

  it("updates labels when min/max change", () => {
    el.setAttribute("min", "5");
    el.setAttribute("max", "50");
    const labels = el.shadowRoot!.querySelector(".labels");
    const spans = labels!.querySelectorAll("span");
    expect(spans[0].textContent).toBe("5");
    expect(spans[1].textContent).toBe("50");
  });

  // ── Tooltips ──────────────────────────────────────────────────────────────

  it("shows current value in low tooltip", () => {
    el.setAttribute("value", "42");
    const tooltips = el.shadowRoot!.querySelectorAll(".tooltip");
    expect(tooltips[0].textContent).toBe("42");
  });

  it("shows valueHigh in high tooltip in range mode", () => {
    el.setAttribute("range", "");
    el.setAttribute("value-high", "80");
    const tooltips = el.shadowRoot!.querySelectorAll(".tooltip");
    expect(tooltips[1].textContent).toBe("80");
  });

  // ── Handle tabindex ───────────────────────────────────────────────────────

  it("sets tabindex=0 on low handle", () => {
    const handles = el.shadowRoot!.querySelectorAll(".handle");
    expect(handles[0].getAttribute("tabindex")).toBe("0");
  });

  it("sets tabindex=0 on high handle", () => {
    const handles = el.shadowRoot!.querySelectorAll(".handle");
    expect(handles[1].getAttribute("tabindex")).toBe("0");
  });

  // ── Events ────────────────────────────────────────────────────────────────

  it("dispatches slider-change on keyboard interaction", () => {
    el.setAttribute("value", "50");
    let detail: { value: number; valueHigh?: number } | null = null;
    el.addEventListener("slider-change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(detail).not.toBeNull();
    expect(detail!.value).toBe(51);
  });

  it("dispatches slider-change with valueHigh in range mode", () => {
    el.setAttribute("range", "");
    el.setAttribute("value", "20");
    el.setAttribute("value-high", "80");
    let detail: { value: number; valueHigh?: number } | null = null;
    el.addEventListener("slider-change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const handle = el.shadowRoot!.querySelectorAll(".handle")[1] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(detail).not.toBeNull();
    expect(detail!.valueHigh).toBe(81);
  });

  it("slider-change event bubbles and is composed", () => {
    el.setAttribute("value", "50");
    let bubbles = false;
    let composed = false;
    el.addEventListener("slider-change", ((e: CustomEvent) => {
      bubbles = e.bubbles;
      composed = e.composed;
    }) as EventListener);

    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));

    expect(bubbles).toBe(true);
    expect(composed).toBe(true);
  });

  it("does not include valueHigh in single mode event", () => {
    el.setAttribute("value", "50");
    let detail: { value: number; valueHigh?: number } | null = null;
    el.addEventListener("slider-change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(detail!.valueHigh).toBeUndefined();
  });

  // ── Keyboard ──────────────────────────────────────────────────────────────

  it("ArrowRight increments value by step", () => {
    el.setAttribute("value", "50");
    el.setAttribute("step", "1");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(el.getAttribute("value")).toBe("51");
  });

  it("ArrowUp increments value by step", () => {
    el.setAttribute("value", "50");
    el.setAttribute("step", "1");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(el.getAttribute("value")).toBe("51");
  });

  it("ArrowLeft decrements value by step", () => {
    el.setAttribute("value", "50");
    el.setAttribute("step", "1");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(el.getAttribute("value")).toBe("49");
  });

  it("ArrowDown decrements value by step", () => {
    el.setAttribute("value", "50");
    el.setAttribute("step", "1");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(el.getAttribute("value")).toBe("49");
  });

  it("Home sets value to min", () => {
    el.setAttribute("value", "50");
    el.setAttribute("min", "10");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(el.getAttribute("value")).toBe("10");
  });

  it("End sets value to max", () => {
    el.setAttribute("value", "50");
    el.setAttribute("max", "100");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(el.getAttribute("value")).toBe("100");
  });

  it("keyboard does not go below min", () => {
    el.setAttribute("value", "0");
    el.setAttribute("min", "0");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(el.getAttribute("value")).toBe("0");
  });

  it("keyboard does not go above max", () => {
    el.setAttribute("value", "100");
    el.setAttribute("max", "100");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(el.getAttribute("value")).toBe("100");
  });

  it("keyboard increments with custom step", () => {
    el.setAttribute("value", "50");
    el.setAttribute("step", "10");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(el.getAttribute("value")).toBe("60");
  });

  it("keyboard on high handle increments valueHigh", () => {
    el.setAttribute("range", "");
    el.setAttribute("value", "20");
    el.setAttribute("value-high", "80");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[1] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(el.getAttribute("value-high")).toBe("81");
  });

  it("keyboard on high handle decrements valueHigh", () => {
    el.setAttribute("range", "");
    el.setAttribute("value", "20");
    el.setAttribute("value-high", "80");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[1] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(el.getAttribute("value-high")).toBe("79");
  });

  it("keyboard does not move low handle past high handle in range mode", () => {
    el.setAttribute("range", "");
    el.setAttribute("value", "50");
    el.setAttribute("value-high", "50");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(el.getAttribute("value")).toBe("50");
  });

  it("keyboard does not move high handle below low handle in range mode", () => {
    el.setAttribute("range", "");
    el.setAttribute("value", "50");
    el.setAttribute("value-high", "50");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[1] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(el.getAttribute("value-high")).toBe("50");
  });

  it("keyboard is ignored when disabled", () => {
    el.setAttribute("value", "50");
    el.setAttribute("disabled", "");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(el.getAttribute("value")).toBe("50");
  });

  it("unrecognized key does not change value", () => {
    el.setAttribute("value", "50");
    const handle = el.shadowRoot!.querySelectorAll(".handle")[0] as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    expect(el.getAttribute("value")).toBe("50");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observes size attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("size");
  });

  it("observes min attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("min");
  });

  it("observes max attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("max");
  });

  it("observes value attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("value");
  });

  it("observes value-high attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("value-high");
  });

  it("observes step attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("step");
  });

  it("observes labels attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("labels");
  });

  it("observes tooltip attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("tooltip");
  });

  it("observes disabled attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("disabled");
  });

  it("observes range attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("range");
  });

  it("has exactly 10 observed attributes", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed.length).toBe(10);
  });
});
