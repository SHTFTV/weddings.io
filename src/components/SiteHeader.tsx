import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/" as const, label: "Home" },
  { to: "/blog" as const, label: "Blog" },
  { to: "/ecosystem" as const, label: "Ecosystem" },
  { to: "/pricing" as const, label: "Pricing" },
];

const externalNavItems = [
  { href: "/journal/the-master-plan/", label: "The Master Plan", featured: true },
];


export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 md:px-8">
        <Link to="/" className="flex items-center gap-3 font-serif text-xl text-foreground">
          <span aria-hidden="true">🪔</span>
          <span className="font-semibold text-primary">Weddings.io Technologies</span>
        </Link>
        <nav aria-label="Main navigation" className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground sm:w-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="transition-colors hover:text-primary" activeProps={{ className: "text-primary" }}>
              {item.label}
            </Link>
          ))}
          {externalNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={
                item.featured
                  ? "hidden rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary/20 md:inline-flex"
                  : "transition-colors hover:text-primary"
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

      </div>
    </header>
  );
}
