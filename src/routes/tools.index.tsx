import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "Free Wedding Planning Tools — Every Culture Covered | Weddings.io" },
      {
        name: "description",
        content:
          "Free wedding planning tools for South Asian, Chinese, Persian, Jewish, Hispanic Heritage, Nordic, Southeast Asian, and Western weddings. Tea ceremonies, Sofreh Aghd, Chuppah, Padrinos, and more.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Weddings.io" },
      { property: "og:title", content: "Free Wedding Planning Tools — Every Culture Covered" },
      {
        property: "og:description",
        content:
          "Free planning tools for South Asian, Chinese, Persian, Jewish, Hispanic Heritage, Nordic, Southeast Asian, Western, and Traditional weddings. Tea ceremonies, Sofreh Aghd, Chuppah, Padrinos, and more.",
      },
      { property: "og:url", content: "https://weddings.io/tools/" },
      { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
      { property: "og:image:alt", content: "Weddings.io — free wedding planning tools for every culture" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@weddingsio" },
      { name: "twitter:title", content: "Free Wedding Planning Tools — Every Culture Covered" },
      {
        name: "twitter:description",
        content:
          "South Asian, Chinese, Persian, Jewish, Hispanic Heritage, Nordic, Southeast Asian, Western, and Traditional wedding planning tools.",
      },
      { name: "twitter:image", content: "https://weddings.io/opengraph.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/tools/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": "https://weddings.io/tools/#page",
              url: "https://weddings.io/tools/",
              name: "Free Wedding Planning Tools — Every Culture Covered",
              description:
                "Free wedding planning tools for South Asian, Chinese, Persian, Jewish, Hispanic Heritage, Nordic, Southeast Asian, Western, and Traditional weddings.",
              isPartOf: { "@id": "https://weddings.io/#website" },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://weddings.io/" },
                { "@type": "ListItem", position: 2, name: "Tools", item: "https://weddings.io/tools/" },
              ],
            },
            {
              "@type": "ItemList",
              name: "Weddings.io Cultural Wedding Planning Tools",
              itemListElement: tools.map((t, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: `${t.name} Wedding Tools`,
                url: `https://weddings.io/tools/${t.slug}/`,
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: ToolsHub,
});


const tools = [
  { slug: "traditional", name: "Traditional & Religious", native: "✝ ☩ α", desc: "Catholic Nuptial Mass timeline, church music scheduler, Orthodox crowning ceremony, rehearsal dinner run-sheet, vow customiser, unity ceremony tracker.", emoji: "⛪" },
  { slug: "south-asian", name: "South Asian", native: "विवाह / ਵਿਆਹ", desc: "Mehndi, Haldi, Baraat, Phere, and reception planning. Multi-day logistics across Sikh, Hindu, Muslim traditions.", emoji: "🪔" },
  { slug: "chinese", name: "Chinese", native: "婚礼", desc: "Tea ceremony order, lunar calendar date picker, banquet table flow, Hongbao tracker, Guo Da Li gift coordination.", emoji: "🏮" },
  { slug: "persian", name: "Persian", native: "عروسی", desc: "Sofreh Aghd setup, Aghd and Aroosi timeline pacing, calligrapher briefing notes, ceremony flow checklist.", emoji: "🌹" },
  { slug: "jewish", name: "Jewish", native: "חתונה", desc: "Chuppah engineering, Ketubah signing flow, Hora capacity calculator, Shabbat conflict checker, Kosher vendor verifier.", emoji: "✡️" },
  { slug: "mexican", name: "Hispanic Heritage", native: "La Boda · El Casamiento", desc: "Padrinos tracker, Mariachi scheduling, Lasso and arras coordination, reception flow templates.", emoji: "🎺" },
  { slug: "nordic", name: "Nordic", native: "Bröllop", desc: "Weather contingency builder, foraged floral sourcing, folk-music programming, Midsommar date checker.", emoji: "🌿" },
  { slug: "southeast-asian", name: "Southeast Asian", native: "งานแต่งงาน", desc: "Monk scheduling, outfit-change timelines, water blessing logistics, ballroom-ready ceremony briefs.", emoji: "🙏" },
  { slug: "western", name: "Western Traditional", native: "Wedding", desc: "Ceremony run-of-show, agreed speech order, and a clear music brief for your DJ or live musicians.", emoji: "💍" },
];

function ToolsHub() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <a href="/" className="flex items-center gap-2 text-lg font-semibold text-primary"><span>🪔</span><span>Weddings.io</span></a>
          <nav className="flex gap-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <a href="/" className="hover:text-primary">Home</a>
            <a href="/cultures/" className="hover:text-primary">Cultures</a>
            <a href="/blog/" className="hover:text-primary">Blog</a>
            <a href="/contribute" className="hover:text-primary">Contribute</a>
          </nav>
        </div>
      </header>

      <section className="border-b border-border px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary">Free Tools</p>
          <h1 className="font-serif text-5xl text-foreground md:text-6xl">Free Wedding Planning Tools — Every Culture Covered.</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Eight cultures. Real ceremonies. No fluff. Built by planners who actually run these weddings.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <a
              key={t.slug}
              href={`/tools/${t.slug}/`}
              className="rounded-lg border border-border bg-card p-6 transition hover:border-primary"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-2xl text-card-foreground">{t.emoji} {t.name}</h2>
                <span className="text-sm text-primary">{t.native}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{t.desc}</p>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-primary">Open tools →</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
