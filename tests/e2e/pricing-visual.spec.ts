import { test, expect } from "@playwright/test";

/**
 * Visual regression + responsive readability for the /pricing page:
 * - Screenshots of the 1-territory-per-city callout and the formula/examples block.
 * - Callout + formula examples are visible and not truncated on desktop and mobile.
 * - Every city-row price uses locale-safe whole-dollar USD formatting.
 *
 * Runs across the desktop/tablet/mobile projects declared in playwright.config.ts.
 */

function expectedPrice(pop: number, ppp: number): number {
  const base = Math.max(10, Math.floor(Math.max(0, pop) / 100_000) * 10);
  return Math.min(2_000, Math.max(10, Math.round(base * ppp / 10) * 10));
}

async function isNotTruncated(locator: import("@playwright/test").Locator) {
  // Element is not clipped by overflow: horizontal scrollWidth ~= clientWidth
  // and vertical scrollHeight ~= clientHeight (allow 2px anti-alias slack).
  return locator.evaluate((el) => {
    const e = el as HTMLElement;
    return e.scrollWidth <= e.clientWidth + 2 && e.scrollHeight <= e.clientHeight + 2;
  });
}

test.describe("/pricing — visual regression + responsive readability", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
    // Wait for the calculator to hydrate so screenshots are stable.
    await expect(page.getByTestId("calc-price")).toBeVisible();
  });

  test("callout screenshot", async ({ page }, testInfo) => {
    const callout = page.getByTestId("territory-rule");
    await expect(callout).toBeVisible();
    await expect(callout).toHaveScreenshot(`callout-${testInfo.project.name}.png`);
  });

  test("city calculator screenshot", async ({ page }, testInfo) => {
    // The section immediately after the callout is the formula block.
    const formula = page.locator("section", { hasText: /City Price Calculator/i }).first();
    await expect(formula).toBeVisible();
    await expect(formula).toHaveScreenshot(`calculator-${testInfo.project.name}.png`);
  });

  test("callout and formula examples are visible and not truncated", async ({ page }) => {
    const callout = page.getByTestId("territory-rule");
    await expect(callout).toBeVisible();
    await expect(callout).toContainText(/1 exclusive planner per city/i);
    expect(await isNotTruncated(callout)).toBe(true);

    const city = page.getByLabel("Your city", {exact: true});
    await expect(city).toBeVisible();
    expect(await isNotTruncated(city)).toBe(true);
    await expect(page.getByTestId("calc-price")).toBeVisible();
  });

  test("every city-row price is locale-safe USD (commas ok, no decimals, no NBSP/junk)", async ({
    page,
  }) => {
    const rows = page.getByTestId("city-row");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Strict whole-dollar USD: leading $, comma-grouped integer, "/mo" suffix.
    const LOCALE_SAFE = /^\$(?:\d{1,3}(?:,\d{3})*|\d+)\/mo$/;

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const pop = Number(await row.getAttribute("data-population"));
      const ppp = Number((await row.getByRole("cell").nth(2).innerText()).match(/\d+\.\d+/)?.[0]);
      expect(Number.isFinite(ppp)).toBe(true);
      const cell = row.getByTestId("city-price");
      const txt = ((await cell.textContent()) ?? "").trim();

      // No non-breaking spaces or stray currency codes (USD/CAD/€…).
      expect(txt).not.toMatch(/\u00A0/);
      expect(txt).not.toMatch(/[A-Za-z]{2,}/);
      // No decimal separator (whole-dollar contract).
      expect(txt).not.toMatch(/[.,]\d{2}(?!\d)/);
      // Locale-safe shape.
      expect(txt).toMatch(LOCALE_SAFE);
      // Value matches formula.
      expect(txt).toBe(`$${expectedPrice(pop, ppp).toLocaleString("en-US")}/mo`);

    }
  });
});
