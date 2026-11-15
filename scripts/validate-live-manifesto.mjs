#!/usr/bin/env node
/**
 * Live-HTML validator for the deployed/preview manifesto URL.
 * Fetches the page over HTTP and re-runs the metadata, OG, and link checks
 * against what actually shipped — catches build-vs-deploy mismatches (edge
 * caches, HTML rewriters, missing revalidation) that source-only validators
 * cannot see.
 *
 * BASE_URL defaults to the published site; override for preview:
 *   BASE_URL=https://id-preview--<id>.lovable.app node scripts/validate-live-manifesto.mjs
 *
 * Skipped when SKIP_LIVE_MANIFESTO=1 (e.g. offline / feature branches).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

if (process.env.SKIP_LIVE_MANIFESTO === "1") {
  console.log("↷ Live manifesto validation skipped (SKIP_LIVE_MANIFESTO=1)");
  process.exit(0);
}

const BASE = (process.env.BASE_URL || "https://weddings.io").replace(/\/$/, "");
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SLUG = "ai-weddings-who-wins-when-every-app-looks-the-same";
const URL_ = `${BASE}/blog/${SLUG}/`;

const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const start = posts.indexOf(`slug: "${SLUG}"`);
const nextSlug = posts.indexOf(`slug: "`, start + 10);
const block = posts.slice(start, nextSlug > 0 ? nextSlug : start + 60000);
const pick = (k) => block.match(new RegExp(`\\b${k}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
const pickArrayFirst = (k) => block.match(new RegExp(`${k}:\\s*\\[\\s*"([^"]+)"`))?.[1];

const title = pick("title");
const seoTitle = pick("seoTitle");
const excerpt = pick("excerpt");
const metaDescription = pick("metaDescription");
const image = pick("image");
const primaryKw = pickArrayFirst("focusKeywords");
const rawTitle = seoTitle ?? (primaryKw && !title?.toLowerCase().includes(primaryKw.toLowerCase())
  ? `${title} — ${primaryKw} | Weddings.io`
  : `${title} | Weddings.io`);
const expectedTitle = rawTitle.length > 70 ? `${rawTitle.slice(0, 69)}…` : rawTitle;
const rawDesc = metaDescription ?? excerpt ?? "";
const descWithKw = metaDescription ? rawDesc
  : primaryKw && !rawDesc.toLowerCase().includes(primaryKw.toLowerCase())
    ? `${primaryKw}: ${rawDesc}` : rawDesc;
const expectedDesc = descWithKw.length > 160 ? `${descWithKw.slice(0, 159)}…` : descWithKw;
// The article versions its hero using this exact content hash. Keep the
// provenance query in the comparison so stale or unrelated versions still fail.
const imageManifest = JSON.parse(readFileSync(join(ROOT, "src/lib/blogImageManifest.json"), "utf8"));
const hero = image ?? "/opengraph.jpg";
const heroPath = hero.replace(/^https:\/\/weddings\.io/, "");
const hash = !hero.includes("?") && !/^https?:\/\//i.test(heroPath) ? imageManifest[heroPath] : null;
const versionedHero = hash ? `${hero}?v=${hash}` : hero;
const shareImage = pick("ogImage") ?? versionedHero;
const expectedImage = shareImage.startsWith("http") ? shareImage : `${BASE}${shareImage}`;

const errors = [];
const warns = [];
const check = (label, actual, expected) => {
  if (actual !== expected) errors.push(`${label}\n    expected: ${expected}\n    got:      ${actual ?? "(missing)"}`);
  else console.log(`  ✓ ${label}`);
};

console.log(`Fetching live manifesto: ${URL_}\n`);
const res = await fetch(URL_, { headers: { "user-agent": "weddings-io-live-validator/1.0" } });
if (!res.ok) {
  console.error(`✗ ${URL_} → HTTP ${res.status}`);
  process.exit(1);
}
const html = await res.text();

const meta = (name, attr = "property") => {
  const re1 = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*${attr}=["']${name}["']`, "i");
  return (html.match(re1) || html.match(re2))?.[1];
};
const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

check("<title>", titleTag, expectedTitle);
check("canonical", canonical, URL_);
check("og:url", meta("og:url"), URL_);
check("og:title", meta("og:title"), expectedTitle);
check("og:description", meta("og:description"), expectedDesc);
check("og:image", meta("og:image"), expectedImage);
check("og:type article", meta("og:type"), "article");
check("twitter:card", meta("twitter:card", "name"), "summary_large_image");
check("twitter:title", meta("twitter:title", "name"), expectedTitle);
check("twitter:description", meta("twitter:description", "name"), expectedDesc);
check("twitter:image", meta("twitter:image", "name"), expectedImage);

// Length compliance on the shipped tags.
const titleLen = titleTag?.length ?? 0;
const descLen = meta("og:description")?.length ?? 0;
if (titleLen > 70) errors.push(`live <title> ${titleLen} chars > 70`);
if (descLen > 160) errors.push(`live og:description ${descLen} chars > 160`);
console.log(`  ℹ title=${titleLen}/70  description=${descLen}/160`);

// og:image reachable + image/*.
try {
  const imgUrl = meta("og:image");
  let img = await fetch(imgUrl, { method: "HEAD", redirect: "follow" });
  if (img.status === 405 || img.status === 501) img = await fetch(imgUrl, { redirect: "follow" });
  const ct = img.headers.get("content-type") || "";
  if (!img.ok) errors.push(`og:image HTTP ${img.status} — ${imgUrl}`);
  else if (!/^image\//i.test(ct)) errors.push(`og:image content-type "${ct}" not image/*`);
  else console.log(`  ✓ og:image reachable ${img.status} ${ct.split(";")[0]}`);
} catch (e) { errors.push(`og:image fetch error: ${e.message}`); }

// Scan rendered internal <a href> for 404s + redirect loops.
const hrefs = new Set();
for (const m of html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)) {
  const h = m[1];
  if (h.startsWith("/") || h.startsWith(BASE)) hrefs.add(h.startsWith("/") ? `${BASE}${h}` : h);
}
console.log(`\nScanning ${hrefs.size} internal <a href> on live page…`);
async function trace(url) {
  const seen = new Set();
  let cur = url;
  for (let i = 0; i < 6; i++) {
    if (seen.has(cur)) return { ok: false, status: "loop" };
    seen.add(cur);
    let r;
    try { r = await fetch(cur, { method: "HEAD", redirect: "manual" }); }
    catch (e) { return { ok: false, status: `fetch: ${e.message}` }; }
    if (r.status === 405 || r.status === 501) r = await fetch(cur, { method: "GET", redirect: "manual" });
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get("location");
      if (!loc) return { ok: false, status: `${r.status} no Location` };
      cur = new URL(loc, cur).toString();
      continue;
    }
    return { ok: r.status < 400, status: r.status };
  }
  return { ok: false, status: "too-many-redirects" };
}
for (const href of hrefs) {
  const r = await trace(href);
  if (!r.ok) { errors.push(`${r.status} ${href}`); console.error(`  ✗ ${r.status} ${href}`); }
  else console.log(`  ✓ ${r.status} ${href}`);
}

if (warns.length) { console.warn(`\n⚠ warnings:`); for (const w of warns) console.warn(`  - ${w}`); }
if (errors.length) {
  console.error(`\n✗ Live manifesto validation failed (${errors.length}) for ${URL_}:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\n✓ Live manifesto (${URL_}) matches source: metadata, OG/Twitter, and all internal links resolve.`);
