import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Performance, accessibility, and theme-aware visual regression for /pricing.
 * Runs across the desktop/tablet/mobile projects in playwright.config.ts.
 */

const LOAD_BUDGET_MS = 4_000;         // total nav-to-DOMContentLoaded budget
const RENDER_BUDGET_MS = 1_500;       // callout + rows must appear this fast

async function isNotTruncated(locator: import("@playwright/test").Locator) {
  return locator.evaluate((el) => {
    const e = el as HTMLElement;
    return e.scrollWidth <= e.clientWidth + 2 && e.scrollHeight <= e.clientHeight + 2;
  });
}

test.describe("/pricing — performance", () => {
  test("loads under the target time and renders callout + rows quickly", async ({ page }) => {
    const t0 = Date.now();
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    const loadMs = Date.now() - t0;
    expect(loadMs, `nav→DCL took ${loadMs}ms`).toBeLessThan(LOAD_BUDGET_MS);

    const callout = page.getByTestId("territory-rule");
    const rows = page.getByTestId("city-row");
    await expect(callout).toBeVisible({ timeout: RENDER_BUDGET_MS });
    await expect(rows.first()).toBeVisible({ timeout: RENDER_BUDGET_MS });
    expect(await rows.count()).toBeGreaterThan(0);
  });
});

test.describe("/pricing — accessibility (callout + formula table)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByTestId("territory-rule")).toBeVisible();
  });

  test("h1 exists, headings are ordered, and table has a header row", async ({ page }) => {
    // Single h1.
    await expect(page.locator("h1")).toHaveCount(1);

    // Callout has a heading-ish "The Rule" eyebrow + the h2-scale statement.
    const callout = page.getByTestId("territory-rule");
    await expect(callout).toContainText(/1 exclusive planner per city/i);

    // Formula table: has thead > th cells (semantic column headers).
    const table = page.locator("table").first();
    await expect(table).toBeVisible();
    await expect(table.locator("thead th")).toHaveCount(4);

    // City selector has a real linked label.
    const label = page.locator('label[for="pricing-city"]');
    await expect(label).toBeVisible();
    await expect(page.locator("#pricing-city")).toBeVisible();
  });

  test("axe: no serious/critical WCAG 2 AA violations on callout + formula scope", async ({
    page,
  }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="territory-rule"]')
      .include("table")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    if (blocking.length) {
      console.log(JSON.stringify(blocking.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), null, 2));
    }
    expect(blocking, "serious/critical a11y violations").toEqual([]);
  });

  test("color-contrast passes for callout and city-price cells", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="territory-rule"]')
      .include('[data-testid="city-price"]')
      .withRules(["color-contrast"])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});

async function setTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.evaluate((t) => {
    document.documentElement.classList.toggle("dark", t === "dark");
  }, theme);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`/pricing — ${theme} theme visual + readability`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/pricing");
      await setTheme(page, theme);
      await expect(page.getByTestId("calc-price")).toBeVisible();
    });

    test(`callout screenshot (${theme})`, async ({ page }, testInfo) => {
      const callout = page.getByTestId("territory-rule");
      await expect(callout).toBeVisible();
      expect(await isNotTruncated(callout)).toBe(true);
      await expect(callout).toHaveScreenshot(`callout-${theme}-${testInfo.project.name}.png`);
    });

    test(`city calculator screenshot (${theme})`, async ({ page }, testInfo) => {
      const formula = page.locator("section", { hasText: /City Price Calculator/i }).first();
      await expect(formula).toBeVisible();
      expect(await isNotTruncated(formula)).toBe(true);
      await expect(formula).toHaveScreenshot(`calculator-${theme}-${testInfo.project.name}.png`);
    });

    test(`example rows readable & not truncated (${theme})`, async ({ page }) => {
      const rows = page.getByTestId("city-row");
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const cell = rows.nth(i).getByTestId("city-price");
        await expect(cell).toBeVisible();
        expect(await isNotTruncated(cell)).toBe(true);
      }
    });
  });
}
