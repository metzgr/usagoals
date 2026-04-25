import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  FileSearch,
  Link2,
  Network,
} from "lucide-react";

import {
  getDocument,
  getGoal,
  getGoalNeighbors,
  type GoalMeasure,
} from "@/lib/apex";
import { formatTagLabel, formatValue } from "@/lib/utils";

type GoalPageProps = {
  params: Promise<{
    goalId: string;
  }>;
};

async function getGoalPageData(goalId: string) {
  const parsedGoalId = Number(goalId);

  if (!Number.isFinite(parsedGoalId)) {
    notFound();
  }

  try {
    const goal = await getGoal(parsedGoalId);
    const [document, neighbors] = await Promise.all([
      getDocument(goal.document_id),
      getGoalNeighbors(parsedGoalId),
    ]);

    return {
      goal,
      document,
      neighbors,
    };
  } catch {
    notFound();
  }
}

export async function generateMetadata({
  params,
}: GoalPageProps): Promise<Metadata> {
  const goal = (await getGoalPageData((await params).goalId)).goal;

  return {
    title: goal.title,
    description:
      goal.summary ??
      goal.description ??
      "Goal detail view for the USA Goals prototype.",
  };
}

function flattenMeasures(measures: GoalMeasure[]) {
  return measures.slice(0, 4);
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { goal, document, neighbors } = await getGoalPageData((await params).goalId);
  const tags = goal.tags
    ? goal.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
  const relatedGoals = neighbors.edges.filter(
    (edge) =>
      edge.edge_type === "shared_priority" &&
      (edge.source_node_id === `goal:${goal.id}` || edge.target_node_id === `goal:${goal.id}`),
  );

  return (
    <div className="space-y-14 pb-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <p className="eyebrow">Goal detail</p>
          <h1 className="font-display text-5xl leading-none tracking-tight text-[var(--ink-strong)] sm:text-6xl">
            {goal.title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--ink-soft)]">
            {goal.summary ?? goal.description ?? "No goal summary is currently available for this record."}
          </p>
          <div className="flex flex-wrap gap-3">
            {goal.agency_id ? (
              <Link
                href={`/agencies/${goal.agency_id}`}
                className="rounded-full bg-[var(--mist)] px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]"
              >
                {goal.agency_name ?? "Agency profile"}
              </Link>
            ) : null}
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/themes/${tag}`}
                className="rounded-full bg-[var(--paper)] px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]"
              >
                {formatTagLabel(tag)}
              </Link>
            ))}
          </div>
        </div>

        <aside className="card-surface space-y-5 p-6">
          <div>
            <p className="eyebrow">Source evidence</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ink-strong)]">
              {document.title}
            </h2>
          </div>
          <dl className="space-y-3 text-sm text-[var(--ink-soft)]">
            <div className="flex items-start justify-between gap-4">
              <dt>Document type</dt>
              <dd className="font-semibold text-[var(--ink-strong)]">{document.document_type}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt>Fiscal year</dt>
              <dd className="font-semibold text-[var(--ink-strong)]">{document.fiscal_year}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt>QA status</dt>
              <dd className="font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                {document.qa_status}
              </dd>
            </div>
          </dl>
          <a
            href={`${document.pdf_url}#page=${goal.source_page ?? 1}`}
            target="_blank"
            rel="noreferrer"
            className="button-primary w-full justify-center"
          >
            Open PDF evidence
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </aside>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="eyebrow">Objectives</p>
            <h2 className="text-3xl font-semibold text-[var(--ink-strong)]">
              How this goal is structured.
            </h2>
          </div>
          <div className="space-y-4">
            {goal.objectives.map((objective) => (
              <article key={objective.id} className="card-surface space-y-5 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[var(--paper)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    Objective {objective.number ?? "Unnumbered"}
                  </span>
                  {objective.source_page ? (
                    <span className="rounded-full bg-[var(--mist)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-strong)]">
                      Page {objective.source_page}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-[var(--ink-strong)]">
                    {objective.title}
                  </h3>
                  <p className="text-sm leading-7 text-[var(--ink-soft)]">
                    {objective.description ?? "No objective description is currently available."}
                  </p>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {flattenMeasures(objective.measures).map((measure) => (
                    <div
                      key={measure.id}
                      className="rounded-3xl border border-[color:var(--border-subtle)] bg-white px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-[var(--ink-strong)]">
                        {measure.name}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.15em] text-[var(--ink-muted)]">
                        Baseline {formatValue(measure.baseline_value)} / Target{" "}
                        {formatValue(measure.target_value)}
                      </p>
                    </div>
                  ))}
                  {objective.measures.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[color:var(--border-subtle)] px-4 py-4 text-sm text-[var(--ink-soft)]">
                      No structured measures are attached to this objective yet.
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <article className="card-surface space-y-4 p-6">
            <div className="flex items-center gap-3">
              <FileSearch className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-semibold text-[var(--ink-strong)]">
                Summary citations
              </h2>
            </div>
            <div className="space-y-3 text-sm leading-7 text-[var(--ink-soft)]">
              {goal.summary_citations.map((citation, index) => (
                <div key={`${citation.page}-${index}`} className="rounded-3xl bg-[var(--paper)] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                    {citation.source} {citation.page ? `• Page ${citation.page}` : ""}
                  </p>
                  <p className="mt-2">{citation.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card-surface space-y-4 p-6">
            <div className="flex items-center gap-3">
              <Network className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-semibold text-[var(--ink-strong)]">
                Related goals
              </h2>
            </div>
            <div className="space-y-3 text-sm leading-7 text-[var(--ink-soft)]">
              {relatedGoals.length > 0 ? (
                relatedGoals.slice(0, 6).map((edge) => {
                  const isSource = edge.source_node_id === `goal:${goal.id}`;
                  const relatedId = Number(
                    (isSource ? edge.target_node_id : edge.source_node_id).split(":")[1],
                  );
                  const relatedLabel = isSource ? edge.target_label : edge.source_label;
                  return (
                    <Link
                      key={edge.edge_id}
                      href={`/goals/${relatedId}`}
                      className="block rounded-3xl border border-[color:var(--border-subtle)] bg-white px-4 py-4 transition hover:border-[color:var(--accent)]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                        Shared priority
                      </p>
                      <p className="mt-2 font-semibold text-[var(--ink-strong)]">
                        {relatedLabel}
                      </p>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-[color:var(--border-subtle)] px-4 py-4">
                  No shared-priority edges are currently available for this goal.
                </div>
              )}
            </div>
          </article>

          {goal.agency_mentions.length > 0 ? (
            <article className="card-surface space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Link2 className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-lg font-semibold text-[var(--ink-strong)]">
                  Agency mentions
                </h2>
              </div>
              <div className="space-y-3">
                {goal.agency_mentions.map((mention) => (
                  <div
                    key={mention.id}
                    className="rounded-3xl bg-[var(--paper)] px-4 py-4 text-sm leading-7 text-[var(--ink-soft)]"
                  >
                    <p className="inline-flex items-center gap-2 font-semibold text-[var(--ink-strong)]">
                      <Building2 className="h-4 w-4" />
                      {mention.agency_name ?? mention.mention_text}
                    </p>
                    <p className="mt-2">
                      {mention.relationship_summary ?? mention.evidence_text ?? "No relationship summary."}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
