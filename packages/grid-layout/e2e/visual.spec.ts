import { test, expect } from "@playwright/test";

const FIXTURES_URL = "/e2e/fixtures.html";

async function waitForReady(page: import("@playwright/test").Page) {
  await page.goto(FIXTURES_URL);
  await page.waitForSelector("[data-ready='true']", { timeout: 10000 });
  // Let layout settle
  await page.waitForTimeout(300);
}

// ─── Static Rendering ───────────────────────────────────────────────

test.describe("grid rendering", () => {
  test("basic 6-item vertical grid", async ({ page }) => {
    await waitForReady(page);
    const fixture = page.locator("#fixture-basic");
    await expect(fixture).toHaveScreenshot("basic-grid.png");
  });

  test("horizontal compact grid", async ({ page }) => {
    await waitForReady(page);
    const fixture = page.locator("#fixture-horizontal");
    await expect(fixture).toHaveScreenshot("horizontal-compact.png");
  });

  test("no compaction (free placement)", async ({ page }) => {
    await waitForReady(page);
    const fixture = page.locator("#fixture-none");
    await expect(fixture).toHaveScreenshot("no-compact.png");
  });

  test("static items", async ({ page }) => {
    await waitForReady(page);
    const fixture = page.locator("#fixture-static");
    await expect(fixture).toHaveScreenshot("static-items.png");
  });

  test("dense 20-item grid", async ({ page }) => {
    await waitForReady(page);
    const fixture = page.locator("#fixture-dense");
    await expect(fixture).toHaveScreenshot("dense-grid.png");
  });

  test("full page with all fixtures", async ({ page }) => {
    await waitForReady(page);
    await expect(page).toHaveScreenshot("all-fixtures.png", { fullPage: true });
  });
});

// ─── Responsive ─────────────────────────────────────────────────────

test.describe("responsive grid", () => {
  test("desktop layout (1200px)", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await waitForReady(page);
    const fixture = page.locator("#fixture-responsive");
    await expect(fixture).toHaveScreenshot("responsive-desktop.png");
  });

  test("tablet layout (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await waitForReady(page);
    const fixture = page.locator("#fixture-responsive");
    await expect(fixture).toHaveScreenshot("responsive-tablet.png");
  });

  test("mobile layout (480px)", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await waitForReady(page);
    const fixture = page.locator("#fixture-responsive");
    await expect(fixture).toHaveScreenshot("responsive-mobile.png");
  });
});

// ─── Drag Interaction ───────────────────────────────────────────────

test.describe("drag interaction", () => {
  test("drag item to new position", async ({ page }) => {
    await waitForReady(page);
    const fixture = page.locator("#fixture-drag");
    await expect(fixture).toHaveScreenshot("drag-before.png");

    // Drag first item (d1) to the right
    const grid = page.locator("#grid-drag");
    const item = grid.locator('grid-item[item-id="d1"]');
    const box = await item.boundingBox();
    if (!box) throw new Error("Item not found");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // Move right by ~200px (roughly 4 grid columns)
    await page.mouse.move(box.x + box.width / 2 + 200, box.y + box.height / 2, { steps: 10 });
    await page.waitForTimeout(100);

    // Screenshot during drag (should show placeholder)
    await expect(fixture).toHaveScreenshot("drag-during.png");

    await page.mouse.up();
    await page.waitForTimeout(300);

    // Screenshot after drop
    await expect(fixture).toHaveScreenshot("drag-after.png");
  });

  test("drag item downward causes compaction", async ({ page }) => {
    await waitForReady(page);
    const grid = page.locator("#grid-drag");
    const item = grid.locator('grid-item[item-id="d1"]');
    const box = await item.boundingBox();
    if (!box) throw new Error("Item not found");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 150, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const fixture = page.locator("#fixture-drag");
    await expect(fixture).toHaveScreenshot("drag-down-compact.png");
  });
});

// ─── Resize Interaction ─────────────────────────────────────────────

