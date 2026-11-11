import { useEffect, useState } from "react";
import { BUILD_COMMIT_SHORT, BUILD_TIME_LABEL, LATEST_PRICING_CODE_VERSION } from "../lib/buildInfo";
import { PRICING_CODE_VERSION } from "../lib/territoryPricing";

/**
 * Small floating build/deployment badge so any visitor (including incognito)
 * can visually confirm they're viewing the latest publish. Click to open the
 * admin verification page.
 */
export function BuildBadge() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (!import.meta.env.DEV) return null;

  const pricingMismatch = PRICING_CODE_VERSION !== LATEST_PRICING_CODE_VERSION;
  return (
    <aside aria-label="Development build information">
    <a
      href="/admin/verify"
      title={`Deployed ${BUILD_TIME_LABEL} · commit ${BUILD_COMMIT_SHORT}`}
      className={`fixed bottom-3 left-3 z-[60] rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider shadow-lg backdrop-blur-md ${
        pricingMismatch
          ? "border-destructive bg-destructive text-destructive-foreground"
          : "border-border bg-background/90 text-muted-foreground hover:border-primary hover:text-primary"
      }`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      build {BUILD_COMMIT_SHORT} · pricing {pricingMismatch ? "stale" : "current"} · {BUILD_TIME_LABEL}
    </a>
    </aside>
  );
}
