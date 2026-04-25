import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Database,
  FileText,
  Network,
  Orbit,
  Radar,
  Sparkles,
  Waypoints,
} from "lucide-react";

import { GoalCard } from "@/components/goal-card";
import { MetricCard } from "@/components/metric-card";
import { SectionHeading } from "@/components/section-heading";
import { ThemeCard } from "@/components/theme-card";
import { getOverview } from "@/lib/apex";
import { getDiscoverySignals } from "@/lib/discovery";
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
  const discoverySignals = getDiscoverySignals().slice(0, 4);

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
                Federal strategy intelligence, designed to feel bigger than the current
                data already does.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[var(--ink-soft)]">
                USA Goals turns the current APEX API into an investor-ready prototype:
                issue discovery, cross-agency strategy mapping, source-linked evidence,
                and a simulated semantic layer that shows exactly where Qdrant will take
                the product next.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/discovery-lab" className="button-primary">
                Open discovery lab
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/explore" className="button-secondary">
                Explore the corpus
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {discoverySignals.map((signal) => (
                <Link
                  key={signal.id}
                  href={`/discovery-lab?signal=${signal.id}`}
                  className="rounded-full border border-[color:var(--border-subtle)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-strong)] transition hover:border-[color:var(--accent)] hover:text-[var(--accent)]"
                >
                  {signal.label}
                </Link>
              ))}
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
                Product modes
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
              The prototype now has two stories: live structured exploration from APEX,
              and a simulated semantic discovery experience that previews Phase 2.
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
          eyebrow="Demo tracks"
          title="Three experiences that make the product opportunity obvious."
          description="These routes are designed to help you tell a stronger story in stakeholder conversations: start broad, move into evidence, then compare agency strategy footprints."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          <Link
            href="/discovery-lab"
            className="card-surface flex h-full flex-col gap-5 p-6 transition hover:-translate-y-1"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">01</p>
              <BrainCircuit className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--ink-strong)]">
              Discovery Lab
            </h2>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              Simulate future semantic retrieval with live issue clusters, adjacent
              goal matches, and agency bridge views.
            </p>
          </Link>

          <Link
            href={featuredGoals[0] ? `/goals/${featuredGoals[0].id}` : "/explore"}
            className="card-surface flex h-full flex-col gap-5 p-6 transition hover:-translate-y-1"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">02</p>
              <FileText className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--ink-strong)]">
              Source-linked evidence
            </h2>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              Open a goal and show that every promising story can be grounded in plan
              language, citations, and PDF evidence.
            </p>
          </Link>

          <Link
            href="/compare"
            className="card-surface flex h-full flex-col gap-5 p-6 transition hover:-translate-y-1"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">03</p>
              <Waypoints className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--ink-strong)]">
              Agency compare
            </h2>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              Line up current measure rows to show how this can become a stronger
              oversight and benchmarking product over time.
            </p>
          </Link>
        </div>
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
