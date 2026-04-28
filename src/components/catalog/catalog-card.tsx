import Link from "next/link";

import { AgencyAvatar } from "@/components/catalog/agency-avatar";
import { AutoFitClampedTitle } from "@/components/catalog/auto-fit-clamped-title";
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
  const goalId = item.id.startsWith("goal:") ? item.id.replace("goal:", "") : "";
  const href = goalId ? `/goals/${goalId}` : "/explore";

  return (
    <article
      id={item.id}
      className="group col-span-3 min-w-0 max-[1024px]:col-span-4 max-[900px]:col-span-3 max-[640px]:col-span-1"
    >
      <Link
        href={href}
        aria-label={`View ${item.title}`}
        className="relative flex aspect-[3/4] cursor-pointer flex-col items-start overflow-hidden rounded-lg border-2 border-[#27272a] bg-[#27272a] text-left outline-none transition duration-150 hover:-translate-y-0.5 hover:border-[#343538] focus-visible:ring-2 focus-visible:ring-[#59A9FF]"
      >
        <div className="absolute right-5 top-5">
          <AgencyAvatar owner={item.owner} size="sm" />
        </div>

        <div className="flex min-w-0 flex-col gap-5 p-6 pr-[52px] max-[640px]:p-5 max-[640px]:pr-[52px]">
          <div className="flex min-w-0 text-xs text-[#a8afb7]">
            <span className="truncate">{item.owner.name}</span>
          </div>

          <AutoFitClampedTitle>{item.title}</AutoFitClampedTitle>
        </div>

        <div
          aria-hidden="true"
          className="-mx-0.5 min-h-0 w-[calc(100%+4px)] flex-1 bg-[#EDE7DD]"
        />

        <div className="flex max-w-full flex-wrap gap-1.5 p-6 pr-10 max-[640px]:p-5 max-[640px]:pr-10">
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
      </Link>
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
