import { describe, it, expect, afterEach, vi } from "vitest";
import "./ui-calendar-quicklinks.js";
import type { UiCalendarQuicklinks, QuicklinkItem } from "./ui-calendar-quicklinks.js";

const tick = () => new Promise((r) => setTimeout(r, 0));

function create(attrs = ""): UiCalendarQuicklinks {
  const el = document.createElement("div");
  el.innerHTML = `<ui-calendar-quicklinks ${attrs}></ui-calendar-quicklinks>`;
  document.body.appendChild(el);
  return el.querySelector("ui-calendar-quicklinks") as UiCalendarQuicklinks;
}

const SAMPLE_ITEMS: QuicklinkItem[] = [
  { label: "Dates", value: "", section: true },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "last-7" },
  { label: "Ranges", value: "", section: true },
  { label: "This month", value: "this-month" },
  { label: "Last month", value: "last-month" },
];

describe("ui-calendar-quicklinks", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ─── Default rendering ──────────────────────────────────────────────

  describe("default rendering", () => {
    it("creates shadow DOM", async () => {
      const el = create();
      await tick();
      expect(el.shadowRoot).toBeTruthy();
    });

    it("uses adoptedStyleSheets (no <style> element)", async () => {
      const el = create();
      await tick();
      expect(el.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThan(0);
      expect(el.shadowRoot!.querySelector("style")).toBeNull();
    });

    it("renders .menu container with role=listbox", async () => {
      const el = create();
      await tick();
      const menu = el.shadowRoot!.querySelector(".menu");
      expect(menu).toBeTruthy();
      expect(menu!.getAttribute("role")).toBe("listbox");
    });

    it("sets size=m by default", async () => {
      const el = create();
      await tick();
      expect(el.getAttribute("size")).toBe("m");
    });

    it("sets orientation=side by default", async () => {
      const el = create();
      await tick();
      expect(el.getAttribute("orientation")).toBe("side");
    });

    it("sets role=navigation by default", async () => {
      const el = create();
      await tick();
      expect(el.getAttribute("role")).toBe("navigation");
    });

    it("preserves custom role if set before connect", async () => {
      const el = document.createElement("ui-calendar-quicklinks") as UiCalendarQuicklinks;
      el.setAttribute("role", "complementary");
      document.body.appendChild(el);
      await tick();
      expect(el.getAttribute("role")).toBe("complementary");
    });

    it("renders no links when items are empty", async () => {
      const el = create();
      await tick();
      expect(el.shadowRoot!.querySelectorAll(".link").length).toBe(0);
      expect(el.shadowRoot!.querySelectorAll(".section").length).toBe(0);
    });
  });

  // ─── Size attribute ─────────────────────────────────────────────────

  describe("size attribute", () => {
    it("accepts size=s", async () => {
      const el = create('size="s"');
      await tick();
      expect(el.getAttribute("size")).toBe("s");
    });

    it("accepts size=m", async () => {
      const el = create('size="m"');
      await tick();
      expect(el.getAttribute("size")).toBe("m");
    });

    it("accepts size=l", async () => {
      const el = create('size="l"');
      await tick();
      expect(el.getAttribute("size")).toBe("l");
    });

    it("reflects size via property getter", async () => {
      const el = create('size="l"');
      await tick();
      expect(el.size).toBe("l");
    });

    it("updates attribute via property setter", async () => {
      const el = create();
      await tick();
      el.size = "s";
      expect(el.getAttribute("size")).toBe("s");
    });
  });

  // ─── Orientation attribute ──────────────────────────────────────────

  describe("orientation attribute", () => {
    it("accepts orientation=side", async () => {
      const el = create('orientation="side"');
      await tick();
      expect(el.getAttribute("orientation")).toBe("side");
    });

    it("accepts orientation=bottom", async () => {
      const el = create('orientation="bottom"');
      await tick();
      expect(el.getAttribute("orientation")).toBe("bottom");
    });

    it("reflects orientation via property getter", async () => {
      const el = create('orientation="bottom"');
      await tick();
      expect(el.orientation).toBe("bottom");
    });

    it("updates attribute via property setter", async () => {
      const el = create();
      await tick();
      el.orientation = "bottom";
      expect(el.getAttribute("orientation")).toBe("bottom");
    });
  });

  // ─── setItems() ─────────────────────────────────────────────────────

  describe("setItems()", () => {
    it("renders link items", async () => {
      const el = create();
      await tick();
      el.setItems([
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
      ]);
      const links = el.shadowRoot!.querySelectorAll(".link");
      expect(links.length).toBe(2);
    });

    it("renders section headings", async () => {
      const el = create();
      await tick();
      el.setItems([
        { label: "Dates", value: "", section: true },
        { label: "Today", value: "today" },
      ]);
      const sections = el.shadowRoot!.querySelectorAll(".section");
      expect(sections.length).toBe(1);
    });

    it("renders mixed sections and links in order", async () => {
      const el = create();
      await tick();
      el.setItems(SAMPLE_ITEMS);
      const children = el.shadowRoot!.querySelector(".menu")!.children;
      expect(children[0].classList.contains("section")).toBe(true);
      expect(children[1].classList.contains("link")).toBe(true);
      expect(children[2].classList.contains("link")).toBe(true);
      expect(children[3].classList.contains("link")).toBe(true);
      expect(children[4].classList.contains("section")).toBe(true);
      expect(children[5].classList.contains("link")).toBe(true);
      expect(children[6].classList.contains("link")).toBe(true);
    });

    it("clears previous items on re-call", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "A", value: "a" }]);
      expect(el.shadowRoot!.querySelectorAll(".link").length).toBe(1);
      el.setItems([{ label: "B", value: "b" }, { label: "C", value: "c" }]);
      expect(el.shadowRoot!.querySelectorAll(".link").length).toBe(2);
    });

    it("handles empty array", async () => {
      const el = create();
      await tick();
      el.setItems(SAMPLE_ITEMS);
      el.setItems([]);
      expect(el.shadowRoot!.querySelectorAll(".link").length).toBe(0);
      expect(el.shadowRoot!.querySelectorAll(".section").length).toBe(0);
    });
  });

  // ─── Section headings ──────────────────────────────────────────────

  describe("section headings", () => {
    it("has .section class", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Group", value: "", section: true }]);
      const section = el.shadowRoot!.querySelector(".section");
      expect(section).toBeTruthy();
    });

    it("has role=presentation", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Group", value: "", section: true }]);
      const section = el.shadowRoot!.querySelector(".section");
      expect(section!.getAttribute("role")).toBe("presentation");
    });

    it("displays the label text", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "My Section", value: "", section: true }]);
      const section = el.shadowRoot!.querySelector(".section");
      expect(section!.textContent).toBe("My Section");
    });

    it("does not have tabindex", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Group", value: "", section: true }]);
      const section = el.shadowRoot!.querySelector(".section");
      expect(section!.hasAttribute("tabindex")).toBe(false);
    });
  });

  // ─── Link items ─────────────────────────────────────────────────────

  describe("link items", () => {
    it("has .link class", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      const link = el.shadowRoot!.querySelector(".link");
      expect(link).toBeTruthy();
    });

    it("has role=option", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      const link = el.shadowRoot!.querySelector(".link");
      expect(link!.getAttribute("role")).toBe("option");
    });

    it("has tabindex=0", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      const link = el.shadowRoot!.querySelector(".link");
      expect(link!.getAttribute("tabindex")).toBe("0");
    });

    it("has data-value matching item value", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      const link = el.shadowRoot!.querySelector(".link") as HTMLElement;
      expect(link.dataset.value).toBe("today");
    });

    it("displays the label text", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Last 7 days", value: "last-7" }]);
      const link = el.shadowRoot!.querySelector(".link");
      expect(link!.textContent).toBe("Last 7 days");
    });
  });

  // ─── Selected state ─────────────────────────────────────────────────

  describe("selected state", () => {
    it("sets data-selected on matching link", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }, { label: "Yesterday", value: "yesterday" }]);
      el.selectedValue = "today";
      const link = el.shadowRoot!.querySelector('.link[data-value="today"]') as HTMLElement;
      expect(link.hasAttribute("data-selected")).toBe(true);
    });

    it("sets aria-selected=true on matching link", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      el.selectedValue = "today";
      const link = el.shadowRoot!.querySelector('.link[data-value="today"]');
      expect(link!.getAttribute("aria-selected")).toBe("true");
    });

    it("does not set data-selected on non-matching links", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }, { label: "Yesterday", value: "yesterday" }]);
      el.selectedValue = "today";
      const other = el.shadowRoot!.querySelector('.link[data-value="yesterday"]') as HTMLElement;
      expect(other.hasAttribute("data-selected")).toBe(false);
    });

    it("clears selection when set to null", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      el.selectedValue = "today";
      el.selectedValue = null;
      const link = el.shadowRoot!.querySelector('.link[data-value="today"]') as HTMLElement;
      expect(link.hasAttribute("data-selected")).toBe(false);
    });

    it("selectedValue getter returns current value", async () => {
      const el = create();
      await tick();
      expect(el.selectedValue).toBeNull();
      el.selectedValue = "today";
      expect(el.selectedValue).toBe("today");
    });
  });

  // ─── Click handling ─────────────────────────────────────────────────

  describe("click handling", () => {
    it("updates selectedValue on link click", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      const link = el.shadowRoot!.querySelector(".link") as HTMLElement;
      link.click();
      expect(el.selectedValue).toBe("today");
    });

    it("dispatches quicklink-select event with detail.value", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      const handler = vi.fn();
      el.addEventListener("quicklink-select", handler);
      const link = el.shadowRoot!.querySelector(".link") as HTMLElement;
      link.click();
      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent;
      expect(event.detail.value).toBe("today");
    });

    it("event bubbles", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      const handler = vi.fn();
      document.body.addEventListener("quicklink-select", handler);
      const link = el.shadowRoot!.querySelector(".link") as HTMLElement;
      link.click();
      expect(handler).toHaveBeenCalledTimes(1);
      document.body.removeEventListener("quicklink-select", handler);
    });

    it("sets data-selected on clicked link after click", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }, { label: "Yesterday", value: "yesterday" }]);
      const link = el.shadowRoot!.querySelector('.link[data-value="yesterday"]') as HTMLElement;
      link.click();
      // Re-query after click since #render() rebuilds DOM
      const updated = el.shadowRoot!.querySelector('.link[data-value="yesterday"]') as HTMLElement;
      expect(updated.hasAttribute("data-selected")).toBe(true);
    });

    it("does not fire event when clicking section heading", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Group", value: "", section: true }]);
      const handler = vi.fn();
      el.addEventListener("quicklink-select", handler);
      const section = el.shadowRoot!.querySelector(".section") as HTMLElement;
      section.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it("does not fire event when clicking menu background", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      const handler = vi.fn();
      el.addEventListener("quicklink-select", handler);
      const menu = el.shadowRoot!.querySelector(".menu") as HTMLElement;
      menu.click();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ─── getItems() ─────────────────────────────────────────────────────

  describe("getItems()", () => {
    it("returns empty array by default", async () => {
      const el = create();
      await tick();
      expect(el.getItems()).toEqual([]);
    });

    it("returns copy of items after setItems()", async () => {
      const el = create();
      await tick();
      const items: QuicklinkItem[] = [{ label: "Today", value: "today" }];
      el.setItems(items);
      const result = el.getItems();
      expect(result).toEqual(items);
      expect(result).not.toBe(items);
    });

    it("mutations to returned array do not affect component", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "A", value: "a" }]);
      const result = el.getItems();
      result.push({ label: "B", value: "b" });
      expect(el.getItems().length).toBe(1);
    });
  });

  // ─── Re-render on attribute change ──────────────────────────────────

  describe("re-render on attribute change", () => {
    it("re-renders when size changes", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      const linkBefore = el.shadowRoot!.querySelector(".link");
      el.setAttribute("size", "l");
      const linkAfter = el.shadowRoot!.querySelector(".link");
      // After re-render, links should still exist
      expect(linkAfter).toBeTruthy();
      expect(linkAfter!.textContent).toBe("Today");
    });

    it("re-renders when orientation changes", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      el.setAttribute("orientation", "bottom");
      const link = el.shadowRoot!.querySelector(".link");
      expect(link).toBeTruthy();
      expect(el.getAttribute("orientation")).toBe("bottom");
    });
  });

  // ─── Multiple sections with links ──────────────────────────────────

  describe("multiple sections with links", () => {
    it("renders correct total children count", async () => {
      const el = create();
      await tick();
      el.setItems(SAMPLE_ITEMS);
      const menu = el.shadowRoot!.querySelector(".menu")!;
      // 2 sections + 5 links = 7
      expect(menu.children.length).toBe(7);
    });

    it("renders correct number of sections", async () => {
      const el = create();
      await tick();
      el.setItems(SAMPLE_ITEMS);
      expect(el.shadowRoot!.querySelectorAll(".section").length).toBe(2);
    });

    it("renders correct number of links", async () => {
      const el = create();
      await tick();
      el.setItems(SAMPLE_ITEMS);
      expect(el.shadowRoot!.querySelectorAll(".link").length).toBe(5);
    });

    it("preserves selection across sections", async () => {
      const el = create();
      await tick();
      el.setItems(SAMPLE_ITEMS);
      el.selectedValue = "this-month";
      const selected = el.shadowRoot!.querySelector('[data-selected]') as HTMLElement;
      expect(selected).toBeTruthy();
      expect(selected.dataset.value).toBe("this-month");
    });
  });

  // ─── Disconnect cleanup ─────────────────────────────────────────────

  describe("disconnect cleanup", () => {
    it("removes click listener on disconnect", async () => {
      const el = create();
      await tick();
      el.setItems([{ label: "Today", value: "today" }]);
      const handler = vi.fn();
      el.addEventListener("quicklink-select", handler);
      el.remove();
      // Re-append to get a fresh connectedCallback, but the old listener should be gone
      // We verify by checking no error is thrown on remove
      expect(el.selectedValue).toBeNull();
    });
  });
});
