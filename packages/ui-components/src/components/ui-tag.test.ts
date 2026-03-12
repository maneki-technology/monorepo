import { describe, it, expect, beforeEach, vi } from "vitest";
import "./ui-tag.js";
import { STYLES } from "./ui-tag.js";

describe("ui-tag", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-tag");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-tag")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults type to 'basic'", () => {
    expect((el as unknown as { type: string }).type).toBe("basic");
  });

  it("defaults emphasis to 'bold'", () => {
    expect((el as unknown as { emphasis: string }).emphasis).toBe("bold");
  });

  it("defaults state to 'enabled'", () => {
    expect((el as unknown as { state: string }).state).toBe("enabled");
  });

  it("defaults dismissible to false", () => {
    expect((el as unknown as { dismissible: boolean }).dismissible).toBe(false);
  });

  it("defaults check to false", () => {
    expect((el as unknown as { check: boolean }).check).toBe(false);
  });

  // ── Size attribute ──────────────────────────────────────────────────────

  it("reflects size='xs' to attribute", () => {
    (el as unknown as { size: string }).size = "xs";
    expect(el.getAttribute("size")).toBe("xs");
  });

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

  // ── Type attribute ──────────────────────────────────────────────────────

  it("reflects type='basic' to attribute", () => {
    (el as unknown as { type: string }).type = "basic";
    expect(el.getAttribute("type")).toBe("basic");
  });

  it("reflects type='selectable' to attribute", () => {
    (el as unknown as { type: string }).type = "selectable";
    expect(el.getAttribute("type")).toBe("selectable");
  });

  it("reflects type='toggle' to attribute", () => {
    (el as unknown as { type: string }).type = "toggle";
    expect(el.getAttribute("type")).toBe("toggle");
  });

  // ── Emphasis attribute ──────────────────────────────────────────────────

  it("reflects emphasis='bold' to attribute", () => {
    (el as unknown as { emphasis: string }).emphasis = "bold";
    expect(el.getAttribute("emphasis")).toBe("bold");
  });

  it("reflects emphasis='subtle' to attribute", () => {
    (el as unknown as { emphasis: string }).emphasis = "subtle";
    expect(el.getAttribute("emphasis")).toBe("subtle");
  });

  it("reflects emphasis='minimal' to attribute", () => {
    (el as unknown as { emphasis: string }).emphasis = "minimal";
    expect(el.getAttribute("emphasis")).toBe("minimal");
  });

  // ── State attribute ─────────────────────────────────────────────────────

  it("reflects state='enabled' to attribute", () => {
    (el as unknown as { state: string }).state = "enabled";
    expect(el.getAttribute("state")).toBe("enabled");
  });

  it("reflects state='selected' to attribute", () => {
    (el as unknown as { state: string }).state = "selected";
    expect(el.getAttribute("state")).toBe("selected");
  });

  it("reflects state='disabled' to attribute", () => {
    (el as unknown as { state: string }).state = "disabled";
    expect(el.getAttribute("state")).toBe("disabled");
  });

  // ── Dismissible attribute ───────────────────────────────────────────────

  it("reflects dismissible=true to attribute", () => {
    (el as unknown as { dismissible: boolean }).dismissible = true;
    expect(el.hasAttribute("dismissible")).toBe(true);
  });

  it("reflects dismissible=false by removing attribute", () => {
    (el as unknown as { dismissible: boolean }).dismissible = true;
    (el as unknown as { dismissible: boolean }).dismissible = false;
    expect(el.hasAttribute("dismissible")).toBe(false);
  });

  // ── Check attribute ─────────────────────────────────────────────────────

  it("reflects check=true to attribute", () => {
    (el as unknown as { check: boolean }).check = true;
    expect(el.hasAttribute("check")).toBe(true);
  });

  it("reflects check=false by removing attribute", () => {
    (el as unknown as { check: boolean }).check = true;
    (el as unknown as { check: boolean }).check = false;
    expect(el.hasAttribute("check")).toBe(false);
  });

  // ── Shadow DOM structure ───────────────────────────────────────────────

  it("has .base element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".base")).toBeTruthy();
  });

  it("has a <span> as .base element", () => {
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base");
    expect(base!.tagName).toBe("SPAN");
  });

  it("has default slot in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const defaultSlot = shadow.querySelector("slot:not([name])");
    expect(defaultSlot).toBeTruthy();
  });

  it("has slot inside .content element", () => {
    const shadow = el.shadowRoot!;
    const content = shadow.querySelector(".content");
    const slot = content!.querySelector("slot");
    expect(slot).toBeTruthy();
  });

  it("has a stylesheet in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
  });

  it("has .check-icon wrapper in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".check-icon")).toBeTruthy();
  });

  it("has .dismiss-icon wrapper in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".dismiss-icon")).toBeTruthy();
  });

  it("has .content wrapper in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".content")).toBeTruthy();
  });

  // ── Icons created in connectedCallback ────────────────────────────────

  it("creates check ui-icon in connectedCallback", () => {
    const shadow = el.shadowRoot!;
    const checkWrap = shadow.querySelector(".check-icon");
    const icon = checkWrap!.querySelector("ui-icon");
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute("name")).toBe("check");
  });

  it("creates dismiss ui-icon in connectedCallback", () => {
    const shadow = el.shadowRoot!;
    const dismissWrap = shadow.querySelector(".dismiss-icon");
    const icon = dismissWrap!.querySelector("ui-icon");
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute("name")).toBe("close");
  });

  it("does not duplicate icons on multiple connectedCallback calls", () => {
    // Remove and re-append to trigger connectedCallback again
    document.body.removeChild(el);
    document.body.appendChild(el);
    const shadow = el.shadowRoot!;
    const checkIcons = shadow.querySelectorAll(".check-icon ui-icon");
    expect(checkIcons.length).toBe(1);
  });

  // ── Property accessors ────────────────────────────────────────────────

  it("exposes size property accessor", () => {
    const component = el as unknown as { size: string };
    component.size = "l";
    expect(component.size).toBe("l");
    expect(el.getAttribute("size")).toBe("l");
  });

  it("exposes type property accessor", () => {
    const component = el as unknown as { type: string };
    component.type = "selectable";
    expect(component.type).toBe("selectable");
    expect(el.getAttribute("type")).toBe("selectable");
  });

  it("exposes emphasis property accessor", () => {
    const component = el as unknown as { emphasis: string };
    component.emphasis = "subtle";
    expect(component.emphasis).toBe("subtle");
    expect(el.getAttribute("emphasis")).toBe("subtle");
  });

  it("exposes state property accessor", () => {
    const component = el as unknown as { state: string };
    component.state = "selected";
    expect(component.state).toBe("selected");
    expect(el.getAttribute("state")).toBe("selected");
  });

  it("exposes dismissible property accessor", () => {
    const component = el as unknown as { dismissible: boolean };
    component.dismissible = true;
    expect(component.dismissible).toBe(true);
    expect(el.hasAttribute("dismissible")).toBe(true);
  });

  it("exposes check property accessor", () => {
    const component = el as unknown as { check: boolean };
    component.check = true;
    expect(component.check).toBe(true);
    expect(el.hasAttribute("check")).toBe(true);
  });

  it("exposes all typed property accessors together", () => {
    const component = el as unknown as {
      size: string;
      type: string;
      emphasis: string;
      state: string;
      dismissible: boolean;
      check: boolean;
    };

    component.size = "xs";
    expect(component.size).toBe("xs");

    component.type = "toggle";
    expect(component.type).toBe("toggle");

    component.emphasis = "minimal";
    expect(component.emphasis).toBe("minimal");

    component.state = "disabled";
    expect(component.state).toBe("disabled");

    component.dismissible = true;
    expect(component.dismissible).toBe(true);

    component.check = true;
    expect(component.check).toBe(true);
  });

  // ── observedAttributes ────────────────────────────────────────────────

  it("observes size attribute", () => {
    const observed = (
      customElements.get("ui-tag") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("size");
  });

  it("observes type attribute", () => {
    const observed = (
      customElements.get("ui-tag") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("type");
  });

  it("observes emphasis attribute", () => {
    const observed = (
      customElements.get("ui-tag") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("emphasis");
  });

  it("observes state attribute", () => {
    const observed = (
      customElements.get("ui-tag") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("state");
  });

  it("observes dismissible attribute", () => {
    const observed = (
      customElements.get("ui-tag") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("dismissible");
  });

  it("observes check attribute", () => {
    const observed = (
      customElements.get("ui-tag") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("check");
  });

  // ── Attribute via setAttribute ────────────────────────────────────────

  it("reads size from setAttribute", () => {
    el.setAttribute("size", "xs");
    expect((el as unknown as { size: string }).size).toBe("xs");
  });

  it("reads type from setAttribute", () => {
    el.setAttribute("type", "toggle");
    expect((el as unknown as { type: string }).type).toBe("toggle");
  });

  it("reads emphasis from setAttribute", () => {
    el.setAttribute("emphasis", "minimal");
    expect((el as unknown as { emphasis: string }).emphasis).toBe("minimal");
  });

  it("reads state from setAttribute", () => {
    el.setAttribute("state", "selected");
    expect((el as unknown as { state: string }).state).toBe("selected");
  });

  it("reads dismissible from setAttribute", () => {
    el.setAttribute("dismissible", "");
    expect((el as unknown as { dismissible: boolean }).dismissible).toBe(true);
  });

  it("reads check from setAttribute", () => {
    el.setAttribute("check", "");
    expect((el as unknown as { check: boolean }).check).toBe(true);
  });

  // ── Display ───────────────────────────────────────────────────────────

  it("is an inline-flex element via :host", () => {
    const shadow = el.shadowRoot!;
    const styles = shadow.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("display: inline-flex");
  });

  // ── CSS contains expected token references ────────────────────────────

  it("CSS contains --ui-tag-bg custom property", () => {
    expect(STYLES).toContain("--ui-tag-bg");
  });

  it("CSS contains --ui-tag-color custom property", () => {
    expect(STYLES).toContain("--ui-tag-color");
  });

  it("CSS contains --ui-tag-border custom property", () => {
    expect(STYLES).toContain("--ui-tag-border");
  });

  it("CSS contains white-space: nowrap", () => {
    const shadow = el.shadowRoot!;
    const styles = shadow.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("white-space: nowrap");
  });

  it("CSS contains border-radius: 200px for pill shape", () => {
    expect(STYLES).toContain("border-radius: 200px");
  });

  // ── Toggle type specifics ─────────────────────────────────────────────

  it("CSS contains text-transform: uppercase for toggle", () => {
    expect(STYLES).toContain("text-transform: uppercase");
  });

  it("CSS contains font-weight: 500 for toggle", () => {
    expect(STYLES).toContain("font-weight: 500");
  });

  it("CSS contains border-radius: 2px for toggle", () => {
    expect(STYLES).toContain("border-radius: 2px");
  });

  // ── Selectable type specifics ─────────────────────────────────────────

  it("CSS contains cursor: pointer for selectable", () => {
    expect(STYLES).toContain("cursor: pointer");
  });

  it("CSS contains cursor: not-allowed for disabled selectable", () => {
    expect(STYLES).toContain("cursor: not-allowed");
  });

  // ── Dismiss event ─────────────────────────────────────────────────────

  it("fires dismiss event on close icon click", () => {
    (el as unknown as { dismissible: boolean }).dismissible = true;
    const handler = vi.fn();
    el.addEventListener("dismiss", handler);
    const shadow = el.shadowRoot!;
    const dismissWrap = shadow.querySelector(".dismiss-icon")!;
    dismissWrap.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("dismiss event bubbles", () => {
    (el as unknown as { dismissible: boolean }).dismissible = true;
    const handler = vi.fn();
    document.body.addEventListener("dismiss", handler);
    const shadow = el.shadowRoot!;
    const dismissWrap = shadow.querySelector(".dismiss-icon")!;
    dismissWrap.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    document.body.removeEventListener("dismiss", handler);
  });

  it("dismiss event is composed", () => {
    (el as unknown as { dismissible: boolean }).dismissible = true;
    let composed = false;
    el.addEventListener("dismiss", (e) => {
      composed = (e as CustomEvent).composed;
    });
    const shadow = el.shadowRoot!;
    const dismissWrap = shadow.querySelector(".dismiss-icon")!;
    dismissWrap.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(composed).toBe(true);
  });

  it("dismiss event is cancelable", () => {
    (el as unknown as { dismissible: boolean }).dismissible = true;
    let cancelable = false;
    el.addEventListener("dismiss", (e) => {
      cancelable = (e as CustomEvent).cancelable;
    });
    const shadow = el.shadowRoot!;
    const dismissWrap = shadow.querySelector(".dismiss-icon")!;
    dismissWrap.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(cancelable).toBe(true);
  });

  it("does not fire dismiss when selectable and disabled", () => {
    const component = el as unknown as { type: string; state: string; dismissible: boolean };
    component.type = "selectable";
    component.state = "disabled";
    component.dismissible = true;
    const handler = vi.fn();
    el.addEventListener("dismiss", handler);
    const shadow = el.shadowRoot!;
    const dismissWrap = shadow.querySelector(".dismiss-icon")!;
    dismissWrap.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  // ── Icon size ─────────────────────────────────────────────────────────

  it("CSS sets --ui-icon-size: 12px for icons", () => {
    expect(STYLES).toContain("--ui-icon-size: 12px");
  });

  // ── Size CSS specifics ────────────────────────────────────────────────

  it("CSS contains font-size: 11px for xs", () => {
    expect(STYLES).toContain("font-size: 11px");
  });

  it("CSS contains font-size: 12px for s", () => {
    expect(STYLES).toContain("font-size: 12px");
  });

  it("CSS contains font-size: 14px for m/l", () => {
    expect(STYLES).toContain("font-size: 14px");
  });

  it("CSS contains line-height: 16px for xs/s", () => {
    expect(STYLES).toContain("line-height: 16px");
  });

  it("CSS contains line-height: 20px for m/l", () => {
    expect(STYLES).toContain("line-height: 20px");
  });

  // ── Multiple instances ────────────────────────────────────────────────

  it("supports multiple independent instances", () => {
    const el2 = document.createElement("ui-tag");
    document.body.appendChild(el2);

    (el as unknown as { type: string }).type = "basic";
    (el2 as unknown as { type: string }).type = "toggle";

    expect((el as unknown as { type: string }).type).toBe("basic");
    expect((el2 as unknown as { type: string }).type).toBe("toggle");
  });

  it("supports independent emphasis on multiple instances", () => {
    const el2 = document.createElement("ui-tag");
    document.body.appendChild(el2);

    (el as unknown as { emphasis: string }).emphasis = "bold";
    (el2 as unknown as { emphasis: string }).emphasis = "minimal";

    expect((el as unknown as { emphasis: string }).emphasis).toBe("bold");
    expect((el2 as unknown as { emphasis: string }).emphasis).toBe("minimal");
  });

  it("supports independent size on multiple instances", () => {
    const el2 = document.createElement("ui-tag");
    document.body.appendChild(el2);

    (el as unknown as { size: string }).size = "xs";
    (el2 as unknown as { size: string }).size = "l";

    expect((el as unknown as { size: string }).size).toBe("xs");
    expect((el2 as unknown as { size: string }).size).toBe("l");
  });

  // ── Attribute change updates ──────────────────────────────────────────

  it("updates size attribute dynamically", () => {
    (el as unknown as { size: string }).size = "xs";
    expect(el.getAttribute("size")).toBe("xs");
    (el as unknown as { size: string }).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  it("updates type attribute dynamically", () => {
    (el as unknown as { type: string }).type = "basic";
    expect(el.getAttribute("type")).toBe("basic");
    (el as unknown as { type: string }).type = "selectable";
    expect(el.getAttribute("type")).toBe("selectable");
  });

  it("updates emphasis attribute dynamically", () => {
    (el as unknown as { emphasis: string }).emphasis = "bold";
    expect(el.getAttribute("emphasis")).toBe("bold");
    (el as unknown as { emphasis: string }).emphasis = "subtle";
    expect(el.getAttribute("emphasis")).toBe("subtle");
  });

  it("updates state attribute dynamically", () => {
    (el as unknown as { state: string }).state = "enabled";
    expect(el.getAttribute("state")).toBe("enabled");
    (el as unknown as { state: string }).state = "selected";
    expect(el.getAttribute("state")).toBe("selected");
  });

  it("toggles dismissible attribute dynamically", () => {
    (el as unknown as { dismissible: boolean }).dismissible = true;
    expect(el.hasAttribute("dismissible")).toBe(true);
    (el as unknown as { dismissible: boolean }).dismissible = false;
    expect(el.hasAttribute("dismissible")).toBe(false);
  });

  it("toggles check attribute dynamically", () => {
    (el as unknown as { check: boolean }).check = true;
    expect(el.hasAttribute("check")).toBe(true);
    (el as unknown as { check: boolean }).check = false;
    expect(el.hasAttribute("check")).toBe(false);
  });

  // ── DOM order ─────────────────────────────────────────────────────────

  it("has check-icon before content in DOM order", () => {
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    const children = Array.from(base.children);
    const checkIdx = children.findIndex((c) => c.classList.contains("check-icon"));
    const contentIdx = children.findIndex((c) => c.classList.contains("content"));
    expect(checkIdx).toBeLessThan(contentIdx);
  });

  it("has content before dismiss-icon in DOM order", () => {
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    const children = Array.from(base.children);
    const contentIdx = children.findIndex((c) => c.classList.contains("content"));
    const dismissIdx = children.findIndex((c) => c.classList.contains("dismiss-icon"));
    expect(contentIdx).toBeLessThan(dismissIdx);
  });

  // ── Emphasis only applies to basic type (CSS structure) ───────────────

  it("CSS has selectable type selector overriding emphasis", () => {
    expect(STYLES).toContain('[type="selectable"]');
  });

  it("CSS has toggle type selector overriding emphasis", () => {
    expect(STYLES).toContain('[type="toggle"]');
  });

  it("CSS has selectable selected state selector", () => {
    expect(STYLES).toContain('[type="selectable"][state="selected"]');
  });

  it("CSS has selectable disabled state selector", () => {
    expect(STYLES).toContain('[type="selectable"][state="disabled"]');
  });

  // ── Selectable click-to-toggle ──────────────────────────────────────────

  it("toggles state from enabled to selected on click (selectable)", () => {
    const component = el as unknown as { type: string; state: string };
    component.type = "selectable";
    component.state = "enabled";
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(component.state).toBe("selected");
  });

  it("toggles state from selected to enabled on click (selectable)", () => {
    const component = el as unknown as { type: string; state: string };
    component.type = "selectable";
    component.state = "selected";
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(component.state).toBe("enabled");
  });

  it("does not toggle state on click when disabled (selectable)", () => {
    const component = el as unknown as { type: string; state: string };
    component.type = "selectable";
    component.state = "disabled";
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(component.state).toBe("disabled");
  });

  it("does not toggle state on click when type is basic", () => {
    const component = el as unknown as { type: string; state: string };
    component.type = "basic";
    component.state = "enabled";
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(component.state).toBe("enabled");
  });

  it("fires change event with detail.selected=true when toggled to selected", () => {
    const component = el as unknown as { type: string; state: string };
    component.type = "selectable";
    component.state = "enabled";
    const handler = vi.fn();
    el.addEventListener("change", handler);
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ selected: true });
  });

  it("fires change event with detail.selected=false when toggled to enabled", () => {
    const component = el as unknown as { type: string; state: string };
    component.type = "selectable";
    component.state = "selected";
    const handler = vi.fn();
    el.addEventListener("change", handler);
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ selected: false });
  });

  it("change event bubbles and is composed", () => {
    const component = el as unknown as { type: string; state: string };
    component.type = "selectable";
    component.state = "enabled";
    let bubbles = false;
    let composed = false;
    el.addEventListener("change", (e) => {
      bubbles = e.bubbles;
      composed = (e as CustomEvent).composed;
    });
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(bubbles).toBe(true);
    expect(composed).toBe(true);
  });

  it("does not fire change event when disabled selectable is clicked", () => {
    const component = el as unknown as { type: string; state: string };
    component.type = "selectable";
    component.state = "disabled";
    const handler = vi.fn();
    el.addEventListener("change", handler);
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  // ── Color attribute ──────────────────────────────────────────────────────

  it("defaults color to 'none'", () => {
    expect((el as unknown as { color: string }).color).toBe("none");
  });

  it("reflects color='red' to attribute", () => {
    (el as unknown as { color: string }).color = "red";
    expect(el.getAttribute("color")).toBe("red");
  });

  it("reads color from setAttribute", () => {
    el.setAttribute("color", "blue");
    expect((el as unknown as { color: string }).color).toBe("blue");
  });

  it("observes color attribute", () => {
    const observed = (
      customElements.get("ui-tag") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("color");
  });

  it("exposes color property accessor", () => {
    const component = el as unknown as { color: string };
    component.color = "green";
    expect(component.color).toBe("green");
    expect(el.getAttribute("color")).toBe("green");
  });

  it("CSS contains color='red' selector", () => {
    expect(STYLES).toContain('[color="red"]');
  });

  it("CSS contains color='blue' selector", () => {
    expect(STYLES).toContain('[color="blue"]');
  });

  it("CSS contains color='green' selector", () => {
    expect(STYLES).toContain('[color="green"]');
  });

  it("CSS contains color='yellow' selector", () => {
    expect(STYLES).toContain('[color="yellow"]');
  });

  it("CSS contains color='orange' selector", () => {
    expect(STYLES).toContain('[color="orange"]');
  });

  it("CSS contains color='purple' selector", () => {
    expect(STYLES).toContain('[color="purple"]');
  });

  it("CSS contains color='pink' selector", () => {
    expect(STYLES).toContain('[color="pink"]');
  });

  it("CSS contains color='teal' selector", () => {
    expect(STYLES).toContain('[color="teal"]');
  });

  it("CSS contains color='lime' selector", () => {
    expect(STYLES).toContain('[color="lime"]');
  });

  it("CSS contains color='turquoise' selector", () => {
    expect(STYLES).toContain('[color="turquoise"]');
  });

  it("CSS contains color='aqua' selector", () => {
    expect(STYLES).toContain('[color="aqua"]');
  });

  it("CSS contains color='ultramarine' selector", () => {
    expect(STYLES).toContain('[color="ultramarine"]');
  });

  it("CSS contains subtle emphasis selector for color='red'", () => {
    expect(STYLES).toContain('[color="red"][emphasis="subtle"]');
  });

  it("CSS contains minimal emphasis selector for color='red'", () => {
    expect(STYLES).toContain('[color="red"][emphasis="minimal"]');
  });

  it("CSS contains subtle emphasis selector for color='blue'", () => {
    expect(STYLES).toContain('[color="blue"][emphasis="subtle"]');
  });

  it("CSS contains minimal emphasis selector for color='blue'", () => {
    expect(STYLES).toContain('[color="blue"][emphasis="minimal"]');
  });

  it("updates color attribute dynamically", () => {
    (el as unknown as { color: string }).color = "red";
    expect(el.getAttribute("color")).toBe("red");
    (el as unknown as { color: string }).color = "purple";
    expect(el.getAttribute("color")).toBe("purple");
  });

  it("color does not affect selectable type styling (CSS specificity)", () => {
    expect(STYLES).toContain('[type="selectable"]');
    expect(STYLES).toContain('[type="selectable"][state="selected"]');
  });

  it("color does not affect toggle type styling (CSS specificity)", () => {
    expect(STYLES).toContain('[type="toggle"]');
  });

  // ── Editable attribute ──────────────────────────────────────────────────

  it("defaults editable to false", () => {
    expect((el as unknown as { editable: boolean }).editable).toBe(false);
  });

  it("reflects editable=true to attribute", () => {
    (el as unknown as { editable: boolean }).editable = true;
    expect(el.hasAttribute("editable")).toBe(true);
  });

  it("reflects editable=false by removing attribute", () => {
    (el as unknown as { editable: boolean }).editable = true;
    (el as unknown as { editable: boolean }).editable = false;
    expect(el.hasAttribute("editable")).toBe(false);
  });

  it("observes editable attribute", () => {
    const observed = (
      customElements.get("ui-tag") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("editable");
  });

  it("has .add-icon wrapper in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".add-icon")).toBeTruthy();
  });

  it("has .tag-input element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".tag-input")).toBeTruthy();
  });

  it("creates add ui-icon in connectedCallback", () => {
    const shadow = el.shadowRoot!;
    const addWrap = shadow.querySelector(".add-icon");
    const icon = addWrap!.querySelector("ui-icon");
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute("name")).toBe("add");
  });

  it("editable tag shows content in idle state", () => {
    el.setAttribute("editable", "");
    el.textContent = "New tag";
    const shadow = el.shadowRoot!;
    const content = shadow.querySelector(".content")!;
    expect(content).toBeTruthy();
  });

  it("clicking editable tag enters editing mode", () => {
    el.setAttribute("editable", "");
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(base.classList.contains("editing")).toBe(true);
  });

  it("editing mode shows input element", () => {
    el.setAttribute("editable", "");
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const input = shadow.querySelector(".tag-input") as HTMLInputElement;
    expect(input).toBeTruthy();
  });

  it("pressing Enter fires create event with value", () => {
    el.setAttribute("editable", "");
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const input = shadow.querySelector(".tag-input") as HTMLInputElement;
    input.value = "hello";
    const handler = vi.fn();
    el.addEventListener("create", handler);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ value: "hello" });
  });

  it("pressing Escape exits editing without firing create event", () => {
    el.setAttribute("editable", "");
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const input = shadow.querySelector(".tag-input") as HTMLInputElement;
    input.value = "hello";
    const handler = vi.fn();
    el.addEventListener("create", handler);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
    expect(base.classList.contains("editing")).toBe(false);
  });

  it("blur exits editing and submits if text present", () => {
    el.setAttribute("editable", "");
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const input = shadow.querySelector(".tag-input") as HTMLInputElement;
    input.value = "blurred";
    const handler = vi.fn();
    el.addEventListener("create", handler);
    input.dispatchEvent(new Event("blur"));
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ value: "blurred" });
  });

  it("blur exits editing without event if input is empty", () => {
    el.setAttribute("editable", "");
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const input = shadow.querySelector(".tag-input") as HTMLInputElement;
    input.value = "";
    const handler = vi.fn();
    el.addEventListener("create", handler);
    input.dispatchEvent(new Event("blur"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("editable tag reverts to idle after submit", () => {
    el.setAttribute("editable", "");
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const input = shadow.querySelector(".tag-input") as HTMLInputElement;
    input.value = "test";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(base.classList.contains("editing")).toBe(false);
    expect(input.value).toBe("");
  });

  it("create event bubbles and is composed", () => {
    el.setAttribute("editable", "");
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const input = shadow.querySelector(".tag-input") as HTMLInputElement;
    input.value = "test";
    let bubbles = false;
    let composed = false;
    el.addEventListener("create", (e) => {
      bubbles = e.bubbles;
      composed = (e as CustomEvent).composed;
    });
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(bubbles).toBe(true);
    expect(composed).toBe(true);
  });

  it("Enter with empty input does not fire create event", () => {
    el.setAttribute("editable", "");
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base")!;
    base.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const input = shadow.querySelector(".tag-input") as HTMLInputElement;
    input.value = "";
    const handler = vi.fn();
    el.addEventListener("create", handler);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("CSS contains editable selector", () => {
    expect(STYLES).toContain('[editable]');
  });

  it("CSS contains editing class selector", () => {
    expect(STYLES).toContain('.base.editing');
  });
});
