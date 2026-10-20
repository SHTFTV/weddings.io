import { blogPosts } from "../lib/blogPosts";

const story = (slug: string) => blogPosts.find((post) => post.slug === slug);
const desks = [
  ["Real & celebrity weddings", "#real-weddings"], ["Culture & tradition", "#culture"],
  ["Destinations", "#destinations"], ["Style & details", "#style"],
  ["Planning", "#planning"], ["The business", "#business"],
];
const cultures = [
  ["South Asian", "south-asian", "multi-day-indian-wedding-logistics-mehndi-to-reception"],
  ["Chinese", "chinese", "chinese-wedding-planning-guide-2026"],
  ["Persian", "persian", "persian-wedding-planning-guide-2026"],
  ["Jewish", "jewish", "jewish-wedding-planning-guide-2026"],
  ["Mexican & Latino", "mexican", "mexican-wedding-planning-guide-2026"],
  ["Nordic", "nordic", "nordic-wedding-planning-guide-2026"],
  ["Southeast Asian", "southeast-asian", "southeast-asian-wedding-planning-guide-2026"],
  ["Western", "western", "western-traditional-wedding-planning-guide-2026"],
];

function StoryCard({ slug, label, title, image }: { slug: string; label?: string; title?: string; image?: string }) {
  const post = story(slug);
  if (!post) return null;
  return <article className="wm-story"><a href={`/blog/${slug}`} className="wm-story-image">
    <img src={image || post.image} alt={post.imageAlt || post.title} loading="lazy" width="800" height="540" />
  </a><p className="wm-kicker">{label || post.category}</p>
    <h3><a href={`/blog/${slug}`}>{title || post.title}</a></h3>
    <p>{post.excerpt}</p><a className="wm-read" href={`/blog/${slug}`}>Read the story <span aria-hidden="true">↗</span></a></article>;
}
function Chapter({ id, number, title, copy, image, href }: { id: string; number: string; title: string; copy: string; image: string; href: string }) {
  return <section id={id} className="wm-chapter"><img src={image} alt="" loading="lazy" width="1800" height="700" />
    <div><p className="wm-kicker">The wedding edit / {number}</p><h2>{title}</h2><p>{copy}</p><a href={href}>Explore the edit <span aria-hidden="true">↗</span></a></div></section>;
}
export function WeddingMagazineHome() {
  return <div className="wm">
    <a className="wm-skip" href="#wm-main">Skip to stories</a>
    <div className="wm-topline"><span>A whole world of weddings.</span><a href="/tools/">Open your planning tools ↗</a></div>
    <header className="wm-header">
      <div className="wm-masthead"><span className="wm-edition">Ideas. Traditions.<br />Your kind of celebration.</span>
      <a href="/" className="wm-logo" aria-label="Weddings.io home">Weddings<span>.io</span><i>THE WEDDING EDIT</i></a>
      <a className="wm-plan" href="/tools/">Let’s make a plan ↗</a></div>
      <nav aria-label="Magazine sections">{desks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a href="/blog/">All stories ↗</a></nav>
    </header>
    <main id="wm-main">
      <section className="wm-cover wm-shell">
        <div className="wm-cover-art"><img src="/images/hero-1.jpg" alt="A richly decorated wedding celebration setting" width="1600" height="1100" fetchPriority="high" />
          <div className="wm-cover-copy"><p className="wm-kicker">The art of celebrating</p><h1>All the feeling.<br /><em>Your kind of wedding.</em></h1>
          <p>Big traditions. Small details. A celebration that feels unmistakably like you.</p>
          <a href="/blog/how-to-plan-a-multicultural-wedding">Begin with what matters ↗</a></div></div>
        <aside className="wm-cover-side"><p className="wm-kicker">In this edit</p><h2>A little inspiration.<br /><em>A proper plan.</em></h2>
          <a href="/blog/how-to-plan-a-multicultural-wedding"><span>01 / Culture</span><h3>Two families. More than one tradition. One wedding.</h3><p>Make room for the things that matter to both of you.</p></a>
          <a href="/blog/destination-south-asian-weddings-guide"><span>02 / Somewhere special</span><h3>The destination is only the beginning.</h3><p>Think beyond the view: guests, ceremonies and the journey.</p></a>
          <a href="/calculator.html"><span>03 / The practical bit</span><h3>Love the vision. Know the budget.</h3><p>Start with a number, then make room for your priorities.</p></a>
        </aside>
      </section>
      <div className="wm-note wm-shell"><span>THE WEDDINGS.IO POINT OF VIEW</span><p>Inspiration worth saving. Traditions worth understanding. Tools that help you get from “yes” to the day itself.</p></div>
      <section id="real-weddings" className="wm-shell wm-section"><div className="wm-section-heading"><div><p className="wm-kicker">People, not just Pinterest</p><h2>The stories behind <em>the celebration.</em></h2></div><a href="/blog/">Explore the journal ↗</a></div>
        <div className="wm-grid wm-grid-three">
          <StoryCard slug="how-to-plan-a-multicultural-wedding" label="Culture & connection" title="A wedding with room for both of you." image="/images/cultures/persian-hero.jpg" />
          <StoryCard slug="south-asian-wedding-photography-videography" label="Real moments" title="The photographs you’ll still care about in twenty years." />
          <StoryCard slug="that-15-person-table-viral-reels" label="The reality check" title="That beautiful table on Reels? Let’s talk about the room." />
        </div>
        <div className="wm-celebrity"><div><p className="wm-kicker">Celebrity weddings / From the archive</p><h3>Selena & Benny:<br /><em>the case for a signature look.</em></h3></div><div><p>Vogue’s September 28, 2025 report on Selena Gomez and Benny Blanco’s Santa Barbara wedding describes Ralph Lauren looks for both, with Gomez choosing a satin halter-neck gown and lily-of-the-valley bouquet.</p><p><strong>Our take:</strong> You don’t need the celebrity guest list to borrow the idea. Choose one clear visual thread—a silhouette, a fabric, a colour—and let the smaller decisions support it.</p><a className="wm-read" href="https://www.vogue.com/article/selena-gomez-and-benny-blanco-are-married" target="_blank" rel="noopener noreferrer">Read Vogue’s original report & photographs ↗</a><small>Archive coverage, not a new wedding announcement. Photographs remain with the original publisher.</small></div></div>
        <div className="wm-editor-note"><p className="wm-kicker">The story is in the choices</p><p>From intimate ceremonies to extraordinary celebrations, we look for the people and decisions behind the day. Real-wedding submissions should include the couple’s permission and photographer credits.</p><a href="/guest-post/">Share your wedding story ↗</a></div>
      </section>
      <Chapter id="culture" number="01" title="Tradition, with room for you." copy="Not a rulebook. A starting point for the conversations that make your celebration meaningful." image="/images/cultures/south-asian-hero.jpg" href="/cultures" />
      <section className="wm-shell wm-section"><div className="wm-section-heading"><div><p className="wm-kicker">Culture & tradition</p><h2>Many ways <em>to say yes.</em></h2></div><p>Every family has its own story. Explore a guide, then shape the details with your family, celebrant and community.</p></div>
        <div className="wm-cultures">{cultures.map(([name, image, slug]) => <a key={slug} href={`/blog/${slug}`}><img src={`/images/cultures/${image}-hero.jpg`} alt="" loading="lazy" width="360" height="300" /><h3>{name} <span aria-hidden="true">↗</span></h3></a>)}</div>
      </section>
      <Chapter id="destinations" number="02" title="Somewhere unforgettable." copy="A faraway celebration, a place close to home, or a whole weekend together." image="/images/blog-destination.webp" href="/destinations" />
      <section className="wm-shell wm-section"><div className="wm-destination-intro"><p className="wm-kicker">Places & possibilities</p><h2>Find the setting.<br /><em>Think beyond the scenery.</em></h2><p>A beautiful location is the beginning. The best fit also makes sense for your guests, ceremonies, accessibility, travel and budget.</p><a className="wm-read" href="/venues">Explore venues ↗</a></div><div className="wm-grid wm-grid-three">
        <StoryCard slug="destination-south-asian-weddings-guide" label="The destination guide" title="The wedding away: a practical starting point." />
        <StoryCard slug="choosing-perfect-south-asian-wedding-venue" label="From the planning archive" title="Before you fall in love with a venue, ask these questions." />
        <StoryCard slug="honeymoon-destinations-2026" label="After the celebration" title="Just the two of you. Where next?" />
      </div></section>
      <Chapter id="style" number="03" title="It’s all in the details." copy="The table, the menu, the music. The little choices that make the day yours." image="/images/hall-night-candlelit.webp" href="/blog/" />
      <section className="wm-shell wm-section"><div className="wm-grid wm-grid-two">
        <StoryCard slug="mandap-design-guide-sizes-materials-vendors" label="Design & atmosphere" title="A ceremony setting with meaning." />
        <StoryCard slug="south-asian-wedding-catering-traditional-to-fusion" label="At the table" title="Something familiar. Something unexpected. A menu to remember." />
      </div></section>
      <section id="planning" className="wm-planning"><div className="wm-shell"><div className="wm-section-heading"><div><p className="wm-kicker">From the moodboard to the actual day</p><h2>A beautiful wedding.<br /><em>A little less chaos.</em></h2></div><p>The magazine is where you find your ideas. The planning tools are where you start putting them together.</p></div>
        <div className="wm-tools">{[
          ["01", "The budget", "Give your priorities a number. Explore the wedding budget calculator.", "/calculator.html", "Open the calculator"],
          ["02", "The checklist", "Turn the big picture into the next thing you can actually do.", "/checklist/index.html", "Start your checklist"],
          ["03", "Your planning hub", "Explore guides and tools for the shape and traditions of your celebration.", "/tools/", "Explore the tools"],
        ].map(([n, title, copy, href, cta]) => <a key={n} href={href}><span>{n}</span><h3>{title}</h3><p>{copy}</p><b>{cta} ↗</b></a>)}</div>
        <div className="wm-planning-bottom"><p>Looking for the people who bring it together?</p><a href="/vendors">Browse the vendor directory ↗</a><a href="/planners">Find a planner ↗</a></div>
      </div></section>
      <section id="business" className="wm-shell wm-section"><div className="wm-section-heading"><div><p className="wm-kicker">Behind the celebration</p><h2>The business <em>of weddings.</em></h2></div><p>The people, technology and economics behind the day. A separate desk for the industry that makes it happen.</p></div><div className="wm-grid wm-grid-three">
        <StoryCard slug="future-wedding-technology-building-beyond-features" label="Industry & technology" title="What does better wedding technology actually look like?" />
        <StoryCard slug="why-vendor-verification-matters" label="Trust & transparency" title="A beautiful portfolio is a start. What should you check next?" />
        <StoryCard slug="india-wedding-market-data-2026" label="The market" title="Inside India’s wedding economy." />
      </div></section>
      <section className="wm-endnote"><p className="wm-kicker">The whole wedding. The bigger picture.</p><h2>Make it meaningful.<br /><em>Make it yours.</em></h2><a href="/tools/">Start planning ↗</a><a href="/blog/">Keep reading ↗</a></section>
    </main>
    <footer className="wm-footer wm-shell"><a className="wm-footer-logo" href="/">Weddings.io</a><p>An independent wedding magazine and planning platform.<br />For the celebration, the traditions and everything in between.</p><nav aria-label="More from Weddings.io"><a href="/cultures">Cultures</a><a href="/destinations">Destinations</a><a href="/vendors">Vendors</a><a href="/ecosystem">Our platform</a><a href="/pricing">Business pricing</a><a href="/guest-post/">Contribute</a><a href="/blog/">Journal</a></nav><small>Weddings.io Technologies · Inspiration and planning guides. Confirm costs, availability and ceremony requirements directly with your providers.</small></footer>
  </div>;
}
