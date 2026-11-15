#!/usr/bin/env bun
/**
 * Preflight: verify snapshot baselines exist for the pricing-rows-a11y spec.
 *
 * Snapshot names come from calls to `toHaveScreenshot(name)` in
 * tests/e2e/pricing-rows-a11y.spec.ts:
 *   - row-callout-{theme}-{project}.png
 *   - row-city-{i}-{theme}-{project}.png    (i = 0..SUPPORTED_CITIES.length-1)
 *
 * Playwright stores them at:
 *   tests/e2e/pricing-rows-a11y.spec.ts-snapshots/<name>-{project}-{platform}.png
 * The screenshot argument already contains the project; Playwright appends
 * the project and platform again using its default snapshot path template.
 *
 * Usage:
 *   bun scripts/pricing-preflight-snapshots.mjs               # all cross-browser projects
 *   bun scripts/pricing-preflight-snapshots.mjs chromium      # one browser
 *   bun scripts/pricing-preflight-snapshots.mjs firefox webkit
 *
 * Exit code: 0 = all baselines present, 1 = at least one missing.
 * Emits `missing=true|false` and a JSON `missing_files` list to $GITHUB_OUTPUT when set.
 */
import { existsSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { SUPPORTED_CITIES } from "../src/lib/territoryPricing.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const SNAP_DIR = resolve(
  REPO_ROOT,
  "tests/e2e/pricing-rows-a11y.spec.ts-snapshots"
);

const THEMES = ["light", "dark"];
const PROJECTS_BY_BROWSER = {
  chromium: ["pricing-chromium-desktop", "pricing-chromium-mobile"],
  firefox: ["pricing-firefox-desktop", "pricing-firefox-mobile"],
  webkit: ["pricing-webkit-desktop", "pricing-webkit-mobile"],
};

function expectedFilesFor(projects, cityCount) {
  const files = [];
  for (const project of projects) {
    for (const theme of THEMES) {
      files.push(`row-callout-${theme}-${project}-${project}-${process.platform}.png`);
      for (let i = 0; i < cityCount; i++) {
        files.push(`row-city-${i}-${theme}-${project}-${project}-${process.platform}.png`);
      }
    }
  }
  return files;
}

function main() {
  const browsers = process.argv.slice(2).length
    ? process.argv.slice(2)
    : Object.keys(PROJECTS_BY_BROWSER);
  const projects = browsers.flatMap((b) => {
    const p = PROJECTS_BY_BROWSER[b];
    if (!p) {
      console.error(`Unknown browser: ${b}`);
      process.exit(2);
    }
    return p;
  });

  const cityCount = SUPPORTED_CITIES.length;
  if (!cityCount) throw new Error("SUPPORTED_CITIES is empty");
  const expected = expectedFilesFor(projects, cityCount);

  const missing = expected.filter((f) => !existsSync(resolve(SNAP_DIR, f)));
  const present = expected.length - missing.length;

  console.log(`Preflight: pricing-rows-a11y baselines`);
  console.log(`  dir:      ${SNAP_DIR}`);
  console.log(`  browsers: ${browsers.join(", ")}`);
  console.log(`  projects: ${projects.join(", ")}`);
  console.log(`  cities:   ${cityCount}`);
  console.log(`  expected: ${expected.length}`);
  console.log(`  present:  ${present}`);
  console.log(`  missing:  ${missing.length}`);
  if (missing.length) {
    console.log("");
    console.log("Missing baseline files:");
    for (const f of missing) console.log(`  - ${f}`);
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `missing=${missing.length > 0}\n` +
        `missing_count=${missing.length}\n` +
        `missing_files<<EOF\n${missing.join("\n")}\nEOF\n`
    );
  }

  process.exit(missing.length > 0 ? 1 : 0);
}

main();
