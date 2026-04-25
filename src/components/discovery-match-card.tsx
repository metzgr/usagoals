import Link from "next/link";
import { ArrowUpRight, Building2, Sparkles } from "lucide-react";

import type { DiscoveryGoalMatch } from "@/lib/discovery";
import { formatTagLabel } from "@/lib/utils";

type DiscoveryMatchCardProps = {
  match: DiscoveryGoalMatch;
  eyebrow?: string;
  compact?: boolean;
};

export function DiscoveryMatchCard({
  match,
  eyebrow = "Semantic preview",
  compact = false,
}: DiscoveryMatchCardProps) {
  const tags = match.sharedTags.slice(0, 3);

  return (
    <article className="card-surface flex h-full flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">{eyebrow}</p>
          <h3
            className={`font-semibold tracking-tight text-[var(--ink-strong)] ${
              compact ? "text-xl" : "text-2xl"
            }`}
          >
            {match.goal.title}
          </h3>
        </div>
        <Link
          href={`/goals/${match.goal.id}`}
          className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-white text-[var(--ink-strong)] transition hover:-translate-y-0.5 hover:bg-[var(--paper)]"
          aria-label={`Open ${match.goal.title}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <p className={`text-[var(--ink-soft)] ${compact ? "text-sm leading-6" : "text-sm leading-7"}`}>
        {match.goal.summary ??
          match.goal.description ??
          "This record has limited summary text in the current corpus."}
      </p>

      <div className="mt-auto space-y-3">
        <div className="flex flex-wrap gap-2 text-xs font-medium text-[var(--ink-soft)]">
          {match.goal.agency_name ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--mist)] px-3 py-2">
              <Building2 className="h-3.5 w-3.5" />
              {match.goal.agency_name}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--paper)] px-3 py-2">
            <Sparkles className="h-3.5 w-3.5" />
            Heuristic mode
          </span>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[color:var(--border-subtle)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]"
              >
                {formatTagLabel(tag)}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {match.reasons.map((reason) => (
            <span
              key={reason}
              className="rounded-full bg-[color:rgba(19,37,63,0.06)] px-3 py-2 text-xs font-medium text-[var(--ink-soft)]"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
