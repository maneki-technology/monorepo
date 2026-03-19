import { describe, it, expect, beforeEach } from "vitest";
import "./ui-tree-group.js";
import "./ui-tree-item.js";

describe("ui-tree-group", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-tree-group");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-tree-group")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .search wrapper", () => {
    expect(el.shadowRoot!.querySelector(".search")).not.toBeNull();
  });

  it("renders a .tree wrapper", () => {
    expect(el.shadowRoot!.querySelector(".tree")).not.toBeNull();
  });

  it("renders a search slot with name=search", () => {
    const slot = el.shadowRoot!.querySelector("slot[name='search']");
    expect(slot).not.toBeNull();
  });

  it("renders a default slot for tree items", () => {
    const slot = el.shadowRoot!.querySelector("slot:not([name])");
    expect(slot).not.toBeNull();
  });

  // ── Default attributes ────────────────────────────────────────────────────

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  // ── Tree role ─────────────────────────────────────────────────────────────

  it("sets role=tree on the .tree container", () => {
    const tree = el.shadowRoot!.querySelector(".tree");
    expect(tree!.getAttribute("role")).toBe("tree");
  });

  // ── Size attribute ────────────────────────────────────────────────────────

  it("accepts size=s", () => {
    el.setAttribute("size", "s");
    expect(el.getAttribute("size")).toBe("s");
  });

  it("accepts size=l", () => {
    el.setAttribute("size", "l");
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns attribute value", () => {
    el.setAttribute("size", "l");
    expect((el as any).size).toBe("l");
  });

  it("size setter updates attribute", () => {
    (el as any).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("size getter defaults to m when no attribute", () => {
    expect((el as any).size).toBe("m");
  });

  // ── Size propagation ──────────────────────────────────────────────────────

  it("propagates size to slotted ui-tree-item children", async () => {
    const item = document.createElement("ui-tree-item");
    el.appendChild(item);
    // Wait for slotchange
    await new Promise((r) => setTimeout(r, 0));
    expect(item.getAttribute("size")).toBe("m");
  });

  it("updates children size when size attribute changes", async () => {
    const item = document.createElement("ui-tree-item");
    el.appendChild(item);
    await new Promise((r) => setTimeout(r, 0));
    el.setAttribute("size", "l");
    await new Promise((r) => setTimeout(r, 0));
    expect(item.getAttribute("size")).toBe("l");
  });

  it("does not propagate size to non-tree-item children", async () => {
    const div = document.createElement("div");
    el.appendChild(div);
    await new Promise((r) => setTimeout(r, 0));
    expect(div.hasAttribute("size")).toBe(false);
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observes the correct attributes", () => {
    const observed = (customElements.get("ui-tree-group") as any).observedAttributes;
    expect(observed).toEqual(["size", "searchable"]);
  });
});
