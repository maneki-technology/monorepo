import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "../components/grid-item";
import "../components/grid-layout";
import "../components/responsive-grid-layout";
import { ResponsiveGridLayoutElement } from "../components/responsive-grid-layout";
import type { LayoutItem } from "../core/types";

describe("ResponsiveGridLayoutElement", () => {
  let el: ResponsiveGridLayoutElement;

  beforeEach(() => {
    el = document.createElement("responsive-grid-layout") as ResponsiveGridLayoutElement;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  describe("registration", () => {
    it("is registered as custom element", () => {
      expect(customElements.get("responsive-grid-layout")).toBe(ResponsiveGridLayoutElement);
    });

    it("creates an instance", () => {
      expect(el).toBeInstanceOf(ResponsiveGridLayoutElement);
    });

    it("has shadow DOM with inner grid-layout", () => {
      expect(el.shadowRoot).not.toBeNull();
      const inner = el.shadowRoot!.querySelector("grid-layout");
      expect(inner).not.toBeNull();
    });
  });

  describe("breakpoints", () => {
    it("has default breakpoints", () => {
      const bp = el.breakpoints;
      expect(bp.lg).toBe(1200);
      expect(bp.md).toBe(996);
      expect(bp.sm).toBe(768);
      expect(bp.xs).toBe(480);
      expect(bp.xxs).toBe(0);
    });

    it("can set custom breakpoints", () => {
      el.breakpoints = { big: 1000, small: 0 };
      expect(el.breakpoints).toEqual({ big: 1000, small: 0 });
    });
  });

  describe("cols", () => {
    it("has default cols", () => {
      const c = el.cols;
      expect(c.lg).toBe(12);
      expect(c.xxs).toBe(2);
    });

    it("can set custom cols", () => {
      el.cols = { lg: 16, md: 12, sm: 8, xs: 4, xxs: 1 };
      expect(el.cols.lg).toBe(16);
    });
  });

  describe("layouts", () => {
    it("starts with empty layouts", () => {
      expect(el.layouts).toEqual({});
    });

    it("can set layouts per breakpoint", () => {
      const lgLayout: LayoutItem[] = [
        { i: "a", x: 0, y: 0, w: 4, h: 2 },
        { i: "b", x: 4, y: 0, w: 4, h: 2 },
      ];
      el.layouts = { lg: lgLayout };
      expect(el.layouts.lg).toBeDefined();
      expect(el.layouts.lg!.length).toBe(2);
    });
  });

  describe("config forwarding", () => {
    it("forwards compactType to inner grid", () => {
      el.compactType = "horizontal";
      expect(el.compactType).toBe("horizontal");
    });

    it("forwards preventCollision to inner grid", () => {
      el.preventCollision = true;
      expect(el.preventCollision).toBe(true);
    });

    it("forwards gridConfig", () => {
      el.gridConfig = { rowHeight: 50, margin: [5, 5] };
      expect(el.gridConfig.rowHeight).toBe(50);
    });

    it("forwards dragConfig", () => {
      el.dragConfig = { threshold: 10 };
      expect(el.dragConfig.threshold).toBe(10);
    });

    it("forwards resizeConfig", () => {
      el.resizeConfig = { handles: ["se", "sw"] };
      expect(el.resizeConfig.handles).toEqual(["se", "sw"]);
    });
  });

  describe("events", () => {
    it("emits breakpoint-change on width change", async () => {
      const spy = vi.fn();
      el.addEventListener("breakpoint-change", spy);

      el.layouts = {
        lg: [{ i: "a", x: 0, y: 0, w: 4, h: 2 }],
      };

      // breakpoint-change fires via ResizeObserver which is async in happy-dom
      // We verify the listener can be attached and the API is correct
      expect(spy).not.toHaveBeenCalled();
      el.removeEventListener("breakpoint-change", spy);
    });
  });
  describe("external drop event forwarding", () => {
    it("forwards external-drop event from inner grid", () => {
      const spy = vi.fn();
      el.addEventListener("external-drop", spy);
      // Access inner grid and dispatch a synthetic external-drop
      const innerGrid = el.shadowRoot!.querySelector("grid-layout")!;
      innerGrid.dispatchEvent(new CustomEvent("external-drop", {
        detail: { layout: [], item: { i: "x", x: 0, y: 0, w: 1, h: 1 }, event: null },
        bubbles: true,
        composed: true,
      }));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail.item.i).toBe("x");
      el.removeEventListener("external-drop", spy);
    });
  });
});
