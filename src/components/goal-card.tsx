import Link from "next/link";
import { ArrowUpRight, Building2, Layers3 } from "lucide-react";

import type { GoalSummary } from "@/lib/apex";
import { formatTagLabel } from "@/lib/utils";

type GoalCardProps = {
  goal: GoalSummary;
};

export function GoalCard({ goal }: GoalCardProps) {
  const objectiveCount = goal.objectives?.length ?? 0;
  const tags = goal.tags
    ? goal.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  return (
    <article className="card-surface flex h-full flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">
            Goal {goal.number ?? "Untitled"}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--ink-strong)]">
            {goal.title}
          </h3>
        </div>
        <Link
          href={`/goals/${goal.id}`}
          className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-white text-[var(--ink-strong)] transition hover:-translate-y-0.5 hover:bg-[var(--paper)]"
          aria-label={`Open ${goal.title}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="text-sm leading-7 text-[var(--ink-soft)]">
        {goal.summary ?? goal.description ?? "This goal currently has no summary in the corpus."}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 text-xs font-medium text-[var(--ink-soft)]">
        {goal.agency_name ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--mist)] px-3 py-2">
            <Building2 className="h-3.5 w-3.5" />
            {goal.agency_name}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--paper)] px-3 py-2">
          <Layers3 className="h-3.5 w-3.5" />
          {objectiveCount} objectives
        </span>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-t border-dashed border-[color:var(--border-subtle)] pt-4">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/themes/${tag}`}
              className="rounded-full border border-[color:var(--border-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] transition hover:border-[color:var(--accent)]"
            >
              {formatTagLabel(tag)}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
