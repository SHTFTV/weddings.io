import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, preflightResponse } from "@/lib/cors";
import { sortedBlogPosts, type BlogPost } from "@/lib/blogPosts";

// Public endpoint: fetches production HTML for one or more blog slugs and
// diffs the served <title>, <link rel="canonical">, and og:url against the
// expected values baked into this deployed bundle.
//
// A "match: true" for every post means the live URL is serving the same
// article this build knows about. A "match: false" (typically with
// "Article not found" as the actual title) means production is on an
// older build that hasn't shipped the post yet.
//
// Usage:
//   GET /api/public/verify-posts                      → verifies the 10 newest
//   GET /api/public/verify-posts?slug=foo&slug=bar    → verifies just those
//   GET /api/public/verify-posts?origin=https://weddings.io  (default)

const DEFAULT_ORIGIN = "https://weddings.io";
const DEFAULT_LIMIT = 10;
const FETCH_TIMEOUT_MS = 10_000;

export const Route = createFileRoute("/api/public/verify-posts")({
  server: {
    handlers: {
      OPTIONS: async () => preflightResponse(),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = (url.searchParams.get("origin") ?? DEFAULT_ORIGIN).replace(/\/$/, "");
        const requestedSlugs = [...new Set(url.searchParams.getAll("slug").filter(Boolean))];

        const targets: BlogPost[] = requestedSlugs.length
          ? requestedSlugs
              .map((slug) => sortedBlogPosts.find((p) => p.slug === slug))
              .filter((p): p is BlogPost => Boolean(p))
          : sortedBlogPosts.slice(0, DEFAULT_LIMIT);

        const knownSlugs = new Set(targets.map((post) => post.slug));
        const missingSlugs = requestedSlugs.filter((slug) => !knownSlugs.has(slug));
        const results = await Promise.all(
          targets.map((post) => verifyOne(origin, post)),
        );

        const summary = {
          origin,
          checkedAt: new Date().toISOString(),
          total: results.length + missingSlugs.length,
          matched: results.filter((r) => r.match).length,
          mismatched: results.filter((r) => !r.match).length + missingSlugs.length,
          allMatched: missingSlugs.length === 0 && results.every((r) => r.match),
          missingSlugs,
          results,
        };

        return jsonResponse(summary);
      },
    },
  },
});

type VerifyResult = {
  slug: string;
  url: string;
  status: number;
  match: boolean;
  fallback: boolean;
  expected: { title: string; canonical: string; ogUrl: string };
  actual: { title: string | null; canonical: string | null; ogUrl: string | null };
  diffs: string[];
  error?: string;
};

async function verifyOne(origin: string, post: BlogPost): Promise<VerifyResult> {
  const canonical = `${origin}/blog/${post.slug}/`;
  const expected = {
    title: post.seoTitle ?? post.title,
    canonical,
    ogUrl: canonical,
  };
  const cacheBust = `?_cb=${Date.now()}`;
  const url = `${origin}/blog/${post.slug}${cacheBust}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Bypass any intermediary caches.
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
    });
    const html = await res.text();
    const actual = {
      title: extractTitle(html),
      canonical: extractCanonical(html),
      ogUrl: extractOgUrl(html),
    };
    const fallback = /Article not found/i.test(html);
    const diffs: string[] = [];
    if (!actual.title || actual.title !== expected.title) {
      diffs.push(`title: expected "${expected.title}", got "${actual.title ?? ""}"`);
    }
    if (actual.canonical !== expected.canonical) {
      diffs.push(`canonical: expected "${expected.canonical}", got "${actual.canonical ?? ""}"`);
    }
    if (actual.ogUrl !== expected.ogUrl) {
      diffs.push(`og:url: expected "${expected.ogUrl}", got "${actual.ogUrl ?? ""}"`);
    }
    return {
      slug: post.slug,
      url: `${origin}/blog/${post.slug}/`,
      status: res.status,
      match: diffs.length === 0 && !fallback,
      fallback,
      expected,
      actual,
      diffs,
    };
  } catch (err) {
    return {
      slug: post.slug,
      url: `${origin}/blog/${post.slug}/`,
      status: 0,
      match: false,
      fallback: false,
      expected,
      actual: { title: null, canonical: null, ogUrl: null },
      diffs: ["fetch failed"],
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : null;
}

function extractCanonical(html: string): string | null {
  const m = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i);
  if (!m) return null;
  const href = m[0].match(/href=["']([^"']+)["']/i);
  return href ? href[1] : null;
}

function extractOgUrl(html: string): string | null {
  const m = html.match(/<meta\s+[^>]*property=["']og:url["'][^>]*>/i);
  if (!m) return null;
  const content = m[0].match(/content=["']([^"']+)["']/i);
  return content ? content[1] : null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}
