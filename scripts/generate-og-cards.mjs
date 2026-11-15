#!/usr/bin/env node
/**
 * generate-og-cards.mjs
 *
 * Generates versioned Open Graph preview cards (1200×630 JPG) for every
 * visible blog post, writes them to public/opengraph-images/<slug>-<hash>.jpg,
 * and updates src/lib/blogOgCards.json so the site can resolve the current
 * card URL for a slug.
 *
 * The hash is derived from the SOURCE hero image content hash in
 * src/lib/blogImageManifest.json plus the post's title/subtitle. That
 * couples the card URL to the manifest — republishing with a new hero
 * or copy change emits a new URL, so CDNs/social platforms can't serve a
 * stale card.
 *
 * Runs in prebuild AFTER build-image-manifest.mjs. Safe to run repeatedly.
 */
import fs from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const OUT_DIR = "public/opengraph-images";
const CARDS_FILE = "src/lib/blogOgCards.json";
const FALLBACK_HERO = "public/opengraph.jpg";
mkdirSync(OUT_DIR, { recursive: true });

const manifest = existsSync("src/lib/blogImageManifest.json")
  ? JSON.parse(await fs.readFile("src/lib/blogImageManifest.json", "utf8"))
  : {};

const src = await fs.readFile("src/lib/blogPosts.ts", "utf8");
const visible = (() => {
  const m = src.match(/visibleBlogSlugs\s*=\s*\[([\s\S]*?)\]/);
  return m ? new Set([...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map(x => x[1])) : null;
})();

function extractPosts(source) {
  const posts = [];
  const objRe = /\{\s*slug:\s*["'`]([^"'`]+)["'`][\s\S]*?\n\s{2}\},/g;
  let m;
  while ((m = objRe.exec(source))) {
    const block = m[0];
    const pick = (k) => {
      const r = new RegExp(`${k}:\\s*["'\`]((?:[^"'\`\\\\]|\\\\.)*)["'\`]`);
      const mm = block.match(r);
      return mm ? mm[1] : undefined;
    };
    posts.push({
      slug: m[1],
      title: pick("title") || "",
      subtitle: pick("subtitle") || "",
      category: pick("category") || "",
      image: pick("image") || "",
    });
  }
  return posts;
}
const posts = extractPosts(src).filter(p => !visible || visible.has(p.slug));

// Escape XML/SVG-hostile chars.
const xmlEscape = (s) => s.replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));
function wrap(text, maxChars, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    } else {
      line = (line ? line + " " : "") + w;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\s*\S*$/, "…");
  }
  return lines;
}

// Choose an overlay variant based on title length so short titles get
// large hero type and long titles reflow into a smaller multi-line block.
// All variants render at the crawler-safe 1200x630 (1.91:1) aspect ratio.
function pickVariant(title) {
  const len = (title || "").length;
  if (len <= 42)  return { name: "short",  titleSize: 78, wrapChars: 26, wrapLines: 2, lineHeight: 92, subSize: 32 };
  if (len <= 78)  return { name: "medium", titleSize: 64, wrapChars: 34, wrapLines: 3, lineHeight: 78, subSize: 30 };
  return              { name: "long",   titleSize: 52, wrapChars: 40, wrapLines: 4, lineHeight: 64, subSize: 28 };
}

function overlaySvg(post) {
  const v = pickVariant(post.title);
  const titleLines = wrap(xmlEscape(post.title), v.wrapChars, v.wrapLines);
  const subLines = wrap(xmlEscape(post.subtitle || ""), 60, 2);
  const cat = xmlEscape((post.category || "Weddings.io").toUpperCase());
  const titleY = 210;
  const titleTspans = titleLines.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : v.lineHeight}">${l}</tspan>`).join("");
  const subY = titleY + titleLines.length * v.lineHeight + 40;
  const subTspans = subLines.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 38}">${l}</tspan>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="#000" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="80" y="120" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="#f7c873" font-weight="700" letter-spacing="4">${cat}</text>
  <text x="80" y="${titleY}" font-family="Georgia, 'Times New Roman', serif" font-size="${v.titleSize}" fill="#ffffff" font-weight="700">${titleTspans}</text>
  <text x="80" y="${subY}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="${v.subSize}" fill="#e6e6e6">${subTspans}</text>
  <text x="80" y="580" font-family="'Helvetica Neue', Arial, sans-serif" font-size="26" fill="#ffffff" font-weight="700">weddings.io</text>
</svg>`;
}

function heroFsPath(post) {
  const image = post.image?.startsWith("/") ? post.image : "/opengraph.jpg";
  const candidates = [
    "public" + image,
    "public" + image.replace(/\.(jpg|jpeg|png|webp|avif)$/i, "-1600w.jpg"),
    "public" + image.replace(/\.(jpg|jpeg|png|webp|avif)$/i, "-1200w.jpg"),
    "public" + image.replace(/\.(jpg|jpeg|png|webp|avif)$/i, "-800w.jpg"),
    FALLBACK_HERO,
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  return FALLBACK_HERO;
}

function hashFor(post) {
  const heroKey = post.image?.replace(/^https:\/\/weddings\.io/, "") || "/opengraph.jpg";
  const manifestHash = manifest[heroKey] || "";
  return crypto.createHash("sha256")
    .update(`${post.slug}\n${post.title}\n${post.subtitle}\n${manifestHash}\nv1`)
    .digest("hex").slice(0, 10);
}

const cards = {};
let generated = 0;
for (const post of posts) {
  const variant = pickVariant(post.title).name;
  const hash = hashFor(post);
  const outName = `${post.slug}-${variant}-${hash}.jpg`;
  const outPath = path.join(OUT_DIR, outName);
  const urlPath = `/opengraph-images/${outName}`;
  cards[post.slug] = { url: urlPath, hash, variant, width: 1200, height: 630 };
  if (existsSync(outPath)) continue;

  // Existing content-hashed card URLs may still be used by shared links and
  // cached previews. Keep those immutable files when a new card is generated.

  const hero = heroFsPath(post);
  const overlay = Buffer.from(overlaySvg(post));
  await sharp(hero)
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outPath);
  generated++;
  console.log(`✓ ${outName}  (from ${path.basename(hero)})`);
}

await fs.writeFile(CARDS_FILE, JSON.stringify(cards, null, 2) + "\n");
console.log(`\nOG cards: ${generated} generated, ${Object.keys(cards).length} tracked -> ${CARDS_FILE}`);
