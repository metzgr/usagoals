import type { CatalogItem } from "@/lib/catalog";

const kindLabels: Record<CatalogItem["kind"], string> = {
  goal: "Goal",
  plan: "Plan",
  indicator: "Indicator",
  theme: "Theme",
  owner: "Owner",
};

export function CatalogCard({ item }: { item: CatalogItem }) {
  const primaryMetric = item.metrics[0];
  const secondaryMetric = item.metrics[1];
  const seal = item.owner.abbreviation.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4);

  return (
    <article
      id={item.id}
      className="group col-span-3 min-w-0 max-[1024px]:col-span-4 max-[768px]:col-span-6"
    >
      <div className="relative flex aspect-[1/1.15] cursor-pointer items-center justify-center rounded-lg border-2 border-[#27272a] bg-[#27272a] px-[20%] transition duration-150 hover:-translate-y-0.5 hover:border-[#343538]">
        <div className="flex h-[60%] w-[80%] items-center justify-center">
          <div className="flex aspect-square h-[65%] items-center justify-center rounded-full border border-white/10 bg-white/5">
            <span className="max-w-full truncate text-[clamp(1.8rem,3vw,3.5rem)] font-semibold leading-none tracking-[-0.08em] text-white">
              {seal || "US"}
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-label={`Save ${item.title}`}
          className="absolute bottom-2.5 right-2.5 inline-flex size-9 origin-bottom-right translate-y-0.5 scale-[0.98] items-center justify-center rounded-full bg-[#59A9FF] text-[#18181b] opacity-0 transition duration-150 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 max-[1024px]:opacity-100"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4"
            fill="none"
          >
            <path
              d="M12 6.6c1.8-2.1 5.3-1.3 6.1 1.5.7 2.4-.8 4.4-2.5 5.9L12 17.3 8.4 14c-1.7-1.5-3.2-3.5-2.5-5.9.8-2.8 4.3-3.6 6.1-1.5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-[0.55rem] overflow-hidden">
        <div className="flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-[#a8afb7]">
          <span className="inline-flex size-3 shrink-0 items-center justify-center rounded-full bg-[#dadee4] text-[7px] font-semibold text-[#18181b]">
            {(seal || "US").slice(0, 1)}
          </span>
          <span className="truncate">{item.owner.name}</span>
        </div>

        <h3 className="line-clamp-2 text-[15px] font-medium leading-5 tracking-[-0.02em] text-white">
          {item.title}
        </h3>

        <div className="relative flex min-w-0 items-center gap-1 overflow-hidden text-xs text-[#a8afb7]/75">
          <span className="shrink-0 rounded-full bg-[#27272a] px-2.5 py-1 font-medium">
            {kindLabels[item.kind]}
          </span>
          <span className="shrink-0 rounded-full bg-[#27272a] px-2.5 py-1 font-medium">
            {item.timeLabel}
          </span>
          {item.tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="max-w-[8rem] shrink-0 truncate rounded-full bg-[#27272a] px-2.5 py-1 font-medium"
            >
              {tag}
            </span>
          ))}
          {secondaryMetric ?? primaryMetric ? (
            <span className="max-w-[9rem] shrink-0 truncate rounded-full bg-[#27272a] px-2.5 py-1 font-medium">
              {(secondaryMetric ?? primaryMetric)?.label}:{" "}
              {(secondaryMetric ?? primaryMetric)?.value}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
