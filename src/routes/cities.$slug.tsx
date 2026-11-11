import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findCityEntry, formatCityPrice, type CityEntry } from "@/lib/cityDirectory";

function metaFor(city: CityEntry) {
  const title = `${city.name} Wedding Planner App — Exclusive Territory | Weddings.io`;
  const description = `The #1 wedding planning platform for planners in ${city.name}. Multicultural CRM, client portal, vendor coordination and lead tools. One exclusive ${city.name} territory slot from ${formatCityPrice(city)}.`;
  const canonical = `https://weddings.io/cities/${city.slug}`;
  return { title, description, canonical };
}

export const Route = createFileRoute("/cities/$slug")({
  loader: ({ params }) => {
    const city = findCityEntry(params.slug);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "City not found | Weddings.io" }, { name: "robots", content: "noindex" }],
      };
    }
    const city = loaderData.city;
    const { title, description, canonical } = metaFor(city);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { property: "og:site_name", content: "Weddings.io" },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                name: `Weddings.io — ${city.name} Wedding Planner App`,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web, iOS, Android",
                url: canonical,
                description,
                publisher: { "@id": "https://weddings.io/#organization" },
              },
              {
                "@type": "Service",
                "@id": `${canonical}#service`,
                name: `Weddings.io wedding planning platform for ${city.name}`,
                url: canonical,
                areaServed: {
                  "@type": "City",
                  name: city.name,
                  containedInPlace: { "@type": "Country", name: city.countryName },
                },
                provider: { "@id": "https://weddings.io/#organization" },
              },
              {
                "@type": "WebPage",
                "@id": `${canonical}#webpage`,
                url: canonical,
                name: title,
                description,
                mainEntity: { "@id": `${canonical}#service` },
                isPartOf: { "@id": "https://weddings.io/#website" },
              },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-foreground">City territory not found</h1>
      <p className="mt-3 text-muted-foreground">
        We don&apos;t have a page for that city yet.
      </p>
      <Link to="/cities" className="mt-6 inline-block text-primary underline underline-offset-4">
        Browse all cities
      </Link>
    </main>
  ),
  component: CityPage,
});

function CityPage() {
  const { city } = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/cities" className="underline-offset-4 hover:underline">
          Cities
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{city.name}</span>
      </nav>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground">
        The #1 app for wedding planners in {city.name}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          <span aria-hidden="true" className="mr-1">
            {city.flag}
          </span>
          {city.countryName}
        </span>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {formatCityPrice(city)}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {city.status === "available" ? "Available" : "Coming soon"}
        </span>
        {city.cultures.map((t: string) => (
          <span
            key={t}
            className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        Territory-locked: one exclusive planner slot in {city.name}. Multicultural planning tools
        across 9 cultures, lead CRM, client portal, vendor coordination, budgets and timelines.
      </p>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        {[
          ["Exclusive territory", `Only one planner holds the ${city.name} slot at a time.`],
          ["PPP-adjusted pricing", "Priced by local population and country purchasing power."],
          ["Multicultural tools", "South Asian, Persian, Jewish, Chinese, Mexican and more."],
          ["Vendor directory", "Connect with local venues, photographers and caterers."],
        ].map(([heading, body]) => (
          <div key={heading} className="rounded-lg border border-border p-5">
            <h2 className="text-base font-semibold text-foreground">{heading}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/pricing"
          className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          See {city.name} pricing
        </Link>
        <Link
          to="/cities"
          className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
        >
          All city territories
        </Link>
      </div>
    </main>
  );
}
