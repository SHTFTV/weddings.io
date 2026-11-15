import {test, expect} from "@playwright/test";

const samples = [
  ["Langley, BC", "$10"], ["Vancouver, BC", "$50"],
  ["New York, NY", "$830"], ["London", "$650"], ["Mumbai", "$560"]
] as const;

test.describe("/pricing — published PPP city pricing", () => {
  test.beforeEach(async ({page}) => { await page.goto("/pricing"); });
  test("states the exclusive planner rule and the published price bounds", async ({page}) => {
    const rule = page.getByTestId("territory-rule");
    await expect(rule).toContainText(/1 exclusive planner per city/i);
    await expect(rule).toContainText(/exactly one/i);
    await expect(page.getByRole("heading", {level: 1})).toContainText(/\$10–\$2,000\/mo, PPP-adjusted/);
  });
  test("city selection updates known PPP-adjusted examples in whole-dollar USD", async ({page}) => {
    const city = page.getByLabel("Your city", {exact: true});
    for (const [name, price] of samples) {
      await city.selectOption(name);
      await expect(page.getByTestId("calc-price")).toHaveText(price);
      await expect(city).toHaveValue(name);
    }
  });
  test("each city row agrees with its displayed population and country PPP", async ({page}) => {
    const rows = page.getByTestId("city-row");
    expect(await rows.count()).toBeGreaterThan(4);
    for (const row of await rows.all()) {
      const population = Number(await row.getAttribute("data-population"));
      const ppp = Number((await row.getByRole("cell").nth(2).innerText()).match(/\d+\.\d+/)?.[0]);
      expect(Number.isFinite(ppp)).toBe(true);
      const base = Math.max(10, Math.floor(population / 100_000) * 10);
      const expected = Math.min(2_000, Math.max(10, Math.round(base * ppp / 10) * 10));
      await expect(row.getByTestId("city-price")).toHaveText(`$${expected.toLocaleString("en-US")}/mo`);
    }
  });
  test("vendor listing fee remains a separate flat annual amount", async ({page}) => {
    await expect(page.getByText(/Directory listing is \$10\/year flat, worldwide/i)).toBeVisible();
  });
});
