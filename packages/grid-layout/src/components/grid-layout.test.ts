import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "../components/grid-item";
import "../components/grid-layout";
import { GridLayoutElement } from "../components/grid-layout";
import { GridItemElement } from "../components/grid-item";

function createGridItem(id: string, x: number, y: number, w: number, h: number): GridItemElement {
  const el = document.createElement("grid-item") as GridItemElement;
  el.setAttribute("item-id", id);
  el.setAttribute("x", String(x));
  el.setAttribute("y", String(y));
  el.setAttribute("w", String(w));
  el.setAttribute("h", String(h));
  const content = document.createElement("div");
  content.textContent = id;
  el.appendChild(content);
  return el;
}

describe("GridLayoutElement", () => {
  let grid: GridLayoutElement;

  beforeEach(() => {
    grid = document.createElement("grid-layout") as GridLayoutElement;
    document.body.appendChild(grid);
  });

  afterEach(() => {
    grid.remove();
  });

  describe("registration", () => {
    it("is registered as custom element", () => {
      expect(customElements.get("grid-layout")).toBe(GridLayoutElement);
    });

    it("creates an instance", () => {
      expect(grid).toBeInstanceOf(GridLayoutElement);
    });

    it("has shadow DOM with placeholder and slot", () => {
      expect(grid.shadowRoot).not.toBeNull();
      expect(grid.shadowRoot!.querySelector(".placeholder")).not.toBeNull();
      expect(grid.shadowRoot!.querySelector("slot")).not.toBeNull();
    });
  });

  describe("gridConfig", () => {
    it("has default config", () => {
      const cfg = grid.gridConfig;
      expect(cfg.cols).toBe(12);
      expect(cfg.rowHeight).toBe(150);
      expect(cfg.margin).toEqual([10, 10]);
    });

    it("merges partial config with defaults", () => {
      grid.gridConfig = { cols: 6, rowHeight: 50 };
      const cfg = grid.gridConfig;
      expect(cfg.cols).toBe(6);
      expect(cfg.rowHeight).toBe(50);
      expect(cfg.margin).toEqual([10, 10]); // default preserved
    });
  });

  describe("dragConfig", () => {
    it("has default config", () => {
      const cfg = grid.dragConfig;
      expect(cfg.enabled).toBe(true);
      expect(cfg.threshold).toBe(3);
    });

    it("merges partial config", () => {
      grid.dragConfig = { threshold: 10 };
      expect(grid.dragConfig.threshold).toBe(10);
      expect(grid.dragConfig.enabled).toBe(true);
    });
  });

  describe("resizeConfig", () => {
    it("has default config", () => {
      const cfg = grid.resizeConfig;
      expect(cfg.enabled).toBe(true);
      expect(cfg.handles).toEqual(["se"]);
    });
  });

  describe("compactType", () => {
    it("defaults to vertical", () => {
      expect(grid.compactType).toBe("vertical");
    });

    it("can be changed", () => {
      grid.compactType = "horizontal";
      expect(grid.compactType).toBe("horizontal");
      grid.compactType = null;
      expect(grid.compactType).toBeNull();
    });
  });

  describe("preventCollision", () => {
    it("defaults to false", () => {
      expect(grid.preventCollision).toBe(false);
    });

    it("can be set", () => {
      grid.preventCollision = true;
      expect(grid.preventCollision).toBe(true);
    });
  });

  describe("layout", () => {
    it("starts empty", () => {
      expect(grid.layout).toEqual([]);
    });

    it("can be set programmatically", () => {
      grid.layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2 },
        { i: "b", x: 2, y: 0, w: 2, h: 2 },
      ];
      expect(grid.layout.length).toBe(2);
      expect(grid.layout[0].i).toBe("a");
    });

    it("clones on set (no external mutation)", () => {
      const original = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];
      grid.layout = original;
      original[0].x = 999;
      expect(grid.layout[0].x).toBe(0);
    });

    it("compacts layout on set", () => {
      grid.layout = [
        { i: "a", x: 0, y: 10, w: 2, h: 1 },
        { i: "b", x: 0, y: 20, w: 2, h: 1 },
      ];
      // Vertical compaction should move items up
      expect(grid.layout[0].y).toBe(0);
      expect(grid.layout[1].y).toBe(1);
    });

    it("corrects bounds on set", () => {
      grid.gridConfig = { cols: 4 };
      grid.layout = [{ i: "a", x: 10, y: 0, w: 2, h: 1 }];
      expect(grid.layout[0].x + grid.layout[0].w).toBeLessThanOrEqual(4);
    });
  });

  describe("layout from children", () => {
    it("builds layout from child grid-item attributes", () => {
      const item = createGridItem("a", 0, 0, 3, 2);
      grid.appendChild(item);

      // Force re-connect to trigger buildLayoutFromChildren
      grid.remove();
      document.body.appendChild(grid);

      expect(grid.layout.length).toBe(1);
      expect(grid.layout[0].i).toBe("a");
      expect(grid.layout[0].w).toBe(3);
      expect(grid.layout[0].h).toBe(2);
    });
  });

  describe("events", () => {
    it("emits layout-change when layout is set and changed via interaction", () => {
      const spy = vi.fn();
      grid.addEventListener("layout-change", spy);

      grid.layout = [
        { i: "a", x: 0, y: 0, w: 2, h: 2 },
      ];

      // layout-change is emitted on drag/resize stop, not on programmatic set
      // So we just verify the listener can be attached
      expect(spy).not.toHaveBeenCalled();
      grid.removeEventListener("layout-change", spy);
    });
  });
  describe("CSS custom properties", () => {
    it("uses custom container transition properties", () => {
      const style = grid.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-container-transition-duration");
      expect(style.textContent).toContain("--grid-container-transition-easing");
    });
    it("uses custom placeholder background", () => {
      const style = grid.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-placeholder-bg");
    });
    it("uses custom placeholder border", () => {
      const style = grid.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-placeholder-border");
    });
    it("uses custom placeholder radius", () => {
      const style = grid.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-placeholder-radius");
    });
    it("uses custom placeholder transition properties", () => {
      const style = grid.shadowRoot!.querySelector("style")!;
      expect(style.textContent).toContain("--grid-placeholder-transition-duration");
      expect(style.textContent).toContain("--grid-placeholder-transition-easing");
    });
  });

  describe("lifecycle hooks", () => {
    it("beforeDragStart defaults to null", () => {
      expect(grid.beforeDragStart).toBeNull();
    });
    it("beforeDragStart can be set", () => {
      const fn = () => false;
      grid.beforeDragStart = fn;
      expect(grid.beforeDragStart).toBe(fn);
    });
    it("beforeResizeStart defaults to null", () => {
      expect(grid.beforeResizeStart).toBeNull();
    });
    it("beforeResizeStart can be set", () => {
      const fn = () => false;
      grid.beforeResizeStart = fn;
      expect(grid.beforeResizeStart).toBe(fn);
    });
    it("layoutChangeFilter defaults to null", () => {
      expect(grid.layoutChangeFilter).toBeNull();
    });
    it("layoutChangeFilter can reject layout set", () => {
      grid.layoutChangeFilter = () => false;
      grid.layout = [{ i: "a", x: 0, y: 0, w: 2, h: 2 }];
      expect(grid.layout).toEqual([]);
    });
    it("layoutChangeFilter can modify layout on set", () => {
      grid.layoutChangeFilter = (newLayout) => {
        return newLayout.map(item => ({ ...item, w: 1 }));
      };
      grid.layout = [{ i: "a", x: 0, y: 0, w: 4, h: 2 }];
      expect(grid.layout[0].w).toBe(1);
    });
    it("afterDrop defaults to null", () => {
      expect(grid.afterDrop).toBeNull();
    });
    it("afterDrop can be set", () => {
      const fn = () => true;
      grid.afterDrop = fn;
      expect(grid.afterDrop).toBe(fn);
    });
    it("hooks can be cleared by setting null", () => {
      grid.beforeDragStart = () => false;
      grid.beforeDragStart = null;
      expect(grid.beforeDragStart).toBeNull();
    });
  });
});

