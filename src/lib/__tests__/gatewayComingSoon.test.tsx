import React, {act} from "react";
import {createRoot, type Root} from "react-dom/client";
import {renderToStaticMarkup} from "react-dom/server";
import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {GatewayComingSoon} from "../../components/GatewayComingSoon";

describe("closed gateway activation", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    delete (globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT;
  });

  async function mount() {
    await act(async () => root.render(<GatewayComingSoon context="Claim territory" />));
    return {
      trigger: container.querySelector("button")!,
      email: container.querySelector("a")!,
      popover: container.querySelector<HTMLElement>('[role="dialog"]')!,
    };
  }

  it("does not offer an inert server-rendered trigger before hydration", () => {
    expect(renderToStaticMarkup(<GatewayComingSoon />)).toMatch(/<button[^>]*disabled=""/);
  });

  it("keeps a click activation open after pointer focus has opened it", async () => {
    const {trigger, popover} = await mount();
    expect(trigger.disabled).toBe(false);
    await act(async () => trigger.focus());
    expect(popover.hidden).toBe(false);
    await act(async () => trigger.click());
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(popover.hidden).toBe(false);
  });

  it("closes from the email and restores trigger focus without reopening", async () => {
    const {trigger, email, popover} = await mount();
    await act(async () => trigger.click());
    await act(async () => email.focus());
    await act(async () => { email.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape", bubbles: true})); });
    await act(async () => new Promise<void>(resolve => window.setTimeout(resolve, 10)));
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(popover.hidden).toBe(true);
    await act(async () => trigger.click());
    expect(popover.hidden).toBe(false);
  });
});
