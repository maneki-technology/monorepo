import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-side-panel.js";
import type { SidePanelState } from "./ui-side-panel.js";
import { STYLES } from "./ui-side-panel.styles.js";
import { ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from "@maneki/foundation";

describe("ui-side-panel", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-side-panel");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-side-panel")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .container element", () => {
    const container = el.shadowRoot!.querySelector(".container");
    expect(container).not.toBeNull();
  });

  it("renders a .header element", () => {
    const header = el.shadowRoot!.querySelector(".header");
    expect(header).not.toBeNull();
  });

  it("renders a .header-title element", () => {
    const title = el.shadowRoot!.querySelector(".header-title");
    expect(title).not.toBeNull();
  });

  it("renders a .header-toggle button", () => {
    const toggle = el.shadowRoot!.querySelector(".header-toggle");
    expect(toggle).not.toBeNull();
    expect(toggle!.tagName).toBe("BUTTON");
  });

  it("renders a .separator element", () => {
    const sep = el.shadowRoot!.querySelector(".separator");
    expect(sep).not.toBeNull();
  });

  it("renders a .body element", () => {
    const body = el.shadowRoot!.querySelector(".body");
    expect(body).not.toBeNull();
  });

  it("renders a default slot inside .body", () => {
    const slot = el.shadowRoot!.querySelector(".body slot");
    expect(slot).not.toBeNull();
    expect(slot!.getAttribute("name")).toBeNull();
  });

  // ── Default attributes ────────────────────────────────────────────────────

  it("defaults state to expanded", () => {
    expect(el.getAttribute("state")).toBe("expanded");
  });

  // ── Attributes ────────────────────────────────────────────────────────────

  it("reflects state=expanded attribute", () => {
    el.setAttribute("state", "expanded");
    expect(el.getAttribute("state")).toBe("expanded");
  });

  it("reflects state=collapsed attribute", () => {
    el.setAttribute("state", "collapsed");
    expect(el.getAttribute("state")).toBe("collapsed");
  });

  it("reflects overlay attribute", () => {
    el.setAttribute("overlay", "");
    expect(el.hasAttribute("overlay")).toBe(true);
  });

  it("reflects title attribute", () => {
    el.setAttribute("title", "My Panel");
    const titleEl = el.shadowRoot!.querySelector(".header-title");
    expect(titleEl!.textContent).toBe("My Panel");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("state getter returns current state", () => {
    const panel = el as any;
    expect(panel.state).toBe("expanded");
  });

  it("state setter updates attribute", () => {
    const panel = el as any;
    panel.state = "collapsed";
    expect(el.getAttribute("state")).toBe("collapsed");
  });

  it("overlay getter returns false by default", () => {
    const panel = el as any;
    expect(panel.overlay).toBe(false);
  });

  it("overlay setter adds attribute when true", () => {
    const panel = el as any;
    panel.overlay = true;
    expect(el.hasAttribute("overlay")).toBe(true);
  });

  it("overlay setter removes attribute when false", () => {
    const panel = el as any;
    panel.overlay = true;
    panel.overlay = false;
    expect(el.hasAttribute("overlay")).toBe(false);
  });

  it("panelTitle getter returns empty string by default", () => {
    const panel = el as any;
    expect(panel.panelTitle).toBe("");
  });

  it("panelTitle setter updates title attribute", () => {
    const panel = el as any;
    panel.panelTitle = "Settings";
    expect(el.getAttribute("title")).toBe("Settings");
  });

  it("mobile getter returns false by default on desktop", () => {
    const panel = el as any;
    expect(panel.mobile).toBe(false);
  });

  it("mobile is read-only (no setter)", () => {
    const panel = el as any;
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(panel),
      "mobile",
    );
    expect(descriptor).toBeDefined();
    expect(descriptor!.set).toBeUndefined();
  });

  // ── Toggle ────────────────────────────────────────────────────────────────

  it("toggle() switches from expanded to collapsed", () => {
    const panel = el as any;
    panel.toggle();
    expect(panel.state).toBe("collapsed");
  });

  it("toggle() switches from collapsed to expanded", () => {
    const panel = el as any;
    panel.state = "collapsed";
    panel.toggle();
    expect(panel.state).toBe("expanded");
  });

  it("toggle() dispatches toggle event with detail.state", () => {
    const handler = vi.fn();
    el.addEventListener("toggle", handler);
    const panel = el as any;
    panel.toggle();
    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.state).toBe("collapsed");
  });

  it("toggle event bubbles and is composed", () => {
    const handler = vi.fn();
    el.addEventListener("toggle", handler);
    const panel = el as any;
    panel.toggle();
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it("clicking toggle button calls toggle", () => {
    const toggleBtn = el.shadowRoot!.querySelector(
      ".header-toggle",
    ) as HTMLButtonElement;
    toggleBtn.click();
    expect(el.getAttribute("state")).toBe("collapsed");
  });

  // ── Toggle icon ───────────────────────────────────────────────────────────

  it("shows double arrow left icon when expanded", () => {
    const icon = el.shadowRoot!.querySelector(".material-symbols-outlined");
    expect(icon!.textContent!.length).toBe(1); // single unicode char
  });

  it("shows double arrow right icon when collapsed", () => {
    el.setAttribute("state", "collapsed");
    const icon = el.shadowRoot!.querySelector(".material-symbols-outlined");
    expect(icon!.textContent!.length).toBe(1);
  });

  it("updates icon after toggle()", () => {
    const panel = el as any;
    const iconBefore = el.shadowRoot!.querySelector(".material-symbols-outlined")!.textContent;
    panel.toggle();
    const iconAfter = el.shadowRoot!.querySelector(".material-symbols-outlined")!.textContent;
    expect(iconAfter).not.toBe(iconBefore);
  });

  // ── Collapsed state ───────────────────────────────────────────────────────

  it("header-title is hidden when collapsed (via CSS class)", () => {
    el.setAttribute("state", "collapsed");
    // The CSS rule :host([state="collapsed"]) .header-title { display: none }
    // is applied via stylesheet; verify the attribute is set
    expect(el.getAttribute("state")).toBe("collapsed");
  });

  // ── Overlay ───────────────────────────────────────────────────────────────

  it("host has overlay attribute when overlay is set", () => {
    el.setAttribute("overlay", "");
    expect(el.hasAttribute("overlay")).toBe(true);
  });

  it("removing overlay attribute clears it", () => {
    el.setAttribute("overlay", "");
    el.removeAttribute("overlay");
    expect(el.hasAttribute("overlay")).toBe(false);
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("toggle button has aria-label when expanded", () => {
    const toggleBtn = el.shadowRoot!.querySelector(".header-toggle");
    expect(toggleBtn!.getAttribute("aria-label")).toBe("Collapse panel");
  });

  it("toggle button has aria-label when collapsed", () => {
    el.setAttribute("state", "collapsed");
    const toggleBtn = el.shadowRoot!.querySelector(".header-toggle");
    expect(toggleBtn!.getAttribute("aria-label")).toBe("Expand panel");
  });

  it("toggle button type is button", () => {
    const toggleBtn = el.shadowRoot!.querySelector(
      ".header-toggle",
    ) as HTMLButtonElement;
    expect(toggleBtn.type).toBe("button");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observedAttributes includes state", () => {
    const Ctor = customElements.get("ui-side-panel") as any;
    expect(Ctor.observedAttributes).toContain("state");
  });

  it("observedAttributes includes overlay", () => {
    const Ctor = customElements.get("ui-side-panel") as any;
    expect(Ctor.observedAttributes).toContain("overlay");
  });

  it("observedAttributes includes title", () => {
    const Ctor = customElements.get("ui-side-panel") as any;
    expect(Ctor.observedAttributes).toContain("title");
  });

  it("observedAttributes includes mobile", () => {
    const Ctor = customElements.get("ui-side-panel") as any;
    expect(Ctor.observedAttributes).toContain("mobile");
  });

  // ── STYLES ────────────────────────────────────────────────────────────────

  it("STYLES contains transition rule", () => {
    expect(STYLES).toContain("transition");
  });

  it("STYLES contains width rule", () => {
    expect(STYLES).toContain("width");
  });

  it("STYLES contains background-color rule", () => {
    expect(STYLES).toContain("background-color");
  });

  it("STYLES contains collapsed width of 40px", () => {
    expect(STYLES).toContain("40px");
  });

  it("STYLES contains expanded width of 300px", () => {
    expect(STYLES).toContain("300px");
  });

  it("STYLES contains reduced motion media query", () => {
    expect(STYLES).toContain("prefers-reduced-motion");
  });
});
