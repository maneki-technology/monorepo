import type {
  LayoutItem,
  Layout,
  GridConfig,
  DragConfig,
  ResizeConfig,
  CompactType,
  ResizeHandleAxis,
  GridDragEvent,
  GridResizeEvent,
  BeforeDragStartHook,
  BeforeResizeStartHook,
  LayoutChangeFilter,
  AfterDropHook,
  DroppingItem,
  ExternalDropEvent,
} from "../core/types";
import {
  DEFAULT_GRID_CONFIG,
  DEFAULT_DRAG_CONFIG,
  DEFAULT_RESIZE_CONFIG,
} from "../core/types";
import {
  calcColWidth,
  calcPosition,
  calcXY,
  calcWH,
  calcContainerHeight,
  cloneLayout,
  getLayoutItem,
  constrainSize,
  constrainPosition,
  bottom,
} from "../core/utils";
import { moveElement } from "../core/layout-engine";
import { compact, correctBounds } from "../core/compact";
import { GridItemElement } from "./grid-item";

const GRID_LAYOUT_STYLES = `
:host {
  display: block;
  position: relative;
  transition: height var(--grid-container-transition-duration, 0.2s) var(--grid-container-transition-easing, ease);
}
:host([interacting]) {
  transition: none;
}
.placeholder {
  position: absolute;
  background: var(--grid-placeholder-bg, rgba(0, 0, 0, 0.1));
  border: var(--grid-placeholder-border, 2px dashed rgba(0, 0, 0, 0.3));
  border-radius: var(--grid-placeholder-radius, 4px);
  transition:
    transform var(--grid-placeholder-transition-duration, 0.15s) var(--grid-placeholder-transition-easing, ease),
    width var(--grid-placeholder-transition-duration, 0.15s) var(--grid-placeholder-transition-easing, ease),
    height var(--grid-placeholder-transition-duration, 0.15s) var(--grid-placeholder-transition-easing, ease),
    opacity var(--grid-placeholder-transition-duration, 0.15s) var(--grid-placeholder-transition-easing, ease);
  z-index: 1;
  pointer-events: none;
  will-change: transform;
  opacity: 1;
  visibility: visible;
}
.placeholder.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
:host([no-animation]) {
  transition: none;
  --grid-item-transition-duration: 0s;
  --grid-placeholder-transition-duration: 0s;
  --grid-container-transition-duration: 0s;
}
@media (prefers-reduced-motion: reduce) {
  :host {
    transition-duration: 0.01ms !important;
  }
  .placeholder {
    transition-duration: 0.01ms !important;
  }
}
`;

interface DragState {
  itemId: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  oldLayout: Layout;
  oldItem: LayoutItem;
}

interface ResizeState {
  itemId: string;
  axis: ResizeHandleAxis;
  startClientX: number;
  startClientY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
  oldLayout: Layout;
  oldItem: LayoutItem;
}

export class GridLayoutElement extends HTMLElement {
  // --- Configuration ---
  private _gridConfig: GridConfig = { ...DEFAULT_GRID_CONFIG };
  private _dragConfig: DragConfig = { ...DEFAULT_DRAG_CONFIG };
  private _resizeConfig: ResizeConfig = { ...DEFAULT_RESIZE_CONFIG };
  private _compactType: CompactType = "vertical";
  private _preventCollision = false;

  // --- Lifecycle hooks ---
  private _beforeDragStart: BeforeDragStartHook | null = null;
  private _beforeResizeStart: BeforeResizeStartHook | null = null;
  private _layoutChangeFilter: LayoutChangeFilter | null = null;
  private _afterDrop: AfterDropHook | null = null;

  // --- Layout state ---
  private _layout: Layout = [];
  private _containerWidth = 0;

  // --- Interaction state ---
  private _dragState: DragState | null = null;
  private _resizeState: ResizeState | null = null;
  private _dragThresholdMet = false;
  private _rafId: number | null = null;
  private _pendingPointerEvent: PointerEvent | null = null;

  // --- Keyboard interaction state ---
  private _kbDragActive = false;
  private _kbResizeActive = false;
  private _kbFocusedItemId: string | null = null;
  private _kbOldLayout: Layout | null = null;

  // --- External drop state ---
  private _isDroppable = false;
  private _droppingItem: DroppingItem | null = null;
  private _externalDragOver = false;
  private _externalPlaceholderItem: LayoutItem | null = null;

