import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { DownloadDataButton } from "@/components/site/download-data-button";

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

export default async function HomePage() {
  const goalArtwork = await getGoalArtwork();

  return (
    <main className="flex min-h-[calc(100dvh-var(--site-banner-height))] items-center justify-center bg-[#18181b] px-[100px] py-12 text-white max-[1024px]:px-9 max-[440px]:px-4">
      <Link
        href="/"
        aria-label="USA Goals home"
        className="fixed left-6 top-[calc(var(--site-banner-height)+1.75rem)] z-50 inline-flex items-center max-[440px]:left-4"
      >
        <Image
          src="/usagoals-logo.svg"
          alt="USA Goals"
          width={60}
          height={30}
          priority
          className="h-auto w-[60px] invert"
        />
      </Link>
      <div className="fixed right-6 top-[calc(var(--site-banner-height)+1.5rem)] z-50 max-[440px]:right-4">
        <DownloadDataButton />
      </div>
      <div className="fixed left-1/2 top-[calc(var(--site-banner-height)+1.25rem)] z-50 w-full max-w-[420px] -translate-x-1/2 px-4 max-[760px]:top-[calc(var(--site-banner-height)+4.75rem)]">
        <HomeSearchForm />
      </div>

      <section className="flex w-full max-w-[1440px] justify-center">
        <div className="flex w-full max-w-[75vw] flex-col items-center gap-10 text-center max-[800px]:max-w-none">
          <h1 className="max-w-[1080px] font-serif text-[96px] font-medium leading-none tracking-[-0.008em] max-[768px]:text-[42px]">
            Track the
            <AgencyMarquee />
            <span>Administration’s</span>
            <br />
            goals for the Nation
            <GoalMarquee artwork={goalArtwork} />
          </h1>

          <p className="max-w-[640px] text-[18px] leading-7 text-[#a8afb7] max-[440px]:w-full">
            Explore the strategic goals set by major federal agencies. Find connections to your priorities. Impact what government achieves for the American people.
          </p>

          <div className="flex flex-wrap justify-center gap-2 max-[440px]:w-full max-[440px]:flex-col">
            <Link
              href="/explore"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-[#18181b] transition-opacity hover:opacity-90 max-[440px]:w-full"
            >
              Discover
            </Link>
            <Link
              href="/explore?kind=owner#discovery"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#343538] px-7 text-sm font-medium text-[#dadee4] transition-colors hover:bg-[#3f4043] max-[440px]:w-full"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HomeSearchForm() {
  return (
    <form
      action="/explore#discovery"
      method="get"
      className="flex min-h-11 w-full items-center gap-2 rounded-md bg-[#27272a] p-1 pl-3.5"
    >
      <input
        name="q"
        placeholder="Search"
        aria-label="Search site"
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#a8afb7]"
      />
      <button
        type="submit"
        className="inline-flex h-10 shrink-0 items-center justify-center rounded bg-[#59A9FF] px-4 text-sm font-medium text-[#18181b]"
      >
        Go
      </button>
    </form>
  );
}

function AgencyMarquee() {
  return (
    <InlineHeroMarquee direction="reverse" itemGap="gap-4">
      {agencySealMarqueeItems.map((item) => (
        <span
          key={item.id}
          className="relative flex h-12 w-14 shrink-0 items-center justify-center max-[768px]:h-8 max-[768px]:w-10"
        >
          <Image
            src={item.src}
            alt=""
            fill
            sizes="64px"
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
    <InlineHeroMarquee direction="reverse" itemGap="gap-4">
      {artwork.map((item) => (
        <span
          key={item.id}
          className={`relative flex h-[64px] w-[72px] shrink-0 items-center justify-center max-[768px]:h-[48px] max-[768px]:w-[56px] ${item.id === "usa.png" ? "ml-2" : ""}`}
        >
          <Image
            src={item.src}
            alt=""
            fill
            sizes="320px"
            className="object-contain"
          />
        </span>
      ))}
    </InlineHeroMarquee>
  );
}

function InlineHeroMarquee({
  children,
  direction = "normal",
  itemGap = "gap-5",
}: {
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
      className="mx-2 inline-flex h-[74px] w-[200px] translate-y-[-8px] items-center overflow-hidden rounded-full bg-[#EDE7DD] px-5 align-middle text-[#18181b] max-[768px]:h-8 max-[768px]:w-[120px] max-[768px]:translate-y-[-2px] max-[768px]:px-3"
    >
      <span className={`flex min-w-max ${animationClass} items-center`}>
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
