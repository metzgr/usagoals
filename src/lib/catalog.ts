import type {
  AgencySummary,
  DocumentSummary,
  GoalSummary,
  ThemeSummary,
} from "@/lib/apex"
import { formatCount, formatTagLabel } from "@/lib/utils"

export type DiscoverKind =
  | "all"
  | "collections"
  | "agencies"
  | "plans"
  | "goals"
  | "indicators"

export type DiscoverStatus = "all" | "active" | "emerging" | "sparse"
export type DiscoverSort = "popular" | "newest" | "alphabetical"

export type DiscoverState = {
  q: string
  kind: DiscoverKind
  status: DiscoverStatus
  sort: DiscoverSort
  limit: number
}

export type CatalogItemKind = Exclude<DiscoverKind, "all">

export type CatalogMetric = {
  label: string
  value: string
}

export type CatalogItem = {
  id: string
  kind: CatalogItemKind
  title: string
  subtitle: string
  description: string
  href: string
  owner: string
  ownerAbbreviation: string
  ownerMeta: string
  yearLabel: string | null
  tags: string[]
  metrics: CatalogMetric[]
  status: Exclude<DiscoverStatus, "all">
  score: number
  sortYear: number
  searchableText: string
}

export type DiscoverModel = {
  state: DiscoverState
  totals: {
    items: number
    agencies: number
    plans: number
    goals: number
    indicators: number
    collections: number
  }
  kindCounts: Record<DiscoverKind, number>
  totalMatches: number
  visibleMatches: CatalogItem[]
  canShowMore: boolean
}

type OverviewData = {
  agencies: AgencySummary[]
  goals: GoalSummary[]
  documents: DocumentSummary[]
  themes: ThemeSummary[]
}

const DEFAULT_LIMIT = 18

const discoverKinds: DiscoverKind[] = [
  "all",
  "collections",
  "agencies",
  "plans",
  "goals",
  "indicators",
]

const discoverStatuses: DiscoverStatus[] = ["all", "active", "emerging", "sparse"]
const discoverSorts: DiscoverSort[] = ["popular", "newest", "alphabetical"]

export function parseDiscoverState(params: {
  q?: string
  kind?: string
  status?: string
  sort?: string
  limit?: string
}): DiscoverState {
  const kind = discoverKinds.includes(params.kind as DiscoverKind)
    ? (params.kind as DiscoverKind)
    : "all"
  const status = discoverStatuses.includes(params.status as DiscoverStatus)
    ? (params.status as DiscoverStatus)
    : "active"
  const sort = discoverSorts.includes(params.sort as DiscoverSort)
    ? (params.sort as DiscoverSort)
    : "popular"
  const parsedLimit = Number(params.limit)

  return {
    q: params.q?.trim() ?? "",
    kind,
    status,
    sort,
    limit:
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 96)
        : DEFAULT_LIMIT,
  }
}

export function buildDiscoverHref(
  state: DiscoverState,
  updates: Partial<DiscoverState> = {},
) {
  const next = {
    ...state,
    ...updates,
  }
  const searchParams = new URLSearchParams()

  if (next.q) {
    searchParams.set("q", next.q)
  }

  if (next.kind !== "all") {
    searchParams.set("kind", next.kind)
  }

  if (next.status !== "active") {
    searchParams.set("status", next.status)
  }

  if (next.sort !== "popular") {
    searchParams.set("sort", next.sort)
  }

  if (next.limit !== DEFAULT_LIMIT) {
    searchParams.set("limit", String(next.limit))
  }

  const query = searchParams.toString()
  return query ? `/?${query}` : "/"
}

function parseGoalTags(goal: GoalSummary) {
  return goal.tags
    ? goal.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim()
}

function buildSearchableText(values: Array<string | null | undefined>) {
  return normalizeText(values.filter(Boolean).join(" "))
}

function getAgencyLabel(agency: AgencySummary | undefined) {
  if (!agency) {
    return {
      owner: "Agency record unavailable",
      ownerAbbreviation: "N/A",
    }
  }

  return {
    owner: agency.name,
    ownerAbbreviation: agency.abbreviation,
  }
}

