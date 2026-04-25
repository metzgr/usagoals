import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CheckSquare2 } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { compareMeasures, listAgencies } from "@/lib/apex";
import { formatValue, toIdArray } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compare Agencies",
  description:
    "Compare reported measures across agencies in the current USA Goals corpus.",
};

type ComparePageProps = {
  searchParams: Promise<{
    agency_id?: string | string[];
  }>;
};

const defaultAgencyIds = [3, 21, 25];

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const agencies = await listAgencies();
  const selectedAgencyIds = toIdArray(params.agency_id);
  const activeAgencyIds =
    selectedAgencyIds.length > 0 ? selectedAgencyIds : defaultAgencyIds;
  const rows = await compareMeasures(activeAgencyIds);
  const activeAgencies = agencies.filter((agency) => activeAgencyIds.includes(agency.id));

  return (
    <div className="space-y-14 pb-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Cross-Agency Compare"
            title="Line up the current strategy measures across selected agencies."
            description="The API currently returns flat measure rows rather than normalized KPI families, so this page keeps the comparison intentionally raw. It is designed to show what can already be done with today’s corpus."
          />
          <div className="flex flex-wrap gap-3">
            {activeAgencies.map((agency) => (
              <span
                key={agency.id}
                className="rounded-full bg-[var(--mist)] px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]"
              >
                {agency.abbreviation}
              </span>
            ))}
          </div>
        </div>

        <form method="get" className="card-surface space-y-5 p-6">
          <div className="flex items-center gap-3">
            <CheckSquare2 className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--ink-strong)]">
              Choose agencies
            </h2>
          </div>
          <div className="grid max-h-[24rem] gap-3 overflow-y-auto pr-1">
            {agencies.map((agency) => (
              <label
                key={agency.id}
                className="flex items-start gap-3 rounded-3xl border border-[color:var(--border-subtle)] bg-white px-4 py-3 text-sm text-[var(--ink-soft)]"
              >
                <input
                  type="checkbox"
                  name="agency_id"
                  value={agency.id}
                  defaultChecked={activeAgencyIds.includes(agency.id)}
                  className="mt-1 h-4 w-4 rounded border-[color:var(--border-strong)] text-[var(--accent)]"
                />
                <span>
                  <span className="block font-semibold text-[var(--ink-strong)]">
                    {agency.name}
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                    {agency.abbreviation}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <button type="submit" className="button-primary w-full justify-center">
            Compare selection
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(120px,1fr))] gap-4 border-b border-[color:var(--border-subtle)] bg-[var(--paper)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                <span>Measure</span>
                <span>Agency</span>
                <span>Baseline</span>
                <span>Target</span>
                <span>Actual / Trend</span>
              </div>
              <div className="divide-y divide-[color:var(--border-subtle)]">
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <div
                      key={`${row.measure_name}-${row.agency_name}-${index}`}
                      className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(120px,1fr))] gap-4 px-5 py-4 text-sm text-[var(--ink-soft)]"
                    >
                      <div className="font-semibold text-[var(--ink-strong)]">
                        {row.measure_name}
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[var(--ink-muted)]" />
                        {row.agency_name}
                      </div>
                      <div>{formatValue(row.baseline_value)}</div>
                      <div>{formatValue(row.target_value)}</div>
                      <div>
                        <span className="block">{formatValue(row.actual_value)}</span>
                        <span className="text-xs uppercase tracking-[0.15em] text-[var(--accent)]">
                          {row.trend ?? "No trend"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-10 text-sm leading-7 text-[var(--ink-soft)]">
                    No comparison rows were returned for this selection. The underlying
                    API is still sparse for some agencies and measures.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card-surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Need a more narrative entry point first? Start in{" "}
            <Link href="/discovery-lab" className="font-semibold text-[var(--accent)]">
              Discovery Lab
            </Link>{" "}
            or go back to{" "}
            <Link href="/explore" className="font-semibold text-[var(--accent)]">
              Explore
            </Link>{" "}
            to move from issues into agencies and goals before comparing.
          </p>
        </div>
      </section>
    </div>
  );
}
