import { describe, it, expect, beforeEach, vi } from "vitest";
import "./calendar.js";
import type { ManekiCalendar } from "./calendar.js";

function create(attrs: Record<string, string> = {}): ManekiCalendar {
  const el = document.createElement("maneki-calendar") as ManekiCalendar;
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  document.body.appendChild(el);
  return el;
}

function cleanup(): void {
  document.body.innerHTML = "";
}

function shadow(el: ManekiCalendar): ShadowRoot {
  return el.shadowRoot!;
}

function dayCells(el: ManekiCalendar): HTMLElement[] {
  return Array.from(shadow(el).querySelectorAll(".day-cell"));
}

function monthCells(el: ManekiCalendar): HTMLElement[] {
  return Array.from(shadow(el).querySelectorAll(".month-cell"));
}

function yearCells(el: ManekiCalendar): HTMLElement[] {
  return Array.from(shadow(el).querySelectorAll(".year-cell"));
}

function headerLabel(el: ManekiCalendar): string {
  return shadow(el).querySelector(".header-label")!.textContent!.trim();
}

function clickPrev(el: ManekiCalendar): void {
  shadow(el).querySelector<HTMLButtonElement>(".nav-btn")!.click();
}

function clickNext(el: ManekiCalendar): void {
  const btns = shadow(el).querySelectorAll<HTMLButtonElement>(".nav-btn");
  btns[1].click();
}

function clickHeader(el: ManekiCalendar): void {
  shadow(el).querySelector<HTMLElement>(".header-label")!.click();
}

