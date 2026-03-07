// --- Layout Item ---

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  isBounded?: boolean;
  moved?: boolean;
}

export type Layout = LayoutItem[];

// --- Grid Configuration ---

export interface GridConfig {
  cols: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number] | null;
  maxRows: number;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  cols: 12,
  rowHeight: 150,
  margin: [10, 10],
  containerPadding: null,
  maxRows: Infinity,
};

// --- Drag Configuration ---

export interface DragConfig {
  enabled: boolean;
  bounded: boolean;
  handle: string | null;
  cancel: string | null;
  threshold: number;
}

export const DEFAULT_DRAG_CONFIG: DragConfig = {
  enabled: true,
  bounded: false,
  handle: null,
  cancel: null,
  threshold: 3,
};

// --- Resize Configuration ---

export type ResizeHandleAxis = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne";

export interface ResizeConfig {
  enabled: boolean;
  handles: ResizeHandleAxis[];
}

export const DEFAULT_RESIZE_CONFIG: ResizeConfig = {
  enabled: true,
  handles: ["se"],
};

// --- Compaction ---

export type CompactType = "vertical" | "horizontal" | null;

// --- Position (pixel) ---

export interface Position {
  left: number;
  top: number;
  width: number;
  height: number;
}

// --- Responsive ---

export type Breakpoint = string;

export type Breakpoints<B extends string = string> = Record<B, number>;

export type ResponsiveLayouts<B extends string = string> = Partial<Record<B, Layout>>;

// --- Events ---

export interface GridDragEvent {
  layout: Layout;
  oldItem: LayoutItem | null;
  newItem: LayoutItem | null;
  placeholder: LayoutItem | null;
  event: PointerEvent;
  element: HTMLElement | null;
}

export interface GridResizeEvent {
  layout: Layout;
  oldItem: LayoutItem | null;
  newItem: LayoutItem | null;
  placeholder: LayoutItem | null;
  event: PointerEvent;
  element: HTMLElement | null;
}

export type GridLayoutEventMap = {
  "layout-change": CustomEvent<{ layout: Layout }>;
  "drag-start": CustomEvent<GridDragEvent>;
  "drag": CustomEvent<GridDragEvent>;
  "drag-stop": CustomEvent<GridDragEvent>;
  "resize-start": CustomEvent<GridResizeEvent>;
  "resize": CustomEvent<GridResizeEvent>;
  "resize-stop": CustomEvent<GridResizeEvent>;
  "external-drop": CustomEvent<ExternalDropEvent>;
};
// --- External Drop ---

export interface DroppingItem {
  i: string;
  w: number;
  h: number;
}

export interface ExternalDropEvent {
  layout: Layout;
  item: LayoutItem;
  event: DragEvent;
}

// --- Lifecycle Hooks ---

/**
 * Called before drag starts. Return false to cancel.
 */
export type BeforeDragStartHook = (
  item: LayoutItem,
  event: PointerEvent
) => boolean | void;

/**
 * Called before resize starts. Return false to cancel.
 */
export type BeforeResizeStartHook = (
  item: LayoutItem,
  axis: ResizeHandleAxis,
  event: PointerEvent
) => boolean | void;

/**
 * Called before a layout change is applied. Return a modified layout
 * or false to reject the change entirely.
 */
export type LayoutChangeFilter = (
  newLayout: Layout,
  oldLayout: Layout,
  changeSource: "drag" | "resize" | "compact" | "set"
) => Layout | false;

/**
 * Called after drag ends, before layout is finalized.
 * Return false to revert to the layout before the drag.
 */
export type AfterDropHook = (
  item: LayoutItem,
  layout: Layout,
  oldLayout: Layout,
  event: PointerEvent
) => boolean | void;
