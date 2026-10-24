import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { isCityHydrated, markCityHydrated, subscribeCityHydration } from "../lib/cityPersistence";

import appCss from "../styles.css?url";
import { BuildBadge } from "../components/BuildBadge";
import { PricingVersionBanner } from "../components/PricingVersionBanner";
import {
  BUILD_CACHE_BUSTER,
  BUILD_COMMIT_FULL,
  BUILD_COMMIT_SHORT,
  BUILD_TIME_ISO,
} from "../lib/buildInfo";

function NotFoundComponent() {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isAdminPath = pathname.startsWith("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {isAdminPath ? "Admin page not found" : "Page not found"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAdminPath
            ? "This admin route doesn't exist on the currently deployed build. Try the verification page instead."
            : "The page you're looking for doesn't exist or has been moved."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {isAdminPath && (
            <Link
              to="/admin/verify"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to /admin/verify
            </Link>
          )}
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Weddings.io™ — Multicultural Wedding Planning Platform | Est. 2015" },
      { name: "description", content: "Weddings.io — free multicultural wedding planning tools for 9 cultures, territory-locked vendor directory across 1,018 cities and 24 countries. Est. May 13, 2015." },
      { name: "author", content: "Weddings.io" },
      { name: "google-site-verification", content: "0InJkTI3VHBB87z0w-GhSYmwru_hKLhcGAmt5D--7wk" },
      { property: "og:title", content: "Weddings.io™ Technologies | Intelligent AI Software Architecture" },
      { property: "og:description", content: "The core technological infrastructure for high-performance automation. Weddings.io™ Technologies provides enterprise-grade systems and scalable web architecture built on a high-performance SaaS framework." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://weddings.io/" },
      { property: "og:site_name", content: "Weddings.io" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@weddingsio" },
      { name: "twitter:url", content: "https://weddings.io/" },
      { name: "twitter:title", content: "Weddings.io™ Technologies | Intelligent AI Software Architecture" },
      { name: "twitter:description", content: "The core technological infrastructure for high-performance automation. Enterprise-grade systems and scalable web architecture on a high-performance SaaS framework." },
      { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: "https://weddings.io/opengraph.jpg" },
      { name: "wio-build-commit", content: BUILD_COMMIT_FULL },
      { name: "wio-build-short", content: BUILD_COMMIT_SHORT },
      { name: "wio-build-time", content: BUILD_TIME_ISO },
      { name: "wio-build-cache-buster", content: BUILD_CACHE_BUSTER },
    ],


    links: [
      {
        rel: "stylesheet",
        href: `${appCss}?v=${BUILD_CACHE_BUSTER}`,
      },
      { rel: "icon", href: "/favicon.svg" },
      { rel: "alternate", type: "application/rss+xml", title: "Weddings.io Blog RSS", href: "/rss.xml" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://weddings.io/#organization",
              name: "Weddings.io Technologies",
              legalName: "Weddings.io Technologies",
              alternateName: ["Weddings.io", "Weddings.io™"],
              url: "https://weddings.io",
              logo: "https://weddings.io/favicon.svg",
              foundingDate: "2015-05-13",
              description:
                "Weddings.io is an independent SaaS platform and global wedding vendor directory established May 13, 2015. Weddings.io Technologies operates independently and is not affiliated, associated, or partnered with AIWeddings, aiweddings.io, or Weddings.io Inc. of Ontario.",
              knowsAbout: [
                "wedding SaaS",
                "vendor directory",
                "wedding directory",
                "vendor marketplace",
              ],
              foundingLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Langley",
                  addressRegion: "BC",
                  addressCountry: "CA",
                },
              },
              parentOrganization: {
                "@type": "Organization",
                name: "Industry Army Marketing",
                url: "https://industryarmymarketing.com",
              },
              sameAs: [
                "https://www.facebook.com/weddings.io",
                "https://weddingsaas.com",
                "https://eyespyr.com",
                "https://talc.tv",
                "https://pressrelease.ltd",
                "https://industryarmymarketing.com",
              ],
            },

            {
              "@type": "WebSite",
              "@id": "https://weddings.io/#website",
              url: "https://weddings.io",
              name: "Weddings.io",
              alternateName: "Weddings.io Technologies",
              inLanguage: "en-CA",
              publisher: { "@id": "https://weddings.io/#organization" },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://weddings.io/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <footer aria-label="Site credit"><div data-iam-credit="true" style={{ boxSizing: 'border-box', width: '100%', gridColumn: '1 / -1', padding: '16px 24px', textAlign: 'center', fontSize: '12px', lineHeight: 1.5, color: 'inherit' }}>Powered by <a href="https://industryarmymarketing.com/" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Industry Army Marketing</a></div></footer>
<Scripts />
        <script src="https://talc-tv.replit.app/bot.js?v=2" data-skin="wedding" defer />
      </body>

    </html>
  );
}

function RootComponent() {
  // Subscribe to the city-hydration flag: SSR renders links without ?city= to
  // avoid a hydration mismatch, then this flip re-renders the tree so
  // withCityParam() can append the persisted city on client-only nav links.
  useSyncExternalStore(
    subscribeCityHydration,
    isCityHydrated,
    () => false,
  );
  if (typeof window !== "undefined" && !isCityHydrated()) {
    queueMicrotask(markCityHydrated);
  }
  return (
    <>
      <PricingVersionBanner />
      <Outlet />
      <BuildBadge />
    </>
  );
}
