import type { Metadata } from "next";
import Link from "next/link";

import { CatalogCard } from "@/components/catalog/catalog-card";
import { getOverview } from "@/lib/apex";
import {
  getGoalCatalogModel,
  goalCatalogViews,
  type GoalCatalogState,
  type GoalCatalogView,
} from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Explore",
};

type ExplorePageProps = {
  searchParams: Promise<{
    q?: string;
    view?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const overview = await getOverview();
  const model = getGoalCatalogModel(overview, params);

  return (
    <main className="min-h-screen bg-[#18181b] text-white">
      <section
        id="discovery"
        className="scroll-mt-[calc(78px+1.5rem)] px-10 pb-24 pt-14 max-[760px]:pt-28 max-[520px]:px-4"
      >
        <div className="mx-auto max-w-[1920px]">
          <GoalViewTabs state={model.state} />

          {model.visibleItems.length > 0 ? (
            <div
              data-component="Grid"
              className="mt-16 grid grid-cols-12 gap-x-10 gap-y-16 max-[1280px]:gap-x-8 max-[900px]:grid-cols-6 max-[640px]:grid-cols-1"
            >
              {model.visibleItems.map((item) => (
                <CatalogCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-16 flex min-h-[360px] flex-col items-center justify-center rounded-[28px] bg-[#27272a] p-10 text-center">
              <p className="text-[40px] font-medium leading-none tracking-[-0.05em]">
                No goals.
              </p>
              <p className="mt-3 max-w-[360px] text-sm leading-6 text-[#a8afb7]">
                Clear the search to keep browsing.
              </p>
              <Link
                href="/explore#discovery"
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-[#18181b]"
              >
                Reset catalog
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function GoalViewTabs({ state }: { state: GoalCatalogState }) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-full bg-[#27272a] p-1 text-sm font-semibold text-[#a8afb7]">
        {goalCatalogViews.map((view) => {
          const active = state.view === view.value;

          return (
            <Link
              key={view.value}
              href={buildGoalViewHref(state, view.value)}
              className={
                active
                  ? "inline-flex h-10 items-center rounded-full bg-[#343538] px-6 text-white"
                  : "inline-flex h-10 items-center rounded-full px-6 transition-colors hover:text-white"
              }
            >
              <span>{view.label}</span>
              {view.value === "trending" ? (
                <span className="ml-1.5 size-1.5 rounded-full bg-[#f2d14f]" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function buildGoalViewHref(state: GoalCatalogState, view: GoalCatalogView) {
  const params = new URLSearchParams();

  if (state.q) {
    params.set("q", state.q);
  }

  if (view !== "newest") {
    params.set("view", view);
  }

  const query = params.toString();
  return query ? `/explore?${query}#discovery` : "/explore#discovery";
}
