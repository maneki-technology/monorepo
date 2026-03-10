import { describe, it, expect, beforeEach } from "vitest";
import "./ui-input-group.js";
import "./ui-input.js";

describe("ui-input-group", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-input-group");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-input-group")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  // ── Size attribute ───────────────────────────────────────────────────────

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

  // ── Shadow DOM structure ─────────────────────────────────────────────────

  it("has .wrapper element", () => {
    expect(el.shadowRoot!.querySelector(".wrapper")).toBeTruthy();
  });

  it("has .prefix element", () => {
    expect(el.shadowRoot!.querySelector(".prefix")).toBeTruthy();
  });

  it("has .suffix element", () => {
    expect(el.shadowRoot!.querySelector(".suffix")).toBeTruthy();
  });

  it("has .input-slot element", () => {
    expect(el.shadowRoot!.querySelector(".input-slot")).toBeTruthy();
  });

  it("has two .separator elements", () => {
    const separators = el.shadowRoot!.querySelectorAll(".separator");
    expect(separators.length).toBe(2);
  });

  // ── Slots ────────────────────────────────────────────────────────────────

  it("has a prefix slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="prefix"]');
    expect(slot).toBeTruthy();
  });

  it("has a suffix slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="suffix"]');
    expect(slot).toBeTruthy();
  });

  it("has a default slot for ui-input", () => {
    const slot = el.shadowRoot!.querySelector("slot:not([name])");
    expect(slot).toBeTruthy();
  });

  // ── Prefix/Suffix visibility ─────────────────────────────────────────────

  it("prefix is hidden by default", () => {
    const prefix = el.shadowRoot!.querySelector(".prefix") as HTMLElement;
    expect(prefix.classList.contains("visible")).toBe(false);
  });

  it("suffix is hidden by default", () => {
    const suffix = el.shadowRoot!.querySelector(".suffix") as HTMLElement;
    expect(suffix.classList.contains("visible")).toBe(false);
  });

  it("separators are hidden by default", () => {
    const separators = el.shadowRoot!.querySelectorAll(".separator");
    separators.forEach((sep) => {
      expect((sep as HTMLElement).classList.contains("visible")).toBe(false);
    });
  });

  it("shows prefix and separator when prefix slot has content", async () => {
    const span = document.createElement("span");
    span.slot = "prefix";
    span.textContent = "https://";
    el.appendChild(span);

    // Wait for slotchange event
    await new Promise((r) => setTimeout(r, 0));

    const prefix = el.shadowRoot!.querySelector(".prefix") as HTMLElement;
    expect(prefix.classList.contains("visible")).toBe(true);

    const separators = el.shadowRoot!.querySelectorAll(".separator");
    expect((separators[0] as HTMLElement).classList.contains("visible")).toBe(true);
  });

  it("shows suffix and separator when suffix slot has content", async () => {
    const span = document.createElement("span");
    span.slot = "suffix";
    span.textContent = "Open URL";
    el.appendChild(span);

    await new Promise((r) => setTimeout(r, 0));

    const suffix = el.shadowRoot!.querySelector(".suffix") as HTMLElement;
    expect(suffix.classList.contains("visible")).toBe(true);

    const separators = el.shadowRoot!.querySelectorAll(".separator");
    expect((separators[1] as HTMLElement).classList.contains("visible")).toBe(true);
  });

  it("hides prefix when slotted content is removed", async () => {
    const span = document.createElement("span");
    span.slot = "prefix";
    span.textContent = "https://";
    el.appendChild(span);

    await new Promise((r) => setTimeout(r, 0));

    const prefix = el.shadowRoot!.querySelector(".prefix") as HTMLElement;
    expect(prefix.classList.contains("visible")).toBe(true);

    el.removeChild(span);
    await new Promise((r) => setTimeout(r, 0));

    expect(prefix.classList.contains("visible")).toBe(false);
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  it("sets role='group' on connected", () => {
    expect(el.getAttribute("role")).toBe("group");
  });

  it("does not override existing role", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-input-group");
    el2.setAttribute("role", "search");
    document.body.appendChild(el2);
    expect(el2.getAttribute("role")).toBe("search");
  });

  // ── Property accessors roundtrip ─────────────────────────────────────────

  it("exposes typed size property accessor", () => {
    const component = el as unknown as { size: string };
    component.size = "l";
    expect(component.size).toBe("l");
    component.size = "s";
    expect(component.size).toBe("s");
    component.size = "m";
    expect(component.size).toBe("m");
  });

  // ── Styles ───────────────────────────────────────────────────────────────

  it("contains size CSS rules in styles", () => {
    const styles = el.shadowRoot!.querySelector("style")!.textContent!;
    expect(styles).toContain(':host([size="s"])');
    expect(styles).toContain(':host([size="l"])');
  });

  it("contains ::slotted(ui-input) rule to remove border", () => {
    const styles = el.shadowRoot!.querySelector("style")!.textContent!;
    expect(styles).toContain("::slotted(ui-input)");
  });

  // ── Composition with ui-input ────────────────────────────────────────────

  it("accepts a ui-input in the default slot", () => {
    const input = document.createElement("ui-input");
    el.appendChild(input);
    const defaultSlot = el.shadowRoot!.querySelector("slot:not([name])") as HTMLSlotElement;
    const assigned = defaultSlot.assignedNodes();
    expect(assigned.length).toBe(1);
    expect(assigned[0]).toBe(input);
  });
});
