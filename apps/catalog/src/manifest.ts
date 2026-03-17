// ─── Static page manifest for sidebar (no render logic) ─────────────────────
// This is imported eagerly so the sidebar renders immediately.
// Actual page modules are lazy-loaded on navigation.

export interface PageMeta {
  id: string;
  title: string;
  section: string;
}

export const sectionOrder = [
  "Foundation",
  "Primitives",
  "Form Controls",
  "Containers",
  "Navigation",
  "Disclosure",
  "Menus & Dropdowns",
  "Overlays",
  "Tabs",
  "Data Display",
  "Calendar & Date",
  "List",
  "Layouts",
];

export const manifest: PageMeta[] = [
  // Foundation
  { id: "colors", title: "Colors", section: "Foundation" },
  { id: "spacing", title: "Spacing", section: "Foundation" },
  { id: "typography", title: "Typography", section: "Foundation" },
  { id: "elevation", title: "Elevation", section: "Foundation" },
  { id: "semantic-tokens", title: "Semantic Tokens", section: "Foundation" },
  // Primitives
  { id: "badge", title: "Badge", section: "Primitives" },
  { id: "button", title: "Button", section: "Primitives" },
  { id: "avatar", title: "Avatar", section: "Primitives" },
  { id: "alert", title: "Alert", section: "Primitives" },
  { id: "icon", title: "Icon", section: "Primitives" },
  { id: "image", title: "Image", section: "Primitives" },
  { id: "label", title: "Label", section: "Primitives" },
  { id: "link", title: "Link", section: "Primitives" },
  { id: "tag", title: "Tag", section: "Primitives" },
  // Form Controls
  { id: "checkbox", title: "Checkbox", section: "Form Controls" },
  { id: "radio", title: "Radio", section: "Form Controls" },
  { id: "input", title: "Input", section: "Form Controls" },
  { id: "textarea", title: "Textarea", section: "Form Controls" },
  { id: "file-upload", title: "File Upload", section: "Form Controls" },
  { id: "select", title: "Select", section: "Form Controls" },
  // Containers
  { id: "card", title: "Card", section: "Containers" },
  { id: "carousel", title: "Carousel", section: "Containers" },
  // Navigation
  { id: "breadcrumb", title: "Breadcrumb", section: "Navigation" },
  { id: "side-panel-menu", title: "Side Panel Menu", section: "Navigation" },
  { id: "pagination", title: "Pagination", section: "Navigation" },
  // Disclosure
  { id: "accordion", title: "Accordion", section: "Disclosure" },
  // Menus & Dropdowns
  { id: "dropdown", title: "Dropdown", section: "Menus & Dropdowns" },
  { id: "menu", title: "Menu", section: "Menus & Dropdowns" },
  // Overlays
  { id: "modal", title: "Modal", section: "Overlays" },
  { id: "popover", title: "Popover", section: "Overlays" },
  // Tabs
  { id: "tabs", title: "Tabs", section: "Tabs" },
  // Data Display
  { id: "table", title: "Table", section: "Data Display" },
  { id: "metric", title: "Metric", section: "Data Display" },
  { id: "person", title: "Person", section: "Data Display" },
  { id: "progress", title: "Progress", section: "Data Display" },
  // Calendar & Date
  { id: "calendar", title: "Calendar", section: "Calendar & Date" },
  { id: "datetime-picker", title: "Datetime Picker", section: "Calendar & Date" },
  { id: "clock", title: "Clock", section: "Calendar & Date" },
  // List
  { id: "list", title: "List", section: "List" },
  // Layouts
  { id: "grid-layout", title: "Grid Layout", section: "Layouts" },
  { id: "flex-layout", title: "Flex Layout", section: "Layouts" },
];
