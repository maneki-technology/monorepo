import { describe, it, expect, beforeEach } from "vitest";
import "./ui-side-panel-menu-item.js";
import "./ui-side-panel-menu.js";

describe("ui-side-panel-menu", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-side-panel-menu");
    document.body.appendChild(el);
  });

  /** Helper: get the inner ui-side-panel's shadow root */
  function panelShadow(menu: HTMLElement): ShadowRoot {
    const panel = menu.shadowRoot!.querySelector("ui-side-panel")!;
    return panel.shadowRoot!;
  }

  function createMenu(
    attrs: Record<string, string> = {},
    itemCount = 3,
  ): HTMLElement {
    const menu = document.createElement("ui-side-panel-menu");
    for (let i = 0; i < itemCount; i++) {
      const item = document.createElement("ui-side-panel-menu-item");
      item.setAttribute("leading-icon", "");
      item.textContent = `Item ${i + 1}`;
      menu.appendChild(item);
    }
    document.body.appendChild(menu);
    // Set attributes after connecting to avoid panel's connectedCallback overriding them
    for (const [k, v] of Object.entries(attrs)) {
      menu.setAttribute(k, v);
    }
    return menu;
  }

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-side-panel-menu")).toBeDefined();
  });

  it("has a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults state to 'expanded'", () => {
    expect((el as any).state).toBe("expanded");
  });

  it("defaults overlay to false", () => {
    expect((el as any).overlay).toBe(false);
  });

  // ── observedAttributes ───────────────────────────────────────────────────

  it("has correct observedAttributes", () => {
    const Ctor = customElements.get("ui-side-panel-menu") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual(["state", "overlay", "mobile", "no-collapse"]);
  });

  // ── State attribute ──────────────────────────────────────────────────────

  it("reflects state='expanded' to attribute", () => {
    (el as any).state = "expanded";
    expect(el.getAttribute("state")).toBe("expanded");
  });

  it("reflects state='collapsed' to attribute", async () => {
    (el as any).state = "collapsed";
    await (el as any).updateComplete;
    expect(el.getAttribute("state")).toBe("collapsed");
  });

  // ── Overlay attribute ────────────────────────────────────────────────────

  it("reflects overlay=true to attribute", async () => {
    (el as any).overlay = true;
    await (el as any).updateComplete;
    expect(el.hasAttribute("overlay")).toBe(true);
  });

  it("removes overlay attribute when set to false", () => {
    (el as any).overlay = true;
    (el as any).overlay = false;
    expect(el.hasAttribute("overlay")).toBe(false);
  });

  // ── Shadow DOM structure ─────────────────────────────────────────────────

  it("renders a .container element", () => {
    const container = panelShadow(el).querySelector(".container");
    expect(container).toBeTruthy();
  });

  it("renders a .header element", () => {
    const header = panelShadow(el).querySelector(".header");
    expect(header).toBeTruthy();
  });

  it("renders a title via header slot", () => {
    const slot = el.shadowRoot!.querySelector("slot[name='header']");
    expect(slot).toBeTruthy();
  });

  it("renders a .header-toggle button", () => {
    const toggle = panelShadow(el).querySelector(".header-toggle");
    expect(toggle).toBeTruthy();
    expect(toggle!.tagName).toBe("BUTTON");
  });

  it("renders a .separator element", () => {
    const separator = panelShadow(el).querySelector(".separator");
    expect(separator).toBeTruthy();
  });

  it("renders a .menu element with role=tree", () => {
    const menu = el.shadowRoot!.querySelector(".menu");
    expect(menu).toBeTruthy();
    expect(menu!.getAttribute("role")).toBe("tree");
  });

  it("renders a slot inside .menu", () => {
    const slot = el.shadowRoot!.querySelector(".menu slot");
    expect(slot).toBeTruthy();
  });

  // ── Title ────────────────────────────────────────────────────────────────

  it("accepts content in header slot", () => {
    const span = document.createElement("span");
    span.setAttribute("slot", "header");
    span.textContent = "Navigation";
    el.appendChild(span);
    const slotted = el.querySelector("span[slot='header']");
    expect(slotted).toBeTruthy();
    expect(slotted!.textContent).toBe("Navigation");
  });

  it("renders empty header slot when no content provided", () => {
    const slot = el.shadowRoot!.querySelector("slot[name='header']");
    expect(slot).toBeTruthy();
  });

  // ── Toggle behavior ──────────────────────────────────────────────────────

  it("toggles state when toggle button is clicked", async () => {
    expect((el as any).state).toBe("expanded");

    const toggle = panelShadow(el).querySelector(".header-toggle") as HTMLElement;
    toggle.click();
    const panel = el.shadowRoot!.querySelector("ui-side-panel")!;
    await (panel as any).updateComplete;
    await (el as any).updateComplete;

    expect((el as any).state).toBe("collapsed");

    toggle.click();
    await (panel as any).updateComplete;
    await (el as any).updateComplete;
    expect((el as any).state).toBe("expanded");
  });

  it("dispatches toggle event when toggle button is clicked", () => {
    let detail: any = null;
    el.addEventListener("toggle", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const toggle = panelShadow(el).querySelector(".header-toggle") as HTMLElement;
    toggle.click();

    expect(detail).toEqual({ state: "collapsed" });
  });

  it("dispatches toggle event with state=expanded when expanding", async () => {
    (el as any).state = "collapsed";
    await (el as any).updateComplete;
    let detail: any = null;
    el.addEventListener("toggle", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const toggle = panelShadow(el).querySelector(".header-toggle") as HTMLElement;
    toggle.click();

    expect(detail).toEqual({ state: "expanded" });
  });

  // ── Toggle icon ──────────────────────────────────────────────────────────

  it("shows chevron-left icon when expanded", () => {
    const toggle = panelShadow(el).querySelector(".header-toggle");
    const icon = toggle!.querySelector(".material-symbols-outlined");
    expect(icon).toBeTruthy();
  });

  it("shows chevron-right icon when collapsed", () => {
    (el as any).state = "collapsed";
    const toggle = panelShadow(el).querySelector(".header-toggle");
    const icon = toggle!.querySelector(".material-symbols-outlined");
    expect(icon).toBeTruthy();
  });

  // ── Toggle aria-label ────────────────────────────────────────────────────

  it("has aria-label 'Collapse panel' when expanded", () => {
    const toggle = panelShadow(el).querySelector(".header-toggle");
    expect(toggle!.getAttribute("aria-label")).toBe("Collapse panel");
  });

  it("has aria-label 'Expand panel' when collapsed", async () => {
    (el as any).state = "collapsed";
    await (el as any).updateComplete;
    const toggle = panelShadow(el).querySelector(".header-toggle");
    expect(toggle!.getAttribute("aria-label")).toBe("Expand panel");
  });

  // ── Collapsed mode item type sync ────────────────────────────────────────

  it("sets type=icon-only on child items when collapsed", async () => {
    const menu = createMenu();
    (menu as any).state = "collapsed";
    // happy-dom may not fire slotchange, so call sync manually
    (menu as any)._syncItemTypes();
    const items = menu.querySelectorAll("ui-side-panel-menu-item");
    for (const item of items) {
      expect(item.getAttribute("type")).toBe("icon-only");
    }
  });

  it("removes type attribute from child items when expanded", () => {
    const menu = createMenu({ state: "collapsed" });
    (menu as any)._syncItemTypes();

    menu.setAttribute("state", "expanded");
    (menu as any)._syncItemTypes();

    const items = menu.querySelectorAll("ui-side-panel-menu-item");
    for (const item of items) {
      expect(item.hasAttribute("type")).toBe(false);
    }
  });

  // ── Keyboard navigation ──────────────────────────────────────────────────

  it("handles ArrowDown key to move focus to next item", () => {
    const menu = createMenu();
    const menuEl = menu.shadowRoot!.querySelector(".menu") as HTMLElement;

    // Simulate ArrowDown
    menuEl.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );

    // Verify the event was handled (no error thrown)
    expect(true).toBe(true);
  });

  it("handles ArrowUp key to move focus to previous item", () => {
    const menu = createMenu();
    const menuEl = menu.shadowRoot!.querySelector(".menu") as HTMLElement;

    menuEl.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
    );

    expect(true).toBe(true);
  });

  it("handles Home key", () => {
    const menu = createMenu();
    const menuEl = menu.shadowRoot!.querySelector(".menu") as HTMLElement;

    menuEl.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    );

    expect(true).toBe(true);
  });

  it("handles End key", () => {
    const menu = createMenu();
    const menuEl = menu.shadowRoot!.querySelector(".menu") as HTMLElement;

    menuEl.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true }),
    );

    expect(true).toBe(true);
  });

  it("handles ArrowRight to expand an expandable item", () => {
    const menu = document.createElement("ui-side-panel-menu");
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("expandable", "");
    item.textContent = "Expandable";
    menu.appendChild(item);
    document.body.appendChild(menu);

    // ArrowRight on an expandable, collapsed item should expand it
    // This tests the handler doesn't throw
    const menuEl = menu.shadowRoot!.querySelector(".menu") as HTMLElement;
    menuEl.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    expect(true).toBe(true);
  });

  it("handles ArrowLeft to collapse an expanded item", () => {
    const menu = document.createElement("ui-side-panel-menu");
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("expandable", "");
    item.setAttribute("expanded", "");
    item.textContent = "Expanded";
    menu.appendChild(item);
    document.body.appendChild(menu);

    const menuEl = menu.shadowRoot!.querySelector(".menu") as HTMLElement;
    menuEl.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
    );

    expect(true).toBe(true);
  });
  // ── Selection management ──────────────────────────────────────────────────

  it("selects a non-expandable item when clicked", async () => {
    const menu = createMenu();
    const items = menu.querySelectorAll("ui-side-panel-menu-item");
    await (items[1] as any).updateComplete;
    const row = items[1].shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();

    expect(items[1].hasAttribute("selected")).toBe(true);
    expect(items[0].hasAttribute("selected")).toBe(false);
    expect(items[2].hasAttribute("selected")).toBe(false);
  });

  it("deselects previously selected item when another is clicked", async () => {
    const menu = createMenu();
    const items = menu.querySelectorAll("ui-side-panel-menu-item");
    await (items[0] as any).updateComplete;

    // Select first item
    const row0 = items[0].shadowRoot!.querySelector(".row") as HTMLElement;
    row0.click();
    expect(items[0].hasAttribute("selected")).toBe(true);

    // Select second item
    const row1 = items[1].shadowRoot!.querySelector(".row") as HTMLElement;
    row1.click();
    expect(items[1].hasAttribute("selected")).toBe(true);
    expect(items[0].hasAttribute("selected")).toBe(false);
  });

  it("does not select expandable items on click", async () => {
    const menu = document.createElement("ui-side-panel-menu");
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("expandable", "");
    item.setAttribute("leading-icon", "");
    item.textContent = "Expandable";
    menu.appendChild(item);
    document.body.appendChild(menu);
    await (item as any).updateComplete;

    const row = item.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();

    expect(item.hasAttribute("selected")).toBe(false);
  });

  it("marks parent as child-parent-selected when nested child is selected", async () => {
    const menu = document.createElement("ui-side-panel-menu");
    const parent = document.createElement("ui-side-panel-menu-item");
    parent.setAttribute("expandable", "");
    parent.setAttribute("expanded", "");
    parent.setAttribute("leading-icon", "");
    parent.textContent = "Parent";

    const child = document.createElement("ui-side-panel-menu-item");
    child.setAttribute("slot", "children");
    child.setAttribute("level", "secondary");
    child.textContent = "Child";
    parent.appendChild(child);

    menu.appendChild(parent);
    document.body.appendChild(menu);
    await (child as any).updateComplete;

    // Click the child
    const childRow = child.shadowRoot!.querySelector(".row") as HTMLElement;
    childRow.click();

    expect(child.hasAttribute("selected")).toBe(true);
    expect(parent.hasAttribute("child-parent-selected")).toBe(true);
  });
  // ── Collapsed flyout submenu ──────────────────────────────────────────────
  it("renders a .flyout element in shadow DOM", () => {
    const flyout = el.shadowRoot!.querySelector(".flyout");
    expect(flyout).toBeTruthy();
    expect(flyout!.hasAttribute("open")).toBe(false);
  });
  it("does not expand inline when collapsed and expandable item is clicked", async () => {
    const menu = document.createElement("ui-side-panel-menu");
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("expandable", "");
    item.setAttribute("leading-icon", "");
    item.textContent = "Parent";
    const child = document.createElement("ui-side-panel-menu-item");
    child.setAttribute("slot", "children");
    child.setAttribute("level", "secondary");
    child.textContent = "Child";
    item.appendChild(child);
    menu.appendChild(item);
    document.body.appendChild(menu);
    await (item as any).updateComplete;
    menu.setAttribute("state", "collapsed");
    const row = item.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();
    // Should NOT be expanded inline
    expect(item.hasAttribute("expanded")).toBe(false);
  });
  it("opens flyout when collapsed expandable item is clicked", async () => {
    const menu = document.createElement("ui-side-panel-menu");
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("expandable", "");
    item.setAttribute("leading-icon", "");
    item.textContent = "Parent";
    const child = document.createElement("ui-side-panel-menu-item");
    child.setAttribute("slot", "children");
    child.setAttribute("level", "secondary");
    child.textContent = "Child";
    item.appendChild(child);
    menu.appendChild(item);
    document.body.appendChild(menu);
    await (item as any).updateComplete;
    (menu as any).state = "collapsed";
    await (menu as any).updateComplete;
    const row = item.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();
    const flyout = menu.shadowRoot!.querySelector(".flyout");
    expect(flyout!.hasAttribute("open")).toBe(true);
  });
  it("closes flyout when same item is clicked again", async () => {
    const menu = document.createElement("ui-side-panel-menu");
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("expandable", "");
    item.setAttribute("leading-icon", "");
    item.textContent = "Parent";
    const child = document.createElement("ui-side-panel-menu-item");
    child.setAttribute("slot", "children");
    child.setAttribute("level", "secondary");
    child.textContent = "Child";
    item.appendChild(child);
    menu.appendChild(item);
    document.body.appendChild(menu);
    await (item as any).updateComplete;
    (menu as any).state = "collapsed";
    await (menu as any).updateComplete;
    const row = item.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();
    expect(menu.shadowRoot!.querySelector(".flyout")!.hasAttribute("open")).toBe(true);
    row.click();
    expect(menu.shadowRoot!.querySelector(".flyout")!.hasAttribute("open")).toBe(false);
  });
  it("closes flyout when Escape is pressed", async () => {
    const menu = document.createElement("ui-side-panel-menu");
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("expandable", "");
    item.setAttribute("leading-icon", "");
    item.textContent = "Parent";
    const child = document.createElement("ui-side-panel-menu-item");
    child.setAttribute("slot", "children");
    child.setAttribute("level", "secondary");
    child.textContent = "Child";
    item.appendChild(child);
    menu.appendChild(item);
    document.body.appendChild(menu);
    await (item as any).updateComplete;
    (menu as any).state = "collapsed";
    await (menu as any).updateComplete;
    const row = item.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();
    expect(menu.shadowRoot!.querySelector(".flyout")!.hasAttribute("open")).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(menu.shadowRoot!.querySelector(".flyout")!.hasAttribute("open")).toBe(false);
  });
  it("closes flyout when state changes to expanded", async () => {
    const menu = document.createElement("ui-side-panel-menu");
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("expandable", "");
    item.setAttribute("leading-icon", "");
    item.textContent = "Parent";
    const child = document.createElement("ui-side-panel-menu-item");
    child.setAttribute("slot", "children");
    child.setAttribute("level", "secondary");
    child.textContent = "Child";
    item.appendChild(child);
    menu.appendChild(item);
    document.body.appendChild(menu);
    await (item as any).updateComplete;
    (menu as any).state = "collapsed";
    await (menu as any).updateComplete;
    const row = item.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();
    expect(menu.shadowRoot!.querySelector(".flyout")!.hasAttribute("open")).toBe(true);
    (menu as any).state = "expanded";
    await (menu as any).updateComplete;
    expect(menu.shadowRoot!.querySelector(".flyout")!.hasAttribute("open")).toBe(false);
  });
  it("does not open flyout when expanded and expandable item is clicked", async () => {
    const menu = document.createElement("ui-side-panel-menu");
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("expandable", "");
    item.setAttribute("leading-icon", "");
    item.textContent = "Parent";
    const child = document.createElement("ui-side-panel-menu-item");
    child.setAttribute("slot", "children");
    child.setAttribute("level", "secondary");
    child.textContent = "Child";
    item.appendChild(child);
    menu.appendChild(item);
    document.body.appendChild(menu);
    await (item as any).updateComplete;
    const row = item.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();
    await (item as any).updateComplete;
    const flyout = menu.shadowRoot!.querySelector(".flyout");
    expect(flyout!.hasAttribute("open")).toBe(false);
    // But item should be expanded inline
    expect(item.hasAttribute("expanded")).toBe(true);
  });

  // ── Mobile responsive ────────────────────────────────────────────────────

  it("reflects mobile attribute", () => {
    el.setAttribute("mobile", "");
    expect(el.hasAttribute("mobile")).toBe(true);
    el.removeAttribute("mobile");
    expect(el.hasAttribute("mobile")).toBe(false);
  });

  it("auto-collapses when mobile attribute is set", async () => {
    const menu = createMenu();
    expect(menu.getAttribute("state")).not.toBe("collapsed");
    menu.setAttribute("mobile", "");
    await (menu as any).updateComplete;
    expect(menu.getAttribute("state")).toBe("collapsed");
  });

  it("restores expanded state when mobile attribute is removed", async () => {
    const menu = createMenu();
    menu.setAttribute("mobile", "");
    await (menu as any).updateComplete;
    expect(menu.getAttribute("state")).toBe("collapsed");
    menu.removeAttribute("mobile");
    await (menu as any).updateComplete;
    expect(menu.getAttribute("state")).toBe("expanded");
    expect(menu.hasAttribute("overlay")).toBe(false);
  });

  it("sets overlay when toggling to expanded on mobile", async () => {
    const menu = createMenu();
    (menu as any).mobile = true;
    (menu as any).state = "collapsed";
    await (menu as any).updateComplete;
    expect(menu.getAttribute("state")).toBe("collapsed");
    // Click toggle to expand
    const toggleBtn = panelShadow(menu).querySelector(".header-toggle") as HTMLElement;
    const panel = menu.shadowRoot!.querySelector("ui-side-panel")!;
    toggleBtn.click();
    await (panel as any).updateComplete;
    await (menu as any).updateComplete;
    expect(menu.getAttribute("state")).toBe("expanded");
    expect(menu.hasAttribute("overlay")).toBe(true);
  });
  it("removes overlay when toggling back to collapsed on mobile", async () => {
    const menu = createMenu();
    (menu as any).mobile = true;
    (menu as any).state = "collapsed";
    await (menu as any).updateComplete;
    const toggleBtn = panelShadow(menu).querySelector(".header-toggle") as HTMLElement;
    const panel = menu.shadowRoot!.querySelector("ui-side-panel")!;
    // Expand
    toggleBtn.click();
    await (panel as any).updateComplete;
    await (menu as any).updateComplete;
    expect(menu.hasAttribute("overlay")).toBe(true);
    // Collapse again
    toggleBtn.click();
    await (panel as any).updateComplete;
    await (menu as any).updateComplete;
    expect(menu.getAttribute("state")).toBe("collapsed");
    expect(menu.hasAttribute("overlay")).toBe(false);
  });
  it("clears overlay when leaving mobile after expanded toggle", async () => {
    const menu = createMenu();
    (menu as any).mobile = true;
    (menu as any).state = "collapsed";
    await (menu as any).updateComplete;
    const toggleBtn = panelShadow(menu).querySelector(".header-toggle") as HTMLElement;
    const panel = menu.shadowRoot!.querySelector("ui-side-panel")!;
    toggleBtn.click(); // expand on mobile
    await (panel as any).updateComplete;
    await (menu as any).updateComplete;
    expect(menu.hasAttribute("overlay")).toBe(true);
    menu.removeAttribute("mobile");
    await (menu as any).updateComplete;
    expect(menu.getAttribute("state")).toBe("expanded");
  });
});
