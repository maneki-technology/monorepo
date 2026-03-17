import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-queryfield.js";
import "./ui-queryfield-tag.js";
import type { QueryfieldSize } from "./ui-queryfield.js";
import { FIELD_STYLES } from "./ui-queryfield.styles.js";

describe("ui-queryfield", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-queryfield");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-queryfield")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  it("exports FIELD_STYLES string", () => {
    expect(typeof FIELD_STYLES).toBe("string");
    expect(FIELD_STYLES.length).toBeGreaterThan(0);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .wrapper element", () => {
    const wrapper = el.shadowRoot!.querySelector(".wrapper");
    expect(wrapper).not.toBeNull();
  });

  it("renders a .search-icon element", () => {
    const icon = el.shadowRoot!.querySelector(".search-icon");
    expect(icon).not.toBeNull();
  });

  it("renders a material-symbols-outlined icon inside search-icon", () => {
    const icon = el.shadowRoot!.querySelector(
      ".search-icon .material-symbols-outlined",
    );
    expect(icon).not.toBeNull();
  });

  it("renders a .tags container", () => {
    const tags = el.shadowRoot!.querySelector(".tags");
    expect(tags).not.toBeNull();
  });

  it("renders a slot[name=tags] inside .tags", () => {
    const slot = el.shadowRoot!.querySelector(".tags slot[name='tags']");
    expect(slot).not.toBeNull();
  });

  it("renders an input element", () => {
    const input = el.shadowRoot!.querySelector("input.input");
    expect(input).not.toBeNull();
  });

  it("input has type=text", () => {
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    expect(input.type).toBe("text");
  });

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults placeholder to Search...", () => {
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    expect(input.placeholder).toBe("Search...");
  });

  // ── observedAttributes ─────────────────────────────────────────────────────

  it("observes size, placeholder, disabled, value", () => {
    const Ctor = customElements.get("ui-queryfield") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual([
      "size",
      "placeholder",
      "disabled",
      "value",
    ]);
  });

  // ── Attributes: size ──────────────────────────────────────────────────────

  it("reflects size=s as attribute", () => {
    el.setAttribute("size", "s");
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects size=m as attribute", () => {
    el.setAttribute("size", "m");
    expect(el.getAttribute("size")).toBe("m");
  });

  it("reflects size=l as attribute", () => {
    el.setAttribute("size", "l");
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Attributes: placeholder ───────────────────────────────────────────────

  it("sets input placeholder from attribute", () => {
    el.setAttribute("placeholder", "Type here...");
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    expect(input.placeholder).toBe("Type here...");
  });

  it("resets placeholder to default when attribute removed", () => {
    el.setAttribute("placeholder", "Custom");
    el.removeAttribute("placeholder");
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    expect(input.placeholder).toBe("Search...");
  });

  // ── Attributes: disabled ──────────────────────────────────────────────────

  it("disables input when disabled attribute set", () => {
    el.setAttribute("disabled", "");
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("enables input when disabled attribute removed", () => {
    el.setAttribute("disabled", "");
    el.removeAttribute("disabled");
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    expect(input.disabled).toBe(false);
  });

  // ── Attributes: value ─────────────────────────────────────────────────────

  it("sets input value from attribute", () => {
    el.setAttribute("value", "hello");
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("clears input value when attribute removed", () => {
    el.setAttribute("value", "hello");
    el.removeAttribute("value");
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns current attribute", () => {
    el.setAttribute("size", "l");
    expect((el as unknown as { size: QueryfieldSize }).size).toBe("l");
  });

  it("size setter updates attribute", () => {
    (el as unknown as { size: QueryfieldSize }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("placeholder getter returns current attribute", () => {
    el.setAttribute("placeholder", "Find...");
    expect((el as unknown as { placeholder: string }).placeholder).toBe("Find...");
  });

  it("placeholder setter updates attribute", () => {
    (el as unknown as { placeholder: string }).placeholder = "Query...";
    expect(el.getAttribute("placeholder")).toBe("Query...");
  });

  it("placeholder getter defaults to Search...", () => {
    expect((el as unknown as { placeholder: string }).placeholder).toBe(
      "Search...",
    );
  });

  it("disabled getter returns false by default", () => {
    expect((el as unknown as { disabled: boolean }).disabled).toBe(false);
  });

  it("disabled setter sets attribute", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("disabled setter removes attribute when false", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("value getter returns input value", () => {
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    input.value = "test";
    expect((el as unknown as { value: string }).value).toBe("test");
  });

  it("value setter updates input value", () => {
    (el as unknown as { value: string }).value = "hello";
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  // ── Input events ──────────────────────────────────────────────────────────

  it("dispatches queryfield-input on typing", () => {
    const handler = vi.fn();
    el.addEventListener("queryfield-input", handler);
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    input.value = "abc";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("queryfield-input detail contains value", () => {
    let detail: { value: string } | undefined;
    el.addEventListener("queryfield-input", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    input.value = "xyz";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(detail).toEqual({ value: "xyz" });
  });

  it("dispatches queryfield-submit on Enter", () => {
    const handler = vi.fn();
    el.addEventListener("queryfield-submit", handler);
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    input.value = "search term";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("queryfield-submit detail contains value", () => {
    let detail: { value: string } | undefined;
    el.addEventListener("queryfield-submit", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    input.value = "query";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(detail).toEqual({ value: "query" });
  });

  it("does not dispatch queryfield-submit on non-Enter keys", () => {
    const handler = vi.fn();
    el.addEventListener("queryfield-submit", handler);
    const input = el.shadowRoot!.querySelector("input.input") as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handler).not.toHaveBeenCalled();
  });

  // ── Size propagation ──────────────────────────────────────────────────────

  it("propagates size to slotted tags on slotchange", async () => {
    el.setAttribute("size", "l");
    const tag = document.createElement("ui-queryfield-tag");
    tag.slot = "tags";
    el.appendChild(tag);
    // Wait for slotchange microtask
    await new Promise((r) => setTimeout(r, 0));
    expect(tag.getAttribute("size")).toBe("l");
  });

  it("propagates size when size attribute changes", async () => {
    const tag = document.createElement("ui-queryfield-tag");
    tag.slot = "tags";
    el.appendChild(tag);
    await new Promise((r) => setTimeout(r, 0));
    el.setAttribute("size", "s");
    expect(tag.getAttribute("size")).toBe("s");
  });
});
