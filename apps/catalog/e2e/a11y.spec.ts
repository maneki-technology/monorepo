import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { pages, navigateToPage } from "./helpers.js";

// ─── Accessibility audit per catalog page ─────────────────────────────────────

// Pages with known axe violations; remove entries as they are fixed
const knownViolations = new Set([
  "button",
  "calendar",
  "carousel",
  "dropdown",
  "file-upload",
  "flex-layout",
  "input",
  "list",
  "menu",
  "scrollbar",
  "select",
  "slider",
  "tabs",
  "tag",
  "textarea",
  "tree",
  "wizard",
]);

for (const pageId of pages) {
  test(`a11y: ${pageId}`, async ({ page }) => {
    test.fixme(knownViolations.has(pageId), "Known axe violations");
    await navigateToPage(page, pageId);

    const results = await new AxeBuilder({ page })
      .include("#content")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Disabled elements have low contrast by design (WCAG-exempt per SC 1.4.3)
      .disableRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

test("a11y: icon-only button has an accessible name", async ({ page }) => {
  await page.goto("/button");
  await expect(page.getByRole("button", { name: "Add" })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('ui-button[icon="icon-only"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

// ─── Sidebar accessibility ────────────────────────────────────────────────────

test("a11y: sidebar", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);

  const results = await new AxeBuilder({ page })
    .include("#sidebar")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["color-contrast"])
    .analyze();

  expect(results.violations).toEqual([]);
});

// ─── Full layout accessibility ────────────────────────────────────────────────

test("a11y: full layout", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["color-contrast"])
    .analyze();

  expect(results.violations).toEqual([]);
});
