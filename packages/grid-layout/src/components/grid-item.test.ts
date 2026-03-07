import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../components/grid-item";
import { GridItemElement } from "../components/grid-item";

describe("GridItemElement", () => {
  let el: GridItemElement;

  beforeEach(() => {
    el = document.createElement("grid-item") as GridItemElement;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  describe("registration", () => {
    it("is registered as custom element", () => {
      expect(customElements.get("grid-item")).toBe(GridItemElement);
    });

    it("creates an instance via createElement", () => {
      expect(el).toBeInstanceOf(GridItemElement);
    });

    it("has shadow DOM", () => {
      expect(el.shadowRoot).not.toBeNull();
    });
  });

  describe("attribute accessors", () => {
    it("item-id", () => {
      el.setAttribute("item-id", "test");
      expect(el.itemId).toBe("test");
      el.itemId = "other";
      expect(el.getAttribute("item-id")).toBe("other");
    });

    it("x/y/w/h default to 0/0/1/1", () => {
      expect(el.x).toBe(0);
      expect(el.y).toBe(0);
      expect(el.w).toBe(1);
      expect(el.h).toBe(1);
    });

    it("x/y/w/h read from attributes", () => {
      el.setAttribute("x", "3");
      el.setAttribute("y", "5");
      el.setAttribute("w", "4");
      el.setAttribute("h", "2");
      expect(el.x).toBe(3);
      expect(el.y).toBe(5);
      expect(el.w).toBe(4);
      expect(el.h).toBe(2);
    });

    it("x/y/w/h write to attributes", () => {
      el.x = 7;
      el.y = 8;
      el.w = 3;
      el.h = 4;
      expect(el.getAttribute("x")).toBe("7");
      expect(el.getAttribute("y")).toBe("8");
      expect(el.getAttribute("w")).toBe("3");
      expect(el.getAttribute("h")).toBe("4");
    });

    it("minW/maxW/minH/maxH return undefined when not set", () => {
      expect(el.minW).toBeUndefined();
      expect(el.maxW).toBeUndefined();
      expect(el.minH).toBeUndefined();
      expect(el.maxH).toBeUndefined();
    });

    it("minW/maxW/minH/maxH read from attributes", () => {
      el.setAttribute("min-w", "2");
      el.setAttribute("max-w", "8");
      el.setAttribute("min-h", "1");
      el.setAttribute("max-h", "5");
      expect(el.minW).toBe(2);
      expect(el.maxW).toBe(8);
      expect(el.minH).toBe(1);
      expect(el.maxH).toBe(5);
    });

    it("isStatic reflects static attribute", () => {
      expect(el.isStatic).toBe(false);
      el.toggleAttribute("static", true);
      expect(el.isStatic).toBe(true);
    });

    it("isDraggable defaults to true, false when static", () => {
      expect(el.isDraggable).toBe(true);
      el.toggleAttribute("static", true);
      expect(el.isDraggable).toBe(false);
    });

    it("isDraggable can be explicitly disabled", () => {
      el.setAttribute("is-draggable", "false");
      expect(el.isDraggable).toBe(false);
    });

    it("isResizable defaults to true, false when static", () => {
      expect(el.isResizable).toBe(true);
      el.toggleAttribute("static", true);
      expect(el.isResizable).toBe(false);
    });

    it("isResizable can be explicitly disabled", () => {
      el.setAttribute("is-resizable", "false");
      expect(el.isResizable).toBe(false);
    });
  });

  describe("applyPosition", () => {
    it("sets transform, width, and height", () => {
      el.applyPosition(100, 200, 300, 150);
      expect(el.style.transform).toBe("translate(100px, 200px)");
      expect(el.style.width).toBe("300px");
      expect(el.style.height).toBe("150px");
    });
  });

  describe("resize handles", () => {
    it("creates SE handle by default", () => {
      const handles = el.shadowRoot!.querySelectorAll(".resize-handle");
      expect(handles.length).toBe(1);
      expect(handles[0].classList.contains("resize-handle-se")).toBe(true);
    });

    it("updates handles when resizeHandleAxes is set", () => {
      el.resizeHandleAxes = ["se", "sw", "ne", "nw"];
      const handles = el.shadowRoot!.querySelectorAll(".resize-handle");
      expect(handles.length).toBe(4);
    });

    it("removes handles when not resizable", () => {
      el.setAttribute("is-resizable", "false");
      const handles = el.shadowRoot!.querySelectorAll(".resize-handle");
      expect(handles.length).toBe(0);
    });
  });
  describe("CSS custom properties", () => {
    it("uses custom transition duration", () => {
      const style = el.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-item-transition-duration");
      expect(style.textContent).toContain("--grid-item-transition-easing");
    });

    it("uses custom active opacity", () => {
      const style = el.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-item-active-opacity");
    });

    it("uses custom active z-index", () => {
      const style = el.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-item-active-z-index");
    });

    it("uses custom handle size", () => {
      const style = el.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-handle-size");
    });

    it("uses custom handle color", () => {
      const style = el.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-handle-color");
    });

    it("uses custom handle indicator size and offset", () => {
      const style = el.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-handle-indicator-size");
      expect(style.textContent).toContain("--grid-handle-indicator-offset");
    });
  });

  describe("accessibility", () => {
    it("has role=gridcell", () => {
      expect(el.getAttribute("role")).toBe("gridcell");
    });

    it("has tabindex=0", () => {
      expect(el.getAttribute("tabindex")).toBe("0");
    });

    it("has aria-grabbed=false by default", () => {
      expect(el.getAttribute("aria-grabbed")).toBe("false");
    });

    it("has focus-visible styles in shadow DOM", () => {
      const style = el.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain(":focus-visible");
      expect(style.textContent).toContain("--grid-focus-ring-color");
    });
  });
  describe("animation", () => {
    it("has prefers-reduced-motion styles in shadow DOM", () => {
      const style = el.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("prefers-reduced-motion: reduce");
    });
  });
});
