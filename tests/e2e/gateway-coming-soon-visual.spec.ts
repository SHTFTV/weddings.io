import { test, expect, type Page } from "@playwright/test";

const GATEWAY_ROUTES = ["/pricing", "/directory", "/vendors"] as const;

async function firstTrigger(page: Page) {
  const t = page.getByTestId("gateway-coming-soon").first();
  await t.waitFor({ state: "visible" });
  await expect(t).toBeEnabled();
  await t.scrollIntoViewIfNeeded();
  return t;
}

test("outside click closes popover and restores focus to trigger", async ({ page }) => {
  await page.goto("/pricing");
  const trigger = await firstTrigger(page);

  await trigger.focus();
  const popover = page.getByTestId("gateway-coming-soon-popover").first();
  await expect(popover).toBeVisible();

  // Click somewhere clearly outside the widget.
  await page.mouse.click(5, 5);

  await expect(popover).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger, "focus restored to trigger after outside click").toBeFocused();
});

test("repeated open/close cycles never leave focus stuck", async ({ page }) => {
  await page.goto("/pricing");
  const trigger = await firstTrigger(page);

  for (let i = 0; i < 5; i++) {
    await trigger.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger, `focus restored on cycle ${i}`).toBeFocused();
  }

  // Only one popover node exists per trigger — no duplicate mounts.
  const popovers = await page.getByTestId("gateway-coming-soon-popover").count();
  const triggers = await page.getByTestId("gateway-coming-soon").count();
  expect(popovers).toBe(triggers);
});

for (const route of GATEWAY_ROUTES) {
  test(`visual: gateway button + popover on ${route}`, async ({ page }, testInfo) => {
    await page.goto(route);
    const trigger = await firstTrigger(page);

    // Snapshot resting state of the button.
    await expect(trigger).toHaveScreenshot(
      `gateway-button-${route.replace(/\W+/g, "_") || "home"}-${testInfo.project.name}.png`,
    );

    // Open via focus and snapshot the popover.
    await trigger.focus();
    const popover = page.getByTestId("gateway-coming-soon-popover").first();
    await expect(popover).toBeVisible();
    await expect(popover).toHaveScreenshot(
      `gateway-popover-${route.replace(/\W+/g, "_") || "home"}-${testInfo.project.name}.png`,
    );
  });
}
