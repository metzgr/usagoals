import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  FileText,
  Gauge,
  Target,
} from "lucide-react";

import { AgencyAvatar } from "@/components/catalog/agency-avatar";
import { GoalNetworkMap } from "@/components/goals/goal-network-map";
import { Badge } from "@/components/ui/badge";
import { getDocument, getGoal, type GoalMeasure, type GoalSummary } from "@/lib/apex";
import { getGoalRelationshipModel } from "@/lib/goal-relationships";
import { cn, formatCount, formatTagLabel, formatValue } from "@/lib/utils";

export const revalidate = 1800;

type GoalPageProps = {
  params: Promise<{
    goalId: string;
  }>;
};

export async function generateMetadata({
  params,
}: GoalPageProps): Promise<Metadata> {
  const goalId = parseGoalId((await params).goalId);

  if (!goalId) {
    return {
      title: "Goal",
    };
  }

  const goal = await getGoalOrNull(goalId);

  return {
    title: goal ? cleanText(goal.title, "Goal") : "Goal",
    description: goal?.summary ?? goal?.description ?? undefined,
  };
}

export default async function GoalPage({ params }: GoalPageProps) {
  const goalId = parseGoalId((await params).goalId);

  if (!goalId) {
    notFound();
  }

  const goal = await getGoalOrNull(goalId);

  if (!goal) {
    notFound();
  }

  const [document, network] = await Promise.all([
    getDocumentOrNull(goal.document_id),
    getGoalRelationshipModel(goal.id),
  ]);
  const owner = {
    id: String(goal.agency_id),
    name: cleanText(goal.agency_name, "Unknown agency"),
    abbreviation: cleanText(goal.agency_abbreviation, "US"),
    count: 0,
    cfo: false,
  };
  const measures = goal.objectives.flatMap((objective) => objective.measures);
  const sourceTitle = cleanText(
    document?.title ?? goal.document_title ?? goal.source,
    "Source document",
  );
  const fiscalYear = cleanText(document?.fiscal_year ?? goal.fiscal_year, "");
  const summary = cleanText(goal.summary ?? goal.description ?? goal.subtitle, "");

  return (
    <main className="min-h-screen bg-[#18181b] text-white">
      <section className="grid min-h-[calc(100vh-78px)] grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-6 px-6 py-6 max-[1020px]:block max-[520px]:px-4">
        <div className="max-h-[calc(100vh-126px)] overflow-y-auto pr-2 max-[1020px]:max-h-none max-[1020px]:overflow-visible max-[1020px]:pr-0">
          <div className="mb-8">
            <Link
              href="/explore#discovery"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#a8afb7] transition hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Explore
            </Link>
          </div>

          <header className="max-w-[760px]">
            <div className="mb-5 flex items-center gap-3">
              <AgencyAvatar owner={owner} />
              <div className="min-w-0 text-sm text-[#a8afb7]">
                <p className="truncate">{owner.name}</p>
              </div>
            </div>

            <h1 className="font-serif text-[clamp(3.8rem,8vw,8.5rem)] leading-[0.86] tracking-[-0.025em] text-white">
              {cleanText(goal.title, "Untitled goal")}
            </h1>

            {summary ? (
              <p className="mt-7 max-w-[620px] text-base leading-7 text-[#dadee4]/82">
                {summary}
              </p>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-1.5">
              <MetricBadge icon={<Target className="size-3" />}>
                {formatCount(goal.objectives.length)}{" "}
                {goal.objectives.length === 1 ? "objective" : "objectives"}
              </MetricBadge>
              {measures.length > 0 ? (
                <MetricBadge icon={<Gauge className="size-3" />}>
                  {formatCount(measures.length)}{" "}
                  {measures.length === 1 ? "measure" : "measures"}
                </MetricBadge>
              ) : null}
              {fiscalYear ? (
                <MetricBadge icon={<FileText className="size-3" />}>
                  {formatFiscalYear(fiscalYear)}
                </MetricBadge>
              ) : null}
            </div>
          </header>

          <SourcePanel
            sourceTitle={sourceTitle}
            pdfUrl={document?.pdf_url}
            sourcePage={goal.source_page}
            sourceConfidence={goal.source_confidence}
          />

          <ObjectivesList goal={goal} />

          {network.relatedGoals.length > 0 ? (
            <section className="mt-10 max-w-[760px]">
              <SectionHeading
                eyebrow="Related"
                title="Closest goals"
                description="Ranked by current semantic and shared-priority signals."
              />
              <div className="mt-4 grid gap-2">
                {network.relatedGoals.slice(0, 4).map((relatedGoal) => (
                  <Link
                    key={relatedGoal.goalId}
                    href={`/goals/${relatedGoal.goalId}`}
                    className="group rounded-lg bg-[#27272a] p-4 transition hover:bg-[#303136]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-[#a8afb7]">
                          {relatedGoal.agencyName}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-white">
                          {relatedGoal.title}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-[#59A9FF]">
                        {Math.round(relatedGoal.strength * 100)}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="sticky top-6 h-[calc(100vh-126px)] min-h-[580px] max-[1020px]:mt-10 max-[1020px]:h-[640px] max-[640px]:h-[560px]">
          <GoalNetworkMap model={network} />
        </aside>
      </section>
    </main>
  );
}

function SourcePanel({
  sourceTitle,
  pdfUrl,
  sourcePage,
  sourceConfidence,
}: {
  sourceTitle: string;
  pdfUrl: string | undefined;
  sourcePage: number | null;
  sourceConfidence: string | null;
}) {
  return (
    <section className="mt-10 max-w-[760px] rounded-lg bg-[#27272a] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#a8afb7]/70">
            <BookOpen className="size-3.5" />
            Source
          </div>
          <h2 className="line-clamp-2 text-base font-medium leading-snug text-white">
            {sourceTitle}
          </h2>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {sourcePage ? <MetricBadge>Page {sourcePage}</MetricBadge> : null}
            {sourceConfidence ? (
              <MetricBadge>{formatTagLabel(sourceConfidence)}</MetricBadge>
            ) : null}
          </div>
        </div>
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#343538] px-4 text-sm font-medium text-[#dadee4] transition hover:bg-[#3f4043]"
          >
            PDF
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
    </section>
  );
}

function ObjectivesList({ goal }: { goal: GoalSummary }) {
  return (
    <section className="mt-10 max-w-[760px]">
      <SectionHeading
        eyebrow="Profile"
        title="Objectives"
        description="Goal structure from the source plan."
      />

      <ol className="mt-4 space-y-3">
        {goal.objectives.map((objective, index) => (
          <li key={objective.id} className="rounded-lg bg-[#27272a] p-5">
            <div className="flex items-center justify-between gap-3 text-xs text-[#a8afb7]">
              <span>
                Objective {cleanText(objective.number, String(index + 1))}
              </span>
              {objective.source_page ? <span>Page {objective.source_page}</span> : null}
            </div>

            <h3 className="mt-3 line-clamp-3 text-lg font-medium leading-snug text-white">
              {cleanText(objective.title, "Untitled objective")}
            </h3>

            {objective.description ? (
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#a8afb7]">
                {objective.description}
              </p>
            ) : null}

            <MeasureList measures={objective.measures} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function MeasureList({ measures }: { measures: GoalMeasure[] }) {
  if (measures.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#a8afb7]/70">
        Measures
      </p>
      {measures.slice(0, 4).map((measure) => (
        <div
          key={measure.id}
          className="rounded-md bg-[#343538] px-3 py-2 text-sm text-[#dadee4]"
        >
          <p className="line-clamp-2 leading-snug">{measure.name}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#a8afb7]">
            <span>Target: {formatMeasureValue(measure.target_value, measure.target_year)}</span>
            <span>Actual: {formatMeasureValue(measure.actual_value, measure.actual_year)}</span>
          </div>
        </div>
      ))}
      {measures.length > 4 ? (
        <p className="text-xs text-[#a8afb7]">
          +{formatCount(measures.length - 4)} more
        </p>
      ) : null}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#a8afb7]/70">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-medium tracking-[-0.02em] text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[#a8afb7]">{description}</p>
    </div>
  );
}

function MetricBadge({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-8 rounded-full border-0 bg-[#343538] px-3 text-xs font-medium text-[#a8afb7]/80",
        className,
      )}
    >
      {icon}
      {children}
    </Badge>
  );
}

async function getGoalOrNull(goalId: number) {
  try {
    return await getGoal(goalId);
  } catch {
    return null;
  }
}

async function getDocumentOrNull(documentId: number) {
  try {
    return await getDocument(documentId);
  } catch {
    return null;
  }
}

function parseGoalId(value: string) {
  const goalId = Number(value);
  return Number.isInteger(goalId) && goalId > 0 ? goalId : null;
}

function cleanText(value: string | null | undefined, fallback: string) {
  return value?.replace(/\s+/g, " ").trim() || fallback;
}

function formatFiscalYear(value: string) {
  return value.replace(/^FY(?=\d)/i, "FY ");
}

function formatMeasureValue(value: string | null, year: string | null) {
  const formattedValue = formatValue(value);
  return year ? `${formattedValue} (${year})` : formattedValue;
}
