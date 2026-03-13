import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-datetime-picker-input.js";
import type { UiDatetimePickerInput } from "./ui-datetime-picker-input.js";

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("ui-datetime-picker-input", () => {
  let el: UiDatetimePickerInput;

  beforeEach(async () => {
    el = document.createElement("ui-datetime-picker-input") as UiDatetimePickerInput;
    document.body.appendChild(el);
    await tick();
  });

  afterEach(() => {
    el.remove();
  });

  const shadow = () => el.shadowRoot!;
  const container = () => shadow().querySelector(".input-container")!;
  const content = () => shadow().querySelector(".content")!;
  const segments = () => content().querySelectorAll(".segment");
  const separators = () => content().querySelectorAll(".separator");
  const iconEl = () => shadow().querySelector(".icon")!;
  const labelRow = () => shadow().querySelector(".label-row")!;
  const supportiveEl = () => shadow().querySelector(".supportive")!;

  // ─── Default rendering ───────────────────────────────────────────────

  describe("default rendering", () => {
    it("creates shadow DOM", () => {
      expect(shadow()).toBeTruthy();
    });

    it("renders .label-row", () => {
      expect(labelRow()).toBeTruthy();
    });

    it("renders .input-container", () => {
      expect(container()).toBeTruthy();
    });

    it("renders .icon", () => {
      expect(iconEl()).toBeTruthy();
    });

    it("renders .content", () => {
      expect(content()).toBeTruthy();
    });

    it("renders .supportive", () => {
      expect(supportiveEl()).toBeTruthy();
    });
  });

  // ─── Default attributes ──────────────────────────────────────────────

  describe("default attributes", () => {
    it("sets size='m' by default", () => {
      expect(el.getAttribute("size")).toBe("m");
    });

    it("sets type='single-date' by default", () => {
      expect(el.getAttribute("type")).toBe("single-date");
    });

    it("sets tabindex='0' by default", () => {
      expect(el.getAttribute("tabindex")).toBe("0");
    });
  });

  // ─── Size attribute ──────────────────────────────────────────────────

  describe("size attribute", () => {
    it("reflects size='s'", () => {
      el.size = "s";
      expect(el.getAttribute("size")).toBe("s");
    });

    it("reflects size='m'", () => {
      el.size = "m";
      expect(el.getAttribute("size")).toBe("m");
    });

    it("reflects size='l'", () => {
      el.size = "l";
      expect(el.getAttribute("size")).toBe("l");
    });
  });

  // ─── Type attribute ──────────────────────────────────────────────────

  describe("type attribute", () => {
    it("reflects type='single-date'", () => {
      el.type = "single-date";
      expect(el.getAttribute("type")).toBe("single-date");
    });

    it("reflects type='range-date'", () => {
      el.type = "range-date";
      expect(el.getAttribute("type")).toBe("range-date");
    });

    it("reflects type='time'", () => {
      el.type = "time";
      expect(el.getAttribute("type")).toBe("time");
    });
  });

  // ─── Property accessors ──────────────────────────────────────────────

  describe("property accessors", () => {
    it("get/set size", () => {
      el.size = "l";
      expect(el.size).toBe("l");
    });

    it("get/set type", () => {
      el.type = "time";
      expect(el.type).toBe("time");
    });

    it("get/set value", () => {
      el.value = "2024-06-15";
      expect(el.value).toBe("2024-06-15");
    });

    it("get/set status", () => {
      el.status = "error";
      expect(el.status).toBe("error");
    });

    it("get/set label", () => {
      el.label = "Pick a date";
      expect(el.label).toBe("Pick a date");
    });

    it("get/set supportive", () => {
      el.supportive = "Helper text";
      expect(el.supportive).toBe("Helper text");
    });

    it("get/set disabled", () => {
      el.disabled = true;
      expect(el.disabled).toBe(true);
      expect(el.hasAttribute("disabled")).toBe(true);
      el.disabled = false;
      expect(el.disabled).toBe(false);
    });

    it("get/set readonly", () => {
      el.readonly = true;
      expect(el.readonly).toBe(true);
      expect(el.hasAttribute("readonly")).toBe(true);
    });
  });

  // ─── Single date content ─────────────────────────────────────────────

  describe("single date content", () => {
    it("shows placeholder when no value", () => {
      const segs = segments();
      expect(segs.length).toBe(1);
      expect(segs[0].textContent).toBe("DD Mon, YYYY");
      expect(segs[0].hasAttribute("data-placeholder")).toBe(true);
    });

    it("shows formatted date when value set", async () => {
      el.value = "2024-06-15";
      await tick();
      const segs = segments();
      expect(segs[0].textContent).toBe("15 Jun, 2024");
      expect(segs[0].hasAttribute("data-placeholder")).toBe(false);
    });

    it("shows custom placeholder", async () => {
      el.setAttribute("placeholder", "Select date");
      await tick();
      expect(segments()[0].textContent).toBe("Select date");
    });
  });

  // ─── Range date content ──────────────────────────────────────────────

  describe("range date content", () => {
    beforeEach(async () => {
      el.type = "range-date";
      await tick();
    });

    it("shows two placeholders with 'to' separator", () => {
      const segs = segments();
      expect(segs.length).toBe(2);
      expect(segs[0].textContent).toBe("DD Mon, YYYY");
      expect(segs[1].textContent).toBe("DD Mon, YYYY");
      const seps = separators();
      expect(seps.length).toBe(1);
      expect(seps[0].textContent).toBe("to");
    });

    it("shows formatted dates when value set", async () => {
      el.value = "2024-06-10/2024-06-20";
      await tick();
      const segs = segments();
      expect(segs[0].textContent).toBe("10 Jun, 2024");
      expect(segs[1].textContent).toBe("20 Jun, 2024");
    });
  });

  // ─── Time content ────────────────────────────────────────────────────

  describe("time content", () => {
    beforeEach(async () => {
      el.type = "time";
      await tick();
    });

    it("shows placeholder segments", () => {
      const segs = segments();
      expect(segs.length).toBeGreaterThanOrEqual(3); // hour, min, period
      expect(segs[0].textContent).toBe("00");
      expect(segs[1].textContent).toBe("00");
    });

    it("shows ':' separator", () => {
      const seps = separators();
      expect(seps.length).toBe(1);
      expect(seps[0].textContent).toBe(":");
    });

    it("shows formatted time when value set", async () => {
      el.value = "02:30 PM";
      await tick();
      const segs = segments();
      expect(segs[0].textContent).toBe("02");
      expect(segs[1].textContent).toBe("30");
      expect(segs[2].textContent).toBe("PM");
    });
  });

  // ─── Icon ────────────────────────────────────────────────────────────

  describe("icon", () => {
    it("shows calendar_today for single-date", () => {
      const icon = iconEl().querySelector("ui-icon");
      expect(icon).toBeTruthy();
      expect(icon!.getAttribute("name")).toBe("calendar_today");
    });

    it("shows calendar_today for range-date", async () => {
      el.type = "range-date";
      await tick();
      const icon = iconEl().querySelector("ui-icon");
      expect(icon!.getAttribute("name")).toBe("calendar_today");
    });

    it("shows schedule for time", async () => {
      el.type = "time";
      await tick();
      const icon = iconEl().querySelector("ui-icon");
      expect(icon!.getAttribute("name")).toBe("schedule");
    });
  });

  // ─── Label ───────────────────────────────────────────────────────────

  describe("label", () => {
    it("label row hidden when no label attribute", () => {
      expect(el.hasAttribute("label")).toBe(false);
    });

    it("label shown when attribute set", async () => {
      el.label = "Select Date";
      await tick();
      expect(el.hasAttribute("label")).toBe(true);
      const labelEl = labelRow().querySelector("ui-label");
      expect(labelEl).toBeTruthy();
      expect(labelEl!.textContent).toBe("Select Date");
    });
  });

  // ─── Supportive text ─────────────────────────────────────────────────

  describe("supportive text", () => {
    it("hidden when no supportive attribute", () => {
      expect(el.hasAttribute("supportive")).toBe(false);
    });

    it("shown when attribute set", async () => {
      el.supportive = "Choose a date";
      await tick();
      expect(supportiveEl().textContent).toBe("Choose a date");
    });
  });

  // ─── Disabled ────────────────────────────────────────────────────────

  describe("disabled", () => {
    it("has disabled attribute", () => {
      el.disabled = true;
      expect(el.hasAttribute("disabled")).toBe(true);
    });

    it("does not dispatch trigger when disabled", () => {
      el.disabled = true;
      const handler = vi.fn();
      el.addEventListener("trigger", handler);
      container().dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ─── Status ──────────────────────────────────────────────────────────

  describe("status", () => {
    it("sets status attribute for error", () => {
      el.status = "error";
      expect(el.getAttribute("status")).toBe("error");
    });

    it("sets status attribute for warning", () => {
      el.status = "warning";
      expect(el.getAttribute("status")).toBe("warning");
    });

    it("sets status attribute for success", () => {
      el.status = "success";
      expect(el.getAttribute("status")).toBe("success");
    });
  });

  // ─── Events ──────────────────────────────────────────────────────────

  describe("events", () => {
    it("dispatches trigger on click", () => {
      const handler = vi.fn();
      el.addEventListener("trigger", handler);
      container().dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("dispatches trigger on Enter key", () => {
      const handler = vi.fn();
      el.addEventListener("trigger", handler);
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("dispatches trigger on Space key", () => {
      const handler = vi.fn();
      el.addEventListener("trigger", handler);
      el.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("does not dispatch trigger on other keys", () => {
      const handler = vi.fn();
      el.addEventListener("trigger", handler);
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
