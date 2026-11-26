import type { BlogPost } from "../lib/blogPosts";
import { slugifyTopic } from "../lib/blogPosts";
import { withImageVersion } from "../lib/blogImageVersion";
import { PostVote } from "./PostVote";

type BlogCardProps = {
  post: BlogPost;
  showVote?: boolean;
};

/** Deterministic href for a blog card — exported for unit tests. */
export function blogCardHref(post: Pick<BlogPost, "slug" | "externalUrl">): string {
  if (post.externalUrl) return post.externalUrl;
  return post.slug === "Who-Owns-Weddings.io" ? `/${post.slug}` : `/blog/${post.slug}/`;
}

export function BlogCard({ post, showVote = false }: BlogCardProps) {
  const href = blogCardHref(post);
  const external = Boolean(post.externalUrl);
  const categorySlug = post.category ? slugifyTopic(post.category) : "";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/70">
      <a
        href={href}
        {...(external ? { rel: "noopener" } : {})}
        className="block"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <picture>
            {(post.imageWebp || post.imageWebpSmall) && (
              <source
                type="image/webp"
                srcSet={[
                  post.imageWebpSmall ? `${withImageVersion(post.imageWebpSmall)} 800w` : null,
                  post.imageWebp ? `${withImageVersion(post.imageWebp)} 1600w` : null,
                ]
                  .filter(Boolean)
                  .join(", ")}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            )}
            <img
              src={withImageVersion(post.image)}
              alt={post.imageAlt ?? post.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          {post.slug === "photographer-and-videographer-handoff-planning-a-toronto-wedding-day" && <span className="absolute bottom-3 right-3 rounded bg-black/85 px-3 py-1 text-xs font-bold text-white">Weddings.io</span>}</picture>
        </div>
      </a>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.category && categorySlug && (
            <a
              href={`/blog/category/${categorySlug}/`}
              className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary hover:bg-primary/20"
            >
              {post.category}
            </a>
          )}
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{post.dateLabel}</p>
          {post.readTime && (
            <span className="rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {post.readTime} read
            </span>
          )}
        </div>
        <a href={href} {...(external ? { rel: "noopener" } : {})} className="block">
          <h2 className="mb-3 font-serif text-xl leading-snug text-card-foreground group-hover:text-primary">
            {post.title}
          </h2>
        </a>
        <p className="mb-5 line-clamp-4 flex-1 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
        <a
          href={href}
          {...(external ? { rel: "noopener" } : {})}
          className="text-sm font-medium text-primary"
        >
          Read Article →
        </a>
        {showVote && <PostVote slug={post.slug} />}
      </div>
    </article>
  );
}
