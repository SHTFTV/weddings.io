import { test, expect } from "@playwright/test";

/**
 * Visual regression for the Hispanic Heritage label surface.
 * Baselines are per-project (desktop / tablet / mobile) — Playwright writes them
 * on first run into __screenshots__. Later runs diff against those baselines.
 *
 * Update baselines intentionally with:  bunx playwright test --update-snapshots
 */

test.describe("Culture surface — visual regression", () => {
  test("Magazine culture grid — Mexican & Latino card region", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const card = page.getByRole("link", {name: /Mexican & Latino/i}).first();
    await expect(card).toBeVisible();
    await card.scrollIntoViewIfNeeded();
    await page.addStyleTag({content: "*, *::before, *::after { animation: none !important; transition: none !important; }"});
    await expect(card).toHaveScreenshot(`culture-card-mexican-latino-${testInfo.project.name}.png`);
  });

  test("Rotating headline — first frame with animations disabled", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }" });
    // The rotating word lives inside the hero heading — grab the h1.
    const h1 = page.getByRole("heading", { level: 1 }).first();
    await h1.scrollIntoViewIfNeeded();
    await expect(h1).toHaveScreenshot(`rotating-headline-${testInfo.project.name}.png`);
  });

  test("Footer — current magazine navigation", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; }" });
    const footer = page.locator("footer").first();
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toHaveScreenshot(`footer-${testInfo.project.name}.png`);
  });
});