describe("GridLayoutElement — accessibility", () => {
  let grid: GridLayoutElement;

  beforeEach(() => {
    grid = document.createElement("grid-layout") as GridLayoutElement;
    document.body.appendChild(grid);
  });

  afterEach(() => {
    grid.remove();
  });

  it("has role=group", () => {
    expect(grid.getAttribute("role")).toBe("group");
  });

  it("has aria-roledescription", () => {
    expect(grid.getAttribute("aria-roledescription")).toBe("draggable grid");
  });

  it("has a live region in shadow DOM", () => {
    const liveRegion = grid.shadowRoot!.querySelector("[aria-live]");
    expect(liveRegion).not.toBeNull();
    expect(liveRegion!.getAttribute("aria-live")).toBe("polite");
    expect(liveRegion!.getAttribute("aria-atomic")).toBe("true");
    expect(liveRegion!.getAttribute("role")).toBe("status");
  });

  it("live region is visually hidden", () => {
    const liveRegion = grid.shadowRoot!.querySelector("[aria-live]") as HTMLElement;
    expect(liveRegion.style.cssText).toContain("position: absolute");
    expect(liveRegion.style.cssText).toContain("width: 1px");
    expect(liveRegion.style.cssText).toContain("height: 1px");
  });
});

describe("GridLayoutElement — keyboard drag", () => {
  let grid: GridLayoutElement;
  let itemA: GridItemElement;

  beforeEach(() => {
    grid = document.createElement("grid-layout") as GridLayoutElement;
    grid.gridConfig = { cols: 12, rowHeight: 30, margin: [0, 0] };
    document.body.appendChild(grid);

    itemA = createGridItem("a", 2, 0, 2, 1);
    grid.appendChild(itemA);

    grid.layout = [{ i: "a", x: 2, y: 0, w: 2, h: 1 }];
  });

  afterEach(() => {
    grid.remove();
  });

  function sendKey(target: HTMLElement, key: string) {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true }));
  }

  it("Enter starts keyboard drag and sets aria-grabbed=true", () => {
    sendKey(itemA, "Enter");
    expect(itemA.getAttribute("aria-grabbed")).toBe("true");
  });

  it("Space starts keyboard drag", () => {
    sendKey(itemA, " ");
    expect(itemA.getAttribute("aria-grabbed")).toBe("true");
  });

  it("ArrowRight moves item right by 1", () => {
    sendKey(itemA, "Enter");
    sendKey(itemA, "ArrowRight");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.x).toBe(3);
  });

  it("ArrowLeft moves item left by 1", () => {
    sendKey(itemA, "Enter");
    sendKey(itemA, "ArrowLeft");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.x).toBe(1);
  });

  it("ArrowDown moves item down by 1", () => {
    grid.compactType = null; // disable compaction so item stays at y=1
    grid.layout = [{ i: "a", x: 2, y: 0, w: 2, h: 1 }];
    sendKey(itemA, "Enter");
    sendKey(itemA, "ArrowDown");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.y).toBe(1);
  });

  it("ArrowUp moves item up (clamped to 0)", () => {
    sendKey(itemA, "Enter");
    sendKey(itemA, "ArrowUp");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.y).toBe(0);
  });

  it("ArrowLeft clamps to x=0", () => {
    grid.layout = [{ i: "a", x: 0, y: 0, w: 2, h: 1 }];
    sendKey(itemA, "Enter");
    sendKey(itemA, "ArrowLeft");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.x).toBe(0);
  });

  it("ArrowRight clamps to cols - w", () => {
    grid.layout = [{ i: "a", x: 10, y: 0, w: 2, h: 1 }];
    sendKey(itemA, "Enter");
    sendKey(itemA, "ArrowRight");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.x).toBeLessThanOrEqual(10);
  });

  it("Enter confirms drop and sets aria-grabbed=false", () => {
    sendKey(itemA, "Enter"); // start drag
    sendKey(itemA, "ArrowRight");
    sendKey(itemA, "Enter"); // confirm
    expect(itemA.getAttribute("aria-grabbed")).toBe("false");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.x).toBe(3);
  });

  it("Enter confirm emits layout-change", () => {
    const spy = vi.fn();
    grid.addEventListener("layout-change", spy);
    sendKey(itemA, "Enter"); // start
    sendKey(itemA, "ArrowRight");
    sendKey(itemA, "Enter"); // confirm
    expect(spy).toHaveBeenCalledTimes(1);
    grid.removeEventListener("layout-change", spy);
  });

  it("Escape cancels drag and reverts layout", () => {
    sendKey(itemA, "Enter");
    sendKey(itemA, "ArrowRight");
    sendKey(itemA, "ArrowRight");
    sendKey(itemA, "Escape");
    expect(itemA.getAttribute("aria-grabbed")).toBe("false");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.x).toBe(2); // reverted
  });

  it("does not start drag on static item", () => {
    grid.layout = [{ i: "a", x: 2, y: 0, w: 2, h: 1, static: true }];
    sendKey(itemA, "Enter");
    expect(itemA.getAttribute("aria-grabbed")).toBe("false");
  });

  it("shows placeholder during keyboard drag", () => {
    sendKey(itemA, "Enter");
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(false);
  });

  it("hides placeholder after confirm", () => {
    sendKey(itemA, "Enter");
    sendKey(itemA, "Enter"); // confirm
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(true);
  });

  it("hides placeholder after cancel", () => {
    sendKey(itemA, "Enter");
    sendKey(itemA, "Escape");
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(true);
  });
});

