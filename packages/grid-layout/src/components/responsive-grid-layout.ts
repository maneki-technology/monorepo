import type {
  Layout,
  GridConfig,
  DragConfig,
  ResizeConfig,
  CompactType,
  Breakpoints,
  ResponsiveLayouts,
  BeforeDragStartHook,
  BeforeResizeStartHook,
  LayoutChangeFilter,
  AfterDropHook,
} from "../core/types";
import {
  DEFAULT_GRID_CONFIG,
  DEFAULT_DRAG_CONFIG,
  DEFAULT_RESIZE_CONFIG,
} from "../core/types";
import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS,
  getBreakpointFromWidth,
  findOrGenerateResponsiveLayout,
  getColsFromBreakpoint,
} from "../core/responsive";
import { cloneLayout } from "../core/utils";
import { GridLayoutElement } from "./grid-layout";

// Ensure inner grid-layout is registered
void GridLayoutElement;

const RESPONSIVE_STYLES = `
:host {
  display: block;
}
`;

export class ResponsiveGridLayoutElement extends HTMLElement {
  // --- Configuration ---
  private _breakpoints: Breakpoints = { ...DEFAULT_BREAKPOINTS };
  private _cols: Record<string, number> = { ...DEFAULT_COLS };
  private _layouts: ResponsiveLayouts = {};
  private _gridConfig: Partial<GridConfig> = {};
  private _dragConfig: Partial<DragConfig> = {};
  private _resizeConfig: Partial<ResizeConfig> = {};
  private _compactType: CompactType = "vertical";
  private _preventCollision = false;

  // --- State ---
  private _currentBreakpoint: string = "";
  private _containerWidth = 0;
  private _mounted = false;

  // --- DOM ---
  private _shadow: ShadowRoot;
  private _innerGrid!: GridLayoutElement;
  private _resizeObserver: ResizeObserver | null = null;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = RESPONSIVE_STYLES;

    this._innerGrid = document.createElement("grid-layout") as GridLayoutElement;
    // Slot child grid-items into the inner grid-layout
    const slot = document.createElement("slot");
    this._innerGrid.appendChild(slot);

