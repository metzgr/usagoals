import Link from "next/link";
import { ArrowUpRight, Network, Orbit } from "lucide-react";

import type { ThemeSummary } from "@/lib/apex";
import { formatCount, formatTagLabel } from "@/lib/utils";

type ThemeCardProps = {
  theme: ThemeSummary;
};

export function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <article className="card-surface flex h-full flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="eyebrow">Theme</p>
          <h3 className="text-2xl font-semibold tracking-tight text-[var(--ink-strong)]">
            {formatTagLabel(theme.theme)}
          </h3>
        </div>
        <Link
          href={`/themes/${theme.theme}`}
          className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-white text-[var(--ink-strong)] transition hover:-translate-y-0.5 hover:bg-[var(--paper)]"
          aria-label={`Open ${theme.theme}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-[var(--paper)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]">
            <Orbit className="h-4 w-4" />
            Goals
          </div>
          <p className="mt-3 text-3xl font-semibold text-[var(--ink-strong)]">
            {formatCount(theme.goal_count)}
          </p>
        </div>
        <div className="rounded-3xl bg-[var(--mist)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]">
            <Network className="h-4 w-4" />
            Agencies
          </div>
          <p className="mt-3 text-3xl font-semibold text-[var(--ink-strong)]">
            {formatCount(theme.agencies.length)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-dashed border-[color:var(--border-subtle)] pt-4">
        {theme.agencies.slice(0, 4).map((agency) => (
          <span
            key={agency}
            className="rounded-full border border-[color:var(--border-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]"
          >
            {agency}
          </span>
        ))}
      </div>
    </article>
  );
}
