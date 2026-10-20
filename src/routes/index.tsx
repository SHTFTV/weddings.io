import { WeddingMagazineHome } from "../components/WeddingMagazineHome";
import weddingMagazineCss from "../components/wedding-magazine.css?url";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_MONTHLY_PRICE,
  MIN_MONTHLY_PRICE,
  SUPPORTED_CITIES,
  pppIndex,
  priceForCity,
  type SupportedCity,
} from "../lib/territoryPricing";
import { trackEvent } from "../lib/analytics";
import { loadInitialCity, persistCity, withCityParam } from "../lib/cityPersistence";
import {
  ArrowRight,
  Camera,
  Check,
  Clock,
  DollarSign,
  FileText,
  Globe2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Utensils,
  Smartphone,
  Cpu,
} from "lucide-react";
import { BlogCard } from "../components/BlogCard";
import { GatewayComingSoon, isGatewayHref } from "../components/GatewayComingSoon";

import { blogPosts, homepageCarouselPosts } from "../lib/blogPosts";
import { EcosystemVideo } from "../components/EcosystemVideo";
import { RotatingHeadline, CultureMosaic, CultureToolsGrid } from "../components/CultureFeatures";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Weddings.io | Wedding Magazine, Traditions & Planning" },
      {
        name: "description",
        content:
          "Wedding inspiration, real and celebrity weddings, cultural traditions, destinations and style—alongside budget tools, checklists and the business of weddings.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "author", content: "Weddings.io Technologies — Industry Army Marketing, Langley BC Canada" },
      { name: "copyright", content: "Weddings.io Technologies Est. 2015. All rights reserved." },
      { name: "founded", content: "2015-05-13" },
      { name: "geo.region", content: "CA-BC" },
      { name: "geo.placename", content: "Langley, British Columbia, Canada" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://weddings.io/" },
      { property: "og:site_name", content: "Weddings.io™" },
      { property: "og:title", content: "Weddings.io | Wedding Magazine, Traditions & Planning" },
      {
        property: "og:description",
        content:
          "Explore the wedding edit: meaningful traditions, distinctive celebrations, destination ideas and practical tools for your kind of wedding.",
      },
      { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
      {
        property: "og:image:alt",
        content: "Weddings.io Technologies — Wedding SaaS Ecosystem, Est. May 13, 2015",
      },
      { property: "og:locale", content: "en_CA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@weddingsio" },
      { name: "twitter:title", content: "Weddings.io | Wedding Magazine, Traditions & Planning" },
      {
        name: "twitter:description",
        content:
          "A whole world of weddings: real stories, traditions, style, destinations and planning tools.",
      },
      { name: "twitter:image", content: "https://weddings.io/opengraph.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: weddingMagazineCss },
      { rel: "canonical", href: "https://weddings.io/" },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "Weddings.io Blog RSS",
        href: "https://weddings.io/rss.xml",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://weddings.io/#website",
              url: "https://weddings.io",
              name: "Weddings.io",
              alternateName: ["Weddings.io Network", "Weddings IO"],
              description:
                "The global anchor hub for territory-locked, flat-rate local wedding trade authority.",
              publisher: { "@id": "https://industryarmy.com/#organization" },
              copyrightHolder: { "@id": "https://industryarmy.com/#organization" },
              copyrightYear: "2015",
              inLanguage: "en-US",
              hasPart: [
                { "@id": "https://weddingsaas.com/#website" },
                { "@id": "https://brides.ltd/#website" },
                { "@id": "https://grooms.ltd/#website" },
                { "@id": "https://videographers.io/#website" },
              ],
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://weddings.io/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "WebPage",
              "@id": "https://weddings.io/#webpage",
              url: "https://weddings.io/",
              name: "Weddings.io — Territory-Locked Local Wedding Trade Authority",
              description:
                "The global anchor hub for territory-locked, flat-rate local wedding trade authority. One exclusive planner per city.",
              isPartOf: { "@id": "https://weddings.io/#website" },
              about: { "@id": "https://weddings.io/#organization" },
              publisher: { "@id": "https://industryarmy.com/#organization" },
              inLanguage: "en-US",
              primaryImageOfPage: {
                "@type": "ImageObject",
                url: "https://weddings.io/og-default.jpg",
              },
            },

            {
              "@type": "Organization",
              "@id": "https://weddings.io/#organization",
              name: "Weddings.io",
              url: "https://weddings.io",
              foundingDate: "2015-05-13",
              parentOrganization: { "@id": "https://industryarmy.com/#organization" },
              founder: { "@type": "Person", name: "Colin Hamilton" },
              sameAs: [
                "https://web.archive.org/web/*/weddings.io",
                "https://weddingsaas.com",
                "https://brides.ltd",
                "https://grooms.ltd",
                "https://videographers.io",
              ],
            },
            {
              "@type": "Organization",
              "@id": "https://industryarmy.com/#organization",
              name: "Industry Army Marketing",
              alternateName: "IAM",
              url: "https://industryarmy.com",
              foundingDate: "2011",
              founder: { "@type": "Person", name: "Colin Hamilton" },
              owns: [
                { "@id": "https://weddings.io/#website" },
                { "@id": "https://weddingsaas.com/#website" },
                { "@id": "https://brides.ltd/#website" },
                { "@id": "https://grooms.ltd/#website" },
                { "@id": "https://videographers.io/#website" },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

const navItems = [
  { label: "Home", href: "/" },
  { label: "Cultures", href: "/cultures" },
  { label: "Tools", href: "/tools" },
  { label: "Vendors", href: "/vendors" },
  { label: "Destinations", href: "/destinations" },
  { label: "Blog", href: "/blog" },
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Pricing", href: "/pricing" },
  { label: "Guest Post", href: "/guest-post" },
] as const;

const verificationItems = [
  ["Caterer", "Chafing Stations Lit", "🍛", true],
  ["Decorator", "Mandap Assembled", "🪷", true],
  ["Florist", "Centerpieces Placed", "💐", true],
  ["DJ / MC", "Sound Check Complete", "🎧", true],
  ["Photo/Video", "B-Roll Captured", "📸", true],
  ["Transport", "Limo at Hotel", "🚐", false],
] as const;

const schedule = [
  ["10:00", "Haldi setup", "Courtyard styling, marigold drop, henna stations ready"],
  ["13:00", "Baraat arrival", "Dhol crew, horse staging, family welcome lane clear"],
  ["15:00", "Mandap ceremony", "Pandit confirmed, floral checks, aisle reserved"],
  ["18:30", "Cocktail hour", "Passed appetizers, portrait window, lounge lighting live"],
  ["20:00", "Reception + speeches", "Head table, AV cues, first dance, plated dinner"],
] as const;

const vendorRows = [
  ["Raj Kapoor Photography", "Photographer", "$4,200", "Booked"],
  ["Spice & Soul Catering", "Caterer", "$11,800", "Booked"],
  ["Mandap Dreams Decor", "Decorator", "$3,500", "Booked"],
  ["DJ Sanj", "DJ / Music", "$2,200", "Quoted"],
  ["Henna by Priya", "Mehendi", "—", "Inquired"],
  ["Toronto Limo Co.", "Transport", "—", "Inquired"],
] as const;

const budgetRows = [
  ["Venue", "$15,000", "$14,500", "96%"],
  ["Catering", "$12,000", "$11,800", "98%"],
  ["Photography", "$5,000", "$4,200", "84%"],
  ["Decor & Florals", "$4,000", "$3,500", "88%"],
  ["DJ & Music", "$2,500", "$0", "0%"],
  ["Mehendi", "$1,000", "$0", "0%"],
] as const;

const permits = [
  ["Venue / Park Permit", "Public parks, gardens, beaches — city regs", "venue"],
  ["Noise / Sound Permit", "Outdoor DJ, dhol, live music — city hall", "venue"],
  ["Liquor License", "Special Occasion Permit for your own bar", "alcohol"],
  ["Food Handler's Permit", "Caterer proof of Safe Food Handling", "food"],
  ["Marriage License", "Local clerk's office, 30-60 days before", "legal"],
  ["Event Insurance", "Accidents, property damage, vendor no-shows", "legal"],
  ["Vendor Business Licenses", "Confirm all vendors have valid licenses", "legal"],
] as const;

const couplePlans = [
  {
    name: "Free Starter",
    label: "Try It Free",
    price: "$0",
    cadence: "no account · no card · browser storage",
    description: "Taste every tool with honest limits. Data lives in your browser — clears if you wipe it. Upgrade to save to the cloud.",
    features: [
      "Budget calculator — 5 line items max",
      "Guest list — up to 25 guests",
      "Checklist — 10 items max",
      "Floor planner — 2D only, 1 saved layout",
      "Vendor CRM — up to 3 vendors",
      "AI chatbot — 5 messages / day",
      "Culture tools — 1 culture (South Asian)",
      "Invoice builder, PDF export, photo storage — locked",
    ],
    cta: "Start Free",
    href: "/tools/",
  },
  {
    name: "Couples Cloud",
    label: "Unlock Everything",
    price: "$4.99",
    cadence: "/ month",
    description: "Cloud sync, unlimited guests, all 9 cultures, 3D floor planner, unlimited AI, photo storage, PDF export.",
    features: [
      "Unlimited guests, vendors, checklist & budget items",
      "2D + 3D floor planner — unlimited saves",
      "Invoice builder + PDF export unlocked",
      "Unlimited AI wedding chatbot",
      "All 9 culture tool pages",
      "Cloud sync across all devices",
      "5GB photo storage + 30-day backup",
      "Share board with partner or planner",
    ],
    cta: "Unlock for $4.99/mo",
    href: "/checkout/couples/",
  },
] as const;


const plannerPlans = [
  {
    name: "Starter",
    label: "Planner Starter",
    price: "$29",
    cadence: "/ month",
    description: "Up to 5 active client weddings.",
    features: [
      "All couple tools for each client",
      "Cloud sync for all clients",
      "Client portal with Weddings.io branding",
      "PDF export for all clients",
      "1 team user account",
      "Basic analytics",
      "5GB storage per client wedding",
    ],
    cta: "Start 14-Day Trial",
    href: "/checkout/planner-starter/",
  },
  {
    name: "Pro",
    label: "Planner Pro",
    price: "$59",
    cadence: "/ month",
    description: "Up to 15 active client weddings.",
    features: [
      "Everything in Starter",
      "White-label client portal",
      "Up to 3 team user accounts",
      "Revenue and analytics dashboard",
      "Priority support",
      "2 TALC.tv credits/month",
      "10GB storage per client wedding",
    ],
    cta: "Start 14-Day Trial",
    href: "/checkout/planner-pro/",
  },
  {
    name: "Studio",
    label: "Planner Studio",
    price: "$99",
    cadence: "/ month",
    description: "Unlimited active client weddings.",
    features: [
      "Everything in Pro",
      "Unlimited team user accounts",
      "Full custom branding",
      "API access",
      "Dedicated account manager",
      "5 TALC.tv credits/month",
      "Unlimited storage per client wedding",
      "Featured verified planner listing",
    ],
    cta: "Start 14-Day Trial",
    href: "/checkout/planner-studio/",
  },
] as const;

const addOns = [
  ["SEO Packages", "IAM Weddings SEO", "$10–$2,000", "/mo · PPP by city", "IAM Weddings SEO — done-for-you SEO built for wedding vendors. City-scoped SEO Marketing Pages, high-authority dofollow backlinks, technical SEO, and real editorial content. Priced by local population × country PPP index, clamped $10–$2,000/mo. We're picky about who we take on.", "See IAM Weddings SEO", "/seo/"],
  ["Guest Post 3-Pack", "High-Authority Dofollow", "$25", "one-time", "Three guest posts with high-authority dofollow backlinks from the IAM domain network. Real content. Pay once. Never expires.", "Get Guest Post Pack", "/backlinks/"],
  ["Guest Post", "Guest Post With Us", "$10", "per accepted post", "Real content, made by real people. High-quality writing, real photos, real work — not AI slop.", "Submit a Guest Post", "/guest-post/"],
  ["EyeSpyR", "Business Verification", "$10", "high authority in SERP & LLM", "Automated review scraping + credential verification + live Trust Badge. Lifts your ranking in Google and in LLM answers.", "Add EyeSpyR Verification", "/eyespyr/"],
] as const;

const countries = [
  ["🇺🇸", "United States", "792 cities"],
  ["🇨🇦", "Canada", "79 cities"],
  ["🇮🇳", "India", "50 cities"],
  ["🇬🇧", "United Kingdom", "23 cities"],
  ["🇵🇰", "Pakistan", "15 cities"],
  ["🇦🇺", "Australia", "12 cities"],
  ["🇧🇩", "Bangladesh", "10 cities"],
  ["🇦🇪", "UAE", "5 cities"],
  ["🇸🇦", "Saudi Arabia", "4 cities"],
  ["🇳🇿", "New Zealand", "4 cities"],
  ["🇱🇰", "Sri Lanka", "3 cities"],
  ["🇲🇾", "Malaysia", "3 cities"],
  ["🇸🇬", "Singapore", "1 city"],
  ["🇶🇦", "Qatar", "1 city"],
  ["🇰🇼", "Kuwait", "1 city"],
  ["🇧🇭", "Bahrain", "1 city"],
  ["🇴🇲", "Oman", "1 city"],
  ["🇿🇦", "South Africa", "2 cities"],
  ["🇰🇪", "Kenya", "2 cities"],
  ["🇫🇯", "Fiji", "2 cities"],
  ["🇲🇺", "Mauritius", "2 cities"],
  ["🇹🇹", "Trinidad & Tobago", "2 cities"],
  ["🇬🇾", "Guyana", "1 city"],
  ["🇸🇷", "Suriname", "1 city"],
] as const;

const traditions = [
  ["🕌", "Punjabi Sikh", "Anand Karaj · Dholki · Mehndi · Haldi · Baraat · Reception"],
  ["🕉️", "Punjabi Hindu", "Sagan · Mehndi · Haldi · Baraat · Phere · Reception"],
  ["🌙", "Muslim / Nikah", "Mehndi · Dholki · Baraat · Nikah · Walima"],
  ["🪔", "Gujarati", "Garba · Mehndi · Haldi · Phere · Reception"],
  ["🌺", "South Indian", "Nichayathartham · Mehndi · Muhurtam · Reception"],
  ["✨", "Intercultural", "Mix and match ceremonies from any tradition — fully customisable"],
] as const;

const founderQuotes = [
  {
    quote:
      "I'm not putting fake five-star reviews on this site. If we don't have real planners on the ground and real content coming out of real weddings, this whole thing isn't worth anything. That's the bar.",
    context: "On why Weddings.io ships with zero fabricated testimonials",
  },
  {
    quote:
      "Every city needs a real human planner who actually shows up. The tech is here to make them 10x more powerful — not to replace them with a chatbot and a stock photo.",
    context: "On the Territory Lock model",
  },
  {
    quote:
      "EyeSpyR exists because the industry lied for a decade. GPS-verified work, verified credentials, real photos from real events — or you don't get to be on the platform. Simple.",
    context: "On verified vendors and real content",
  },
] as const;


function Index() { return <WeddingMagazineHome />; }

function LegacyIndex() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroSection />
      <TechnologiesSection />
      <TrackFaqSection />
      <CultureToolsGrid />
      <BlogSection />
      <DashboardSection />
      <VendorBudgetSection />
      <PricingSection />
      <FootprintSection />
      <TraditionsSection />
      <GreenLightSection />
      <PlannerHubSection />
      <PlannersMessageSection />
      <HowItWorksSection />
      <AuthoritySection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}

function TechnologiesSection() {
  const tracks = [
    {
      id: "couples",
      icon: Smartphone,
      eyebrow: "For Couples",
      title: "Plan your wedding — free",
      copy: "Multi-day, multi-culture, multi-vendor. One free planner that keeps ceremonies, guest lists, budgets, and family logistics in a single place.",
      cta: "Open the Free Planner",
      href: "/tools/",
    },
    {
      id: "vendors",
      icon: ShieldCheck,
      eyebrow: "For Vendors & Planners",
      title: "Get found by real couples — $10/yr",
      copy: "List your business on the Weddings.io directory. Verified profile, real search visibility, no lead-gen commissions or platform fees.",
      cta: "List Your Business — $10/yr",
      href: "/vendors/",
    },
    {
      id: "enterprise",
      icon: Cpu,
      eyebrow: "For Partners & Enterprise",
      title: "Partner with the wedding-tech network",
      copy: "Weddings.io is one flagship inside a broader network of wedding domains, AI tools, and verification infrastructure. Explore partnerships, licensing, and the full stack.",
      cta: "See the Ecosystem",
      href: "/ecosystem",
    },
  ] as const;

  const sectionRef = useRef<HTMLElement | null>(null);
  const seenRef = useRef(new Set<string>());

  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll<HTMLElement>("[data-track-id]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-track-id");
          if (entry.isIntersecting && id && !seenRef.current.has(id)) {
            seenRef.current.add(id);
            trackEvent({ event: "track_selector_view", track: id });
          }
        }
      },
      { threshold: 0.5 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tracks"
      aria-labelledby="tracks-heading"
      className="border-b border-border bg-background px-5 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-primary">
            Plan · List · Partner
          </p>
          <h2 id="tracks-heading" className="font-serif text-3xl leading-tight text-foreground md:text-5xl">
            Pick your track. Skip the rest.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
            Couples plan for free. Vendors get listed for $10/yr. Partners tap into the wider wedding-tech network. Choose one below — everything on this page is tuned to that role.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tracks.map(({ id, icon: Icon, eyebrow, title, copy, cta, href }) => (
            <a
              key={id}
              href={href}
              data-track-id={id}
              onClick={() =>
                trackEvent({ event: "track_selector_click", track: id, href, element: "card" })
              }
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-8 text-left transition hover:-translate-y-0.5 hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">
                  <Icon size={22} />
                </div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  {eyebrow}
                </p>
                <h3 className="mb-3 font-serif text-2xl text-card-foreground">{title}</h3>
                <p className="mb-8 text-sm leading-7 text-muted-foreground">{copy}</p>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  trackEvent({ event: "track_selector_click", track: id, href, element: "cta" });
                  window.location.href = href;
                }}
                role="button"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground transition hover:border-primary hover:text-primary group-hover:gap-3"
              >
                {cta} <ArrowRight size={16} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const trackFaqs = [
  {
    track: "couples",
    q: "Is the wedding planner really free for couples?",
    a: "Yes. Couples plan their entire wedding on Weddings.io for free — multi-day timelines, cultural ceremonies, guest lists, budgets, and vendor coordination. No credit card, no trial expiry.",
    href: "/tools/",
    cta: "Open the free planner",
  },
  {
    track: "couples",
    q: "Does it support multicultural and multi-day weddings?",
    a: "That's what it was built for. Hindu, Sikh, Muslim, South Asian multi-day, Chinese tea ceremonies, Persian Sofreh Aghd, Jewish, Nordic, Hispanic heritage, Western, and fusion — every tool respects the actual customs.",
    href: "/cultures",
    cta: "Browse cultural tools",
  },
  {
    track: "vendors",
    q: "How much does it cost to be listed as a vendor?",
    a: "Two options. The Vendors Directory is $10/year flat, worldwide. The Exclusive Planner slot (one per city, sold on fill) is priced by local population × your country's PPP index — starts at $10/mo in small markets and caps at $2,000/mo in mega-cities. No tiers, no add-ons buried in fine print.",
    href: "/vendors/",
    cta: "List your business",
  },
  {
    track: "vendors",
    q: "What is PPP pricing and why does it matter?",
    a: "PPP (Purchasing Power Parity) scales the price to what a local currency actually buys. A vendor in Mumbai (PPP 0.28) doesn't pay the same USD as a vendor in New York (PPP 1.00) for the same population base — the price is adjusted so it's fair in local terms. Same formula, applied honestly. See the full explainer for the exact math, country factors, and worked examples.",
    href: "/ppp-explained",
    cta: "Read the PPP explainer",
  },
  {
    track: "enterprise",
    q: "What is the Weddings.io network and how is it priced?",
    a: "Weddings.io is the flagship of a broader wedding-tech network — marketplace, EyeSpyR verification, Talc.tv syndication, AI lead capture, press distribution across 16 domains since 2015. Enterprise licensing follows the same PPP-adjusted logic ($10–$2,000/mo per city equivalent). No tiers.",
    href: "/ecosystem",
    cta: "Explore the ecosystem",
  },
  {
    track: "enterprise",
    q: "Can I license, partner, or integrate — and are there hidden fees?",
    a: "Licensing, co-marketing, technology partnerships, and integrations are all on the table for qualified partners. Pricing is a single PPP-adjusted line item, no bundles. Optional extras (Backlink Pack $25, TALC.tv $10/post, Hall Visualizer $2/render, Guest Post $10) are clearly labeled outside the core price.",
    href: "/ecosystem",
    cta: "Partnership options",
  },
] as const;

function TrackFaqSection() {
  return (
    <section
      aria-labelledby="track-faq-heading"
      className="border-b border-border bg-secondary/30 px-5 py-16 md:px-8 md:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.32em] text-primary">
            Answers by track
          </p>
          <h2 id="track-faq-heading" className="font-serif text-2xl leading-tight text-foreground md:text-4xl">
            Common questions from couples, vendors, and partners
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {trackFaqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-border bg-card p-5 open:border-primary/60"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-4 text-left font-serif text-lg text-card-foreground marker:content-['']">
                <span>
                  <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                    {item.track}
                  </span>
                  {item.q}
                </span>
                <ArrowRight
                  size={18}
                  className="mt-1 shrink-0 text-muted-foreground transition group-open:rotate-90"
                />
              </summary>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.a}</p>
              <a
                href={withCityParam(item.href)}
                onClick={() => {
                  trackEvent({
                    event: "track_selector_click",
                    track: item.track,
                    href: item.href,
                    element: "faq",
                  });
                  if (item.href === "/ppp-explained") {
                    trackEvent({ event: "ppp_explainer_click", source: "home_faq" });
                  }
                }}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                {item.cta} <ArrowRight size={14} />
              </a>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}


function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3 md:px-8">
        <a href="/" className="flex items-center gap-3 text-lg font-semibold text-primary">
          <span aria-hidden="true">🪔</span>
          <span>Weddings.io Technologies</span>
        </a>
        <nav
          aria-label="Main navigation"
          className="flex max-w-full flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/pricing"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:opacity-90"
          >
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const categories = [
    "Venues", "Photographers", "Catering", "DJs", "Florists",
    "Planners", "Decorators", "Mehendi", "Videographers", "Transport",
  ];
  const pills = ["Venues", "Photographers", "Planners", "Caterers", "DJs", "Florists", "Decorators"];

  return (
    <section className="relative overflow-hidden border-b border-border bg-background px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-primary">
          Est. May 13, 2015 · 1,018 Cities · 24 Countries · 9 Cultures
        </p>
        <RotatingHeadline />
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Find verified local vendors, plan your ceremony for free, and lock your city before someone
          else does.
        </p>

        {/* DUAL SEARCH BAR */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-center">
          <select
            aria-label="Vendor category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            aria-label="City or postal code"
            placeholder="City or postal code"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
          />
          <a
            href={`/vendors?category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}`}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition hover:opacity-90"
          >
            Find Vendors →
          </a>
        </div>

        {/* CATEGORY PILL BAR */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {pills.map((p) => (
            <a
              key={p}
              href={`/vendors?category=${encodeURIComponent(p)}`}
              className="rounded-full border border-border bg-secondary/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              {p}
            </a>
          ))}
        </div>

        {/* TRUST BADGE */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-xs font-bold text-primary">
            1,400+ Verified Vendors Across the Network
          </span>
        </div>

        {/* STATS */}
        <div className="mt-10 grid grid-cols-2 gap-4 border-t border-border pt-7 md:grid-cols-4">
          <Stat value="1,018" label="Cities" />
          <Stat value="24" label="Countries" />
          <Stat value="9" label="Cultures" />
          <Stat value="$10/mo" label="From" />
        </div>

        <div className="mt-12 grid gap-8 text-left lg:grid-cols-2 lg:items-start">
          <VerificationCard />
          <CultureMosaic />
        </div>
      </div>
    </section>
  );
}

function VerificationCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Green Light</p>
          <h2 className="mt-2 font-serif text-3xl text-card-foreground">Verification</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            No more verbal promises. Photo-verified proof. Every vendor. Every task.
          </p>
        </div>
        <div className="rounded-md border border-border bg-secondary px-3 py-2 text-right text-sm font-bold text-primary">
          6/6 Verified
        </div>
      </div>
      <blockquote className="mb-5 border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
        “If the limo isn't there, the light stays gray.”
      </blockquote>
      <div className="space-y-3">
        {verificationItems.map(([role, task, icon, done]) => (
          <div
            key={role}
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md border border-border bg-secondary/50 p-3"
          >
            <span
              className={`flex size-8 items-center justify-center rounded-full ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {done ? <Check className="size-4" /> : <Clock className="size-4" />}
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {role}
              </p>
              <p className="text-sm font-semibold text-card-foreground">{task}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Photo</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthoritySection() {
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-primary">
          Est. May 13, 2015
        </p>
        <h2 className="font-serif text-4xl text-foreground md:text-6xl">
          A Decade of <em className="text-primary">Authority.</em>
        </h2>
        <div className="mt-9 rounded-lg border border-border bg-card p-7 text-left md:p-10">
          <p className="text-lg leading-8 text-muted-foreground">
            Established on May 13, 2015, Weddings.io is the original digital cornerstone for the
            South Asian wedding industry. While others try to imitate, we have spent over a decade
            building the infrastructure to support the “small guy” and the artisans who make this
            industry world-class.
          </p>
          <p className="mt-5 text-lg font-semibold text-foreground">
            We don't just market; we protect the legacy.
          </p>
        </div>
      </div>
    </section>
  );
}

function DashboardSection() {
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Your Dashboard"
          title="Everything in One Place."
          copy="Schedule, tables, dietary, room map, vendors — all managed from a single dashboard. Built for planners, couples, and the parents running the show."
        />
        <div className="mt-10 rounded-lg border border-border bg-card p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Wedding</p>
              <h3 className="mt-2 font-serif text-3xl text-card-foreground">Priya & Arjun</h3>
              <p className="mt-1 text-sm text-muted-foreground">Toronto · 14 June 2026</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {["Overview", "Schedule", "Room Map", "Tables", "Dietary", "Vendors", "Timeline"].map(
                (item) => (
                  <span key={item} className="rounded-md border border-border px-3 py-2">
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="grid gap-5 py-6 md:grid-cols-4">
            <StatCard label="Guests" value="386" />
            <StatCard label="Tables" value="12" />
            <StatCard label="Dietary tags" value="18" />
            <StatCard label="Shortlisted vendors" value="4" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Panel
              title="Schedule"
              subtitle="Whole wedding weekend at a glance"
              badge="5 key moments locked"
            >
              <div className="space-y-4">
                {schedule.map(([time, title, desc]) => (
                  <div key={time} className="grid grid-cols-[4rem_1fr] gap-4">
                    <span className="text-sm font-bold text-primary">{time}</span>
                    <div>
                      <p className="font-semibold text-card-foreground">{title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel
              title="Room Map"
              subtitle="See the whole room before the wedding day"
              badge="Table 8 selected"
            >
              <div className="rounded-md border border-border bg-secondary/50 p-4">
                <div className="mb-4 rounded-md border border-primary/50 p-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Mandap / Stage
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-md border border-border ${i === 7 ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"} flex items-center justify-center text-sm font-bold`}
                    >
                      T{i + 1}
                    </div>
                  ))}
                </div>
                <div className="my-4 rounded-md bg-muted p-4 text-center text-sm font-semibold text-muted-foreground">
                  Dance Floor
                </div>
              </div>
            </Panel>
            <Panel title="Tables" subtitle="Who sits where" badge="Close to stage">
              <p className="mb-4 text-sm text-muted-foreground">
                Drag guests between tables — dietary tags follow automatically.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["👴👵", "Nani + Nana", "Elder access"],
                  ["🌸", "Bride cousins", "Vegetarian"],
                  ["✈️", "Toronto friends", "No nuts"],
                  ["👶", "Kids table split", "2 high chairs"],
                  ["💃", "Auntie row", "Close to stage"],
                ].map(([icon, title, tag]) => (
                  <MiniRow key={title} icon={icon} title={title} tag={tag} />
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                ♿ 5 guests flagged for elder-access seating near the exit
              </p>
            </Panel>
            <Panel
              title="Dietary"
              subtitle="Track meal needs without spreadsheets"
              badge="Live export"
            >
              <p className="mb-5 text-sm text-muted-foreground">
                Auto-synced from your guest list — caterer gets a live export.
              </p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["🥬", "Vegetarian", "96"],
                  ["🕌", "Jain", "14"],
                  ["🚫", "No nuts", "7"],
                  ["👶", "Kids meals", "11"],
                ].map(([icon, label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-border bg-secondary/40 p-4 text-center"
                  >
                    <div className="text-2xl">{icon}</div>
                    <p className="mt-2 text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

function VendorBudgetSection() {
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Vendor & Budget Tools"
          title="Track Every Vendor. Every Dollar."
          copy="From first inquiry to final receipt — manage vendors, budgets, invoices, and payments all in one place, including PayPal collection. No more spreadsheets."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Panel title="My Vendors" subtitle="Your entire team, one view" badge="6 booked">
            {vendorRows.map(([name, type, price, status]) => (
              <div
                key={name}
                className="mb-3 flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3"
              >
                <div>
                  <p className="font-semibold text-card-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{price}</p>
                  <p className="text-xs text-muted-foreground">{status}</p>
                </div>
              </div>
            ))}
          </Panel>
          <Panel
            title="Budget Tracker"
            subtitle="Know exactly where you stand"
            badge="$18,600 remaining"
          >
            <div className="mb-5 grid grid-cols-3 gap-3 text-center">
              <StatCard label="Total Budget" value="$50,300" />
              <StatCard label="Spent So Far" value="$31,700" />
              <StatCard label="Remaining" value="$18,600" />
            </div>
            {budgetRows.map(([name, budget, spent, width]) => (
              <div key={name} className="mb-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-muted-foreground">
                    {spent} / {budget}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width }} />
                </div>
              </div>
            ))}
          </Panel>
          <Panel
            title="Invoices & Receipts"
            subtitle="Every payment, documented — PayPal ready"
            badge="All · Paid · Pending"
          >
            <div className="space-y-3">
              {[
                ["Raj Kapoor Photography", "$2,100", "50% deposit — wedding day shoot", "Paid"],
                ["Spice & Soul Catering", "$3,540", "Menu tasting + booking deposit", "Paid"],
                ["Mandap Dreams Decor", "$3,500", "Full decor package — mandap + stage", "Paid"],
                ["Raj Kapoor Photography", "$2,100", "Remaining balance due", "Pending"],
                ["Spice & Soul Catering", "$8,260", "Final headcount adjustment", "Pending"],
              ].map(([name, price, note, status]) => (
                <div
                  key={`${name}-${note}`}
                  className="rounded-md border border-border bg-secondary/40 p-3"
                >
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold text-card-foreground">{name}</p>
                    <p className="font-bold text-primary">{price}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-primary">
                    {status}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <FileText className="size-6 text-primary" />
            <div>
              <h3 className="font-serif text-2xl text-card-foreground">Permits & Licenses</h3>
              <p className="text-sm text-muted-foreground">
                Don't get caught without these — every city has different rules.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {permits.map(([name, desc, tag]) => (
              <div key={name} className="rounded-md border border-border bg-secondary/40 p-4">
                <p className="font-semibold text-card-foreground">{name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-primary">
                  {tag}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-primary">3 of 7 done</p>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl space-y-16">
        <SectionIntro
          eyebrow="Master Pricing · Source of Truth"
          title="All pricing. One place."
          copy="Couples plan free. Vendors pay only for what they lock. No bundles, no retainers, no contracts."
        />

        <div id="couples">
          <SectionIntro
            eyebrow="Section 1 · For Couples"
            title="Plan your wedding free."
            copy="Every tool is free. We only charge for cloud sync and photo storage."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {couplePlans.map((plan) => (
              <PlanCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>

        <div id="planners">
          <SectionIntro
            eyebrow="Section 2 · For Planners & Vendors"
            title="Planner pages start at $10/month."
            copy="One exclusive planner per city, priced by local population. Starts at $10/month for the smallest markets and scales up from there — the largest cities we currently serve top out around $2,000/month. No tiers, no add-ons buried in fine print."
          />
          <CityPriceCalculator />
        </div>


        <TerritoryPricingBlock />


        <div id="addons">
          <SectionIntro
            eyebrow="Section 5 · Add-Ons"
            title="Pay for what you use."
            copy="No bundles. No retainers. Every add-on is à la carte and works on any plan — including free."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-4">
            {addOns.map(([name, label, price, cadence, description, cta, href]) => (
              <PlanCard
                key={name}
                name={name}
                label={label}
                price={price}
                cadence={cadence}
                description={description}
                features={[]}
                cta={cta}
                href={href}
              />
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-dashed border-border bg-secondary/40 p-5">
            <p className="font-serif text-xl text-primary">Guest Posting — $10</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Permanent byline, dofollow backlinks, and an author profile at /contributors/[name]/.
              Pitch partnerships@industryarmymarketing.com with subject “Guest Post: [Your Title]”.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CityPriceCalculator() {
  const defaultCity =
    SUPPORTED_CITIES.find((c) => c.city === "Vancouver, BC") ?? SUPPORTED_CITIES[0];
  const [selected, setSelected] = useState<SupportedCity>(defaultCity);
  const [showInfo, setShowInfo] = useState(false);
  const [tooltipTracked, setTooltipTracked] = useState(false);
  const [tracked, setTracked] = useState<Set<string>>(new Set());
  const changeCountRef = useRef(0);
  const impressionRef = useRef<HTMLDivElement | null>(null);
  const impressionFiredRef = useRef(false);

  // Hydrate from ?city= URL param or localStorage on mount so the user's PPP
  // choice survives navigation to the FAQ, PPP explainer, and signup flows.
  useEffect(() => {
    const initial = loadInitialCity(defaultCity);
    if (initial.city !== defaultCity.city) setSelected(initial);
    persistCity(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthly = priceForCity(selected);
  const ppp = pppIndex(selected.country);
  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

  useEffect(() => {
    if (impressionFiredRef.current) return;
    const el = impressionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      trackEvent({ event: "pricing_calculator_impression", location: "home_city_calculator" });
      impressionFiredRef.current = true;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !impressionFiredRef.current) {
            impressionFiredRef.current = true;
            trackEvent({
              event: "pricing_calculator_impression",
              location: "home_city_calculator",
            });
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleCityChange = (cityName: string) => {
    const next = SUPPORTED_CITIES.find((c) => c.city === cityName);
    if (!next) return;
    setSelected(next);
    persistCity(next);
    changeCountRef.current += 1;
    const nextPpp = pppIndex(next.country);
    const nextMonthly = priceForCity(next);
    trackEvent({
      event: "pricing_calculator_form_change",
      city: next.city,
      country: next.country,
      ppp: nextPpp,
      monthly_usd: nextMonthly,
      change_count: changeCountRef.current,
    });
    if (!tracked.has(cityName)) {
      trackEvent({
        event: "pricing_calculator_city_selected",
        city: next.city,
        country: next.country,
        ppp: nextPpp,
        monthly_usd: nextMonthly,
      });
      setTracked((prev) => new Set(prev).add(cityName));
    }
  };

  const handleSubmit = (destination: string) => {
    trackEvent({
      event: "pricing_calculator_submit",
      city: selected.city,
      country: selected.country,
      ppp,
      monthly_usd: monthly,
      destination,
    });
  };

  const handleExplainerClick = (source: "home_calculator_body" | "home_calculator_tooltip" | "home_calculator_cta") => {
    trackEvent({
      event: "ppp_explainer_click",
      source,
      city: selected.city,
      country: selected.country,
      ppp,
      monthly_usd: monthly,
    });
  };

  const handleTooltipToggle = () => {
    setShowInfo((v) => {
      const next = !v;
      if (next && !tooltipTracked) {
        trackEvent({ event: "pricing_tooltip_viewed", location: "home_city_calculator" });
        setTooltipTracked(true);
      }
      return next;
    });
  };

  const pricingHref = withCityParam("/pricing", selected);
  const explainerHref = withCityParam("/ppp-explained", selected);

  return (
    <div
      ref={impressionRef}
      className="mt-8 rounded-lg border border-primary/40 bg-card p-6 md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            City Price Calculator · Monthly · USD · PPP-adjusted
          </p>
          <p className="mt-2 font-serif text-2xl text-foreground md:text-3xl">
            1 exclusive planner · <span className="text-primary">{fmt(monthly)}/mo</span>{" "}
            <span className="text-base font-normal text-muted-foreground">USD</span>
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="How pricing is calculated"
            aria-expanded={showInfo}
            onClick={handleTooltipToggle}
            onBlur={() => setShowInfo(false)}
            className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
          >
            How is this calculated?
          </button>
          {showInfo && (
            <div
              role="tooltip"
              className="absolute right-0 z-10 mt-2 w-80 rounded-md border border-border bg-popover p-3 text-xs leading-5 text-popover-foreground shadow-lg"
            >
              Base: $10 per 100K city population. Multiplied by your country's PPP index
              (US = 1.00, {selected.country} = {ppp.toFixed(2)}), rounded to the nearest $10,
              clamped to ${MIN_MONTHLY_PRICE}–${MAX_MONTHLY_PRICE}/mo. One exclusive planner
              per city — sold out the moment that slot is filled.{" "}
              <a
                href={explainerHref}
                onClick={() => handleExplainerClick("home_calculator_tooltip")}
                className="underline hover:text-primary"
              >
                Full PPP explainer →
              </a>
            </div>
          )}
        </div>
      </div>

      <label className="mt-6 block text-sm font-medium text-muted-foreground" htmlFor="planner-city">
        Your city — price updates live as you change this (saved in your URL and browser)
      </label>
      <select
        id="planner-city"
        value={selected.city}
        onChange={(e) => handleCityChange(e.target.value)}
        className="mt-2 w-full max-w-md rounded-md border border-border bg-background px-3 py-2 font-mono text-base text-foreground focus:border-primary focus:outline-none"
      >
        {SUPPORTED_CITIES.map((c) => (
          <option key={c.city} value={c.city}>
            {c.city} · {c.populationLabel} · {c.countryName}
          </option>
        ))}
      </select>

      <p className="mt-5 font-serif text-3xl text-foreground">
        <span className="text-primary">{fmt(monthly)}</span>{" "}
        <span className="text-base text-muted-foreground">
          USD per month · billed monthly · 1 exclusive planner
        </span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {selected.city} · population {selected.population.toLocaleString("en-US")} ·{" "}
        {selected.countryName} PPP {ppp.toFixed(2)} · capped at ${MAX_MONTHLY_PRICE}/mo ·
        recalculated instantly on every city change
      </p>

      <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
        All prices are monthly, in US dollars, and update immediately when you pick a different
        city. Your selection is saved in the page URL and your browser, so it stays with you
        through the FAQ, the PPP explainer, and signup. No tiers. No add-ons buried in fine
        print. Add-ons (Guest Post, TALC.tv, Backlink Pack, Hall Visualizer) are
        clearly-labeled optional extras outside the core price.{" "}
        <a
          href={explainerHref}
          onClick={() => handleExplainerClick("home_calculator_body")}
          className="font-semibold text-primary hover:underline"
        >
          What is PPP and how does it affect my price? →
        </a>
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={pricingHref}
          onClick={() => handleSubmit("/pricing")}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90"
        >
          See Full PPP Pricing →
        </a>
        <a
          href={explainerHref}
          onClick={() => {
            handleSubmit("/ppp-explained");
            handleExplainerClick("home_calculator_cta");
          }}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary"
        >
          PPP Explainer
        </a>
      </div>
    </div>
  );
}


const territoryExamples: ReadonlyArray<{
  city: string;
  detail: string;
  price: string;
  href: string;
  talk?: boolean;
}> = [
  { city: "Small markets", detail: "Under 200K population · 1 exclusive planner", price: "$10/mo", href: "/apply" },
  { city: "Colombo, LK", detail: "750K · PPP 0.35 · 1 exclusive planner", price: "$10/mo", href: "/apply" },
  { city: "Vancouver, BC", detail: "675K · PPP 0.85 · 1 exclusive planner", price: `$${priceForCity(SUPPORTED_CITIES.find((c) => c.city === "Vancouver, BC")!)}/mo`, href: "/apply" },
  { city: "Toronto, ON", detail: "2.9M · PPP 0.85 · 1 exclusive planner", price: `$${priceForCity(SUPPORTED_CITIES.find((c) => c.city === "Toronto, ON")!)}/mo`, href: "/apply" },
  { city: "London, UK", detail: "9M · PPP 0.72 · 1 exclusive planner", price: `$${priceForCity(SUPPORTED_CITIES.find((c) => c.city === "London")!)}/mo`, href: "/apply" },
  { city: "Mumbai, IN", detail: "20M · PPP 0.28 · 1 exclusive planner", price: `$${priceForCity(SUPPORTED_CITIES.find((c) => c.city === "Mumbai")!)}/mo`, href: "/partners", talk: true },
];


const accessTiers = [
  {
    n: "01",
    name: "Vendors Directory",
    price: "$10 / year",
    tagline: "Flat annual listing. EyeSpyR verified. Bidding-ready.",
    body: "Every vendor starts here — $10/year, flat, regardless of city or country. Your verified profile opens into our bidding & contractor matching process, where couples and planners send briefs and you quote the work.",
    cta: "Apply · $10/yr",
    href: "/directory",
  },
  {
    n: "02",
    name: "Exclusive Planner — City Territory",
    price: "$10–$2,000/mo",
    tagline: "One exclusive planner per city, PPP-adjusted.",
    body: "One exclusive planner slot per city, priced by local population × your country's PPP index. Starts at $10/mo in the smallest markets and caps at $2,000/mo in mega-cities. No tiers. No add-ons buried in fine print. SOLD OUT the moment that single slot is filled.",
    cta: "Apply for Territory",
    href: "/apply",
  },
  {
    n: "03",
    name: "Partnership",
    price: "Talc Credits",
    tagline: "Megacity partners & rising stars.",
    body: "For districts over 2M and vendors we want to build with long-term. Talc credits as currency. Every partnership is a conversation.",
    cta: "Talk to Us",
    href: "/partners",
  },
] as const;

function TerritoryPricingBlock() {
  const GOLD = "#c9a96e";
  const GOLD_SOFT = "#c9a96e33";
  const GOLD_GLOW = "0 0 0 1px #c9a96e, 0 0 40px rgba(201,169,110,0.35), 0 0 80px rgba(201,169,110,0.18)";
  const CREAM = "#f2efe8";
  const CREAM_DIM = "#f2efe8b3";

  const tiers = [
    {
      eyebrow: "Baseline",
      name: "Annual Listing",
      price: "$10",
      priceSuffix: "/year",
      tagline: "Basic Listing · No EyeSpyR",
      features: [
        "Business name on directory",
        "Phone & address listed",
        "Service area shown",
        "Permanent placement",
        "EyeSpyR locked (upgrade to monthly)",
      ],
      cta: "Get Listed",
      featured: false,
    },
    {
      eyebrow: "Exclusive Planner",
      name: "City Commander",
      price: "$10–$2,000",
      priceSuffix: "/mo, PPP-adjusted",
      tagline: "One exclusive planner per city",
      features: [
        "1 exclusive planner slot per city (sold out on fill)",
        "Population × country PPP index, clamped $10–$2,000/mo",
        "City landing page with domain authority",
        "EyeSpyR INCLUDED — review scraping + verification",
        "No tiers, no bundles, no buried add-ons",
        "Cancel anytime with 30 days notice",
      ],
      cta: "Claim Your City",
      featured: true,
      badge: "LOCK OUT COMPETITORS",
    },
    {
      eyebrow: "Content",
      name: "TALC.tv Blast",
      price: "$10",
      priceSuffix: "/post",
      tagline: "Anyone · Anytime · No Lock Required",
      features: [
        "One completed project photo",
        "AI generates 2,000-word SEO post",
        "Auto-published to city page + GMB",
        "Permanent backlink to your site",
        "No retainer — pay per win",
      ],
      cta: "Submit a Blast",
      featured: false,
    },
  ];

  return (
    <div
      id="territory"
      className="rounded-lg border p-6 md:p-10"
      style={{ backgroundColor: "#080808", borderColor: GOLD_SOFT, color: CREAM }}
    >
      <p
        className="mb-4 text-xs font-semibold uppercase tracking-[0.32em]"
        style={{ color: GOLD }}
      >
        Section 3 · Pricing
      </p>
      <h3
        className="max-w-3xl font-serif text-4xl leading-tight md:text-5xl"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: CREAM }}
      >
        Exclusive city planners. $10–$2,000/mo, PPP-adjusted.
      </h3>
      <p
        className="mt-4 max-w-2xl text-base leading-7"
        style={{ fontFamily: "Inter, sans-serif", color: "#f2efe8cc" }}
      >
        One exclusive planner slot per city — priced by local population × your country's PPP
        index, clamped between $10 and $2,000/mo. No tiers. No add-ons buried in fine print.
        Optional extras (Guest Post, TALC.tv, Backlink Pack, Hall Visualizer) are clearly labeled
        outside the core price.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3 md:items-stretch">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="relative flex flex-col rounded-lg border p-7"
            style={{
              backgroundColor: "#0d0d0d",
              borderColor: tier.featured ? GOLD : GOLD_SOFT,
              boxShadow: tier.featured ? GOLD_GLOW : undefined,
              transform: tier.featured ? "translateY(-8px)" : undefined,
            }}
          >
            {tier.featured && tier.badge && (
              <span
                className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ backgroundColor: GOLD, color: "#0a0a0a", fontFamily: "Inter, sans-serif" }}
              >
                {tier.badge}
              </span>
            )}
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: CREAM_DIM, fontFamily: "Inter, sans-serif" }}
            >
              {tier.eyebrow}
            </p>
            <h4
              className="mt-3 text-2xl font-bold uppercase tracking-[0.08em]"
              style={{ color: CREAM, fontFamily: "Inter, sans-serif" }}
            >
              {tier.name}
            </h4>
            <p className="mt-6">
              <span
                className="text-6xl font-bold leading-none"
                style={{ color: GOLD, fontFamily: "Inter, sans-serif" }}
              >
                {tier.price}
              </span>
              <span className="ml-1 text-sm" style={{ color: CREAM_DIM }}>
                {tier.priceSuffix}
              </span>
            </p>
            <p
              className="mt-4 text-sm leading-6"
              style={{ color: CREAM_DIM, fontFamily: "Inter, sans-serif" }}
            >
              {tier.tagline}
            </p>
            <div className="my-6 h-px w-full" style={{ backgroundColor: GOLD_SOFT }} />
            <ul className="flex-1 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm leading-6" style={{ color: CREAM }}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                  <span style={{ fontFamily: "Inter, sans-serif" }}>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <GatewayComingSoon
                context={tier.cta}
                subject={`${tier.name} — early access`}
                variant={tier.featured ? "primary" : "ghost"}
              />
            </div>
          </div>
        ))}
      </div>

      <p
        className="mt-10 text-center text-xs uppercase tracking-[0.22em]"
        style={{ fontFamily: "Inter, sans-serif", color: "#f2efe880" }}
      >
        1 territory per city · Same formula worldwide · PayPal supported at launch
      </p>
    </div>
  );
}


function FootprintSection() {

  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="The Global Footprint"
          title="The World's Wedding Disruptor. Est. 2015."
          copy="9 cultures. Territory-locked vendors. $10/month."
        />
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {countries.map(([flag, name]) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5"
            >
              <span className="text-xl leading-none">{flag}</span>
              <p className="text-sm font-medium text-card-foreground truncate">{name}</p>
            </div>
          ))}
        </div>
        <a
          href="/cities"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          Explore All 1,018 Cities <Globe2 className="size-4" />
        </a>
      </div>
    </section>
  );
}

function TraditionsSection() {
  return (
    <section className="border-b border-border bg-secondary/30 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Traditions Supported"
          title="Your ceremony. Your task list."
          copy="Choose a tradition in the New Wedding Wizard and the right ceremonies, tasks, vendor checklist, and permit requirements generate automatically."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {traditions.map(([icon, name, desc]) => (
            <div key={name} className="rounded-lg border border-border bg-card p-6">
              <div className="text-3xl">{icon}</div>
              <h3 className="mt-4 font-serif text-2xl text-card-foreground">{name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GreenLightSection() {
  const steps = [
    [
      "Step 1 — Vendor Action",
      "Caterer snaps a photo of the buffet.",
      "Vendor uploads proof of delivery via the Talc.tv app.",
    ],
    [
      "Step 2 — TALC.tv Sync",
      "AI verifies location and quality via EyeSpyR.",
      "GPS coordinates confirm the vendor is on-site. AI checks photo quality.",
    ],
    [
      "Step 3 — The Green Light",
      "The couple's dashboard flips to GREEN.",
      "Task Complete. Real-time confirmation — no phone calls, no stress.",
    ],
  ];
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="The “Green Light”"
          title="Real-Time Logistics. Zero Stress."
          copy="Don't wonder if the car is on its way or if the hall is ready. See it live. Powered by Talc.tv and EyeSpyR GPS verification."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {steps.map(([kicker, title, desc]) => (
            <div key={kicker} className="rounded-lg border border-border bg-card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{kicker}</p>
              <h3 className="mt-4 font-serif text-2xl text-card-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <LiveStatus />
          <div className="rounded-lg border border-border bg-card p-7">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Day-Of Mode
            </p>
            <h3 className="mt-3 font-serif text-4xl text-card-foreground">
              The wedding day runs on green.
            </h3>
            <p className="mt-5 leading-7 text-muted-foreground">
              Every task has one job on the day — get flipped green. Large tap targets, minimal
              distractions, designed to be used in a lehenga with one hand while coordinating six
              things at once.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                [Camera, "Photo proof — mandatory photo before tasks can go green"],
                [Clock, "Overdue alerts — tasks past their time pulse red"],
                [ShieldCheck, "Private by default — staff never see vendor names or prices"],
                [Check, "Staff see their tasks only — filtered to what they need next"],
              ].map(([Icon, text]) => (
                <div
                  key={text as string}
                  className="flex gap-3 rounded-md border border-border bg-secondary/40 p-4"
                >
                  <Icon className="mt-1 size-5 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{text as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlannerHubSection() {
  return (
    <section className="border-b border-border bg-secondary/30 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="The Planner Hub"
          title="Built for Weddings Worldwide."
          copy="A global weddings technologies marketplace — accessible to every couple and every planner. Manage your entire vendor fleet from one Talc.tv dashboard with one-click SEO blasts for every event."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [
              MapPin,
              "Claim Your Territory",
              "Exclusive city locks starting at $10/month. One vendor per city — pricing follows the hardcoded population matrix.",
              "1,018 cities across 24 countries",
            ],
            [
              Globe2,
              "SEO Landing Pages",
              "Every city gets a multi-language SEO page — Hindi, Urdu, Arabic, Bengali, Tamil, Malay, English.",
              "7 languages, automatic RTL",
            ],
            [
              Camera,
              "TALC.tv Content Blasts",
              "One photo becomes a 2,000-word AI blog pushed to weddings.io, Google My Business, X, Facebook, Instagram.",
              "Powered by EyeSpyR GPS verification",
            ],
          ].map(([Icon, title, desc, note]) => (
            <div key={title as string} className="rounded-lg border border-border bg-card p-6">
              <Icon className="size-7 text-primary" />
              <h3 className="mt-4 font-serif text-2xl text-card-foreground">{title as string}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{desc as string}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {note as string}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlannersMessageSection() {
  return (
    <section className="border-b border-border bg-background px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-primary">
          A Message To Planners
        </p>
        <h2 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
          Who is this for?
        </h2>
        <p className="mt-6 text-xl leading-9 text-muted-foreground">
          People doing great work — and serious about expressing it online as well.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          If you plan real weddings, show up for real couples, and want a platform that treats your
          craft with the same seriousness you bring to the aisle — you're the reason this exists.
          One planner per city. Verified work. Real reviews. No stock. No fakes. No AI slop.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <GatewayComingSoon context="Planner application" subject="Planner application — early access" />
          <a
            href="/pricing"
            className="inline-flex rounded-md border border-border px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary"
          >
            See Pricing
          </a>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-primary">
          Learn More
        </p>
        <h2 className="font-serif text-4xl text-foreground md:text-6xl">
          How It Works For Wedding Planners Marketing
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Watch how vendors lock territories, couples find planners, and TALC.tv distributes content
          across the platform — all from a single dashboard. Built for weddings worldwide.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Lock a city", "Become the exclusive vendor"],
            ["2", "Couples find you", "SEO pages in 7 languages"],
            ["3", "TALC.tv amplifies", "$10 content blasts everywhere"],
          ].map(([num, title, desc]) => (
            <div key={num} className="rounded-lg border border-border bg-card p-6">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {num}
              </div>
              <h3 className="mt-5 font-serif text-2xl text-card-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-primary/30 bg-primary/5 p-6 text-left md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
            For Planners
          </p>
          <p className="mt-3 font-serif text-2xl leading-snug text-foreground md:text-3xl">
            Manage your entire vendor fleet from one Talc.tv dashboard.
          </p>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            One-click SEO blasts for every event — built for the largest, most complex weddings
            in the world.
          </p>
        </div>

        <a
          href="/pricing"
          className="mt-8 inline-flex rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Get Started Today
        </a>
      </div>
    </section>

  );
}

function BlogSection() {
  const latestPosts = homepageCarouselPosts.slice(0, 4);


  return (
    <section className="border-b border-border bg-secondary/30 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Latest from the Blog
            </p>
            <h2 className="font-serif text-4xl text-foreground md:text-5xl">
              From the Weddings.io blog
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Culture guides, territory pricing, vendor trust, and industry reporting.
            </p>
          </div>
          <a href="/blog/" className="text-sm font-bold text-primary">
            View all {blogPosts.length} posts →
          </a>
        </div>

        <EcosystemVideo
          className="mb-10"
          autoplayOnView
          showCaption
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {latestPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="/blog/" className="inline-flex rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            View all posts →
          </a>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="border-b border-border bg-secondary/20 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Straight from the Founder"
          title="No fake reviews. Real planners. Real content. Or this isn't worth building."
          copy="We refuse to fabricate testimonials. Instead, here's what the founder has said about why this platform only works with real humans on the ground and verified work from real weddings."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {founderQuotes.map(({ quote, context }) => (
            <figure key={context} className="flex h-full flex-col rounded-lg border border-border bg-card p-7">
              <blockquote className="flex-1 text-lg leading-8 text-card-foreground">
                <span className="mr-1 font-serif text-3xl text-primary">“</span>
                {quote}
                <span className="ml-1 font-serif text-3xl text-primary">”</span>
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="font-bold text-primary">Weddings.io Founder</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {context}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 grid gap-4 rounded-xl border border-primary/40 bg-primary/5 p-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Are you a real planner?</p>
            <h3 className="mt-3 font-serif text-3xl text-foreground">Claim your city before someone else does.</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              One planner per city. Verified credentials. Verified work. If that's you, we want you on the platform.
            </p>
            <div className="mt-5">
              <GatewayComingSoon
                context="Real planner application"
                subject="Real planner application — early access"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Do you make real content?</p>
            <h3 className="mt-3 font-serif text-3xl text-foreground">Submit real work from a real wedding.</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Photographers, videographers, planners, decor teams — send verified work and get distributed on TALC.tv.
              No stock. No fakes. No AI slop.
            </p>
            <a
              href="/guest-post/"
              className="mt-5 inline-flex rounded-md border-2 border-primary px-5 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Submit Real Content →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


function Footer() {
  const ecosystem = [
    { url: "https://weddings.io", label: "Weddings.io", note: "Flagship platform · est. 2015" },
    { url: "https://weddingsaas.com", label: "WeddingSaaS.com", note: "Multi-tenant SaaS engine" },
  ];
  const hubs = [
    { url: "https://brides.ltd", label: "Brides.ltd", note: "Bridal planning hub" },
    { url: "https://grooms.ltd", label: "Grooms.ltd", note: "Groom planning hub" },
    { url: "https://parents.ltd", label: "Parents.ltd", note: "Parents of the couple" },
    { url: "https://jewellers.ltd", label: "Jewellers.ltd", note: "Bridal jewellery" },
    { url: "https://videographers.io", label: "Videographers.io", note: "Videographer directory" },
    { url: "https://caterers.tv", label: "Caterers.tv", note: "Catering and event showcase" },
    { url: "https://shaadi.ltd", label: "Shaadi.ltd", note: "South Asian wedding hub" },
    { url: "https://insurancebrokers.io", label: "InsuranceBrokers.io", note: "Wedding insurance network" },
    { url: "https://weddings.ltd", label: "Weddings.ltd", note: "Wedding directory" },
    { url: "https://pressrelease.ltd", label: "PressRelease.ltd", note: "Industry distribution" },
    { url: "https://ipos.ltd", label: "IPOs.ltd", note: "Market & company intelligence" },
    { url: "https://talc.tv", label: "TALC.tv", note: "Proof-of-work media" },
  ];
  return (
    <footer className="px-5 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">Weddings.io Technologies</p>
        <h2 className="mt-3 font-serif text-4xl text-foreground">Est. 2015 · Ecosystem SaaS Marketplace</h2>
        <p className="mt-5 max-w-4xl leading-7 text-muted-foreground">
          Weddings.io Technologies is the corporate technology entity behind a traditional &
          multicultural wedding ecosystem — a state-of-the-art multi-tenant SaaS stack, adjustable
          in minutes, powering an interconnected network of consumer and industry hubs that help
          every business partner in the wedding industry grow together.
        </p>
        <p className="mt-5 text-sm font-semibold text-foreground">
          Partnerships & Opportunities: partnerships@industryarmymarketing.com
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">The Ecosystem</p>
            <ul className="space-y-3 text-sm">
              {ecosystem.map((d) => (
                <li key={d.url}>
                  <a href={d.url} rel="me noopener" className="block text-foreground transition hover:text-primary">
                    <span className="font-mono font-semibold">{d.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{d.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">Connected Industry Hubs</p>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {hubs.map((d) => (
                <li key={d.url}>
                  <a href={d.url} rel="me noopener" className="block text-foreground transition hover:text-primary">
                    <span className="font-mono font-semibold">{d.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{d.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 grid gap-8 md:grid-cols-3">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">Cultures Served</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><a href="/cultures/" className="hover:text-primary">All cultures & traditions</a></li>
              <li><a href="/tools/traditional/" className="hover:text-primary">Traditional & Religious</a></li>
              <li><a href="/tools/south-asian/" className="hover:text-primary">South Asian</a></li>
              <li><a href="/tools/chinese/" className="hover:text-primary">Chinese</a></li>
              <li><a href="/tools/persian/" className="hover:text-primary">Persian</a></li>
              <li><a href="/tools/jewish/" className="hover:text-primary">Jewish</a></li>
              <li><a href="/tools/mexican/" className="hover:text-primary">Hispanic Heritage</a></li>
              <li><a href="/tools/nordic/" className="hover:text-primary">Nordic</a></li>
              <li><a href="/tools/southeast-asian/" className="hover:text-primary">Southeast Asian</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">For Vendors & Planners</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><a href="/pricing" className="hover:text-primary">Pricing</a></li>
              <li><a href="/planners" className="hover:text-primary">Planners</a></li>
              <li><a href="/vendors" className="hover:text-primary">Vendor directory</a></li>
              <li><a href="/contribute" className="hover:text-primary">Contribute</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">Technology</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>Multi-tenant SaaS engine</li>
              <li>Adjustable stack — reshaped in minutes</li>
              <li>Ecosystem marketplace</li>
              <li>SEO directory infrastructure</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 text-xs leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Weddings.io Technologies — wedding SaaS ecosystem operated by Industry Army Marketing, Langley, British Columbia, Canada. Est. May 13, 2015. Not affiliated with Weddings.io Inc. (Ontario, 2024), AIWeddings.io, or any variant-suffix entity.</strong>{" "}
            © 2015–2026 Weddings.io Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="max-w-3xl">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h2 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">{title}</h2>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">{copy}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl text-primary">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-4">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
function Panel({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{title}</p>
          <h3 className="mt-2 font-serif text-2xl text-card-foreground">{subtitle}</h3>
        </div>
        <span className="rounded-md border border-border bg-secondary px-3 py-1 text-xs font-bold text-primary">
          {badge}
        </span>
      </div>
      {children}
    </section>
  );
}
function MiniRow({ icon, title, tag }: { icon: string; title: string; tag: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3">
      <p className="font-semibold text-card-foreground">
        <span className="mr-2">{icon}</span>
        {title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{tag}</p>
    </div>
  );
}
function PlanCard({
  name,
  label,
  price,
  cadence,
  description,
  features,
  cta,
  href = "/pricing/",
}: {
  name: string;
  label: string;
  price: string;
  cadence: string;
  description: string;
  features: readonly string[];
  cta: string;
  href?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">{name}</p>
      <h3 className="mt-3 font-serif text-3xl text-card-foreground">{label}</h3>
      <div className="mt-5 flex items-end gap-2">
        <span className="text-5xl font-bold text-primary">{price}</span>
        <span className="text-sm text-muted-foreground">{cadence}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
      <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
        {features.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-0.5 size-4 text-primary" />
            {item}
          </li>
        ))}
      </ul>
      {isGatewayHref(href) ? (
        <div className="mt-6 block text-center">
          <GatewayComingSoon context={cta} subject={`${cta} — early access`} />
        </div>
      ) : (
        <a
          href={href}
          className="mt-6 block rounded-md bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground"
        >
          {cta}
        </a>
      )}
    </div>
  );
}

function PricingTable({ headers, rows }: { headers: readonly string[]; rows: readonly (readonly string[])[] }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[680px] border-collapse bg-card text-left text-sm">
        <thead className="bg-secondary/70 text-xs uppercase tracking-[0.18em] text-primary">
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-border px-4 py-3 font-bold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")} className="border-b border-border/60 last:border-b-0">
              {row.map((cell) => (
                <td key={cell} className="px-4 py-3 text-muted-foreground first:font-semibold first:text-card-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Callout({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{title}</p>
      <p className="mt-3 font-serif text-2xl text-card-foreground">{value}</p>
    </div>
  );
}
function LiveStatus() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            W
          </div>
          <div>
            <p className="font-bold text-card-foreground">Weddings.io</p>
            <p className="text-xs text-muted-foreground">Patel-Singh Wedding</p>
          </div>
        </div>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
          LIVE
        </span>
      </div>
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">
        Wedding Day Status
      </p>
      <div className="grid grid-cols-3 gap-3">
        {[
          [Utensils, "Catering"],
          [MapPin, "Transport"],
          [Sparkles, "Décor"],
          [Camera, "Photo"],
          [DollarSign, "Music"],
          [ShieldCheck, "Attire"],
        ].map(([Icon, label]) => (
          <div
            key={label as string}
            className="rounded-md border border-border bg-secondary/40 p-3 text-center"
          >
            <Icon className="mx-auto size-5 text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">{label as string}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted-foreground">Live demo — statuses cycle automatically</p>
      <div className="mt-5 space-y-3 text-sm">
        {[
          "Mandap setup confirmed",
          "Priest arrival checked",
          "Catering headcount confirm",
          "Baraat arrival — gate ready",
          "DJ sound check done",
        ].map((item, index) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3"
          >
            <span>{item}</span>
            <span className={index === 2 ? "text-destructive" : "text-primary"}>
              {index === 2 ? "OVERDUE" : "Green"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
