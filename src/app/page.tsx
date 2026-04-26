import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { CatalogCard } from "@/components/catalog/catalog-card";
import { getOverview } from "@/lib/apex";
import {
  buildCatalogHref,
  catalogKindOptions,
  getCatalogModel,
  type CatalogState,
} from "@/lib/catalog";
import { formatCount } from "@/lib/utils";

const artworkExtensions = new Set([
  ".avif",
  ".gif",
  ".jpg",
  ".jpeg",
  ".png",
  ".svg",
  ".webp",
]);

const agencySealMarqueeItems = [
  { id: "nasa", src: "/seals/nasa.svg" },
  { id: "epa", src: "/seals/epa.svg" },
  { id: "dhs", src: "/seals/dhs.svg" },
  { id: "doi", src: "/seals/doi.svg" },
  { id: "hhs", src: "/seals/hhs.svg" },
];

export const metadata: Metadata = {
  title: "Discovery",
};

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    kind?: string;
    owner?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const [overview, goalArtwork] = await Promise.all([
    getOverview(),
    getGoalArtwork(),
  ]);
  const model = getCatalogModel(overview, params);
  const scopeLabel = model.activeOwner?.abbreviation ?? "All owners";

  return (
    <main className="min-h-screen bg-[#18181b] text-white">
      <SiteHeader
        state={model.state}
        totalItems={model.totalItems}
        resultCount={model.totalMatches}
      />

      <div className="pt-[118px]">
        <section className="flex w-full justify-center px-[100px] max-[1024px]:px-9 max-[440px]:px-4">
          <div className="w-full max-w-[1440px]">
            <div className="flex justify-center px-9 pb-[10vw] pt-[6vw] max-[800px]:px-0">
              <div className="flex w-full max-w-[75vw] flex-col items-center gap-10 text-center max-[800px]:max-w-none">
                <h1 className="max-w-[1080px] font-serif text-[80px] font-medium leading-none max-[768px]:text-[42px]">
                  Track the
                  <AgencyMarquee />
                  <span>Administration’s</span>
                  <br />
                  goals for the Nation
                  <GoalMarquee artwork={goalArtwork} />
                </h1>

                <p className="max-w-[640px] text-[18px] leading-7 text-[#a8afb7] max-[440px]:w-full">
                  {formatCount(overview.goals.length)} goals,{" "}
                  {formatCount(overview.documents.length)} plans, and{" "}
                  {formatCount(overview.agencies.length)} owners from the live
                  strategy corpus.
                </p>

                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-wrap justify-center gap-2 max-[440px]:w-full max-[440px]:flex-col">
                    <Link
                      href="#discovery"
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#ffe231] px-7 text-sm font-medium text-[#18181b] transition-opacity hover:opacity-90 max-[440px]:w-full"
                    >
                      Start exploring
                    </Link>
                    <Link
                      href={toDiscoveryHref(
                        buildCatalogHref(model.state, { kind: "owner" }),
                      )}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#343538] px-7 text-sm font-medium text-[#dadee4] transition-colors hover:bg-[#3f4043] max-[440px]:w-full"
                    >
                      View owners
                    </Link>
                  </div>

                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#a8afb7]">
                    {scopeLabel} / {formatCount(model.totalMatches)} results
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                  <h2 className="max-w-[820px] text-[56px] font-medium leading-none tracking-[-0.055em] max-[768px]:text-[36px]">
                    Browse the public performance archive.
                  </h2>
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
                href="/#discovery"
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
                  href="/#discovery"
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#ffe231] px-7 text-sm font-medium text-[#18181b]"
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
    <header className="fixed inset-x-0 top-0 z-50 grid h-[78px] grid-cols-12 items-center bg-[#18181b] px-9 max-[440px]:px-4">
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
        <Link className="transition-colors hover:text-white" href="#discovery">
          For You
        </Link>
        <Link
          className="transition-colors hover:text-white"
          href={toDiscoveryHref(buildCatalogHref(state, { kind: "goal" }))}
        >
          Explore
        </Link>
        <Link
          className="transition-colors hover:text-white"
          href={toDiscoveryHref(buildCatalogHref(state, { kind: "owner" }))}
        >
          Owners
        </Link>
      </nav>

      <div className="col-span-4 hidden justify-center lg:flex">
        <SearchForm state={state} variant="header" />
      </div>

      <div className="col-span-9 flex items-center justify-end gap-2 lg:col-span-2">
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
      action="/#discovery"
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
            : "inline-flex h-10 shrink-0 items-center justify-center rounded bg-[#ffe231] px-4 text-sm font-medium text-[#18181b]"
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
              buildCatalogHref(state, { kind: option.value }),
            )}
            className={
              active
                ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-[#18181b]"
                : "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#343538] px-4 text-sm font-medium text-[#dadee4] transition-colors hover:bg-[#3f4043]"
            }
          >
            <span>{option.label}</span>
            <span
              className={
                active ? "text-[#55575d]" : "text-[#a8afb7]"
              }
            >
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
        href={toDiscoveryHref(buildCatalogHref(state, { owner: "all" }))}
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
            href={toDiscoveryHref(buildCatalogHref(state, { owner: owner.id }))}
            className={
              active
                ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-[#18181b]"
                : "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#343538] px-4 text-sm font-medium text-[#dadee4] transition-colors hover:bg-[#3f4043]"
            }
          >
            <span className="max-w-20 truncate">{owner.abbreviation}</span>
            <span
              className={
                active ? "text-[#55575d]" : "text-[#a8afb7]"
              }
            >
              {formatCount(owner.count)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function AgencyMarquee() {
  return (
    <InlineHeroMarquee
      backgroundClassName="bg-[#EDE7DD]"
      direction="reverse"
      itemGap="gap-4"
    >
      {agencySealMarqueeItems.map((item) => (
        <span
          key={item.id}
          className="relative flex h-10 w-12 shrink-0 items-center justify-center max-[768px]:h-7 max-[768px]:w-9"
        >
          <Image
            src={item.src}
            alt=""
            fill
            sizes="56px"
            className="object-contain"
            unoptimized
          />
        </span>
      ))}
    </InlineHeroMarquee>
  );
}

function GoalMarquee({
  artwork,
}: {
  artwork: Array<{ alt: string; id: string; src: string }>;
}) {
  return (
    <InlineHeroMarquee
      backgroundClassName="bg-[#EDE7DD]"
      direction="reverse"
      itemGap="gap-3"
    >
      {artwork.map((item) => (
        <span
          key={item.id}
          className={`relative flex h-16 w-20 shrink-0 items-center justify-center max-[768px]:h-6 max-[768px]:w-10 ${item.id === "usa.png" ? "ml-2" : ""}`}
        >
          <Image
            src={item.src}
            alt=""
            fill
            sizes="176px"
            className="object-contain"
          />
        </span>
      ))}
    </InlineHeroMarquee>
  );
}

function InlineHeroMarquee({
  backgroundClassName = "bg-white",
  children,
  direction = "normal",
  itemGap = "gap-5",
}: {
  backgroundClassName?: "bg-[#EDE7DD]" | "bg-white";
  children: ReactNode;
  direction?: "normal" | "reverse";
  itemGap?: "gap-3" | "gap-4" | "gap-5";
}) {
  const animationClass =
    direction === "reverse"
      ? "animate-[discovery-marquee-reverse_22s_linear_infinite]"
      : "animate-[discovery-marquee_22s_linear_infinite]";
  const trailingGapClass =
    itemGap === "gap-3" ? "pr-3" : itemGap === "gap-4" ? "pr-4" : "pr-5";

  return (
    <span
      aria-hidden="true"
      className={`mx-2 inline-flex h-[74px] w-[200px] translate-y-[-14px] items-center overflow-hidden rounded-full ${backgroundClassName} px-5 align-middle text-[#18181b] max-[768px]:h-8 max-[768px]:w-[120px] max-[768px]:translate-y-[-4px] max-[768px]:px-3`}
      >
      <span
        className={`flex min-w-max ${animationClass} items-center`}
      >
        <span className={`flex shrink-0 items-center ${itemGap} ${trailingGapClass}`}>
          {children}
        </span>
        <span className={`flex shrink-0 items-center ${itemGap} ${trailingGapClass}`}>
          {children}
        </span>
      </span>
    </span>
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
  return href === "/" ? "/#discovery" : `${href}#discovery`;
}

async function getGoalArtwork() {
  const artworkDirectory = path.join(process.cwd(), "public", "artwork");

  try {
    const entries = await readdir(artworkDirectory, { withFileTypes: true });

    const artworkEntries = entries
      .filter((entry) => {
        const extension = path.extname(entry.name).toLowerCase();
        return entry.isFile() && artworkExtensions.has(extension);
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return Promise.all(
      artworkEntries.map(async (entry) => {
        const fileStats = await stat(path.join(artworkDirectory, entry.name));
        const version = Math.floor(fileStats.mtimeMs);

        return {
          id: entry.name,
          src: `/artwork/${encodeURIComponent(entry.name)}?v=${version}`,
          alt: getArtworkAlt(entry.name),
        };
      }),
    );
  } catch {
    return [];
  }
}

function getArtworkAlt(fileName: string) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
