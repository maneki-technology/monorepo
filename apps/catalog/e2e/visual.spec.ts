import { test, expect } from "@playwright/test";

// All catalog page IDs — must match registerPage() calls in src/pages/*.ts
const pages = [
  // Foundation
  "colors",
  "spacing",
  "typography",
  "elevation",
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
  "checkbox",
  "radio",
  "input",
  "textarea",
  "file-upload",
  "select",
  "card",
  "breadcrumb",
  "accordion",
  "dropdown",
  "menu",
  "modal",
  "side-panel-menu",
  "tabs",
  "table",
  "carousel",
  "calendar",
  "datetime-picker",
  "clock",
  "list",
  // Layouts
  "grid-layout",
  "flex-layout",
];

async function navigateToPage(page: import("@playwright/test").Page, pageId: string) {
  await page.goto(`/#${pageId}`);
  // Wait for custom elements to upgrade + render
  await page.waitForTimeout(500);
  // Wait for any fonts to load
  await page.evaluate(() => document.fonts.ready);
}

// ─── Full-page visual regression per catalog page ────────────────────────────

for (const pageId of pages) {
  test(`visual: ${pageId}`, async ({ page }) => {
    await navigateToPage(page, pageId);
    const content = page.locator("#content");
    await expect(content).toHaveScreenshot(`${pageId}.png`, {
      fullPage: false,
      animations: "disabled",
    });
  });
}

// ─── Sidebar navigation ─────────────────────────────────────────────────────

test("visual: sidebar", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  const sidebar = page.locator("#sidebar");
  await expect(sidebar).toHaveScreenshot("sidebar.png");
});

// ─── Full app layout ─────────────────────────────────────────────────────────

test("visual: full layout", async ({ page }) => {
  await navigateToPage(page, "button");
  await expect(page).toHaveScreenshot("full-layout.png");
});
