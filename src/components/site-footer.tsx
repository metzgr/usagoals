import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border-subtle)] bg-white/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="eyebrow">USA Goals</p>
          <p className="font-display text-2xl text-[var(--ink-strong)]">
            Federal strategy, mapped as a living graph.
          </p>
          <p className="text-sm leading-7 text-[var(--ink-soft)]">
            Prototype built on the live APEX corpus, with a Qdrant-ready vector layer
            and a clear path to cloud.gov deployment.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-[var(--ink-soft)]">
          <Link href="/explore" className="transition hover:text-[var(--accent)]">
            Explore
          </Link>
          <Link href="/compare" className="transition hover:text-[var(--accent)]">
            Compare
          </Link>
          <a
            href="https://apex.app.cloud.gov/api"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[var(--accent)]"
          >
            APEX API
          </a>
          <a
            href="https://qdrant.tech/pricing/"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[var(--accent)]"
          >
            Qdrant
          </a>
        </div>
      </div>
    </footer>
  );
}
