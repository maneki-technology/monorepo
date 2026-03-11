import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-tab-group.js";
import "./ui-tab-item.js";

describe("ui-tab-group", () => {
  let group: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    group = document.createElement("ui-tab-group");
    document.body.appendChild(group);
  });

  afterEach(() => {
    group.remove();
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-tab-group")).toBeDefined();
  });

  it("has shadow DOM", () => {
    expect(group.shadowRoot).toBeTruthy();
  });

  it("uses Constructable Stylesheets", () => {
    expect(group.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThan(0);
  });

  // ── Rendering ──────────────────────────────────────────────────────────

  it("has role='tablist' on container", () => {
    const tablist = group.shadowRoot!.querySelector(".tablist");
    expect(tablist?.getAttribute("role")).toBe("tablist");
  });

  it("has part='tablist' on container", () => {
    const tablist = group.shadowRoot!.querySelector(".tablist");
    expect(tablist?.getAttribute("part")).toBe("tablist");
  });

  it("renders slot for children", () => {
    const slot = group.shadowRoot!.querySelector("slot");
    expect(slot).toBeTruthy();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect(group.getAttribute("size")).toBeNull();
    expect((group as unknown as { size: string }).size).toBe("m");
  });

  it("defaults orientation to 'horizontal'", () => {
    expect(group.getAttribute("orientation")).toBeNull();
    expect((group as unknown as { orientation: string }).orientation).toBe("horizontal");
  });

  // ── Property accessors ──────────────────────────────────────────────────

  it("gets/sets size property", () => {
    (group as unknown as { size: string }).size = "s";
    expect(group.getAttribute("size")).toBe("s");
    expect((group as unknown as { size: string }).size).toBe("s");
  });

  it("gets/sets orientation property", () => {
    (group as unknown as { orientation: string }).orientation = "vertical";
    expect(group.getAttribute("orientation")).toBe("vertical");
    expect((group as unknown as { orientation: string }).orientation).toBe("vertical");
  });

  // ── ARIA orientation ──────────────────────────────────────────────────

  it("sets aria-orientation='horizontal' by default", () => {
    const tablist = group.shadowRoot!.querySelector(".tablist");
    expect(tablist?.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("updates aria-orientation when orientation changes", () => {
    group.setAttribute("orientation", "vertical");
    const tablist = group.shadowRoot!.querySelector(".tablist");
    expect(tablist?.getAttribute("aria-orientation")).toBe("vertical");
  });

  // ── Size propagation ──────────────────────────────────────────────────

  it("propagates size to tab children", () => {
    const tab1 = document.createElement("ui-tab-item");
    const tab2 = document.createElement("ui-tab-item");
    group.appendChild(tab1);
    group.appendChild(tab2);

    group.setAttribute("size", "s");

    expect(tab1.getAttribute("size")).toBe("s");
    expect(tab2.getAttribute("size")).toBe("s");
  });

  it("propagates size to dynamically added children", () => {
    group.setAttribute("size", "s");

    const tab = document.createElement("ui-tab-item");
    group.appendChild(tab);

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(tab.getAttribute("size")).toBe("s");
        resolve(undefined);
      }, 0);
    });
  });

  it("updates size on existing children when size changes", () => {
    const tab = document.createElement("ui-tab-item");
    group.appendChild(tab);

    group.setAttribute("size", "m");
    expect(tab.getAttribute("size")).toBe("m");

    group.setAttribute("size", "s");
    expect(tab.getAttribute("size")).toBe("s");
  });

  it("supports all size values: s, m", () => {
    const tab = document.createElement("ui-tab-item");
    group.appendChild(tab);

    const sizes: Array<"s" | "m"> = ["s", "m"];
    for (const size of sizes) {
      group.setAttribute("size", size);
      expect(tab.getAttribute("size")).toBe(size);
    }
  });

  // ── Orientation propagation ───────────────────────────────────────────

  it("propagates orientation to tab children", () => {
    const tab1 = document.createElement("ui-tab-item");
    const tab2 = document.createElement("ui-tab-item");
    group.appendChild(tab1);
    group.appendChild(tab2);

    group.setAttribute("orientation", "vertical");

    expect(tab1.getAttribute("orientation")).toBe("vertical");
    expect(tab2.getAttribute("orientation")).toBe("vertical");
  });

  // ── Non-tab children ──────────────────────────────────────────────────

  it("only propagates to UI-TAB-ITEM elements", () => {
    const tab = document.createElement("ui-tab-item");
    const div = document.createElement("div");
    group.appendChild(tab);
    group.appendChild(div);

    group.setAttribute("size", "s");

    expect(tab.getAttribute("size")).toBe("s");
    expect(div.getAttribute("size")).toBeNull();
  });

  // ── Selection management ──────────────────────────────────────────────

  it("selects tab and deselects siblings on click", () => {
    const tab1 = document.createElement("ui-tab-item");
    const tab2 = document.createElement("ui-tab-item");
    const tab3 = document.createElement("ui-tab-item");
    tab1.setAttribute("selected", "");
    group.appendChild(tab1);
    group.appendChild(tab2);
    group.appendChild(tab3);

    tab2.click();

    expect(tab1.hasAttribute("selected")).toBe(false);
    expect(tab2.hasAttribute("selected")).toBe(true);
    expect(tab3.hasAttribute("selected")).toBe(false);
  });

  it("allows only one selected tab at a time", () => {
    const tab1 = document.createElement("ui-tab-item");
    const tab2 = document.createElement("ui-tab-item");
    group.appendChild(tab1);
    group.appendChild(tab2);

    tab1.click();
    expect(tab1.hasAttribute("selected")).toBe(true);
    expect(tab2.hasAttribute("selected")).toBe(false);

    tab2.click();
    expect(tab1.hasAttribute("selected")).toBe(false);
    expect(tab2.hasAttribute("selected")).toBe(true);
  });

  // ── tab-change event ──────────────────────────────────────────────────

  it("dispatches tab-change event when selection changes", () => {
    const tab1 = document.createElement("ui-tab-item");
    tab1.setAttribute("value", "first");
    group.appendChild(tab1);

    let detail: { value: string } | null = null;
    group.addEventListener("tab-change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    tab1.click();

    expect(detail).toBeTruthy();
    expect(detail!.value).toBe("first");
  });

  it("tab-change event bubbles and is composed", () => {
    const tab1 = document.createElement("ui-tab-item");
    group.appendChild(tab1);

    let event: Event | null = null;
    group.addEventListener("tab-change", (e) => {
      event = e;
    });

    tab1.click();

    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  // ── CSS layout ────────────────────────────────────────────────────────

  it("has display: flex on host", () => {
    const styles = group.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join(""),
      )
      .join("");
    expect(styles).toContain("display: flex");
  });

  it("has flex-direction: row for horizontal orientation", () => {
    const styles = group.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join(""),
      )
      .join("");
    expect(styles).toContain("flex-direction: row");
  });

  it("has flex-direction: column for vertical orientation", () => {
    const styles = group.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join(""),
      )
      .join("");
    expect(styles).toContain("flex-direction: column");
  });

  it("has border-bottom style for horizontal orientation", () => {
    const styles = group.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join(""),
      )
      .join("");
    expect(styles).toContain("border-bottom");
  });

  // ── Roving tabindex ───────────────────────────────────────────────────

  it("sets tabindex='0' on first tab when none selected", () => {
    const tab1 = document.createElement("ui-tab-item");
    const tab2 = document.createElement("ui-tab-item");
    group.appendChild(tab1);
    group.appendChild(tab2);

    // Force sync via attribute change
    group.setAttribute("size", "m");

    expect(tab1.getAttribute("tabindex")).toBe("0");
    expect(tab2.getAttribute("tabindex")).toBe("-1");
  });

  it("sets tabindex='0' on selected tab", () => {
    const tab1 = document.createElement("ui-tab-item");
    const tab2 = document.createElement("ui-tab-item");
    tab2.setAttribute("selected", "");
    group.appendChild(tab1);
    group.appendChild(tab2);

    // Force sync via attribute change
    group.setAttribute("size", "m");

    expect(tab1.getAttribute("tabindex")).toBe("-1");
    expect(tab2.getAttribute("tabindex")).toBe("0");
  });

  // ── Gap values ────────────────────────────────────────────────────────

  it("has gap style for size='m'", () => {
    const styles = group.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join(""),
      )
      .join("");
    expect(styles).toContain(':host([size="m"]) .tablist');
  });

  it("has gap style for size='s'", () => {
    const styles = group.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join(""),
      )
      .join("");
    expect(styles).toContain(':host([size="s"]) .tablist');
  });

  // ── Overflow attribute ──────────────────────────────────────────────────

  it("defaults overflow to 'scroll'", () => {
    expect(group.getAttribute("overflow")).toBeNull();
    expect((group as unknown as { overflow: string }).overflow).toBe("scroll");
  });

  it("gets/sets overflow property", () => {
    (group as unknown as { overflow: string }).overflow = "menu";
    expect(group.getAttribute("overflow")).toBe("menu");
    expect((group as unknown as { overflow: string }).overflow).toBe("menu");
  });

  // ── More button ──────────────────────────────────────────────────────────

  it("has a more button in shadow DOM", () => {
    const moreBtn = group.shadowRoot!.querySelector(".more-btn");
    expect(moreBtn).toBeTruthy();
    expect(moreBtn?.getAttribute("aria-label")).toBe("More tabs");
    expect(moreBtn?.getAttribute("aria-haspopup")).toBe("true");
  });

  it("has an overflow menu in shadow DOM", () => {
    const menu = group.shadowRoot!.querySelector(".overflow-menu");
    expect(menu).toBeTruthy();
    expect(menu?.getAttribute("role")).toBe("menu");
  });

  it("more button is hidden by default (scroll mode)", () => {
    const moreBtn = group.shadowRoot!.querySelector(".more-btn") as HTMLElement;
    expect(moreBtn.classList.contains("visible")).toBe(false);
  });

  // ── Width/height stretch ────────────────────────────────────────────────

  it("has width: 100% for horizontal orientation in styles", () => {
    const raw = group.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join("")
      )
      .join("");
    expect(raw).toContain("width: 100%");
  });

  it("has height: 100% for vertical orientation in styles", () => {
    const raw = group.shadowRoot!.adoptedStyleSheets
      .map((s: CSSStyleSheet) =>
        Array.from(s.cssRules)
          .map((r: CSSRule) => r.cssText)
          .join("")
      )
      .join("");
    expect(raw).toContain("height: 100%");
  });

  // ── Wrapper element ─────────────────────────────────────────────────────

  it("has a wrapper element containing tablist and more button", () => {
    const wrapper = group.shadowRoot!.querySelector(".wrapper");
    expect(wrapper).toBeTruthy();
    expect(wrapper?.querySelector(".tablist")).toBeTruthy();
    expect(wrapper?.querySelector(".more-btn")).toBeTruthy();
    expect(wrapper?.querySelector(".overflow-menu")).toBeTruthy();
  });

  // ── Closable propagation ─────────────────────────────────────────────────

  it("defaults closable to false", () => {
    expect((group as unknown as { closable: boolean }).closable).toBe(false);
  });

  it("propagates closable to children", async () => {
    const tab1 = document.createElement("ui-tab-item");
    tab1.setAttribute("label", "Tab 1");
    group.appendChild(tab1);
    await new Promise((r) => requestAnimationFrame(r));

    expect(tab1.hasAttribute("closable")).toBe(false);

    group.setAttribute("closable", "");
    await new Promise((r) => requestAnimationFrame(r));

    expect(tab1.hasAttribute("closable")).toBe(true);
  });

  it("removes closable from children when removed from group", async () => {
    group.setAttribute("closable", "");
    const tab1 = document.createElement("ui-tab-item");
    tab1.setAttribute("label", "Tab 1");
    group.appendChild(tab1);
    await new Promise((r) => requestAnimationFrame(r));

    expect(tab1.hasAttribute("closable")).toBe(true);

    group.removeAttribute("closable");
    await new Promise((r) => requestAnimationFrame(r));

    expect(tab1.hasAttribute("closable")).toBe(false);
  });
});
