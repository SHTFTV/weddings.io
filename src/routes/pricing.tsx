import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackEvent } from "../lib/analytics";
import { loadInitialCity, persistCity, withCityParam } from "../lib/cityPersistence";
import { GatewayComingSoon } from "../components/GatewayComingSoon";
import { SiteHeader } from "../components/SiteHeader";
import { BUILD_COMMIT_SHORT, BUILD_TIME_LABEL } from "../lib/buildInfo";
import {
  ADDON_PRICING,
  MAX_MONTHLY_PRICE,
  MIN_MONTHLY_PRICE,
  PRICING_BANDS,
  PRICING_CODE_VERSION,
  SUPPORTED_CITIES,
  VENDOR_ANNUAL_FEE,
  pppIndex,
  priceForCity,
  type SupportedCity,
} from "../lib/territoryPricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — PPP-Adjusted Exclusive Planners | Weddings.io" },
      {
        name: "description",
        content:
          "One exclusive planner per city, priced by local population × your country's PPP index. Starts at $10/mo in small markets, capped at $2,000/mo in mega-cities. No tiers. No add-ons buried in fine print.",
      },
      { property: "og:title", content: "Weddings.io Pricing — $10–$2,000/mo, PPP-Adjusted" },
      {
        property: "og:description",
        content:
          "PPP-adjusted city pricing. $10 in small markets, $2,000/mo cap in mega-cities. One exclusive planner slot per city. No tiers, no bundles.",
      },
      { property: "og:url", content: "https://weddings.io/pricing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How is my monthly price calculated?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Base = $10 per 100,000 city population. Multiplied by your country's PPP (Purchasing Power Parity) index, rounded to the nearest $10, clamped between $10 and $2,000/mo. Same formula for every city on earth.",
              },
            },
            {
              "@type": "Question",
              name: "Are there tiers, bundles, or hidden add-ons?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. One single PPP-adjusted line item is the whole price. Optional extras (Backlink Pack $25, TALC.tv $10/post, Hall Visualizer $2/render, Guest Post $10) are clearly labeled outside the core price.",
              },
            },
            {
              "@type": "Question",
              name: "How many planner slots per city?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Exactly one. Every city offers a single exclusive planner slot — sold out the moment it is filled.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: PricingPage,
});

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function PricingPage() {
  const defaultCity =
    SUPPORTED_CITIES.find((c) => c.city === "Vancouver, BC") ?? SUPPORTED_CITIES[0];
  const [selected, setSelected] = useState<SupportedCity>(defaultCity);
  const [cityReady, setCityReady] = useState(false);
  useEffect(() => {
    const initial = loadInitialCity(defaultCity);
    if (initial.city !== defaultCity.city) setSelected(initial);
    persistCity(initial);
    setCityReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const monthly = priceForCity(selected);
  const ppp = pppIndex(selected.country);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
          PPP-Adjusted Pricing · USD · build {BUILD_COMMIT_SHORT}
        </p>
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          One exclusive planner per city. ${MIN_MONTHLY_PRICE}–${MAX_MONTHLY_PRICE.toLocaleString("en-US")}/mo, PPP-adjusted.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          Priced by <strong>local population × your country's Purchasing Power Parity (PPP) index</strong>,
          rounded to the nearest $10, clamped between ${MIN_MONTHLY_PRICE} and ${MAX_MONTHLY_PRICE.toLocaleString("en-US")}/mo.
          No tiers. No bundles. No add-ons buried in fine print.
        </p>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Pricing code {PRICING_CODE_VERSION.slice(0, 12)} · last updated {BUILD_TIME_LABEL}
        </p>

        <section data-testid="territory-rule" className="mt-10 rounded-lg border border-primary/60 bg-primary/5 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">The Rule</p>
          <p className="mt-3 font-serif text-3xl md:text-4xl">1 exclusive planner per city. Sold out the moment that slot is filled.</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Every city — from a 50K town in Sri Lanka to a 20M metro in India — offers exactly one
            exclusive planner slot. City size and country PPP set the price. That is the whole
            model.
          </p>
        </section>

        <section className="mt-10 rounded-lg border border-primary/40 bg-card p-6 md:p-8">
          <h2 className="font-serif text-2xl">City Price Calculator</h2>
          <label className="mt-4 block text-sm font-medium text-muted-foreground" htmlFor="pricing-city">
            Your city
          </label>
          <select
            id="pricing-city"
            disabled={!cityReady}
            aria-busy={!cityReady}
            value={selected.city}
            onChange={(e) => {
              const next = SUPPORTED_CITIES.find((c) => c.city === e.target.value);
              if (next) {
                setSelected(next);
                persistCity(next);
              }
            }}
            className="mt-2 w-full max-w-md rounded-md border border-border bg-background px-3 py-2 font-mono text-base text-foreground focus:border-primary focus:outline-none"
          >
            {SUPPORTED_CITIES.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} · {c.populationLabel} · {c.countryName}
              </option>
            ))}
          </select>
          <p className="mt-5 font-serif text-3xl">
            <span data-testid="calc-price" className="text-primary">{formatUsd(monthly)}</span>{" "}
            <span className="text-base text-muted-foreground">USD / month · 1 exclusive planner</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {selected.city} · population {selected.population.toLocaleString("en-US")} ·{" "}
            {selected.countryName} PPP {ppp.toFixed(2)} · clamped ${MIN_MONTHLY_PRICE}–${MAX_MONTHLY_PRICE.toLocaleString("en-US")}/mo
          </p>
          <div className="mt-5">
            <GatewayComingSoon context="Claim territory" subject="Claim territory — early access" />
          </div>
        </section>

        <section className="mt-12 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Band</th>
                <th className="px-4 py-3 text-left">Population</th>
                <th className="px-4 py-3 text-left">Monthly range</th>
                <th className="px-4 py-3 text-left">Example cities</th>
              </tr>
            </thead>
            <tbody data-testid="pricing-bands">
              {PRICING_BANDS.map((b) => (
                <tr key={b.label} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold text-foreground">{b.label}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{b.populationRange}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{b.usdRange}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-12 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Population</th>
                <th className="px-4 py-3 text-left">Country PPP</th>
                <th className="px-4 py-3 text-left">$/mo</th>
              </tr>
            </thead>
            <tbody data-testid="city-examples">
              {SUPPORTED_CITIES.map((c) => (
                <tr key={c.city} data-testid="city-row" data-population={c.population} data-country={c.country} className="border-t border-border">
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{c.populationLabel}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {c.countryName} · {pppIndex(c.country).toFixed(2)}
                  </td>
                  <td data-testid="city-price" className="px-4 py-3 font-semibold text-primary">
                    {formatUsd(priceForCity(c))}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-16 rounded-lg border border-border bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            How PPP affects your price
          </p>
          <h2 className="mt-2 font-serif text-3xl">Same formula. Fair everywhere.</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <p className="font-serif text-xl text-foreground">Couples</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Couples plan for free — forever. PPP does not apply to you. The whole planner is
                free in every country we serve, no credit card, no trial expiry.
              </p>
            </div>
            <div>
              <p className="font-serif text-xl text-foreground">Vendors</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Directory listing is $10/year flat, worldwide. The exclusive planner slot is
                PPP-adjusted — a vendor in Mumbai (PPP 0.28) pays much less USD than a vendor in
                New York (PPP 1.00) for the same population base.
              </p>
            </div>
            <div>
              <p className="font-serif text-xl text-foreground">Enterprise & partners</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Enterprise licensing uses the same PPP-adjusted per-city math, capped at $2,000/mo
                per slot. One clean line item — bundles, retainers, and tiered enterprise pricing
                are gone.
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm">
            <a
              href={withCityParam("/ppp-explained", selected)}
              onClick={() =>
                trackEvent({
                  event: "ppp_explainer_click",
                  source: "pricing_page",
                  city: selected.city,
                  country: selected.country,
                  ppp,
                  monthly_usd: monthly,
                })
              }
              className="font-semibold text-primary hover:underline"
            >
              Read the full PPP explainer (formula, country factors, worked examples) →
            </a>
          </p>
        </section>

        <section className="mt-16 rounded-lg border border-primary/40 bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Vendors Directory</p>
          <h2 className="mt-2 font-serif text-3xl">${VENDOR_ANNUAL_FEE}/year to join the ecosystem</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The flat annual listing is <strong className="text-foreground">${VENDOR_ANNUAL_FEE} USD/year</strong>{" "}
            worldwide, no PPP scaling — it is already the floor. EyeSpyR verification is included
            with any monthly plan and locked on the $10/year baseline.
          </p>
        </section>

        <section className="mt-16 rounded-lg border border-border bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Optional Extras — Clearly Labeled, Not Buried
          </p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            These live outside the core price. Every extra is à la carte, flat-priced, and works on
            any plan — including free.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col rounded-md border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">IAM Weddings SEO</p>
              <p className="mt-2 font-serif text-2xl">${MIN_MONTHLY_PRICE}–${MAX_MONTHLY_PRICE.toLocaleString("en-US")}/mo · PPP-adjusted</p>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Done-for-you SEO for wedding vendors. City-scoped SEO Marketing Pages, high-authority
                dofollow backlinks, technical SEO, and real editorial content. Same PPP formula.
              </p>
              <p className="mt-3 font-mono text-primary">
                Your city estimate: {formatUsd(monthly)}/mo
              </p>
              <div className="mt-4">
                <a
                  href="/seo/"
                  className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                >
                  See IAM Weddings SEO
                </a>
              </div>
            </div>
            <div className="flex flex-col rounded-md border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Backlink Pack (3 dofollow)</p>
              <p className="mt-2 font-serif text-2xl">${ADDON_PRICING.backlinkPackOneTime} one-time</p>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Three high-authority dofollow backlinks from the IAM domain network. Pay once. Never
                expires.
              </p>
              <div className="mt-4">
                <GatewayComingSoon context="Buy Backlink Pack — $25 one-time" variant="ghost" subject="Backlink Pack — early access" />
              </div>
            </div>
            <div className="flex flex-col rounded-md border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">TALC.tv Content Blast</p>
              <p className="mt-2 font-serif text-2xl">${ADDON_PRICING.talcTvVisualBlastPerPost}/post</p>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                One completed project photo → AI-generated 2,000-word SEO post, auto-published to
                your city page + GMB. Permanent backlink to your site.
              </p>
              <div className="mt-4">
                <GatewayComingSoon context="Submit TALC.tv Blast — $10" variant="ghost" subject="TALC.tv Blast — early access" />
              </div>
            </div>
            <div className="flex flex-col rounded-md border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Hall Visualizer (EyeSpyR Engine)</p>
              <p className="mt-2 font-serif text-2xl">${ADDON_PRICING.hallVisualizerPerRender}/render</p>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                On-demand AI rendering of your venue layouts. Pay per render. Free with monthly
                plans.
              </p>
              <div className="mt-4">
                <GatewayComingSoon context="Try Hall Visualizer — $2/render" variant="ghost" subject="Hall Visualizer — early access" />
              </div>
            </div>
            <div className="flex flex-col rounded-md border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Guest Post</p>
              <p className="mt-2 font-serif text-2xl">${ADDON_PRICING.guestPostAcceptedPost} / accepted post</p>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Real content, made by real people. High-quality writing, real photos, real work.
                Permanent byline + dofollow backlinks.
              </p>
              <div className="mt-4">
                <GatewayComingSoon context="Submit a Guest Post — $10" variant="ghost" subject="Guest Post — early access" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-2xl">FAQ</h2>
          <div className="mt-6 space-y-6 text-sm leading-6 text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">How is my monthly price calculated?</p>
              <p className="mt-1">
                Base = $10 per 100,000 population. Multiplied by your country's PPP index, rounded
                to the nearest $10, clamped between ${MIN_MONTHLY_PRICE} and ${MAX_MONTHLY_PRICE.toLocaleString("en-US")}/mo.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Are there tiers or hidden add-ons?</p>
              <p className="mt-1">
                No. One single PPP-adjusted line item is the whole price. Optional extras above are
                clearly labeled, flat-priced, and always outside the core.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">How many planner slots per city?</p>
              <p className="mt-1">Exactly one. Every city offers a single exclusive planner slot — sold out on fill.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">What do couples pay?</p>
              <p className="mt-1">Nothing. Couples plan free in every country. PPP does not apply to couples.</p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