  // --- Session caches (populated on drag/resize start, cleared on end) ---
  private _cachedItems: GridItemElement[] | null = null;
  private _cachedActiveItem: GridItemElement | null = null;
  private _cachedRect: DOMRect | null = null;
  private _cachedColWidth: number | null = null;
  private _cachedStatics: LayoutItem[] | null = null;

  // --- DOM ---
  private _shadow: ShadowRoot;
  private _slot!: HTMLSlotElement;
  private _placeholder!: HTMLDivElement;
  private _liveRegion!: HTMLDivElement;
  private _resizeObserver: ResizeObserver | null = null;

  // --- Bound handlers ---
  private _onPointerDown = this.handlePointerDown.bind(this);
  private _onPointerMove = this.handlePointerMove.bind(this);
  private _onPointerUp = this.handlePointerUp.bind(this);
  private _onKeyDown = this.handleKeyDown.bind(this);
  private _onDragEnter = this.handleDragEnter.bind(this);
  private _onDragOver = this.handleDragOver.bind(this);
  private _onDragLeave = this.handleDragLeave.bind(this);
  private _onDrop = this.handleDrop.bind(this);

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this.setAttribute("role", "grid");
    this.setAttribute("aria-roledescription", "draggable grid");

    const style = document.createElement("style");
    style.textContent = GRID_LAYOUT_STYLES;

    this._placeholder = document.createElement("div");
    this._placeholder.classList.add("placeholder", "hidden");

    this._slot = document.createElement("slot");

    this._shadow.appendChild(style);
    this._shadow.appendChild(this._placeholder);
    this._shadow.appendChild(this._slot);