function classifyPlan(document: DocumentSummary, goalCount: number) {
  if (goalCount >= 3) {
    return "active" as const
  }

  if (goalCount >= 1) {
    return "emerging" as const
  }

  return "sparse" as const
}

function classifyGoal(goal: GoalSummary) {
  if (goal.objectives.length >= 3 && (goal.summary || goal.description)) {
    return "active" as const
  }

  if (goal.objectives.length >= 1) {
    return "emerging" as const
  }

  return "sparse" as const
}

function classifyIndicator(goal: GoalSummary, metric: GoalSummary["objectives"][number]["measures"][number]) {
  if (metric.actual_value || metric.target_value) {
    return "active" as const
  }

  if (metric.baseline_value) {
    return "emerging" as const
  }

  if (goal.objectives.length >= 1) {
    return "emerging" as const
  }

  return "sparse" as const
}

function classifyCollection(theme: ThemeSummary) {
  if (theme.goal_count >= 5) {
    return "active" as const
  }

  if (theme.goal_count >= 2) {
    return "emerging" as const
  }

  return "sparse" as const
}

function classifyAgency(agency: AgencySummary) {
  if (agency.goal_count >= 4) {
    return "active" as const
  }

  if (agency.goal_count >= 1) {
    return "emerging" as const
  }

  return "sparse" as const
}

