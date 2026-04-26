import type {
  AgencySummary,
  DocumentSummary,
  GoalMeasure,
  GoalSummary,
  ThemeSummary,
} from "@/lib/apex";
import { formatCount, formatTagLabel } from "@/lib/utils";

export const catalogKindOptions = [
  { value: "all", label: "All" },
  { value: "goal", label: "Goals" },
  { value: "plan", label: "Plans" },
  { value: "indicator", label: "Indicators" },
  { value: "theme", label: "Themes" },
  { value: "owner", label: "Owners" },
] as const;

export type CatalogKind = (typeof catalogKindOptions)[number]["value"];
export type CatalogItemKind = Exclude<CatalogKind, "all">;

export type CatalogState = {
  q: string;
  kind: CatalogKind;
  owner: string;
};

export type CatalogMetric = {
  label: string;
  value: string;
};

export type CatalogOwner = {
  id: string;
  name: string;
  abbreviation: string;
  count: number;
  cfo: boolean;
};

export type CatalogItem = {
  id: string;
  kind: CatalogItemKind;
  title: string;
  summary: string;
  owner: CatalogOwner;
  sourceLabel: string;
  timeLabel: string;
  tags: string[];
  metrics: CatalogMetric[];
  searchText: string;
  weight: number;
};

export type CatalogModel = {
  state: CatalogState;
  owners: CatalogOwner[];
  activeOwner: CatalogOwner | null;
  totalItems: number;
  totalMatches: number;
  visibleItems: CatalogItem[];
  kindCounts: Record<CatalogKind, number>;
};

type OverviewData = {
  agencies: AgencySummary[];
  documents: DocumentSummary[];
  goals: GoalSummary[];
  themes: ThemeSummary[];
};

const DEFAULT_OWNER = "all";
const DEFAULT_KIND: CatalogKind = "all";
const VISIBLE_LIMIT = 60;

export function parseCatalogState(params: {
  q?: string;
  kind?: string;
  owner?: string;
}): CatalogState {
  const q = compact(params.q);
  const kind = catalogKindOptions.some((option) => option.value === params.kind)
    ? (params.kind as CatalogKind)
    : DEFAULT_KIND;
  const owner = compact(params.owner) || DEFAULT_OWNER;

  return { q, kind, owner };
}

