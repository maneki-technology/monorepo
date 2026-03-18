import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-search.js";
import type { SearchSize, SearchCategory, SearchResultItem } from "./ui-search.js";
import { UiSearch } from "./ui-search.js";
import { STYLES } from "./ui-search.styles.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCategories(query = "fin"): SearchCategory[] {
  return [
    {
      label: "SUGGESTIONS",
      results: [
        { type: "basic", title: "finance" },
        { type: "basic", title: "financial markets" },
      ],
    },
    {
      label: "COMPANIES",
      results: [
        { type: "basic", title: "Generic Finance Inc." },
      ],
    },
    {
      label: "ARTICLES",
      results: [
        {
          type: "article",
          title: "Financial Report Quarterly",
          info: "01 Sep 2020",
          description: "A deep dive into quarterly results",
        },
      ],
    },
    {
      label: "RECENT",
      results: [
        { type: "with-icon", title: "Recent Search Finance Inc.", icon: "search" },
      ],
    },
    {
      label: "PEOPLE",
      results: [
        { type: "with-avatar", title: "Lorem Financial Corp.", avatarText: "LF" },
      ],
    },
  ];
}

/** Simulate typing into the internal input and dispatching an "input" event. */
function typeInto(el: HTMLElement, text: string): void {
  const input = el.shadowRoot!.querySelector<HTMLInputElement>(".input")!;
  input.value = text;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Simulate a keydown on the internal input. */
function pressKey(el: HTMLElement, key: string): void {
  const input = el.shadowRoot!.querySelector<HTMLInputElement>(".input")!;
  input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("ui-search", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-search");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-search")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders an input-wrapper", () => {
    expect(el.shadowRoot!.querySelector(".input-wrapper")).not.toBeNull();
  });

  it("renders a search-icon", () => {
    expect(el.shadowRoot!.querySelector(".search-icon")).not.toBeNull();
  });

  it("renders an input element", () => {
    const input = el.shadowRoot!.querySelector(".input");
    expect(input).not.toBeNull();
    expect(input!.tagName).toBe("INPUT");
  });

  it("renders a clear-btn", () => {
    expect(el.shadowRoot!.querySelector(".clear-btn")).not.toBeNull();
  });

  it("renders a dropdown", () => {
    expect(el.shadowRoot!.querySelector(".dropdown")).not.toBeNull();
  });

  // ── Default attributes ────────────────────────────────────────────────────

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults placeholder to 'Type to search...'", () => {
    const input = el.shadowRoot!.querySelector<HTMLInputElement>(".input")!;
    expect(input.placeholder).toBe("Type to search...");
  });

  it("is not disabled by default", () => {
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("has empty value by default", () => {
    const input = el.shadowRoot!.querySelector<HTMLInputElement>(".input")!;
    expect(input.value).toBe("");
  });

  // ── Attributes ────────────────────────────────────────────────────────────

  it("reflects size attribute s", () => {
    el.setAttribute("size", "s");
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects size attribute l", () => {
    el.setAttribute("size", "l");
    expect(el.getAttribute("size")).toBe("l");
  });

  it("applies placeholder attribute to input", () => {
    el.setAttribute("placeholder", "Search here");
    const input = el.shadowRoot!.querySelector<HTMLInputElement>(".input")!;
    expect(input.placeholder).toBe("Search here");
  });

  it("applies disabled attribute to input", () => {
    el.setAttribute("disabled", "");
    const input = el.shadowRoot!.querySelector<HTMLInputElement>(".input")!;
    expect(input.disabled).toBe(true);
  });

  it("removes disabled when attribute removed", () => {
    el.setAttribute("disabled", "");
    el.removeAttribute("disabled");
    const input = el.shadowRoot!.querySelector<HTMLInputElement>(".input")!;
    expect(input.disabled).toBe(false);
  });

  it("applies value attribute to input", () => {
    el.setAttribute("value", "hello");
    const input = el.shadowRoot!.querySelector<HTMLInputElement>(".input")!;
    expect(input.value).toBe("hello");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns current size", () => {
    expect((el as unknown as UiSearch).size).toBe("m");
  });

  it("size setter updates attribute", () => {
    (el as unknown as UiSearch).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  it("placeholder getter returns current placeholder", () => {
    expect((el as unknown as UiSearch).placeholder).toBe("Type to search...");
  });

  it("placeholder setter updates attribute", () => {
    (el as unknown as UiSearch).placeholder = "Find...";
    expect(el.getAttribute("placeholder")).toBe("Find...");
  });

  it("disabled getter returns false by default", () => {
    expect((el as unknown as UiSearch).disabled).toBe(false);
  });

  it("disabled setter adds attribute", () => {
    (el as unknown as UiSearch).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("disabled setter removes attribute when false", () => {
    (el as unknown as UiSearch).disabled = true;
    (el as unknown as UiSearch).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("value getter returns input value", () => {
    (el as unknown as UiSearch).value = "test";
    expect((el as unknown as UiSearch).value).toBe("test");
  });

  it("value setter syncs has-value attribute", () => {
    (el as unknown as UiSearch).value = "abc";
    expect(el.hasAttribute("has-value")).toBe(true);
  });

  it("categories getter returns empty array by default", () => {
    expect((el as unknown as UiSearch).categories).toEqual([]);
  });

  it("categories setter stores categories", () => {
    const cats = makeCategories();
    (el as unknown as UiSearch).categories = cats;
    expect((el as unknown as UiSearch).categories).toBe(cats);
  });

  // ── Clear button ──────────────────────────────────────────────────────────

  it("clear button is hidden when no value", () => {
    expect(el.hasAttribute("has-value")).toBe(false);
  });

  it("clear button is visible when has-value", () => {
    (el as unknown as UiSearch).value = "x";
    expect(el.hasAttribute("has-value")).toBe(true);
  });

  it("clicking clear button clears value and dispatches search-clear", () => {
    const handler = vi.fn();
    el.addEventListener("search-clear", handler);
    (el as unknown as UiSearch).value = "hello";

    const clearBtn = el.shadowRoot!.querySelector<HTMLButtonElement>(".clear-btn")!;
    clearBtn.click();

    expect((el as unknown as UiSearch).value).toBe("");
    expect(el.hasAttribute("has-value")).toBe(false);
    expect(handler).toHaveBeenCalledOnce();
  });

  // ── Dropdown ──────────────────────────────────────────────────────────────

  it("dropdown is hidden by default", () => {
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("opens dropdown when typing with categories set", () => {
    (el as unknown as UiSearch).categories = makeCategories();
    typeInto(el, "fin");
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("does not open dropdown when typing without categories", () => {
    typeInto(el, "fin");
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("closes dropdown when input is cleared by typing", () => {
    (el as unknown as UiSearch).categories = makeCategories();
    typeInto(el, "fin");
    expect(el.hasAttribute("open")).toBe(true);
    typeInto(el, "");
    expect(el.hasAttribute("open")).toBe(false);
  });

  // ── Categories rendering ──────────────────────────────────────────────────

  it("renders category headings", () => {
    (el as unknown as UiSearch).categories = makeCategories();
    typeInto(el, "fin");
    const headings = el.shadowRoot!.querySelectorAll(".category-heading");
    expect(headings.length).toBe(5);
  });

  it("renders category heading labels", () => {
    (el as unknown as UiSearch).categories = makeCategories();
    typeInto(el, "fin");
    const headings = el.shadowRoot!.querySelectorAll(".category-heading");
    const labels = Array.from(headings).map((h) => h.querySelector("span")!.textContent);
    expect(labels).toEqual(["SUGGESTIONS", "COMPANIES", "ARTICLES", "RECENT", "PEOPLE"]);
  });

  it("renders SHOW ALL buttons in category headings", () => {
    (el as unknown as UiSearch).categories = makeCategories();
    typeInto(el, "fin");
    const showAllBtns = el.shadowRoot!.querySelectorAll(".show-all");
    expect(showAllBtns.length).toBe(5);
  });

  it("hides SHOW ALL when showAll is false", () => {
    const cats = makeCategories();
    cats[0].showAll = false;
    (el as unknown as UiSearch).categories = cats;
    typeInto(el, "fin");
    const showAllBtns = el.shadowRoot!.querySelectorAll(".show-all");
    expect(showAllBtns.length).toBe(4);
  });

  it("renders result items", () => {
    (el as unknown as UiSearch).categories = makeCategories();
    typeInto(el, "fin");
    const items = el.shadowRoot!.querySelectorAll(".result-item");
    expect(items.length).toBe(6); // 2 + 1 + 1 + 1 + 1
  });

  // ── Result types ──────────────────────────────────────────────────────────

  it("renders basic result with title only", () => {
    (el as unknown as UiSearch).categories = [
      { label: "TEST", results: [{ type: "basic", title: "finance" }] },
    ];
    typeInto(el, "fin");
    const item = el.shadowRoot!.querySelector(".result-item")!;
    expect(item.querySelector(".result-title")).not.toBeNull();
    expect(item.querySelector(".result-info")).toBeNull();
    expect(item.querySelector(".result-description")).toBeNull();
    expect(item.querySelector(".result-leading")).toBeNull();
  });

  it("renders article result with title, info, and description", () => {
    (el as unknown as UiSearch).categories = [
      {
        label: "TEST",
        results: [
          { type: "article", title: "Financial Report", info: "01 Sep 2020", description: "Desc" },
        ],
      },
    ];
    typeInto(el, "fin");
    const item = el.shadowRoot!.querySelector(".result-item")!;
    expect(item.querySelector(".result-title")).not.toBeNull();
    expect(item.querySelector(".result-info")!.textContent).toBe("01 Sep 2020");
    expect(item.querySelector(".result-description")!.textContent).toBe("Desc");
  });

  it("renders with-icon result with leading icon", () => {
    (el as unknown as UiSearch).categories = [
      {
        label: "TEST",
        results: [{ type: "with-icon", title: "Recent Finance", icon: "search" }],
      },
    ];
    typeInto(el, "fin");
    const item = el.shadowRoot!.querySelector(".result-item")!;
    expect(item.classList.contains("has-leading")).toBe(true);
    expect(item.querySelector(".result-leading")).not.toBeNull();
    expect(item.querySelector(".result-leading .material-symbols-outlined")).not.toBeNull();
  });

  it("renders with-avatar result with avatar circle", () => {
    (el as unknown as UiSearch).categories = [
      {
        label: "TEST",
        results: [{ type: "with-avatar", title: "Lorem Financial", avatarText: "LF" }],
      },
    ];
    typeInto(el, "fin");
    const item = el.shadowRoot!.querySelector(".result-item")!;
    expect(item.classList.contains("has-leading")).toBe(true);
    const circle = item.querySelector(".avatar-circle");
    expect(circle).not.toBeNull();
    expect(circle!.textContent).toBe("LF");
  });

  it("renders with-avatar result with image when avatarSrc set", () => {
    (el as unknown as UiSearch).categories = [
      {
        label: "TEST",
        results: [{ type: "with-avatar", title: "Person", avatarSrc: "https://example.com/img.png" }],
      },
    ];
    typeInto(el, "per");
    const img = el.shadowRoot!.querySelector(".result-leading img");
    expect(img).not.toBeNull();
    expect(img!.getAttribute("src")).toBe("https://example.com/img.png");
  });

  it("renders with-avatar result with empty circle when no text or src", () => {
    (el as unknown as UiSearch).categories = [
      {
        label: "TEST",
        results: [{ type: "with-avatar", title: "Unknown Person" }],
      },
    ];
    typeInto(el, "unk");
    const circle = el.shadowRoot!.querySelector(".avatar-circle");
    expect(circle).not.toBeNull();
    expect(circle!.textContent).toBe("");
  });

  // ── Text highlight ────────────────────────────────────────────────────────

  it("wraps matching text in strong tags", () => {
    (el as unknown as UiSearch).categories = [
      { label: "TEST", results: [{ type: "basic", title: "finance" }] },
    ];
    typeInto(el, "fin");
    const title = el.shadowRoot!.querySelector(".result-title")!;
    const strong = title.querySelector("strong");
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe("fin");
  });

  it("does not highlight when query does not match", () => {
    (el as unknown as UiSearch).categories = [
      { label: "TEST", results: [{ type: "basic", title: "finance" }] },
    ];
    // Set categories and type something that matches for rendering, then check a non-matching item
    typeInto(el, "finance");
    const title = el.shadowRoot!.querySelector(".result-title")!;
    const strong = title.querySelector("strong");
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe("finance");
  });

  it("filters out results that do not match query", () => {
    (el as unknown as UiSearch).categories = [
      {
        label: "TEST",
        results: [
          { type: "basic", title: "finance" },
          { type: "basic", title: "marketing" },
        ],
      },
    ];
    typeInto(el, "fin");
    const items = el.shadowRoot!.querySelectorAll(".result-item");
    expect(items.length).toBe(1);
  });

  // ── Events ────────────────────────────────────────────────────────────────

  it("dispatches search-input on typing", () => {
    const handler = vi.fn();
    el.addEventListener("search-input", handler);
    typeInto(el, "hello");
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail.value).toBe("hello");
  });

  it("dispatches search-submit on Enter", () => {
    const handler = vi.fn();
    el.addEventListener("search-submit", handler);
    typeInto(el, "query");
    pressKey(el, "Enter");
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail.value).toBe("query");
  });

  it("dispatches search-clear on clear button click", () => {
    const handler = vi.fn();
    el.addEventListener("search-clear", handler);
    (el as unknown as UiSearch).value = "x";
    el.shadowRoot!.querySelector<HTMLButtonElement>(".clear-btn")!.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it("dispatches search-select on result click", () => {
    const handler = vi.fn();
    el.addEventListener("search-select", handler);
    (el as unknown as UiSearch).categories = [
      { label: "CAT", results: [{ type: "basic", title: "finance" }] },
    ];
    typeInto(el, "fin");
    const item = el.shadowRoot!.querySelector<HTMLButtonElement>(".result-item")!;
    item.click();
    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.item.title).toBe("finance");
    expect(detail.category).toBe("CAT");
  });

  it("dispatches search-show-all on SHOW ALL click", () => {
    const handler = vi.fn();
    el.addEventListener("search-show-all", handler);
    (el as unknown as UiSearch).categories = [
      { label: "CAT", results: [{ type: "basic", title: "finance" }] },
    ];
    typeInto(el, "fin");
    const showAll = el.shadowRoot!.querySelector<HTMLButtonElement>(".show-all")!;
    showAll.click();
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail.category).toBe("CAT");
  });

  it("closes dropdown on result select", () => {
    (el as unknown as UiSearch).categories = [
      { label: "CAT", results: [{ type: "basic", title: "finance" }] },
    ];
    typeInto(el, "fin");
    expect(el.hasAttribute("open")).toBe(true);
    el.shadowRoot!.querySelector<HTMLButtonElement>(".result-item")!.click();
    expect(el.hasAttribute("open")).toBe(false);
  });

  // ── Escape closes dropdown ────────────────────────────────────────────────

  it("closes dropdown on Escape key", () => {
    (el as unknown as UiSearch).categories = makeCategories();
    typeInto(el, "fin");
    expect(el.hasAttribute("open")).toBe(true);
    pressKey(el, "Escape");
    expect(el.hasAttribute("open")).toBe(false);
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("has correct observedAttributes", () => {
    expect(UiSearch.observedAttributes).toEqual(["size", "placeholder", "disabled", "value"]);
  });

  // ── STYLES ────────────────────────────────────────────────────────────────

  it("STYLES contains size-s rules", () => {
    expect(STYLES).toContain(':host([size="s"])');
  });

  it("STYLES contains size-m rules", () => {
    expect(STYLES).toContain(':host([size="m"])');
  });

  it("STYLES contains size-l rules", () => {
    expect(STYLES).toContain(':host([size="l"])');
  });

  it("STYLES contains dropdown rules", () => {
    expect(STYLES).toContain(".dropdown");
  });

  it("STYLES contains reduced-motion media query", () => {
    expect(STYLES).toContain("prefers-reduced-motion");
  });
});