    // Live region for screen reader announcements
    this._liveRegion = document.createElement("div");
    this._liveRegion.setAttribute("role", "status");
    this._liveRegion.setAttribute("aria-live", "polite");
    this._liveRegion.setAttribute("aria-atomic", "true");
    this._liveRegion.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;";
    this._shadow.appendChild(this._liveRegion);
  }

  // --- Public API ---

  get layout(): Layout {
    return this._layout;
  }

  set layout(value: Layout) {
    const oldLayout = cloneLayout(this._layout);
    let newLayout = cloneLayout(value);
    newLayout = correctBounds(newLayout, this._gridConfig.cols);
    newLayout = compact(newLayout, this._compactType, this._gridConfig.cols);
    // Lifecycle hook: layoutChangeFilter
    if (this._layoutChangeFilter) {
      const filtered = this._layoutChangeFilter(newLayout, oldLayout, "set");
      if (filtered === false) return;
      newLayout = filtered;
    }
    this._layout = newLayout;
    this.updatePositions();
  }

  get gridConfig(): GridConfig {
    return { ...this._gridConfig };
  }

  set gridConfig(value: Partial<GridConfig>) {
    this._gridConfig = { ...DEFAULT_GRID_CONFIG, ...value };
    if (this._layout.length > 0) {
      this._layout = correctBounds(this._layout, this._gridConfig.cols);
      this._layout = compact(this._layout, this._compactType, this._gridConfig.cols);
      this.updatePositions();
    }
  }

  get dragConfig(): DragConfig {
    return { ...this._dragConfig };
  }

  set dragConfig(value: Partial<DragConfig>) {
    this._dragConfig = { ...DEFAULT_DRAG_CONFIG, ...value };
  }

  get resizeConfig(): ResizeConfig {
    return { ...this._resizeConfig };
  }

  set resizeConfig(value: Partial<ResizeConfig>) {
    this._resizeConfig = { ...DEFAULT_RESIZE_CONFIG, ...value };
    this.syncResizeHandlesToItems();
  }

  get compactType(): CompactType {
    return this._compactType;
  }

  set compactType(value: CompactType) {
    this._compactType = value;
    if (this._layout.length > 0) {
      this._layout = compact(this._layout, this._compactType, this._gridConfig.cols);
      this.updatePositions();
    }
  }

  get preventCollision(): boolean {
    return this._preventCollision;
  }

  set preventCollision(value: boolean) {
    this._preventCollision = value;
  }

  // --- Lifecycle hook setters ---

  get beforeDragStart(): BeforeDragStartHook | null { return this._beforeDragStart; }
  set beforeDragStart(fn: BeforeDragStartHook | null) { this._beforeDragStart = fn; }

  get beforeResizeStart(): BeforeResizeStartHook | null { return this._beforeResizeStart; }
  set beforeResizeStart(fn: BeforeResizeStartHook | null) { this._beforeResizeStart = fn; }

  get layoutChangeFilter(): LayoutChangeFilter | null { return this._layoutChangeFilter; }
  set layoutChangeFilter(fn: LayoutChangeFilter | null) { this._layoutChangeFilter = fn; }

  get afterDrop(): AfterDropHook | null { return this._afterDrop; }
  set afterDrop(fn: AfterDropHook | null) { this._afterDrop = fn; }

  // --- External drop API ---

  get isDroppable(): boolean { return this._isDroppable; }
  set isDroppable(value: boolean) { this._isDroppable = value; }

  get droppingItem(): DroppingItem | null { return this._droppingItem; }
  set droppingItem(value: DroppingItem | null) { this._droppingItem = value; }

  // --- Lifecycle ---

  connectedCallback(): void {
    this.addEventListener("pointerdown", this._onPointerDown);
    this.addEventListener("keydown", this._onKeyDown);
    this.addEventListener("dragenter", this._onDragEnter);
    this.addEventListener("dragover", this._onDragOver);
    this.addEventListener("dragleave", this._onDragLeave);
    this.addEventListener("drop", this._onDrop);
    this.addEventListener("keydown", this._onKeyDown);

    // Observe own width
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width !== this._containerWidth && width > 0) {
          this._containerWidth = width;
          this.updatePositions();
        }
      }
    });
    this._resizeObserver.observe(this);

    // Build layout from child <grid-item> elements if no layout set
    if (this._layout.length === 0) {
      this.buildLayoutFromChildren();
    }

    this.syncResizeHandlesToItems();
  }

  disconnectedCallback(): void {
    this.removeEventListener("pointerdown", this._onPointerDown);
    this.removeEventListener("keydown", this._onKeyDown);
    this.removeEventListener("dragenter", this._onDragEnter);
    this.removeEventListener("dragover", this._onDragOver);
    this.removeEventListener("dragleave", this._onDragLeave);
    this.removeEventListener("drop", this._onDrop);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    if (this._rafId !== null) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    this._pendingPointerEvent = null;
  }

  // --- Build layout from DOM ---

  /**
   * Get grid-item children — works for both direct children and slotted elements.
   */
  private getGridItems(): GridItemElement[] {
    const slotted = this._slot.assignedElements({ flatten: true })
      .filter((el): el is GridItemElement => el instanceof GridItemElement);
    if (slotted.length > 0) return slotted;
    return Array.from(this.querySelectorAll<GridItemElement>("grid-item"));
  }

  private buildLayoutFromChildren(): void {
    const items = this.getGridItems();
    const layout: Layout = [];

    items.forEach((el) => {
      if (!el.itemId) return;
      const item: LayoutItem = {
        i: el.itemId,
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
      };
      if (el.minW != null) item.minW = el.minW;
      if (el.maxW != null) item.maxW = el.maxW;
      if (el.minH != null) item.minH = el.minH;
      if (el.maxH != null) item.maxH = el.maxH;
      if (el.isStatic) item.static = true;
      if (!el.isDraggable) item.isDraggable = false;
      if (!el.isResizable) item.isResizable = false;

      layout.push(item);
    });

    if (layout.length > 0) {
      this.layout = layout;
    }
  }

  private syncResizeHandlesToItems(): void {
    const items = this.getGridItems();
    items.forEach((el) => {
      el.resizeHandleAxes = this._resizeConfig.handles;
    });
  }

  // --- Position rendering ---

  private updatePositions(): void {
    if (this._containerWidth <= 0) return;
    const items = this._cachedItems ?? this.getGridItems();
    const colWidth = this._cachedColWidth ?? calcColWidth(this._containerWidth, this._gridConfig);
    const padding = this._gridConfig.containerPadding ?? this._gridConfig.margin;
    const layoutMap = new Map<string, LayoutItem>();
    for (const l of this._layout) {
      layoutMap.set(l.i, l);
    }
    const cfg = this._gridConfig;
    items.forEach((el) => {
      const item = layoutMap.get(el.itemId);
      if (!item) return;
      const left = Math.round((colWidth + cfg.margin[0]) * item.x + padding[0]);
      const top = Math.round((cfg.rowHeight + cfg.margin[1]) * item.y + padding[1]);
      const width = Math.round(colWidth * item.w + cfg.margin[0] * (item.w - 1));
      const height = Math.round(cfg.rowHeight * item.h + cfg.margin[1] * (item.h - 1));
      el.applyPosition(left, top, width, height);
    });
    if (this._layout.length > 0) {
      const height = calcContainerHeight(this._layout, this._gridConfig);
      this.style.height = `${height}px`;
    }
  }

  // --- Pointer event handlers ---

  private handlePointerDown(e: PointerEvent): void {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    // Find the grid-item
    const gridItem = target.closest?.("grid-item") as GridItemElement | null
      ?? (target.getRootNode() as ShadowRoot).host as GridItemElement | null;

    if (!gridItem || !(gridItem instanceof GridItemElement)) return;
    if (!gridItem.itemId) return;

    // Check if clicking a resize handle (inside shadow DOM)
    const composedPath = e.composedPath();
    let resizeAxis: ResizeHandleAxis | null = null;
    for (const el of composedPath) {
      if (el instanceof HTMLElement && el.classList?.contains("resize-handle")) {
        resizeAxis = el.dataset.axis as ResizeHandleAxis;
        break;
      }
    }

    if (resizeAxis && this._resizeConfig.enabled && gridItem.isResizable) {
      this.startResize(e, gridItem, resizeAxis);
    } else if (this._dragConfig.enabled && gridItem.isDraggable) {
      // Check drag handle / cancel selectors
      if (this._dragConfig.handle) {
        const handle = gridItem.querySelector(this._dragConfig.handle);
        if (!handle || !handle.contains(target)) return;
      }
      if (this._dragConfig.cancel) {
        const cancel = gridItem.querySelector(this._dragConfig.cancel);
        if (cancel && cancel.contains(target)) return;
      }
      this.startDrag(e, gridItem);
    }
  }

  private handlePointerMove(e: PointerEvent): void {
    e.preventDefault();
    // rAF throttle: store latest event, schedule processing once per frame
    this._pendingPointerEvent = e;
    if (this._rafId === null) {
      this._rafId = requestAnimationFrame(() => {
        this._rafId = null;
        const pe = this._pendingPointerEvent;
        if (!pe) return;
        this._pendingPointerEvent = null;
        if (this._dragState) {
          this.onDrag(pe);
        } else if (this._resizeState) {
          this.onResize(pe);
        }
      });
    }
  }

  private handlePointerUp(e: PointerEvent): void {
    if (this._dragState) {
      this.endDrag(e);
    } else if (this._resizeState) {
      this.endResize(e);
    }
  }

  // --- Drag ---

  private startDrag(e: PointerEvent, gridItem: GridItemElement): void {
    const item = getLayoutItem(this._layout, gridItem.itemId);
    if (!item) return;
    // Lifecycle hook: beforeDragStart
    if (this._beforeDragStart && this._beforeDragStart(item, e) === false) return;
    // Populate session caches
    this._cachedItems = this.getGridItems();
    this._cachedActiveItem = gridItem;
    this._cachedRect = this.getBoundingClientRect();
    this._cachedColWidth = calcColWidth(this._containerWidth, this._gridConfig);
    this._cachedStatics = this._layout.filter(l => l.static);
    const pos = calcPosition(item, this._containerWidth, this._gridConfig);
    this._dragState = {
      itemId: item.i,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - pos.left - this._cachedRect.left,
      offsetY: e.clientY - pos.top - this._cachedRect.top,
      oldLayout: cloneLayout(this._layout),
      oldItem: { ...item },
    };
    this._dragThresholdMet = false;
    document.addEventListener("pointermove", this._onPointerMove);
    document.addEventListener("pointerup", this._onPointerUp);
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  }

  private onDrag(e: PointerEvent): void {
    if (!this._dragState) return;
    const dx = e.clientX - this._dragState.startX;
    const dy = e.clientY - this._dragState.startY;
    // Check threshold
    if (!this._dragThresholdMet) {
      if (Math.abs(dx) < this._dragConfig.threshold && Math.abs(dy) < this._dragConfig.threshold) {
        return;
      }
      this._dragThresholdMet = true;
      const gridItem = this._cachedActiveItem;
      gridItem?.toggleAttribute("dragging", true);
      this.toggleAttribute("interacting", true);
      this.emitDragEvent("drag-start", this._dragState.oldItem, this._dragState.oldItem, e, gridItem);
    }
    const rect = this._cachedRect!;
    const newLeft = e.clientX - rect.left - this._dragState.offsetX;
    const newTop = e.clientY - rect.top - this._dragState.offsetY;
    const { x, y } = calcXY(newTop, newLeft, this._containerWidth, this._gridConfig);
    const item = getLayoutItem(this._layout, this._dragState.itemId);
    if (!item) return;
    const constrained = constrainPosition(item, x, y, this._gridConfig.cols);
    if (item.x === constrained.x && item.y === constrained.y) return;
    const oldItem = { ...item };
    this._layout = moveElement(
      this._layout, item, constrained.x, constrained.y,
      true, this._preventCollision, this._compactType, this._gridConfig.cols
    );
    this._layout = compact(this._layout, this._compactType, this._gridConfig.cols, this._cachedStatics ?? undefined);
    const newItem = getLayoutItem(this._layout, this._dragState.itemId);
    if (newItem) this.showPlaceholder(newItem);
    this.updatePositions();
    // Override dragged item to follow cursor
    const gridItem = this._cachedActiveItem;
    if (gridItem && newItem) {
      const colWidth = this._cachedColWidth!;
      const padding = this._gridConfig.containerPadding ?? this._gridConfig.margin;
      const w = Math.round(colWidth * newItem.w + this._gridConfig.margin[0] * (newItem.w - 1));
      const h = Math.round(this._gridConfig.rowHeight * newItem.h + this._gridConfig.margin[1] * (newItem.h - 1));
      gridItem.applyPosition(newLeft, newTop, w, h);
    }
    this.emitDragEvent("drag", oldItem, newItem ?? null, e, gridItem);
  }

  private endDrag(e: PointerEvent): void {
    if (!this._dragState) return;
    if (this._rafId !== null) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    this._pendingPointerEvent = null;
    const gridItem = this._cachedActiveItem;
    gridItem?.toggleAttribute("dragging", false);
    this.toggleAttribute("interacting", false);
    this.hidePlaceholder();
    const newItem = getLayoutItem(this._layout, this._dragState.itemId);
    if (this._dragThresholdMet) {
      if (this._afterDrop && newItem && this._afterDrop(newItem, this._layout, this._dragState.oldLayout, e) === false) {
        this._layout = cloneLayout(this._dragState.oldLayout);
        this.emitDragEvent("drag-stop", this._dragState.oldItem, this._dragState.oldItem, e, gridItem);
      } else {
        this.emitDragEvent("drag-stop", this._dragState.oldItem, newItem ?? null, e, gridItem);
      }
      this.emitLayoutChange();
    }
    this.updatePositions();
    this._dragState = null;
    this._dragThresholdMet = false;
    this.clearSessionCaches();
    document.removeEventListener("pointermove", this._onPointerMove);
    document.removeEventListener("pointerup", this._onPointerUp);
  }

  // --- Resize ---

  private startResize(e: PointerEvent, gridItem: GridItemElement, axis: ResizeHandleAxis): void {
    const item = getLayoutItem(this._layout, gridItem.itemId);
    if (!item) return;
    if (this._beforeResizeStart && this._beforeResizeStart(item, axis, e) === false) return;
    this._cachedItems = this.getGridItems();
    this._cachedActiveItem = gridItem;
    this._cachedRect = this.getBoundingClientRect();
    this._cachedColWidth = calcColWidth(this._containerWidth, this._gridConfig);
    this._cachedStatics = this._layout.filter(l => l.static);
    const pos = calcPosition(item, this._containerWidth, this._gridConfig);
    this._resizeState = {
      itemId: item.i, axis,
      startClientX: e.clientX, startClientY: e.clientY,
      startWidth: pos.width, startHeight: pos.height,
      startLeft: pos.left, startTop: pos.top,
      oldLayout: cloneLayout(this._layout),
      oldItem: { ...item },
    };
    gridItem.toggleAttribute("resizing", true);
    this.toggleAttribute("interacting", true);
    this.emitResizeEvent("resize-start", this._resizeState.oldItem, this._resizeState.oldItem, e, gridItem);
    document.addEventListener("pointermove", this._onPointerMove);
    document.addEventListener("pointerup", this._onPointerUp);
    e.preventDefault();
    e.stopPropagation();
  }

  private onResize(e: PointerEvent): void {
    if (!this._resizeState) return;
    const dx = e.clientX - this._resizeState.startClientX;
    const dy = e.clientY - this._resizeState.startClientY;
    const axis = this._resizeState.axis;
    let newWidth = this._resizeState.startWidth;
    let newHeight = this._resizeState.startHeight;
    if (axis.includes("e")) newWidth += dx;
    if (axis.includes("w")) newWidth -= dx;
    if (axis.includes("s")) newHeight += dy;
    if (axis.includes("n")) newHeight -= dy;
    newWidth = Math.max(newWidth, 20);
    newHeight = Math.max(newHeight, 20);
    const { w, h } = calcWH(newWidth, newHeight, this._containerWidth, this._gridConfig);
    const item = getLayoutItem(this._layout, this._resizeState.itemId);
    if (!item) return;
    const constrained = constrainSize(item, w, h, this._gridConfig.cols);
    let newX = item.x;
    let newY = item.y;
    if (axis.includes("w")) {
      newX = this._resizeState.oldItem.x + (this._resizeState.oldItem.w - constrained.w);
      newX = Math.max(0, newX);
    }
    if (axis.includes("n")) {
      newY = this._resizeState.oldItem.y + (this._resizeState.oldItem.h - constrained.h);
      newY = Math.max(0, newY);
    }
    if (item.w === constrained.w && item.h === constrained.h && item.x === newX && item.y === newY) return;
    const oldItem = { ...item };
    item.w = constrained.w;
    item.h = constrained.h;
    item.x = newX;
    item.y = newY;
    this._layout = compact(this._layout, this._compactType, this._gridConfig.cols, this._cachedStatics ?? undefined);
    const newItem = getLayoutItem(this._layout, this._resizeState.itemId);
    if (newItem) this.showPlaceholder(newItem);
    this.updatePositions();
    const gridItem = this._cachedActiveItem;
    if (gridItem) {
      const colWidth = this._cachedColWidth!;
      const cfg = this._gridConfig;
      const padding = cfg.containerPadding ?? cfg.margin;
      const posLeft = Math.round((colWidth + cfg.margin[0]) * item.x + padding[0]);
      const posTop = Math.round((cfg.rowHeight + cfg.margin[1]) * item.y + padding[1]);
      const posW = Math.round(colWidth * item.w + cfg.margin[0] * (item.w - 1));
      const posH = Math.round(cfg.rowHeight * item.h + cfg.margin[1] * (item.h - 1));
      gridItem.applyPosition(posLeft, posTop, newWidth > 20 ? newWidth : posW, newHeight > 20 ? newHeight : posH);
    }
    this.emitResizeEvent("resize", oldItem, newItem ?? null, e, gridItem);
  }

  private endResize(e: PointerEvent): void {
    if (!this._resizeState) return;
    if (this._rafId !== null) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    this._pendingPointerEvent = null;
    const gridItem = this._cachedActiveItem;
    gridItem?.toggleAttribute("resizing", false);
    this.toggleAttribute("interacting", false);
    this.hidePlaceholder();
    const newItem = getLayoutItem(this._layout, this._resizeState.itemId);
    this.emitResizeEvent("resize-stop", this._resizeState.oldItem, newItem ?? null, e, gridItem);
    this.emitLayoutChange();
    this.updatePositions();
    this._resizeState = null;
    this.clearSessionCaches();
    document.removeEventListener("pointermove", this._onPointerMove);
    document.removeEventListener("pointerup", this._onPointerUp);
  }

  private clearSessionCaches(): void {
    this._cachedItems = null;
    this._cachedActiveItem = null;
    this._cachedRect = null;
    this._cachedColWidth = null;
    this._cachedStatics = null;
  }

  // --- External drag-and-drop ---

  private handleDragEnter(e: DragEvent): void {
    if (!this._isDroppable || !this._droppingItem) return;
    e.preventDefault();
    this._externalDragOver = true;
  }

  private handleDragOver(e: DragEvent): void {
    if (!this._isDroppable || !this._droppingItem) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    const rect = this.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const { x, y } = calcXY(clientY, clientX, this._containerWidth, this._gridConfig);
    const cols = this._gridConfig.cols;
    const di = this._droppingItem;
    const clampedX = Math.max(0, Math.min(cols - di.w, x));
    const clampedY = Math.max(0, y);
    // Only update if position changed
    if (
      this._externalPlaceholderItem &&
      this._externalPlaceholderItem.x === clampedX &&
      this._externalPlaceholderItem.y === clampedY
    ) return;
    this._externalPlaceholderItem = {
      i: di.i,
      x: clampedX,
      y: clampedY,
      w: di.w,
      h: di.h,
    };
    this.showPlaceholder(this._externalPlaceholderItem);
  }

  private handleDragLeave(e: DragEvent): void {
    if (!this._isDroppable) return;
    // Only handle if leaving the grid itself, not entering a child
    const related = e.relatedTarget as Node | null;
    if (related && this.contains(related)) return;
    this._externalDragOver = false;
    this._externalPlaceholderItem = null;
    this.hidePlaceholder();
  }

  private handleDrop(e: DragEvent): void {
    if (!this._isDroppable || !this._droppingItem || !this._externalPlaceholderItem) return;
    e.preventDefault();
    const item: LayoutItem = { ...this._externalPlaceholderItem };
    // Add to layout
    const newLayout = [...this._layout, item];
    this._layout = compact(newLayout, this._compactType, this._gridConfig.cols);
    this.updatePositions();
    this.emitLayoutChange();
    // Emit external-drop event
    const detail: ExternalDropEvent = {
      layout: cloneLayout(this._layout),
      item: { ...item },
      event: e,
    };
    this.dispatchEvent(new CustomEvent("external-drop", { detail, bubbles: true, composed: true }));
    // Clean up
    this._externalDragOver = false;
    this._externalPlaceholderItem = null;
    this.hidePlaceholder();
  }

  private announce(message: string): void {
    this._liveRegion.textContent = "";
    // Force reflow so screen readers pick up the change
    void this._liveRegion.offsetHeight;
    this._liveRegion.textContent = message;
  }

  // --- Keyboard interaction ---

  private handleKeyDown(e: KeyboardEvent): void {
    const target = e.target;
    if (!(target instanceof GridItemElement)) return;
    const itemId = target.itemId;
    if (!itemId) return;
    const item = getLayoutItem(this._layout, itemId);
    if (!item) return;

    // --- Keyboard drag mode ---
    if (this._kbDragActive && this._kbFocusedItemId === itemId) {
      e.preventDefault();
      const cols = this._gridConfig.cols;
      let newX = item.x;
      let newY = item.y;

      switch (e.key) {
        case "ArrowLeft":  newX = Math.max(0, item.x - 1); break;
        case "ArrowRight": newX = Math.min(cols - item.w, item.x + 1); break;
        case "ArrowUp":    newY = Math.max(0, item.y - 1); break;
        case "ArrowDown":  newY = item.y + 1; break;
        case "Escape":
          // Cancel: revert to old layout
          if (this._kbOldLayout) {
            this._layout = cloneLayout(this._kbOldLayout);
            this.updatePositions();
            this.announce(`Drag cancelled for item ${itemId}`);
          }
          this._kbDragActive = false;
          this._kbOldLayout = null;
          target.setAttribute("aria-grabbed", "false");
          this.hidePlaceholder();
          return;
        case "Enter":
        case " ":
          // Confirm drop
          this._kbDragActive = false;
          this._kbOldLayout = null;
          target.setAttribute("aria-grabbed", "false");
          this.hidePlaceholder();
          this.emitLayoutChange();
          this.announce(`Dropped item ${itemId} at column ${item.x}, row ${item.y}`);
          return;
        default: return;
      }

      if (newX !== item.x || newY !== item.y) {
        this._layout = moveElement(
          this._layout, item, newX, newY,
          true, this._preventCollision, this._compactType, this._gridConfig.cols
        );
        this._layout = compact(this._layout, this._compactType, this._gridConfig.cols);
        const moved = getLayoutItem(this._layout, itemId);
        if (moved) this.showPlaceholder(moved);
        this.updatePositions();
        this.announce(`Item ${itemId} moved to column ${moved?.x ?? newX}, row ${moved?.y ?? newY}`);
      }
      return;
    }

    // --- Keyboard resize mode ---
    if (this._kbResizeActive && this._kbFocusedItemId === itemId) {
      e.preventDefault();
      let newW = item.w;
      let newH = item.h;

      switch (e.key) {
        case "ArrowLeft":  newW = Math.max(item.minW ?? 1, item.w - 1); break;
        case "ArrowRight": newW = Math.min(item.maxW ?? this._gridConfig.cols, item.w + 1); break;
        case "ArrowUp":    newH = Math.max(item.minH ?? 1, item.h - 1); break;
        case "ArrowDown":  newH = item.h + 1; break;
        case "Escape":
          if (this._kbOldLayout) {
            this._layout = cloneLayout(this._kbOldLayout);
            this.updatePositions();
            this.announce(`Resize cancelled for item ${itemId}`);
          }
          this._kbResizeActive = false;
          this._kbOldLayout = null;
          this.hidePlaceholder();
          return;
        case "Enter":
        case " ":
          this._kbResizeActive = false;
          this._kbOldLayout = null;
          this.hidePlaceholder();
          this.emitLayoutChange();
          this.announce(`Resized item ${itemId} to ${item.w} columns by ${item.h} rows`);
          return;
        default: return;
      }

      if (newW !== item.w || newH !== item.h) {
        const constrained = constrainSize(item, newW, newH, this._gridConfig.cols);
        item.w = constrained.w;
        item.h = constrained.h;
        this._layout = compact(this._layout, this._compactType, this._gridConfig.cols);
        const resized = getLayoutItem(this._layout, itemId);
        if (resized) this.showPlaceholder(resized);
        this.updatePositions();
        this.announce(`Item ${itemId} resized to ${constrained.w} columns by ${constrained.h} rows`);
      }
      return;
    }

    // --- Enter drag or resize mode ---
    if (item.static) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (item.isDraggable !== false) {
        this._kbDragActive = true;
        this._kbResizeActive = false;
        this._kbFocusedItemId = itemId;
        this._kbOldLayout = cloneLayout(this._layout);
        target.setAttribute("aria-grabbed", "true");
        this.showPlaceholder(item);
        this.announce(`Grabbed item ${itemId}. Use arrow keys to move, Enter to drop, Escape to cancel`);
      }
    } else if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      if (item.isResizable !== false) {
        this._kbResizeActive = true;
        this._kbDragActive = false;
        this._kbFocusedItemId = itemId;
        this._kbOldLayout = cloneLayout(this._layout);
        this.showPlaceholder(item);
        this.announce(`Resizing item ${itemId}. Use arrow keys to resize, Enter to confirm, Escape to cancel`);
      }
    }
  }
  // --- Placeholder ---

  private showPlaceholder(item: LayoutItem): void {
    const pos = calcPosition(item, this._containerWidth, this._gridConfig);
    this._placeholder.style.transform = `translate(${pos.left}px, ${pos.top}px)`;
    this._placeholder.style.width = `${pos.width}px`;
    this._placeholder.style.height = `${pos.height}px`;
    this._placeholder.classList.remove("hidden");
  }

  private hidePlaceholder(): void {
    this._placeholder.classList.add("hidden");
  }

  // --- Events ---

  private emitDragEvent(
    type: "drag-start" | "drag" | "drag-stop",
    oldItem: LayoutItem | null,
    newItem: LayoutItem | null,
    event: PointerEvent,
    element: HTMLElement | null
  ): void {
    // Skip expensive clone for continuous "drag" events — only clone for start/stop
    const layout = type === "drag" ? this._layout : cloneLayout(this._layout);
    const detail: GridDragEvent = {
      layout,
      oldItem: oldItem ? { ...oldItem } : null,
      newItem: newItem ? { ...newItem } : null,
      placeholder: newItem ? { ...newItem } : null,
      event,
      element,
    };
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  private emitResizeEvent(
    type: "resize-start" | "resize" | "resize-stop",
    oldItem: LayoutItem | null,
    newItem: LayoutItem | null,
    event: PointerEvent,
    element: HTMLElement | null
  ): void {
    const layout = type === "resize" ? this._layout : cloneLayout(this._layout);
    const detail: GridResizeEvent = {
      layout,
      oldItem: oldItem ? { ...oldItem } : null,
      newItem: newItem ? { ...newItem } : null,
      placeholder: newItem ? { ...newItem } : null,
      event,
      element,
    };
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  private emitLayoutChange(): void {
    this.dispatchEvent(
      new CustomEvent("layout-change", {
        detail: { layout: cloneLayout(this._layout) },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("grid-layout", GridLayoutElement);
