// Regenerate sitemap.xml + rss.xml from src/lib/blogPosts.ts
// Blog URLs use trailing slashes to match Netlify's canonical /blog/<slug>/ form.
import { blogPosts, allCategories, allTags } from '../src/lib/blogPosts.ts';
import fs from 'fs';

const BASE = 'https://weddings.io';

// Standalone static blog posts under public/blog/ that don't live in blogPosts.ts.
// Keep this in sync when new static HTML posts are added.
const extraStaticBlogPosts = [
  { slug: 'wedding-planner-introductions', date: '2026-11-18', title: "Wedding planners: why should couples shortlist your team?", seoTitle: "Wedding planners: why should couples shortlist your team? | Weddings.io", category: 'Planning', excerpt: 'A private pre-launch invitation for wedding planners.', metaDescription: 'Introduce your wedding planning firm for future profile consideration.' },
  {
  slug: 'top-100-wedding-songs-2026',
  "date": "2026-11-18",
  "title": "Top 100 wedding songs for 2026",
  "seoTitle": "Top 100 wedding songs for 2026 | Weddings.io",
  "category": "Music",
  "excerpt": "100 editorial wedding song picks, grouped by ceremony, first dance, reception and last dance.",
  "metaDescription": "100 editorial wedding song picks, grouped by ceremony, first dance, reception and last dance."
},
  {
    slug: 'transparent-territory-pricing-weddings-io',
    date: '2026-07-12',
    title: 'Transparent Territory Pricing: The Weddings.io Bracket Model',
    seoTitle: 'Transparent Territory Pricing: The Weddings.io Bracket Model | Weddings.io',
    category: 'Pricing',
    excerpt: 'Every territory bracket, published. Flat $10 per 100K population up to $290/mo at 29M+. No sales calls, no hidden tiers.',
    metaDescription: 'Weddings.io publishes every territory price bracket — a flat $10 per 100K population, up to $290/mo at 29M+. No sales calls, no hidden tiers.',
  },
];

const sorted = [...blogPosts, ...extraStaticBlogPosts].sort((a, b) => b.date.localeCompare(a.date));

const staticRoutes = [
  { loc: '/',                priority: '1.0', changefreq: 'weekly' },
  { loc: '/about',           priority: '0.7', changefreq: 'monthly' },
  { loc: '/blog/',           priority: '0.9', changefreq: 'daily' },
  { loc: '/blog/topics/',    priority: '0.7', changefreq: 'weekly' },
  { loc: '/vendors',         priority: '0.8', changefreq: 'weekly' },
  { loc: '/eyespyr',         priority: '0.8', changefreq: 'monthly' },
  { loc: '/ecosystem/',      priority: '0.8', changefreq: 'monthly' },
  { loc: '/seo/',            priority: '0.9', changefreq: 'monthly' },
  { loc: '/iam-weddings-seo/', priority: '0.7', changefreq: 'weekly' },
];

const topicRoutes = [
  ...allCategories.map((c) => ({ loc: `/blog/category/${c.slug}/`, priority: '0.7', changefreq: 'weekly' })),
  ...allTags.map((t) => ({ loc: `/blog/tag/${t.slug}/`, priority: '0.6', changefreq: 'weekly' })),
];

const today = new Date().toISOString().slice(0, 10);
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const MAX_URLS_PER_SITEMAP = 5000; // well under the 50,000 spec limit

const urlEntry = (loc, lastmod, changefreq, priority) => `  <url>
    <loc>${BASE}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const wrapUrlset = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

const staticEntries = staticRoutes.map((r) => urlEntry(r.loc, today, r.changefreq, r.priority));
const topicEntries = topicRoutes.map((r) => urlEntry(r.loc, today, r.changefreq, r.priority));
const postEntries = sorted.map((p) => urlEntry(`/blog/${p.slug}/`, p.date, 'monthly', '0.8'));

// Flat sitemap kept for backwards compatibility (validators, existing submissions).
const sitemap = wrapUrlset([...staticEntries, ...topicEntries, ...postEntries]);

const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out.length ? out : [[]];
};

// Split children: pages, topics (categories + tags), and blog posts (chunked).
const postChunks = chunk(postEntries, MAX_URLS_PER_SITEMAP);
const children = [
  { name: 'sitemap-pages.xml', xml: wrapUrlset(staticEntries), lastmod: today },
  { name: 'sitemap-topics.xml', xml: wrapUrlset(topicEntries), lastmod: today },
  ...postChunks.map((entries, i) => ({
    name: postChunks.length === 1 ? 'sitemap-posts.xml' : `sitemap-posts-${i + 1}.xml`,
    xml: wrapUrlset(entries),
    lastmod: sorted[i * MAX_URLS_PER_SITEMAP]?.date || today,
  })),
];

// Image sitemap is generated separately but belongs in the index.
const indexChildren = [...children.map((c) => ({ name: c.name, lastmod: c.lastmod }))];
if (fs.existsSync('public/sitemap-images.xml')) {
  indexChildren.push({ name: 'sitemap-images.xml', lastmod: today });
}

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexChildren.map((c) => `  <sitemap>
    <loc>${BASE}/${c.name}</loc>
    <lastmod>${c.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>
`;


const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Weddings World — The Weddings.io Blog</title>
    <link>${BASE}/blog/</link>
    <description>Global wedding stories, planning intelligence, and eventful industry reporting from Weddings.io — sister publication to WeddingSaaS.com.</description>
    <language>en-us</language>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${sorted.map((p) => `    <item>
      <title>${escape(p.seoTitle || p.title)}</title>
      <link>${BASE}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${BASE}/blog/${p.slug}/</guid>
      <pubDate>${new Date(p.date + 'T13:00:00Z').toUTCString()}</pubDate>
      <category>${escape(p.category)}</category>
      <description>${escape(p.metaDescription || p.excerpt)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`;

for (const dir of ['public', 'public/weddings-io-deploy']) {
  if (!fs.existsSync(dir)) continue;
  fs.writeFileSync(`${dir}/sitemap.xml`, sitemap);
  fs.writeFileSync(`${dir}/sitemap-index.xml`, sitemapIndex);
  for (const c of children) fs.writeFileSync(`${dir}/${c.name}`, c.xml);
  fs.writeFileSync(`${dir}/rss.xml`, rss);
}

console.log(`Wrote ${sorted.length} posts + ${staticRoutes.length} static routes (trailing-slash blog URLs)`);
console.log(`Sitemap index: ${indexChildren.map((c) => c.name).join(', ')}`);
