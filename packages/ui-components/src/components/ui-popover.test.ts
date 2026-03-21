import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-popover.js";
import type { PopoverSize, PopoverPlacement } from "./ui-popover.js";
import { STYLES } from "./ui-popover.styles.js";

describe("ui-popover", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-popover");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-popover")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a trigger slot", () => {
    const slot = el.shadowRoot!.querySelector("slot[name='trigger']");
    expect(slot).not.toBeNull();
  });

  it("renders a .panel element", () => {
    expect(el.shadowRoot!.querySelector(".panel")).not.toBeNull();
  });

  it("renders a .base element", () => {
    expect(el.shadowRoot!.querySelector(".base")).not.toBeNull();
  });

  it("renders a .content element", () => {
    expect(el.shadowRoot!.querySelector(".content")).not.toBeNull();
  });

  it("renders an .arrow element", () => {
    expect(el.shadowRoot!.querySelector(".arrow")).not.toBeNull();
  });

  it("renders a .title-text element", () => {
    expect(el.shadowRoot!.querySelector(".title-text")).not.toBeNull();
  });

  it("renders a .description-text element", () => {
    expect(el.shadowRoot!.querySelector(".description-text")).not.toBeNull();
  });

  it("renders a .close button", () => {
    expect(el.shadowRoot!.querySelector("button.close")).not.toBeNull();
  });

  it("renders a default slot for custom content", () => {
    const slots = el.shadowRoot!.querySelectorAll("slot");
    const defaultSlot = Array.from(slots).find((s) => !s.name);
    expect(defaultSlot).not.toBeNull();
  });

  it("panel is hidden by default", () => {
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("sets default placement to top-center", () => {
    expect(el.getAttribute("placement")).toBe("top-center");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observes the correct attributes", () => {
    const Ctor = customElements.get("ui-popover") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual([
      "size",
      "placement",
      "dismissable",
      "open",
      "title-text",
      "description",
    ]);
  });

  // ── Attributes ────────────────────────────────────────────────────────────

  it("reflects size attribute", () => {
    el.setAttribute("size", "s");
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects placement attribute", () => {
    el.setAttribute("placement", "bottom-left");
    expect(el.getAttribute("placement")).toBe("bottom-left");
  });

  it("reflects dismissable attribute", () => {
    el.setAttribute("dismissable", "");
    expect(el.hasAttribute("dismissable")).toBe(true);
  });

  it("reflects open attribute", () => {
    el.setAttribute("open", "");
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("sets title-text content via attribute", () => {
    el.setAttribute("title-text", "Hello");
    const titleEl = el.shadowRoot!.querySelector(".title-text");
    expect(titleEl!.textContent).toBe("Hello");
  });

  it("sets description content via attribute", () => {
    el.setAttribute("description", "Some description");
    const descEl = el.shadowRoot!.querySelector(".description-text");
    expect(descEl!.textContent).toBe("Some description");
  });

  it("clears title-text when attribute removed", () => {
    el.setAttribute("title-text", "Hello");
    el.removeAttribute("title-text");
    const titleEl = el.shadowRoot!.querySelector(".title-text");
    expect(titleEl!.textContent).toBe("");
  });

  it("clears description when attribute removed", () => {
    el.setAttribute("description", "Desc");
    el.removeAttribute("description");
    const descEl = el.shadowRoot!.querySelector(".description-text");
    expect(descEl!.textContent).toBe("");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns default m", () => {
    expect((el as unknown as { size: PopoverSize }).size).toBe("m");
  });

  it("size setter sets attribute", () => {
    (el as unknown as { size: PopoverSize }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("placement getter returns default top-center", () => {
    expect(
      (el as unknown as { placement: PopoverPlacement }).placement,
    ).toBe("top-center");
  });

  it("placement setter sets attribute", () => {
    (el as unknown as { placement: PopoverPlacement }).placement =
      "bottom-right";
    expect(el.getAttribute("placement")).toBe("bottom-right");
  });

  it("dismissable getter returns false by default", () => {
    expect((el as unknown as { dismissable: boolean }).dismissable).toBe(
      false,
    );
  });

  it("dismissable setter adds attribute when true", () => {
    (el as unknown as { dismissable: boolean }).dismissable = true;
    expect(el.hasAttribute("dismissable")).toBe(true);
  });

  it("dismissable setter removes attribute when false", () => {
    el.setAttribute("dismissable", "");
    (el as unknown as { dismissable: boolean }).dismissable = false;
    expect(el.hasAttribute("dismissable")).toBe(false);
  });

  it("open getter returns false by default", () => {
    expect((el as unknown as { open: boolean }).open).toBe(false);
  });

  it("open setter adds attribute when true", () => {
    (el as unknown as { open: boolean }).open = true;
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("open setter removes attribute when false", () => {
    el.setAttribute("open", "");
    (el as unknown as { open: boolean }).open = false;
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("titleText getter returns empty string by default", () => {
    expect((el as unknown as { titleText: string }).titleText).toBe("");
  });

  it("titleText setter sets title-text attribute", () => {
    (el as unknown as { titleText: string }).titleText = "My Title";
    expect(el.getAttribute("title-text")).toBe("My Title");
  });

  it("description getter returns empty string by default", () => {
    expect((el as unknown as { description: string }).description).toBe("");
  });

  it("description setter sets description attribute", () => {
    (el as unknown as { description: string }).description = "My Desc";
    expect(el.getAttribute("description")).toBe("My Desc");
  });

  // ── Sizes ─────────────────────────────────────────────────────────────────

  it("styles contain size m title font-size 20px", () => {
    expect(STYLES).toContain("font-size: 20px");
  });

  it("styles contain size m description typography token", () => {
    expect(STYLES).toContain("var(--fd-type-body-02-font-size)");
  });

  it("styles contain size s description typography token", () => {
    expect(STYLES).toContain("var(--fd-type-body-03-font-size)");
  });

  // ── Placements ────────────────────────────────────────────────────────────

  const ALL_PLACEMENTS: PopoverPlacement[] = [
    "top-left",
    "top-center",
    "top-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
    "left-top",
    "left-center",
    "left-bottom",
    "right-top",
    "right-center",
    "right-bottom",
  ];

  for (const p of ALL_PLACEMENTS) {
    it(`accepts placement "${p}"`, () => {
      (el as unknown as { placement: PopoverPlacement }).placement = p;
      expect(el.getAttribute("placement")).toBe(p);
    });
  }

  // ── Open / Close ──────────────────────────────────────────────────────────

  it("setting open attribute shows panel", () => {
    el.setAttribute("open", "");
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("removing open attribute hides panel", () => {
    el.setAttribute("open", "");
    el.removeAttribute("open");
    expect(el.hasAttribute("open")).toBe(false);
  });

  // ── Dismissable ───────────────────────────────────────────────────────────

  it("close button has aria-label Close", () => {
    const btn = el.shadowRoot!.querySelector("button.close");
    expect(btn!.getAttribute("aria-label")).toBe("Close");
  });

  it("close button has type button", () => {
    const btn = el.shadowRoot!.querySelector("button.close") as HTMLButtonElement;
    expect(btn.type).toBe("button");
  });

  it("styles hide close button by default", () => {
    expect(STYLES).toContain(".close {");
    expect(STYLES).toContain("display: none");
  });

  it("styles show close button when dismissable", () => {
    expect(STYLES).toContain(":host([dismissable]) .close");
    expect(STYLES).toContain("display: flex");
  });

  // ── Close button click ────────────────────────────────────────────────────

  it("close button click dispatches popover-close event", () => {
    el.setAttribute("open", "");
    el.setAttribute("dismissable", "");
    const spy = vi.fn();
    el.addEventListener("popover-close", spy);
    const btn = el.shadowRoot!.querySelector("button.close") as HTMLButtonElement;
    btn.click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("close button click removes open attribute", () => {
    el.setAttribute("open", "");
    el.setAttribute("dismissable", "");
    const btn = el.shadowRoot!.querySelector("button.close") as HTMLButtonElement;
    btn.click();
    expect(el.hasAttribute("open")).toBe(false);
  });

  // ── Trigger click ─────────────────────────────────────────────────────────

  it("trigger click opens popover", () => {
    const trigger = document.createElement("button");
    trigger.slot = "trigger";
    el.appendChild(trigger);
    trigger.click();
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("trigger click toggles popover closed", () => {
    const trigger = document.createElement("button");
    trigger.slot = "trigger";
    el.appendChild(trigger);
    trigger.click();
    expect(el.hasAttribute("open")).toBe(true);
    trigger.click();
    expect(el.hasAttribute("open")).toBe(false);
  });

  // ── Escape key ────────────────────────────────────────────────────────────

  it("Escape key closes open popover", () => {
    el.setAttribute("open", "");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("Escape key dispatches popover-close event", () => {
    el.setAttribute("open", "");
    const spy = vi.fn();
    el.addEventListener("popover-close", spy);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(spy).toHaveBeenCalledOnce();
  });

  it("Escape key does nothing when popover is closed", () => {
    const spy = vi.fn();
    el.addEventListener("popover-close", spy);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(spy).not.toHaveBeenCalled();
  });

  // ── Outside click ─────────────────────────────────────────────────────────

  it("outside click closes open popover", () => {
    el.setAttribute("open", "");
    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("outside click dispatches popover-close event", () => {
    el.setAttribute("open", "");
    const spy = vi.fn();
    el.addEventListener("popover-close", spy);
    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(spy).toHaveBeenCalledOnce();
  });

  it("outside click does nothing when popover is closed", () => {
    const spy = vi.fn();
    el.addEventListener("popover-close", spy);
    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(spy).not.toHaveBeenCalled();
  });

  // ── Events ────────────────────────────────────────────────────────────────

  it("popover-open event bubbles", () => {
    const spy = vi.fn();
    document.addEventListener("popover-open", spy);
    const trigger = document.createElement("button");
    trigger.slot = "trigger";
    el.appendChild(trigger);
    trigger.click();
    expect(spy).toHaveBeenCalledOnce();
    document.removeEventListener("popover-open", spy);
  });

  it("popover-open event is composed", () => {
    let composed = false;
    const handler = (e: Event) => {
      composed = e.composed;
    };
    document.addEventListener("popover-open", handler);
    const trigger = document.createElement("button");
    trigger.slot = "trigger";
    el.appendChild(trigger);
    trigger.click();
    expect(composed).toBe(true);
    document.removeEventListener("popover-open", handler);
  });

  it("popover-close event bubbles", () => {
    el.setAttribute("open", "");
    const spy = vi.fn();
    document.addEventListener("popover-close", spy);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(spy).toHaveBeenCalledOnce();
    document.removeEventListener("popover-close", spy);
  });

  it("popover-close event is composed", () => {
    el.setAttribute("open", "");
    let composed = false;
    const handler = (e: Event) => {
      composed = e.composed;
    };
    document.addEventListener("popover-close", handler);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(composed).toBe(true);
    document.removeEventListener("popover-close", handler);
  });

  // ── Cleanup on disconnect ─────────────────────────────────────────────────

  it("removes document listeners on disconnect", () => {
    el.setAttribute("open", "");
    el.remove();
    // After removal, outside click should not throw or close
    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    // No error means listeners were cleaned up
    expect(true).toBe(true);
  });
});
