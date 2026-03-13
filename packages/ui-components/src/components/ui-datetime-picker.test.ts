import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-datetime-picker.js";
import type { UiDatetimePicker } from "./ui-datetime-picker.js";

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("ui-datetime-picker", () => {
  let el: UiDatetimePicker;

  beforeEach(async () => {
    el = document.createElement("ui-datetime-picker") as UiDatetimePicker;
    document.body.appendChild(el);
    await tick();
  });

  afterEach(() => {
    el.remove();
  });

  const shadow = () => el.shadowRoot!;
  const input = () => shadow().querySelector("ui-datetime-picker-input")!;
  const panel = () => shadow().querySelector(".panel")!;
  const calendar = () => shadow().querySelector("ui-calendar")!;
  const cancelBtn = () => shadow().querySelector(".cancel-btn") as HTMLButtonElement;
  const okBtn = () => shadow().querySelector(".ok-btn") as HTMLButtonElement;

  // ─── Default rendering ───────────────────────────────────────────────

  describe("default rendering", () => {
    it("creates shadow DOM", () => {
      expect(shadow()).toBeTruthy();
    });

    it("renders ui-datetime-picker-input", () => {
      expect(input()).toBeTruthy();
    });

    it("renders .panel with ui-calendar", () => {
      expect(panel()).toBeTruthy();
      expect(calendar()).toBeTruthy();
    });

    it("renders action buttons", () => {
      expect(cancelBtn()).toBeTruthy();
      expect(okBtn()).toBeTruthy();
    });
  });

  // ─── Default attributes ──────────────────────────────────────────────

  describe("default attributes", () => {
    it("sets size='m'", () => {
      expect(el.getAttribute("size")).toBe("m");
    });

    it("sets type='single-date'", () => {
      expect(el.getAttribute("type")).toBe("single-date");
    });

    it("is closed by default", () => {
      expect(el.open).toBe(false);
    });
  });

  // ─── Properties ──────────────────────────────────────────────────────

  describe("properties", () => {
    it("get/set size", () => {
      el.size = "l";
      expect(el.size).toBe("l");
    });

    it("get/set type", () => {
      el.type = "range-date";
      expect(el.type).toBe("range-date");
    });

    it("get/set value", () => {
      el.value = "2024-06-15";
      expect(el.value).toBe("2024-06-15");
    });

    it("get/set open", () => {
      el.open = true;
      expect(el.open).toBe(true);
      expect(el.hasAttribute("open")).toBe(true);
    });

    it("get/set label", () => {
      el.label = "Date";
      expect(el.label).toBe("Date");
    });

    it("get/set min", () => {
      el.min = "2024-01-01";
      expect(el.min).toBe("2024-01-01");
    });

    it("get/set max", () => {
      el.max = "2024-12-31";
      expect(el.max).toBe("2024-12-31");
    });

    it("get/set disabled", () => {
      el.disabled = true;
      expect(el.disabled).toBe(true);
    });
  });

  // ─── Prop sync to children ───────────────────────────────────────────

  describe("prop sync", () => {
    it("syncs size to input", async () => {
      el.size = "l";
      await tick();
      expect(input().getAttribute("size")).toBe("l");
    });

    it("syncs size to calendar", async () => {
      el.size = "l";
      await tick();
      expect(calendar().getAttribute("size")).toBe("l");
    });

    it("syncs label to input", async () => {
      el.label = "Pick date";
      await tick();
      expect(input().getAttribute("label")).toBe("Pick date");
    });

    it("syncs value to input", async () => {
      el.value = "2024-06-15";
      await tick();
      expect(input().getAttribute("value")).toBe("2024-06-15");
    });

    it("syncs value to calendar", async () => {
      el.value = "2024-06-15";
      await tick();
      expect(calendar().getAttribute("value")).toBe("2024-06-15");
    });

    it("syncs min/max to calendar", async () => {
      el.min = "2024-01-01";
      el.max = "2024-12-31";
      await tick();
      expect(calendar().getAttribute("min")).toBe("2024-01-01");
      expect(calendar().getAttribute("max")).toBe("2024-12-31");
    });

    it("syncs disabled to input", async () => {
      el.disabled = true;
      await tick();
      expect(input().hasAttribute("disabled")).toBe(true);
    });

    it("sets calendar mode='range' for range-date type", async () => {
      el.type = "range-date";
      await tick();
      expect(calendar().getAttribute("mode")).toBe("range");
    });
  });

  // ─── Open / Close ────────────────────────────────────────────────────

  describe("open/close", () => {
    it("opens on input trigger", async () => {
      input().dispatchEvent(new CustomEvent("trigger", { bubbles: true }));
      expect(el.open).toBe(true);
    });

    it("closes on second trigger", async () => {
      el.open = true;
      input().dispatchEvent(new CustomEvent("trigger", { bubbles: true }));
      expect(el.open).toBe(false);
    });

    it("closes on Escape key", () => {
      el.open = true;
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      expect(el.open).toBe(false);
    });

    it("closes on outside click", () => {
      el.open = true;
      document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(el.open).toBe(false);
    });
  });

  // ─── Single date selection ───────────────────────────────────────────

  describe("single date selection", () => {
    it("updates value on calendar change (no actions)", () => {
      const handler = vi.fn();
      el.addEventListener("change", handler);
      calendar().dispatchEvent(
        new CustomEvent("change", { detail: { value: "2024-06-15" }, bubbles: true }),
      );
      expect(el.value).toBe("2024-06-15");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("closes after selection (no actions)", () => {
      el.open = true;
      calendar().dispatchEvent(
        new CustomEvent("change", { detail: { value: "2024-06-15" }, bubbles: true }),
      );
      expect(el.open).toBe(false);
    });
  });

  // ─── Actions (Cancel / OK) ───────────────────────────────────────────

  describe("actions", () => {
    beforeEach(() => {
      el.setAttribute("show-actions", "");
    });

    it("defers value on calendar change when show-actions", () => {
      calendar().dispatchEvent(
        new CustomEvent("change", { detail: { value: "2024-06-15" }, bubbles: true }),
      );
      // Value not yet committed
      expect(el.value).toBe("");
    });

    it("commits value on OK click", () => {
      const handler = vi.fn();
      el.addEventListener("change", handler);
      calendar().dispatchEvent(
        new CustomEvent("change", { detail: { value: "2024-06-15" }, bubbles: true }),
      );
      okBtn().click();
      expect(el.value).toBe("2024-06-15");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("discards value on Cancel click", () => {
      el.open = true;
      calendar().dispatchEvent(
        new CustomEvent("change", { detail: { value: "2024-06-15" }, bubbles: true }),
      );
      cancelBtn().click();
      expect(el.value).toBe("");
      expect(el.open).toBe(false);
    });
  });

  // ─── Range date ──────────────────────────────────────────────────────

  describe("range date", () => {
    beforeEach(async () => {
      el.type = "range-date";
      await tick();
    });

    it("auto-closes when both endpoints selected (no actions)", () => {
      el.open = true;
      calendar().dispatchEvent(
        new CustomEvent("range-change", {
          detail: { start: "2024-06-10", end: "2024-06-20" },
          bubbles: true,
        }),
      );
      expect(el.value).toBe("2024-06-10/2024-06-20");
      expect(el.open).toBe(false);
    });

    it("does not close when only start selected", () => {
      el.open = true;
      calendar().dispatchEvent(
        new CustomEvent("range-change", {
          detail: { start: "2024-06-10", end: null },
          bubbles: true,
        }),
      );
      expect(el.open).toBe(true);
    });
  });
});
