import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-clock.js";
import type { UiClock } from "./ui-clock.js";

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("ui-clock", () => {
  let el: UiClock;

  beforeEach(async () => {
    el = document.createElement("ui-clock") as UiClock;
    document.body.appendChild(el);
    await tick();
  });

  afterEach(() => {
    el.remove();
  });

  const shadow = () => el.shadowRoot!;
  const clockContainer = () => shadow().querySelector(".clock-container") as HTMLElement;
  const clockFace = () => shadow().querySelector(".clock-face")!;
  const clockNumbers = () => clockFace().querySelectorAll(".clock-number");
  const digitalContainer = () => shadow().querySelector(".digital-container") as HTMLElement;
  const cancelBtn = () => shadow().querySelector(".cancel-btn") as HTMLButtonElement;
  const okBtn = () => shadow().querySelector(".ok-btn") as HTMLButtonElement;

  // ─── Default rendering ───────────────────────────────────────────────

  describe("default rendering", () => {
    it("creates shadow DOM", () => {
      expect(shadow()).toBeTruthy();
    });

    it("renders clock container", () => {
      expect(clockContainer()).toBeTruthy();
    });

    it("renders clock face with numbers", () => {
      expect(clockFace()).toBeTruthy();
      expect(clockNumbers().length).toBe(12);
    });

    it("renders clock track and center", () => {
      expect(clockFace().querySelector(".clock-track")).toBeTruthy();
      expect(clockFace().querySelector(".clock-center")).toBeTruthy();
    });

    it("renders digital container (hidden)", () => {
      expect(digitalContainer()).toBeTruthy();
      expect(digitalContainer().style.display).toBe("none");
    });

  });

  // ─── Default attributes ──────────────────────────────────────────────

  describe("default attributes", () => {
    it("sets size='m'", () => {
      expect(el.getAttribute("size")).toBe("m");
    });

    it("sets mode='analog'", () => {
      expect(el.getAttribute("mode")).toBe("analog");
    });
  });

  // ─── Properties ──────────────────────────────────────────────────────

  describe("properties", () => {
    it("get/set size", () => {
      el.size = "l";
      expect(el.size).toBe("l");
    });

    it("get/set mode", () => {
      el.mode = "24-hour";
      expect(el.mode).toBe("24-hour");
    });

    it("get/set value", () => {
      el.value = "14:30";
      expect(el.value).toBe("14:30");
    });

    it("hour defaults to 12", () => {
      expect(el.hour).toBe(12);
    });

    it("minute defaults to 0", () => {
      expect(el.minute).toBe(0);
    });

    it("parses value into hour/minute", async () => {
      el.value = "14:30";
      await tick();
      expect(el.hour).toBe(14);
      expect(el.minute).toBe(30);
    });
  });

  // ─── Analog mode ─────────────────────────────────────────────────────

  describe("analog mode", () => {
    it("shows clock container, hides digital", () => {
      expect(clockContainer().style.display).not.toBe("none");
      expect(digitalContainer().style.display).toBe("none");
    });

    it("renders 12 clock numbers", () => {
      expect(clockNumbers().length).toBe(12);
    });

    it("clock numbers include 12, 1-11", () => {
      const values = Array.from(clockNumbers()).map((n) => n.textContent);
      expect(values).toContain("12");
      expect(values).toContain("3");
      expect(values).toContain("6");
      expect(values).toContain("9");
    });

    it("clicking a number dispatches time-input", () => {
      const handler = vi.fn();
      el.addEventListener("time-input", handler);
      const num3 = Array.from(clockNumbers()).find(
        (n) => n.textContent === "3",
      ) as HTMLElement;
      num3.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("selected number has data-selected", async () => {
      el.value = "03:00";
      await tick();
      const selected = Array.from(clockNumbers()).filter((n) =>
        n.hasAttribute("data-selected"),
      );
      expect(selected.length).toBeGreaterThan(0);
    });
  });

  // ─── 24-hour digital mode ────────────────────────────────────────────

  describe("24-hour mode", () => {
    beforeEach(async () => {
      el.mode = "24-hour";
      await tick();
    });

    it("shows digital container, hides clock", () => {
      expect(digitalContainer().style.display).not.toBe("none");
      expect(clockContainer().style.display).toBe("none");
    });

    it("renders hour and minute inputs", () => {
      const inputs = digitalContainer().querySelectorAll(".digital-input");
      expect(inputs.length).toBe(2);
    });

    it("renders spin buttons", () => {
      const btns = digitalContainer().querySelectorAll(".spin-btn");
      expect(btns.length).toBe(4); // 2 per row
    });

    it("hour input shows current hour", async () => {
      el.value = "14:30";
      await tick();
      const inputs = digitalContainer().querySelectorAll(".digital-input");
      expect((inputs[0] as HTMLInputElement).value).toBe("14");
    });

    it("minute input shows current minute", async () => {
      el.value = "14:30";
      await tick();
      const inputs = digitalContainer().querySelectorAll(".digital-input");
      expect((inputs[1] as HTMLInputElement).value).toBe("30");
    });

    it("increment hour button works", () => {
      el.value = "14:30";
      const handler = vi.fn();
      el.addEventListener("time-input", handler);
      const btns = digitalContainer().querySelectorAll(".spin-btn");
      // Second button in first row = hour increment
      (btns[1] as HTMLButtonElement).click();
      expect(handler).toHaveBeenCalled();
      expect(el.hour).toBe(15);
    });

    it("decrement hour button works", async () => {
      el.value = "14:30";
      await tick();
      const btns = digitalContainer().querySelectorAll(".spin-btn");
      (btns[0] as HTMLButtonElement).click();
      expect(el.hour).toBe(13);
    });

    it("hour wraps from 23 to 0", async () => {
      el.value = "23:00";
      await tick();
      const btns = digitalContainer().querySelectorAll(".spin-btn");
      (btns[1] as HTMLButtonElement).click();
      expect(el.hour).toBe(0);
    });

    it("minute wraps from 59 to 0", async () => {
      el.value = "14:59";
      await tick();
      const btns = digitalContainer().querySelectorAll(".spin-btn");
      (btns[3] as HTMLButtonElement).click();
      expect(el.minute).toBe(0);
    });
  });

  // ─── Size ────────────────────────────────────────────────────────────

  describe("size", () => {
    it("reflects size='s'", () => {
      el.size = "s";
      expect(el.getAttribute("size")).toBe("s");
    });

    it("reflects size='l'", () => {
      el.size = "l";
      expect(el.getAttribute("size")).toBe("l");
    });
  });

  // ─── Events ──────────────────────────────────────────────────────────

  describe("events", () => {

    it("time-input event has correct detail", () => {
      const handler = vi.fn();
      el.addEventListener("time-input", handler);
      // Click a number on the clock
      const num3 = Array.from(clockNumbers()).find(
        (n) => n.textContent === "3",
      ) as HTMLElement;
      num3.click();
      const detail = handler.mock.calls[0][0].detail;
      expect(detail).toHaveProperty("hour");
      expect(detail).toHaveProperty("minute");
      expect(detail).toHaveProperty("value");
    });
  });

  // ─── Value parsing edge cases ────────────────────────────────────────

  describe("value parsing", () => {
    it("clamps hour to 0-23", async () => {
      el.value = "25:00";
      await tick();
      expect(el.hour).toBe(23);
    });

    it("clamps minute to 0-59", async () => {
      el.value = "12:99";
      await tick();
      expect(el.minute).toBe(59);
    });

    it("handles single digit values", async () => {
      el.value = "9:5";
      await tick();
      expect(el.hour).toBe(9);
      expect(el.minute).toBe(5);
    });

    it("ignores invalid value", async () => {
      const origHour = el.hour;
      el.value = "not-a-time";
      await tick();
      expect(el.hour).toBe(origHour);
    });
  });
});
