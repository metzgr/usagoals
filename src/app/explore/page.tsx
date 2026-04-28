import type { Metadata } from "next";
import Link from "next/link";

import { CatalogCard } from "@/components/catalog/catalog-card";
import { getOverview } from "@/lib/apex";
import { getGoalCatalogModel } from "@/lib/catalog";
import { getGoalUniverseGraph } from "@/lib/goal-universe";

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
  const [overview, universeGraph] = await Promise.all([
    getOverview(),
    getGoalUniverseGraph(),
  ]);
  const model = await getGoalCatalogModel(overview, params);

  return (
    <main className="min-h-screen bg-[#18181b] text-white">
      <section
        id="discovery"
        className="scroll-mt-[calc(78px+1.5rem)] px-10 pb-24 pt-14 max-[760px]:pt-28 max-[520px]:px-4"
      >
        <div className="mx-auto max-w-[1920px]">
          {model.visibleItems.length > 0 ? (
            <div
              data-component="Grid"
              className="grid grid-cols-12 gap-x-10 gap-y-16 max-[1280px]:gap-x-8 max-[900px]:grid-cols-6 max-[640px]:grid-cols-1"
            >
              {model.visibleItems.map((item) => (
                <CatalogCard
                  key={item.id}
                  item={item}
                  universeGraph={universeGraph}
                />
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
