import type { Metadata } from "next";

import { GoalCard } from "@/components/goal-card";
import { SearchResultCard } from "@/components/search-result-card";
import { SectionHeading } from "@/components/section-heading";
import { ThemeCard } from "@/components/theme-card";
import { listAgencies, listGoals, listThemes, searchCorpus } from "@/lib/apex";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Search across goals, objectives, and measures in the current USA Goals corpus.",
};

type ExplorePageProps = {
  searchParams: Promise<{
    q?: string;
    agency_id?: string;
    node_type?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const agencyId = params.agency_id ? Number(params.agency_id) : undefined;
  const nodeType = params.node_type?.trim() || undefined;

  const [agencies, fallbackGoals, themes, searchResults] = await Promise.all([
    listAgencies(),
    listGoals(),
    listThemes(),
    query.length >= 2
      ? searchCorpus({ query, agencyId, nodeType, limit: 18 })
      : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-14 pb-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Explorer"
            title="Trace issues through goals, objectives, and measures."
            description="This search experience is intentionally grounded in the current APEX corpus. Use it to prove how much strategic discovery is already possible before the richer participation layer exists."
          />
          <div className="flex flex-wrap gap-3 text-sm text-[var(--ink-soft)]">
            <span className="rounded-full bg-[var(--mist)] px-4 py-2 font-semibold text-[var(--ink-strong)]">
              Lexical search via APEX
            </span>
            <span className="rounded-full bg-[var(--paper)] px-4 py-2 font-semibold text-[var(--ink-strong)]">
              Vector layer reserved for Phase 2
            </span>
          </div>
        </div>

        <form method="get" className="card-surface space-y-5 p-6">
          <div>
            <label
              htmlFor="query"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]"
            >
              Search query
            </label>
            <input
              id="query"
              name="q"
              defaultValue={query}
              placeholder="workforce, technology, AI, trade"
              className="input-shell"
            />
          </div>
          <div>
            <label
              htmlFor="agency_id"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]"
            >
              Agency
            </label>
            <select id="agency_id" name="agency_id" defaultValue={params.agency_id ?? ""} className="input-shell">
              <option value="">All agencies</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="node_type"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]"
            >
              Node type
            </label>
            <select id="node_type" name="node_type" defaultValue={nodeType ?? ""} className="input-shell">
              <option value="">All record types</option>
              <option value="goal">Goals</option>
              <option value="objective">Objectives</option>
              <option value="measure">Measures</option>
            </select>
          </div>
          <button type="submit" className="button-primary w-full justify-center">
            Search corpus
          </button>
        </form>
      </section>

      {searchResults ? (
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Search results</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink-strong)]">
                {searchResults.total} results for “{searchResults.query}”
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              These results are lexical matches from the live API. Phase 2 will layer
              semantic recommendations and related-goal retrieval on top of this.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {searchResults.results.map((result) => (
              <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className="space-y-6">
            <SectionHeading
              eyebrow="Featured themes"
              title="Start from broad strategy clusters."
              description="Themes are the fastest way to show investors and stakeholders how issues cut across agency silos."
            />
            <div className="grid gap-5 lg:grid-cols-3">
              {themes
                .sort((left, right) => right.goal_count - left.goal_count)
                .slice(0, 6)
                .map((theme) => (
                  <ThemeCard key={theme.theme} theme={theme} />
                ))}
            </div>
          </section>

          <section className="space-y-6">
            <SectionHeading
              eyebrow="Goals"
              title="Or drop straight into the goal corpus."
              description="Without a query, this page falls back to the full set of structured goals currently exposed by APEX."
            />
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {fallbackGoals.slice(0, 12).map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
