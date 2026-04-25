import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, Network } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { getTheme } from "@/lib/apex";
import { formatTagLabel } from "@/lib/utils";

type ThemePageProps = {
  params: Promise<{
    tag: string;
  }>;
};

async function getThemePageData(tag: string) {
  try {
    return await getTheme(tag);
  } catch {
    notFound();
  }
}

export async function generateMetadata({
  params,
}: ThemePageProps): Promise<Metadata> {
  const theme = await getThemePageData((await params).tag);

  return {
    title: formatTagLabel(theme.theme),
    description: `Explore cross-agency goals tagged to ${formatTagLabel(theme.theme)}.`,
  };
}

export default async function ThemePage({ params }: ThemePageProps) {
  const theme = await getThemePageData((await params).tag);

  return (
    <div className="space-y-14 pb-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Theme"
            title={formatTagLabel(theme.theme)}
            description="This page turns a lightweight APEX tag into a cross-agency issue space. It is one of the cleanest proofs that the current API already supports issue-centric navigation."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="card-surface p-5">
            <p className="eyebrow">Goals</p>
            <p className="mt-3 text-4xl font-semibold text-[var(--ink-strong)]">
              {theme.total_goals}
            </p>
          </div>
          <div className="card-surface p-5">
            <p className="eyebrow">Agencies</p>
            <p className="mt-3 text-4xl font-semibold text-[var(--ink-strong)]">
              {theme.total_agencies}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="eyebrow">Agency clusters</p>
          <h2 className="text-3xl font-semibold text-[var(--ink-strong)]">
            Every agency currently tied to this theme.
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {theme.agencies.map((agency) => (
            <article key={agency.id} className="card-surface space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">{agency.abbreviation}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">
                    {agency.name}
                  </h3>
                </div>
                <Link
                  href={`/agencies/${agency.id}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-white text-[var(--ink-strong)] transition hover:-translate-y-0.5 hover:bg-[var(--paper)]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {agency.goals.map((goal) => (
                  <Link
                    key={goal.id}
                    href={`/goals/${goal.id}`}
                    className="block rounded-3xl border border-[color:var(--border-subtle)] bg-white px-4 py-4 transition hover:border-[color:var(--accent)]"
                  >
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                      <Building2 className="h-3.5 w-3.5" />
                      Goal {goal.number ?? "Unnumbered"}
                    </div>
                    <p className="mt-2 font-semibold text-[var(--ink-strong)]">
                      {goal.title}
                    </p>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card-surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Network className="mt-1 h-5 w-5 text-[var(--accent)]" />
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Phase 2 can strengthen this page by mixing typed shared-priority edges with
            vector similarity, turning a theme page into a richer issue-graph explorer.
          </p>
        </div>
        <Link href={`/discovery-lab?signal=${theme.theme}`} className="button-secondary">
          Open discovery lab
        </Link>
      </section>
    </div>
  );
}
