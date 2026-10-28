import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, type ReactNode, Fragment } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { LaunchNotifyForm } from "../components/LaunchNotifyForm";
import {
  EcosystemVideo,
  ECOSYSTEM_VIDEO_URL,
  ECOSYSTEM_VIDEO_POSTER,
  ECOSYSTEM_VIDEO_OG_IMAGE,
  ECOSYSTEM_VIDEO_TWITTER_IMAGE,
  ECOSYSTEM_VIDEO_CAPTIONS_URL,
  ECOSYSTEM_VIDEO_DURATION_ISO,
  ECOSYSTEM_VIDEO_DURATION_SECONDS,
} from "../components/EcosystemVideo";
import { getBlogPost, sortedBlogPosts, type BlogPost } from "../lib/blogPosts";
import { withImageVersion } from "../lib/blogImageVersion";

const ECOSYSTEM_VIDEO_SLUG = "next-saas-moat-shared-success";
const absUrl = (path: string) =>
  path.startsWith("http") ? path : `https://weddings.io${path}`;


/**
 * Minimal, safe inline markdown renderer for blog body paragraphs.
 * Supports: [text](https://url), **bold**, *italic*, `code`, and bare URLs.
 * Everything else renders as plain text — no raw HTML is ever injected.
 */
function renderInlineMarkdown(input: string): ReactNode {
  const nodes: ReactNode[] = [];
  const pattern =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(\*\*|__)(.+?)\3|(\*|_)(.+?)\5|`([^`]+)`|(https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  const isExternal = (u: string) => !u.startsWith("https://weddings.io") && !u.startsWith("/");
  while ((m = pattern.exec(input)) !== null) {
    if (m.index > last) nodes.push(input.slice(last, m.index));
    if (m[1] && m[2]) {
      const ext = isExternal(m[2]);
      nodes.push(
        <a
          key={key++}
          href={m[2]}
          className="font-medium text-primary underline-offset-4 hover:underline"
          {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {m[1]}
        </a>,
      );
    } else if (m[3] && m[4]) {
      nodes.push(<strong key={key++} className="text-foreground">{m[4]}</strong>);
    } else if (m[5] && m[6]) {
      nodes.push(<em key={key++}>{m[6]}</em>);
    } else if (m[7]) {
      nodes.push(
        <code key={key++} className="rounded bg-secondary/60 px-1.5 py-0.5 font-mono text-[0.9em]">
          {m[7]}
        </code>,
      );
    } else if (m[8]) {
      nodes.push(
        <a
          key={key++}
          href={m[8]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {m[8]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < input.length) nodes.push(input.slice(last));
  return nodes.length > 0 ? nodes : input;
}


function validateBlogSeo(post: BlogPost, slug: string) {
  const missing: string[] = [];
  if (!post.title) missing.push("title");
  if (!post.metaDescription && !post.excerpt) missing.push("description");
  if (!post.image) missing.push("og:image");
  if (!post.date) missing.push("article:published_time");
  if (!post.category) missing.push("article:section");
  if (missing.length) {
    console.warn(
      `[SEO] /blog/${slug}/ missing fields: ${missing.join(", ")} — edit src/lib/blogPosts.ts`,
    );
  }
}

// Slugs that are served as full static HTML in /public/blog/<slug>/index.html
// instead of being rendered by this React route. We hard-redirect to the file
// so crawlers and social previews see the full article body.
const STATIC_HTML_SLUGS = new Set<string>([
  "Who-Owns-Weddings.io",
  "weddings-io-disruptor-industry-army-marketing",
]);

const STATIC_HTML_REDIRECTS: Record<string, string> = {
  "Who-Owns-Weddings.io": "/Who-Owns-Weddings.io",
  "weddings-io-disruptor-industry-army-marketing": "/Who-Owns-Weddings.io",
};

// Slug aliases: lowercase / punctuation-normalized URL segment → real slug in blogPosts.ts.
// Keeps /blog/who-owns-weddings-io rendering the React route (with per-post head())
// instead of 3xx-redirecting to a different URL that would strip our meta tags.
const SLUG_ALIASES: Record<string, string> = {
  "who-owns-weddings-io": "Who-Owns-Weddings.io",
  "who-owns-weddings.io": "Who-Owns-Weddings.io",
};

function resolveSlug(slug: string): string {
  return SLUG_ALIASES[slug.toLowerCase()] ?? slug;
}

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: ({ params }) => {
    // Only redirect exact-case slugs that have a full static HTML article.
    // Lowercase aliases are resolved in-place so the URL keeps its per-post <head>.
    if (STATIC_HTML_SLUGS.has(params.slug)) {
      throw redirect({ href: STATIC_HTML_REDIRECTS[params.slug] });
    }
  },
  head: ({ params }) => {
    const canonicalSlug = resolveSlug(params.slug);
    const post = getBlogPost(canonicalSlug);
    const primaryKeyword = post?.focusKeywords?.[0];
    const rawTitle = post?.seoTitle ?? (post
      ? (primaryKeyword && !post.title.toLowerCase().includes(primaryKeyword.toLowerCase())
        ? `${post.title} — ${primaryKeyword} | Weddings.io`
        : `${post.title} | Weddings.io`)
      : "Weddings.io Blog");
    // Always cap at 70 chars — applies to explicit seoTitle too.
    const title = rawTitle.length > 70 ? `${rawTitle.slice(0, 69)}…` : rawTitle;
    const baseDesc = post?.metaDescription ?? post?.excerpt ?? "Weddings.io blog article.";
    const withKeyword = post?.metaDescription
      ? baseDesc
      : (primaryKeyword && !baseDesc.toLowerCase().includes(primaryKeyword.toLowerCase())
        ? `${primaryKeyword}: ${baseDesc}`
        : baseDesc);
    // Always cap description at 160 chars.
    const description = withKeyword.length > 160 ? `${withKeyword.slice(0, 159)}…` : withKeyword;
    const keywords = post?.focusKeywords?.join(", ");
    const url = `https://weddings.io/blog/${params.slug}/`;
    const image = post?.image ?? "/opengraph.jpg";
    const versionedImage = withImageVersion(image);
    const absoluteImage = versionedImage.startsWith("http") ? versionedImage : `https://weddings.io${versionedImage}`;

    const isEcosystemVideoPost = canonicalSlug === ECOSYSTEM_VIDEO_SLUG;
    const socialOgImage = isEcosystemVideoPost ? absUrl(ECOSYSTEM_VIDEO_OG_IMAGE) : (post?.ogImage ? absUrl(post.ogImage) : absoluteImage);
    const socialTwitterImage = isEcosystemVideoPost ? absUrl(ECOSYSTEM_VIDEO_TWITTER_IMAGE) : (post?.ogImage ? absUrl(post.ogImage) : absoluteImage);

    const idx = post ? sortedBlogPosts.findIndex((p) => p.slug === post.slug) : -1;
    const newerPost = idx > 0 ? sortedBlogPosts[idx - 1] : null;
    const olderPost = idx >= 0 && idx < sortedBlogPosts.length - 1 ? sortedBlogPosts[idx + 1] : null;
    const prevUrl = olderPost ? `https://weddings.io/blog/${olderPost.slug}/` : null;
    const nextUrl = newerPost ? `https://weddings.io/blog/${newerPost.slug}/` : null;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(keywords ? [{ name: "keywords", content: keywords }] : []),
        isEcosystemVideoPost
          ? { property: "og:type", content: "video.other" }
          : { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: socialOgImage },
        ...(post?.ogImage ? [{property:"og:image:type",content:"image/jpeg"},{property:"og:image:width",content:"1200"},{property:"og:image:height",content:"630"},{property:"og:image:alt",content:post.imageAlt ?? post.title},{property:"og:site_name",content:"Weddings.io"},{name:"twitter:image:alt",content:post.imageAlt ?? post.title}] : []),
        ...(isEcosystemVideoPost
          ? [
              { property: "og:video", content: absUrl(ECOSYSTEM_VIDEO_URL) },
              { property: "og:video:secure_url", content: absUrl(ECOSYSTEM_VIDEO_URL) },
              { property: "og:video:type", content: "video/mp4" },
              { property: "og:video:width", content: "1280" },
              { property: "og:video:height", content: "720" },
            ]
          : []),
        { property: "article:published_time", content: post?.date ?? "2026-04-28" },
        { property: "article:modified_time", content: post?.date ?? "2026-04-28" },
        { property: "article:section", content: post?.category ?? "Wedding Planning" },
        isEcosystemVideoPost
          ? { name: "twitter:card", content: "player" }
          : { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: socialTwitterImage },
        ...(isEcosystemVideoPost
          ? [
              { name: "twitter:player:stream", content: absUrl(ECOSYSTEM_VIDEO_URL) },
              { name: "twitter:player:stream:content_type", content: "video/mp4" },
              { name: "twitter:player:width", content: "1280" },
              { name: "twitter:player:height", content: "720" },
            ]
          : []),
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      ],

      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", type: "application/rss+xml", title: "Weddings.io Blog RSS", href: "https://weddings.io/rss.xml" },
        ...(prevUrl ? [{ rel: "prev", href: prevUrl }] : []),
        ...(nextUrl ? [{ rel: "next", href: nextUrl }] : []),
      ],
      scripts: post
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": "https://weddings.io/#organization",
                    name: "Weddings.io",
                    url: "https://weddings.io",
                    logo: {
                      "@type": "ImageObject",
                      url: "https://weddings.io/android-chrome-512x512.png",
                      width: 512,
                      height: 512,
                    },
                    parentOrganization: { "@id": "https://industryarmy.com/#organization" },
                    sameAs: [
                      "https://weddings.io/about/",
                      "https://weddings.io/press/",
                      "https://weddings.io/ecosystem",
                      "https://industryarmymarketing.com/",
                    ],
                  },
                  {
                    "@type": "Organization",
                    "@id": "https://industryarmy.com/#organization",
                    name: "Industry Army Marketing",
                    url: "https://industryarmy.com",
                  },
                  {
                    "@type": "BlogPosting",
                    "@id": `${url}#blogposting`,
                    headline: post.title,
                    description: post.excerpt,
                    image: {
                      "@type": "ImageObject",
                      url: absoluteImage,
                      width: 1200,
                      height: 630,
                    },
                    author: [
                      {
                        "@type": "Organization",
                        name: "Weddings.io Editorial",
                        url: "https://weddings.io/about/",
                        sameAs: [
                          "https://weddings.io/",
                          "https://weddings.io/ecosystem",
                          "https://weddings.io/press/",
                        ],
                      },
                      {
                        "@type": "Person",
                        name: "Weddings.io Editorial Team",
                        jobTitle: "Wedding Technology & Industry Analysis",
                        worksFor: { "@id": "https://weddings.io/#organization" },
                        url: "https://weddings.io/about/",
                        knowsAbout: [
                          "Wedding technology",
                          "AI wedding planning",
                          "Wedding vendor software",
                          "Purchasing Power Parity pricing",
                          "Wedding industry analysis",
                        ],
                      },
                    ],
                    publisher: { "@id": "https://weddings.io/#organization" },
                    datePublished: post.date,
                    dateModified: post.date,
                    mainEntityOfPage: { "@type": "WebPage", "@id": url },
                    url,
                    inLanguage: "en",
                    articleSection: post.category,
                    isAccessibleForFree: true,
                    ...(prevUrl ? { "prev": prevUrl } : {}),
                    ...(nextUrl ? { "next": nextUrl } : {}),
                  },
                ],
              }),

            },
            ...(post.faq && post.faq.length > 0
              ? [
                  {
                    type: "application/ld+json",
                    children: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      mainEntity: post.faq.map((f) => ({
                        "@type": "Question",
                        name: f.question,
                        acceptedAnswer: { "@type": "Answer", text: f.answer },
                      })),
                    }),
                  },
                ]
              : []),
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://weddings.io/" },
                  { "@type": "ListItem", position: 2, name: "Blog", item: "https://weddings.io/blog/" },
                  { "@type": "ListItem", position: 3, name: post.title, item: url },
                ],
              }),
            },
            ...(isEcosystemVideoPost
              ? [
                  {
                    type: "application/ld+json",
                    children: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "VideoObject",
                      name: "The Next SaaS Moat Isn't Software. It's Shared Success.",
                      description:
                        "15-second Weddings.io manifesto film featuring the real professionals who make weddings work — videographers, caterers, wedding planners, limo drivers, and tent crews — animated as one interconnected ecosystem.",
                      thumbnailUrl: [
                        absUrl(ECOSYSTEM_VIDEO_OG_IMAGE),
                        absUrl(ECOSYSTEM_VIDEO_TWITTER_IMAGE),
                        absUrl(ECOSYSTEM_VIDEO_POSTER),
                      ],
                      uploadDate: post.date,
                      duration: ECOSYSTEM_VIDEO_DURATION_ISO,
                      contentUrl: absUrl(ECOSYSTEM_VIDEO_URL),
                      embedUrl: url,
                      inLanguage: "en",
                      isFamilyFriendly: true,
                      publisher: {
                        "@type": "Organization",
                        name: "Weddings.io Technologies",
                        url: "https://weddings.io",
                        sameAs: [
                          "https://industryarmy.com",
                          "https://www.linkedin.com/company/weddings-io",
                        ],
                        logo: {
                          "@type": "ImageObject",
                          url: "https://weddings.io/android-chrome-512x512.png",
                          width: 512,
                          height: 512,
                        },
                      },
                      potentialAction: {
                        "@type": "SeekToAction",
                        target: `${url}#t={seek_to_second_number}`,
                        "startOffset-input": "required name=seek_to_second_number",
                      },
                      hasPart: [
                        {
                          "@type": "Clip",
                          name: "Ecosystem manifesto",
                          startOffset: 0,
                          endOffset: ECOSYSTEM_VIDEO_DURATION_SECONDS,
                          url: `${url}#t=0`,
                        },
                      ],
                      transcript: absUrl(ECOSYSTEM_VIDEO_CAPTIONS_URL),
                    }),
                  },
                ]
              : []),
          ]
        : [],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug: rawSlug } = Route.useParams();
  const slug = resolveSlug(rawSlug);
  const post = getBlogPost(slug);

  useEffect(() => {
    if (post) validateBlogSeo(post, slug);
    else console.warn(`[SEO] /blog/${slug}/ — post not found in blogPosts`);
  }, [post, slug]);


  if (!post) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
          <h1 className="font-serif text-5xl text-foreground">Article not found</h1>
          <p className="mt-4 text-muted-foreground">This Weddings.io article does not exist.</p>
          <a href="/blog/" className="mt-8 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Back to Blog
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="px-5 py-12 md:px-8 md:py-18">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <a href="/" className="hover:text-primary">Home</a> <span aria-hidden="true">›</span> <a href="/blog/" className="hover:text-primary">Blog</a>
          </nav>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-primary">{post.category}</p>
          <h1 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">{renderInlineMarkdown(post.title)}</h1>
          <p className="mt-5 text-xl leading-8 text-muted-foreground">{renderInlineMarkdown(post.subtitle)}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
            <span>{post.dateLabel}</span>
            <span aria-hidden="true">·</span>
            <span
              className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-xs uppercase tracking-[0.18em]"
              aria-label={`Estimated reading time ${post.readTime}`}
            >
              {post.readTime} read
            </span>
            <span aria-hidden="true">·</span>
            <span>Weddings.io Editorial</span>
          </div>
          {post.excerpt && post.excerpt !== post.subtitle && (
            <p className="mt-6 border-l-2 border-primary/60 pl-4 text-base italic leading-7 text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          <figure className="mt-10 overflow-hidden rounded-lg border border-border">
            <picture>
              {(post.imageAvif || post.imageAvifSmall) && (
                <source
                  type="image/avif"
                  srcSet={[
                    post.imageAvifSmall ? `${withImageVersion(post.imageAvifSmall)} 800w` : null,
                    post.imageAvif ? `${withImageVersion(post.imageAvif)} 1600w` : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  sizes="(min-width: 1024px) 960px, 100vw"
                />
              )}
              {(post.imageWebp || post.imageWebpSmall) && (
                <source
                  type="image/webp"
                  srcSet={[
                    post.imageWebpSmall ? `${withImageVersion(post.imageWebpSmall)} 800w` : null,
                    post.imageWebp ? `${withImageVersion(post.imageWebp)} 1600w` : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  sizes="(min-width: 1024px) 960px, 100vw"
                />
              )}
              <img
                src={withImageVersion(post.image)}
                alt={post.imageAlt ?? post.title}
                className="aspect-[16/9] w-full object-cover"
                width={1200}
                height={630}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </picture>
          </figure>
          {post.slug === "next-saas-moat-shared-success" && (
            <EcosystemVideo className="mt-10" autoplayOnView />
          )}
          {["ejae-seoul-wedding-venue-with-personal-history", "wedding-speeches-language-running-order", "wedding-day-contact-sheet-right-person-current-plan", "wedding-rental-return-plan-last-box", "wedding-room-reset-ceremony-reception"].includes(post.slug) && <aside style={{marginTop:24,padding:"16px 20px",background:"#302723",color:"#faf7f1",borderRadius:8,fontSize:14}}>WEDDINGS.IO / ADVERTISING OPPORTUNITY · <a style={{textDecoration:"underline"}} href="mailto:colin@industryarmymarketing.com?subject=Advertise%20on%20Weddings.io">Advertise here</a></aside>}
          {["wedding-speeches-language-running-order","wedding-rental-return-plan-last-box","wedding-room-reset-ceremony-reception"].includes(post.slug) && <nav aria-label="Related planning guides" className="mt-6 rounded-lg border border-border p-5 text-sm"><strong>Related planning guides</strong><ul className="mt-3 space-y-2"><li><a className="underline" href="/blog/wedding-day-contact-sheet-right-person-current-plan/">Wedding-day contact sheet</a></li><li><a className="underline" href="/blog/wedding-rental-return-plan-last-box/">Wedding rental return plan</a></li><li><a className="underline" href="/blog/wedding-room-reset-ceremony-reception/">Ceremony-to-reception room reset</a></li></ul></nav>}
          {["wedding-speeches-language-running-order","wedding-rental-return-plan-last-box","wedding-room-reset-ceremony-reception"].includes(post.slug) && <details style={{position:"fixed",bottom:16,right:16,zIndex:40,maxWidth:260,padding:"12px 16px",background:"#302723",color:"#faf7f1",border:"1px solid #a78657",borderRadius:10,fontSize:14}}><summary style={{cursor:"pointer"}}>Weddings.io · Contact IAM</summary><p style={{marginTop:10}}>Marketing, brand participation or editorial enquiries.</p><a style={{textDecoration:"underline"}} href="mailto:colin@industryarmymarketing.com">Email Colin at IAM</a></details>}
          {(() => {
            const body = post.body ?? [];
            const headingSlug = (t: string) =>
              t
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");
            const headings = body
              .filter((p) => /^##\s+/.test(p))
              .map((p) => {
                const text = p.replace(/^##\s+/, "").trim();
                return { text, id: headingSlug(text) };
              });
            const showToc =
              post.slug === "weddings-io-public-record-prior-use-continuous-operation" &&
              headings.length >= 3;
            return (
              <>
                {showToc && (
                  <nav
                    className="mt-10 rounded-lg border border-border bg-secondary/40 p-6"
                    aria-labelledby="toc-heading"
                  >
                    <h2
                      id="toc-heading"
                      className="text-xs font-semibold uppercase tracking-[0.28em] text-primary"
                    >
                      On this page
                    </h2>
                    <ol className="mt-4 space-y-2 text-base leading-7 text-muted-foreground">
                      {headings.map((h, i) => (
                        <li key={h.id}>
                          <a
                            href={`#${h.id}`}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {i + 1}. {h.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
                <div className="mt-12 space-y-7 text-lg leading-9 text-muted-foreground">
                  {body.map((paragraph) => {
                    if (["wedding-speeches-language-running-order", "wedding-rental-return-plan-last-box", "wedding-room-reset-ceremony-reception"].includes(post.slug) && paragraph.startsWith("Related planning:")) return null;
                    const imgMatch = paragraph.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
                    if (imgMatch) {
                      const [, alt, src, caption] = imgMatch;
                      return (
                        <figure key={paragraph} className="my-4 overflow-hidden rounded-lg border border-border bg-secondary/30">
                          <img src={src} alt={alt} className="w-full h-auto" loading="lazy" decoding="async" />
                          {caption && (
                            <figcaption className="px-4 py-3 text-sm italic text-muted-foreground">{caption}</figcaption>
                          )}
                        </figure>
                      );
                    }
                    if (/^##\s+/.test(paragraph)) {
                      const text = paragraph.replace(/^##\s+/, "").trim();
                      const id = headingSlug(text);
                      return (
                        <h2
                          key={paragraph}
                          id={id}
                          className="scroll-mt-24 pt-4 font-serif text-2xl leading-snug text-foreground md:text-3xl"
                        >
                          {renderInlineMarkdown(text)}
                        </h2>
                      );
                    }
                    return <p key={paragraph}>{renderInlineMarkdown(paragraph)}</p>;
                  })}
                </div>
              </>
            );
          })()}

          {post.slug === "ai-weddings-who-wins-when-every-app-looks-the-same" && (
            <section
              className="mt-14 rounded-lg border border-border bg-secondary/40 p-6 md:p-8"
              aria-labelledby="author-bio-heading"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">About the author</p>
              <h2 id="author-bio-heading" className="mt-2 font-serif text-2xl text-foreground md:text-3xl">
                Weddings.io Editorial Team
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                The Weddings.io Editorial Team analyzes the wedding technology sector — 3,600+ active companies,
                AI adoption trends, vendor pricing dynamics, and platform economics — from inside the industry.
                Our work is informed by primary research from The Knot Worldwide, Zola, Aftershoot, and HoneyBook,
                and by the operational data we generate running <a href="/" className="text-primary underline-offset-4 hover:underline">weddings.io</a>{" "}
                and its sister verticals.
              </p>
              <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Publisher</p>
                  <p className="mt-2 font-serif text-lg text-foreground">Weddings.io Technologies</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The wedding-industry operating system. PPP-priced from day one, verified by{" "}
                    <a href="/eyespyr" className="text-primary underline-offset-4 hover:underline">EyeSpyR</a>,
                    powered by an ecosystem of industry-specific platforms.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Credentials</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Founding domain owner of weddings.io (established 2012)</li>
                    <li>Operators of videographers.io, caterers.tv, cleaners.io, movers.io</li>
                    <li>Primary-source access to vendor pricing across 39 city brackets</li>
                    <li>
                      SEO &amp; AI-search infrastructure by{" "}
                      <a href="https://industryarmymarketing.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">IAM</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6 text-sm">
                <a href="/about/" className="text-primary underline-offset-4 hover:underline">About Weddings.io</a>
                <span className="text-muted-foreground">·</span>
                <a href="/press/" className="text-primary underline-offset-4 hover:underline">Press &amp; media</a>
                <span className="text-muted-foreground">·</span>
                <a href="/ecosystem" className="text-primary underline-offset-4 hover:underline">Our ecosystem</a>
                <span className="text-muted-foreground">·</span>
                <a href="/ppp-explained" className="text-primary underline-offset-4 hover:underline">PPP pricing methodology</a>
              </div>
            </section>
          )}




          {post.faq && post.faq.length > 0 && (
            <section className="mt-16" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="font-serif text-3xl text-foreground md:text-4xl">Frequently asked questions</h2>
              <dl className="mt-8 space-y-8">
                {post.faq.map((f) => (
                  <Fragment key={f.question}>
                    <div className="border-t border-border pt-6">
                      <dt className="font-serif text-xl text-foreground">{renderInlineMarkdown(f.question)}</dt>
                      <dd className="mt-3 text-base leading-8 text-muted-foreground">{renderInlineMarkdown(f.answer)}</dd>
                    </div>
                  </Fragment>
                ))}
              </dl>
            </section>
          )}


          {post.sources && post.sources.length > 0 && (
            <aside className="mt-12 rounded-lg border border-border bg-secondary/40 p-6" aria-label="Sources">
              <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {post.sources.length === 1 ? "Source" : "Sources"}
              </h2>
              <ul className="mt-4 space-y-3 text-base leading-7 text-muted-foreground">
                {post.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {s.label}
                    </a>
                    {(s.publisher || s.date) && (
                      <span className="block text-sm text-muted-foreground">
                        {s.publisher}
                        {s.publisher && s.date ? " · " : ""}
                        {s.date}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </aside>
          )}
          {post.slug === "ppp-pricing-wedding-platform-industry-first" && (
            <div className="mt-14">
              <LaunchNotifyForm source="ppp-launch" />
            </div>
          )}
          {(() => {
            const idx = sortedBlogPosts.findIndex((p) => p.slug === post.slug);
            const newer = idx > 0 ? sortedBlogPosts[idx - 1] : null;
            const older = idx >= 0 && idx < sortedBlogPosts.length - 1 ? sortedBlogPosts[idx + 1] : null;
            return (
              <nav className="mt-14 grid gap-4 border-t border-border pt-8 sm:grid-cols-2" aria-label="Previous and next articles">
                {older ? (
                  <a
                    href={`/blog/${older.slug}/`}
                    className="group block rounded-lg border border-border bg-card p-5 hover:border-primary/70"
                    rel="prev"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">← Previous</span>
                    <span className="mt-2 block font-serif text-lg leading-snug text-card-foreground group-hover:text-primary">
                      {older.title}
                    </span>
                  </a>
                ) : (
                  <span />
                )}
                {newer ? (
                  <a
                    href={`/blog/${newer.slug}/`}
                    className="group block rounded-lg border border-border bg-card p-5 text-right hover:border-primary/70 sm:text-right"
                    rel="next"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Next →</span>
                    <span className="mt-2 block font-serif text-lg leading-snug text-card-foreground group-hover:text-primary">
                      {newer.title}
                    </span>
                  </a>
                ) : (
                  <span />
                )}
              </nav>
            );
          })()}
          <nav className="mt-8 text-sm text-muted-foreground" aria-label="More articles">
            <a href="/blog/" className="text-primary hover:underline">← All articles on Weddings.io</a>
          </nav>
        </div>
      </article>
    </main>
  );
}


