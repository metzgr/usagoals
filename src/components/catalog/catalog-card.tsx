import { AgencyAvatar } from "@/components/catalog/agency-avatar";
import type { CatalogItem } from "@/lib/catalog";

export function CatalogCard({ item }: { item: CatalogItem }) {
  const objectivesMetric =
    item.metrics.find((metric) => metric.label === "Objectives") ??
    item.metrics[0];
  const measuresMetric = item.metrics.find(
    (metric) => metric.label === "Measures" && metric.value !== "0",
  );
  const objectivesLabel =
    objectivesMetric?.value === "1" ? "objective" : "objectives";
  const measuresLabel =
    measuresMetric?.value === "1" ? "measure" : "measures";
  const fiscalYear = getFiscalYearLabel(item.sourceTitle);

  return (
    <article
      id={item.id}
      className="group col-span-3 min-w-0 max-[1024px]:col-span-4 max-[900px]:col-span-3 max-[640px]:col-span-1"
    >
      <div className="relative flex aspect-[3/4] cursor-pointer flex-col items-start justify-between rounded-lg border-2 border-[#27272a] bg-[#27272a] p-6 text-left transition duration-150 hover:-translate-y-0.5 hover:border-[#343538] max-[640px]:p-5">
        <div className="absolute right-5 top-5">
          <AgencyAvatar owner={item.owner} size="sm" />
        </div>

        <div className="flex min-w-0 flex-col gap-5 pr-10">
          <div className="flex min-w-0 text-xs text-[#a8afb7]">
            <span className="truncate">{item.owner.name}</span>
          </div>

          <h2 className="line-clamp-3 max-w-full text-[clamp(1rem,1.1vw,1.25rem)] font-normal leading-tight tracking-normal text-white">
            {item.title}
          </h2>
        </div>

        <div className="flex max-w-full flex-wrap gap-1.5 pr-10">
          {fiscalYear ? (
            <span className="max-w-[9rem] truncate rounded-full bg-[#343538] px-2.5 py-1 text-xs font-medium text-[#a8afb7]/75">
              {fiscalYear}
            </span>
          ) : null}
          {objectivesMetric ? (
            <span className="max-w-[9rem] truncate rounded-full bg-[#343538] px-2.5 py-1 text-xs font-medium text-[#a8afb7]/75">
              {objectivesMetric.value} {objectivesLabel}
            </span>
          ) : null}
          {measuresMetric ? (
            <span className="max-w-[9rem] truncate rounded-full bg-[#343538] px-2.5 py-1 text-xs font-medium text-[#a8afb7]/75">
              {measuresMetric.value} {measuresLabel}
            </span>
          ) : null}
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
    </article>
  );
}

function getFiscalYearLabel(sourceTitle: string) {
  const yearRange = sourceTitle.match(/\b(?:FY\s*)?(20\d{2})\s*[–-]\s*(20\d{2})\b/i);

  if (yearRange) {
    return `FY ${yearRange[1]}-${yearRange[2]}`;
  }

  const singleFiscalYear = sourceTitle.match(/\bFY\s*(20\d{2})\b/i);

  if (singleFiscalYear) {
    return `FY ${singleFiscalYear[1]}`;
  }

  return "";
}
