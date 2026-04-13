import { test, expect } from "@playwright/test";

test.describe("FLIP signature animation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("hero signature is visible on home page", async ({ page }) => {
    const hero = page.locator(".hero-accent");
    await expect(hero).toBeVisible();
    await expect(hero).toContainText("Kien Nguyen");
  });

  test("site-name is hidden on home page", async ({ page }) => {
    const siteName = page.locator(".site-name");
    // CSS: :root[data-page="home"] .site-name { opacity: 0 }
    await expect(siteName).toHaveCSS("opacity", "0");
  });

  test("forward: clone appears when navigating away from home", async ({ page }) => {
    // Click Blog nav link
    await page.click('nav a[data-route="blog"]');

    // Clone should appear briefly during animation
    const clone = page.locator("strong.sig-clone");
    await expect(clone).toBeAttached({ timeout: 500 });
  });

  test("forward: clone is removed after animation completes", async ({ page }) => {
    await page.click('nav a[data-route="blog"]');

    // Wait for animation to finish (400ms + buffer)
    await page.waitForTimeout(600);

    const clone = page.locator(".sig-clone");
    await expect(clone).not.toBeAttached();
  });

  test("forward: site-name becomes visible after animation", async ({ page }) => {
    await page.click('nav a[data-route="blog"]');
    await page.waitForTimeout(600);

    const siteName = page.locator(".site-name");
    await expect(siteName).toBeVisible();
    await expect(siteName).toHaveCSS("opacity", "1");
  });

  test("forward: data-page is cleared on non-home pages", async ({ page }) => {
    await page.click('nav a[data-route="blog"]');
    await page.waitForTimeout(600);

    const dataPage = await page.evaluate(() => document.documentElement.dataset.page);
    expect(dataPage).toBe("");
  });

  test("reverse: navigating back to home animates site-name to hero", async ({ page }) => {
    // Navigate away first
    await page.click('nav a[data-route="blog"]');
    await page.waitForTimeout(600);

    // Navigate back to home
    await page.click(".site-name");

    // Clone should appear
    const clone = page.locator(".sig-clone");
    await expect(clone).toBeAttached({ timeout: 500 });
  });

  test("reverse: hero is visible after returning to home", async ({ page }) => {
    await page.click('nav a[data-route="blog"]');
    await page.waitForTimeout(600);

    await page.click(".site-name");
    await page.waitForTimeout(600);

    const hero = page.locator(".hero-accent");
    await expect(hero).toBeVisible();
  });

  test("reverse: site-name is hidden again on home", async ({ page }) => {
    await page.click('nav a[data-route="blog"]');
    await page.waitForTimeout(600);

    await page.click(".site-name");
    await page.waitForTimeout(600);

    const siteName = page.locator(".site-name");
    await expect(siteName).toHaveCSS("opacity", "0");
  });

  test("reverse: SVG underline re-triggers draw animation", async ({ page }) => {
    await page.click('nav a[data-route="blog"]');
    await page.waitForTimeout(600);

    await page.click(".site-name");
    await page.waitForTimeout(600);

    // The SVG path should have the sig-write animation (not "none")
    const animation = await page.evaluate(() => {
      const path = document.querySelector(".hero-accent .sig-underline path") as HTMLElement;
      return path ? getComputedStyle(path).animationName : null;
    });
    expect(animation).toBe("sig-write");
  });

  test("no animation on direct URL visit to non-home page", async ({ page }) => {
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");

    // No clone should exist
    const clone = page.locator(".sig-clone");
    await expect(clone).not.toBeAttached();

    // Site-name should be visible (not home)
    const siteName = page.locator(".site-name");
    await expect(siteName).toBeVisible();
  });

  test("no animation on direct URL visit to home", async ({ page }) => {
    // Already on home from beforeEach, no clone
    const clone = page.locator(".sig-clone");
    await expect(clone).not.toBeAttached();
  });

  test("reduced motion: skips animation entirely", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.click('nav a[data-route="blog"]');
    await page.waitForTimeout(100);

    // No clone should appear
    const clone = page.locator(".sig-clone");
    await expect(clone).not.toBeAttached();

    // Site-name should still be visible (just no animation)
    await page.waitForTimeout(300);
    const siteName = page.locator(".site-name");
    await expect(siteName).toBeVisible();
  });

  test("forward: clone has correct font family", async ({ page }) => {
    // Intercept the clone before it's removed
    await page.evaluate(() => {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node instanceof HTMLElement && node.classList.contains("sig-clone")) {
              (window as unknown as Record<string, string>).__cloneFont = node.style.fontFamily;
              observer.disconnect();
            }
          }
        }
      });
      observer.observe(document.body, { childList: true });
    });

    await page.click('nav a[data-route="blog"]');
    await page.waitForTimeout(600);

    const cloneFont = await page.evaluate(() => (window as unknown as Record<string, string>).__cloneFont);
    expect(cloneFont).toContain("Homeland");
  });

  test("forward: clone position starts near hero position", async ({ page }) => {
    // Capture hero rect before navigation
    const heroRect = await page.evaluate(() => {
      const hero = document.querySelector(".hero-accent");
      if (!hero) return null;
      const r = hero.getBoundingClientRect();
      return { top: r.top, left: r.left };
    });
    expect(heroRect).not.toBeNull();

    await page.click('nav a[data-route="blog"]');

    // Wait for clone to appear and read its position
    const clonePos = await page.evaluate(() => {
      return new Promise<{ top: number; left: number } | null>((resolve) => {
        const check = () => {
          const clone = document.querySelector("strong.sig-clone") as HTMLElement;
          if (clone) {
            const r = clone.getBoundingClientRect();
            resolve({ top: r.top, left: r.left });
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
        setTimeout(() => resolve(null), 1000);
      });
    });

    expect(clonePos).not.toBeNull();
    expect(Math.abs(clonePos!.top - heroRect!.top)).toBeLessThan(5);
    expect(Math.abs(clonePos!.left - heroRect!.left)).toBeLessThan(5);
  });

  test("round trip: home → blog → home preserves layout", async ({ page }) => {
    // Capture initial hero rect
    const initialRect = await page.evaluate(() => {
      const hero = document.querySelector(".hero-accent");
      if (!hero) return null;
      const r = hero.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    });

    // Navigate away and back
    await page.click('nav a[data-route="blog"]');
    await page.waitForTimeout(600);
    await page.click(".site-name");
    await page.waitForTimeout(600);

    // Hero should be back in the same position
    const finalRect = await page.evaluate(() => {
      const hero = document.querySelector(".hero-accent");
      if (!hero) return null;
      const r = hero.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    });

    expect(finalRect).not.toBeNull();
    expect(Math.abs(finalRect!.top - initialRect!.top)).toBeLessThan(2);
    expect(Math.abs(finalRect!.left - initialRect!.left)).toBeLessThan(2);
    expect(Math.abs(finalRect!.width - initialRect!.width)).toBeLessThan(2);
  });
});
