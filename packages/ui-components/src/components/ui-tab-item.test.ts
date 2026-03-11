import { describe, it, expect, beforeEach } from "vitest";
import "./ui-tab-item.js";

describe("ui-tab-item", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-tab-item");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-tab-item")).toBeDefined();
  });

  it("has shadow DOM", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  it("uses Constructable Stylesheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThan(0);
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults orientation to 'horizontal'", () => {
    expect((el as unknown as { orientation: string }).orientation).toBe("horizontal");
  });

  it("defaults selected to false", () => {
    expect((el as unknown as { selected: boolean }).selected).toBe(false);
  });

  it("defaults disabled to false", () => {
    expect((el as unknown as { disabled: boolean }).disabled).toBe(false);
  });

  it("defaults label to empty string", () => {
    expect((el as unknown as { label: string }).label).toBe("");
  });

  it("defaults subMenu to false", () => {
    expect((el as unknown as { subMenu: boolean }).subMenu).toBe(false);
  });

  it("defaults value to empty string", () => {
    expect((el as unknown as { value: string }).value).toBe("");
  });

  // ── Size attribute ──────────────────────────────────────────────────────

  it("reflects size='s' to attribute", () => {
    (el as unknown as { size: string }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects size='m' to attribute", () => {
    (el as unknown as { size: string }).size = "m";
    expect(el.getAttribute("size")).toBe("m");
  });

  // ── Orientation attribute ───────────────────────────────────────────────

  it("reflects orientation='horizontal' to attribute", () => {
    (el as unknown as { orientation: string }).orientation = "horizontal";
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  it("reflects orientation='vertical' to attribute", () => {
    (el as unknown as { orientation: string }).orientation = "vertical";
    expect(el.getAttribute("orientation")).toBe("vertical");
  });

  // ── Boolean attributes ──────────────────────────────────────────────────

  it("sets selected attribute when property is true", () => {
    (el as unknown as { selected: boolean }).selected = true;
    expect(el.hasAttribute("selected")).toBe(true);
  });

  it("removes selected attribute when property is false", () => {
    (el as unknown as { selected: boolean }).selected = true;
    (el as unknown as { selected: boolean }).selected = false;
    expect(el.hasAttribute("selected")).toBe(false);
  });

  it("sets disabled attribute when property is true", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("removes disabled attribute when property is false", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("sets sub-menu attribute when subMenu property is true", () => {
    (el as unknown as { subMenu: boolean }).subMenu = true;
    expect(el.hasAttribute("sub-menu")).toBe(true);
  });

  it("removes sub-menu attribute when subMenu property is false", () => {
    (el as unknown as { subMenu: boolean }).subMenu = true;
    (el as unknown as { subMenu: boolean }).subMenu = false;
    expect(el.hasAttribute("sub-menu")).toBe(false);
  });

  // ── Label attribute ─────────────────────────────────────────────────────

  it("reflects label to attribute", () => {
    (el as unknown as { label: string }).label = "Settings";
    expect(el.getAttribute("label")).toBe("Settings");
  });

  it("renders label text in shadow DOM", () => {
    el.setAttribute("label", "Dashboard");
    const labelEl = el.shadowRoot!.querySelector(".label-text");
    expect(labelEl?.textContent).toBe("Dashboard");
  });

  // ── Value attribute ─────────────────────────────────────────────────────

  it("reflects value to attribute", () => {
    (el as unknown as { value: string }).value = "tab-1";
    expect(el.getAttribute("value")).toBe("tab-1");
  });

  // ── Shadow DOM structure ───────────────────────────────────────────────

  it("has .base element in shadow DOM", () => {
    expect(el.shadowRoot!.querySelector(".base")).toBeTruthy();
  });

  it("has .highlight element in shadow DOM", () => {
    expect(el.shadowRoot!.querySelector(".highlight")).toBeTruthy();
  });

  it("has .label-container element in shadow DOM", () => {
    expect(el.shadowRoot!.querySelector(".label-container")).toBeTruthy();
  });

  it("has .label-text element in shadow DOM", () => {
    expect(el.shadowRoot!.querySelector(".label-text")).toBeTruthy();
  });

  it("has leading-icon slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="leading-icon"]');
    expect(slot).toBeTruthy();
  });

  it("has trailing-icon slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="trailing-icon"]');
    expect(slot).toBeTruthy();
  });

  it("has .chevron element in shadow DOM", () => {
    expect(el.shadowRoot!.querySelector(".chevron")).toBeTruthy();
  });

  // ── Accessibility ──────────────────────────────────────────────────────

  it("sets role='tab' on connected", () => {
    expect(el.getAttribute("role")).toBe("tab");
  });

  it("sets tabindex='0' on connected", () => {
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("sets aria-selected='false' by default", () => {
    expect(el.getAttribute("aria-selected")).toBe("false");
  });

  it("sets aria-selected='true' when selected", () => {
    (el as unknown as { selected: boolean }).selected = true;
    expect(el.getAttribute("aria-selected")).toBe("true");
  });

  it("sets aria-disabled='false' by default", () => {
    expect(el.getAttribute("aria-disabled")).toBe("false");
  });

  it("sets aria-disabled='true' when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  // ── Events ─────────────────────────────────────────────────────────────

  it("dispatches tab-select event on click", () => {
    let fired = false;
    el.addEventListener("tab-select", () => {
      fired = true;
    });
    el.click();
    expect(fired).toBe(true);
  });

  it("does not dispatch tab-select when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    let fired = false;
    el.addEventListener("tab-select", () => {
      fired = true;
    });
    el.click();
    expect(fired).toBe(false);
  });

  it("tab-select event bubbles and is composed", () => {
    let event: Event | null = null;
    el.addEventListener("tab-select", (e) => {
      event = e;
    });
    el.click();
    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  it("dispatches tab-select on every click (not just first)", () => {
    let count = 0;
    el.addEventListener("tab-select", () => {
      count++;
    });
    el.click();
    el.click();
    expect(count).toBe(2);
  });

  // ── Keyboard interaction ───────────────────────────────────────────────

  it("dispatches tab-select on Space key", () => {
    let fired = false;
    el.addEventListener("tab-select", () => {
      fired = true;
    });
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(fired).toBe(true);
  });

  it("dispatches tab-select on Enter key", () => {
    let fired = false;
    el.addEventListener("tab-select", () => {
      fired = true;
    });
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(fired).toBe(true);
  });

  it("does not dispatch tab-select on other keys", () => {
    let fired = false;
    el.addEventListener("tab-select", () => {
      fired = true;
    });
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(fired).toBe(false);
  });

  it("does not dispatch tab-select on Space when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    let fired = false;
    el.addEventListener("tab-select", () => {
      fired = true;
    });
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(fired).toBe(false);
  });

  // ── CSS styles ─────────────────────────────────────────────────────────

  it("includes Inter font-family in styles", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join(""),
      )
      .join("");
    expect(styles).toContain("Inter");
  });

  it("includes Material Symbols font-face in styles", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join(""),
      )
      .join("");
    expect(styles).toContain("Material Symbols Outlined");
  });

  // ── Property accessors ────────────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      orientation: string;
      selected: boolean;
      disabled: boolean;
      label: string;
      subMenu: boolean;
      value: string;
    };

    component.size = "s";
    expect(component.size).toBe("s");

    component.orientation = "vertical";
    expect(component.orientation).toBe("vertical");

    component.selected = true;
    expect(component.selected).toBe(true);

    component.disabled = true;
    expect(component.disabled).toBe(true);

    component.label = "Test Tab";
    expect(component.label).toBe("Test Tab");

    component.subMenu = true;
    expect(component.subMenu).toBe(true);

    component.value = "test-val";
    expect(component.value).toBe("test-val");
  });

  // ── Closable ──────────────────────────────────────────────────────────

  it("defaults closable to false", () => {
    expect((el as unknown as { closable: boolean }).closable).toBe(false);
  });

  it("reflects closable attribute", () => {
    el.setAttribute("closable", "");
    expect((el as unknown as { closable: boolean }).closable).toBe(true);
    el.removeAttribute("closable");
    expect((el as unknown as { closable: boolean }).closable).toBe(false);
  });

  it("has close button element in shadow DOM", () => {
    const closeBtn = el.shadowRoot!.querySelector(".close-btn");
    expect(closeBtn).toBeTruthy();
    expect(closeBtn?.getAttribute("aria-label")).toBe("Close tab");
  });

  it("has CSS rule to show close button when closable", () => {
    const styles = el.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join("")
      )
      .join("");
    expect(styles).toContain("closable");
    expect(styles).toContain("close-btn");
  });

  it("dispatches tab-close event on close button click", () => {
    el.setAttribute("closable", "");
    el.setAttribute("value", "my-tab");
    let detail: { value: string } | null = null;
    el.addEventListener("tab-close", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const closeBtn = el.shadowRoot!.querySelector(".close-btn") as HTMLElement;
    closeBtn.click();
    expect(detail).toEqual({ value: "my-tab" });
  });

  it("does not dispatch tab-close when disabled", () => {
    el.setAttribute("closable", "");
    el.setAttribute("disabled", "");
    let fired = false;
    el.addEventListener("tab-close", () => { fired = true; });
    const closeBtn = el.shadowRoot!.querySelector(".close-btn") as HTMLElement;
    closeBtn.click();
    expect(fired).toBe(false);
  });

  it("close button click does not trigger tab-select", () => {
    el.setAttribute("closable", "");
    let selectFired = false;
    el.addEventListener("tab-select", () => { selectFired = true; });
    const closeBtn = el.shadowRoot!.querySelector(".close-btn") as HTMLElement;
    closeBtn.click();
    expect(selectFired).toBe(false);
  });
});