function buildCatalogItems(overview: OverviewData) {
  const agencyById = new Map(overview.agencies.map((agency) => [agency.id, agency]))
  const documentById = new Map(overview.documents.map((document) => [document.id, document]))

  const planItems = overview.documents.map((document) => {
    const agency = agencyById.get(document.agency_id)
    const goalCount = agency?.goal_count ?? 0
    const owner = getAgencyLabel(agency)
    const status = classifyPlan(document, goalCount)

    return {
      id: `plan-${document.id}`,
      kind: "plans",
      title: document.title,
      subtitle: document.plan_type.replace(/_/g, " "),
      description: `${document.document_type.replace(/_/g, " ")} · ${document.qa_status.replace(/_/g, " ")}`,
      href: agency ? `/agencies/${agency.id}` : "/explore",
      owner: owner.owner,
      ownerAbbreviation: owner.ownerAbbreviation,
      ownerMeta: document.fiscal_year,
      yearLabel: String(document.publication_year),
      tags: [
        ...new Set(
          [document.document_type, document.plan_type].map((entry) =>
            formatTagLabel(entry),
          ),
        ),
      ],
      metrics: [
        { label: "Goals", value: formatCount(goalCount) },
        { label: "Status", value: formatTagLabel(document.qa_status) },
      ],
      status,
      score:
        goalCount * 10 + (document.qa_status === "complete" ? 8 : 4),
      sortYear: document.publication_year,
      searchableText: buildSearchableText([
        document.title,
        document.document_type,
        document.plan_type,
        document.fiscal_year,
        owner.owner,
      ]),
    } satisfies CatalogItem
  })

  const goalItems = overview.goals.map((goal) => {
    const agency = agencyById.get(goal.agency_id)
    const document = documentById.get(goal.document_id)
    const tags = parseGoalTags(goal)
    const citationCount = goal.summary_citations.length
    const owner = getAgencyLabel(agency)
    const status = classifyGoal(goal)

    return {
      id: `goal-${goal.id}`,
      kind: "goals",
      title: goal.title,
      subtitle: goal.number ? `Goal ${goal.number}` : "Goal",
      description:
        goal.summary ??
        goal.description ??
        "Structured goal extracted from the current APEX corpus.",
      href: `/goals/${goal.id}`,
      owner: owner.owner,
      ownerAbbreviation: owner.ownerAbbreviation,
      ownerMeta: document ? `From ${document.title}` : "Goal record",
      yearLabel: document ? String(document.publication_year) : null,
      tags: tags.slice(0, 3).map((tag) => formatTagLabel(tag)),
      metrics: [
        { label: "Objectives", value: formatCount(goal.objectives.length) },
        { label: "Citations", value: formatCount(citationCount) },
      ],
      status,
      score:
        goal.objectives.length * 12 +
        citationCount * 4 +
        (goal.summary ? 6 : 0) +
        tags.length * 3,
      sortYear: document?.publication_year ?? 0,
      searchableText: buildSearchableText([
        goal.title,
        goal.summary,
        goal.description,
        owner.owner,
        tags.join(" "),
      ]),
    } satisfies CatalogItem
  })

  const indicatorItems = overview.goals.flatMap((goal) => {
    const agency = agencyById.get(goal.agency_id)
    const owner = getAgencyLabel(agency)
    const document = documentById.get(goal.document_id)
    const tags = parseGoalTags(goal).slice(0, 2).map((tag) => formatTagLabel(tag))

    return goal.objectives.flatMap((objective) =>
      objective.measures.map((measure) => {
        const status = classifyIndicator(goal, measure)
        const trend = measure.trend ? formatTagLabel(measure.trend) : "No trend"

        return {
          id: `indicator-${measure.id}`,
          kind: "indicators",
          title: measure.name,
          subtitle: objective.title,
          description: `Tracked under ${goal.title}. ${measure.actual_value ? `Actual ${measure.actual_value}. ` : ""}${measure.target_value ? `Target ${measure.target_value}.` : trend}`,
          href: `/goals/${goal.id}`,
          owner: owner.owner,
          ownerAbbreviation: owner.ownerAbbreviation,
          ownerMeta: goal.number ? `Goal ${goal.number}` : "Goal indicator",
          yearLabel:
            measure.actual_year ?? measure.target_year ?? measure.baseline_year ?? null,
          tags,
          metrics: [
            {
              label: "Actual",
              value: measure.actual_value ?? "Pending",
            },
            {
              label: "Target",
              value: measure.target_value ?? trend,
            },
          ],
          status,
          score:
            (measure.actual_value ? 10 : 0) +
            (measure.target_value ? 6 : 0) +
            (measure.baseline_value ? 3 : 0) +
            goal.objectives.length,
          sortYear:
            Number(
              measure.actual_year ?? measure.target_year ?? measure.baseline_year ?? 0,
            ) || document?.publication_year || 0,
          searchableText: buildSearchableText([
            measure.name,
            objective.title,
            goal.title,
            owner.owner,
            tags.join(" "),
            trend,
          ]),
        } satisfies CatalogItem
      }),
    )
  })

  const collectionItems = overview.themes.map((theme) => {
    const status = classifyCollection(theme)

    return {
      id: `collection-${theme.theme}`,
      kind: "collections",
      title: formatTagLabel(theme.theme),
      subtitle: "Collection",
      description:
        theme.agencies.length > 0
          ? theme.agencies.slice(0, 4).join(" · ")
          : "No agencies are currently attached to this collection.",
      href: `/themes/${theme.theme}`,
      owner: `${formatCount(theme.agencies.length)} participating agencies`,
      ownerAbbreviation: "CL",
      ownerMeta: "Cross-agency issue cluster",
      yearLabel: null,
      tags: [],
      metrics: [
        { label: "Goals", value: formatCount(theme.goal_count) },
        { label: "Agencies", value: formatCount(theme.agencies.length) },
      ],
      status,
      score: theme.goal_count * 10 + theme.agencies.length * 6,
      sortYear: 0,
      searchableText: buildSearchableText([
        theme.theme,
        theme.agencies.join(" "),
      ]),
    } satisfies CatalogItem
  })

  const agencyItems = overview.agencies
    .filter((agency) => agency.goal_count > 0)
    .map((agency) => {
      const status = classifyAgency(agency)

      return {
        id: `agency-${agency.id}`,
        kind: "agencies",
        title: agency.name,
        subtitle: agency.abbreviation,
        description: agency.is_cfo_act_agency
          ? "CFO Act agency with active strategic coverage in the current corpus."
          : "Agency currently represented in the live APEX strategy corpus.",
        href: `/agencies/${agency.id}`,
        owner: agency.name,
        ownerAbbreviation: agency.abbreviation,
        ownerMeta: agency.is_cfo_act_agency ? "CFO Act agency" : "Agency profile",
        yearLabel: null,
        tags: agency.is_cfo_act_agency ? ["CFO Act"] : ["Agency"],
        metrics: [
          { label: "Goals", value: formatCount(agency.goal_count) },
          {
            label: "Coverage",
            value: agency.goal_count >= 4 ? "Deep" : "Focused",
          },
        ],
        status,
        score: agency.goal_count * 14 + (agency.is_cfo_act_agency ? 4 : 0),
        sortYear: 0,
        searchableText: buildSearchableText([
          agency.name,
          agency.abbreviation,
          agency.is_cfo_act_agency ? "cfo act" : "agency",
        ]),
      } satisfies CatalogItem
    })

  return [
    ...collectionItems,
    ...agencyItems,
    ...planItems,
    ...goalItems,
    ...indicatorItems,
  ]
}

