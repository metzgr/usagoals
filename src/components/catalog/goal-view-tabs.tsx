import Link from "next/link";

import {
  goalCatalogViews,
  type GoalCatalogState,
  type GoalCatalogView,
} from "@/lib/catalog";

export function GoalViewTabs({ state }: { state: GoalCatalogState }) {
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
