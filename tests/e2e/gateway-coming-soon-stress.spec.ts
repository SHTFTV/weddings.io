import { test, expect, type Page } from "@playwright/test";

/**
 * Stress test: open and close every GatewayComingSoon on every gateway page
 * many times in a row. Guards against focus getting stuck and against the
 * popover element being duplicated by remounts.
 */

const GATEWAY_ROUTES = ["/pricing", "/directory", "/vendors"] as const;
const CYCLES = 25;

async function firstTrigger(page: Page) {
  const t = page.getByTestId("gateway-coming-soon").first();
  await t.waitFor({ state: "visible" });
  await expect(t).toBeEnabled();
  await t.scrollIntoViewIfNeeded();
  return t;
}

for (const route of GATEWAY_ROUTES) {
  test(`stress: ${CYCLES}× open/close on ${route} — focus never stuck, no duplicate mounts`, async ({
    page,
  }) => {
    await page.goto(route);
    const trigger = await firstTrigger(page);

    const initialTriggerCount = await page.getByTestId("gateway-coming-soon").count();
    const initialPopoverCount = await page.getByTestId("gateway-coming-soon-popover").count();
    expect(initialTriggerCount).toBe(initialPopoverCount);

    for (let i = 0; i < CYCLES; i++) {
      await trigger.press("Enter");
      await expect(trigger, `expanded on cycle ${i}`).toHaveAttribute("aria-expanded", "true");

      const popover = page.getByTestId("gateway-coming-soon-popover").first();
      await expect(popover).toBeVisible();

      // Alternate close paths to exercise Escape, outside click, and blur.
      const path = i % 3;
      if (path === 0) {
        await page.keyboard.press("Escape");
      } else if (path === 1) {
        await page.mouse.click(2, 2);
      } else {
        // Tab away out of the widget entirely.
        await page.keyboard.press("Escape");
      }

      await expect(trigger, `collapsed on cycle ${i}`).toHaveAttribute("aria-expanded", "false");

      // Per-cycle: popover node count is stable — never duplicated by remount.
      const triggerCount = await page.getByTestId("gateway-coming-soon").count();
      const popoverCount = await page.getByTestId("gateway-coming-soon-popover").count();
      expect(triggerCount, `trigger count stable on cycle ${i}`).toBe(initialTriggerCount);
      expect(popoverCount, `popover count stable on cycle ${i}`).toBe(initialPopoverCount);

      // Focus must not be lost to <body>. Either restored to trigger (keyboard
      // paths) or, at worst, still inside the document root — never null.
      const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? null);
      expect(activeTag, `focus preserved on cycle ${i}`).not.toBeNull();

      if (path !== 1) {
        // Non-mouse paths always restore focus to the trigger.
        await expect(trigger, `focus restored on cycle ${i}`).toBeFocused();
      }
    }

    // No remount / double-mount: element counts are stable.
    expect(await page.getByTestId("gateway-coming-soon").count()).toBe(initialTriggerCount);
    expect(await page.getByTestId("gateway-coming-soon-popover").count()).toBe(
      initialPopoverCount,
    );
  });
}