export function getDiscoverModel(
  overview: OverviewData,
  params: {
    q?: string
    kind?: string
    status?: string
    sort?: string
    limit?: string
  },
): DiscoverModel {
  const state = parseDiscoverState(params)
  const catalog = buildCatalogItems(overview)
  const query = normalizeText(state.q)

  const scopedItems = catalog.filter((item) => {
    const statusMatches = state.status === "all" || item.status === state.status
    const queryMatches = !query || item.searchableText.includes(query)

    return statusMatches && queryMatches
  })

  const kindCounts = {
    all: scopedItems.length,
    collections: scopedItems.filter((item) => item.kind === "collections").length,
    agencies: scopedItems.filter((item) => item.kind === "agencies").length,
    plans: scopedItems.filter((item) => item.kind === "plans").length,
    goals: scopedItems.filter((item) => item.kind === "goals").length,
    indicators: scopedItems.filter((item) => item.kind === "indicators").length,
  } satisfies Record<DiscoverKind, number>

  const visiblePool =
    state.kind === "all"
      ? scopedItems
      : scopedItems.filter((item) => item.kind === state.kind)

  const sortedItems = [...visiblePool].sort((left, right) => {
    if (state.sort === "alphabetical") {
      return left.title.localeCompare(right.title)
    }

    if (state.sort === "newest") {
      return right.sortYear - left.sortYear || right.score - left.score
    }

    return right.score - left.score || right.sortYear - left.sortYear
  })

  return {
    state,
    totals: {
      items: catalog.length,
      agencies: overview.agencies.filter((agency) => agency.goal_count > 0).length,
      plans: overview.documents.length,
      goals: overview.goals.length,
      indicators: indicatorItemsCount(overview.goals),
      collections: overview.themes.length,
    },
    kindCounts,
    totalMatches: sortedItems.length,
    visibleMatches: sortedItems.slice(0, state.limit),
    canShowMore: sortedItems.length > state.limit,
  }
}

function indicatorItemsCount(goals: GoalSummary[]) {
  return goals.reduce((total, goal) => {
    return (
      total +
      goal.objectives.reduce((objectiveTotal, objective) => {
        return objectiveTotal + objective.measures.length
      }, 0)
    )
  }, 0)
}

export const discoverKindLabels: Record<DiscoverKind, string> = {
  all: "Everything",
  collections: "Collections",
  agencies: "Agencies",
  plans: "Plans",
  goals: "Goals",
  indicators: "Indicators",
}

export const discoverStatusLabels: Record<DiscoverStatus, string> = {
  all: "All records",
  active: "Active",
  emerging: "Emerging",
  sparse: "Sparse",
}

export const discoverSortLabels: Record<DiscoverSort, string> = {
  popular: "Popular",
  newest: "Newest",
  alphabetical: "A–Z",
}
