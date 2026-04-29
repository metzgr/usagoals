"use client";

import { Search, X } from "lucide-react";
import { useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ExploreHeaderSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const currentView = searchParams.get("view");
  const currentPreview = searchParams.get("preview");
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(currentQuery);

  if (pathname !== "/explore") {
    return null;
  }

  return (
    <div
      role="search"
      className="absolute left-1/2 top-1/2 z-10 w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 px-4 max-[760px]:top-[calc(100%+0.75rem)]"
    >
      <form
        method="get"
        action="/explore#discovery"
        className="flex h-11 w-full items-center gap-2 rounded-md bg-[#27272a] py-1 pl-1 pr-[3px]"
      >
        {currentView && currentView !== "newest" ? (
          <input type="hidden" name="view" value={currentView} />
        ) : null}
        {currentPreview === "summary" ? (
          <input type="hidden" name="preview" value={currentPreview} />
        ) : null}
        <div className="flex h-9 min-w-0 flex-1 items-center gap-4 p-[10px]">
          <Search aria-hidden="true" className="size-4 shrink-0 text-[#a8afb7]" />
          <input
            key={currentQuery}
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search"
            autoComplete="off"
            ref={inputRef}
            className="h-4 min-w-0 flex-1 appearance-none bg-transparent text-sm leading-4 text-[#a8afb7] outline-none placeholder:text-[#a8afb7]/70 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              className="-mr-0.5 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-[#a8afb7]/70 transition-colors hover:text-[#d4d4d8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a8afb7]/50"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="default"
          className="size-[38px] cursor-pointer rounded-[4px] bg-[#343538] p-0 text-xs font-medium text-[#a8afb7] hover:bg-[#3d3f42]"
        >
          Go
        </Button>
      </form>
    </div>
  );
}
