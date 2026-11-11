import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * A11y sweep for the culture surface — CultureFeatures grid on the homepage,
 * the rotating headline, footer, /cultures/ index, and /tools/ index.
 * Uses axe-core (WCAG 2.1 AA rules): fails on any violation of:
 *   • aria-* rules (missing labels, invalid roles)
 *   • color-contrast
 *   • heading-order + landmark rules (page-has-heading-one, region, landmark-*)
 */
const RULES = [
  "aria-allowed-attr",
  "aria-allowed-role",
  "aria-required-attr",
  "aria-required-children",
  "aria-required-parent",
  "aria-valid-attr",
  "aria-valid-attr-value",
  "aria-hidden-body",
  "aria-hidden-focus",
  "button-name",
  "link-name",
  "image-alt",
  "color-contrast",
  "heading-order",
  "page-has-heading-one",
  "region",
  "landmark-one-main",
  "landmark-unique",
];

async function scan(page: any, url: string) {
  await page.goto(url, { waitUntil: "networkidle" });
  // Let the rotating headline settle so screenshots + a11y see stable DOM.
  await page.waitForTimeout(400);
  const results = await new AxeBuilder({ page }).withRules(RULES).analyze();
  return results.violations;
}

for (const path of ["/", "/cultures/", "/tools/"]) {
  test(`a11y — ${path} has no critical WCAG AA violations`, async ({ page }) => {
    const violations = await scan(page, path);
    // Print concise details on failure to speed triage
    if (violations.length) {
      console.log(
        violations.map((v) => `  ✗ [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`).join("\n"),
      );
    }
    expect(violations, `${violations.length} a11y violations on ${path}`).toEqual([]);
  });
}

test("magazine culture card links to its Mexican and Latino guide", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Mexican & Latino/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Mexican & Latino/i })).toHaveAttribute("href", "/blog/mexican-wedding-planning-guide-2026");
  await expect(page.locator("footer").getByRole("link", { name: /^Cultures$/i })).toHaveAttribute("href", "/cultures");
});

test("Hispanic Heritage directory label and tools remain accessible", async ({ page }) => {
  await page.goto("/cultures/");
  await expect(page.getByRole("heading", { name: /Hispanic Heritage/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Hispanic Heritage Tools/i }).first()).toHaveAttribute("href", "/tools/mexican/");
});

test("routes still resolve — /tools/mexican/ + /tools/traditional/ return 200", async ({ page }) => {
  const r1 = await page.goto("/tools/mexican/");
  expect(r1?.status(), "/tools/mexican/").toBeLessThan(400);
  const r2 = await page.goto("/tools/traditional/");
  expect(r2?.status(), "/tools/traditional/").toBeLessThan(400);
});