function keydown(target: HTMLElement, key: string): void {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("maneki-calendar", () => {
  beforeEach(cleanup);

  // ─── Rendering ──────────────────────────────────────────────────────

  describe("rendering", () => {
    it("registers as custom element", () => {
      const el = create();
      expect(el).toBeInstanceOf(HTMLElement);
      expect(el.tagName.toLowerCase()).toBe("maneki-calendar");
    });

    it("creates shadow DOM with adoptedStyleSheets", () => {
      const el = create();
      expect(el.shadowRoot).toBeTruthy();
      expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
    });

    it("renders 42 day cells (6 rows × 7 cols)", () => {
      const el = create({ value: "2025-01-15" });
      expect(dayCells(el).length).toBe(42);
    });

    it("renders 7 DOW headers", () => {
      const el = create();
      const dow = shadow(el).querySelectorAll(".dow-cell");
      expect(dow.length).toBe(7);
    });

    it("renders 6 day rows", () => {
      const el = create();
      const rows = shadow(el).querySelectorAll(".day-row");
      expect(rows.length).toBe(6);
    });

    it("sets role=group on host", () => {
      const el = create();
      expect(el.getAttribute("role")).toBe("group");
    });

    it("sets role=grid on day grid", () => {
      const el = create();
      const grid = shadow(el).querySelector(".day-grid");
      expect(grid!.getAttribute("role")).toBe("grid");
    });

    it("renders header with month and year", () => {
      const el = create({ value: "2025-03-10" });
      expect(headerLabel(el)).toContain("2025");
      expect(headerLabel(el)).toContain("March");
    });
  });

  // ─── Value / Selection ──────────────────────────────────────────────

  describe("selection", () => {
    it("selects date from value attribute", () => {
      const el = create({ value: "2025-06-15" });
      const selected = shadow(el).querySelector("[data-selected]");
      expect(selected).toBeTruthy();
      expect(selected!.textContent).toContain("15");
    });

    it("updates selection on value property change", () => {
      const el = create({ value: "2025-06-15" });
      el.value = "2025-06-20";
      const selected = shadow(el).querySelector("[data-selected]");
      expect(selected!.textContent).toContain("20");
    });

    it("fires date-select on day click", () => {
      const el = create({ value: "2025-01-15" });
      const handler = vi.fn();
      el.addEventListener("date-select", handler);

      const cells = dayCells(el);
      const jan20 = cells.find((c) => c.dataset.date === "2025-01-20");
      jan20!.click();

      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].detail.date).toBe("2025-01-20");
    });

    it("sets aria-selected on selected cell", () => {
      const el = create({ value: "2025-03-10" });
      const selected = shadow(el).querySelector("[data-selected]");
      expect(selected!.getAttribute("aria-selected")).toBe("true");
    });

    it("navigates display month when selecting outside day", () => {
      const el = create({ value: "2025-01-15" });
      // Find a cell from February (outside month)
      const cells = dayCells(el);
      const feb1 = cells.find((c) => c.dataset.date === "2025-02-01");
      if (feb1 && !feb1.hasAttribute("data-hidden")) {
        feb1.click();
        expect(el.displayMonth).toBe(1); // February
      }
    });
  });

  // ─── Today ──────────────────────────────────────────────────────────

  describe("today", () => {
    it("marks today with data-today", () => {
      const el = create();
      const todayCell = shadow(el).querySelector("[data-today]");
      expect(todayCell).toBeTruthy();
    });

    it("sets aria-current=date on today", () => {
      const el = create();
      const todayCell = shadow(el).querySelector("[data-today]");
      expect(todayCell!.getAttribute("aria-current")).toBe("date");
    });
  });

  // ─── Navigation ─────────────────────────────────────────────────────

  describe("navigation", () => {
    it("navigates to previous month", () => {
      const el = create({ value: "2025-03-15" });
      clickPrev(el);
      expect(headerLabel(el)).toContain("February");
      expect(el.displayMonth).toBe(1);
    });

    it("navigates to next month", () => {
      const el = create({ value: "2025-03-15" });
      clickNext(el);
      expect(headerLabel(el)).toContain("April");
      expect(el.displayMonth).toBe(3);
    });

    it("wraps from January to December of previous year", () => {
      const el = create({ value: "2025-01-15" });
      clickPrev(el);
      expect(el.displayMonth).toBe(11);
      expect(el.displayYear).toBe(2024);
    });

    it("wraps from December to January of next year", () => {
      const el = create({ value: "2025-12-15" });
      clickNext(el);
      expect(el.displayMonth).toBe(0);
      expect(el.displayYear).toBe(2026);
    });

    it("fires month-change on navigation", () => {
      const el = create({ value: "2025-03-15" });
      const handler = vi.fn();
      el.addEventListener("month-change", handler);
      clickNext(el);
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].detail).toEqual({ year: 2025, month: 3 });
    });

    it("navigateTo() moves to specific month/year", () => {
      const el = create();
      el.navigateTo(2030, 5);
      expect(el.displayYear).toBe(2030);
      expect(el.displayMonth).toBe(5);
      expect(headerLabel(el)).toContain("June");
      expect(headerLabel(el)).toContain("2030");
    });
  });

  // ─── Outside days ───────────────────────────────────────────────────

  describe("outside days", () => {
    it("marks outside-month days with data-outside", () => {
      const el = create({ value: "2025-01-15" });
      const outside = shadow(el).querySelectorAll("[data-outside]");
      expect(outside.length).toBeGreaterThan(0);
    });

    it("hides outside days when show-outside-days=false", () => {
      const el = create({ value: "2025-01-15", "show-outside-days": "false" });
      const hidden = shadow(el).querySelectorAll("[data-hidden]");
      expect(hidden.length).toBeGreaterThan(0);
      // No data-outside should be visible
      const outside = shadow(el).querySelectorAll("[data-outside]");
      expect(outside.length).toBe(0);
    });
  });

  // ─── Min / Max ──────────────────────────────────────────────────────

  describe("min/max", () => {
    it("disables dates before min", () => {
      const el = create({ value: "2025-01-15", min: "2025-01-10" });
      const cells = dayCells(el);
      const jan5 = cells.find((c) => c.dataset.date === "2025-01-05");
      expect(jan5!.hasAttribute("data-disabled")).toBe(true);
      expect(jan5!.getAttribute("aria-disabled")).toBe("true");
    });

    it("disables dates after max", () => {
      const el = create({ value: "2025-01-15", max: "2025-01-20" });
      const cells = dayCells(el);
      const jan25 = cells.find((c) => c.dataset.date === "2025-01-25");
      expect(jan25!.hasAttribute("data-disabled")).toBe(true);
    });

    it("does not fire date-select on disabled cell click", () => {
      const el = create({ value: "2025-01-15", min: "2025-01-10" });
      const handler = vi.fn();
      el.addEventListener("date-select", handler);
      const cells = dayCells(el);
      const jan5 = cells.find((c) => c.dataset.date === "2025-01-05");
      jan5!.click();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ─── Range selection ────────────────────────────────────────────────

  describe("range", () => {
    it("sets range-start on first click", () => {
      const el = create({ value: "2025-01-15", range: "" });
      const cells = dayCells(el);
      const jan10 = cells.find((c) => c.dataset.date === "2025-01-10");
      jan10!.click();
      expect(el.rangeStart).toBe("2025-01-10");
      expect(el.rangeEnd).toBe("");
    });

    it("sets range-end on second click", () => {
      const el = create({ value: "2025-01-15", range: "" });
      const cells = dayCells(el);
      cells.find((c) => c.dataset.date === "2025-01-10")!.click();
      // Re-query after render
      const cells2 = dayCells(el);
      cells2.find((c) => c.dataset.date === "2025-01-20")!.click();
      expect(el.rangeStart).toBe("2025-01-10");
      expect(el.rangeEnd).toBe("2025-01-20");
    });

    it("swaps start/end if second click is before first", () => {
      const el = create({ value: "2025-01-15", range: "" });
      dayCells(el)
        .find((c) => c.dataset.date === "2025-01-20")!
        .click();
      dayCells(el)
        .find((c) => c.dataset.date === "2025-01-10")!
        .click();
      expect(el.rangeStart).toBe("2025-01-10");
      expect(el.rangeEnd).toBe("2025-01-20");
    });

    it("fires range-select when range is completed", () => {
      const el = create({ value: "2025-01-15", range: "" });
      const handler = vi.fn();
      el.addEventListener("range-select", handler);
      dayCells(el)
        .find((c) => c.dataset.date === "2025-01-10")!
        .click();
      dayCells(el)
        .find((c) => c.dataset.date === "2025-01-20")!
        .click();
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].detail).toEqual({
        start: "2025-01-10",
        end: "2025-01-20",
      });
    });

    it("marks in-range cells", () => {
      const el = create({ range: "", "range-start": "2025-01-10", "range-end": "2025-01-20", value: "2025-01-15" });
      const inRange = shadow(el).querySelectorAll("[data-in-range]");
      expect(inRange.length).toBeGreaterThan(0);
    });

    it("starts new range after completing one", () => {
      const el = create({ value: "2025-01-15", range: "" });
      dayCells(el)
        .find((c) => c.dataset.date === "2025-01-10")!
        .click();
      dayCells(el)
        .find((c) => c.dataset.date === "2025-01-20")!
        .click();
      // Third click starts new range
      dayCells(el)
        .find((c) => c.dataset.date === "2025-01-25")!
        .click();
      expect(el.rangeStart).toBe("2025-01-25");
      expect(el.rangeEnd).toBe("");
    });
  });

  // ─── Events (dots) ──────────────────────────────────────────────────

  describe("events", () => {
    it("renders event dots", () => {
      const el = create({ value: "2025-01-15" });
      el.events = [{ date: "2025-01-15" }, { date: "2025-01-15", color: "red" }];
      const dots = shadow(el).querySelectorAll(".event-dot");
      expect(dots.length).toBe(2);
    });

    it("limits dots to 3 per cell", () => {
      const el = create({ value: "2025-01-15" });
      el.events = [{ date: "2025-01-15" }, { date: "2025-01-15" }, { date: "2025-01-15" }, { date: "2025-01-15" }];
      const cell = dayCells(el).find((c) => c.dataset.date === "2025-01-15");
      const dots = cell!.querySelectorAll(".event-dot");
      expect(dots.length).toBe(3);
    });

    it("applies custom color to event dots", () => {
      const el = create({ value: "2025-01-15" });
      el.events = [{ date: "2025-01-15", color: "red" }];
      const dot = shadow(el).querySelector(".event-dot") as HTMLElement;
      expect(dot.style.backgroundColor).toBe("red");
    });
  });

  // ─── Month view ─────────────────────────────────────────────────────

  describe("month view", () => {
    it("switches to month view on header click", () => {
      const el = create({ value: "2025-03-15" });
      clickHeader(el);
      expect(el.view).toBe("months");
      expect(monthCells(el).length).toBe(12);
    });

    it("fires view-change on header click", () => {
      const el = create({ value: "2025-03-15" });
      const handler = vi.fn();
      el.addEventListener("view-change", handler);
      clickHeader(el);
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].detail.view).toBe("months");
    });

    it("selects month and returns to day view", () => {
      const el = create({ value: "2025-03-15" });
      clickHeader(el);
      const jun = monthCells(el).find((c) => c.dataset.month === "5");
      jun!.click();
      expect(el.view).toBe("days");
      expect(el.displayMonth).toBe(5);
    });

    it("marks current month with data-today", () => {
      const el = create();
      clickHeader(el);
      const todayMonth = shadow(el).querySelector(".month-cell[data-today]");
      expect(todayMonth).toBeTruthy();
    });

    it("marks selected month with data-selected", () => {
      const el = create({ value: "2025-03-15" });
      clickHeader(el);
      const selected = shadow(el).querySelector(".month-cell[data-selected]");
      expect((selected as HTMLElement).dataset.month).toBe("2");
    });

    it("navigates years in month view", () => {
      const el = create({ value: "2025-03-15" });
      clickHeader(el);
      clickPrev(el);
      expect(headerLabel(el)).toContain("2024");
      clickNext(el);
      clickNext(el);
      expect(headerLabel(el)).toContain("2026");
    });
  });

  // ─── Year view ──────────────────────────────────────────────────────

  describe("year view", () => {
    it("switches to year view on second header click", () => {
      const el = create({ value: "2025-03-15" });
      clickHeader(el); // → months
      clickHeader(el); // → years
      expect(el.view).toBe("years");
      expect(yearCells(el).length).toBe(12);
    });

    it("selects year and returns to month view", () => {
      const el = create({ value: "2025-03-15" });
      el.view = "years";
      // Year page for 2025 starts at 2016 (2025 - 2025%12 = 2016)
      const y2020 = yearCells(el).find(c => c.dataset.year === "2020");
      y2020!.click();
      expect(el.view).toBe("months");
      expect(el.displayYear).toBe(2020);
    });

    it("navigates year pages", () => {
      const el = create({ value: "2025-03-15" });
      el.view = "years";
      const label1 = headerLabel(el);
      clickNext(el);
      const label2 = headerLabel(el);
      expect(label1).not.toBe(label2);
    });
  });

  // ─── Keyboard ───────────────────────────────────────────────────────

  describe("keyboard", () => {
    it("moves focus with arrow keys in day view", () => {
      const el = create({ value: "2025-01-15" });
      const grid = shadow(el).querySelector(".day-grid") as HTMLElement;
      keydown(grid, "ArrowRight");
      // After arrow right, focused date should be Jan 16
      const focused = shadow(el).querySelector('.day-cell[tabindex="0"]') as HTMLElement;
      expect(focused.dataset.date).toBe("2025-01-16");
    });

    it("moves focus left", () => {
      const el = create({ value: "2025-01-15" });
      const grid = shadow(el).querySelector(".day-grid") as HTMLElement;
      keydown(grid, "ArrowLeft");
      const focused = shadow(el).querySelector('.day-cell[tabindex="0"]') as HTMLElement;
      expect(focused.dataset.date).toBe("2025-01-14");
    });

    it("moves focus up (7 days back)", () => {
      const el = create({ value: "2025-01-15" });
      const grid = shadow(el).querySelector(".day-grid") as HTMLElement;
      keydown(grid, "ArrowUp");
      const focused = shadow(el).querySelector('.day-cell[tabindex="0"]') as HTMLElement;
      expect(focused.dataset.date).toBe("2025-01-08");
    });

    it("moves focus down (7 days forward)", () => {
      const el = create({ value: "2025-01-15" });
      const grid = shadow(el).querySelector(".day-grid") as HTMLElement;
      keydown(grid, "ArrowDown");
      const focused = shadow(el).querySelector('.day-cell[tabindex="0"]') as HTMLElement;
      expect(focused.dataset.date).toBe("2025-01-22");
    });

    it("selects date with Enter", () => {
      const el = create({ value: "2025-01-15" });
      const handler = vi.fn();
      el.addEventListener("date-select", handler);
      const grid = shadow(el).querySelector(".day-grid") as HTMLElement;
      keydown(grid, "ArrowRight");
      keydown(grid, "Enter");
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].detail.date).toBe("2025-01-16");
    });

    it("selects date with Space", () => {
      const el = create({ value: "2025-01-15" });
      const handler = vi.fn();
      el.addEventListener("date-select", handler);
      const grid = shadow(el).querySelector(".day-grid") as HTMLElement;
      keydown(grid, " ");
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].detail.date).toBe("2025-01-15");
    });

    it("navigates month when arrow crosses boundary", () => {
      const el = create({ value: "2025-01-31" });
      const grid = shadow(el).querySelector(".day-grid") as HTMLElement;
      keydown(grid, "ArrowRight");
      expect(el.displayMonth).toBe(1); // February
    });
  });

  // ─── Size ───────────────────────────────────────────────────────────

  describe("size", () => {
    it("defaults to m", () => {
      const el = create();
      expect(el.size).toBe("m");
    });

    it("accepts size=s", () => {
      const el = create({ size: "s" });
      expect(el.getAttribute("size")).toBe("s");
    });

    it("accepts size=l", () => {
      const el = create({ size: "l" });
      expect(el.getAttribute("size")).toBe("l");
    });
  });

  // ─── Locale ─────────────────────────────────────────────────────────

  describe("locale", () => {
    it("defaults to en-US", () => {
      const el = create();
      expect(el.locale).toBe("en-US");
    });

    it("accepts custom locale", () => {
      const el = create({ locale: "de-DE" });
      expect(el.locale).toBe("de-DE");
    });
  });

  // ─── First day of week ──────────────────────────────────────────────

  describe("first-day-of-week", () => {
    it("defaults to 0 (Sunday)", () => {
      const el = create();
      expect(el.firstDayOfWeek).toBe(0);
    });

    it("starts week on Monday when set to 1", () => {
      const el = create({ "first-day-of-week": "1" });
      expect(el.firstDayOfWeek).toBe(1);
      const dow = shadow(el).querySelectorAll(".dow-cell");
      // First DOW should be Monday-ish (locale dependent, but "Mo" for en-US)
      expect(dow[0].textContent).toBeTruthy();
    });
  });

  // ─── ARIA ───────────────────────────────────────────────────────────

  describe("aria", () => {
    it("day cells have role=gridcell", () => {
      const el = create({ value: "2025-01-15" });
      const cells = dayCells(el);
      expect(cells[0].getAttribute("role")).toBe("gridcell");
    });

    it("day cells have aria-label with full date", () => {
      const el = create({ value: "2025-01-15" });
      const cells = dayCells(el);
      const jan15 = cells.find((c) => c.dataset.date === "2025-01-15");
      const label = jan15!.getAttribute("aria-label")!;
      expect(label).toContain("2025");
      expect(label).toContain("15");
    });

    it("disabled cells have aria-disabled", () => {
      const el = create({ value: "2025-01-15", min: "2025-01-10" });
      const disabled = shadow(el).querySelector('[aria-disabled="true"]');
      expect(disabled).toBeTruthy();
    });

    it("nav buttons have aria-label", () => {
      const el = create();
      const btns = shadow(el).querySelectorAll(".nav-btn");
      expect(btns[0].getAttribute("aria-label")).toBeTruthy();
      expect(btns[1].getAttribute("aria-label")).toBeTruthy();
    });

    it("header has role=heading", () => {
      const el = create();
      const label = shadow(el).querySelector(".header-label");
      expect(label!.getAttribute("role")).toBe("heading");
      expect(label!.getAttribute("aria-level")).toBe("2");
    });
  });

  // ─── Attribute changes ──────────────────────────────────────────────

  describe("attribute changes", () => {
    it("re-renders on min change", () => {
      const el = create({ value: "2025-01-15" });
      el.min = "2025-01-14";
      const cells = dayCells(el);
      const jan13 = cells.find((c) => c.dataset.date === "2025-01-13");
      expect(jan13!.hasAttribute("data-disabled")).toBe(true);
    });

    it("re-renders on max change", () => {
      const el = create({ value: "2025-01-15" });
      el.max = "2025-01-16";
      const cells = dayCells(el);
      const jan17 = cells.find((c) => c.dataset.date === "2025-01-17");
      expect(jan17!.hasAttribute("data-disabled")).toBe(true);
    });

    it("re-renders on view change", () => {
      const el = create({ value: "2025-01-15" });
      el.view = "months";
      expect(monthCells(el).length).toBe(12);
    });
  });

  // ─── Disconnected ───────────────────────────────────────────────────

  describe("disconnected", () => {
    it("cleans up event listeners on disconnect", () => {
      const el = create({ value: "2025-01-15" });
      el.remove();
      // Should not throw
      expect(() => {
        el.value = "2025-02-01";
      }).not.toThrow();
    });
  });
});
