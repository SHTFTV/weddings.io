import {getBlogPost} from './blogPosts';
import {withImageVersion} from './blogImageVersion';
import imageManifest from './blogImageManifest.json' with {type: 'json'};
import ogCards from './blogOgCards.json' with {type: 'json'};
import {ECOSYSTEM_VIDEO_OG_IMAGE, ECOSYSTEM_VIDEO_TWITTER_IMAGE} from '../components/EcosystemVideo';

const absolute = (value: string) => value.startsWith('http') ? value : `https://weddings.io${value}`;

// Use the same bundled post data as the rendered article. Production server
// bundles do not contain an editable src/lib/blogPosts.ts runtime file.
export function expectedBlogHealth(slug: string) {
  const post = getBlogPost(slug);
  if (!post) return null;
  const keyword = post.focusKeywords?.[0];
  const rawTitle = post.seoTitle ?? (keyword && !post.title.toLowerCase().includes(keyword.toLowerCase()) ? `${post.title} — ${keyword} | Weddings.io` : `${post.title} | Weddings.io`);
  const title = rawTitle.length > 70 ? `${rawTitle.slice(0, 69)}…` : rawTitle;
  const baseDescription = post.metaDescription ?? post.excerpt ?? 'Weddings.io blog article.';
  const rawDescription = post.metaDescription ? baseDescription : (keyword && !baseDescription.toLowerCase().includes(keyword.toLowerCase()) ? `${keyword}: ${baseDescription}` : baseDescription);
  const description = rawDescription.length > 160 ? `${rawDescription.slice(0, 159)}…` : rawDescription;
  const canonical = `https://weddings.io/blog/${slug}/`;
  const hero = absolute(withImageVersion(post.image));
  const video = slug === 'next-saas-moat-shared-success';
  const ogImage = video ? absolute(ECOSYSTEM_VIDEO_OG_IMAGE) : post.ogImage ? absolute(post.ogImage) : hero;
  const twitterImage = video ? absolute(ECOSYSTEM_VIDEO_TWITTER_IMAGE) : ogImage;
  const generated = (ogCards as Record<string, {url: string; hash: string}>)[slug];
  // A generated card that the article no longer uses is not its expected image.
  const card = generated && absolute(generated.url) === ogImage.split('?')[0] ? generated : null;
  return {
    ogCard: card,
    heroImageHash: (imageManifest as Record<string, string>)[post.image] ?? null,
    meta: {
      title, description, canonical,
      'og:title': title, 'og:description': description, 'og:image': ogImage,
      'og:url': canonical, 'og:type': video ? 'video.other' : 'article',
      'twitter:card': video ? 'player' : 'summary_large_image',
      'twitter:title': title, 'twitter:description': description, 'twitter:image': twitterImage,
      'ld.headline': post.title, 'ld.image': hero, 'ld.datePublished': post.date,
      'ld.author': 'Weddings.io Editorial'
    }
  };
}

function decode(value: string) {
  const named: Record<string, string> = {amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' '};
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, key: string) => {
    if (key[0] !== '#') return named[key.toLowerCase()] ?? entity;
    const number = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
    return number >= 0 && number <= 0x10ffff ? String.fromCodePoint(number) : entity;
  });
}

export function parseBlogSeoHtml(html: string) {
  const attribute = (tag: string, name: string) => decode(tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2] ?? '').trim();
  const meta: Record<string, string> = {};
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const name = attribute(tag, 'property') || attribute(tag, 'name');
    if (name && !(name in meta)) meta[name] = attribute(tag, 'content');
  }
  const canonical = [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => tag).find(tag => attribute(tag, 'rel') === 'canonical');
  const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(match => {
    try { const value = JSON.parse(match[1]); return Array.isArray(value) ? value : value['@graph'] || [value]; } catch { return []; }
  });
  const article = jsonLd.find(node => [node?.['@type']].flat().some(type => type === 'Article' || type === 'BlogPosting'));
  const image = Array.isArray(article?.image) ? article.image[0] : article?.image;
  return {
    ...meta,
    title: decode(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? '').trim(),
    description: meta.description ?? '',
    canonical: canonical ? attribute(canonical, 'href') : '',
    'ld.headline': String(article?.headline ?? '').trim(),
    'ld.image': String(image?.url ?? image ?? '').trim(),
    'ld.datePublished': String(article?.datePublished ?? '').trim(),
    'ld.author': String((Array.isArray(article?.author) ? article.author[0]?.name : article?.author?.name) ?? '').trim()
  };
}
