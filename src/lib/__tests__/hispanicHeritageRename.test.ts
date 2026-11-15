import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..", "..");

const cultureFeatures = readFileSync(join(ROOT, "src/components/CultureFeatures.tsx"), "utf8");
const toolsIndex = readFileSync(join(ROOT, "src/routes/tools.index.tsx"), "utf8");
const cultures = readFileSync(join(ROOT, "src/routes/cultures.tsx"), "utf8");
const contribute = readFileSync(join(ROOT, "src/routes/contribute.tsx"), "utf8");
const index = readFileSync(join(ROOT, "src/routes/index.tsx"), "utf8");

describe("Hispanic Heritage rename — visible labels", () => {
  it("CultureFeatures card renders as Hispanic Heritage (name + CTA)", () => {
    expect(cultureFeatures).toMatch(/name:\s*"Hispanic Heritage"/);
    expect(cultureFeatures).toMatch(/cta:\s*"Open Hispanic Heritage Tools"/);
    // No orphan "Mexican" as a visible name/label
    expect(cultureFeatures).not.toMatch(/name:\s*"Mexican"/);
    expect(cultureFeatures).not.toMatch(/cta:\s*"Open Mexican Tools"/);
  });

  it("Rotating headline word list contains Hispanic Heritage, not Mexican", () => {
    expect(cultureFeatures).toMatch(/\{\s*word:\s*"Hispanic Heritage"/);
    expect(cultureFeatures).not.toMatch(/\{\s*word:\s*"Mexican"/);
  });

  it("Culture sidebar/nav label uses Hispanic Heritage", () => {
    expect(cultureFeatures).toMatch(/label:\s*"🎺 Hispanic Heritage"/);
    expect(cultureFeatures).not.toMatch(/label:\s*"🎺 Mexican & Latino"/);
  });

  it("Tools hub grid renders Hispanic Heritage row", () => {
    expect(toolsIndex).toMatch(/slug:\s*"mexican",\s*name:\s*"Hispanic Heritage"/);
    expect(toolsIndex).not.toMatch(/slug:\s*"mexican",\s*name:\s*"Mexican"/);
  });

  it("Tools + Cultures meta descriptions list Hispanic Heritage", () => {
    expect(toolsIndex).toMatch(/Jewish, Hispanic Heritage, Nordic/);
    expect(cultures).toMatch(/Jewish, Hispanic Heritage, Nordic/);
    expect(toolsIndex).not.toMatch(/Jewish, Mexican, Nordic/);
    expect(cultures).not.toMatch(/Jewish, Mexican, Nordic/);
  });

  it("Contribute page header uses Hispanic Heritage", () => {
    expect(contribute).toMatch(/"🎺 Hispanic Heritage"/);
    expect(contribute).not.toMatch(/"🎺 Mexican"/);
  });

  it("the magazine links its culture edit and keeps the culture directory accessible", () => {
    const magazine = readFileSync(join(ROOT, "src/components/WeddingMagazineHome.tsx"), "utf8");
    expect(index).toContain("WeddingMagazineHome");
    expect(magazine).toContain('["Mexican & Latino", "mexican", "mexican-wedding-planning-guide-2026"]');
    expect(magazine).toContain('href="/cultures">Cultures</a>');
    expect(cultureFeatures).toMatch(/name:\s*"Hispanic Heritage"/);
  });

  it("Existing /tools/mexican/ route + hero image are preserved (no broken links)", () => {
    // slug and href are intentionally kept for URL stability
    expect(cultureFeatures).toMatch(/slug:\s*"mexican"/);
    expect(cultureFeatures).toMatch(/href:\s*"\/tools\/mexican\/"/);
    expect(cultureFeatures).toMatch(/image:\s*"\/images\/cultures\/mexican-hero\.jpg"/);
    expect(index).toContain('href="/tools/mexican/"');
  });
});
