import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  BookOpen,
  ExternalLink,
  FileText,
  Gauge,
  Target,
} from "lucide-react";

import { GoalNetworkMap } from "@/components/goals/goal-network-map";
import { Badge } from "@/components/ui/badge";
import { getDocument, getGoal, type GoalMeasure, type GoalSummary } from "@/lib/apex";
import {
  getGoalRelationshipModel,
  type GoalRelationshipModel,
} from "@/lib/goal-relationships";
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
  const measures = goal.objectives.flatMap((objective) => objective.measures);
  const sourceTitle = cleanText(
    document?.title ?? goal.document_title ?? goal.source,
    "Source document",
  );
  const fiscalYear = cleanText(document?.fiscal_year ?? goal.fiscal_year, "");

  return (
    <main className="min-h-screen bg-[#18181b] text-white">
      <section className="mx-auto grid max-w-[1720px] grid-cols-[360px_minmax(0,1fr)] gap-x-20 px-7 py-8 max-[1120px]:block max-[640px]:px-4">
        <GoalSidebar
          goal={goal}
          fiscalYear={fiscalYear}
          measureCount={measures.length}
          connectionCount={network.relatedGoals.length}
          pdfUrl={document?.pdf_url}
        />

        <div className="min-w-0 pb-24 max-[1120px]:mt-10">
          <section
            id="connections"
            aria-label="Goal connections force-directed chart"
            className="h-[560px] max-[760px]:h-[500px]"
          >
            <GoalNetworkMap model={network} />
          </section>

          <div className="mx-auto mt-16 max-w-[1120px] space-y-16">
            <ObjectivesList goal={goal} />

            <ConnectionsList network={network} />

            <SourcePanel
              sourceTitle={sourceTitle}
              pdfUrl={document?.pdf_url}
              sourcePage={goal.source_page}
              sourceConfidence={goal.source_confidence}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function GoalSidebar({
  goal,
  fiscalYear,
  measureCount,
  connectionCount,
  pdfUrl,
}: {
  goal: GoalSummary;
  fiscalYear: string;
  measureCount: number;
  connectionCount: number;
  pdfUrl: string | undefined;
}) {
  const summary = cleanText(goal.summary ?? goal.description ?? goal.subtitle, "");

  return (
    <aside className="sticky top-24 self-start pr-1 max-[1120px]:static">
      <div className="max-w-[360px] max-[1120px]:max-w-[680px]">
        <Badge className="h-6 rounded-full bg-white px-3 text-xs font-medium text-[#18181b] hover:bg-white">
          <span className="mr-1.5 size-1.5 rounded-full bg-[#18181b]" />
          Goal
        </Badge>

        <h1 className="mt-5 text-[clamp(3.2rem,5vw,5.8rem)] font-medium leading-[0.93] tracking-[-0.055em] text-white">
          {cleanText(goal.title, "Untitled goal")}
        </h1>

        <p className="mt-6 text-lg leading-8 text-[#a8afb7]">
          {cleanText(goal.agency_name, "Unknown agency")}
        </p>

        {summary ? (
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#a8afb7]/85">
            {summary}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-1.5">
          {fiscalYear ? (
            <MetricBadge icon={<FileText className="size-3" />}>
              {formatFiscalYear(fiscalYear)}
            </MetricBadge>
          ) : null}
          <MetricBadge icon={<Target className="size-3" />}>
            {formatCount(goal.objectives.length)}{" "}
            {goal.objectives.length === 1 ? "objective" : "objectives"}
          </MetricBadge>
          {measureCount > 0 ? (
            <MetricBadge icon={<Gauge className="size-3" />}>
              {formatCount(measureCount)}{" "}
              {measureCount === 1 ? "measure" : "measures"}
            </MetricBadge>
          ) : null}
        </div>

        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-9 inline-flex h-12 items-center gap-2 rounded-md border border-[#dadee4]/60 px-4 text-sm font-medium text-[#dadee4] transition hover:border-white hover:text-white"
          >
            <BookOpen className="size-4" />
            Source PDF
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}

        <nav className="mt-12 grid gap-3" aria-label="Goal profile sections">
          <SidebarAnchor href="#objectives" label="Objectives" count={goal.objectives.length} />
          <SidebarAnchor href="#connections" label="Connections" count={connectionCount} />
        </nav>
      </div>
    </aside>
  );
}

function SidebarAnchor({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="flex h-[58px] items-center justify-between rounded-md border border-white/12 bg-[#18181b] px-4 text-base font-medium text-[#dadee4] transition hover:border-white/24 hover:bg-[#27272a]"
    >
      <span>{label}</span>
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#343538] text-sm text-[#a8afb7]">
        {formatCount(count)}
      </span>
    </Link>
  );
}

function ObjectivesList({ goal }: { goal: GoalSummary }) {
  return (
    <section id="objectives" className="scroll-mt-24">
      <SectionHeading
        title="Objectives"
        description="The goal structure captured from the source plan."
      />

      <ol className="mt-7 grid gap-3">
        {goal.objectives.map((objective, index) => (
          <li key={objective.id} className="rounded-xl bg-[#27272a] p-5">
            <div className="flex items-center justify-between gap-3 text-xs text-[#a8afb7]">
              <span>
                Objective {cleanText(objective.number, String(index + 1))}
              </span>
              {objective.source_page ? <span>Page {objective.source_page}</span> : null}
            </div>

            <h3 className="mt-4 max-w-[820px] text-xl font-medium leading-snug tracking-[-0.02em] text-white">
              {cleanText(objective.title, "Untitled objective")}
            </h3>

            {objective.description ? (
              <p className="mt-3 max-w-[820px] text-sm leading-6 text-[#a8afb7]">
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

function ConnectionsList({ network }: { network: GoalRelationshipModel }) {
  if (network.relatedGoals.length === 0) {
    return null;
  }

  return (
    <section className="scroll-mt-24">
      <SectionHeading
        title="Connections"
        description="Related goals ranked by shared priority and semantic proximity."
      />

      <div className="mt-7 grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
        {network.relatedGoals.map((relatedGoal) => (
          <Link
            key={relatedGoal.goalId}
            href={`/goals/${relatedGoal.goalId}`}
            className="group rounded-xl bg-[#27272a] p-5 transition hover:bg-[#303136]"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="truncate text-xs text-[#a8afb7]">
                  {relatedGoal.agencyName}
                </p>
                <h3 className="mt-3 line-clamp-3 text-lg font-medium leading-snug tracking-[-0.02em] text-white">
                  {relatedGoal.title}
                </h3>
              </div>
              <span className="inline-flex h-8 shrink-0 items-center rounded-full bg-[#343538] px-2.5 text-xs font-medium text-[#59A9FF]">
                {Math.round(relatedGoal.strength * 100)}%
              </span>
            </div>

            {relatedGoal.reasons.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {relatedGoal.reasons.slice(0, 2).map((reason) => (
                  <span
                    key={reason}
                    className="max-w-full truncate rounded-full bg-[#343538] px-2.5 py-1 text-xs font-medium text-[#a8afb7]/80"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
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
    <section className="rounded-xl bg-[#27272a] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#a8afb7]/70">
            <BookOpen className="size-3.5" />
            Source
          </div>
          <h2 className="line-clamp-2 text-lg font-medium leading-snug text-white">
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

function MeasureList({ measures }: { measures: GoalMeasure[] }) {
  if (measures.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 space-y-2">
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
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <h2 className="text-[clamp(2.6rem,4vw,4.2rem)] font-medium leading-none tracking-[-0.055em] text-white">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-[520px] text-sm leading-6 text-[#a8afb7]">
        {description}
      </p>
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
