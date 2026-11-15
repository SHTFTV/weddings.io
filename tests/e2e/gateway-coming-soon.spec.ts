import { test, expect, type Page } from "@playwright/test";

/**
 * Gateway "Coming Soon" unification.
 *
 * Every gateway entry point on the site must render the shared
 * <GatewayComingSoon /> stop with IDENTICAL button text and popover copy.
 * See src/components/GatewayComingSoon.tsx for the canonical strings.
 */

const GATEWAY_BUTTON_LABEL = "Coming Soon";
const PARTNERSHIPS_EMAIL = "partnerships@industryarmymarketing.com";
const POPOVER_EYEBROW = "Gateways closed — by design";

const GATEWAY_ROUTES = ["/pricing", "/directory", "/vendors"] as const;

async function firstGateway(page: Page) {
  const stop = page.getByTestId("gateway-coming-soon").first();
  await stop.waitFor({ state: "visible" });
  await expect(stop).toBeEnabled();
  return stop;
}

for (const route of GATEWAY_ROUTES) {
  test(`gateway CTA is unified on ${route}`, async ({ page }) => {
    await page.goto(route);

    // At least one gateway stop is present.
    const count = await page.getByTestId("gateway-coming-soon").count();
    expect(count, `expected a GatewayComingSoon stop on ${route}`).toBeGreaterThan(0);

    // Every rendered stop uses the exact unified label.
    const labels = await page.getByTestId("gateway-coming-soon-label").allTextContents();
    expect(labels.length).toBeGreaterThan(0);
    for (const l of labels) {
      expect(l.trim()).toBe(GATEWAY_BUTTON_LABEL);
    }

    // Hover the first stop → identical popover copy + partnerships email.
    const stop = await firstGateway(page);
    await stop.hover();

    const popover = page.getByTestId("gateway-coming-soon-popover").first();
    await expect(popover).toBeVisible();
    await expect(popover).toContainText(POPOVER_EYEBROW);
    await expect(popover).toContainText(PARTNERSHIPS_EMAIL);

    const email = page.getByTestId("gateway-coming-soon-email").first();
    const href = await email.getAttribute("href");
    expect(href).toContain(`mailto:${PARTNERSHIPS_EMAIL}`);
  });
}

test("no legacy Apply/Checkout/Subscribe anchors remain on gateway routes", async ({ page }) => {
  for (const route of ["/", ...GATEWAY_ROUTES]) {
    await page.goto(route);
    // Anchor tags pointing to closed gateway prefixes should not exist —
    // they must be replaced by the GatewayComingSoon stop.
    const legacy = await page.$$eval("a[href]", (nodes) =>
      (nodes as HTMLAnchorElement[])
        .map((a) => a.getAttribute("href") || "")
        .filter((h) =>
          /^\/(apply|checkout|join|invoice|backlinks|talc|visualizer|dashboard\/position-one)(\/|$|\?)/.test(h),
        ),
    );
    expect(legacy, `legacy gateway anchors found on ${route}: ${legacy.join(", ")}`).toEqual([]);
  }
});
