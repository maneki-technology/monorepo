import { describe, it, expect, afterEach } from "vitest";
import "./ui-list-header.js";

function create(attrs = ""): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = `<ui-list-header ${attrs}></ui-list-header>`;
  document.body.appendChild(el);
  return el.querySelector("ui-list-header")!;
}

describe("ui-list-header", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-list-header")).toBeDefined();
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

  it("defaults role to 'heading'", () => {
    const el = create();
    expect(el.getAttribute("role")).toBe("heading");
  });

  it("renders .top-border in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".top-border")).not.toBeNull();
  });

  it("renders .content in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".content")).not.toBeNull();
  });

  it("renders .heading in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".heading")).not.toBeNull();
  });

  it("renders .collapse-btn in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".collapse-btn")).not.toBeNull();
  });

  it("renders .bottom-border in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".bottom-border")).not.toBeNull();
  });

  // ── Size attribute ────────────────────────────────────────────────────────

  it("reflects size='s' to attribute", () => {
    const el = create('size="s"');
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects size='m' to attribute", () => {
    const el = create('size="m"');
    expect(el.getAttribute("size")).toBe("m");
  });

  it("reflects size='l' to attribute", () => {
    const el = create('size="l"');
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Top border ────────────────────────────────────────────────────────────

  it("does not have top-border attribute by default", () => {
    const el = create();
    expect(el.hasAttribute("top-border")).toBe(false);
  });

  it("sets top-border attribute", () => {
    const el = create("top-border");
    expect(el.hasAttribute("top-border")).toBe(true);
  });

  // ── Collapse button ───────────────────────────────────────────────────────

  it("collapse button has type='button'", () => {
    const el = create();
    const btn = el.shadowRoot!.querySelector(".collapse-btn") as HTMLButtonElement;
    expect(btn.type).toBe("button");
  });

  it("collapse button has aria-label", () => {
    const el = create();
    const btn = el.shadowRoot!.querySelector(".collapse-btn") as HTMLButtonElement;
    expect(btn.getAttribute("aria-label")).toBe("Collapse");
  });

  it("dispatches collapse event on button click", () => {
    const el = create();
    let fired = false;
    el.addEventListener("collapse", () => { fired = true; });
    const btn = el.shadowRoot!.querySelector(".collapse-btn") as HTMLButtonElement;
    btn.click();
    expect(fired).toBe(true);
  });

  it("collapse event bubbles", () => {
    const el = create();
    let bubbled = false;
    document.body.addEventListener("collapse", () => { bubbled = true; });
    const btn = el.shadowRoot!.querySelector(".collapse-btn") as HTMLButtonElement;
    btn.click();
    expect(bubbled).toBe(true);
  });

  // ── Slot content ──────────────────────────────────────────────────────────

  it("renders default slot for heading text", () => {
    const el = create();
    const slot = el.shadowRoot!.querySelector(".heading slot:not([name])");
    expect(slot).not.toBeNull();
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
    const el = document.createElement("ui-list-header");
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  // ── Cleanup ───────────────────────────────────────────────────────────────

  it("removes event listeners on disconnect", () => {
    const el = create();
    const btn = el.shadowRoot!.querySelector(".collapse-btn") as HTMLButtonElement;
    el.remove();
    let fired = false;
    el.addEventListener("collapse", () => { fired = true; });
    btn.click();
    expect(fired).toBe(false);
  });

  it("does not set defaults when not connected", () => {
    const el = document.createElement("ui-list-header");
    expect(el.hasAttribute("size")).toBe(false);
  });
});
