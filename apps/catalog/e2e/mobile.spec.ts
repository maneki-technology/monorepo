import { test, expect } from "@playwright/test";
import { navigateToPage } from "./helpers.js";

// Mobile-only tests — skip on desktop project
test.skip(({ browserName }, testInfo) => testInfo.project.name === "chromium", "mobile only");

// ─── Sidebar auto-collapses on mobile ───────────────────────────────────

test("mobile: sidebar auto-collapses", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);
  const sidebar = page.locator("#sidebar");
  await expect(sidebar).toHaveAttribute("state", "collapsed");
});

// ─── Floating trigger expands sidebar, header toggle collapses ──────────

test("mobile: trigger expands and toggle collapses sidebar", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);

  const sidebar = page.locator("#sidebar");
  await expect(sidebar).toHaveAttribute("state", "collapsed");

  // Click the floating trigger to expand
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  await page.waitForTimeout(300);
  await expect(sidebar).toHaveAttribute("state", "expanded");

  // Click the header collapse toggle to close
  const collapseBtn = page.getByRole("button", { name: "Collapse panel" });
  await collapseBtn.click();
  await page.waitForTimeout(300);
  await expect(sidebar).toHaveAttribute("state", "collapsed");
});

// ─── Mobile visual: collapsed sidebar ───────────────────────────────────

test("mobile visual: sidebar collapsed", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveScreenshot("mobile-sidebar-collapsed.png", {
    maxDiffPixelRatio: 0.01,
  });
});

// ─── Mobile visual: expanded sidebar overlay ────────────────────────────

test("mobile visual: sidebar expanded", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);

  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  await page.waitForTimeout(300);

  await expect(page).toHaveScreenshot("mobile-sidebar-expanded.png", {
    maxDiffPixelRatio: 0.01,
  });
});

// ─── Mobile visual: content page ────────────────────────────────────────

test("mobile visual: content page", async ({ page }) => {
  await navigateToPage(page, "button");
  const content = page.locator("#content");
  await expect(content).toHaveScreenshot("mobile-content-button.png", {
    maxDiffPixelRatio: 0.01,
  });
});