    this._shadow.appendChild(style);
    this._shadow.appendChild(this._innerGrid);
  }

  // --- Public API ---

  get layouts(): ResponsiveLayouts {
    return this._layouts;
  }

  set layouts(value: ResponsiveLayouts) {
    this._layouts = { ...value };
    if (this._mounted && this._currentBreakpoint) {
      // Force-apply layout for current breakpoint (bypass onWidthChange early-return guard)
      const cols = getColsFromBreakpoint(this._currentBreakpoint, this._cols);
      const newLayout = findOrGenerateResponsiveLayout(
        this._layouts,
        this._breakpoints,
        this._currentBreakpoint,
        cols,
        this._compactType
      );
      this._layouts[this._currentBreakpoint] = cloneLayout(newLayout);
      this.syncInnerGridConfig(cols);
      this._innerGrid.layout = newLayout;
    }
  }

  get breakpoints(): Breakpoints {
    return { ...this._breakpoints };
  }

  set breakpoints(value: Breakpoints) {
    this._breakpoints = { ...value };
    if (this._mounted) {
      this.onWidthChange(this._containerWidth);
    }
  }

  get cols(): Record<string, number> {
    return { ...this._cols };
  }

  set cols(value: Record<string, number>) {
    this._cols = { ...value };
    if (this._mounted && this._currentBreakpoint) {
      this.onWidthChange(this._containerWidth);
    }
  }

  get gridConfig(): Partial<GridConfig> {
    return { ...this._gridConfig };
  }

  set gridConfig(value: Partial<GridConfig>) {
    this._gridConfig = { ...value };
    this.syncInnerGridConfig();
  }

  get dragConfig(): Partial<DragConfig> {
    return { ...this._dragConfig };
  }

  set dragConfig(value: Partial<DragConfig>) {
    this._dragConfig = { ...value };
    this._innerGrid.dragConfig = { ...DEFAULT_DRAG_CONFIG, ...value };
  }

  get resizeConfig(): Partial<ResizeConfig> {
    return { ...this._resizeConfig };
  }

  set resizeConfig(value: Partial<ResizeConfig>) {
    this._resizeConfig = { ...value };
    this._innerGrid.resizeConfig = { ...DEFAULT_RESIZE_CONFIG, ...value };
  }

  get compactType(): CompactType {
    return this._compactType;
  }

  set compactType(value: CompactType) {
    this._compactType = value;
    this._innerGrid.compactType = value;
  }

  get preventCollision(): boolean {
    return this._preventCollision;
  }

  set preventCollision(value: boolean) {
    this._preventCollision = value;
    this._innerGrid.preventCollision = value;
  }

  /** Current active breakpoint name */
  get currentBreakpoint(): string {
    return this._currentBreakpoint;
  }

  /** Current layout (from inner grid) */
  get layout(): Layout {
    return this._innerGrid.layout;
  }

  /** Forward lifecycle hooks to inner grid */
  get beforeDragStart(): BeforeDragStartHook | null { return this._innerGrid.beforeDragStart; }
  set beforeDragStart(fn: BeforeDragStartHook | null) { this._innerGrid.beforeDragStart = fn; }
  get beforeResizeStart(): BeforeResizeStartHook | null { return this._innerGrid.beforeResizeStart; }
  set beforeResizeStart(fn: BeforeResizeStartHook | null) { this._innerGrid.beforeResizeStart = fn; }
  get layoutChangeFilter(): LayoutChangeFilter | null { return this._innerGrid.layoutChangeFilter; }
  set layoutChangeFilter(fn: LayoutChangeFilter | null) { this._innerGrid.layoutChangeFilter = fn; }
  get afterDrop(): AfterDropHook | null { return this._innerGrid.afterDrop; }
  set afterDrop(fn: AfterDropHook | null) { this._innerGrid.afterDrop = fn; }

  // --- Lifecycle ---

  connectedCallback(): void {
    this._mounted = true;

    // Forward layout-change from inner grid to store per-breakpoint
    this._innerGrid.addEventListener("layout-change", this._onInnerLayoutChange);

    // Forward all drag/resize events
    for (const evt of ["drag-start", "drag", "drag-stop", "resize-start", "resize", "resize-stop", "external-drop"] as const) {
      this._innerGrid.addEventListener(evt, this._forwardEvent);
    }

    // Observe own width for breakpoint detection
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0 && width !== this._containerWidth) {
          this._containerWidth = width;
          this.onWidthChange(width);
        }
      }
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    this._mounted = false;
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;

    this._innerGrid.removeEventListener("layout-change", this._onInnerLayoutChange);
    for (const evt of ["drag-start", "drag", "drag-stop", "resize-start", "resize", "resize-stop", "external-drop"] as const) {
      this._innerGrid.removeEventListener(evt, this._forwardEvent);
    }
  }

  // --- Breakpoint logic ---

  private onWidthChange(width: number): void {
    const newBreakpoint = getBreakpointFromWidth(this._breakpoints, width);
    const breakpointChanged = newBreakpoint !== this._currentBreakpoint;

    if (!breakpointChanged && this._currentBreakpoint) return;

    const oldBreakpoint = this._currentBreakpoint;
    this._currentBreakpoint = newBreakpoint;

    // Get column count for this breakpoint
    const newCols = getColsFromBreakpoint(newBreakpoint, this._cols);

    // Find or generate layout for this breakpoint
    const newLayout = findOrGenerateResponsiveLayout(
      this._layouts,
      this._breakpoints,
      newBreakpoint,
      newCols,
      this._compactType
    );

    // Store generated layout
    this._layouts[newBreakpoint] = cloneLayout(newLayout);

    // Update inner grid config with new column count
    this.syncInnerGridConfig(newCols);

    // Apply layout to inner grid
    this._innerGrid.layout = newLayout;

    // Emit breakpoint-change
    if (breakpointChanged) {
      this.dispatchEvent(
        new CustomEvent("breakpoint-change", {
          detail: {
            breakpoint: newBreakpoint,
            oldBreakpoint,
            cols: newCols,
          },
          bubbles: true,
          composed: true,
        })
      );
    }

    // Emit layout-change with all layouts
    this.dispatchEvent(
      new CustomEvent("layout-change", {
        detail: {
          layout: cloneLayout(newLayout),
          layouts: { ...this._layouts },
          breakpoint: newBreakpoint,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private syncInnerGridConfig(colsOverride?: number): void {
    const cols = colsOverride ?? (this._currentBreakpoint
      ? getColsFromBreakpoint(this._currentBreakpoint, this._cols)
      : DEFAULT_GRID_CONFIG.cols);

    this._innerGrid.gridConfig = {
      ...DEFAULT_GRID_CONFIG,
      ...this._gridConfig,
      cols,
    };
  }

  // --- Event forwarding ---

  private _onInnerLayoutChange = (e: Event): void => {
    e.stopPropagation(); // Prevent inner event from bubbling past us

    if (!this._currentBreakpoint) return;

    const detail = (e as CustomEvent).detail;
    const currentLayout: Layout = detail.layout;

    // Store updated layout for current breakpoint
    this._layouts[this._currentBreakpoint] = cloneLayout(currentLayout);

    // Re-emit with responsive context
    this.dispatchEvent(
      new CustomEvent("layout-change", {
        detail: {
          layout: cloneLayout(currentLayout),
          layouts: { ...this._layouts },
          breakpoint: this._currentBreakpoint,
        },
        bubbles: true,
        composed: true,
      })
    );
  };

  private _forwardEvent = (e: Event): void => {
    e.stopPropagation();
    const ce = e as CustomEvent;
    this.dispatchEvent(
      new CustomEvent(ce.type, {
        detail: ce.detail,
        bubbles: true,
        composed: true,
      })
    );
  };
}

customElements.define("responsive-grid-layout", ResponsiveGridLayoutElement);
