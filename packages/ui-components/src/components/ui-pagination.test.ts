import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-pagination.js";
import { UiPagination, type PaginationSize, type PaginationType } from "./ui-pagination.js";
import { STYLES } from "./ui-pagination.styles.js";

describe("ui-pagination", () => {
  let el: UiPagination;

  beforeEach(() => {
    el = document.createElement("ui-pagination") as UiPagination;
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ───────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-pagination")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ──────────────────────────────────────────────────────

  it("renders a .wrapper element", () => {
    expect(el.shadowRoot!.querySelector(".wrapper")).not.toBeNull();
  });

  it("defaults to data-grid type", () => {
    expect(el.shadowRoot!.querySelector(".nav")).not.toBeNull();
    expect(el.shadowRoot!.querySelector(".addon")).not.toBeNull();
  });

  // ── Property accessors ─────────────────────────────────────────────────────

  it("size defaults to m", () => {
    expect(el.size).toBe("m");
  });

  it("size getter/setter works", () => {
    const sizes: PaginationSize[] = ["xs", "s", "m"];
    for (const s of sizes) {
      el.size = s;
      expect(el.size).toBe(s);
      expect(el.getAttribute("size")).toBe(s);
    }
  });

  it("type defaults to data-grid", () => {
    expect(el.type).toBe("data-grid");
  });

  it("type getter/setter works", () => {
    const types: PaginationType[] = ["minimal", "basic", "data-grid"];
    for (const t of types) {
      el.type = t;
      expect(el.type).toBe(t);
      expect(el.getAttribute("type")).toBe(t);
    }
  });

  it("currentPage defaults to 1", () => {
    expect(el.currentPage).toBe(1);
  });

  it("currentPage getter/setter works", () => {
    el.currentPage = 5;
    expect(el.currentPage).toBe(5);
    expect(el.getAttribute("current-page")).toBe("5");
  });

  it("currentPage clamps to minimum 1", () => {
    el.currentPage = -3;
    expect(el.currentPage).toBe(1);
  });

  it("totalPages defaults to 1", () => {
    expect(el.totalPages).toBe(1);
  });

  it("totalPages getter/setter works", () => {
    el.totalPages = 20;
    expect(el.totalPages).toBe(20);
    expect(el.getAttribute("total-pages")).toBe("20");
  });

  it("totalPages clamps to minimum 1", () => {
    el.totalPages = 0;
    expect(el.totalPages).toBe(1);
  });

  it("pageSize defaults to 10", () => {
    expect(el.pageSize).toBe(10);
  });

  it("pageSize getter/setter works", () => {
    el.pageSize = 25;
    expect(el.pageSize).toBe(25);
    expect(el.getAttribute("page-size")).toBe("25");
  });

  it("totalItems defaults to 0", () => {
    expect(el.totalItems).toBe(0);
  });

  it("totalItems getter/setter works", () => {
    el.totalItems = 200;
    expect(el.totalItems).toBe(200);
    expect(el.getAttribute("total-items")).toBe("200");
  });

  it("pageSizeOptions defaults to [10, 25, 50, 100]", () => {
    expect(el.pageSizeOptions).toEqual([10, 25, 50, 100]);
  });

  it("pageSizeOptions getter/setter works", () => {
    el.pageSizeOptions = [5, 10, 20];
    expect(el.pageSizeOptions).toEqual([5, 10, 20]);
    expect(el.getAttribute("page-size-options")).toBe("5,10,20");
  });

  // ── Attributes ─────────────────────────────────────────────────────────────

  it("reflects size attribute", () => {
    el.setAttribute("size", "s");
    expect(el.size).toBe("s");
  });

  it("reflects type attribute", () => {
    el.setAttribute("type", "minimal");
    expect(el.type).toBe("minimal");
  });

  it("reflects current-page attribute", () => {
    el.setAttribute("current-page", "3");
    expect(el.currentPage).toBe(3);
  });

  it("reflects total-pages attribute", () => {
    el.setAttribute("total-pages", "10");
    expect(el.totalPages).toBe(10);
  });

  it("reflects page-size attribute", () => {
    el.setAttribute("page-size", "50");
    expect(el.pageSize).toBe(50);
  });

  it("reflects total-items attribute", () => {
    el.setAttribute("total-items", "500");
    expect(el.totalItems).toBe(500);
  });

  it("reflects page-size-options attribute", () => {
    el.setAttribute("page-size-options", "5,15,30");
    expect(el.pageSizeOptions).toEqual([5, 15, 30]);
  });

  // ── observedAttributes ─────────────────────────────────────────────────────

  it("has correct observedAttributes list", () => {
    const ctor = customElements.get("ui-pagination") as typeof UiPagination;
    expect(ctor.observedAttributes).toEqual([
      "size", "type", "current-page", "total-pages", "page-size", "total-items", "page-size-options",
    ]);
  });

  // ── STYLES ───────────────────────────────────────────────────────────────────

  it("STYLES contains size-specific rules", () => {
    expect(STYLES).toContain(":host([size=\"xs\"])");
    expect(STYLES).toContain(":host([size=\"s\"])");
    expect(STYLES).toContain(":host([size=\"m\"])");
  });

  // ── Data Grid type ──────────────────────────────────────────────────────────

  describe("data-grid type", () => {
    beforeEach(() => {
      el.setAttribute("type", "data-grid");
      el.setAttribute("total-pages", "20");
      el.setAttribute("current-page", "4");
      el.setAttribute("page-size", "10");
      el.setAttribute("total-items", "200");
    });

    it("renders nav and addon sections", () => {
      expect(el.shadowRoot!.querySelector(".nav")).not.toBeNull();
      expect(el.shadowRoot!.querySelector(".addon")).not.toBeNull();
    });

    it("renders First/Prev/Next/Last buttons", () => {
      const btns = el.shadowRoot!.querySelectorAll(".nav-btn");
      expect(btns.length).toBe(4);
      expect(btns[0].textContent).toContain("First");
      expect(btns[1].textContent).toContain("Prev");
      expect(btns[2].textContent).toContain("Next");
      expect(btns[3].textContent).toContain("Last");
    });

    it("renders page number buttons", () => {
      const nav = el.shadowRoot!.querySelector(".nav")!;
      const pageButtons = nav.querySelectorAll("button:not(.nav-btn)");
      expect(pageButtons.length).toBe(5);
    });

    it("shows correct page range for page 4", () => {
      const nav = el.shadowRoot!.querySelector(".nav")!;
      const pageButtons = nav.querySelectorAll("button:not(.nav-btn)");
      const pages = Array.from(pageButtons).map((b) => b.textContent);
      expect(pages).toEqual(["2", "3", "4", "5", "6"]);
    });

    it("marks current page with aria-current", () => {
      const current = el.shadowRoot!.querySelector('[aria-current="page"]');
      expect(current).not.toBeNull();
      expect(current!.textContent).toBe("4");
    });

    it("disables First/Prev on page 1", () => {
      el.setAttribute("current-page", "1");
      const btns = el.shadowRoot!.querySelectorAll(".nav-btn");
      expect((btns[0] as HTMLButtonElement).disabled).toBe(true);
      expect((btns[1] as HTMLButtonElement).disabled).toBe(true);
      expect((btns[2] as HTMLButtonElement).disabled).toBe(false);
      expect((btns[3] as HTMLButtonElement).disabled).toBe(false);
    });

    it("disables Next/Last on last page", () => {
      el.setAttribute("current-page", "20");
      const btns = el.shadowRoot!.querySelectorAll(".nav-btn");
      expect((btns[0] as HTMLButtonElement).disabled).toBe(false);
      expect((btns[1] as HTMLButtonElement).disabled).toBe(false);
      expect((btns[2] as HTMLButtonElement).disabled).toBe(true);
      expect((btns[3] as HTMLButtonElement).disabled).toBe(true);
    });

    it("clicking page number dispatches page-change", () => {
      let detail: { page: number } | null = null;
      el.addEventListener("page-change", ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
      const nav = el.shadowRoot!.querySelector(".nav")!;
      const pageButtons = nav.querySelectorAll("button:not(.nav-btn)");
      (pageButtons[0] as HTMLButtonElement).click(); // page 2
      expect(detail).not.toBeNull();
      expect(detail!.page).toBe(2);
    });

    it("clicking Next increments page", () => {
      let detail: { page: number } | null = null;
      el.addEventListener("page-change", ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
      const btns = el.shadowRoot!.querySelectorAll(".nav-btn");
      (btns[2] as HTMLButtonElement).click(); // Next
      expect(detail!.page).toBe(5);
    });

    it("clicking Prev decrements page", () => {
      let detail: { page: number } | null = null;
      el.addEventListener("page-change", ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
      const btns = el.shadowRoot!.querySelectorAll(".nav-btn");
      (btns[1] as HTMLButtonElement).click(); // Prev
      expect(detail!.page).toBe(3);
    });

    it("clicking First goes to page 1", () => {
      let detail: { page: number } | null = null;
      el.addEventListener("page-change", ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
      const btns = el.shadowRoot!.querySelectorAll(".nav-btn");
      (btns[0] as HTMLButtonElement).click(); // First
      expect(detail!.page).toBe(1);
    });

    it("clicking Last goes to last page", () => {
      let detail: { page: number } | null = null;
      el.addEventListener("page-change", ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
      const btns = el.shadowRoot!.querySelectorAll(".nav-btn");
      (btns[3] as HTMLButtonElement).click(); // Last
      expect(detail!.page).toBe(20);
    });

    it("page range shows 1-5 for page 1", () => {
      el.setAttribute("current-page", "1");
      const nav = el.shadowRoot!.querySelector(".nav")!;
      const pages = Array.from(nav.querySelectorAll("button:not(.nav-btn)")).map((b) => b.textContent);
      expect(pages).toEqual(["1", "2", "3", "4", "5"]);
    });

    it("page range shows 16-20 for page 20", () => {
      el.setAttribute("current-page", "20");
      const nav = el.shadowRoot!.querySelector(".nav")!;
      const pages = Array.from(nav.querySelectorAll("button:not(.nav-btn)")).map((b) => b.textContent);
      expect(pages).toEqual(["16", "17", "18", "19", "20"]);
    });

    it("renders page size select in addon", () => {
      const select = el.shadowRoot!.querySelector(".page-size-select") as HTMLSelectElement;
      expect(select).not.toBeNull();
      expect(select.value).toBe("10");
    });

    it("renders goto input in addon", () => {
      const input = el.shadowRoot!.querySelector(".goto-input") as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(input.value).toBe("4");
    });

    it("goto input changes page on Enter", () => {
      let detail: { page: number } | null = null;
      el.addEventListener("page-change", ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
      const input = el.shadowRoot!.querySelector(".goto-input") as HTMLInputElement;
      input.value = "10";
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(detail!.page).toBe(10);
    });

    it("goto input clamps to valid range", () => {
      let detail: { page: number } | null = null;
      el.addEventListener("page-change", ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
      const input = el.shadowRoot!.querySelector(".goto-input") as HTMLInputElement;
      input.value = "999";
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(detail!.page).toBe(20);
    });

    it("shows all pages when totalPages <= 5", () => {
      el.setAttribute("total-pages", "3");
      el.setAttribute("current-page", "2");
      const nav = el.shadowRoot!.querySelector(".nav")!;
      const pages = Array.from(nav.querySelectorAll("button:not(.nav-btn)")).map((b) => b.textContent);
      expect(pages).toEqual(["1", "2", "3"]);
    });
  });

  // ── Basic type ──────────────────────────────────────────────────────────────

  describe("basic type", () => {
    beforeEach(() => {
      el.setAttribute("type", "basic");
      el.setAttribute("total-pages", "13");
      el.setAttribute("current-page", "1");
      el.setAttribute("page-size", "10");
      el.setAttribute("total-items", "124");
    });

    it("renders page status with Show/of text", () => {
      const status = el.shadowRoot!.querySelector(".page-status");
      expect(status).not.toBeNull();
      expect(status!.textContent).toContain("Show");
      expect(status!.textContent).toContain("of 124 items");
    });

    it("renders page size select", () => {
      const select = el.shadowRoot!.querySelector(".page-size-select");
      expect(select).not.toBeNull();
    });

    it("renders goto input", () => {
      const input = el.shadowRoot!.querySelector(".goto-input");
      expect(input).not.toBeNull();
    });

    it("renders prev/next nav icons", () => {
      const navIcons = el.shadowRoot!.querySelectorAll(".nav-icon");
      expect(navIcons.length).toBe(2);
    });

    it("does NOT render page number buttons", () => {
      const nav = el.shadowRoot!.querySelector(".nav");
      if (nav) {
        const pageButtons = nav.querySelectorAll("button:not(.nav-btn):not(.nav-icon)");
        expect(pageButtons.length).toBe(0);
      }
    });

    it("does NOT render First/Last buttons", () => {
      const navBtns = el.shadowRoot!.querySelectorAll(".nav-btn");
      expect(navBtns.length).toBe(0);
    });

    it("page size change dispatches events and resets to page 1", () => {
      el.setAttribute("current-page", "5");
      const events: string[] = [];
      el.addEventListener("page-size-change", () => events.push("size"));
      el.addEventListener("page-change", () => events.push("page"));
      const select = el.shadowRoot!.querySelector(".page-size-select") as HTMLSelectElement;
      select.value = "25";
      select.dispatchEvent(new Event("change"));
      expect(events).toContain("size");
      expect(events).toContain("page");
      expect(el.getAttribute("current-page")).toBe("1");
    });
  });

  // ── Minimal type ────────────────────────────────────────────────────────────

  describe("minimal type", () => {
    beforeEach(() => {
      el.setAttribute("type", "minimal");
      el.setAttribute("total-pages", "20");
      el.setAttribute("current-page", "5");
    });

    it("renders prev and next nav icons", () => {
      const navIcons = el.shadowRoot!.querySelectorAll(".nav-icon");
      expect(navIcons.length).toBe(2);
    });

    it("renders goto input", () => {
      const input = el.shadowRoot!.querySelector(".goto-input");
      expect(input).not.toBeNull();
    });

    it("does NOT render page number buttons", () => {
      const wrapper = el.shadowRoot!.querySelector(".wrapper")!;
      const pageButtons = wrapper.querySelectorAll("button:not(.nav-icon)");
      expect(pageButtons.length).toBe(0);
    });

    it("does NOT render page size select", () => {
      expect(el.shadowRoot!.querySelector(".page-size-select")).toBeNull();
    });

    it("does NOT render First/Last buttons", () => {
      expect(el.shadowRoot!.querySelectorAll(".nav-btn").length).toBe(0);
    });

    it("prev disabled on page 1", () => {
      el.setAttribute("current-page", "1");
      const navIcons = el.shadowRoot!.querySelectorAll(".nav-icon");
      expect((navIcons[0] as HTMLButtonElement).disabled).toBe(true);
      expect((navIcons[1] as HTMLButtonElement).disabled).toBe(false);
    });

    it("next disabled on last page", () => {
      el.setAttribute("current-page", "20");
      const navIcons = el.shadowRoot!.querySelectorAll(".nav-icon");
      expect((navIcons[0] as HTMLButtonElement).disabled).toBe(false);
      expect((navIcons[1] as HTMLButtonElement).disabled).toBe(true);
    });
  });

  // ── Events ──────────────────────────────────────────────────────────────────

  describe("events", () => {
    it("page-change event bubbles and is composed", () => {
      el.setAttribute("type", "data-grid");
      el.setAttribute("total-pages", "10");
      el.setAttribute("current-page", "1");
      let composed = false;
      let bubbles = false;
      el.addEventListener("page-change", ((e: CustomEvent) => {
        composed = e.composed;
        bubbles = e.bubbles;
      }) as EventListener);
      const btns = el.shadowRoot!.querySelectorAll(".nav-btn");
      (btns[2] as HTMLButtonElement).click(); // Next
      expect(composed).toBe(true);
      expect(bubbles).toBe(true);
    });

    it("does not dispatch when navigating to same page", () => {
      el.setAttribute("type", "data-grid");
      el.setAttribute("total-pages", "10");
      el.setAttribute("current-page", "1");
      let called = false;
      el.addEventListener("page-change", () => { called = true; });
      const btns = el.shadowRoot!.querySelectorAll(".nav-btn");
      (btns[0] as HTMLButtonElement).click(); // First — already on page 1
      expect(called).toBe(false);
    });
  });

  // ── Sizes ───────────────────────────────────────────────────────────────────

  describe("sizes", () => {
    it("renders at size xs", () => {
      el.setAttribute("size", "xs");
      el.setAttribute("type", "data-grid");
      el.setAttribute("total-pages", "5");
      expect(el.shadowRoot!.querySelector(".nav")).not.toBeNull();
    });

    it("renders at size s", () => {
      el.setAttribute("size", "s");
      el.setAttribute("type", "data-grid");
      el.setAttribute("total-pages", "5");
      expect(el.shadowRoot!.querySelector(".nav")).not.toBeNull();
    });

    it("renders at size m", () => {
      el.setAttribute("size", "m");
      el.setAttribute("type", "data-grid");
      el.setAttribute("total-pages", "5");
      expect(el.shadowRoot!.querySelector(".nav")).not.toBeNull();
    });
  });
});
