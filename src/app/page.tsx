import Link from "next/link";
import {
  ArrowRight,
  Database,
  FileText,
  Network,
  Orbit,
  Radar,
  Sparkles,
} from "lucide-react";

import { GoalCard } from "@/components/goal-card";
import { MetricCard } from "@/components/metric-card";
import { SectionHeading } from "@/components/section-heading";
import { ThemeCard } from "@/components/theme-card";
import { getOverview } from "@/lib/apex";
import { getVectorLayerStatus } from "@/lib/qdrant";
import { formatCompactCount, formatCount } from "@/lib/utils";

export default async function Home() {
  const overview = await getOverview();
  const vectorStatus = getVectorLayerStatus();
  const featuredGoals = [...overview.goals]
    .filter((goal) => goal.summary || goal.description)
    .sort((left, right) => right.objectives.length - left.objectives.length)
    .slice(0, 3);
  const featuredThemes = [...overview.themes]
    .sort((left, right) => right.goal_count - left.goal_count)
    .slice(0, 3);
  const featuredAgencies = [...overview.agencies]
    .sort((left, right) => right.goal_count - left.goal_count)
    .slice(0, 6);

  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-[color:var(--border-strong)] bg-[radial-gradient(circle_at_top_left,rgba(219,230,239,0.92),transparent_30%),linear-gradient(135deg,#f5efe1_0%,#fbf7f0_40%,#eef4f8_100%)] px-6 py-10 shadow-[0_32px_70px_rgba(18,35,61,0.12)] sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="absolute inset-y-0 right-0 hidden w-[26rem] bg-[radial-gradient(circle_at_center,rgba(197,82,43,0.14),transparent_58%)] lg:block" />
        <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="space-y-8">
            <div className="inline-flex flex-wrap gap-3">
              <span className="rounded-full border border-[color:var(--border-strong)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-strong)]">
                Live APEX corpus
              </span>
              <span className="rounded-full border border-[color:var(--border-subtle)] bg-[var(--paper)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                Qdrant-ready prototype
              </span>
            </div>

            <div className="space-y-5">
              <p className="eyebrow">USA Goals</p>
              <h1 className="max-w-5xl font-display text-5xl leading-[0.92] tracking-tight text-[var(--ink-strong)] sm:text-6xl lg:text-7xl">
                The federal strategy graph, built for discovery before the full
                Performance.gov future exists.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[var(--ink-soft)]">
                USA Goals turns the current APEX API into an investor-ready product:
                cross-agency strategy exploration, source-linked evidence, and a clear
                path toward semantic retrieval, network analysis, and stakeholder-facing
                workflows.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/explore" className="button-primary">
                Explore the corpus
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/compare" className="button-secondary">
                Compare agencies
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/75 p-4">
                <p className="eyebrow">Goals</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--ink-strong)]">
                  {formatCount(overview.manifest.goal_total)}
                </p>
              </div>
              <div className="rounded-3xl bg-white/75 p-4">
                <p className="eyebrow">Objectives</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--ink-strong)]">
                  {formatCount(overview.manifest.objective_total)}
                </p>
              </div>
              <div className="rounded-3xl bg-white/75 p-4">
                <p className="eyebrow">Semantic nodes</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--ink-strong)]">
                  {formatCount(overview.manifest.node_total)}
                </p>
              </div>
            </div>
          </div>

          <aside className="card-surface space-y-5 p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-semibold text-[var(--ink-strong)]">
                Prototype stack
              </h2>
            </div>
            <dl className="space-y-4 text-sm text-[var(--ink-soft)]">
              <div className="flex items-start justify-between gap-4">
                <dt>Corpus API</dt>
                <dd className="font-semibold text-[var(--ink-strong)]">APEX</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Vector layer</dt>
                <dd className="font-semibold text-[var(--ink-strong)]">
                  {vectorStatus.provider}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Vector status</dt>
                <dd className="font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                  {vectorStatus.configured ? "Configured" : "Pending"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Collection</dt>
                <dd className="font-semibold text-[var(--ink-strong)]">
                  {vectorStatus.collection}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Port</dt>
                <dd className="font-semibold text-[var(--ink-strong)]">
                  {vectorStatus.port ?? "Auto"}
                </dd>
              </div>
            </dl>
            <p className="rounded-3xl bg-[var(--paper)] px-4 py-4 text-sm leading-7 text-[var(--ink-soft)]">
              Phase 1 uses live lexical and structured retrieval from APEX. Phase 2 will
              add semantic recommendations and similarity search through Qdrant.
            </p>
          </aside>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Agencies"
          value={formatCount(overview.agencies.length)}
          detail="Agency records currently visible through the public API."
          icon={<Radar className="h-4 w-4" />}
        />
        <MetricCard
          label="Documents"
          value={formatCount(overview.documents.length)}
          detail="Current source corpus documents. Today these are all strategic plans."
          icon={<FileText className="h-4 w-4" />}
        />
        <MetricCard
          label="Themes"
          value={formatCount(overview.themes.length)}
          detail="Cross-agency issue clusters already exposed for exploration."
          icon={<Orbit className="h-4 w-4" />}
        />
        <MetricCard
          label="Edges"
          value={formatCompactCount(overview.edgeTotal)}
          detail="Typed graph links spanning hierarchy, themes, and shared priorities."
          icon={<Network className="h-4 w-4" />}
        />
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Featured themes"
          title="Where the strongest cross-agency story already exists."
          description="Themes are the fastest way to show stakeholders that this is more than a document browser. They reveal how the current corpus already behaves like an issue graph."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredThemes.map((theme) => (
            <ThemeCard key={theme.theme} theme={theme} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Featured goals"
          title="Proof that the corpus can already tell a coherent story."
          description="Each goal view ties together summaries, objectives, measures, citations, and source evidence from the original plan PDFs."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="card-surface p-6 sm:p-8">
          <SectionHeading
            eyebrow="Current reality"
            title="What this prototype can prove right now."
            description="The live corpus is strong enough for discovery, evidence review, and cross-agency mapping. It is not yet strong enough for a true participation or time-series performance platform."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Strong: search, agency profiles, goal detail, theme exploration",
              "Strong: semantic nodes and typed graph edges for Phase 2",
              "Weak: actual performance values and time-series reporting",
              "Missing: calls-to-action, subscriptions, stakeholder workflows",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-[color:var(--border-subtle)] bg-white px-4 py-4 text-sm leading-7 text-[var(--ink-soft)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="card-surface space-y-5 p-6">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--ink-strong)]">
              Highest-coverage agencies
            </h2>
          </div>
          <div className="space-y-3">
            {featuredAgencies.map((agency) => (
              <Link
                key={agency.id}
                href={`/agencies/${agency.id}`}
                className="flex items-center justify-between gap-4 rounded-3xl border border-[color:var(--border-subtle)] bg-white px-4 py-4 transition hover:border-[color:var(--accent)]"
              >
                <span>
                  <span className="block font-semibold text-[var(--ink-strong)]">
                    {agency.name}
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                    {agency.abbreviation}
                  </span>
                </span>
                <span className="text-sm font-semibold text-[var(--accent)]">
                  {agency.goal_count} goals
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
