import Link from "next/link";

const navigation = [
  { href: "/discovery-lab", label: "Discovery Lab" },
  { href: "/explore", label: "Explore" },
  { href: "/compare", label: "Compare" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border-subtle)] bg-[color:rgb(248_244_236_/_0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="group flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-[var(--ink-strong)] text-sm font-bold uppercase tracking-[0.24em] text-[var(--paper)]">
            US
          </div>
          <div>
            <p className="font-display text-2xl leading-none text-[var(--ink-strong)]">
              USA Goals
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--ink-muted)]">
              Strategy Intelligence Prototype
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 sm:gap-5">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-[var(--ink-soft)] transition hover:text-[var(--accent)]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://apex.app.cloud.gov/api/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink-strong)] transition hover:border-[color:var(--accent)] hover:text-[var(--accent)]"
          >
            OpenAPI
          </a>
        </nav>
      </div>
    </header>
  );
}
