import { useEffect, useState } from "react";

export type CoverStory = {
  slug: string; title: string; category: string; excerpt: string;
  dateLabel: string; image: string; imageAlt: string; imageCredit: string;
};

export function MagazineCover({ stories }: { stories: CoverStory[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (paused || engaged || preference.matches || stories.length < 2) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % stories.length), 12000);
    return () => window.clearInterval(timer);
  }, [paused, engaged, stories.length]);
  const current = stories[index] || stories[0];
  if (!current) return null;
  const select = (next: number) => { setIndex((next + stories.length) % stories.length); setPaused(true); };
  return <section className="wm-cover-feature" aria-roledescription="carousel" aria-label="Featured wedding stories"
    onMouseEnter={() => setEngaged(true)} onMouseLeave={() => setEngaged(false)}
    onFocusCapture={() => setEngaged(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false); }}>
    <div className="wm-cover-art" data-cover-slug={current.slug}>
      <img src={current.image} alt={current.imageAlt} width="1600" height="900" fetchPriority="high" />
      <div className="wm-cover-copy" aria-live={paused ? "polite" : "off"}>
        <p className="wm-kicker">The cover story / {current.category}</p>
        <h1><a href={`/blog/${current.slug}/`}>{current.title}</a></h1>
        <p>{current.excerpt}</p>
        <a href={`/blog/${current.slug}/`}>Read the story ↗</a>
        <time>{current.dateLabel}</time>
      </div>
    </div>
    <p className="wm-cover-credit">{current.imageCredit}</p>
    <div className="wm-cover-controls">
      <button type="button" onClick={() => select(index - 1)} aria-label="Previous cover story">←</button>
      <span>{String(index + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}</span>
      <button type="button" onClick={() => select(index + 1)} aria-label="Next cover story">→</button>
      <button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Play stories" : "Pause stories"}</button>
    </div>
    <nav className="wm-cover-storylist" aria-label="Choose a cover story">
      {stories.map((item, position) => <button type="button" key={item.slug} aria-current={index === position ? "true" : undefined}
        onClick={() => select(position)}><span>{String(position + 1).padStart(2, "0")} / {item.category}</span>{item.title}</button>)}
    </nav>
  </section>;
}
