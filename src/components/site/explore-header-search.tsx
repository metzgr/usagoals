"use client";

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
      className="absolute left-1/2 top-1/2 z-10 w-full max-w-[560px] -translate-x-1/2 -translate-y-1/2 px-4 max-[760px]:top-[calc(100%+0.75rem)]"
    >
      <form
        method="get"
        action="/explore#discovery"
        className="flex min-h-11 w-full items-center gap-2 rounded-md bg-[#27272a] px-2"
      >
        {currentView && currentView !== "newest" ? (
          <input type="hidden" name="view" value={currentView} />
        ) : null}
        <input
          key={currentQuery}
          name="q"
          type="search"
          defaultValue={currentQuery}
          placeholder="Search goals"
          aria-label="Search goals"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-[#a8afb7]"
        />
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="h-9 rounded-md bg-[#343538] px-5 text-sm font-medium text-white hover:bg-[#3d3f42]"
        >
          Go
        </Button>
      </form>
    </div>
  );
}
