import { describe, it, expect, afterEach } from "vitest";
import "./ui-list-group.js";

function create(attrs = "", inner = ""): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = `<ui-list-group ${attrs}>${inner}</ui-list-group>`;
  document.body.appendChild(el);
  return el.querySelector("ui-list-group")!;
}

describe("ui-list-group", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-list-group")).toBeDefined();
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("creates a shadow root", () => {
    const el = create();
    expect(el.shadowRoot).not.toBeNull();
  });

  it("defaults size to 'm'", () => {
    const el = create();
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults role to 'listbox'", () => {
    const el = create();
    expect(el.getAttribute("role")).toBe("listbox");
  });

  it("renders header slot in shadow DOM", () => {
    const el = create();
    const slot = el.shadowRoot!.querySelector('slot[name="header"]');
    expect(slot).not.toBeNull();
  });

  it("renders .items container in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".items")).not.toBeNull();
  });

  it("renders default slot inside .items", () => {
    const el = create();
    const items = el.shadowRoot!.querySelector(".items");
    const slot = items!.querySelector("slot:not([name])");
    expect(slot).not.toBeNull();
  });

  // ── Size propagation ──────────────────────────────────────────────────────

  it("propagates size to ui-list-header children", () => {
    const el = create('size="l"', '<ui-list-header slot="header">H</ui-list-header>');
    const header = el.querySelector("ui-list-header")!;
    expect(header.getAttribute("size")).toBe("l");
  });

  it("propagates size to ui-list-item children", () => {
    const el = create('size="s"', '<ui-list-item>Item</ui-list-item>');
    const item = el.querySelector("ui-list-item")!;
    expect(item.getAttribute("size")).toBe("s");
  });

  it("updates children size when size attribute changes", () => {
    const el = create('size="m"', '<ui-list-item>Item</ui-list-item>');
    el.setAttribute("size", "l");
    const item = el.querySelector("ui-list-item")!;
    expect(item.getAttribute("size")).toBe("l");
  });

  it("does not propagate size to non-list children", () => {
    const el = create('size="l"', '<div class="other">Other</div>');
    const div = el.querySelector(".other")!;
    expect(div.hasAttribute("size")).toBe(false);
  });

  // ── Collapsed state ───────────────────────────────────────────────────────

  it("is not collapsed by default", () => {
    const el = create();
    expect((el as unknown as { collapsed: boolean }).collapsed).toBe(false);
  });

  it("sets collapsed attribute", () => {
    const el = create("collapsed");
    expect((el as unknown as { collapsed: boolean }).collapsed).toBe(true);
  });

  it("removes collapsed attribute via property", () => {
    const el = create("collapsed");
    (el as unknown as { collapsed: boolean }).collapsed = false;
    expect(el.hasAttribute("collapsed")).toBe(false);
  });

  it("adds collapsed attribute via property", () => {
    const el = create();
    (el as unknown as { collapsed: boolean }).collapsed = true;
    expect(el.hasAttribute("collapsed")).toBe(true);
  });

  // ── Collapse event from header ────────────────────────────────────────────

  it("toggles collapsed when collapse event is received", () => {
    const el = create("", '<ui-list-header slot="header">H</ui-list-header>');
    expect((el as unknown as { collapsed: boolean }).collapsed).toBe(false);
    el.dispatchEvent(new CustomEvent("collapse", { bubbles: true }));
    expect((el as unknown as { collapsed: boolean }).collapsed).toBe(true);
  });

  it("toggles collapsed back on second collapse event", () => {
    const el = create("", '<ui-list-header slot="header">H</ui-list-header>');
    el.dispatchEvent(new CustomEvent("collapse", { bubbles: true }));
    el.dispatchEvent(new CustomEvent("collapse", { bubbles: true }));
    expect((el as unknown as { collapsed: boolean }).collapsed).toBe(false);
  });

  // ── Property getters/setters ──────────────────────────────────────────────

  it("size getter returns attribute value", () => {
    const el = create('size="l"');
    expect((el as unknown as { size: string }).size).toBe("l");
  });

  it("size setter reflects to attribute", () => {
    const el = create();
    (el as unknown as { size: string }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("size getter defaults to 'm' when no attribute", () => {
    const el = document.createElement("ui-list-group");
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("collapsed getter returns boolean", () => {
    const el = create("collapsed");
    expect((el as unknown as { collapsed: boolean }).collapsed).toBe(true);
  });

  // ── Cleanup ───────────────────────────────────────────────────────────────

  it("removes collapse listener on disconnect", () => {
    const el = create();
    el.remove();
    // After disconnect, collapse event should not toggle collapsed
    (el as unknown as { collapsed: boolean }).collapsed = false;
    el.dispatchEvent(new CustomEvent("collapse", { bubbles: true }));
    expect((el as unknown as { collapsed: boolean }).collapsed).toBe(false);
  });

  it("does not set defaults when not connected", () => {
    const el = document.createElement("ui-list-group");
    expect(el.hasAttribute("size")).toBe(false);
  });
});
