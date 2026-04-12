import type { Page } from "@playwright/test";

// All catalog page IDs — must match registerPage() calls in src/pages/*.ts
export const pages = [
  // Foundation
  "colors",
  "spacing",
  "typography",
  "elevation",
  "shape",
  "semantic-tokens",
  // Components
  "badge",
  "button",
  "avatar",
  "alert",
  "icon",
  "image",
  "label",
  "link",
  "tag",
  "separator",
  "checkbox",
  "radio",
  "input",
  "textarea",
  "file-upload",
  "dropzone",
  "select",
  "queryfield",
  "search",
  "slider",
  "switch",
  "card",
  "breadcrumb",
  "accordion",
  "dropdown",
  "menu",
  "modal",
  "side-panel-menu",
  "side-panel",
  "pagination",
  "steps",
  "tree",
  "wizard",
  "tabs",
  "table",
  "metric",
  "person",
  "progress",
  "pull-to-refresh",
  "scrollbar",
  "skeleton",
  "popover",
  "tooltip",
  "carousel",
  "calendar",
  "datetime-picker",
  "clock",
  "list",
  // Layouts
  "grid-layout",
  "flex-layout",
];

export async function navigateToPage(page: Page, pageId: string) {
  await page.goto(`/#${pageId}`);
  // Wait for custom elements to upgrade + render
  await page.waitForTimeout(500);
  // Wait for any fonts to load
  await page.evaluate(() => document.fonts.ready);
}