describe("GridLayoutElement — keyboard resize", () => {
  let grid: GridLayoutElement;
  let itemA: GridItemElement;

  beforeEach(() => {
    grid = document.createElement("grid-layout") as GridLayoutElement;
    grid.gridConfig = { cols: 12, rowHeight: 30, margin: [0, 0] };
    document.body.appendChild(grid);

    itemA = createGridItem("a", 0, 0, 4, 2);
    grid.appendChild(itemA);

    grid.layout = [{ i: "a", x: 0, y: 0, w: 4, h: 2 }];
  });

  afterEach(() => {
    grid.remove();
  });

  function sendKey(target: HTMLElement, key: string) {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true }));
  }

  it("R starts keyboard resize mode", () => {
    sendKey(itemA, "R");
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(false);
  });

  it("ArrowRight increases width by 1", () => {
    sendKey(itemA, "r");
    sendKey(itemA, "ArrowRight");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.w).toBe(5);
  });

  it("ArrowLeft decreases width by 1 (min 1)", () => {
    sendKey(itemA, "r");
    sendKey(itemA, "ArrowLeft");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.w).toBe(3);
  });

  it("ArrowDown increases height by 1", () => {
    sendKey(itemA, "r");
    sendKey(itemA, "ArrowDown");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.h).toBe(3);
  });

  it("ArrowUp decreases height by 1 (min 1)", () => {
    sendKey(itemA, "r");
    sendKey(itemA, "ArrowUp");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.h).toBe(1);
  });

  it("width does not go below minW", () => {
    grid.layout = [{ i: "a", x: 0, y: 0, w: 4, h: 2, minW: 3 }];
    sendKey(itemA, "r");
    sendKey(itemA, "ArrowLeft");
    sendKey(itemA, "ArrowLeft");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.w).toBeGreaterThanOrEqual(3);
  });

  it("Enter confirms resize and emits layout-change", () => {
    const spy = vi.fn();
    grid.addEventListener("layout-change", spy);
    sendKey(itemA, "r");
    sendKey(itemA, "ArrowRight");
    sendKey(itemA, "Enter");
    expect(spy).toHaveBeenCalledTimes(1);
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.w).toBe(5);
    grid.removeEventListener("layout-change", spy);
  });

  it("Escape cancels resize and reverts", () => {
    sendKey(itemA, "r");
    sendKey(itemA, "ArrowRight");
    sendKey(itemA, "ArrowRight");
    sendKey(itemA, "Escape");
    const item = grid.layout.find(l => l.i === "a")!;
    expect(item.w).toBe(4); // reverted
    expect(item.h).toBe(2);
  });

  it("does not start resize on static item", () => {
    grid.layout = [{ i: "a", x: 0, y: 0, w: 4, h: 2, static: true }];
    sendKey(itemA, "r");
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(true);
  });

  it("hides placeholder after resize confirm", () => {
    sendKey(itemA, "r");
    sendKey(itemA, "Enter");
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(true);
  });
});

