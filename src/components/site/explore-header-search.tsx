"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function ExploreHeaderSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [, startTransition] = useTransition();

  if (pathname !== "/explore") {
    return null;
  }

  function updateCatalog(nextQuery: string) {
    startTransition(() => {
      const params = new URLSearchParams();
      const view = searchParams.get("view");
      const compactQuery = nextQuery.trim();

      if (view && view !== "newest") {
        params.set("view", view);
      }

      if (compactQuery) {
        params.set("q", compactQuery);
      } else {
        params.delete("q");
      }

      const queryString = params.toString();
      router.replace(
        queryString
          ? `/explore?${queryString}#discovery`
          : "/explore#discovery",
        { scroll: false },
      );
    });
  }

  return (
    <div
      role="search"
      className="absolute left-1/2 top-1/2 z-10 w-full max-w-[560px] -translate-x-1/2 -translate-y-1/2 px-4 max-[760px]:top-[calc(100%+0.75rem)]"
    >
      <form
        action="/explore#discovery"
        className="flex min-h-11 w-full items-center rounded-md bg-[#27272a] px-3.5"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          updateCatalog(String(formData.get("q") ?? ""));
        }}
      >
        <input
          key={currentQuery}
          name="q"
          type="search"
          defaultValue={currentQuery}
          placeholder="Search goals"
          aria-label="Search goals"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#a8afb7]"
          onChange={(event) => updateCatalog(event.target.value)}
        />
      </form>
    </div>
  );
}
