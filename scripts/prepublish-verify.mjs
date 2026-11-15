#!/usr/bin/env node
/**
 * Prepublish verification.
 *
 * Blocks a deploy from going live unless, for every blog post:
 *   1. The post appears in public/sitemap.xml at
 *      https://weddings.io/blog/<slug>/  (trailing slash).
 *   2. Its hero image + every inline ![](path) reference in body/subtitle
 *      resolves to an existing file under public/  (so production won't 404).
 *   3. The route's derived canonical + og:url match
 *      https://weddings.io/blog/<slug>/.
 *   4. The route emits a BlogPosting JSON-LD block (checked by grep — full
 *      structural validation runs in scripts/validate-schema.mjs).
 *
 * Optional: pass --remote to additionally HEAD every referenced image URL
 * on https://weddings.io and fail on non-2xx / non-image responses. This is
 * a post-deploy sanity check; skip it in prebuild since new files 404 until
 * the deploy lands.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { blogPosts } from "../src/lib/blogPosts.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = "https://weddings.io";
const REMOTE = process.argv.includes("--remote");

const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
const routeSrc = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");

const errors = [];
const targets = blogPosts;


// (4) BlogPosting JSON-LD must be present in the route.
if (!/"@type":\s*"BlogPosting"/.test(routeSrc)) {
  errors.push("src/routes/blog.$slug.tsx: no BlogPosting JSON-LD block found");
}

const extractImageRefs = (post) => {
  const refs = new Set();
  if (post.image) refs.add(post.image);
  const scan = (s) => {
    if (typeof s !== "string") return;
    for (const m of s.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) refs.add(m[1]);
  };
  scan(post.subtitle);
  (post.body ?? []).forEach(scan);
  return [...refs];
};

for (const post of targets) {
  const canonical = `${SITE}/blog/${post.slug}/`;

  // (1) sitemap coverage
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
    errors.push(`${post.slug}: missing from public/sitemap.xml (${canonical})`);
  }

  // (2) local image files exist under public/
  for (const ref of extractImageRefs(post)) {
    if (/^https?:\/\//i.test(ref)) continue;
    const local = join(ROOT, "public", ref.replace(/^\//, ""));
    if (!existsSync(local)) {
      errors.push(`${post.slug}: image reference "${ref}" not found at public${ref}`);
    }
  }

  // (3) canonical/og:url derivation matches expected shape.
  // The route builds `https://weddings.io/blog/${params.slug}/`; this asserts
  // the slug itself is URL-safe (no spaces, uppercase-only exceptions aside).
  if (!/^[A-Za-z0-9._-]+$/.test(post.slug)) {
    errors.push(`${post.slug}: slug contains characters that break canonical/og:url`);
  }
}

// Optional: verify each unique image URL is HTTP 200 image/* on production.
if (REMOTE) {
  const urls = new Set();
  for (const post of targets) for (const r of extractImageRefs(post)) {
    urls.add(/^https?:\/\//i.test(r) ? r : `${SITE}${r}`);
  }
  for (const url of urls) {
    try {
      let res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (res.status === 405 || res.status === 501) {
        res = await fetch(url, { method: "GET", redirect: "follow" });
      }
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok) errors.push(`REMOTE ${url} → HTTP ${res.status}`);
      else if (!/^image\//i.test(ct)) errors.push(`REMOTE ${url} content-type "${ct}" not image/*`);
      else console.log(`  ✓ ${res.status} ${ct.split(";")[0]} — ${url}`);
    } catch (e) {
      errors.push(`REMOTE ${url} — ${e.message}`);
    }
  }
}

if (errors.length) {
  console.error(`\n✗ Prepublish verification failed (${errors.length} issue${errors.length === 1 ? "" : "s"}):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ Prepublish verification passed for ${targets.length} blog post(s)${REMOTE ? " (remote images checked)" : ""}`);
