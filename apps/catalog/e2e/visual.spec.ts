import { test, expect } from "@playwright/test";
import { pages, navigateToPage } from "./helpers.js";

// ─── Full-page visual regression per catalog page ────────────────────────────

for (const pageId of pages) {
  test(`visual: ${pageId}`, async ({ page }) => {
    await navigateToPage(page, pageId);
    const content = page.locator("#content");
    await expect(content).toHaveScreenshot(`${pageId}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
}

// ─── Sidebar visual regression ───────────────────────────────────────────────

test("visual: sidebar", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);
  const sidebar = page.locator("#sidebar");
  await expect(sidebar).toHaveScreenshot("sidebar.png", {
    maxDiffPixelRatio: 0.01,
  });
});

// ─── Full layout visual regression ───────────────────────────────────────────

test("visual: full layout", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("full-layout.png", {
    maxDiffPixelRatio: 0.01,
  });
});
