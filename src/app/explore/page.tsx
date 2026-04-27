import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CatalogCard } from "@/components/catalog/catalog-card";
import { DownloadDataButton } from "@/components/site/download-data-button";
import { getOverview } from "@/lib/apex";
import {
  buildCatalogHref,
  catalogKindOptions,
  getCatalogModel,
  type CatalogState,
} from "@/lib/catalog";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Explore",
};

type ExplorePageProps = {
  searchParams: Promise<{
    q?: string;
    kind?: string;
    owner?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const overview = await getOverview();
  const model = getCatalogModel(overview, params);
  const scopeLabel = model.activeOwner?.abbreviation ?? "All owners";

  return (
    <main className="min-h-screen bg-[#18181b] text-white">
      <SiteHeader
        state={model.state}
        totalItems={model.totalItems}
        resultCount={model.totalMatches}
      />

      <div className="pt-10">
        <section
          id="discovery"
          className="flex w-full scroll-mt-[100px] justify-center px-[100px] pb-[100px] max-[1024px]:px-9 max-[440px]:px-4"
        >
          <div className="w-full max-w-[1440px]">
            <div className="rounded-[28px] bg-[#27272a] p-10 max-[768px]:p-5">
              <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <p className="mb-5 inline-flex h-8 items-center rounded-full bg-[#343538] px-3 text-xs font-medium uppercase tracking-[0.16em] text-[#a8afb7]">
                    Discovery
                  </p>
                  <h1 className="max-w-[820px] text-[56px] font-medium leading-none tracking-[-0.055em] max-[768px]:text-[36px]">
                    Browse the public performance archive.
                  </h1>
                </div>

                <div className="grid grid-cols-3 gap-2 max-[520px]:grid-cols-1">
                  <MetricPill label="Goals" value={overview.goals.length} />
                  <MetricPill label="Plans" value={overview.documents.length} />
                  <MetricPill label="Owners" value={overview.agencies.length} />
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                <SearchForm state={model.state} variant="panel" />

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <KindControls
                    state={model.state}
                    counts={model.kindCounts}
                  />
                  <OwnerControls state={model.state} owners={model.owners} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 text-sm text-[#a8afb7]">
              <p className="truncate">
                {formatCount(model.totalMatches)} matches / {scopeLabel}
                {model.state.q ? ` / ${model.state.q}` : ""}
              </p>
              <Link
                href="/explore#discovery"
                className="shrink-0 rounded-full bg-[#27272a] px-3 py-2 text-xs font-medium text-[#dadee4] transition-colors hover:bg-[#343538]"
              >
                Reset
              </Link>
            </div>

            {model.visibleItems.length > 0 ? (
              <div
                data-component="Grid"
                className="mt-6 grid grid-cols-12 gap-6"
              >
                {model.visibleItems.map((item) => (
                  <CatalogCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="mt-6 flex min-h-[360px] flex-col items-center justify-center rounded-[28px] bg-[#27272a] p-10 text-center">
                <p className="text-[40px] font-medium leading-none tracking-[-0.05em]">
                  No matches.
                </p>
                <p className="mt-3 max-w-[360px] text-sm leading-6 text-[#a8afb7]">
                  Clear the search or switch owner to keep browsing.
                </p>
                <Link
                  href="/explore#discovery"
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#59A9FF] px-7 text-sm font-medium text-[#18181b]"
                >
                  Reset catalog
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SiteHeader({
  state,
  totalItems,
  resultCount,
}: {
  state: CatalogState;
  totalItems: number;
  resultCount: number;
}) {
  return (
    <header className="sticky top-0 z-50 grid h-[78px] grid-cols-12 items-center bg-[#18181b] px-9 max-[440px]:px-4">
      <Link
        href="/"
        aria-label="USA Goals home"
        className="col-span-3 inline-flex items-center lg:col-span-1"
      >
        <Image
          src="/usagoals-logo.svg"
          alt="USA Goals"
          width={64}
          height={32}
          priority
          className="h-5 w-auto invert"
        />
      </Link>

      <nav className="col-span-5 hidden items-center gap-7 text-sm font-medium text-[#a8afb7] lg:flex">
        <Link className="transition-colors hover:text-white" href="/explore#discovery">
          For You
        </Link>
        <Link
          className="transition-colors hover:text-white"
          href={toDiscoveryHref(
            buildCatalogHref(state, { kind: "goal" }, "/explore"),
          )}
        >
          Explore
        </Link>
        <Link
          className="transition-colors hover:text-white"
          href={toDiscoveryHref(
            buildCatalogHref(state, { kind: "owner" }, "/explore"),
          )}
        >
          Owners
        </Link>
      </nav>

      <div className="col-span-3 hidden justify-center lg:flex">
        <SearchForm state={state} variant="header" />
      </div>

      <div className="col-span-9 flex items-center justify-end gap-2 lg:col-span-3">
        <DownloadDataButton />
        <span className="hidden h-9 items-center rounded-full bg-[#343538] px-3 text-sm font-medium text-[#dadee4] sm:inline-flex">
          {formatCount(resultCount)} items
        </span>
        <span
          className="inline-flex size-9 items-center justify-center rounded-full bg-[#343538] text-xs font-semibold tracking-[-0.04em] text-[#dadee4]"
          title={`${formatCount(totalItems)} total items`}
        >
          US
        </span>
      </div>
    </header>
  );
}

function SearchForm({
  state,
  variant,
}: {
  state: CatalogState;
  variant: "header" | "panel";
}) {
  const isHeader = variant === "header";

  return (
    <form
      action="/explore#discovery"
      className={
        isHeader
          ? "flex h-11 w-full max-w-[420px] items-center gap-2 rounded-md bg-[#27272a] py-1 pl-3.5 pr-1"
          : "flex min-h-12 w-full flex-wrap items-center gap-2 rounded-md bg-[#343538] p-1 pl-4"
      }
    >
      {state.kind !== "all" ? (
        <input type="hidden" name="kind" value={state.kind} />
      ) : null}
      {state.owner !== "all" ? (
        <input type="hidden" name="owner" value={state.owner} />
      ) : null}
      <input
        name="q"
        defaultValue={state.q}
        placeholder="Search"
        aria-label="Search catalog"
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#a8afb7]"
      />
      <button
        type="submit"
        className={
          isHeader
            ? "inline-flex h-9 shrink-0 items-center justify-center rounded px-3 text-sm font-medium text-[#dadee4] transition-colors hover:bg-[#343538]"
            : "inline-flex h-10 shrink-0 items-center justify-center rounded bg-[#59A9FF] px-4 text-sm font-medium text-[#18181b]"
        }
      >
        Go
      </button>
    </form>
  );
}

function KindControls({
  state,
  counts,
}: {
  state: CatalogState;
  counts: ReturnType<typeof getCatalogModel>["kindCounts"];
}) {
  return (
    <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
      {catalogKindOptions.map((option) => {
        const active = state.kind === option.value;

        return (
          <Link
            key={option.value}
            href={toDiscoveryHref(
              buildCatalogHref(state, { kind: option.value }, "/explore"),
            )}
            className={
              active
                ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-[#18181b]"
                : "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#343538] px-4 text-sm font-medium text-[#dadee4] transition-colors hover:bg-[#3f4043]"
            }
          >
            <span>{option.label}</span>
            <span className={active ? "text-[#55575d]" : "text-[#a8afb7]"}>
              {formatCount(counts[option.value])}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function OwnerControls({
  state,
  owners,
}: {
  state: CatalogState;
  owners: ReturnType<typeof getCatalogModel>["owners"];
}) {
  return (
    <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
      <Link
        href={toDiscoveryHref(
          buildCatalogHref(state, { owner: "all" }, "/explore"),
        )}
        className={
          state.owner === "all"
            ? "inline-flex h-10 shrink-0 items-center rounded-full bg-white px-4 text-sm font-medium text-[#18181b]"
            : "inline-flex h-10 shrink-0 items-center rounded-full bg-[#343538] px-4 text-sm font-medium text-[#dadee4] transition-colors hover:bg-[#3f4043]"
        }
      >
        All owners
      </Link>
      {owners.slice(0, 16).map((owner) => {
        const active = state.owner === owner.id;

        return (
          <Link
            key={owner.id}
            href={toDiscoveryHref(
              buildCatalogHref(state, { owner: owner.id }, "/explore"),
            )}
            className={
              active
                ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-[#18181b]"
                : "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#343538] px-4 text-sm font-medium text-[#dadee4] transition-colors hover:bg-[#3f4043]"
            }
          >
            <span className="max-w-20 truncate">{owner.abbreviation}</span>
            <span className={active ? "text-[#55575d]" : "text-[#a8afb7]"}>
              {formatCount(owner.count)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[112px] rounded-[22px] bg-[#343538] px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#a8afb7]">
        {label}
      </p>
      <p className="mt-1 truncate text-xl font-medium tracking-[-0.04em]">
        {formatCount(value)}
      </p>
    </div>
  );
}

function toDiscoveryHref(href: string) {
  return `${href}#discovery`;
}
