import { test, expect } from "@playwright/test";
import { navigateToPage } from "./helpers.js";

// Mobile-only tests — skip on desktop project
test.skip(({ browserName }, testInfo) => testInfo.project.name === "chromium", "mobile only");

// ─── Hamburger menu visibility ────────────────────────────────────────────

test("mobile: hamburger toggle visible", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);
  const toggle = page.locator("#nav-toggle");
  await expect(toggle).toBeVisible();
});

// ─── Sidebar opens on toggle click ────────────────────────────────────────

test("mobile: sidebar opens and closes", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);

  const toggle = page.locator("#nav-toggle");
  const nav = page.locator("#app > nav");
  const overlay = page.locator("#sidebar-overlay");

  // Sidebar should be off-screen initially
  await expect(nav).not.toHaveClass(/open/);

  // Open sidebar
  await toggle.click();
  await expect(nav).toHaveClass(/open/);
  await expect(overlay).toHaveClass(/visible/);

  // Close via overlay
  await overlay.click();
  await expect(nav).not.toHaveClass(/open/);
});

// ─── Navigation closes sidebar on mobile ──────────────────────────────────

test("mobile: nav closes on page select", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);

  const toggle = page.locator("#nav-toggle");
  const nav = page.locator("#app > nav");

  // Open sidebar and click a page
  await toggle.click();
  await expect(nav).toHaveClass(/open/);

  const firstItem = page.locator("ui-side-panel-menu-item[data-page]").first();
  await firstItem.click();
  await page.waitForTimeout(300);

  // Sidebar should close after navigation
  await expect(nav).not.toHaveClass(/open/);
});

// ─── Mobile visual: open sidebar ──────────────────────────────────────────

test("mobile visual: sidebar open", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);

  await page.locator("#nav-toggle").click();
  await page.waitForTimeout(300);

  await expect(page).toHaveScreenshot("mobile-sidebar-open.png", {
    maxDiffPixelRatio: 0.01,
  });
});

// ─── Mobile visual: content page ──────────────────────────────────────────

test("mobile visual: content page", async ({ page }) => {
  await navigateToPage(page, "button");
  const content = page.locator("#content");
  await expect(content).toHaveScreenshot("mobile-content-button.png", {
    maxDiffPixelRatio: 0.01,
  });
});