export function buildCatalogHref(
  state: CatalogState,
  patch: Partial<CatalogState>,
) {
  const next = { ...state, ...patch };
  const params = new URLSearchParams();

  if (next.q) {
    params.set("q", next.q);
  }

  if (next.kind !== DEFAULT_KIND) {
    params.set("kind", next.kind);
  }

  if (next.owner !== DEFAULT_OWNER) {
    params.set("owner", next.owner);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function getCatalogModel(
  overview: OverviewData,
  params: {
    q?: string;
    kind?: string;
    owner?: string;
  },
): CatalogModel {
  const state = parseCatalogState(params);
  const owners = buildOwners(overview.agencies);
  const ownerMap = new Map(owners.map((owner) => [owner.id, owner]));
  const items = buildCatalogItems(overview, ownerMap);
  const activeOwner =
    state.owner === DEFAULT_OWNER
      ? null
      : owners.find((owner) => owner.id === state.owner) ?? null;

  const ownerScoped =
    state.owner === DEFAULT_OWNER
      ? items
      : items.filter((item) => item.owner.id === state.owner);
  const searched = filterByQuery(ownerScoped, state.q);
  const kindCounts = getKindCounts(searched);
  const kindScoped =
    state.kind === DEFAULT_KIND
      ? searched
      : searched.filter((item) => item.kind === state.kind);
  const visibleItems = rankItems(kindScoped, state.q).slice(0, VISIBLE_LIMIT);

  return {
    state,
    owners,
    activeOwner,
    totalItems: items.length,
    totalMatches: kindScoped.length,
    visibleItems,
    kindCounts,
  };
}

function buildOwners(agencies: AgencySummary[]): CatalogOwner[] {
  return agencies
    .map((agency) => ({
      id: String(agency.id),
      name: compact(agency.name, "Unknown agency"),
      abbreviation: compact(agency.abbreviation, initials(agency.name)),
      count: agency.goal_count,
      cfo: agency.is_cfo_act_agency,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function buildCatalogItems(
  overview: OverviewData,
  ownerMap: Map<string, CatalogOwner>,
) {
  const items: CatalogItem[] = [];
  const documentCountByAgency = countBy(overview.documents, (document) =>
    String(document.agency_id),
  );
  const goalCountByAgency = countBy(overview.goals, (goal) =>
    String(goal.agency_id),
  );

  for (const agency of overview.agencies) {
    const owner = ownerMap.get(String(agency.id));

    if (!owner) {
      continue;
    }

    items.push(
      withSearchText({
        id: `owner:${agency.id}`,
        kind: "owner",
        title: owner.name,
        summary: `${formatCount(goalCountByAgency.get(owner.id) ?? owner.count)} goals`,
        owner,
        sourceLabel: "Owner",
        timeLabel: agency.is_cfo_act_agency ? "CFO Act" : "Agency",
        tags: agency.is_cfo_act_agency ? ["CFO Act"] : [],
        metrics: [
          {
            label: "Goals",
            value: formatCount(goalCountByAgency.get(owner.id) ?? owner.count),
          },
          {
            label: "Plans",
            value: formatCount(documentCountByAgency.get(owner.id) ?? 0),
          },
        ],
        weight: owner.count * 10,
      }),
    );
  }

  for (const document of overview.documents) {
    const owner = ownerMap.get(String(document.agency_id));

    if (!owner) {
      continue;
    }

    const year = Number(document.publication_year);

    items.push(
      withSearchText({
        id: `plan:${document.id}`,
        kind: "plan",
        title: displayTitle(compact(document.title, "Untitled plan")),
        summary: formatTagLabel(
          compact(document.plan_type || document.document_type, "Plan"),
        ),
        owner,
        sourceLabel: "Plan",
        timeLabel: Number.isFinite(year) ? String(year) : "Live",
        tags: compactList([document.plan_type, document.document_type]),
        metrics: [
          { label: "FY", value: compact(document.fiscal_year, "N/A") },
          { label: "Status", value: formatTagLabel(compact(document.qa_status, "Open")) },
        ],
        weight: Number.isFinite(year) ? year : 0,
      }),
    );
  }

  for (const goal of overview.goals) {
    const owner = ownerMap.get(String(goal.agency_id)) ?? {
      id: String(goal.agency_id),
      name: compact(goal.agency_name, "Unknown agency"),
      abbreviation: compact(goal.agency_abbreviation, "USA"),
      count: 0,
      cfo: false,
    };
    const measures = goal.objectives.flatMap((objective) => objective.measures);
    const tags = parseTags(goal.tags).slice(0, 3);

    items.push(
      withSearchText({
        id: `goal:${goal.id}`,
        kind: "goal",
        title: displayTitle(compact(goal.title, "Untitled goal")),
        summary: compact(
          goal.summary ?? goal.description ?? goal.subtitle,
          "Goal from the live strategy corpus",
        ),
        owner,
        sourceLabel: "Goal",
        timeLabel: compact(goal.number, "Live"),
        tags,
        metrics: [
          { label: "Objectives", value: formatCount(goal.objectives.length) },
          { label: "Measures", value: formatCount(measures.length) },
        ],
        weight: 1000 + goal.objectives.length * 8 + measures.length,
      }),
    );

    for (const objective of goal.objectives) {
      for (const measure of objective.measures) {
        items.push(buildIndicatorItem(measure, objective.title, goal, owner, tags));
      }
    }
  }

  for (const theme of overview.themes) {
    const crossAgencyOwner: CatalogOwner = {
      id: "cross-agency",
      name: "Cross-agency",
      abbreviation: "USA",
      count: theme.goal_count,
      cfo: false,
    };

    items.push(
      withSearchText({
        id: `theme:${theme.theme}`,
        kind: "theme",
        title: formatTagLabel(theme.theme),
        summary: `${formatCount(theme.goal_count)} goals`,
        owner: crossAgencyOwner,
        sourceLabel: "Theme",
        timeLabel: `${formatCount(theme.agencies.length)} owners`,
        tags: theme.agencies.slice(0, 3),
        metrics: [
          { label: "Goals", value: formatCount(theme.goal_count) },
          { label: "Owners", value: formatCount(theme.agencies.length) },
        ],
        weight: theme.goal_count,
      }),
    );
  }

  return items;
}

function buildIndicatorItem(
  measure: GoalMeasure,
  objectiveTitle: string,
  goal: GoalSummary,
  owner: CatalogOwner,
  inheritedTags: string[],
): CatalogItem {
  const targetYear = Number(measure.target_year);
  const actualYear = Number(measure.actual_year);
  const latestYear = Number.isFinite(actualYear)
    ? actualYear
    : Number.isFinite(targetYear)
      ? targetYear
      : 0;

  return withSearchText({
    id: `indicator:${measure.id}`,
    kind: "indicator",
    title: displayTitle(compact(measure.name, "Untitled indicator")),
    summary: displayTitle(
      compact(objectiveTitle || goal.title, "Performance indicator"),
    ),
    owner,
    sourceLabel: "Indicator",
    timeLabel: latestYear ? String(latestYear) : "Live",
    tags: compactList([measure.unit, measure.trend, ...inheritedTags]).slice(0, 3),
    metrics: [
      { label: "Target", value: compact(measure.target_value, "N/A") },
      { label: "Actual", value: compact(measure.actual_value, "N/A") },
    ],
    weight: 500 + latestYear,
  });
}

function withSearchText(item: Omit<CatalogItem, "searchText">): CatalogItem {
  return {
    ...item,
    searchText: [
      item.title,
      item.summary,
      item.owner.name,
      item.owner.abbreviation,
      item.sourceLabel,
      item.timeLabel,
      ...item.tags,
      ...item.metrics.flatMap((metric) => [metric.label, metric.value]),
    ]
      .join(" ")
      .toLowerCase(),
  };
}

function filterByQuery(items: CatalogItem[], query: string) {
  if (!query) {
    return items;
  }

  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) =>
    tokens.every((token) => item.searchText.includes(token)),
  );
}

function rankItems(items: CatalogItem[], query: string) {
  const normalizedQuery = query.toLowerCase();

  return [...items].sort((a, b) => {
    const aQueryBoost = normalizedQuery && a.title.toLowerCase().includes(normalizedQuery) ? 5000 : 0;
    const bQueryBoost = normalizedQuery && b.title.toLowerCase().includes(normalizedQuery) ? 5000 : 0;

    return b.weight + bQueryBoost - (a.weight + aQueryBoost);
  });
}

function getKindCounts(items: CatalogItem[]): Record<CatalogKind, number> {
  const counts = {
    all: items.length,
    goal: 0,
    plan: 0,
    indicator: 0,
    theme: 0,
    owner: 0,
  } satisfies Record<CatalogKind, number>;

  for (const item of items) {
    counts[item.kind] += 1;
  }

  return counts;
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function parseTags(value: string | null) {
  return compactList(value?.split(/[,;]/g) ?? []);
}

function compactList(values: Array<string | null | undefined>) {
  return values
    .map((value) => compact(value))
    .filter(Boolean)
    .map((value) => formatTagLabel(value))
    .filter((value, index, list) => list.indexOf(value) === index);
}

function compact(value: string | null | undefined, fallback = "") {
  return value?.replace(/\s+/g, " ").trim() || fallback;
}

function displayTitle(value: string) {
  const normalizedValue = value.replace(/([a-z])([A-Z])/g, "$1 $2");
  const letters = normalizedValue.replace(/[^a-zA-Z]/g, "");
  const isAllCaps = letters.length > 8 && letters === letters.toUpperCase();
  const uppercaseWordCount = normalizedValue
    .split(/\s+/)
    .filter((word) => {
      const lettersOnly = word.replace(/[^a-zA-Z]/g, "");
      return (
        lettersOnly.length > 3 &&
        lettersOnly === lettersOnly.toUpperCase()
      );
    }).length;

  if (!isAllCaps && uppercaseWordCount < 2) {
    return normalizedValue;
  }

  const lowerCaseWords = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "by",
    "for",
    "from",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
  ]);

  const acronyms = new Set([
    "DOL",
    "DOS",
    "DOT",
    "FEC",
    "FTC",
    "FY",
    "NLRB",
    "NSF",
    "OPM",
    "OSC",
    "OSHRC",
    "SBA",
    "SSS",
    "U.S.",
    "US",
    "USITC",
  ]);

  return normalizedValue
    .split(/\s+/)
    .map((originalWord, index) => {
      const word = originalWord.toLowerCase();
      const cleaned = word.replace(/[^a-z0-9]/g, "");
      const acronym = originalWord.replace(/[^a-zA-Z.]/g, "");
      const lettersOnly = originalWord.replace(/[^a-zA-Z]/g, "");

      if (index > 0 && lowerCaseWords.has(cleaned)) {
        return word;
      }

      if (acronyms.has(acronym)) {
        return originalWord;
      }

      if (lettersOnly.length <= 3 && lettersOnly === lettersOnly.toUpperCase()) {
        return originalWord;
      }

      return word.replace(/[a-z]/, (character) => character.toUpperCase());
    })
    .join(" ");
}

function initials(value: string) {
  const words = compact(value)
    .split(/\s+/)
    .filter((word) => !["the", "of", "and", "for"].includes(word.toLowerCase()));

  return words
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}
