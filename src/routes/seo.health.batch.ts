import { createFileRoute } from "@tanstack/react-router";
import {blogPosts} from "../lib/blogPosts";

/**
 * GET  /seo/health/batch?slugs=a,b,c&origin=https://weddings.io
 * POST /seo/health/batch   { slugs: string[], origin?: string }
 *
 * Runs the per-slug /seo/health check for every slug in the list and
 * returns a single combined report:
 *   { ok, origin, checkedAt, total, failed, results: [{ slug, ok, diffs, imageHash, status }] }
 *
 * ok=false iff any slug fails or any HTTP fetch was non-2xx. Public
 * read-only; safe for cron and uptime checks.
 */
export const Route = createFileRoute("/seo/health/batch")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});

async function handle(request: Request) {
  const url = new URL(request.url);
  const origin = (url.searchParams.get("origin") || "https://weddings.io").replace(/\/$/, "");
  let slugs: string[] = [];
  if (request.method === "POST") {
    try {
      const body = (await request.json()) as { slugs?: string[]; origin?: string };
      if (Array.isArray(body?.slugs)) slugs = body.slugs;
      if (body?.origin) url.searchParams.set("origin", body.origin);
    } catch {
      return json({ ok: false, error: "invalid JSON body" }, 400);
    }
  }
  if (!slugs.length) {
    const q = url.searchParams.get("slugs");
    if (q) slugs = q.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (!slugs.length) slugs = await loadVisibleSlugs();
  if (!slugs.length) return json({ ok: false, error: "no slugs provided and none discoverable" }, 400);

  const finalOrigin = (url.searchParams.get("origin") || origin).replace(/\/$/, "");
  const base = new URL(request.url);
  base.pathname = "/seo/health";
  base.search = "";

  const results = await Promise.all(
    slugs.map(async (slug) => {
      const u = new URL(base.toString());
      u.searchParams.set("slug", slug);
      u.searchParams.set("origin", finalOrigin);
      try {
        const res = await fetch(u.toString(), { headers: { accept: "application/json" } });
        const body = await res.json().catch(() => ({}));
        return {
          slug,
          ok: !!body?.ok && res.ok,
          status: res.status,
          diffs: body?.diffs ?? [],
          imageHash: body?.imageHash ?? null,
          liveStatus: body?.actual?.status ?? null,
          error: body?.error ?? null,
        };
      } catch (e: any) {
        return { slug, ok: false, status: 0, diffs: [], imageHash: null, liveStatus: 0, error: e?.message ?? String(e) };
      }
    })
  );
  const failed = results.filter((r) => !r.ok);
  return json({
    ok: failed.length === 0,
    origin: finalOrigin,
    checkedAt: new Date().toISOString(),
    total: results.length,
    failed: failed.length,
    results,
  });
}

async function loadVisibleSlugs(): Promise<string[]> {
  return blogPosts.map(post => post.slug);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
