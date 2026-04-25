import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, FileSearch, Network, Sparkles } from "lucide-react";

import { DiscoveryMatchCard } from "@/components/discovery-match-card";
import { GoalCard } from "@/components/goal-card";
import { MetricCard } from "@/components/metric-card";
import { SectionHeading } from "@/components/section-heading";
import { getDiscoveryScenario } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "Discovery Lab",
  description:
    "Simulated semantic discovery experience for USA Goals, using live APEX data and heuristic ranking until the vector layer is online.",
};

type DiscoveryLabPageProps = {
  searchParams: Promise<{
    signal?: string;
  }>;
};

export default async function DiscoveryLabPage({
  searchParams,
}: DiscoveryLabPageProps) {
  const params = await searchParams;
  const scenario = await getDiscoveryScenario(params.signal);

  return (
    <div className="space-y-14 pb-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="inline-flex flex-wrap gap-3">
            <span className="rounded-full border border-[color:var(--border-strong)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-strong)]">
              Discovery Lab
            </span>
            <span className="rounded-full border border-[color:var(--border-subtle)] bg-[var(--paper)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              Heuristic mode until Qdrant is live
            </span>
          </div>

          <SectionHeading
            eyebrow="Future workflow"
            title="Show the semantic product now, even before the vector layer arrives."
            description="This route simulates the future retrieval experience using current APEX tags, summaries, objectives, and graph edges. The interface is real. The ranking is the part that will later shift to embeddings and vector search."
          />

          <div className="flex flex-wrap gap-3">
            <Link href="/explore" className="button-primary">
              Explore live records
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/compare" className="button-secondary">
              Compare agencies
            </Link>
          </div>
        </div>

        <aside className="card-surface space-y-5 p-6">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--ink-strong)]">
              What this demo is proving
            </h2>
          </div>
          <p className="text-sm leading-7 text-[var(--ink-soft)]">
            The product already has the right workflow for issue discovery: start from
            a topic, expand into adjacent goals, move into agencies, and drill into
            cited source evidence.
          </p>
          <div className="rounded-3xl bg-[var(--paper)] px-4 py-4 text-sm leading-7 text-[var(--ink-soft)]">
            Today&apos;s ranking uses heuristics. Later, Qdrant will replace that layer
            with real semantic similarity while preserving the same product surface.
          </div>
          <p className="text-sm leading-7 text-[var(--ink-soft)]">
            {scenario.signal.investorAngle}
          </p>
        </aside>
      </section>

      <section className="card-surface space-y-5 p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Signal selection</p>
            <h2 className="text-3xl font-semibold text-[var(--ink-strong)]">
              Pick a live issue space.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-[var(--ink-soft)]">
              Each signal below is backed by the real APEX corpus. The narrative and
              ranking logic are prototype scaffolding for the future semantic layer.
            </p>
          </div>
          <div className="rounded-3xl bg-[color:rgba(19,37,63,0.05)] px-4 py-4 text-sm leading-7 text-[var(--ink-soft)]">
            Active signal:{" "}
            <span className="font-semibold text-[var(--ink-strong)]">
              {scenario.signal.label}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {scenario.signals.map((signal) => {
            const isActive = signal.id === scenario.signal.id;

            return (
              <Link
                key={signal.id}
                href={`/discovery-lab?signal=${signal.id}`}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[var(--ink-strong)] text-[var(--background)]"
                    : "border border-[color:var(--border-strong)] bg-white text-[var(--ink-strong)] hover:border-[color:var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {signal.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Theme goals"
          value={scenario.exactThemeGoalCount.toString()}
          detail="Records with an exact tag match to the active signal."
          icon={<Sparkles className="h-4 w-4" />}
        />
        <MetricCard
          label="Agencies"
          value={scenario.participatingAgencyCount.toString()}
          detail="Distinct agencies already participating in this issue space."
          icon={<Network className="h-4 w-4" />}
        />
        <MetricCard
          label="Companion themes"
          value={scenario.companionThemes.length.toString()}
          detail="Related themes surfaced from co-tagged goals in the live corpus."
          icon={<BrainCircuit className="h-4 w-4" />}
        />
        <MetricCard
          label="Shared priorities"
          value={scenario.sharedPriorityCount.toString()}
          detail="Actual graph edges already connected to the top seed goals."
          icon={<FileSearch className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="card-surface space-y-5 p-6 sm:p-8">
          <p className="eyebrow">Active signal</p>
          <h2 className="text-4xl font-semibold tracking-tight text-[var(--ink-strong)]">
            {scenario.signal.label}
          </h2>
          <p className="text-lg leading-8 text-[var(--ink-soft)]">
            {scenario.signal.tagline}
          </p>
          <p className="text-sm leading-7 text-[var(--ink-soft)]">
            {scenario.signal.description}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {scenario.signal.prompts.map((prompt) => (
              <div
                key={prompt}
                className="rounded-3xl border border-[color:var(--border-subtle)] bg-white px-4 py-4 text-sm leading-7 text-[var(--ink-soft)]"
              >
                {prompt}
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <article className="card-surface space-y-4 p-6">
            <p className="eyebrow">Why it works now</p>
            <div className="space-y-3 text-sm leading-7 text-[var(--ink-soft)]">
              <p>Theme tags provide the first issue cluster.</p>
              <p>Goal summaries and titles provide expandable language signals.</p>
              <p>Typed semantic edges already expose a partial network underneath.</p>
            </div>
          </article>
          <article className="card-surface space-y-4 p-6">
            <p className="eyebrow">What vectors will add</p>
            <div className="space-y-3 text-sm leading-7 text-[var(--ink-soft)]">
              <p>Better recall when exact tags are sparse.</p>
              <p>Prompt-driven discovery instead of curated heuristic ranking.</p>
              <p>Higher quality “related goal” and “what else matters” flows.</p>
            </div>
          </article>
        </aside>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Seed goals"
          title="The clearest live records inside this issue space."
          description="These are exact-theme goals. They act as anchors for the future semantic experience and already give stakeholders something concrete to inspect."
        />
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {scenario.seedGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Adjacent matches"
          title="What the future vector layer should surface next."
          description="These are simulated semantic matches using tag overlap, shared language, source-linked evidence, and current graph context."
        />
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {scenario.adjacentMatches.map((match) => (
            <DiscoveryMatchCard key={match.goal.id} match={match} eyebrow="Adjacent match" />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Agency bridges"
            title="Where this issue is already concentrated."
            description="Agency clusters help the stakeholder story: the platform is not just finding documents, it is revealing who currently owns the strongest strategic footprint."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {scenario.agencyBridges.map((agency) => (
              <article key={agency.agencyId} className="card-surface space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">{agency.agencyAbbreviation}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">
                      {agency.agencyName}
                    </h3>
                  </div>
                  <Link
                    href={`/agencies/${agency.agencyId}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-white text-[var(--ink-strong)] transition hover:-translate-y-0.5 hover:bg-[var(--paper)]"
                    aria-label={`Open ${agency.agencyName}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <p className="text-sm leading-7 text-[var(--ink-soft)]">
                  {agency.goalCount} signal-linked goal
                  {agency.goalCount === 1 ? "" : "s"} currently anchor this agency in the
                  active issue space.
                </p>
                <div className="flex flex-wrap gap-2">
                  {agency.activeThemes.length > 0 ? (
                    agency.activeThemes.map((theme) => (
                      <span
                        key={theme}
                        className="rounded-full bg-[var(--paper)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]"
                      >
                        {theme}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-[var(--mist)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-strong)]">
                      Single-theme coverage
                    </span>
                  )}
                </div>
                <div className="space-y-2 border-t border-dashed border-[color:var(--border-subtle)] pt-4 text-sm leading-7 text-[var(--ink-soft)]">
                  {agency.anchorTitles.map((title) => (
                    <p key={title}>{title}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <article className="card-surface space-y-4 p-6">
            <p className="eyebrow">Companion themes</p>
            <div className="space-y-3">
              {scenario.companionThemes.length > 0 ? (
                scenario.companionThemes.map((theme) => (
                  <Link
                    key={theme.theme}
                    href={`/themes/${theme.theme}`}
                    className="block rounded-3xl border border-[color:var(--border-subtle)] bg-white px-4 py-4 transition hover:border-[color:var(--accent)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                      Shared by {theme.overlapCount} seed goal
                      {theme.overlapCount === 1 ? "" : "s"}
                    </p>
                    <p className="mt-2 font-semibold text-[var(--ink-strong)]">
                      {theme.label}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-[color:var(--border-subtle)] px-4 py-4 text-sm leading-7 text-[var(--ink-soft)]">
                  This signal is currently narrow. That makes it a good candidate for
                  future vector expansion once Qdrant is online.
                </div>
              )}
            </div>
          </article>

          <article className="card-surface space-y-4 p-6">
            <p className="eyebrow">Suggested next click</p>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              Use the discovery route to frame the story, then open a goal detail page to
              show source evidence and structured objectives.
            </p>
            {scenario.seedGoals[0] ? (
              <Link href={`/goals/${scenario.seedGoals[0].id}`} className="button-primary w-full justify-center">
                Open lead goal
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </article>
        </aside>
      </section>
    </div>
  );
}
