import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  BookOpen,
  ExternalLink,
  FileText,
  Gauge,
  Network,
  Target,
} from "lucide-react";

import { AgencyAvatar } from "@/components/catalog/agency-avatar";
import { GoalNetworkMap } from "@/components/goals/goal-network-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDocument, getGoal, type GoalMeasure, type GoalSummary } from "@/lib/apex";
import {
  getGoalRelationshipModel,
  type GoalRelationshipModel,
  type RelatedGoal,
} from "@/lib/goal-relationships";
import { cn, formatCount, formatTagLabel, formatValue } from "@/lib/utils";

export const revalidate = 1800;

type GoalPageProps = {
  params: Promise<{
    goalId: string;
  }>;
};

type SourceModel = {
  title: string;
  pdfUrl: string | undefined;
  page: number | null;
  confidence: string | null;
  fiscalYear: string;
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
  const source: SourceModel = {
    title: cleanText(
      document?.title ?? goal.document_title ?? goal.source,
      "Source document",
    ),
    pdfUrl: document?.pdf_url,
    page: goal.source_page,
    confidence: goal.source_confidence,
    fiscalYear: cleanText(document?.fiscal_year ?? goal.fiscal_year, ""),
  };
  const owner = {
    id: String(goal.agency_id),
    name: cleanText(goal.agency_name, "Unknown agency"),
    abbreviation: cleanText(goal.agency_abbreviation, "US"),
    count: 0,
    cfo: false,
  };

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-[1680px] grid-cols-[minmax(280px,360px)_minmax(0,1fr)] gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:gap-8 max-[1080px]:block">
        <GoalRail
          goal={goal}
          owner={owner}
          measureCount={measures.length}
          connectionCount={network.relatedGoals.length}
          source={source}
        />

        <div className="flex min-w-0 flex-col gap-6 max-[1080px]:mt-6">
          <RelationshipCard network={network} />

          <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-6 max-[1180px]:grid-cols-1">
            <DetailsCard goal={goal} measures={measures} source={source} />
            <ConnectionsCard relatedGoals={network.relatedGoals} />
          </div>
        </div>
      </div>
    </main>
  );
}

