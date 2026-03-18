import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-tooltip.js";
import type { TooltipSize, TooltipPlacement } from "./ui-tooltip.js";
import { UiTooltip } from "./ui-tooltip.js";

describe("ui-tooltip", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-tooltip");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-tooltip")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .panel element", () => {
    expect(el.shadowRoot!.querySelector(".panel")).not.toBeNull();
  });

  it("panel is hidden by default", () => {
    const panel = el.shadowRoot!.querySelector(".panel") as HTMLElement;
    expect(panel.style.display !== "flex").toBe(true);
  });

  it("renders a .text element", () => {
    expect(el.shadowRoot!.querySelector(".text")).not.toBeNull();
  });

  it("renders a .close button", () => {
    expect(el.shadowRoot!.querySelector(".close")).not.toBeNull();
  });

  it("close button is hidden by default", () => {
    const close = el.shadowRoot!.querySelector(".close") as HTMLElement;
    const style = getComputedStyle(close);
    // Without dismissible attribute, close button has display:none via CSS
    expect(el.hasAttribute("dismissible")).toBe(false);
  });

  it("renders an .arrow element", () => {
    expect(el.shadowRoot!.querySelector(".arrow")).not.toBeNull();
  });

  it("renders a trigger slot", () => {
    const slot = el.shadowRoot!.querySelector("slot");
    expect(slot).not.toBeNull();
  });

  // ── Default attributes ─────────────────────────────────────────────────────

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults placement to top", () => {
    expect(el.getAttribute("placement")).toBe("top");
  });

  it("defaults trigger to hover", () => {
    expect(el.getAttribute("trigger")).toBe("hover");
  });

  it("is not open by default", () => {
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("is not dismissible by default", () => {
    expect(el.hasAttribute("dismissible")).toBe(false);
  });

  // ── observedAttributes ─────────────────────────────────────────────────────

  it("observes the correct attributes", () => {
    expect(UiTooltip.observedAttributes).toEqual([
      "size",
      "placement",
      "text",
      "dismissible",
      "open",
      "trigger",
    ]);
  });

  // ── Size attribute ─────────────────────────────────────────────────────────

  it.each(["xs", "s", "m", "l"] as TooltipSize[])("accepts size=%s", (size) => {
    el.setAttribute("size", size);
    expect(el.getAttribute("size")).toBe(size);
  });

  // ── Placement attribute ────────────────────────────────────────────────────

  it.each([
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ] as TooltipPlacement[])("accepts placement=%s", (placement) => {
    el.setAttribute("placement", placement);
    expect(el.getAttribute("placement")).toBe(placement);
  });

  // ── Text attribute ─────────────────────────────────────────────────────────

  it("sets text content via attribute", () => {
    el.setAttribute("text", "Hello tooltip");
    const textEl = el.shadowRoot!.querySelector(".text") as HTMLElement;
    expect(textEl.textContent).toBe("Hello tooltip");
  });

  it("updates text content when attribute changes", () => {
    el.setAttribute("text", "First");
    el.setAttribute("text", "Second");
    const textEl = el.shadowRoot!.querySelector(".text") as HTMLElement;
    expect(textEl.textContent).toBe("Second");
  });

  it("clears text content when attribute removed", () => {
    el.setAttribute("text", "Hello");
    el.removeAttribute("text");
    const textEl = el.shadowRoot!.querySelector(".text") as HTMLElement;
    expect(textEl.textContent).toBe("");
  });

  // ── Dismissible attribute ──────────────────────────────────────────────────

  it("sets dismissible attribute", () => {
    el.setAttribute("dismissible", "");
    expect(el.hasAttribute("dismissible")).toBe(true);
  });

  it("removes dismissible attribute", () => {
    el.setAttribute("dismissible", "");
    el.removeAttribute("dismissible");
    expect(el.hasAttribute("dismissible")).toBe(false);
  });

  // ── Open attribute ─────────────────────────────────────────────────────────

  it("sets open attribute", () => {
    el.setAttribute("open", "");
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("removes open attribute", () => {
    el.setAttribute("open", "");
    el.removeAttribute("open");
    expect(el.hasAttribute("open")).toBe(false);
  });

  // ── Trigger attribute ──────────────────────────────────────────────────────

  it("sets trigger attribute", () => {
    el.setAttribute("trigger", "click");
    expect(el.getAttribute("trigger")).toBe("click");
  });

  // ── Property accessors: size ───────────────────────────────────────────────

  it("gets size property", () => {
    expect((el as unknown as UiTooltip).size).toBe("m");
  });

  it("sets size property", () => {
    (el as unknown as UiTooltip).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  it("size property reflects attribute", () => {
    el.setAttribute("size", "xs");
    expect((el as unknown as UiTooltip).size).toBe("xs");
  });

  // ── Property accessors: placement ──────────────────────────────────────────

  it("gets placement property", () => {
    expect((el as unknown as UiTooltip).placement).toBe("top");
  });

  it("sets placement property", () => {
    (el as unknown as UiTooltip).placement = "bottom-right";
    expect(el.getAttribute("placement")).toBe("bottom-right");
  });

  it("placement property reflects attribute", () => {
    el.setAttribute("placement", "left");
    expect((el as unknown as UiTooltip).placement).toBe("left");
  });

  // ── Property accessors: text ───────────────────────────────────────────────

  it("gets text property", () => {
    el.setAttribute("text", "Hello");
    expect((el as unknown as UiTooltip).text).toBe("Hello");
  });

  it("sets text property", () => {
    (el as unknown as UiTooltip).text = "World";
    expect(el.getAttribute("text")).toBe("World");
  });

  it("text property defaults to empty string", () => {
    expect((el as unknown as UiTooltip).text).toBe("");
  });

  // ── Property accessors: dismissible ────────────────────────────────────────

  it("gets dismissible property", () => {
    expect((el as unknown as UiTooltip).dismissible).toBe(false);
  });

  it("sets dismissible property to true", () => {
    (el as unknown as UiTooltip).dismissible = true;
    expect(el.hasAttribute("dismissible")).toBe(true);
  });

  it("sets dismissible property to false", () => {
    (el as unknown as UiTooltip).dismissible = true;
    (el as unknown as UiTooltip).dismissible = false;
    expect(el.hasAttribute("dismissible")).toBe(false);
  });

  // ── Property accessors: open ───────────────────────────────────────────────

  it("gets open property", () => {
    expect((el as unknown as UiTooltip).open).toBe(false);
  });

  it("sets open property to true", () => {
    (el as unknown as UiTooltip).open = true;
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("sets open property to false", () => {
    (el as unknown as UiTooltip).open = true;
    (el as unknown as UiTooltip).open = false;
    expect(el.hasAttribute("open")).toBe(false);
  });

  // ── Property accessors: trigger ────────────────────────────────────────────

  it("gets trigger property", () => {
    expect((el as unknown as UiTooltip).trigger).toBe("hover");
  });

  it("sets trigger property", () => {
    (el as unknown as UiTooltip).trigger = "click";
    expect(el.getAttribute("trigger")).toBe("click");
  });

  // ── Open / close behavior ──────────────────────────────────────────────────

  it("setting open attribute shows panel", () => {
    el.setAttribute("open", "");
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("removing open attribute hides panel", () => {
    el.setAttribute("open", "");
    el.removeAttribute("open");
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("open property setter calls _open", () => {
    (el as unknown as UiTooltip).open = true;
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("open property setter calls _close", () => {
    (el as unknown as UiTooltip).open = true;
    (el as unknown as UiTooltip).open = false;
    expect(el.hasAttribute("open")).toBe(false);
  });

  // ── Hover trigger ──────────────────────────────────────────────────────────

  it("mouseenter opens tooltip when trigger is hover", () => {
    el.dispatchEvent(new MouseEvent("mouseenter"));
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("mouseleave closes tooltip when trigger is hover", () => {
    el.dispatchEvent(new MouseEvent("mouseenter"));
    el.dispatchEvent(new MouseEvent("mouseleave"));
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("mouseenter does not open when trigger is not hover", () => {
    el.setAttribute("trigger", "click");
    el.dispatchEvent(new MouseEvent("mouseenter"));
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("mouseleave does not close dismissible tooltip", () => {
    el.setAttribute("dismissible", "");
    el.dispatchEvent(new MouseEvent("mouseenter"));
    el.dispatchEvent(new MouseEvent("mouseleave"));
    expect(el.hasAttribute("open")).toBe(true);
  });

  // ── Focus trigger ──────────────────────────────────────────────────────────

  it("focusin opens tooltip when trigger is hover", () => {
    el.dispatchEvent(new FocusEvent("focusin"));
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("focusout closes tooltip when trigger is hover", () => {
    el.dispatchEvent(new FocusEvent("focusin"));
    el.dispatchEvent(new FocusEvent("focusout"));
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("focusout does not close dismissible tooltip", () => {
    el.setAttribute("dismissible", "");
    el.dispatchEvent(new FocusEvent("focusin"));
    el.dispatchEvent(new FocusEvent("focusout"));
    expect(el.hasAttribute("open")).toBe(true);
  });

  // ── Dismissible close button ───────────────────────────────────────────────

  it("close button click closes tooltip", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    const closeBtn = el.shadowRoot!.querySelector(".close") as HTMLButtonElement;
    closeBtn.click();
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("close button has aria-label", () => {
    const closeBtn = el.shadowRoot!.querySelector(".close") as HTMLButtonElement;
    expect(closeBtn.getAttribute("aria-label")).toBe("Close");
  });

  it("close button has type=button", () => {
    const closeBtn = el.shadowRoot!.querySelector(".close") as HTMLButtonElement;
    expect(closeBtn.type).toBe("button");
  });

  // ── ARIA ───────────────────────────────────────────────────────────────────

  it("panel has role=tooltip", () => {
    const panel = el.shadowRoot!.querySelector(".panel") as HTMLElement;
    expect(panel.getAttribute("role")).toBe("tooltip");
  });

  // ── Close button icon ──────────────────────────────────────────────────────

  it("close button contains a material icon span", () => {
    const icon = el.shadowRoot!.querySelector(
      ".close .material-symbols-outlined",
    ) as HTMLElement;
    expect(icon).not.toBeNull();
  });

  it("close icon has content", () => {
    const icon = el.shadowRoot!.querySelector(
      ".close .material-symbols-outlined",
    ) as HTMLElement;
    expect(icon.textContent).toBeTruthy();
  });
});
