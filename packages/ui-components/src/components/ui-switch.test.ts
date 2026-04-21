import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-switch.js";
import "./ui-label.js";
import { UiSwitch, type SwitchSize, type SwitchLabelPosition } from "./ui-switch.js";

describe("ui-switch", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-switch");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-switch")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .switch element", () => {
    expect(el.shadowRoot!.querySelector(".switch")).not.toBeNull();
  });

  it("renders a .handle element inside .switch", () => {
    const track = el.shadowRoot!.querySelector(".switch");
    expect(track!.querySelector(".handle")).not.toBeNull();
  });

  it("renders a .label element", () => {
    expect(el.shadowRoot!.querySelector(".label")).not.toBeNull();
  });

  // ── Default attributes ────────────────────────────────────────────────────

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults label-position to none", () => {
    expect(el.getAttribute("label-position")).toBe("none");
  });

  it("is not checked by default", () => {
    expect(el.hasAttribute("checked")).toBe(false);
  });

  it("is not disabled by default", () => {
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  // ── Size attribute ────────────────────────────────────────────────────────

  it.each(["s", "m", "l"] as SwitchSize[])("accepts size=%s", (size) => {
    el.setAttribute("size", size);
    expect(el.getAttribute("size")).toBe(size);
  });

  // ── Checked attribute ─────────────────────────────────────────────────────

  it("reflects checked attribute when set", () => {
    el.setAttribute("checked", "");
    expect(el.hasAttribute("checked")).toBe(true);
  });

  it("removes checked attribute when removed", () => {
    el.setAttribute("checked", "");
    el.removeAttribute("checked");
    expect(el.hasAttribute("checked")).toBe(false);
  });

  // ── Disabled attribute ────────────────────────────────────────────────────

  it("reflects disabled attribute when set", () => {
    el.setAttribute("disabled", "");
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  // ── Label slot ────────────────────────────────────────────────────────────

  it("has a label slot in shadow DOM", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="label"]');
    expect(slot).toBeTruthy();
  });

  it("renders slotted label content", () => {
    document.body.innerHTML = "";
    const sw = document.createElement("ui-switch");
    sw.setAttribute("label-position", "right");
    const label = document.createElement("ui-label");
    label.setAttribute("slot", "label");
    label.textContent = "Dark mode";
    sw.appendChild(label);
    document.body.appendChild(sw);
    const slot = sw.shadowRoot!.querySelector('slot[name="label"]') as HTMLSlotElement;
    expect(slot).toBeTruthy();
  });

  // ── Label position attribute ──────────────────────────────────────────────

  it.each(["none", "left", "right"] as SwitchLabelPosition[])(
    "accepts label-position=%s",
    (pos) => {
      el.setAttribute("label-position", pos);
      expect(el.getAttribute("label-position")).toBe(pos);
    },
  );

  it("places label before track when label-position=left", () => {
    document.body.innerHTML = "";
    const sw = document.createElement("ui-switch");
    sw.setAttribute("label-position", "left");
    const label = document.createElement("ui-label");
    label.setAttribute("slot", "label");
    label.textContent = "Toggle";
    sw.appendChild(label);
    document.body.appendChild(sw);
    const children = Array.from(sw.shadowRoot!.children);
    const labelIdx = children.indexOf(
      sw.shadowRoot!.querySelector(".label") as Element,
    );
    const trackIdx = children.indexOf(
      sw.shadowRoot!.querySelector(".switch") as Element,
    );
    expect(labelIdx).toBeLessThan(trackIdx);
  });

  it("places label after track when label-position=right", () => {
    document.body.innerHTML = "";
    const sw = document.createElement("ui-switch");
    sw.setAttribute("label-position", "right");
    const label = document.createElement("ui-label");
    label.setAttribute("slot", "label");
    label.textContent = "Toggle";
    sw.appendChild(label);
    document.body.appendChild(sw);
    const children = Array.from(sw.shadowRoot!.children);
    const labelIdx = children.indexOf(
      sw.shadowRoot!.querySelector(".label") as Element,
    );
    const trackIdx = children.indexOf(
      sw.shadowRoot!.querySelector(".switch") as Element,
    );
    expect(labelIdx).toBeGreaterThan(trackIdx);
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns current size", () => {
    el.setAttribute("size", "l");
    expect((el as UiSwitch).size).toBe("l");
  });

  it("size setter updates attribute", () => {
    (el as UiSwitch).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("checked getter returns false by default", () => {
    expect((el as UiSwitch).checked).toBe(false);
  });

  it("checked setter adds attribute when true", () => {
    (el as UiSwitch).checked = true;
    expect(el.hasAttribute("checked")).toBe(true);
  });

  it("checked setter removes attribute when false", () => {
    (el as UiSwitch).checked = true;
    (el as UiSwitch).checked = false;
    expect(el.hasAttribute("checked")).toBe(false);
  });

  it("disabled getter returns false by default", () => {
    expect((el as UiSwitch).disabled).toBe(false);
  });

  it("disabled setter adds attribute when true", () => {
    (el as UiSwitch).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("disabled setter removes attribute when false", () => {
    (el as UiSwitch).disabled = true;
    (el as UiSwitch).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("labelPosition getter returns none by default", () => {
    expect((el as UiSwitch).labelPosition).toBe("none");
  });

  it("labelPosition setter updates attribute", () => {
    (el as UiSwitch).labelPosition = "right";
    expect(el.getAttribute("label-position")).toBe("right");
  });

  // ── Toggle (click) ───────────────────────────────────────────────────────

  it("click toggles checked from false to true", () => {
    el.click();
    expect(el.hasAttribute("checked")).toBe(true);
  });

  it("click toggles checked from true to false", () => {
    el.setAttribute("checked", "");
    el.click();
    expect(el.hasAttribute("checked")).toBe(false);
  });

  it("click dispatches switch-change event", () => {
    let detail: { checked: boolean } | null = null;
    el.addEventListener("switch-change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    el.click();
    expect(detail).not.toBeNull();
    expect(detail!.checked).toBe(true);
  });

  it("switch-change event bubbles", () => {
    let bubbled = false;
    document.body.addEventListener("switch-change", () => {
      bubbled = true;
    });
    el.click();
    expect(bubbled).toBe(true);
  });

  it("switch-change event is composed", () => {
    let composed = false;
    el.addEventListener("switch-change", ((e: CustomEvent) => {
      composed = e.composed;
    }) as EventListener);
    el.click();
    expect(composed).toBe(true);
  });

  // ── Keyboard ──────────────────────────────────────────────────────────────

  it("Space key toggles checked", () => {
    const track = el.shadowRoot!.querySelector(".switch") as HTMLElement;
    track.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(el.hasAttribute("checked")).toBe(true);
  });

  it("Enter key toggles checked", () => {
    const track = el.shadowRoot!.querySelector(".switch") as HTMLElement;
    track.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect(el.hasAttribute("checked")).toBe(true);
  });

  it("other keys do not toggle", () => {
    const track = el.shadowRoot!.querySelector(".switch") as HTMLElement;
    track.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    expect(el.hasAttribute("checked")).toBe(false);
  });

  it("Space dispatches switch-change event", () => {
    let fired = false;
    el.addEventListener("switch-change", () => {
      fired = true;
    });
    const track = el.shadowRoot!.querySelector(".switch") as HTMLElement;
    track.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(fired).toBe(true);
  });

  // ── Disabled ──────────────────────────────────────────────────────────────

  it("click does not toggle when disabled", () => {
    el.setAttribute("disabled", "");
    el.click();
    expect(el.hasAttribute("checked")).toBe(false);
  });

  it("Space does not toggle when disabled", () => {
    el.setAttribute("disabled", "");
    const track = el.shadowRoot!.querySelector(".switch") as HTMLElement;
    track.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(el.hasAttribute("checked")).toBe(false);
  });

  it("does not dispatch switch-change when disabled", () => {
    el.setAttribute("disabled", "");
    let fired = false;
    el.addEventListener("switch-change", () => {
      fired = true;
    });
    el.click();
    expect(fired).toBe(false);
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("track has role=switch", () => {
    const track = el.shadowRoot!.querySelector(".switch");
    expect(track!.getAttribute("role")).toBe("switch");
  });

  it("track has tabindex=0", () => {
    const track = el.shadowRoot!.querySelector(".switch");
    expect(track!.getAttribute("tabindex")).toBe("0");
  });

  it("aria-checked is false by default", () => {
    const track = el.shadowRoot!.querySelector(".switch");
    expect(track!.getAttribute("aria-checked")).toBe("false");
  });

  it("aria-checked updates to true when checked", () => {
    el.setAttribute("checked", "");
    const track = el.shadowRoot!.querySelector(".switch");
    expect(track!.getAttribute("aria-checked")).toBe("true");
  });

  it("aria-checked updates back to false when unchecked", () => {
    el.setAttribute("checked", "");
    el.removeAttribute("checked");
    const track = el.shadowRoot!.querySelector(".switch");
    expect(track!.getAttribute("aria-checked")).toBe("false");
  });

  it("sets default aria-label Toggle", () => {
    const track = el.shadowRoot!.querySelector(".switch");
    expect(track!.getAttribute("aria-label")).toBe("Toggle");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observedAttributes includes size", () => {
    const observed = (customElements.get("ui-switch") as typeof UiSwitch).observedAttributes;
    expect(observed).toContain("size");
  });

  it("observedAttributes includes checked", () => {
    const observed = (customElements.get("ui-switch") as typeof UiSwitch).observedAttributes;
    expect(observed).toContain("checked");
  });

  it("observedAttributes includes disabled", () => {
    const observed = (customElements.get("ui-switch") as typeof UiSwitch).observedAttributes;
    expect(observed).toContain("disabled");
  });

  it("observedAttributes includes label-position", () => {
    const observed = (customElements.get("ui-switch") as typeof UiSwitch).observedAttributes;
    expect(observed).toContain("label-position");
  });
});
