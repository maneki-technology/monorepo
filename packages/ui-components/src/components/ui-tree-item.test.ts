import { describe, it, expect, beforeEach, vi } from "vitest";
import "./ui-tree-item.js";
import { UiTreeItem } from "./ui-tree-item.js";
import type { TreeItemSize, TreeItemLevel, TreeItemArrow } from "./ui-tree-item.styles.js";
import { TREE_ITEM_STYLES } from "./ui-tree-item.styles.js";
import { ICON_CHEVRON_RIGHT, ICON_EXPAND_MORE } from "@maneki/foundation";

describe("ui-tree-item", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-tree-item");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-tree-item")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .base wrapper", () => {
    expect(el.shadowRoot!.querySelector(".base")).not.toBeNull();
  });

  it("renders a .chevron element", () => {
    expect(el.shadowRoot!.querySelector(".chevron")).not.toBeNull();
  });

  it("renders a .content element", () => {
    expect(el.shadowRoot!.querySelector(".content")).not.toBeNull();
  });

  it("renders a .label element", () => {
    expect(el.shadowRoot!.querySelector(".label")).not.toBeNull();
  });

  it("renders a .secondary-label element", () => {
    expect(el.shadowRoot!.querySelector(".secondary-label")).not.toBeNull();
  });

  it("renders a .leading-icon element", () => {
    expect(el.shadowRoot!.querySelector(".leading-icon")).not.toBeNull();
  });

  it("renders a .checkbox-slot element", () => {
    expect(el.shadowRoot!.querySelector(".checkbox-slot")).not.toBeNull();
  });

  it("renders a chevron icon inside .chevron", () => {
    const icon = el.shadowRoot!.querySelector(".chevron .material-symbols-outlined");
    expect(icon).not.toBeNull();
  });

  // ── Default attributes ────────────────────────────────────────────────────

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults level to parent", () => {
    expect(el.getAttribute("level")).toBe("parent");
  });

  it("defaults arrow to none", () => {
    expect(el.getAttribute("arrow")).toBe("none");
  });

  it("sets role to treeitem", () => {
    expect(el.getAttribute("role")).toBe("treeitem");
  });

  it("sets tabindex to 0", () => {
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  // ── Size attribute ────────────────────────────────────────────────────────

  it.each(["s", "m", "l"] satisfies TreeItemSize[])("accepts size=%s", (size) => {
    el.setAttribute("size", size);
    expect(el.getAttribute("size")).toBe(size);
  });

  // ── Level attribute ───────────────────────────────────────────────────────

  it.each(["parent", "child-1", "child-2", "child-3"] satisfies TreeItemLevel[])("accepts level=%s", (level) => {
    el.setAttribute("level", level);
    expect(el.getAttribute("level")).toBe(level);
  });

  // ── Arrow attribute ───────────────────────────────────────────────────────

  it.each(["none", "closed", "open"] satisfies TreeItemArrow[])("accepts arrow=%s", (arrow) => {
    el.setAttribute("arrow", arrow);
    expect(el.getAttribute("arrow")).toBe(arrow);
  });

  // ── Selected attribute ────────────────────────────────────────────────────

  it("does not have selected by default", () => {
    expect(el.hasAttribute("selected")).toBe(false);
  });

  it("accepts selected attribute", () => {
    el.setAttribute("selected", "");
    expect(el.hasAttribute("selected")).toBe(true);
  });

  // ── Label attribute ───────────────────────────────────────────────────────

  it("renders label text", () => {
    el.setAttribute("label", "Documents");
    const label = el.shadowRoot!.querySelector(".label");
    expect(label!.textContent).toBe("Documents");
  });

  it("renders secondary-label text", () => {
    el.setAttribute("secondary-label", "3 items");
    const secondary = el.shadowRoot!.querySelector(".secondary-label");
    expect(secondary!.textContent).toBe("3 items");
  });

  // ── Leading icon attribute ────────────────────────────────────────────────

  it("renders leading icon when leading-icon is set", () => {
    el.setAttribute("leading-icon", "");
    expect(el.shadowRoot!.querySelector(".leading-icon")).not.toBeNull();
  });

  it("renders icon-name in leading icon element", () => {
    el.setAttribute("leading-icon", "");
    el.setAttribute("icon-name", "home");
    const iconEl = el.shadowRoot!.querySelector(".leading-icon .material-symbols-outlined");
    expect(iconEl).not.toBeNull();
  });

  // ── Checkbox attribute ────────────────────────────────────────────────────

  it("renders checkbox slot when checkbox is set", () => {
    el.setAttribute("checkbox", "");
    const slot = el.shadowRoot!.querySelector(".checkbox-slot slot[name='checkbox']");
    expect(slot).not.toBeNull();
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns attribute value", () => {
    el.setAttribute("size", "l");
    expect((el as UiTreeItem).size).toBe("l");
  });

  it("size setter updates attribute", () => {
    (el as UiTreeItem).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("level getter returns attribute value", () => {
    el.setAttribute("level", "child-2");
    expect((el as UiTreeItem).level).toBe("child-2");
  });

  it("level setter updates attribute", () => {
    (el as UiTreeItem).level = "child-1";
    expect(el.getAttribute("level")).toBe("child-1");
  });

  it("arrow getter returns attribute value", () => {
    el.setAttribute("arrow", "open");
    expect((el as UiTreeItem).arrow).toBe("open");
  });

  it("arrow setter updates attribute", () => {
    (el as UiTreeItem).arrow = "closed";
    expect(el.getAttribute("arrow")).toBe("closed");
  });

  it("selected getter returns boolean", () => {
    expect((el as UiTreeItem).selected).toBe(false);
    el.setAttribute("selected", "");
    expect((el as UiTreeItem).selected).toBe(true);
  });

  it("selected setter adds/removes attribute", () => {
    (el as UiTreeItem).selected = true;
    expect(el.hasAttribute("selected")).toBe(true);
    (el as UiTreeItem).selected = false;
    expect(el.hasAttribute("selected")).toBe(false);
  });

  it("label getter returns attribute value", () => {
    el.setAttribute("label", "Foo");
    expect((el as UiTreeItem).label).toBe("Foo");
  });

  it("label setter updates attribute", () => {
    (el as UiTreeItem).label = "Bar";
    expect(el.getAttribute("label")).toBe("Bar");
  });

  it("secondaryLabelText getter returns attribute value", () => {
    el.setAttribute("secondary-label", "sub");
    expect((el as UiTreeItem).secondaryLabelText).toBe("sub");
  });

  it("secondaryLabelText setter updates attribute", () => {
    (el as UiTreeItem).secondaryLabelText = "info";
    expect(el.getAttribute("secondary-label")).toBe("info");
  });

  it("iconName getter returns attribute value", () => {
    el.setAttribute("icon-name", "home");
    expect((el as UiTreeItem).iconName).toBe("home");
  });

  it("iconName setter updates attribute", () => {
    (el as UiTreeItem).iconName = "settings";
    expect(el.getAttribute("icon-name")).toBe("settings");
  });

  // ── Arrow chevron icon ────────────────────────────────────────────────────

  it("shows expand-more icon when arrow=closed (rotated via CSS)", () => {
    el.setAttribute("arrow", "closed");
    const icon = el.shadowRoot!.querySelector(".chevron .material-symbols-outlined");
    expect(icon!.textContent).toBe(ICON_EXPAND_MORE);
  });

  it("shows expand-more icon when arrow=open", () => {
    el.setAttribute("arrow", "open");
    const icon = el.shadowRoot!.querySelector(".chevron .material-symbols-outlined");
    expect(icon!.textContent).toBe(ICON_EXPAND_MORE);
  });

  it("shows expand-more icon when arrow=none", () => {
    el.setAttribute("arrow", "none");
    const icon = el.shadowRoot!.querySelector(".chevron .material-symbols-outlined");
    expect(icon!.textContent).toBe(ICON_EXPAND_MORE);
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("sets aria-expanded=true when arrow=open", () => {
    el.setAttribute("arrow", "open");
    expect(el.getAttribute("aria-expanded")).toBe("true");
  });

  it("sets aria-expanded=false when arrow=closed", () => {
    el.setAttribute("arrow", "closed");
    expect(el.getAttribute("aria-expanded")).toBe("false");
  });

  it("removes aria-expanded when arrow=none", () => {
    el.setAttribute("arrow", "open");
    expect(el.getAttribute("aria-expanded")).toBe("true");
    el.setAttribute("arrow", "none");
    expect(el.hasAttribute("aria-expanded")).toBe(false);
  });

  // ── Click behavior ────────────────────────────────────────────────────────

  it("toggles arrow from closed to open on click", () => {
    el.setAttribute("arrow", "closed");
    el.click();
    expect(el.getAttribute("arrow")).toBe("open");
  });

  it("toggles arrow from open to closed on click", () => {
    el.setAttribute("arrow", "open");
    el.click();
    expect(el.getAttribute("arrow")).toBe("closed");
  });

  it("does not change arrow=none on click", () => {
    el.setAttribute("arrow", "none");
    el.click();
    expect(el.getAttribute("arrow")).toBe("none");
  });

  it("dispatches tree-toggle event on click when arrow is open/closed", () => {
    el.setAttribute("arrow", "closed");
    const handler = vi.fn();
    el.addEventListener("tree-toggle", handler);
    el.click();
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ expanded: true });
  });

  it("dispatches tree-toggle with expanded=false when closing", () => {
    el.setAttribute("arrow", "open");
    const handler = vi.fn();
    el.addEventListener("tree-toggle", handler);
    el.click();
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ expanded: false });
  });

  it("does not dispatch tree-toggle when arrow=none", () => {
    el.setAttribute("arrow", "none");
    const handler = vi.fn();
    el.addEventListener("tree-toggle", handler);
    el.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it("dispatches tree-select event on click", () => {
    el.setAttribute("label", "MyItem");
    const handler = vi.fn();
    el.addEventListener("tree-select", handler);
    el.click();
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ label: "MyItem" });
  });

  it("dispatches tree-select even when arrow=none", () => {
    el.setAttribute("arrow", "none");
    el.setAttribute("label", "Leaf");
    const handler = vi.fn();
    el.addEventListener("tree-select", handler);
    el.click();
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ label: "Leaf" });
  });

  it("tree-toggle event bubbles and is composed", () => {
    el.setAttribute("arrow", "closed");
    const handler = vi.fn();
    document.body.addEventListener("tree-toggle", handler);
    el.click();
    expect(handler).toHaveBeenCalledOnce();
    document.body.removeEventListener("tree-toggle", handler);
  });

  it("tree-select event bubbles and is composed", () => {
    el.setAttribute("label", "Test");
    const handler = vi.fn();
    document.body.addEventListener("tree-select", handler);
    el.click();
    expect(handler).toHaveBeenCalledOnce();
    document.body.removeEventListener("tree-select", handler);
  });

  // ── Keyboard ──────────────────────────────────────────────────────────────

  it("triggers click on Enter key", () => {
    el.setAttribute("arrow", "closed");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(el.getAttribute("arrow")).toBe("open");
  });

  it("triggers click on Space key", () => {
    el.setAttribute("arrow", "open");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(el.getAttribute("arrow")).toBe("closed");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observes the correct attributes", () => {
    const observed = (customElements.get("ui-tree-item") as typeof UiTreeItem).observedAttributes;
    expect(observed).toEqual([
      "size",
      "level",
      "arrow",
      "selected",
      "label",
      "secondary-label",
      "leading-icon",
      "icon-name",
      "checkbox",
    ]);
  });

  // ── Styles export ─────────────────────────────────────────────────────────

  it("exports TREE_ITEM_STYLES string", () => {
    expect(typeof TREE_ITEM_STYLES).toBe("string");
    expect(TREE_ITEM_STYLES.length).toBeGreaterThan(0);
  });
});