test.describe("resize interaction", () => {
  test("resize item wider", async ({ page }) => {
    await waitForReady(page);
    const fixture = page.locator("#fixture-resize");
    await expect(fixture).toHaveScreenshot("resize-before.png");

    // Find the SE resize handle inside grid-item shadow DOM
    const grid = page.locator("#grid-resize");
    const item = grid.locator('grid-item[item-id="rz1"]');
    const box = await item.boundingBox();
    if (!box) throw new Error("Item not found");

    // SE handle is at bottom-right corner
    const handleX = box.x + box.width - 5;
    const handleY = box.y + box.height - 5;

    await page.mouse.move(handleX, handleY);
    await page.mouse.down();
    await page.mouse.move(handleX + 150, handleY, { steps: 10 });
    await page.waitForTimeout(100);

    await expect(fixture).toHaveScreenshot("resize-during.png");

    await page.mouse.up();
    await page.waitForTimeout(300);

    await expect(fixture).toHaveScreenshot("resize-after.png");
  });

  test("resize item taller pushes items down", async ({ page }) => {
    await waitForReady(page);
    const grid = page.locator("#grid-resize");
    const item = grid.locator('grid-item[item-id="rz1"]');
    const box = await item.boundingBox();
    if (!box) throw new Error("Item not found");

    const handleX = box.x + box.width - 5;
    const handleY = box.y + box.height - 5;

    await page.mouse.move(handleX, handleY);
    await page.mouse.down();
    await page.mouse.move(handleX, handleY + 120, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const fixture = page.locator("#fixture-resize");
    await expect(fixture).toHaveScreenshot("resize-taller.png");
  });
});

// ─── Layout Changes ─────────────────────────────────────────────────

test.describe("dynamic layout changes", () => {
  test("programmatic layout update", async ({ page }) => {
    await waitForReady(page);
    const fixture = page.locator("#fixture-basic");
    await expect(fixture).toHaveScreenshot("layout-change-before.png");

    // Swap items A and F via JS
    await page.evaluate(() => {
      const grid = document.getElementById("grid-basic") as any;
      const layout = grid.layout.map((item: any) => ({ ...item }));
      const a = layout.find((l: any) => l.i === "a");
      const f = layout.find((l: any) => l.i === "f");
      if (a && f) {
        const tmpX = a.x, tmpY = a.y;
        a.x = f.x; a.y = f.y;
        f.x = tmpX; f.y = tmpY;
      }
      grid.layout = layout;
    });
    await page.waitForTimeout(300);

    await expect(fixture).toHaveScreenshot("layout-change-after.png");
  });

  test("change compact type from vertical to horizontal", async ({ page }) => {
    await waitForReady(page);

    await page.evaluate(() => {
      const grid = document.getElementById("grid-basic") as any;
      grid.compactType = "horizontal";
    });
    await page.waitForTimeout(300);

    const fixture = page.locator("#fixture-basic");
    await expect(fixture).toHaveScreenshot("compact-type-switch.png");
  });

  test("change column count", async ({ page }) => {
    await waitForReady(page);

    await page.evaluate(() => {
      const grid = document.getElementById("grid-basic") as any;
      grid.gridConfig = { cols: 6, rowHeight: 50, margin: [8, 8], containerPadding: [8, 8] };
    });
    await page.waitForTimeout(300);

    const fixture = page.locator("#fixture-basic");
    await expect(fixture).toHaveScreenshot("cols-change-6.png");
  });
});

// ─── Keyboard Drag ─────────────────────────────────────────────────

test.describe("keyboard drag interaction", () => {
  test("focus ring visible on focused item", async ({ page }) => {
    await waitForReady(page);
    const grid = page.locator("#grid-keyboard");
    const item = grid.locator('grid-item[item-id="kb1"]');
    await item.focus();
    const fixture = page.locator("#fixture-keyboard");
    await expect(fixture).toHaveScreenshot("keyboard-focus-ring.png");
  });

  test("keyboard drag shows placeholder and moves item", async ({ page }) => {
    await waitForReady(page);
    const grid = page.locator("#grid-keyboard");
    const item = grid.locator('grid-item[item-id="kb1"]');
    await item.focus();

    // Start drag with Enter
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const fixture = page.locator("#fixture-keyboard");
    await expect(fixture).toHaveScreenshot("keyboard-drag-started.png");

    // Move right twice
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
    await expect(fixture).toHaveScreenshot("keyboard-drag-moved.png");

    // Confirm with Enter
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    await expect(fixture).toHaveScreenshot("keyboard-drag-confirmed.png");
  });

  test("keyboard drag cancel reverts position", async ({ page }) => {
    await waitForReady(page);
    const fixture = page.locator("#fixture-keyboard");
    await expect(fixture).toHaveScreenshot("keyboard-before-cancel.png");

    const grid = page.locator("#grid-keyboard");
    const item = grid.locator('grid-item[item-id="kb1"]');
    await item.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    await expect(fixture).toHaveScreenshot("keyboard-drag-cancelled.png");
  });

  test("keyboard resize increases width", async ({ page }) => {
    await waitForReady(page);
    const grid = page.locator("#grid-keyboard");
    const item = grid.locator('grid-item[item-id="kb1"]');
    await item.focus();

    // Start resize with R
    await page.keyboard.press("r");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
    const fixture = page.locator("#fixture-keyboard");
    await expect(fixture).toHaveScreenshot("keyboard-resize-wider.png");

    // Confirm
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    await expect(fixture).toHaveScreenshot("keyboard-resize-confirmed.png");
  });
});

// ─── External Drop ─────────────────────────────────────────────────

test.describe("external drag-and-drop", () => {
  test("external drop adds item to grid", async ({ page }) => {
    await waitForReady(page);
    const fixture = page.locator("#fixture-external-drop");
    await expect(fixture).toHaveScreenshot("external-drop-before.png");

    const grid = page.locator("#grid-external");
    const dragSource = page.locator("#drag-source");
    const gridBox = await grid.boundingBox();
    const srcBox = await dragSource.boundingBox();
    if (!gridBox || !srcBox) throw new Error("Elements not found");

    // Drag from source into the grid (right half, empty area)
    const dropX = gridBox.x + gridBox.width * 0.6;
    const dropY = gridBox.y + 30;

    await dragSource.hover();
    await page.mouse.down();
    await page.mouse.move(dropX, dropY, { steps: 15 });
    await page.waitForTimeout(200);

    // Screenshot during drag — should show placeholder
    await expect(fixture).toHaveScreenshot("external-drop-during.png");

    await page.mouse.up();
    await page.waitForTimeout(300);

    // Screenshot after drop — new item should be in grid
    await expect(fixture).toHaveScreenshot("external-drop-after.png");
  });
});
