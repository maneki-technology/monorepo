import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-person-item.js";
import "./ui-person-group.js";
import type { PersonItemSize } from "./ui-person-item.js";

describe("ui-person-group", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-person-group");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-person-group")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .title element", () => {
    expect(el.shadowRoot!.querySelector(".title")).not.toBeNull();
  });

  it("renders a .items element", () => {
    expect(el.shadowRoot!.querySelector(".items")).not.toBeNull();
  });

  it("renders a default slot inside .items", () => {
    const slot = el.shadowRoot!.querySelector(".items slot");
    expect(slot).not.toBeNull();
  });

  // ── Title ─────────────────────────────────────────────────────────────────

  it("sets title text from attribute", () => {
    el.setAttribute("title", "Team Members");
    expect(el.shadowRoot!.querySelector(".title")!.textContent).toBe(
      "Team Members",
    );
  });

  it("clears title text when attribute removed", () => {
    el.setAttribute("title", "Team");
    el.removeAttribute("title");
    expect(el.shadowRoot!.querySelector(".title")!.textContent).toBe("");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns default s", () => {
    expect((el as unknown as { size: PersonItemSize }).size).toBe("s");
  });

  it("size setter updates attribute", () => {
    (el as unknown as { size: PersonItemSize }).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observedAttributes includes size and title", () => {
    const Ctor = customElements.get("ui-person-group") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual(
      expect.arrayContaining(["size", "title"]),
    );
  });

  it("observedAttributes has exactly 2 entries", () => {
    const Ctor = customElements.get("ui-person-group") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes.length).toBe(2);
  });

  // ── Size propagation ──────────────────────────────────────────────────────

  it("propagates size to slotted ui-person-item children", async () => {
    const item = document.createElement("ui-person-item");
    el.appendChild(item);
    el.setAttribute("size", "l");
    // Wait for slotchange microtask
    await new Promise((r) => setTimeout(r, 0));
    expect(item.getAttribute("size")).toBe("l");
  });

  it("propagates size on connect when items already present", async () => {
    document.body.innerHTML = "";
    const group = document.createElement("ui-person-group");
    group.setAttribute("size", "m");
    const item = document.createElement("ui-person-item");
    group.appendChild(item);
    document.body.appendChild(group);
    await new Promise((r) => setTimeout(r, 0));
    expect(item.getAttribute("size")).toBe("m");
  });

  it("does not propagate size to non-ui-person-item children", async () => {
    const div = document.createElement("div");
    el.appendChild(div);
    el.setAttribute("size", "l");
    await new Promise((r) => setTimeout(r, 0));
    expect(div.hasAttribute("size")).toBe(false);
  });

  // ── Slot ──────────────────────────────────────────────────────────────────

  it("slot accepts ui-person-item elements", () => {
    const item = document.createElement("ui-person-item");
    item.setAttribute("name", "Alice");
    el.appendChild(item);
    expect(el.querySelector("ui-person-item")).not.toBeNull();
  });
});
