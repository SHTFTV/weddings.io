#!/usr/bin/env node
/**
 * Regenerate optimized hero-image variants for the manifesto post.
 * Produces JPG + WebP + AVIF at 800w, 1200w, 1600w using the existing
 * lockfile-pinned sharp dependency, without a system ImageMagick executable.
 *
 * Called by CI before validate-manifesto-images.mjs so budgets are enforced
 * against freshly produced files. Idempotent — re-running is safe.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SOURCE = join(ROOT, "public/blog-images/ai-weddings-who-wins.jpg");
const BASE = join(ROOT, "public/blog-images/ai-weddings-who-wins");

if (!existsSync(SOURCE)) {
  console.error(`✗ source image missing: ${SOURCE}`);
  process.exit(1);
}

// Quality settings tuned to fit the budgets in validate-manifesto-images.mjs.
const RECIPES = [
  { w: 800,  jpg: 82, webp: 78, avif: 55 },
  { w: 1200, jpg: 82, webp: 78, avif: 55 },
  { w: 1600, jpg: 82, webp: 78, avif: 55 },
];

for (const { w, jpg, webp, avif } of RECIPES) {
  const jpgOut  = `${BASE}-${w}w.jpg`;
  const webpOut = `${BASE}-${w}w.webp`;
  const avifOut = `${BASE}-${w}w.avif`;
  await sharp(SOURCE).resize({ width: w, withoutEnlargement: true }).jpeg({ quality: jpg, progressive: true, mozjpeg: true }).toFile(jpgOut);
  await sharp(jpgOut).webp({ quality: webp, effort: 6 }).toFile(webpOut);
  await sharp(jpgOut).avif({ quality: avif, effort: 6 }).toFile(avifOut);
  console.log(`  → ${w}w (jpg q${jpg}, webp q${webp}, avif q${avif})`);
}
console.log("✓ Hero image variants regenerated. Run validate-manifesto-images.mjs to check budgets.");
