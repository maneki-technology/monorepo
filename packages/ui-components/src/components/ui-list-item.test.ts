import { describe, it, expect, afterEach } from "vitest";
import "./ui-list-item.js";

function create(attrs = ""): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = `<ui-list-item ${attrs}></ui-list-item>`;
  document.body.appendChild(el);
  return el.querySelector("ui-list-item")!;
}

describe("ui-list-item", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-list-item")).toBeDefined();
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

  it("defaults role to 'option'", () => {
    const el = create();
    expect(el.getAttribute("role")).toBe("option");
  });

  it("defaults tabindex to '0'", () => {
    const el = create();
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("renders .top-border in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".top-border")).not.toBeNull();
  });

  it("renders .content in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".content")).not.toBeNull();
  });

  it("renders .primary-text in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".primary-text")).not.toBeNull();
  });

  it("renders .leading in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".leading")).not.toBeNull();
  });

  it("renders .tick in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".tick")).not.toBeNull();
  });

  it("renders .trailing-icon in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".trailing-icon")).not.toBeNull();
  });

  it("renders .description in shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot!.querySelector(".description")).not.toBeNull();
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

  // ── Padding attribute ─────────────────────────────────────────────────────

  it("defaults padding to 'none'", () => {
    const el = create();
    expect((el as unknown as { padding: string }).padding).toBe("none");
  });

  it("reflects padding='s' to attribute", () => {
    const el = create('padding="s"');
    expect(el.getAttribute("padding")).toBe("s");
  });

  it("reflects padding='m' to attribute", () => {
    const el = create('padding="m"');
    expect(el.getAttribute("padding")).toBe("m");
  });

  it("reflects padding='none' to attribute", () => {
    const el = create('padding="none"');
    expect(el.getAttribute("padding")).toBe("none");
  });

  // ── Leading attribute ─────────────────────────────────────────────────────

  it("defaults leading to 'none'", () => {
    const el = create();
    expect((el as unknown as { leading: string }).leading).toBe("none");
  });

  it("sets leading='icon'", () => {
    const el = create('leading="icon"');
    expect(el.getAttribute("leading")).toBe("icon");
  });

  it("sets leading='avatar'", () => {
    const el = create('leading="avatar"');
    expect(el.getAttribute("leading")).toBe("avatar");
  });

  it("sets leading='radio'", () => {
    const el = create('leading="radio"');
    expect(el.getAttribute("leading")).toBe("radio");
  });

  it("sets leading='checkbox'", () => {
    const el = create('leading="checkbox"');
    expect(el.getAttribute("leading")).toBe("checkbox");
  });

  it("renders leading slot element", () => {
    const el = create('leading="icon"');
    const slot = el.shadowRoot!.querySelector('.leading slot[name="leading"]');
    expect(slot).not.toBeNull();
  });

  // ── Top border ────────────────────────────────────────────────────────────

  it("does not have top-border attribute by default", () => {
    const el = create();
    expect(el.hasAttribute("top-border")).toBe(false);
  });

  it("sets top-border attribute", () => {
    const el = create('top-border');
    expect(el.hasAttribute("top-border")).toBe(true);
  });

  // ── Selected state ────────────────────────────────────────────────────────

  it("is not selected by default", () => {
    const el = create();
    expect((el as unknown as { selected: boolean }).selected).toBe(false);
  });

  it("sets selected attribute", () => {
    const el = create('selected');
    expect((el as unknown as { selected: boolean }).selected).toBe(true);
  });

  it("renders .tick element when selected", () => {
    const el = create('selected');
    const tick = el.shadowRoot!.querySelector(".tick");
    expect(tick).not.toBeNull();
  });

  it("removes selected attribute via property", () => {
    const el = create('selected');
    (el as unknown as { selected: boolean }).selected = false;
    expect(el.hasAttribute("selected")).toBe(false);
  });

  // ── Trailing icon ─────────────────────────────────────────────────────────

  it("does not have trailing-icon attribute by default", () => {
    const el = create();
    expect(el.hasAttribute("trailing-icon")).toBe(false);
  });

  it("sets trailing-icon attribute", () => {
    const el = create('trailing-icon');
    expect(el.hasAttribute("trailing-icon")).toBe(true);
  });

  it("renders trailing slot", () => {
    const el = create('trailing-icon');
    const slot = el.shadowRoot!.querySelector('.trailing-icon slot[name="trailing"]');
    expect(slot).not.toBeNull();
  });

  // ── Description ───────────────────────────────────────────────────────────

  it("has empty description by default", () => {
    const el = create();
    const desc = el.shadowRoot!.querySelector(".description");
    expect(desc!.textContent).toBe("");
  });

  it("sets description text from attribute", () => {
    const el = create('description="Some description"');
    const desc = el.shadowRoot!.querySelector(".description");
    expect(desc!.textContent).toBe("Some description");
  });

  it("updates description when attribute changes", () => {
    const el = create();
    el.setAttribute("description", "Updated");
    const desc = el.shadowRoot!.querySelector(".description");
    expect(desc!.textContent).toBe("Updated");
  });

  // ── Secondary text ────────────────────────────────────────────────────────

  it("sets description from secondary-text attribute", () => {
    const el = create('secondary-text="Secondary info"');
    const desc = el.shadowRoot!.querySelector(".description");
    expect(desc!.textContent).toBe("Secondary info");
  });

  it("updates description when secondary-text changes", () => {
    const el = create();
    el.setAttribute("secondary-text", "New secondary");
    const desc = el.shadowRoot!.querySelector(".description");
    expect(desc!.textContent).toBe("New secondary");
  });

  it("description attribute takes precedence over secondary-text", () => {
    const el = create('description="Primary desc" secondary-text="Secondary desc"');
    const desc = el.shadowRoot!.querySelector(".description");
    expect(desc!.textContent).toBe("Primary desc");
  });

  // ── Disabled state ────────────────────────────────────────────────────────

  it("is not disabled by default", () => {
    const el = create();
    expect((el as unknown as { disabled: boolean }).disabled).toBe(false);
  });

  it("sets disabled attribute", () => {
    const el = create('disabled');
    expect((el as unknown as { disabled: boolean }).disabled).toBe(true);
  });

  it("removes disabled attribute via property", () => {
    const el = create('disabled');
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("does not dispatch item-select when disabled and clicked", () => {
    const el = create('disabled value="test"');
    let fired = false;
    el.addEventListener("item-select", () => { fired = true; });
    el.click();
    expect(fired).toBe(false);
  });

  // ── Value property ────────────────────────────────────────────────────────

  it("defaults value to empty string", () => {
    const el = create();
    expect((el as unknown as { value: string }).value).toBe("");
  });

  it("sets value via attribute", () => {
    const el = create('value="option-1"');
    expect((el as unknown as { value: string }).value).toBe("option-1");
  });

  it("sets value via property", () => {
    const el = create();
    (el as unknown as { value: string }).value = "option-2";
    expect(el.getAttribute("value")).toBe("option-2");
  });

  // ── Click event ───────────────────────────────────────────────────────────

  it("dispatches item-select on click", () => {
    const el = create('value="clicked"');
    let detail: { value: string } | null = null;
    el.addEventListener("item-select", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    el.click();
    expect(detail).toEqual({ value: "clicked" });
  });

  it("item-select event bubbles", () => {
    const el = create('value="bubbles"');
    let bubbled = false;
    document.body.addEventListener("item-select", (() => {
      bubbled = true;
    }) as EventListener);
    el.click();
    expect(bubbled).toBe(true);
  });

  // ── Keyboard ──────────────────────────────────────────────────────────────

  it("dispatches item-select on Enter key", () => {
    const el = create('value="enter"');
    let detail: { value: string } | null = null;
    el.addEventListener("item-select", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(detail).toEqual({ value: "enter" });
  });

  it("dispatches item-select on Space key", () => {
    const el = create('value="space"');
    let detail: { value: string } | null = null;
    el.addEventListener("item-select", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(detail).toEqual({ value: "space" });
  });

  it("does not dispatch item-select on other keys", () => {
    const el = create('value="nope"');
    let fired = false;
    el.addEventListener("item-select", () => { fired = true; });
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(fired).toBe(false);
  });

  it("does not dispatch item-select on Enter when disabled", () => {
    const el = create('disabled value="no"');
    let fired = false;
    el.addEventListener("item-select", () => { fired = true; });
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(fired).toBe(false);
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

  it("padding getter returns attribute value", () => {
    const el = create('padding="m"');
    expect((el as unknown as { padding: string }).padding).toBe("m");
  });

  it("padding setter reflects to attribute", () => {
    const el = create();
    (el as unknown as { padding: string }).padding = "s";
    expect(el.getAttribute("padding")).toBe("s");
  });

  it("leading getter returns attribute value", () => {
    const el = create('leading="avatar"');
    expect((el as unknown as { leading: string }).leading).toBe("avatar");
  });

  it("leading setter reflects to attribute", () => {
    const el = create();
    (el as unknown as { leading: string }).leading = "checkbox";
    expect(el.getAttribute("leading")).toBe("checkbox");
  });

  it("selected getter returns boolean", () => {
    const el = create('selected');
    expect((el as unknown as { selected: boolean }).selected).toBe(true);
  });

  it("selected setter adds attribute", () => {
    const el = create();
    (el as unknown as { selected: boolean }).selected = true;
    expect(el.hasAttribute("selected")).toBe(true);
  });

  it("disabled getter returns boolean", () => {
    const el = create('disabled');
    expect((el as unknown as { disabled: boolean }).disabled).toBe(true);
  });

  it("disabled setter adds attribute", () => {
    const el = create();
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("value getter returns attribute value", () => {
    const el = create('value="abc"');
    expect((el as unknown as { value: string }).value).toBe("abc");
  });

  it("value setter reflects to attribute", () => {
    const el = create();
    (el as unknown as { value: string }).value = "xyz";
    expect(el.getAttribute("value")).toBe("xyz");
  });

  // ── Slot content ──────────────────────────────────────────────────────────

  it("renders default slot for primary text", () => {
    const el = create();
    const slot = el.shadowRoot!.querySelector(".primary-text slot:not([name])");
    expect(slot).not.toBeNull();
  });

  it("renders named leading slot", () => {
    const el = create();
    const slot = el.shadowRoot!.querySelector('slot[name="leading"]');
    expect(slot).not.toBeNull();
  });

  it("renders named trailing slot", () => {
    const el = create();
    const slot = el.shadowRoot!.querySelector('slot[name="trailing"]');
    expect(slot).not.toBeNull();
  });

  // ── Cleanup ───────────────────────────────────────────────────────────────

  it("removes event listeners on disconnect", () => {
    const el = create('value="disc"');
    el.remove();
    let fired = false;
    el.addEventListener("item-select", () => { fired = true; });
    el.click();
    expect(fired).toBe(false);
  });

  it("does not set defaults when not connected", () => {
    const el = document.createElement("ui-list-item");
    // Not appended — connectedCallback not called
    expect(el.hasAttribute("size")).toBe(false);
  });
});