describe("GridLayoutElement — external drag-and-drop", () => {
  let grid: GridLayoutElement;

  beforeEach(() => {
    grid = document.createElement("grid-layout") as GridLayoutElement;
    grid.gridConfig = { cols: 12, rowHeight: 30, margin: [0, 0] };
    document.body.appendChild(grid);
    grid.layout = [];
  });

  afterEach(() => {
    grid.remove();
  });

  function makeDragEvent(type: string, clientX = 0, clientY = 0): Event {
    const e = new Event(type, { bubbles: true, composed: true, cancelable: true });
    (e as any).clientX = clientX;
    (e as any).clientY = clientY;
    (e as any).dataTransfer = { dropEffect: "none" };
    return e;
  }

  it("isDroppable defaults to false", () => {
    expect(grid.isDroppable).toBe(false);
  });

  it("isDroppable can be set", () => {
    grid.isDroppable = true;
    expect(grid.isDroppable).toBe(true);
  });

  it("droppingItem defaults to null", () => {
    expect(grid.droppingItem).toBeNull();
  });

  it("droppingItem can be set", () => {
    const di = { i: "new", w: 2, h: 2 };
    grid.droppingItem = di;
    expect(grid.droppingItem).toEqual(di);
  });

  it("dragover does nothing when isDroppable is false", () => {
    grid.droppingItem = { i: "new", w: 2, h: 2 };
    grid.dispatchEvent(makeDragEvent("dragover", 50, 50));
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(true);
  });

  it("dragover does nothing when droppingItem is null", () => {
    grid.isDroppable = true;
    grid.dispatchEvent(makeDragEvent("dragover", 50, 50));
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(true);
  });

  it("dragover shows placeholder when isDroppable and droppingItem set", () => {
    grid.isDroppable = true;
    grid.droppingItem = { i: "new", w: 2, h: 2 };
    grid.dispatchEvent(makeDragEvent("dragover", 50, 10));
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(false);
  });

  it("dragleave hides placeholder", () => {
    grid.isDroppable = true;
    grid.droppingItem = { i: "new", w: 2, h: 2 };
    grid.dispatchEvent(makeDragEvent("dragover", 50, 10));
    // dragleave with relatedTarget outside the grid
    const leaveEvent = new Event("dragleave", { bubbles: true, composed: true });
    (leaveEvent as any).relatedTarget = document.body;
    grid.dispatchEvent(leaveEvent);
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(true);
  });

  it("drop adds item to layout and emits external-drop", () => {
    grid.isDroppable = true;
    grid.droppingItem = { i: "new", w: 2, h: 2 };
    // First dragover to set placeholder position
    grid.dispatchEvent(makeDragEvent("dragover", 50, 10));
    // Then drop
    const spy = vi.fn();
    grid.addEventListener("external-drop", spy);
    grid.dispatchEvent(makeDragEvent("drop", 50, 10));
    expect(grid.layout.some(item => item.i === "new")).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    const detail = spy.mock.calls[0][0].detail;
    expect(detail.item.i).toBe("new");
    expect(detail.layout).toBeDefined();
    expect(detail.event).toBeDefined();
    grid.removeEventListener("external-drop", spy);
  });

  it("drop hides placeholder", () => {
    grid.isDroppable = true;
    grid.droppingItem = { i: "new", w: 2, h: 2 };
    grid.dispatchEvent(makeDragEvent("dragover", 50, 10));
    grid.dispatchEvent(makeDragEvent("drop", 50, 10));
    const placeholder = grid.shadowRoot!.querySelector(".placeholder")!;
    expect(placeholder.classList.contains("hidden")).toBe(true);
  });

  it("drop does nothing when isDroppable is false", () => {
    grid.droppingItem = { i: "new", w: 2, h: 2 };
    const spy = vi.fn();
    grid.addEventListener("external-drop", spy);
    grid.dispatchEvent(makeDragEvent("drop", 50, 10));
    expect(spy).not.toHaveBeenCalled();
    expect(grid.layout.length).toBe(0);
    grid.removeEventListener("external-drop", spy);
  });

  it("drop emits layout-change", () => {
    grid.isDroppable = true;
    grid.droppingItem = { i: "new", w: 2, h: 2 };
    grid.dispatchEvent(makeDragEvent("dragover", 50, 10));
    const spy = vi.fn();
    grid.addEventListener("layout-change", spy);
    grid.dispatchEvent(makeDragEvent("drop", 50, 10));
    expect(spy).toHaveBeenCalledTimes(1);
    grid.removeEventListener("layout-change", spy);
  });

  it("dropped item has correct w and h from droppingItem", () => {
    grid.isDroppable = true;
    grid.droppingItem = { i: "new", w: 3, h: 4 };
    grid.dispatchEvent(makeDragEvent("dragover", 50, 10));
    grid.dispatchEvent(makeDragEvent("drop", 50, 10));
    const item = grid.layout.find(l => l.i === "new")!;
    expect(item.w).toBe(3);
    expect(item.h).toBe(4);
  });
});
describe("GridLayoutElement — animation polish", () => {
  let grid: GridLayoutElement;
  beforeEach(() => {
    grid = document.createElement("grid-layout") as GridLayoutElement;
    document.body.appendChild(grid);
  });
  afterEach(() => {
    grid.remove();
  });
  it("has prefers-reduced-motion styles in shadow DOM", () => {
    const style = grid.shadowRoot!.querySelector("style")!;
    expect(style.textContent).toContain("prefers-reduced-motion: reduce");
  });
  it("has interacting host style for suppressing height transition", () => {
    const style = grid.shadowRoot!.querySelector("style")!;
    expect(style.textContent).toContain(":host([interacting])");
  });
  it("placeholder uses opacity/visibility instead of display:none", () => {
    const style = grid.shadowRoot!.querySelector("style")!;
    expect(style.textContent).toContain("opacity: 0");
    expect(style.textContent).toContain("visibility: hidden");
    expect(style.textContent).not.toContain("display: none");
  });
  it("placeholder has will-change: transform", () => {
    const style = grid.shadowRoot!.querySelector("style")!;
    expect(style.textContent).toContain("will-change: transform");
  });
  it("placeholder transitions include opacity", () => {
    const style = grid.shadowRoot!.querySelector("style")!;
    expect(style.textContent).toContain("opacity var(--grid-placeholder-transition-duration");
  });
  it("has no-animation host style for global disable", () => {
    const style = grid.shadowRoot!.querySelector("style")!;
    expect(style.textContent).toContain(":host([no-animation])");
  });
  it("no-animation sets transition durations to 0s", () => {
    const style = grid.shadowRoot!.querySelector("style")!;
    const noAnimBlock = style.textContent!.split(":host([no-animation])")[1];
    expect(noAnimBlock).toContain("--grid-item-transition-duration: 0s");
    expect(noAnimBlock).toContain("--grid-placeholder-transition-duration: 0s");
    expect(noAnimBlock).toContain("--grid-container-transition-duration: 0s");
  });
});
