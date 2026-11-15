import { useEffect, useId, useRef, useState } from "react";

/**
 * Gateway "Coming Soon" stop.
 *
 * Unified stand-in for every payment / apply / checkout / subscribe / upgrade /
 * claim CTA while the payment gateways are intentionally closed
 * (see /journal/the-master-plan). Button text and popover copy are IDENTICAL
 * across every entry point on the site — the only thing that changes per usage
 * is an optional small `context` label and the mailto `subject`.
 */

export const PARTNERSHIPS_EMAIL = "partnerships@industryarmymarketing.com";

/** Canonical, unified button text — do NOT vary per page. */
export const GATEWAY_BUTTON_LABEL = "Coming Soon";

/** Canonical, unified popover copy — do NOT vary per page. */
export const GATEWAY_POPOVER_EYEBROW = "Gateways closed — by design";
export const GATEWAY_POPOVER_BODY =
  "Payment isn't open yet. If you'd like an early conversation, write to the partnerships desk.";

/** Href prefixes that represent a closed gateway; audits/tests use this list. */
export const GATEWAY_HREF_PREFIXES = [
  "/apply",
  "/checkout",
  "/join",
  "/invoice",
  "/backlinks",
  "/talc",
  "/visualizer",
  "/dashboard/position-one",
] as const;

export function isGatewayHref(href: string | undefined | null): boolean {
  if (!href) return false;
  return GATEWAY_HREF_PREFIXES.some(
    (p) => href === p || href.startsWith(`${p}/`) || href.startsWith(`${p}?`),
  );
}

type Variant = "primary" | "ghost" | "link";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90",
  ghost:
    "inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary",
  link: "inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary hover:opacity-80",
};

interface Props {
  context?: string;
  variant?: Variant;
  className?: string;
  style?: React.CSSProperties;
  subject?: string;
}

export function GatewayComingSoon({
  context,
  variant = "primary",
  className,
  style,
  subject,
}: Props) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);
  // Track whether the last open was initiated by keyboard so we know to
  // restore focus to the trigger on close.
  const openedByKeyboard = useRef(false);
  const restoringFocus = useRef(false);

  useEffect(() => setReady(true), []);

  const baseId = useId().replace(/:/g, "");
  const popoverId = `gateway-popover-${baseId}`;
  const titleId = `gateway-title-${baseId}`;

  // Outside-click closes; if focus is inside the widget when the outside click
  // lands, mark for focus restore so the trigger reclaims focus on close.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (ref.current.contains(document.activeElement)) {
          openedByKeyboard.current = true;
        }
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Guard: idempotent focus restore. Runs once per open→close transition.
  // Prevents stuck focus if the popover is opened/closed in rapid succession or
  // if the component unmounts mid-cycle.
  useEffect(() => {
    if (open || !openedByKeyboard.current) return;
    openedByKeyboard.current = false;
    const t = triggerRef.current;
    // Defer to next tick so any in-flight blur/mousedown settles first.
    const id = window.setTimeout(() => {
      if (!t || document.activeElement === t) return;
      restoringFocus.current = true;
      t.focus();
      restoringFocus.current = false;
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  // Clear the restore flag on unmount so nothing tries to focus a detached node.
  useEffect(() => {
    return () => {
      openedByKeyboard.current = false;
    };
  }, []);

  // Keyboard handling on the popover: Escape closes, Tab/Shift+Tab traps focus
  // between the trigger and the email link (only two focusable stops).
  const onDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      openedByKeyboard.current = true;
      setOpen(false);
      return;
    }
    if (e.key !== "Tab") return;
    const active = document.activeElement;
    if (e.shiftKey && active === emailRef.current) {
      e.preventDefault();
      triggerRef.current?.focus();
    } else if (!e.shiftKey && active === emailRef.current) {
      // Cycle back to trigger — only two focusable stops in the trap.
      e.preventDefault();
      triggerRef.current?.focus();
    }
  };

  // Trigger Tab from focused trigger → into popover email link when open.
  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      openedByKeyboard.current = true;
      setOpen(false);
      return;
    }
    if (open && e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      emailRef.current?.focus();
    }
  };

  const mailto = `mailto:${PARTNERSHIPS_EMAIL}?subject=${encodeURIComponent(
    subject ?? "Early access — partnerships",
  )}`;

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        // Only auto-close on mouse leave when focus isn't inside the popover.
        if (!ref.current?.contains(document.activeElement)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={!ready}
        aria-busy={!ready}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={`${GATEWAY_BUTTON_LABEL} — reveal partnerships email`}
        onClick={() => {
          openedByKeyboard.current = false;
          // Pointer focus/hover may have already opened the popover before
          // the click. Activation must still leave it open on touch screens.
          setOpen(true);
        }}
        onKeyDown={onTriggerKeyDown}
        onFocus={() => {
          if (restoringFocus.current) return;
          openedByKeyboard.current = true;
          setOpen(true);
        }}
        className={[
          VARIANT_CLASS[variant],
          "relative cursor-pointer opacity-90",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        data-gateway="coming-soon"
        data-testid="gateway-coming-soon"
      >
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-current"
        />
        {context ? <span className="opacity-80">{context} ·</span> : null}
        <span data-testid="gateway-coming-soon-label">{GATEWAY_BUTTON_LABEL}</span>
      </button>

      <div
        ref={popoverRef}
        id={popoverId}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        data-testid="gateway-coming-soon-popover"
        hidden={!open}
        onKeyDown={onDialogKeyDown}
        className="absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 rounded-md border border-border bg-card p-4 text-left shadow-xl"
      >
        <p
          id={titleId}
          className="text-xs font-bold uppercase tracking-[0.2em] text-primary"
        >
          {GATEWAY_POPOVER_EYEBROW}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {GATEWAY_POPOVER_BODY}
        </p>
        <a
          ref={emailRef}
          href={mailto}
          data-testid="gateway-coming-soon-email"
          className="mt-3 inline-flex text-sm font-semibold text-primary underline underline-offset-4"
        >
          {PARTNERSHIPS_EMAIL}
        </a>
      </div>
    </div>
  );
}
