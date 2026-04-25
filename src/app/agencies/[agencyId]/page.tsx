import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileText, Network, Radar } from "lucide-react";

import { GoalCard } from "@/components/goal-card";
import { MetricCard } from "@/components/metric-card";
import { SectionHeading } from "@/components/section-heading";
import { getAgencyProfile } from "@/lib/apex";
import { formatCount } from "@/lib/utils";

type AgencyPageProps = {
  params: Promise<{
    agencyId: string;
  }>;
};

async function getAgencyPageData(agencyId: string) {
  const parsedAgencyId = Number(agencyId);

  if (!Number.isFinite(parsedAgencyId)) {
    notFound();
  }

  try {
    return await getAgencyProfile(parsedAgencyId);
  } catch {
    notFound();
  }
}

export async function generateMetadata({
  params,
}: AgencyPageProps): Promise<Metadata> {
  const agency = await getAgencyPageData((await params).agencyId);

  return {
    title: agency.name,
    description: `Explore ${agency.name} goals, objectives, and measures in the USA Goals prototype.`,
  };
}

export default async function AgencyPage({ params }: AgencyPageProps) {
  const agency = await getAgencyPageData((await params).agencyId);

  return (
    <div className="space-y-14 pb-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <p className="eyebrow">Agency profile</p>
          <h1 className="font-display text-5xl leading-none tracking-tight text-[var(--ink-strong)] sm:text-6xl">
            {agency.name}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--ink-soft)]">
            The current corpus shows {agency.goal_count} goals, {agency.objective_count} objectives, and {agency.measure_count} measures for {agency.abbreviation}.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-[var(--mist)] px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]">
              {agency.abbreviation}
            </span>
            <span className="rounded-full bg-[var(--paper)] px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]">
              {agency.document_count} source document
              {agency.document_count === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <MetricCard
            label="Goals"
            value={formatCount(agency.goal_count)}
            detail="Structured strategic goals available for this agency right now."
            icon={<Radar className="h-4 w-4" />}
          />
          <MetricCard
            label="Objectives"
            value={formatCount(agency.objective_count)}
            detail="Nested objectives beneath those goals."
            icon={<Network className="h-4 w-4" />}
          />
          <MetricCard
            label="Measures"
            value={formatCount(agency.measure_count)}
            detail="Measure records captured from the available source plans."
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Goals"
          title="The current strategy stack for this agency."
          description="Each goal page exposes the source evidence, objective tree, and any related graph edges already derivable from the corpus."
        />
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {agency.goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={{
                ...goal,
                agency_name: agency.name,
                agency_abbreviation: agency.abbreviation,
              }}
            />
          ))}
        </div>
      </section>

      <section className="card-surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Next step</p>
          <p className="mt-2 text-base leading-7 text-[var(--ink-soft)]">
            Want to compare this agency against peers in the same strategy space?
          </p>
        </div>
        <Link href="/compare" className="button-primary">
          Open compare view
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
