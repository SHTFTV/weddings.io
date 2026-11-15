import {describe, it, expect} from 'vitest';
import {expectedBlogHealth, parseBlogSeoHtml} from '../blogSeoHealth';
import {getBlogPost} from '../blogPosts';

describe('production SEO health source and parsing', () => {
  it('resolves a published JSON-style post from bundled data without source-file parsing', () => {
    const slug = '2027-wedding-trends-emerging-planning-decisions';
    const post = getBlogPost(slug)!;
    const expected = expectedBlogHealth(slug)!;
    expect(expected.meta['ld.headline']).toBe(post.title);
    expect(expected.meta['ld.author']).toBe('Weddings.io Editorial');
    expect(expected.meta['og:image']).toContain(post.ogImage!);
    expect(expected.meta['ld.image']).toContain(post.image);
    expect(expected.meta.title.length).toBeLessThanOrEqual(70);
    expect(expected.meta.description.length).toBeLessThanOrEqual(160);
    expect(expectedBlogHealth('not-a-published-post')).toBeNull();
  });
  it('keeps the published video social cards distinct from article imagery', () => {
    const expected = expectedBlogHealth('next-saas-moat-shared-success')!;
    expect(expected.meta['og:type']).toBe('video.other');
    expect(expected.meta['twitter:card']).toBe('player');
    expect(expected.meta['twitter:image']).not.toBe(expected.meta['og:image']);
  });
  it('reads reordered attributes, embedded apostrophes and escaped metadata without truncation', () => {
    const parsed = parseBlogSeoHtml(`<title>A couple’s plan &amp; choice</title><meta content="What's next &amp; why?" name="description"><meta content='A &quot;clear&quot; plan' property='og:title'><link href="https://weddings.io/blog/example/" rel="canonical"><script type="application/ld+json">{"@graph":[{"@type":"BlogPosting","headline":"A plan","image":{"url":"https://weddings.io/hero.jpg"},"author":[{"name":"Weddings.io Editorial"}],"datePublished":"2026-11-14"}]}</script>`);
    expect(parsed.title).toBe('A couple’s plan & choice');
    expect(parsed.description).toBe("What's next & why?");
    expect(parsed['og:title']).toBe('A "clear" plan');
    expect(parsed.canonical).toBe('https://weddings.io/blog/example/');
    expect(parsed['ld.author']).toBe('Weddings.io Editorial');
    expect(parsed['ld.image']).toBe('https://weddings.io/hero.jpg');
  });
});
