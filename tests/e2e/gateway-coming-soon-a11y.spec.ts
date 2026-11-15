import { test, expect, type Page } from "@playwright/test";

/**
 * Full keyboard + screen-reader contract for <GatewayComingSoon />.
 *
 * Covers, on every gateway page:
 *   - Keyboard open (focus/Enter) + close (Escape) + focus restore to trigger
 *   - aria-controls / aria-labelledby / role wiring so screen readers
 *     announce the popover reliably
 *   - Focus trap: Tab cycles between the trigger and the email link only
 */

const GATEWAY_ROUTES = ["/pricing", "/directory", "/vendors"] as const;

async function firstTrigger(page: Page) {
  const t = page.getByTestId("gateway-coming-soon").first();
  await t.waitFor({ state: "visible" });
  await expect(t).toBeEnabled();
  await t.scrollIntoViewIfNeeded();
  return t;
}

for (const route of GATEWAY_ROUTES) {
  test.describe(`gateway keyboard + a11y — ${route}`, () => {
    test("opens on focus/Enter, closes on Escape, restores focus to trigger", async ({ page }) => {
      await page.goto(route);
      const trigger = await firstTrigger(page);

      await trigger.focus();
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");

      const popover = page.getByTestId("gateway-coming-soon-popover").first();
      await expect(popover).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(popover).toBeHidden();
      await expect(trigger, "focus restored to trigger after Escape").toBeFocused();

      // Enter must reopen an already-focused trigger. Closing from the email
      // must restore focus without that programmatic focus reopening it.
      await trigger.press("Enter");
      await expect(popover).toBeVisible();
      await page.getByTestId("gateway-coming-soon-email").first().focus();
      await page.keyboard.press("Escape");
      await expect(popover).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    test("popover role + aria-controls + aria-labelledby announce reliably", async ({ page }) => {
      await page.goto(route);
      const trigger = await firstTrigger(page);

      await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
      const controlsId = await trigger.getAttribute("aria-controls");
      expect(controlsId, "trigger must aria-controls the popover").toBeTruthy();

      await trigger.focus();
      const popover = page.getByTestId("gateway-coming-soon-popover").first();
      await expect(popover).toBeVisible();

      // aria-controls target matches the popover's id
      await expect(popover).toHaveAttribute("id", controlsId!);
      await expect(popover).toHaveAttribute("role", "dialog");

      // aria-labelledby resolves to an element whose text names the dialog
      const labelledBy = await popover.getAttribute("aria-labelledby");
      expect(labelledBy, "dialog must aria-labelledby a title element").toBeTruthy();
      const title = page.locator(`#${labelledBy}`);
      await expect(title).toHaveText(/Gateways closed/i);
    });

    test("focus is trapped inside the popover and cycles trigger <-> email", async ({ page }) => {
      await page.goto(route);
      const trigger = await firstTrigger(page);

      await trigger.focus();
      const popover = page.getByTestId("gateway-coming-soon-popover").first();
      await expect(popover).toBeVisible();

      // Tab from trigger → email link
      await page.keyboard.press("Tab");
      const email = page.getByTestId("gateway-coming-soon-email").first();
      await expect(email).toBeFocused();

      // Tab again → cycles back to trigger (forward trap)
      await page.keyboard.press("Tab");
      await expect(trigger).toBeFocused();

      // Shift+Tab from email → back to trigger (backward trap)
      await email.focus();
      await expect(email).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(trigger).toBeFocused();
    });
  });
}
