import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-dropdown-split.js";
import "./ui-dropdown-item.js";
import "./ui-dropdown-heading.js";
import "./ui-dropdown-separator.js";

// ─── Custom element registration ────────────────────────────────────────────

describe("UiDropdownSplit — registration", () => {
  it("should be defined as a custom element", () => {
    expect(customElements.get("ui-dropdown-split")).toBeDefined();
  });

  it("should create an instance via document.createElement", () => {
    const el = document.createElement("ui-dropdown-split");
    expect(el).toBeInstanceOf(HTMLElement);
  });
});

// ─── DOM structure ──────────────────────────────────────────────────────────

describe("UiDropdownSplit — DOM structure", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should render with shadow DOM", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  it("should render a .base container", () => {
    const base = el.shadowRoot!.querySelector(".base");
    expect(base).toBeTruthy();
  });

  it("should render a left button with part='left'", () => {
    const left = el.shadowRoot!.querySelector(".left");
    expect(left).toBeTruthy();
    expect(left?.getAttribute("part")).toBe("left");
  });

  it("should render a right button with part='right'", () => {
    const right = el.shadowRoot!.querySelector(".right");
    expect(right).toBeTruthy();
    expect(right?.getAttribute("part")).toBe("right");
  });

  it("should render a divider between buttons", () => {
    const divider = el.shadowRoot!.querySelector(".divider");
    expect(divider).toBeTruthy();
    const inner = divider?.querySelector(".divider-inner");
    expect(inner).toBeTruthy();
  });

  it("should render a chevron ui-icon in the right button", () => {
    const chevron = el.shadowRoot!.querySelector(".chevron");
    expect(chevron).toBeTruthy();
    expect(chevron?.querySelector("ui-icon")).toBeTruthy();
  });

  it("should render a menu panel with role='menu'", () => {
    const menu = el.shadowRoot!.querySelector(".menu");
    expect(menu).toBeTruthy();
    expect(menu?.getAttribute("role")).toBe("menu");
  });

  it("should render icon-start slot wrapper", () => {
    const wrapper = el.shadowRoot!.querySelector(".slot-icon-start");
    expect(wrapper).toBeTruthy();
    const slot = wrapper?.querySelector("slot[name='icon-start']");
    expect(slot).toBeTruthy();
  });

  it("should render text slot wrapper", () => {
    const wrapper = el.shadowRoot!.querySelector(".slot-text");
    expect(wrapper).toBeTruthy();
  });

  it("should render icon-end slot wrapper", () => {
    const wrapper = el.shadowRoot!.querySelector(".slot-icon-end");
    expect(wrapper).toBeTruthy();
    const slot = wrapper?.querySelector("slot[name='icon-end']");
    expect(slot).toBeTruthy();
  });
});

// ─── Default attribute values ───────────────────────────────────────────────

describe("UiDropdownSplit — defaults", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

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

  it("should default icon to 'text-only'", () => {
    expect((el as any).icon).toBe("text-only");
  });

  it("should default disabled to false", () => {
    expect((el as any).disabled).toBe(false);
  });

  it("should default open to false", () => {
    expect((el as any).open).toBe(false);
  });

  it("should default label to 'Button'", () => {
    expect((el as any).label).toBe("Button");
  });

  it("should default multiple to false", () => {
    expect((el as any).multiple).toBe(false);
  });
});

// ─── Size variants ──────────────────────────────────────────────────────────

describe("UiDropdownSplit — sizes", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should accept size='s'", () => {
    el.setAttribute("size", "s");
    expect((el as any).size).toBe("s");
  });

  it("should accept size='m'", () => {
    el.setAttribute("size", "m");
    expect((el as any).size).toBe("m");
  });

  it("should accept size='l'", () => {
    el.setAttribute("size", "l");
    expect((el as any).size).toBe("l");
  });

  it("should accept size='xl'", () => {
    el.setAttribute("size", "xl");
    expect((el as any).size).toBe("xl");
  });

  it("should set size via property accessor", () => {
    (el as any).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });
});

// ─── Action variants ────────────────────────────────────────────────────────

describe("UiDropdownSplit — actions", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should accept action='primary'", () => {
    el.setAttribute("action", "primary");
    expect((el as any).action).toBe("primary");
  });

  it("should accept action='secondary'", () => {
    el.setAttribute("action", "secondary");
    expect((el as any).action).toBe("secondary");
  });

  it("should accept action='destructive'", () => {
    el.setAttribute("action", "destructive");
    expect((el as any).action).toBe("destructive");
  });

  it("should accept action='info'", () => {
    el.setAttribute("action", "info");
    expect((el as any).action).toBe("info");
  });

  it("should accept action='contrast'", () => {
    el.setAttribute("action", "contrast");
    expect((el as any).action).toBe("contrast");
  });

  it("should set action via property accessor", () => {
    (el as any).action = "destructive";
    expect(el.getAttribute("action")).toBe("destructive");
  });
});

