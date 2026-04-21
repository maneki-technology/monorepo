import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-pull-to-refresh.js";
import { UiPullToRefresh, type PullToRefreshVariant } from "./ui-pull-to-refresh.js";
import { STYLES } from "./ui-pull-to-refresh.styles.js";

describe("ui-pull-to-refresh", () => {
  let el: UiPullToRefresh;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-pull-to-refresh") as UiPullToRefresh;
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-pull-to-refresh")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .loading-info container", () => {
    const info = el.shadowRoot!.querySelector(".loading-info");
    expect(info).not.toBeNull();
  });

  it("renders a .spinner element", () => {
    const spinner = el.shadowRoot!.querySelector(".spinner");
    expect(spinner).not.toBeNull();
  });

  it("renders a .text element", () => {
    const text = el.shadowRoot!.querySelector(".text");
    expect(text).not.toBeNull();
  });

  it("renders a material-symbols-outlined icon inside spinner", () => {
    const icon = el.shadowRoot!.querySelector(".spinner .material-symbols-outlined");
    expect(icon).not.toBeNull();
  });

  it("spinner icon contains the progress_activity codepoint", () => {
    const icon = el.shadowRoot!.querySelector(".spinner .material-symbols-outlined");
    expect(icon!.textContent).toBeTruthy();
  });

  it("default text is 'Refreshing content'", () => {
    const text = el.shadowRoot!.querySelector(".text");
    expect(text!.textContent).toBe("Refreshing content");
  });

  // ── Active attribute ──────────────────────────────────────────────────────

  it("is hidden when no active attribute is set", () => {
    expect(el.hasAttribute("active")).toBe(false);
  });

  it("is visible when active attribute is set", () => {
    el.setAttribute("active", "");
    expect(el.hasAttribute("active")).toBe(true);
  });

  it("active property getter returns false by default", () => {
    expect(el.active).toBe(false);
  });

  it("active property getter returns true when attribute is set", () => {
    el.setAttribute("active", "");
    expect(el.active).toBe(true);
  });

  it("active property setter adds the attribute", () => {
    el.active = true;
    expect(el.hasAttribute("active")).toBe(true);
  });

  it("active property setter removes the attribute", () => {
    el.setAttribute("active", "");
    el.active = false;
    expect(el.hasAttribute("active")).toBe(false);
  });

  // ── Variant attribute ─────────────────────────────────────────────────────

  it("defaults to light variant", () => {
    expect(el.variant).toBe("light");
  });

  it("reflects variant attribute via property getter", () => {
    el.setAttribute("variant", "dark");
    expect(el.variant).toBe("dark");
  });

  it("variant property setter updates the attribute", () => {
    el.variant = "dark";
    expect(el.getAttribute("variant")).toBe("dark");
  });

  it("variant property setter sets light", () => {
    el.variant = "light" as PullToRefreshVariant;
    expect(el.getAttribute("variant")).toBe("light");
  });

  // ── Text attribute ────────────────────────────────────────────────────────

  it("default text property is 'Refreshing content'", () => {
    expect(el.text).toBe("Refreshing content");
  });

  it("text attribute updates the displayed text", () => {
    el.setAttribute("text", "Loading data...");
    const text = el.shadowRoot!.querySelector(".text");
    expect(text!.textContent).toBe("Loading data...");
  });

  it("text property getter reflects the attribute", () => {
    el.setAttribute("text", "Please wait");
    expect(el.text).toBe("Please wait");
  });

  it("text property setter updates the attribute", () => {
    el.text = "Syncing";
    expect(el.getAttribute("text")).toBe("Syncing");
  });

  it("text property setter updates the displayed text", () => {
    el.text = "Syncing";
    const text = el.shadowRoot!.querySelector(".text");
    expect(text!.textContent).toBe("Syncing");
  });

  it("removing text attribute resets to default", () => {
    el.setAttribute("text", "Custom");
    el.removeAttribute("text");
    const text = el.shadowRoot!.querySelector(".text");
    expect(text!.textContent).toBe("Refreshing content");
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("sets role=status on connectedCallback", () => {
    expect(el.getAttribute("role")).toBe("status");
  });

  it("sets aria-live=polite on connectedCallback", () => {
    expect(el.getAttribute("aria-live")).toBe("polite");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observes active, variant, and text attributes", () => {
    const Ctor = customElements.get("ui-pull-to-refresh") as typeof UiPullToRefresh;
    expect(Ctor.observedAttributes).toEqual(["active", "variant", "text", "size"]);
  });

  // ── STYLES ────────────────────────────────────────────────────────────────

  it("STYLES contains @keyframes spin", () => {
    expect(STYLES).toContain("@keyframes spin");
  });

  it("STYLES contains :host(:not([active])) hide rule", () => {
    expect(STYLES).toContain(":host(:not([active]))");
    expect(STYLES).toContain("display: none");
  });

  it("STYLES contains light variant rules", () => {
    expect(STYLES).toContain(':host([variant="light"])');
  });

  it("STYLES contains dark variant rules", () => {
    expect(STYLES).toContain(':host([variant="dark"])');
  });

  it("STYLES contains prefers-reduced-motion media query", () => {
    expect(STYLES).toContain("prefers-reduced-motion: reduce");
  });

  it("STYLES contains .loading-info styles", () => {
    expect(STYLES).toContain(".loading-info");
  });

  it("STYLES contains .spinner styles", () => {
    expect(STYLES).toContain(".spinner");
  });

  it("STYLES contains .text styles", () => {
    expect(STYLES).toContain(".text");
  });
});
