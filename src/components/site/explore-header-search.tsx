"use client";

import { Baseline, Search } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ExploreHeaderSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const currentView = searchParams.get("view");

  if (pathname !== "/explore") {
    return null;
  }

  return (
    <div
      role="search"
      className="absolute left-1/2 top-1/2 z-10 w-full max-w-[600px] -translate-x-1/2 -translate-y-1/2 px-4 max-[760px]:top-[calc(100%+0.75rem)]"
    >
      <form
        method="get"
        action="/explore#discovery"
        className="flex h-[52px] w-full items-center gap-3 rounded-[18px] border border-[#343538]/60 bg-[#27272a] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
      >
        {currentView && currentView !== "newest" ? (
          <input type="hidden" name="view" value={currentView} />
        ) : null}
        <Search aria-hidden="true" className="size-4 shrink-0 text-[#a8afb7]" />
        <label htmlFor="goal-search" className="sr-only">
          Search
        </label>
        <input
          key={currentQuery}
          id="goal-search"
          name="q"
          type="search"
          defaultValue={currentQuery}
          placeholder="Search"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#a8afb7]"
        />
        <Button
          type="submit"
          variant="secondary"
          size="icon"
          aria-label="Search"
          className="size-10 rounded-[14px] bg-[#343538] text-[#dadee4] hover:bg-[#3d3f42]"
        >
          <Baseline data-icon="inline-start" />
        </Button>
      </form>
    </div>
  );
}