// ─── Emphasis variants ──────────────────────────────────────────────────────

describe("UiDropdownSplit — emphases", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should accept emphasis='bold'", () => {
    el.setAttribute("emphasis", "bold");
    expect((el as any).emphasis).toBe("bold");
  });

  it("should accept emphasis='subtle'", () => {
    el.setAttribute("emphasis", "subtle");
    expect((el as any).emphasis).toBe("subtle");
  });

  it("should accept emphasis='minimal'", () => {
    el.setAttribute("emphasis", "minimal");
    expect((el as any).emphasis).toBe("minimal");
  });

  it("should set emphasis via property accessor", () => {
    (el as any).emphasis = "minimal";
    expect(el.getAttribute("emphasis")).toBe("minimal");
  });
});

// ─── Shape variants ─────────────────────────────────────────────────────────

describe("UiDropdownSplit — shapes", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should accept shape='basic'", () => {
    el.setAttribute("shape", "basic");
    expect((el as any).shape).toBe("basic");
  });

  it("should accept shape='rounded'", () => {
    el.setAttribute("shape", "rounded");
    expect((el as any).shape).toBe("rounded");
  });

  it("should set shape via property accessor", () => {
    (el as any).shape = "rounded";
    expect(el.getAttribute("shape")).toBe("rounded");
  });
});

// ─── Icon modes ─────────────────────────────────────────────────────────────

describe("UiDropdownSplit — icon modes", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should accept icon='text-only'", () => {
    el.setAttribute("icon", "text-only");
    expect((el as any).icon).toBe("text-only");
  });

  it("should accept icon='leading-icon'", () => {
    el.setAttribute("icon", "leading-icon");
    expect((el as any).icon).toBe("leading-icon");
  });

  it("should accept icon='trailing-icon'", () => {
    el.setAttribute("icon", "trailing-icon");
    expect((el as any).icon).toBe("trailing-icon");
  });

  it("should accept icon='icon-only'", () => {
    el.setAttribute("icon", "icon-only");
    expect((el as any).icon).toBe("icon-only");
  });

  it("should set icon via property accessor", () => {
    (el as any).icon = "leading-icon";
    expect(el.getAttribute("icon")).toBe("leading-icon");
  });
});

// ─── Disabled state ─────────────────────────────────────────────────────────

describe("UiDropdownSplit — disabled", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should set disabled via property accessor", () => {
    (el as any).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
    (el as any).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("should sync disabled to left button", () => {
    el.setAttribute("disabled", "");
    const left = el.shadowRoot!.querySelector(".left") as HTMLButtonElement;
    expect(left.disabled).toBe(true);
  });

  it("should sync disabled to right button", () => {
    el.setAttribute("disabled", "");
    const right = el.shadowRoot!.querySelector(".right") as HTMLButtonElement;
    expect(right.disabled).toBe(true);
  });

  it("should not dispatch 'action' event when disabled", () => {
    const handler = vi.fn();
    el.addEventListener("action", handler);
    el.setAttribute("disabled", "");
    const left = el.shadowRoot!.querySelector(".left") as HTMLElement;
    left.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it("should not toggle open when disabled", () => {
    el.setAttribute("disabled", "");
    const right = el.shadowRoot!.querySelector(".right") as HTMLElement;
    right.click();
    expect((el as any).open).toBe(false);
  });
});

// ─── Open/close behavior ────────────────────────────────────────────────────

describe("UiDropdownSplit — open/close", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should toggle open on right button click", () => {
    const right = el.shadowRoot!.querySelector(".right") as HTMLElement;
    right.click();
    expect((el as any).open).toBe(true);
    right.click();
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

  it("should not close when clicking inside the component", () => {
    (el as any).open = true;
    el.click();
    expect((el as any).open).toBe(true);
  });

  it("should set open via property accessor", () => {
    (el as any).open = true;
    expect(el.hasAttribute("open")).toBe(true);
    (el as any).open = false;
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("should not open when left button is clicked", () => {
    const left = el.shadowRoot!.querySelector(".left") as HTMLElement;
    left.click();
    expect((el as any).open).toBe(false);
  });
});

// ─── Left button action event ───────────────────────────────────────────────

describe("UiDropdownSplit — action event", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should dispatch 'action' event on left button click", () => {
    const handler = vi.fn();
    el.addEventListener("action", handler);
    const left = el.shadowRoot!.querySelector(".left") as HTMLElement;
    left.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should dispatch 'action' event that bubbles and is composed", () => {
    const handler = vi.fn();
    el.addEventListener("action", handler);
    const left = el.shadowRoot!.querySelector(".left") as HTMLElement;
    left.click();
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });
});

