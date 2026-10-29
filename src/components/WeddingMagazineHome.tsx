import { blogPosts } from "../lib/blogPosts";

const photos = {
  beach: { src: "/images/editorial/4364780.jpg", alt: "A newly married couple together beside the sea", credit: "Giuseppe Messina" },
  reception: { src: "/images/editorial/5038747.jpg", alt: "Flowers and warm lights above a wedding reception table", credit: "Leeloo The First" },
  culture: { src: "/images/editorial/4121033.jpg", alt: "An Indian wedding couple smiling at each other", credit: "Krishna Videotech" },
  dance: { src: "/images/editorial/15964966.jpg", alt: "A couple dancing surrounded by guests and sparklers", credit: "Danik Prihodko" },
  flowers: { src: "/images/editorial/19408255.jpg", alt: "White flowers and greenery on a wedding reception table", credit: "Luis Felipe Pérez" },
  table: { src: "/images/editorial/24023403.jpg", alt: "Pastel flowers and glassware on a wedding table", credit: "Ahmed" },
  speech: { src: "/images/editorial/8063149.jpg", alt: "A speaker addressing wedding guests at their tables", credit: "Jay jay Redelinghuys" },
  details: { src: "/images/editorial/4959848.jpg", alt: "A bride fastening her wedding shoes", credit: "Kseniia Lopyreva" },
};
const editorialPhoto: Record<string, keyof typeof photos> = {
  "multicultural-wedding-family-conversation":"culture",
  "briana-andalore-wedding-style-with-personality":"details",
  "wedding-table-design-space-for-guests":"flowers",
  "destination-wedding-guest-journey":"beach",
  "next-great-wedding-idea-behind-the-scenes":"dance",
  "wedding-speeches-language-running-order": "speech",
  "wedding-rental-return-plan-last-box": "table",
  "wedding-room-reset-ceremony-reception": "reception",
  "wedding-day-contact-sheet-right-person-current-plan": "dance",
  "how-to-plan-a-multicultural-wedding": "culture",
  "south-asian-wedding-photography-videography": "dance",
  "that-15-person-table-viral-reels": "flowers",
  "destination-south-asian-weddings-guide": "beach",
  "choosing-perfect-south-asian-wedding-venue": "reception",
  "honeymoon-destinations-2026": "beach",
  "mandap-design-guide-sizes-materials-vendors": "flowers",
  "south-asian-wedding-catering-traditional-to-fusion": "table",
  "future-wedding-technology-building-beyond-features": "details",
  "why-vendor-verification-matters": "reception",
  "india-wedding-market-data-2026": "culture",
};
const story = (slug: string) => blogPosts.find((post) => post.slug === slug);
const desks = [
  ["Latest", "#latest"],
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

function StoryCard({ slug, label, title, copy }: { slug: string; label?: string; title?: string; copy?: string }) {
  const post = story(slug);
  if (!post) return null;
  const photo = editorialPhoto[slug] ? photos[editorialPhoto[slug]] : { src: post.image, alt: post.imageAlt || post.title, credit: post.imageCredit || "Weddings.io Editorial" };
  return <article className="wm-story"><a href={`/blog/${slug}`} className="wm-story-image">
    <img src={photo.src} alt={photo.alt} loading="lazy" width="800" height="540" />
  </a><small className="wm-photo-credit">{editorialPhoto[slug] ? `${photo.credit} / Pexels · Illustrative photography` : photo.credit}</small><p className="wm-kicker">{label || post.category}</p>
    <h3><a href={`/blog/${slug}`}>{title || post.title}</a></h3>
    <p>{copy || post.excerpt}</p><time dateTime={post.date} style={{display:"block",fontSize:".8rem",marginBottom:".8rem"}}>{post.dateLabel}</time><a className="wm-read" href={`/blog/${slug}`}>Read the story <span aria-hidden="true">↗</span></a></article>;
}
function Chapter({ id, number, title, copy, image, href }: { id: string; number: string; title: string; copy: string; image: string; href: string }) {
  return <section id={id} className="wm-chapter"><img src={image} alt="" loading="lazy" width="1800" height="700" />
    <div><p className="wm-kicker">The wedding edit / {number}</p><h2>{title}</h2><p>{copy}</p><a href={href}>Explore the edit <span aria-hidden="true">↗</span></a></div></section>;
}
export function WeddingMagazineHome() {
  const sorted = [...blogPosts].sort((a,b)=>b.date.localeCompare(a.date));
  const latest = sorted.slice(0,4);
  const relevant = (match: RegExp, count = 3) => sorted.filter(post => match.test(`${post.category} ${post.slug} ${post.title}`)).slice(0,count);
  const celebrations = relevant(/Real.*Wedding|Celebrity|Culture.*Tradition|Wedding Music/);
  const destinations = relevant(/Destination|Venue|guest-journey/);
  const details = relevant(/Style.*Details|Wedding Music|Catering|mandap/ , 2);
  const business = relevant(/The Business of Weddings|wedding-rental-return|wedding-room-reset|wedding-day-contact/);
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
        <div className="wm-cover-art"><img src={photos.beach.src} alt={photos.beach.alt} width="1600" height="1100" fetchPriority="high" />
          <div className="wm-cover-copy"><p className="wm-kicker">The art of celebrating</p><h1>All the feeling.<br /><em>Your kind of wedding.</em></h1>
          <p>Big traditions. Small details. A celebration that feels unmistakably like you.</p>
          <a href="/blog/how-to-plan-a-multicultural-wedding">Begin with what matters ↗</a></div></div>
        <aside className="wm-cover-side"><a className="wm-cover-side-photo" href="#style"><img src={photos.reception.src} alt={photos.reception.alt} width="700" height="900" /><span>The beautiful details ↗</span></a><p className="wm-kicker">In this edit</p><h2>Good stories.<br /><em>Great celebrations.</em></h2>
          <a href="/blog/how-to-plan-a-multicultural-wedding"><span>01 / Culture</span><h3>Two families. More than one tradition. One wedding.</h3><p>Make room for the things that matter to both of you.</p></a>
          <a href="/blog/destination-south-asian-weddings-guide"><span>02 / Somewhere special</span><h3>The destination is only the beginning.</h3><p>Think beyond the view: guests, ceremonies and the journey.</p></a>
          <a href="/calculator.html"><span>03 / The practical bit</span><h3>Love the vision. Know the budget.</h3><p>Start with a number, then make room for your priorities.</p></a>
        </aside>
      </section>
      <div className="wm-note wm-shell"><span>THE WHOLE WORLD OF WEDDINGS</span><p>The people. The places. The traditions. The little things you’ll remember forever. A wedding magazine for the way you want to celebrate.</p></div>
      <section id="latest" className="wm-shell wm-section"><div className="wm-section-heading"><div><p className="wm-kicker">Latest publication / {latest[0]?.dateLabel}</p><h2>The latest <em>wedding edit.</em></h2></div><a href="/blog/">All stories ↗</a></div><div className="wm-grid wm-latest-grid">
        {latest.map(post=><StoryCard key={post.slug} slug={post.slug} />)}
      </div></section>
      <section id="real-weddings" className="wm-shell wm-section"><div className="wm-section-heading"><div><p className="wm-kicker">People, not just Pinterest</p><h2>The stories behind <em>the celebration.</em></h2></div><a href="/blog/">Explore the journal ↗</a></div>
        <div className="wm-grid wm-grid-three">
          {celebrations.map(post => <StoryCard key={post.slug} slug={post.slug} />)}
        </div>
        <div className="wm-celebrity"><div><p className="wm-kicker">Celebrity weddings / From the archive</p><h3>Selena & Benny:<br /><em>the case for a signature look.</em></h3></div><div><p>Vogue’s September 28, 2025 report on Selena Gomez and Benny Blanco’s Santa Barbara wedding describes Ralph Lauren looks for both, with Gomez choosing a satin halter-neck gown and lily-of-the-valley bouquet.</p><p><strong>Our take:</strong> You don’t need the celebrity guest list to borrow the idea. Choose one clear visual thread—a silhouette, a fabric, a colour—and let the smaller decisions support it.</p><a className="wm-read" href="https://www.vogue.com/article/selena-gomez-and-benny-blanco-are-married" target="_blank" rel="noopener noreferrer">Read Vogue’s original report & photographs ↗</a><small>Archive coverage, not a new wedding announcement. Photographs remain with the original publisher.</small></div></div>
        <div className="wm-editor-note"><p className="wm-kicker">The story is in the choices</p><p>From intimate ceremonies to extraordinary celebrations, we look for the people and decisions behind the day. Real-wedding submissions should include the couple’s permission and photographer credits.</p><a href="/guest-post/">Share your wedding story ↗</a></div>
      </section>
      <Chapter id="culture" number="01" title="Tradition, with room for you." copy="Not a rulebook. A starting point for the conversations that make your celebration meaningful." image={photos.culture.src} href="/cultures" />
      <section className="wm-shell wm-section"><div className="wm-section-heading"><div><p className="wm-kicker">Culture & tradition</p><h2>Many ways <em>to say yes.</em></h2></div><p>Every family has its own story. Explore a guide, then shape the details with your family, celebrant and community.</p></div>
        <div className="wm-cultures">{cultures.map(([name, image, slug]) => <a key={slug} href={`/blog/${slug}`}><span className="wm-culture-number">{String(cultures.findIndex(c=>c[1]===image)+1).padStart(2,"0")}</span><h3>{name} <span aria-hidden="true">↗</span></h3></a>)}</div>
      </section>
      <Chapter id="destinations" number="02" title="Somewhere unforgettable." copy="A faraway celebration, a place close to home, or a whole weekend together." image={photos.beach.src} href="/destinations" />
      <section className="wm-shell wm-section"><div className="wm-destination-intro"><p className="wm-kicker">Places & possibilities</p><h2>Find the setting.<br /><em>Think beyond the scenery.</em></h2><p>A beautiful location is the beginning. The best fit also makes sense for your guests, ceremonies, accessibility, travel and budget.</p><a className="wm-read" href="/venues">Explore venues ↗</a></div><div className="wm-grid wm-grid-three">
        {destinations.map(post => <StoryCard key={post.slug} slug={post.slug} />)}
      </div></section>
      <Chapter id="style" number="03" title="It’s all in the details." copy="The table, the menu, the music. The little choices that make the day yours." image={photos.table.src} href="/blog/" />
      <section className="wm-shell wm-section"><div className="wm-grid wm-grid-two">
        {details.map(post => <StoryCard key={post.slug} slug={post.slug} />)}
      </div></section>
      <section id="planning" className="wm-planning"><div className="wm-shell"><div className="wm-section-heading"><div><p className="wm-kicker">From the moodboard to the actual day</p><h2>A beautiful wedding.<br /><em>A little less chaos.</em></h2></div><p>The magazine is where you find your ideas. The planning tools are where you start putting them together.</p></div>
        <div className="wm-tools">{[
          ["01", "The budget", "Give your priorities a number. Explore our South Asian multi-event budget calculator.", "/calculator.html", "Open the calculator"],
          ["02", "The checklist", "Turn the big picture into the next thing you can actually do.", "/checklist/index.html", "Start your checklist"],
          ["03", "Your planning hub", "Explore guides and tools for the shape and traditions of your celebration.", "/tools/", "Explore the tools"],
        ].map(([n, title, copy, href, cta]) => <a key={n} href={href}><span>{n}</span><h3>{title}</h3><p>{copy}</p><b>{cta} ↗</b></a>)}</div>
        <div className="wm-planning-bottom"><p>Looking for the people who bring it together?</p><a href="/vendors">Browse the vendor directory ↗</a><a href="/planners">Find a planner ↗</a></div>
      </div></section>
      <section id="business" className="wm-shell wm-section"><div className="wm-section-heading"><div><p className="wm-kicker">Behind the celebration</p><h2>The business <em>of weddings.</em></h2></div><p>The people, technology and economics behind the day. Recent journal stories for the people bringing the celebration together.</p></div><div className="wm-grid wm-grid-three">
        {business.map(post => <StoryCard key={post.slug} slug={post.slug} />)}
      </div></section>
      <section className="wm-endnote"><p className="wm-kicker">The whole wedding. The bigger picture.</p><h2>Make it meaningful.<br /><em>Make it yours.</em></h2><a href="/tools/">Start planning ↗</a><a href="/blog/">Keep reading ↗</a></section>
    </main>
    <footer className="wm-footer wm-shell"><a className="wm-footer-logo" href="/">Weddings.io</a><p>An independent wedding magazine and planning platform.<br />For the celebration, the traditions and everything in between.</p><nav aria-label="More from Weddings.io"><a href="/cultures">Cultures</a><a href="/destinations">Destinations</a><a href="/vendors">Vendors</a><a href="/ecosystem">Our platform</a><a href="/pricing">Business pricing</a><a href="/guest-post/">Contribute</a><a href="/blog/">Journal</a></nav><p className="wm-photo-note">Illustrative wedding photography: Giuseppe Messina, Leeloo The First, Krishna Videotech, Danik Prihodko, Luis Felipe Pérez, Ahmed, Jay jay Redelinghuys and Kseniia Lopyreva / <a href="https://www.pexels.com/license/">Pexels</a>. These photographs illustrate our guides; they are not celebrity wedding photographs or endorsements.</p><small>Weddings.io Technologies · Inspiration and planning guides. Confirm costs, availability and ceremony requirements directly with your providers.</small></footer>
  </div>;
}

