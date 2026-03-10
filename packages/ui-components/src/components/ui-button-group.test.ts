import { describe, it, expect, beforeEach } from "vitest";
import "./ui-button.js";
import "./ui-button-group.js";

describe("ui-button-group", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-button-group");
    document.body.appendChild(el);
  });

  it("registers as a custom element", () => {
    expect(customElements.get("ui-button-group")).toBeDefined();
  });

  it("renders a shadow DOM with a slot", () => {
    const slot = el.shadowRoot?.querySelector("slot");
    expect(slot).toBeTruthy();
  });

  it("has observedAttributes for size, action, emphasis, shape", () => {
    const Ctor = customElements.get("ui-button-group") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual([
      "size",
      "action",
      "emphasis",
      "shape",
      "aria-label",
    ]);
  });

  // ── Size property ────────────────────────────────────────────────────

  it("exposes size property", () => {
    (el as unknown as { size: string | null }).size = "l";
    expect(el.getAttribute("size")).toBe("l");
    expect((el as unknown as { size: string | null }).size).toBe("l");
  });

  // ── Action property ──────────────────────────────────────────────────

  it("exposes action property", () => {
    (el as unknown as { action: string | null }).action = "destructive";
    expect(el.getAttribute("action")).toBe("destructive");
    expect((el as unknown as { action: string | null }).action).toBe(
      "destructive"
    );
  });

  // ── Emphasis property ────────────────────────────────────────────────

  it("exposes emphasis property", () => {
    (el as unknown as { emphasis: string | null }).emphasis = "subtle";
    expect(el.getAttribute("emphasis")).toBe("subtle");
    expect((el as unknown as { emphasis: string | null }).emphasis).toBe(
      "subtle"
    );
  });

  // ── Shape property ──────────────────────────────────────────────────

  it("exposes shape property", () => {
    (el as unknown as { shape: string | null }).shape = "rounded";
    expect(el.getAttribute("shape")).toBe("rounded");
    expect((el as unknown as { shape: string | null }).shape).toBe("rounded");
  });

  // ── Attribute propagation to children ────────────────────────────────

  it("propagates size to child buttons", () => {
    const btn1 = document.createElement("ui-button");
    const btn2 = document.createElement("ui-button");
    el.appendChild(btn1);
    el.appendChild(btn2);

    (el as unknown as { size: string | null }).size = "l";
    // Call private method directly since happy-dom may not fire slotchange
    (el as unknown as { _propagateAttributes: () => void })._propagateAttributes();

    expect(btn1.getAttribute("size")).toBe("l");
    expect(btn2.getAttribute("size")).toBe("l");
  });

  it("propagates action to child buttons", () => {
    const btn1 = document.createElement("ui-button");
    const btn2 = document.createElement("ui-button");
    el.appendChild(btn1);
    el.appendChild(btn2);

    (el as unknown as { action: string | null }).action = "destructive";
    (el as unknown as { _propagateAttributes: () => void })._propagateAttributes();

    expect(btn1.getAttribute("action")).toBe("destructive");
    expect(btn2.getAttribute("action")).toBe("destructive");
  });

  it("propagates emphasis to child buttons", () => {
    const btn1 = document.createElement("ui-button");
    const btn2 = document.createElement("ui-button");
    el.appendChild(btn1);
    el.appendChild(btn2);

    (el as unknown as { emphasis: string | null }).emphasis = "subtle";
    (el as unknown as { _propagateAttributes: () => void })._propagateAttributes();

    expect(btn1.getAttribute("emphasis")).toBe("subtle");
    expect(btn2.getAttribute("emphasis")).toBe("subtle");
  });

  it("removes propagated attributes when group attribute removed", () => {
    const btn1 = document.createElement("ui-button");
    const btn2 = document.createElement("ui-button");
    el.appendChild(btn1);
    el.appendChild(btn2);

    // Set attribute
    (el as unknown as { size: string | null }).size = "l";
    (el as unknown as { _propagateAttributes: () => void })._propagateAttributes();
    expect(btn1.getAttribute("size")).toBe("l");

    // Remove attribute
    (el as unknown as { size: string | null }).size = null;
    (el as unknown as { _propagateAttributes: () => void })._propagateAttributes();
    expect(btn1.getAttribute("size")).toBeNull();
    expect(btn2.getAttribute("size")).toBeNull();
  });

  it("does not propagate shape to children", () => {
    const btn1 = document.createElement("ui-button");
    const btn2 = document.createElement("ui-button");
    el.appendChild(btn1);
    el.appendChild(btn2);

    (el as unknown as { shape: string | null }).shape = "rounded";
    (el as unknown as { _propagateAttributes: () => void })._propagateAttributes();

    expect(btn1.getAttribute("shape")).toBeNull();
    expect(btn2.getAttribute("shape")).toBeNull();
  });
});