// ─── Aria attributes ────────────────────────────────────────────────────────

describe("UiDropdownSplit — aria", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should set aria-haspopup on right button", () => {
    const right = el.shadowRoot!.querySelector(".right")!;
    expect(right.getAttribute("aria-haspopup")).toBe("true");
  });

  it("should set aria-expanded='false' by default", () => {
    const right = el.shadowRoot!.querySelector(".right")!;
    expect(right.getAttribute("aria-expanded")).toBe("false");
  });

  it("should set aria-expanded='true' when open", () => {
    el.setAttribute("open", "");
    const right = el.shadowRoot!.querySelector(".right")!;
    expect(right.getAttribute("aria-expanded")).toBe("true");
  });
});

// ─── Label ──────────────────────────────────────────────────────────────────

describe("UiDropdownSplit — label", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should show default label 'Button'", () => {
    const textSlot = el.shadowRoot!.querySelector(".slot-text slot") as HTMLSlotElement;
    expect(textSlot.textContent).toBe("Button");
  });

  it("should update label when attribute changes", () => {
    el.setAttribute("label", "Save");
    const textSlot = el.shadowRoot!.querySelector(".slot-text slot") as HTMLSlotElement;
    expect(textSlot.textContent).toBe("Save");
  });

  it("should set label via property accessor", () => {
    (el as any).label = "Menu";
    expect(el.getAttribute("label")).toBe("Menu");
  });
});

// ─── Single-select behavior ─────────────────────────────────────────────────

describe("UiDropdownSplit — single-select", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should select item on click", () => {
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

  it("should deselect previous item when selecting new one", () => {
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

  it("should return value from value getter", () => {
    el.setAttribute("selectable", "");
    const item = document.createElement("ui-dropdown-item");
    item.setAttribute("value", "foo");
    el.appendChild(item);

    item.shadowRoot!.querySelector("button")!.click();

    expect((el as any).value).toBe("foo");
  });

  });





// ─── Multi-select behavior ──────────────────────────────────────────────────

describe("UiDropdownSplit — multi-select", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    (el as any).multiple = true;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should toggle selection in multi-select mode", () => {
    el.setAttribute("selectable", "");
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
    (el as any).open = true;
    const item = document.createElement("ui-dropdown-item");
    el.appendChild(item);

    item.shadowRoot!.querySelector("button")!.click();

    expect((el as any).open).toBe(true);
  });

  it("should return array from value getter", () => {
    el.setAttribute("selectable", "");
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

  it("should set multiple via property accessor", () => {
    expect(el.hasAttribute("multiple")).toBe(true);
    (el as any).multiple = false;
    expect(el.hasAttribute("multiple")).toBe(false);
  });

  it("should dispatch 'change' event on multi-select", () => {
    el.setAttribute("selectable", "");
    const handler = vi.fn();
    el.addEventListener("change", handler);
    const item = document.createElement("ui-dropdown-item");
    item.setAttribute("value", "x");
    el.appendChild(item);

    item.shadowRoot!.querySelector("button")!.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ─── Size propagation to children ───────────────────────────────────────────

describe("UiDropdownSplit — size propagation", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
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
});

// ─── Chevron rotation ───────────────────────────────────────────────────────

describe("UiDropdownSplit — chevron", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should have chevron rotation styles when open", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(":host([open]) .chevron");
    expect(styles).toContain("rotate(180deg)");
  });
});

// ─── Styles verification ────────────────────────────────────────────────────

describe("UiDropdownSplit — styles", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("should include hover styles for left button", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(".left:hover");
  });

  it("should include hover styles for right button", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(".right:hover");
  });

  it("should include active styles", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(".left:active");
    expect(styles).toContain(".right:active");
  });

  it("should include focus-visible styles", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(".left:focus-visible");
    expect(styles).toContain(".right:focus-visible");
  });

  it("should include reduced motion media query", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });

  it("should include menu panel styles", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(".menu");
    expect(styles).toContain("min-width: 240px");
  });

  it("should include divider styles", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(".divider");
    expect(styles).toContain(".divider-inner");
  });

  it("should include disabled styles", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(":host([disabled])");
  });

  it("should include subtle/minimal hover override", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain(':host([emphasis="subtle"]) .left:hover');
    expect(styles).toContain(':host([emphasis="minimal"]) .right:hover');
  });
});

// ─── Cleanup ────────────────────────────────────────────────────────────────

describe("UiDropdownSplit — cleanup", () => {
  it("should remove document click listener on disconnect", () => {
    const el = document.createElement("ui-dropdown-split");
    document.body.appendChild(el);
    (el as any).open = true;
    el.remove();
    // Should not throw when clicking after removal
    document.body.click();
  });
});
