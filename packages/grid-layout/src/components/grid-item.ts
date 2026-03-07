import type { ResizeHandleAxis } from "../core/types";

const GRID_ITEM_STYLES = `
:host {
  position: absolute;
  transition:
    transform var(--grid-item-transition-duration, 0.2s) var(--grid-item-transition-easing, ease),
    width var(--grid-item-transition-duration, 0.2s) var(--grid-item-transition-easing, ease),
    height var(--grid-item-transition-duration, 0.2s) var(--grid-item-transition-easing, ease);
  box-sizing: border-box;
  contain: layout style;
}
:host(:focus-visible) {
  outline: 2px solid var(--grid-focus-ring-color, #4a90d9);
  outline-offset: -2px;
  z-index: 2;
}
:host([dragging]),
:host([resizing]) {
  transition: none;
  z-index: var(--grid-item-active-z-index, 3);
  will-change: transform;
  opacity: var(--grid-item-active-opacity, 0.8);
}
:host([static]) {
  cursor: default;
}
@media (prefers-reduced-motion: reduce) {
  :host {
    transition-duration: 0.01ms !important;
  }
}

.grid-item-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* Resize handles */
.resize-handle {
  position: absolute;
  width: var(--grid-handle-size, 20px);
  height: var(--grid-handle-size, 20px);
  z-index: 2;
}

.resize-handle-se {
  bottom: 0;
  right: 0;
  cursor: se-resize;
}
.resize-handle-sw {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
}
.resize-handle-ne {
  top: 0;
  right: 0;
  cursor: ne-resize;
}
.resize-handle-nw {
  top: 0;
  left: 0;
  cursor: nw-resize;
}
.resize-handle-s {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  cursor: s-resize;
}
.resize-handle-n {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  cursor: n-resize;
}
.resize-handle-e {
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  cursor: e-resize;
}
.resize-handle-w {
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  cursor: w-resize;
}

/* Visual indicator for SE handle (most common) */
.resize-handle-se::after {
  content: "";
  position: absolute;
  right: var(--grid-handle-indicator-offset, 3px);
  bottom: var(--grid-handle-indicator-offset, 3px);
  width: var(--grid-handle-indicator-size, 5px);
  height: var(--grid-handle-indicator-size, 5px);
  border-right: 2px solid var(--grid-handle-color, rgba(0, 0, 0, 0.4));
  border-bottom: 2px solid var(--grid-handle-color, rgba(0, 0, 0, 0.4));
}
`;

export class GridItemElement extends HTMLElement {
  static observedAttributes = [
    "item-id", "x", "y", "w", "h",
    "min-w", "max-w", "min-h", "max-h",
    "static", "is-draggable", "is-resizable",
  ];

  private _shadow: ShadowRoot;
  private _contentSlot!: HTMLSlotElement;
  private _resizeHandles: Map<string, HTMLDivElement> = new Map();

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this.setAttribute("role", "gridcell");
    this.setAttribute("tabindex", "0");
    this.setAttribute("aria-grabbed", "false");

    const style = document.createElement("style");
    style.textContent = GRID_ITEM_STYLES;

    const wrapper = document.createElement("div");
    wrapper.classList.add("grid-item-content");

    this._contentSlot = document.createElement("slot");
    wrapper.appendChild(this._contentSlot);

    this._shadow.appendChild(style);
    this._shadow.appendChild(wrapper);
  }

  connectedCallback(): void {
    this.updateResizeHandles();
  }

  attributeChangedCallback(name: string, _old: string | null, _val: string | null): void {
    if (name === "is-resizable") {
      this.updateResizeHandles();
    }
  }

  // --- Public attribute accessors ---

  get itemId(): string {
    return this.getAttribute("item-id") ?? "";
  }
  set itemId(v: string) {
    this.setAttribute("item-id", v);
  }

  get x(): number { return Number(this.getAttribute("x") ?? 0); }
  set x(v: number) { this.setAttribute("x", String(v)); }

  get y(): number { return Number(this.getAttribute("y") ?? 0); }
  set y(v: number) { this.setAttribute("y", String(v)); }

  get w(): number { return Number(this.getAttribute("w") ?? 1); }
  set w(v: number) { this.setAttribute("w", String(v)); }

  get h(): number { return Number(this.getAttribute("h") ?? 1); }
  set h(v: number) { this.setAttribute("h", String(v)); }

  get minW(): number | undefined {
    const v = this.getAttribute("min-w");
    return v != null ? Number(v) : undefined;
  }

  get maxW(): number | undefined {
    const v = this.getAttribute("max-w");
    return v != null ? Number(v) : undefined;
  }

  get minH(): number | undefined {
    const v = this.getAttribute("min-h");
    return v != null ? Number(v) : undefined;
  }

  get maxH(): number | undefined {
    const v = this.getAttribute("max-h");
    return v != null ? Number(v) : undefined;
  }

  get isStatic(): boolean {
    return this.hasAttribute("static");
  }

  get isDraggable(): boolean {
    if (this.isStatic) return false;
    const attr = this.getAttribute("is-draggable");
    return attr !== "false";
  }

  get isResizable(): boolean {
    if (this.isStatic) return false;
    const attr = this.getAttribute("is-resizable");
    return attr !== "false";
  }

  // --- Resize handles ---

  private _resizeHandleAxes: ResizeHandleAxis[] = ["se"];

  get resizeHandleAxes(): ResizeHandleAxis[] {
    return this._resizeHandleAxes;
  }
  set resizeHandleAxes(axes: ResizeHandleAxis[]) {
    this._resizeHandleAxes = axes;
    this.updateResizeHandles();
  }

  private updateResizeHandles(): void {
    // Remove old handles
    for (const [, el] of this._resizeHandles) {
      el.remove();
    }
    this._resizeHandles.clear();

    if (!this.isResizable) return;

    const wrapper = this._shadow.querySelector(".grid-item-content");
    if (!wrapper) return;

    for (const axis of this._resizeHandleAxes) {
      const handle = document.createElement("div");
      handle.classList.add("resize-handle", `resize-handle-${axis}`);
      handle.dataset.axis = axis;
      wrapper.appendChild(handle);
      this._resizeHandles.set(axis, handle);
    }
  }

  /**
   * Check if a pointer event target is a resize handle.
   * Returns the axis if so, null otherwise.
   */
  getResizeHandleAxis(target: EventTarget | null): ResizeHandleAxis | null {
    if (!(target instanceof HTMLElement)) return null;
    // Check shadow DOM handles
    for (const [axis, el] of this._resizeHandles) {
      if (el === target || el.contains(target)) {
        return axis as ResizeHandleAxis;
      }
    }
    return null;
  }

  /**
   * Apply pixel position via CSS transform + width/height.
   */
  applyPosition(left: number, top: number, width: number, height: number): void {
    this.style.transform = `translate(${left}px, ${top}px)`;
    this.style.width = `${width}px`;
    this.style.height = `${height}px`;
  }
}

customElements.define("grid-item", GridItemElement);
