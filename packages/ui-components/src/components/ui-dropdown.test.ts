import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-dropdown.js";
import { STYLES as DROPDOWN_STYLES } from "./ui-dropdown.js";
import "./ui-dropdown-item.js";
import { STYLES as ITEM_STYLES } from "./ui-dropdown-item.styles.js";
import "./ui-dropdown-heading.js";
import "./ui-dropdown-separator.js";

// ─── ui-dropdown-separator ───────────────────────────────────────────────────

describe("UiDropdownSeparator", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-separator");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should render with shadow DOM", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  it("should have role='separator'", () => {
    expect(el.getAttribute("role")).toBe("separator");
  });

  it("should have aria-hidden='true'", () => {
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("should render a divider line element", () => {
    const line = el.shadowRoot!.querySelector(".line");
    expect(line).toBeTruthy();
  });
});

// ─── ui-dropdown-heading ─────────────────────────────────────────────────────

describe("UiDropdownHeading", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-heading");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should render with shadow DOM", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  it("should render a heading container", () => {
    const heading = el.shadowRoot!.querySelector(".heading");
    expect(heading).toBeTruthy();
  });

  it("should have uppercase text-transform in styles", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("text-transform: uppercase");
  });

  it("should default size to 'm'", () => {
    expect((el as any).size).toBe("m");
  });

  it("should accept size='s'", () => {
    el.setAttribute("size", "s");
    expect((el as any).size).toBe("s");
  });

  it("should set size via property accessor", () => {
    (el as any).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("should have part='heading' on container", () => {
    const heading = el.shadowRoot!.querySelector(".heading");
    expect(heading?.getAttribute("part")).toBe("heading");
  });

  it("should render slot for text content", () => {
    const slot = el.shadowRoot!.querySelector("slot");
    expect(slot).toBeTruthy();
  });
});

// ─── ui-dropdown-item ────────────────────────────────────────────────────────

describe("UiDropdownItem", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-item");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should render with shadow DOM", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  it("should render a button with role='menuitem'", () => {
    const button = el.shadowRoot!.querySelector("button");
    expect(button).toBeTruthy();
    expect(button?.getAttribute("role")).toBe("menuitem");
  });

  it("should emit 'select' CustomEvent on click", () => {
    const handler = vi.fn();
    el.addEventListener("select", handler);

    const button = el.shadowRoot!.querySelector("button")!;
    button.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toBeInstanceOf(CustomEvent);
  });

  it("should emit 'select' event that bubbles and is composed", () => {
    const handler = vi.fn();
    el.addEventListener("select", handler);

    const button = el.shadowRoot!.querySelector("button")!;
    button.click();

    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it("should not emit 'select' when disabled", () => {
    const handler = vi.fn();
    el.addEventListener("select", handler);
    el.setAttribute("disabled", "");

    const button = el.shadowRoot!.querySelector("button")!;
    button.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it("should default size to 'm'", () => {
    expect((el as any).size).toBe("m");
  });

  it("should accept size='s'", () => {
    el.setAttribute("size", "s");
    expect((el as any).size).toBe("s");
  });

  it("should set size via property accessor", () => {
    (el as any).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("should default disabled to false", () => {
    expect((el as any).disabled).toBe(false);
  });

  it("should set disabled via property accessor", () => {
    (el as any).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
    (el as any).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("should sync disabled to inner button", () => {
    el.setAttribute("disabled", "");
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button.disabled).toBe(true);
  });

  it("should have part='item' on button", () => {
    const button = el.shadowRoot!.querySelector("button");
    expect(button?.getAttribute("part")).toBe("item");
  });

  it("should have hover background style", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(".item:hover");
  });
  it("should default selected to false", () => {
    expect((el as any).selected).toBe(false);
  });

  it("should set selected via property accessor", () => {
    (el as any).selected = true;
    expect(el.hasAttribute("selected")).toBe(true);
    (el as any).selected = false;
    expect(el.hasAttribute("selected")).toBe(false);
  });

  it("should apply selected styling when selected", () => {
    el.setAttribute("selected", "");
    expect(el.hasAttribute("selected")).toBe(true);
    expect(ITEM_STYLES).toContain("--ui-dd-item-selected-color");
  });

  it("should include selected state in select event detail", () => {
    const handler = vi.fn();
    el.addEventListener("select", handler);
    const button = el.shadowRoot!.querySelector("button")!;
    button.click();
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toHaveProperty("selected");
    expect(event.detail.selected).toBe(false);
  });

  it("should default value to empty string", () => {
    expect((el as any).value).toBe("");
  });

  it("should set value via property accessor", () => {
    (el as any).value = "apple";
    expect(el.getAttribute("value")).toBe("apple");
    expect((el as any).value).toBe("apple");
  });
  it("should accept size='l'", () => {
    (el as any).size = "l";
    expect((el as any).size).toBe("l");
  });

  it("should default leading to null", () => {
    expect((el as any).leading).toBe(null);
  });

  it("should set leading='icon' via property", () => {
    (el as any).leading = "icon";
    expect(el.getAttribute("leading")).toBe("icon");
  });

  it("should render icon slot when leading='icon'", () => {
    el.setAttribute("leading", "icon");
    const slot = el.shadowRoot!.querySelector('slot[name="icon"]');
    expect(slot).toBeTruthy();
  });

  it("should render avatar slot when leading='avatar'", () => {
    el.setAttribute("leading", "avatar");
    const slot = el.shadowRoot!.querySelector('slot[name="avatar"]');
    expect(slot).toBeTruthy();
  });

  it("should render checkbox SVG when leading='checkbox'", () => {
    el.setAttribute("leading", "checkbox");
    const svg = el.shadowRoot!.querySelector(".leading svg");
    expect(svg).toBeTruthy();
  });

  it("should render radio SVG when leading='radio'", () => {
    el.setAttribute("leading", "radio");
    const svg = el.shadowRoot!.querySelector(".leading svg");
    expect(svg).toBeTruthy();
  });

  it("should remove leading element when leading is removed", () => {
    el.setAttribute("leading", "icon");
    (el as any).leading = null;
    const leading = el.shadowRoot!.querySelector(".leading");
    expect(leading).toBe(null);
  });


  it("should default secondary to null", () => {
    expect((el as any).secondary).toBe(null);
  });

  it("should render secondary text", () => {
    el.setAttribute("secondary", "Ctrl+S");
    const secondary = el.shadowRoot!.querySelector(".secondary");
    expect(secondary?.textContent).toBe("Ctrl+S");
  });

  it("should update secondary text", () => {
    el.setAttribute("secondary", "A");
    el.setAttribute("secondary", "B");
    const secondary = el.shadowRoot!.querySelector(".secondary");
    expect(secondary?.textContent).toBe("B");
  });

  it("should remove secondary when cleared", () => {
    el.setAttribute("secondary", "A");
    (el as any).secondary = null;
    const secondary = el.shadowRoot!.querySelector(".secondary");
    expect(secondary).toBe(null);
  });

  it("should default description to null", () => {
    expect((el as any).description).toBe(null);
  });

  it("should render description text", () => {
    el.setAttribute("description", "Help text");
    const description = el.shadowRoot!.querySelector(".description");
    expect(description?.textContent).toBe("Help text");
  });

  it("should remove description when cleared", () => {
    el.setAttribute("description", "X");
    (el as any).description = null;
    const description = el.shadowRoot!.querySelector(".description");
    expect(description).toBe(null);
  });

  it("should default submenu to false", () => {
    expect((el as any).submenu).toBe(false);
  });

  it("should render submenu arrow when set", () => {
    el.setAttribute("submenu", "");
    const submenu = el.shadowRoot!.querySelector(".submenu");
    expect(submenu).toBeTruthy();
  });

  it("should remove submenu arrow when cleared", () => {
    el.setAttribute("submenu", "");
    el.removeAttribute("submenu");
    const submenu = el.shadowRoot!.querySelector(".submenu");
    expect(submenu).toBe(null);
  });

  it("should set submenu via property", () => {
    (el as any).submenu = true;
    expect(el.hasAttribute("submenu")).toBe(true);
    (el as any).submenu = false;
    expect(el.hasAttribute("submenu")).toBe(false);
  });

  it("should have selected color style in CSS", () => {
    expect(ITEM_STYLES).toContain("--ui-dd-item-selected-color");
  });
  it("should have disabled color style in CSS", () => {
    expect(ITEM_STYLES).toContain("--ui-dd-item-disabled-color");
  });

  // ── Submenu behavior ────────────────────────────────────────────────────

  it("should have submenu slot in shadow DOM when submenu is set", () => {
    el.setAttribute("submenu", "");
    const slot = el.shadowRoot!.querySelector('slot[name="submenu"]');
    expect(slot).toBeTruthy();
  });

  it("should open submenu on mouseenter", () => {
    el.setAttribute("submenu", "");
    const menu = document.createElement("ui-menu");
    menu.setAttribute("slot", "submenu");
    el.appendChild(menu);
    // Trigger mouseenter on host
    el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(menu.hasAttribute("open")).toBe(true);
  });

  it("should close submenu on mouseleave after delay", async () => {
    el.setAttribute("submenu", "");
    const menu = document.createElement("ui-menu");
    menu.setAttribute("slot", "submenu");
    el.appendChild(menu);
    // Open first
    el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(menu.hasAttribute("open")).toBe(true);
    // Mouseleave
    el.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    // Should still be open immediately
    expect(menu.hasAttribute("open")).toBe(true);
    // Wait for close timer (150ms + buffer)
    await new Promise((r) => setTimeout(r, 200));
    expect(menu.hasAttribute("open")).toBe(false);
  });

  it("should propagate size to submenu", () => {
    el.setAttribute("submenu", "");
    el.setAttribute("size", "l");
    const menu = document.createElement("ui-menu");
    menu.setAttribute("slot", "submenu");
    el.appendChild(menu);
    // Trigger open to propagate size
    el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(menu.getAttribute("size")).toBe("l");
  });
});

// ─── ui-dropdown ─────────────────────────────────────────────────────────────

describe("UiDropdown", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should render with shadow DOM", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  it("should render a ui-button trigger", () => {
    const trigger = el.shadowRoot!.querySelector("ui-button");
    expect(trigger).toBeTruthy();
  });

  it("should render a menu panel with role='menu'", () => {
    const menu = el.shadowRoot!.querySelector(".menu");
    expect(menu).toBeTruthy();
    expect(menu?.getAttribute("role")).toBe("menu");
  });

  it("should set aria-haspopup on trigger", () => {
    const trigger = el.shadowRoot!.querySelector("ui-button")!;
    expect(trigger.getAttribute("aria-haspopup")).toBe("true");
  });

  it("should set aria-expanded='false' by default", () => {
    const trigger = el.shadowRoot!.querySelector("ui-button")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("should set aria-expanded='true' when open", () => {
    el.setAttribute("open", "");
    const trigger = el.shadowRoot!.querySelector("ui-button")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("should have icon='trailing-icon' on trigger", () => {
    const trigger = el.shadowRoot!.querySelector("ui-button")!;
    expect(trigger.getAttribute("icon")).toBe("trailing-icon");
  });

  it("should render chevron icon in icon-end slot", () => {
    const chevron = el.shadowRoot!.querySelector(".chevron");
    expect(chevron).toBeTruthy();
    expect(chevron?.getAttribute("slot")).toBe("icon-end");
    expect(chevron?.querySelector("svg")).toBeTruthy();
  });

  // ── Open/close behavior ────────────────────────────────────────────────

  it("should default to closed", () => {
    expect((el as any).open).toBe(false);
  });

  it("should toggle open on trigger click", () => {
    const trigger = el.shadowRoot!.querySelector("ui-button") as HTMLElement;
    trigger.click();
    expect((el as any).open).toBe(true);

    trigger.click();
    expect((el as any).open).toBe(false);
  });

  it("should close on Escape key", () => {
    (el as any).open = true;
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect((el as any).open).toBe(false);
  });

  it("should close on outside click", () => {
    (el as any).open = true;
    document.body.click();
    expect((el as any).open).toBe(false);
  });

  it("should not close when clicking inside the dropdown", () => {
    (el as any).open = true;
    el.click();
    expect((el as any).open).toBe(true);
  });

  it("should dispatch 'toggle' event when open changes", () => {
    const handler = vi.fn();
    el.addEventListener("toggle", handler);

    (el as any).open = true;
    expect(handler).toHaveBeenCalled();
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.open).toBe(true);
  });

  it("should not toggle when disabled", () => {
    el.setAttribute("disabled", "");
    const trigger = el.shadowRoot!.querySelector("ui-button") as HTMLElement;
    trigger.click();
    expect((el as any).open).toBe(false);
  });

  // ── Label ──────────────────────────────────────────────────────────────

  it("should default label to 'Button'", () => {
    expect((el as any).label).toBe("Button");
  });

  it("should update trigger text when label changes", () => {
    el.setAttribute("label", "Options");
    const trigger = el.shadowRoot!.querySelector("ui-button")!;
    expect(trigger.textContent).toContain("Options");
  });

  it("should set label via property accessor", () => {
    (el as any).label = "Menu";
    expect(el.getAttribute("label")).toBe("Menu");
  });

  // ── Attribute propagation to trigger ───────────────────────────────────

  it("should propagate size to trigger button", () => {
    el.setAttribute("size", "l");
    const trigger = el.shadowRoot!.querySelector("ui-button")!;
    expect(trigger.getAttribute("size")).toBe("l");
  });

  it("should propagate action to trigger button", () => {
    el.setAttribute("action", "destructive");
    const trigger = el.shadowRoot!.querySelector("ui-button")!;
    expect(trigger.getAttribute("action")).toBe("destructive");
  });

  it("should propagate emphasis to trigger button", () => {
    el.setAttribute("emphasis", "subtle");
    const trigger = el.shadowRoot!.querySelector("ui-button")!;
    expect(trigger.getAttribute("emphasis")).toBe("subtle");
  });

  it("should propagate shape to trigger button", () => {
    el.setAttribute("shape", "rounded");
    const trigger = el.shadowRoot!.querySelector("ui-button")!;
    expect(trigger.getAttribute("shape")).toBe("rounded");
  });

  it("should propagate disabled to trigger button", () => {
    el.setAttribute("disabled", "");
    const trigger = el.shadowRoot!.querySelector("ui-button")!;
    expect(trigger.hasAttribute("disabled")).toBe(true);
  });

  // ── Size propagation to children ───────────────────────────────────────

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

  it("should map l/xl sizes to 'l' for children", () => {
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    el.setAttribute("size", "l");
    expect(item.getAttribute("size")).toBe("l");

    el.setAttribute("size", "xl");
    expect(item.getAttribute("size")).toBe("l");
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

  // ── Property accessors ─────────────────────────────────────────────────

  it("should default size to 'm'", () => {
    expect((el as any).size).toBe("m");
  });

  it("should default action to 'primary'", () => {
    expect((el as any).action).toBe("primary");
  });

  it("should default emphasis to 'bold'", () => {
    expect((el as any).emphasis).toBe("bold");
  });

  it("should default shape to 'basic'", () => {
    expect((el as any).shape).toBe("basic");
  });

  it("should get/set size property", () => {
    (el as any).size = "xl";
    expect(el.getAttribute("size")).toBe("xl");
    expect((el as any).size).toBe("xl");
  });

  it("should get/set action property", () => {
    (el as any).action = "destructive";
    expect(el.getAttribute("action")).toBe("destructive");
    expect((el as any).action).toBe("destructive");
  });

  it("should get/set emphasis property", () => {
    (el as any).emphasis = "minimal";
    expect(el.getAttribute("emphasis")).toBe("minimal");
    expect((el as any).emphasis).toBe("minimal");
  });

  it("should get/set shape property", () => {
    (el as any).shape = "rounded";
    expect(el.getAttribute("shape")).toBe("rounded");
    expect((el as any).shape).toBe("rounded");
  });

  it("should get/set disabled property", () => {
    (el as any).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
    (el as any).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("should get/set open property", () => {
    (el as any).open = true;
    expect(el.hasAttribute("open")).toBe(true);
    (el as any).open = false;
    expect(el.hasAttribute("open")).toBe(false);
  });
  // ── Selection behavior ──────────────────────────────────────────────

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
    (el as any).open = true;
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    const button = item.shadowRoot!.querySelector("button")!;
    button.click();

    expect((el as any).open).toBe(false);
  });

  it("should toggle selection in multi-select mode", () => {
    el.setAttribute("selectable", "");
    (el as any).multiple = true;
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
    (el as any).multiple = true;
    (el as any).open = true;
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    item.shadowRoot!.querySelector("button")!.click();

    expect((el as any).open).toBe(true);
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

    expect((el as any).value).toBe("foo");
  });

  it("should return array from value getter (multiple)", () => {
    el.setAttribute("selectable", "");
    (el as any).multiple = true;
    const item1 = document.createElement("ui-dropdown-item");
    const item2 = document.createElement("ui-dropdown-item");
    item1.setAttribute("value", "a");
    item2.setAttribute("value", "b");
    el.appendChild(item1);
    el.appendChild(item2);

    item1.shadowRoot!.querySelector("button")!.click();
    item2.shadowRoot!.querySelector("button")!.click();

    expect((el as any).value).toEqual(["a", "b"]);
  });

  it("should default multiple to false", () => {
    expect((el as any).multiple).toBe(false);
  });

  it("should set multiple via property accessor", () => {
    (el as any).multiple = true;
    expect(el.hasAttribute("multiple")).toBe(true);
    (el as any).multiple = false;
    expect(el.hasAttribute("multiple")).toBe(false);
  });

  it("should NOT manage selection state without selectable attribute", () => {
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

  it("should manage selection state with selectable attribute", () => {
    el.setAttribute("selectable", "");
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    const button = item.shadowRoot!.querySelector("button")!;
    button.click();

    expect(item.hasAttribute("selected")).toBe(true);
  });

  it("should dispatch 'change' event with selectable attribute", () => {
    el.setAttribute("selectable", "");
    const handler = vi.fn();
    el.addEventListener("change", handler);
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    item.shadowRoot!.querySelector("button")!.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ── Cleanup ────────────────────────────────────────────────────────────

  it("should remove document click listener on disconnect", () => {
    (el as any).open = true;
    el.remove();
    // Should not throw when clicking after removal
    document.body.click();
  });
});