function GoalRail({
  goal,
  owner,
  measureCount,
  connectionCount,
  source,
}: {
  goal: GoalSummary;
  owner: {
    id: string;
    name: string;
    abbreviation: string;
    count: number;
    cfo: boolean;
  };
  measureCount: number;
  connectionCount: number;
  source: SourceModel;
}) {
  const summary = cleanText(goal.summary ?? goal.description ?? goal.subtitle, "");

  return (
    <aside className="sticky top-24 flex flex-col gap-4 self-start max-[1080px]:static">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <Badge>
              <span className="size-1.5 rounded-full bg-current" />
              Goal
            </Badge>
            <AgencyAvatar owner={owner} size="lg" />
          </div>
          <CardTitle>
            <h1 className="mt-4 text-[clamp(2.25rem,4vw,3.75rem)] font-medium leading-[0.96] tracking-[-0.06em]">
              {cleanText(goal.title, "Untitled goal")}
            </h1>
          </CardTitle>
          <CardDescription className="text-base leading-6">
            {owner.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {summary ? (
            <p className="line-clamp-5 text-sm leading-6 text-muted-foreground">
              {summary}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {source.fiscalYear ? (
              <MetricBadge icon={<FileText />}>
                {formatFiscalYear(source.fiscalYear)}
              </MetricBadge>
            ) : null}
            <MetricBadge icon={<Target />}>
              {formatCount(goal.objectives.length)}{" "}
              {goal.objectives.length === 1 ? "objective" : "objectives"}
            </MetricBadge>
            {measureCount > 0 ? (
              <MetricBadge icon={<Gauge />}>
                {formatCount(measureCount)}{" "}
                {measureCount === 1 ? "measure" : "measures"}
              </MetricBadge>
            ) : null}
          </div>

          <Separator />

          <div className="grid gap-2">
            <Button asChild variant="outline" size="lg" className="justify-start">
              <Link href="#objectives">
                <Target data-icon="inline-start" />
                Objectives
                <Badge variant="secondary" className="ml-auto">
                  {formatCount(goal.objectives.length)}
                </Badge>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="justify-start">
              <Link href="#connections">
                <Network data-icon="inline-start" />
                Connections
                <Badge variant="secondary" className="ml-auto">
                  {formatCount(connectionCount)}
                </Badge>
              </Link>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="justify-between gap-3">
          {source.pdfUrl ? (
            <Button asChild size="sm" className="rounded-full">
              <a href={source.pdfUrl} target="_blank" rel="noreferrer">
                <BookOpen data-icon="inline-start" />
                Source PDF
              </a>
            </Button>
          ) : (
            <Button size="sm" disabled className="rounded-full">
              <BookOpen data-icon="inline-start" />
              Source PDF
            </Button>
          )}
          {source.page ? (
            <span className="text-xs text-muted-foreground">Page {source.page}</span>
          ) : null}
        </CardFooter>
      </Card>
    </aside>
  );
}

function RelationshipCard({ network }: { network: GoalRelationshipModel }) {
  return (
    <Card id="connections" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>Relationship map</CardTitle>
        <CardDescription>
          A focused ego network of goals that share priorities, language, or semantic proximity.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">{formatCount(network.relatedGoals.length)} connections</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="h-[520px] p-0 max-[760px]:h-[440px]">
        <GoalNetworkMap model={network} />
      </CardContent>
      <CardFooter className="justify-between gap-4 text-xs text-muted-foreground">
        <span>Force layout</span>
        <span>Edge width indicates relative strength</span>
      </CardFooter>
    </Card>
  );
}

function DetailsCard({
  goal,
  measures,
  source,
}: {
  goal: GoalSummary;
  measures: GoalMeasure[];
  source: SourceModel;
}) {
  return (
    <Tabs defaultValue="objectives">
      <Card id="objectives" className="scroll-mt-24">
        <CardHeader>
          <CardTitle>Goal detail</CardTitle>
          <CardDescription>
            Objectives, measures, and source evidence from the strategic plan.
          </CardDescription>
          <CardAction>
            <TabsList variant="line">
              <TabsTrigger value="objectives">Objectives</TabsTrigger>
              <TabsTrigger value="measures">Measures</TabsTrigger>
              <TabsTrigger value="source">Source</TabsTrigger>
            </TabsList>
          </CardAction>
        </CardHeader>

        <CardContent>
          <TabsContent value="objectives" className="mt-0">
            <ObjectiveStack objectives={goal.objectives} />
          </TabsContent>
          <TabsContent value="measures" className="mt-0">
            <MeasureStack measures={measures} />
          </TabsContent>
          <TabsContent value="source" className="mt-0">
            <SourceDetail source={source} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}

function ObjectiveStack({ objectives }: { objectives: GoalSummary["objectives"] }) {
  return (
    <ol className="flex flex-col gap-3">
      {objectives.map((objective, index) => (
        <li key={objective.id}>
          <Card size="sm" className="bg-muted/40">
            <CardHeader>
              <CardTitle>
                <span className="text-sm text-muted-foreground">
                  Objective {cleanText(objective.number, String(index + 1))}
                </span>
              </CardTitle>
              {objective.source_page ? (
                <CardAction>
                  <Badge variant="outline">Page {objective.source_page}</Badge>
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent>
              <p className="max-w-[900px] text-base leading-6">
                {cleanText(objective.title, "Untitled objective")}
              </p>
              {objective.description ? (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {objective.description}
                </p>
              ) : null}
              {objective.measures.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <MetricBadge icon={<Gauge />}>
                    {formatCount(objective.measures.length)}{" "}
                    {objective.measures.length === 1 ? "measure" : "measures"}
                  </MetricBadge>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </li>
      ))}
    </ol>
  );
}

function MeasureStack({ measures }: { measures: GoalMeasure[] }) {
  if (measures.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No measures are available for this goal yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {measures.map((measure) => (
        <Card key={measure.id} size="sm" className="bg-muted/40">
          <CardHeader>
            <CardTitle className="line-clamp-2">{measure.name}</CardTitle>
            {measure.trend ? (
              <CardAction>
                <Badge variant="secondary">{formatTagLabel(measure.trend)}</Badge>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 max-[720px]:grid-cols-1">
              <MeasureValue label="Baseline" value={measure.baseline_value} year={measure.baseline_year} />
              <MeasureValue label="Target" value={measure.target_value} year={measure.target_year} />
              <MeasureValue label="Actual" value={measure.actual_value} year={measure.actual_year} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MeasureValue({
  label,
  value,
  year,
}: {
  label: string;
  value: string | null;
  year: string | null;
}) {
  return (
    <div className="rounded-md bg-background/55 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm">{formatMeasureValue(value, year)}</p>
    </div>
  );
}

function SourceDetail({ source }: { source: SourceModel }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Source document
        </p>
        <h2 className="mt-2 max-w-[820px] text-xl font-medium leading-snug">
          {source.title}
        </h2>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {source.fiscalYear ? (
          <MetricBadge icon={<FileText />}>
            {formatFiscalYear(source.fiscalYear)}
          </MetricBadge>
        ) : null}
        {source.page ? <MetricBadge>Page {source.page}</MetricBadge> : null}
        {source.confidence ? (
          <MetricBadge>{formatTagLabel(source.confidence)} confidence</MetricBadge>
        ) : null}
      </div>

      {source.pdfUrl ? (
        <Button asChild variant="outline" className="w-fit">
          <a href={source.pdfUrl} target="_blank" rel="noreferrer">
            Open PDF
            <ExternalLink data-icon="inline-end" />
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function ConnectionsCard({ relatedGoals }: { relatedGoals: RelatedGoal[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Closest goals</CardTitle>
        <CardDescription>Ranked relationship signals.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {relatedGoals.length > 0 ? (
          relatedGoals.slice(0, 7).map((relatedGoal) => (
            <ConnectionLink key={relatedGoal.goalId} relatedGoal={relatedGoal} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No connections yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConnectionLink({ relatedGoal }: { relatedGoal: RelatedGoal }) {
  return (
    <Button
      asChild
      variant="ghost"
      className="h-auto justify-start rounded-lg p-3 text-left"
    >
      <Link href={`/goals/${relatedGoal.goalId}`}>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-xs text-muted-foreground">
            {relatedGoal.agencyName}
          </span>
          <span className="line-clamp-2 whitespace-normal text-sm font-medium leading-snug">
            {relatedGoal.title}
          </span>
          {relatedGoal.reasons[0] ? (
            <span className="truncate text-xs text-muted-foreground">
              {relatedGoal.reasons[0]}
            </span>
          ) : null}
        </span>
        <Badge variant="secondary" className="ml-auto shrink-0">
          {Math.round(relatedGoal.strength * 100)}%
        </Badge>
      </Link>
    </Button>
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
      className={cn("gap-1.5 rounded-full", className)}
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
