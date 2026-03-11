import { describe, it, expect, beforeEach } from "vitest";
import "./ui-icon.js";
import { STYLES } from "./ui-icon.js";

describe("ui-icon", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-icon");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-icon")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults name to ''", () => {
    expect((el as unknown as { name: string }).name).toBe("");
  });

  it("defaults size to 's'", () => {
    expect((el as unknown as { size: string }).size).toBe("s");
  });

  it("defaults state to 'enabled'", () => {
    expect((el as unknown as { state: string }).state).toBe("enabled");
  });

  it("defaults filled to false", () => {
    expect((el as unknown as { filled: boolean }).filled).toBe(false);
  });

  it("defaults label to ''", () => {
    expect((el as unknown as { label: string }).label).toBe("");
  });

  // ── Size attribute ──────────────────────────────────────────────────────

  it("reflects size='xxs' to attribute", () => {
    (el as unknown as { size: string }).size = "xxs";
    expect(el.getAttribute("size")).toBe("xxs");
  });

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

  // ── State attribute ─────────────────────────────────────────────────────

  it("reflects state='enabled' to attribute", () => {
    (el as unknown as { state: string }).state = "enabled";
    expect(el.getAttribute("state")).toBe("enabled");
  });

  it("reflects state='enabled-inverse' to attribute", () => {
    (el as unknown as { state: string }).state = "enabled-inverse";
    expect(el.getAttribute("state")).toBe("enabled-inverse");
  });

  it("reflects state='hover' to attribute", () => {
    (el as unknown as { state: string }).state = "hover";
    expect(el.getAttribute("state")).toBe("hover");
  });

  it("reflects state='hover-inverse' to attribute", () => {
    (el as unknown as { state: string }).state = "hover-inverse";
    expect(el.getAttribute("state")).toBe("hover-inverse");
  });

  it("reflects state='active' to attribute", () => {
    (el as unknown as { state: string }).state = "active";
    expect(el.getAttribute("state")).toBe("active");
  });

  it("reflects state='active-inverse' to attribute", () => {
    (el as unknown as { state: string }).state = "active-inverse";
    expect(el.getAttribute("state")).toBe("active-inverse");
  });

  it("reflects state='focus' to attribute", () => {
    (el as unknown as { state: string }).state = "focus";
    expect(el.getAttribute("state")).toBe("focus");
  });

  it("reflects state='focus-inverse' to attribute", () => {
    (el as unknown as { state: string }).state = "focus-inverse";
    expect(el.getAttribute("state")).toBe("focus-inverse");
  });

  it("reflects state='disabled' to attribute", () => {
    (el as unknown as { state: string }).state = "disabled";
    expect(el.getAttribute("state")).toBe("disabled");
  });

  it("reflects state='disabled-inverse' to attribute", () => {
    (el as unknown as { state: string }).state = "disabled-inverse";
    expect(el.getAttribute("state")).toBe("disabled-inverse");
  });

  // ── Filled attribute ────────────────────────────────────────────────────

  it("sets filled attribute when filled=true", () => {
    (el as unknown as { filled: boolean }).filled = true;
    expect(el.hasAttribute("filled")).toBe(true);
  });

  it("removes filled attribute when filled=false", () => {
    (el as unknown as { filled: boolean }).filled = true;
    (el as unknown as { filled: boolean }).filled = false;
    expect(el.hasAttribute("filled")).toBe(false);
  });

  // ── Name attribute + ICON_CODEPOINTS lookup ─────────────────────────────

  it("reflects name to attribute", () => {
    (el as unknown as { name: string }).name = "home";
    expect(el.getAttribute("name")).toBe("home");
  });

  it("renders codepoint for known icon name", () => {
    el.setAttribute("name", "home");
    const shadow = el.shadowRoot!;
    const iconEl = shadow.querySelector(".icon")!;
    // ICON_HOME = "\uE88A"
    expect(iconEl.textContent).toBe("\uE88A");
  });

  it("renders codepoint for 'settings'", () => {
    el.setAttribute("name", "settings");
    const shadow = el.shadowRoot!;
    const iconEl = shadow.querySelector(".icon")!;
    // ICON_SETTINGS = "\uE8B8"
    expect(iconEl.textContent).toBe("\uE8B8");
  });

  it("renders codepoint for 'close'", () => {
    el.setAttribute("name", "close");
    const shadow = el.shadowRoot!;
    const iconEl = shadow.querySelector(".icon")!;
    // ICON_CLOSE = "\uE5CD"
    expect(iconEl.textContent).toBe("\uE5CD");
  });

  it("falls back to ligature text for unknown icon name", () => {
    el.setAttribute("name", "unknown_icon_xyz");
    const shadow = el.shadowRoot!;
    const iconEl = shadow.querySelector(".icon")!;
    expect(iconEl.textContent).toBe("unknown_icon_xyz");
  });

  it("falls back to ligature text for arbitrary name", () => {
    el.setAttribute("name", "star");
    const shadow = el.shadowRoot!;
    const iconEl = shadow.querySelector(".icon")!;
    expect(iconEl.textContent).toBe("star");
  });

  it("renders empty text when name is empty", () => {
    el.setAttribute("name", "");
    const shadow = el.shadowRoot!;
    const iconEl = shadow.querySelector(".icon")!;
    expect(iconEl.textContent).toBe("");
  });

  // ── Label / Accessibility ───────────────────────────────────────────────

  it("defaults to role='presentation' and aria-hidden='true'", () => {
    expect(el.getAttribute("role")).toBe("presentation");
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("sets role='img' and aria-label when label is provided", () => {
    (el as unknown as { label: string }).label = "Home icon";
    expect(el.getAttribute("role")).toBe("img");
    expect(el.getAttribute("aria-label")).toBe("Home icon");
    expect(el.hasAttribute("aria-hidden")).toBe(false);
  });

  it("reverts to presentation when label is cleared", () => {
    (el as unknown as { label: string }).label = "Home icon";
    (el as unknown as { label: string }).label = "";
    expect(el.getAttribute("role")).toBe("presentation");
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.hasAttribute("aria-label")).toBe(false);
  });

  it("sets accessibility via setAttribute('label', ...)", () => {
    el.setAttribute("label", "Settings");
    expect(el.getAttribute("role")).toBe("img");
    expect(el.getAttribute("aria-label")).toBe("Settings");
  });

  // ── Shadow DOM structure ───────────────────────────────────────────────

  it("has .icon element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".icon")).toBeTruthy();
  });

  it("has a <span> as .icon element", () => {
    const shadow = el.shadowRoot!;
    const iconEl = shadow.querySelector(".icon");
    expect(iconEl!.tagName).toBe("SPAN");
  });

  it("has adopted stylesheets", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
  });

  // ── Property accessors ────────────────────────────────────────────────

  it("exposes name property accessor", () => {
    const component = el as unknown as { name: string };
    component.name = "home";
    expect(component.name).toBe("home");
    expect(el.getAttribute("name")).toBe("home");
  });

  it("exposes size property accessor", () => {
    const component = el as unknown as { size: string };
    component.size = "l";
    expect(component.size).toBe("l");
    expect(el.getAttribute("size")).toBe("l");
  });

  it("exposes state property accessor", () => {
    const component = el as unknown as { state: string };
    component.state = "hover";
    expect(component.state).toBe("hover");
    expect(el.getAttribute("state")).toBe("hover");
  });

  it("exposes filled property accessor", () => {
    const component = el as unknown as { filled: boolean };
    component.filled = true;
    expect(component.filled).toBe(true);
    expect(el.hasAttribute("filled")).toBe(true);
  });

  it("exposes label property accessor", () => {
    const component = el as unknown as { label: string };
    component.label = "Close";
    expect(component.label).toBe("Close");
    expect(el.getAttribute("label")).toBe("Close");
  });

  it("exposes all typed property accessors together", () => {
    const component = el as unknown as {
      name: string;
      size: string;
      state: string;
      filled: boolean;
      label: string;
    };

    component.name = "settings";
    expect(component.name).toBe("settings");

    component.size = "m";
    expect(component.size).toBe("m");

    component.state = "active";
    expect(component.state).toBe("active");

    component.filled = true;
    expect(component.filled).toBe(true);

    component.label = "Settings icon";
    expect(component.label).toBe("Settings icon");
  });

  // ── observedAttributes ────────────────────────────────────────────────

  it("observes name attribute", () => {
    const observed = (
      customElements.get("ui-icon") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("name");
  });

  it("observes size attribute", () => {
    const observed = (
      customElements.get("ui-icon") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("size");
  });

  it("observes state attribute", () => {
    const observed = (
      customElements.get("ui-icon") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("state");
  });

  it("observes filled attribute", () => {
    const observed = (
      customElements.get("ui-icon") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("filled");
  });

  it("observes label attribute", () => {
    const observed = (
      customElements.get("ui-icon") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("label");
  });

  // ── Attribute via setAttribute ────────────────────────────────────────

  it("reads name from setAttribute", () => {
    el.setAttribute("name", "error");
    expect((el as unknown as { name: string }).name).toBe("error");
  });

  it("reads size from setAttribute", () => {
    el.setAttribute("size", "xxs");
    expect((el as unknown as { size: string }).size).toBe("xxs");
  });

  it("reads state from setAttribute", () => {
    el.setAttribute("state", "disabled");
    expect((el as unknown as { state: string }).state).toBe("disabled");
  });

  it("reads filled from setAttribute", () => {
    el.setAttribute("filled", "");
    expect((el as unknown as { filled: boolean }).filled).toBe(true);
  });

  it("reads label from setAttribute", () => {
    el.setAttribute("label", "Info");
    expect((el as unknown as { label: string }).label).toBe("Info");
  });

  // ── Display ───────────────────────────────────────────────────────────

  it("is an inline-flex element via :host", () => {
    const shadow = el.shadowRoot!;
    const styles = shadow.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("display: inline-flex");
  });

  // ── CSS contains expected token references ────────────────────────────

  it("CSS contains --ui-icon-color custom property", () => {
    expect(STYLES).toContain("--ui-icon-color");
  });

  it("CSS contains --ui-icon-size custom property", () => {
    expect(STYLES).toContain("--ui-icon-size");
  });

  it("CSS contains --ui-icon-bg custom property", () => {
    expect(STYLES).toContain("--ui-icon-bg");
  });

  it("CSS contains font-family: Material Symbols Outlined", () => {
    expect(STYLES).toContain('font-family: "Material Symbols Outlined"');
  });

  it("CSS contains font-variation-settings for FILL 0", () => {
    expect(STYLES).toContain("'FILL' 0");
  });

  it("CSS contains font-variation-settings for FILL 1 (filled)", () => {
    expect(STYLES).toContain("'FILL' 1");
  });

  it("CSS contains @font-face declaration", () => {
    expect(STYLES).toContain("@font-face");
    expect(STYLES).toContain('src: local("Material Symbols Outlined")');
  });

  // ── Multiple instances ────────────────────────────────────────────────

  it("supports multiple independent instances", () => {
    const el2 = document.createElement("ui-icon");
    document.body.appendChild(el2);

    (el as unknown as { name: string }).name = "home";
    (el2 as unknown as { name: string }).name = "settings";

    expect((el as unknown as { name: string }).name).toBe("home");
    expect((el2 as unknown as { name: string }).name).toBe("settings");

    const icon1 = el.shadowRoot!.querySelector(".icon")!;
    const icon2 = el2.shadowRoot!.querySelector(".icon")!;
    expect(icon1.textContent).toBe("\uE88A");
    expect(icon2.textContent).toBe("\uE8B8");
  });

  it("supports independent state on multiple instances", () => {
    const el2 = document.createElement("ui-icon");
    document.body.appendChild(el2);

    (el as unknown as { state: string }).state = "hover";
    (el2 as unknown as { state: string }).state = "disabled";

    expect((el as unknown as { state: string }).state).toBe("hover");
    expect((el2 as unknown as { state: string }).state).toBe("disabled");
  });
});
