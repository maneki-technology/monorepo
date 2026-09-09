import { expect, test } from "@playwright/test";

for (const source of ["blog", "photography"]) {
  test(`signature preserves its size and lands in the final layout from ${source}`, async ({ page }) => {
    await page.goto(`/${source}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    const sourceWidth = await page.locator(".site-name").evaluate((el) => el.getBoundingClientRect().width);
    await page.evaluate(() => {
      const observer = new MutationObserver(() => {
        const clone = document.querySelector(".sig-clone");
        if (!clone) return;
        for (const animation of clone.getAnimations()) {
          animation.pause();
          animation.currentTime = 0;
        }
        observer.disconnect();
      });
      observer.observe(document.body, { childList: true });
    });

    await page.locator(".site-name").click();
    const clone = page.locator(".sig-clone");
    await expect(clone).toBeAttached();
    const startWidth = await clone.evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.abs(startWidth - sourceWidth)).toBeLessThan(1);
    const destination = await page.locator(".hero-accent").boundingBox();
    await clone.evaluate((el) => el.getAnimations().forEach((animation) => animation.finish()));
    await expect(clone).not.toBeAttached();
    // Observe beyond the old delayed layout transition to catch a moving destination.
    await page.waitForTimeout(500);
    const landed = await page.locator(".hero-accent").boundingBox();
    expect(destination).not.toBeNull();
    expect(landed).not.toBeNull();
    if (destination && landed) {
      expect(Math.abs(landed.x - destination.x)).toBeLessThan(1);
      expect(Math.abs(landed.width - destination.width)).toBeLessThan(1);
    }
    await expect(page.locator(".hero-accent")).toHaveCSS("opacity", "1");
    await expect(page.locator(".site-name")).toHaveCSS("opacity", "0");
  });
}

test("reduced motion applies photography and home layout without a clone", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('nav a[data-route="photography"]').click();
  await expect(page.locator("body")).toHaveClass(/wide-layout/);
  await expect(page.locator(".sig-clone")).toHaveCount(0);
  await page.locator(".site-name").click();
  await expect(page.locator("body")).not.toHaveClass(/wide-layout/);
  await expect(page.locator(".hero-accent")).toHaveCSS("opacity", "1");
  await expect(page.locator(".sig-clone")).toHaveCount(0);
});

test("home to photography lands at the final header size without a second jump", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    new MutationObserver((_, observer) => {
      const clone = document.querySelector(".sig-clone");
      if (!clone) return;
      clone.getAnimations().forEach((animation) => {
        animation.pause();
        animation.currentTime = 399;
      });
      observer.disconnect();
    }).observe(document.body, { childList: true });
  });
  await page.locator('nav a[data-route="photography"]').click();
  const clone = page.locator(".sig-clone");
  await expect(clone).toBeAttached();
  const flight = await clone.boundingBox();
  const target = await page.locator(".site-name").boundingBox();
  expect(flight).not.toBeNull();
  expect(target).not.toBeNull();
  if (flight && target) {
    expect(Math.abs(flight.x - target.x)).toBeLessThan(1);
    expect(Math.abs(flight.y - target.y)).toBeLessThan(1);
    expect(Math.abs(flight.width - target.width)).toBeLessThan(1);
  }
  await clone.evaluate((el) => el.getAnimations().forEach((animation) => animation.finish()));
  await expect(clone).not.toBeAttached();
  await page.waitForTimeout(500);
  expect(await page.locator(".site-name").boundingBox()).toEqual(target);
});

test("a new navigation cancels the previous signature and layout changes", async ({ page }) => {
  await page.goto("/");
  await page.locator('nav a[data-route="photography"]').click();
  await expect(page.locator(".sig-clone")).toBeAttached();
  await page.locator('nav a[data-route="blog"]').click();
  await expect(page.locator("h1")).toHaveText("Blog");
  await page.waitForTimeout(600);
  await expect(page.locator("body")).not.toHaveClass(/wide-layout/);
  await expect(page.locator(".sig-clone")).toHaveCount(0);
  await expect(page.locator(".site-name")).toBeVisible();
  await expect(page.locator(".site-name")).toHaveCSS("opacity", "1");
});

for (const [from, to] of [
  ["home", "blog"],
  ["home", "photography"],
  ["blog", "home"],
  ["photography", "home"],
]) {
  test(`stroke follows signature scaling from ${from} to ${to}`, async ({ page }) => {
    await page.goto(from === "home" ? "/" : `/${from}`);
    await page.waitForLoadState("networkidle");
    const source = await page.locator(from === "home" ? ".hero-accent" : ".site-name").evaluate((el) => {
      const style = getComputedStyle(el);
      const scale = new DOMMatrixReadOnly(style.transform).a;
      return { font: parseFloat(style.fontSize) * scale, stroke: parseFloat(style.webkitTextStrokeWidth) * scale };
    });
    await page.evaluate(() => {
      new MutationObserver((_, observer) => {
        const clone = document.querySelector(".sig-clone");
        if (!clone) return;
        clone.getAnimations().forEach((animation) => {
          animation.pause();
          animation.currentTime = 0;
        });
        observer.disconnect();
      }).observe(document.body, { childList: true });
    });
    await page.locator(to === "home" ? ".site-name" : `nav a[data-route="${to}"]`).click();
    const clone = page.locator(".sig-clone");
    await expect(clone).toBeAttached();
    const target = await page.locator(to === "home" ? ".hero-accent" : ".site-name").evaluate((el) => {
      const style = getComputedStyle(el);
      const scale = new DOMMatrixReadOnly(style.transform).a;
      return { font: parseFloat(style.fontSize) * scale, stroke: parseFloat(style.webkitTextStrokeWidth) * scale };
    });
    for (const time of [0, 100, 200, 300, 399]) {
      const actual = await clone.evaluate(async (el, time) => {
        el.getAnimations().forEach((animation) => {
          animation.currentTime = time;
        });
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        const style = getComputedStyle(el);
        return { font: parseFloat(style.fontSize), stroke: parseFloat(style.webkitTextStrokeWidth) };
      }, time);
      const progress = (actual.font - source.font) / (target.font - source.font);
      expect(actual.stroke).toBeCloseTo(source.stroke + (target.stroke - source.stroke) * progress, 2);
    }
    await clone.evaluate((el) => el.getAnimations().forEach((animation) => animation.finish()));
    await expect(clone).toHaveCount(0);
  });
}
