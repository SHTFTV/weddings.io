import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { homepageCarouselPosts, sortedBlogPosts, getBlogPost } from "@/lib/blogPosts";
import { BlogCard, blogCardHref } from "@/components/BlogCard";

// Render the same slice the homepage renders: `homepageCarouselPosts.slice(0, 4)`.
// Guards that (1) the derived list stays newest → oldest, (2) matches the
// blog index order, and (3) PPP appears where its 2026-07-14 date puts it.

const PPP_SLUG = "ppp-pricing-wedding-platform-industry-first";

describe("Homepage carousel — end-to-end order", () => {
  const latest = homepageCarouselPosts.slice(0, 4);

  it("carousel starts at the newest eligible publication date", () => {
    const eligible = sortedBlogPosts.filter(post => post.slug !== "weddings-io-public-record-prior-use-continuous-operation");
    expect(latest[0]?.date).toBe(eligible[0]?.date);
  });

  it("carousel dates are strictly newest → oldest", () => {
    for (let i = 1; i < latest.length; i++) {
      expect(latest[i - 1].date >= latest[i].date).toBe(true);
    }
  });

  it("an older PPP article remains available without displacing newer stories", () => {
    expect(getBlogPost(PPP_SLUG)?.date).toBe("2026-07-14");
    if (latest.every(post => post.date > "2026-07-14")) expect(latest.map(post => post.slug)).not.toContain(PPP_SLUG);
  });

  it("renders one <article> per carousel card with the correct href and title", () => {
    render(
      <div>
        {latest.map((p) => (
          <BlogCard key={p.slug} post={p} />
        ))}
      </div>,
    );
    const articles = document.querySelectorAll("article");
    expect(articles.length).toBe(latest.length);
    for (const p of latest) {
      // Title is rendered as text somewhere in the card.
      expect(screen.getAllByText(p.title, { exact: false }).length).toBeGreaterThan(0);
      // Card link resolves to the expected href.
      const anchors = document.querySelectorAll<HTMLAnchorElement>(
        `a[href="${blogCardHref(p)}"]`,
      );
      expect(anchors.length, `no card link for ${p.slug}`).toBeGreaterThan(0);
    }
  });

  it("the retained PPP card renders its original July 14, 2026 date label", () => {
    render(<BlogCard post={getBlogPost(PPP_SLUG)!} />);
    expect(screen.getAllByText(/July\s+14,\s+2026/).length).toBeGreaterThan(0);
  });
});
