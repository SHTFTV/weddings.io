import { createFileRoute } from "@tanstack/react-router";
import {expectedBlogHealth, parseBlogSeoHtml} from "../lib/blogSeoHealth";

/**
 * GET /seo/health?slug=<slug>
 *
 * Returns expected (from source-of-truth in src/lib/blogPosts.ts +
 * blogImageManifest.json + blogOgCards.json) and actual (parsed from the
 * live HTML at ?origin, defaults to https://weddings.io) values for:
 *   - <title>, meta description, canonical
 *   - og:{title,description,image,url,type}
 *   - twitter:{card,title,description,image}
 *   - Article JSON-LD (headline, image, datePublished, dateModified,
 *     author, publisher, mainEntityOfPage)
 *   - versioned OG card image hash (expected vs the hash embedded in
 *     the live og:image URL)
 *
 * Use in CI, uptime checks, or ad-hoc debugging. Public read-only.
 */
export const Route = createFileRoute("/seo/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");
        const origin = (url.searchParams.get("origin") || "https://weddings.io").replace(/\/$/, "");
        if (!slug) return json({ ok: false, error: "missing ?slug" }, 400);

        const expected = expectedBlogHealth(slug);
        if (!expected) return json({ ok: false, error: `unknown slug: ${slug}` }, 404);

        const target = `${origin}/blog/${slug}/`;
        let actual: Actual;
        try {
          const res = await fetch(target, { redirect: "follow" });
          const html = res.ok ? await res.text() : "";
          actual = { status: res.status, url: target, ...parseBlogSeoHtml(html) };
        } catch (e: any) {
          actual = { status: 0, url: target, error: e?.message ?? String(e) } as Actual;
        }

        const diffs: Array<{ field: string; expected: unknown; actual: unknown }> = [];
        const fields = [
          "title", "description", "canonical",
          "og:title", "og:description", "og:image", "og:url", "og:type",
          "twitter:card", "twitter:title", "twitter:description", "twitter:image",
          "ld.headline", "ld.image", "ld.datePublished", "ld.author",
        ] as const;
        for (const f of fields) {
          const e = (expected.meta as any)[f];
          const a = (actual as any)[f];
          if (e && normalize(f, e) !== normalize(f, a)) diffs.push({ field: f, expected: e, actual: a });
        }
        const liveHash = extractHash((actual as any)["og:image"]);
        const hashMatch = expected.ogCard?.hash ? expected.ogCard.hash === liveHash : null;

        return json({
          ok: actual.status === 200 && !actual.error && diffs.length === 0 && (hashMatch !== false),
          slug,
          origin,
          expected,
          actual,
          imageHash: { expected: expected.ogCard?.hash ?? null, live: liveHash, match: hashMatch },
          diffs,
        });
      },
    },
  },
});

type Actual = {
  status: number;
  url: string;
  error?: string;
  [k: string]: unknown;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

const URL_FIELDS = new Set(["og:image", "twitter:image", "ld.image"]);
const normalize = (field: string, v: unknown) => {
  if (v == null) return "";
  const s = String(v).trim().replace(/\s+/g, " ");
  return URL_FIELDS.has(field) ? s.split("?")[0] : s;
};
const extractHash = (u: unknown) => {
  const s = typeof u === "string" ? u : "";
  const m = s.match(/\/opengraph-images\/[a-z0-9-]+-([a-f0-9]{6,})\.[a-z]+/i);
  return m ? m[1] : null;
};

