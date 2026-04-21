import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-menu.js";
import { UiMenu, STYLES as MENU_STYLES } from "./ui-menu.js";
import "./ui-dropdown-item.js";
import "./ui-dropdown-heading.js";
import "./ui-dropdown-separator.js";

describe("UiMenu", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-menu");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  // ── Rendering ───────────────────────────────────────────────────────────

  it("should render with shadow DOM", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  it("should have role='menu'", () => {
    expect(el.getAttribute("role")).toBe("menu");
  });

  it("should render a slot for children", () => {
    const slot = el.shadowRoot!.querySelector("slot");
    expect(slot).toBeTruthy();
  });

  // ── Open/close behavior ─────────────────────────────────────────────────

  it("should default to closed", () => {
    expect((el as UiMenu).open).toBe(false);
  });

  it("should open when open attribute is set", () => {
    el.setAttribute("open", "");
    expect((el as UiMenu).open).toBe(true);
  });

  it("should close when open attribute is removed", () => {
    el.setAttribute("open", "");
    el.removeAttribute("open");
    expect((el as UiMenu).open).toBe(false);
  });

  it("should set open via property accessor", () => {
    (el as UiMenu).open = true;
    expect(el.hasAttribute("open")).toBe(true);
    (el as UiMenu).open = false;
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("should close on Escape key", () => {
    (el as UiMenu).open = true;
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect((el as UiMenu).open).toBe(false);
  });

  it("should close on outside click", () => {
    (el as UiMenu).open = true;
    document.body.click();
    expect((el as UiMenu).open).toBe(false);
  });

  it("should not close when clicking inside the menu", () => {
    (el as UiMenu).open = true;
    el.click();
    expect((el as UiMenu).open).toBe(true);
  });

  it("should dispatch 'toggle' event when open changes", () => {
    const handler = vi.fn();
    el.addEventListener("toggle", handler);

    (el as UiMenu).open = true;
    expect(handler).toHaveBeenCalled();
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.open).toBe(true);
  });

  it("should dispatch 'toggle' event with composed and bubbles", () => {
    const handler = vi.fn();
    el.addEventListener("toggle", handler);

    (el as UiMenu).open = true;
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  // ── Size ────────────────────────────────────────────────────────────────

  it("should default size to 'm'", () => {
    expect((el as UiMenu).size).toBe("m");
  });

  it("should get/set size property", () => {
    (el as UiMenu).size = "s";
    expect(el.getAttribute("size")).toBe("s");
    expect((el as UiMenu).size).toBe("s");
  });

  it("should propagate size to dropdown-item children", () => {
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    el.setAttribute("size", "s");
    expect(item.getAttribute("size")).toBe("s");
  });

  it("should propagate size to dropdown-heading children", () => {
    const heading = document.createElement("ui-dropdown-heading");
    el.appendChild(heading);

    el.setAttribute("size", "s");
    expect(heading.getAttribute("size")).toBe("s");
  });

  it("should propagate size to dynamically added children", () => {
    el.setAttribute("size", "s");

    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(item.getAttribute("size")).toBe("s");
        resolve(undefined);
      }, 0);
    });
  });

  it("should accept size='l'", () => {
    (el as UiMenu).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  it("should propagate size='l' to children", () => {
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);
    (el as UiMenu).size = "l";
    // Wait for slotchange
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(item.getAttribute("size")).toBe("l");
        resolve(undefined);
      }, 0);
    });
  });

  // ── Selectable / single-select ──────────────────────────────────────────

  it("should default selectable to false", () => {
    expect((el as UiMenu).selectable).toBe(false);
  });

  it("should set selectable via property accessor", () => {
    (el as UiMenu).selectable = true;
    expect(el.hasAttribute("selectable")).toBe(true);
    (el as UiMenu).selectable = false;
    expect(el.hasAttribute("selectable")).toBe(false);
  });

  it("should NOT manage selection without selectable attribute", () => {
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    const button = item.shadowRoot!.querySelector("button")!;
    button.click();

    expect(item.hasAttribute("selected")).toBe(false);
  });

  it("should NOT dispatch 'change' event without selectable attribute", () => {
    const handler = vi.fn();
    el.addEventListener("change", handler);
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    item.shadowRoot!.querySelector("button")!.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it("should select item on click in single-select mode", () => {
    el.setAttribute("selectable", "");
    const items = [
      document.createElement("ui-dropdown-item"),
      document.createElement("ui-dropdown-item"),
      document.createElement("ui-dropdown-item"),
    ];
    items.forEach((item) => el.appendChild(item));

    const button = items[1].shadowRoot!.querySelector("button")!;
    button.click();

    expect(items[1].hasAttribute("selected")).toBe(true);
    expect(items[0].hasAttribute("selected")).toBe(false);
    expect(items[2].hasAttribute("selected")).toBe(false);
  });

  it("should deselect previous item when selecting new one in single-select", () => {
    el.setAttribute("selectable", "");
    const item1 = document.createElement("ui-dropdown-item");
    const item2 = document.createElement("ui-dropdown-item");
    item1.setAttribute("selected", "");
    el.appendChild(item1);
    el.appendChild(item2);

    const button2 = item2.shadowRoot!.querySelector("button")!;
    button2.click();

    expect(item1.hasAttribute("selected")).toBe(false);
    expect(item2.hasAttribute("selected")).toBe(true);
  });

  it("should close menu after single selection", () => {
    el.setAttribute("selectable", "");
    (el as UiMenu).open = true;
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    const button = item.shadowRoot!.querySelector("button")!;
    button.click();

    expect((el as UiMenu).open).toBe(false);
  });

  it("should dispatch 'change' event on selection", () => {
    el.setAttribute("selectable", "");
    const handler = vi.fn();
    el.addEventListener("change", handler);
    const item = document.createElement("ui-dropdown-item");
    item.setAttribute("value", "test");
    el.appendChild(item);

    item.shadowRoot!.querySelector("button")!.click();

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.value).toBe("test");
  });

  it("should return value from value getter (single)", () => {
    el.setAttribute("selectable", "");
    const item = document.createElement("ui-dropdown-item");
    item.setAttribute("value", "foo");
    el.appendChild(item);

    item.shadowRoot!.querySelector("button")!.click();

    expect((el as UiMenu).value).toBe("foo");
  });

  // ── Multiple select ─────────────────────────────────────────────────────

  it("should default multiple to false", () => {
    expect((el as UiMenu).multiple).toBe(false);
  });

  it("should set multiple via property accessor", () => {
    (el as UiMenu).multiple = true;
    expect(el.hasAttribute("multiple")).toBe(true);
    (el as UiMenu).multiple = false;
    expect(el.hasAttribute("multiple")).toBe(false);
  });

  it("should toggle selection in multi-select mode", () => {
    el.setAttribute("selectable", "");
    (el as UiMenu).multiple = true;
    const item1 = document.createElement("ui-dropdown-item");
    const item2 = document.createElement("ui-dropdown-item");
    el.appendChild(item1);
    el.appendChild(item2);

    item1.shadowRoot!.querySelector("button")!.click();
    item2.shadowRoot!.querySelector("button")!.click();
    expect(item1.hasAttribute("selected")).toBe(true);
    expect(item2.hasAttribute("selected")).toBe(true);

    // Toggle off
    item1.shadowRoot!.querySelector("button")!.click();
    expect(item1.hasAttribute("selected")).toBe(false);
    expect(item2.hasAttribute("selected")).toBe(true);
  });

  it("should NOT close menu after multi-select", () => {
    el.setAttribute("selectable", "");
    (el as UiMenu).multiple = true;
    (el as UiMenu).open = true;
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    item.shadowRoot!.querySelector("button")!.click();

    expect((el as UiMenu).open).toBe(true);
  });

  it("should return array from value getter (multiple)", () => {
    el.setAttribute("selectable", "");
    (el as UiMenu).multiple = true;
    const item1 = document.createElement("ui-dropdown-item");
    const item2 = document.createElement("ui-dropdown-item");
    item1.setAttribute("value", "a");
    item2.setAttribute("value", "b");
    el.appendChild(item1);
    el.appendChild(item2);

    item1.shadowRoot!.querySelector("button")!.click();
    item2.shadowRoot!.querySelector("button")!.click();

    expect((el as UiMenu).value).toEqual(["a", "b"]);
  });

  // ── Cleanup ─────────────────────────────────────────────────────────────

  it("should remove document click listener on disconnect", () => {
    (el as UiMenu).open = true;
    el.remove();
    // Should not throw when clicking after removal
    document.body.click();
  });

  // ── CSS custom properties ───────────────────────────────────────────────

  it("should include menu styling in shadow DOM", () => {
    expect(MENU_STYLES).toContain("--ui-menu-bg");
    expect(MENU_STYLES).toContain("--ui-menu-shadow");
    expect(MENU_STYLES).toContain("--ui-menu-radius");
    expect(MENU_STYLES).toContain("--ui-menu-min-width");
  });

});
