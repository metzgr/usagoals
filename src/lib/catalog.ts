import {
  searchCorpus,
  type AgencySummary,
  type DocumentSummary,
  type GoalMeasure,
  type GoalSummary,
  type SearchResult,
  type ThemeSummary,
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
  sourceTitle: string;
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

export const goalCatalogViews = [
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "agencies", label: "Agencies" },
] as const;

export type GoalCatalogView = (typeof goalCatalogViews)[number]["value"];

export type GoalCatalogState = {
  q: string;
  view: GoalCatalogView;
};

export type GoalCatalogModel = {
  state: GoalCatalogState;
  totalGoals: number;
  totalMatches: number;
  visibleItems: CatalogItem[];
  agencyCount: number;
};

type OverviewData = {
  agencies: AgencySummary[];
  documents: DocumentSummary[];
  goals: GoalSummary[];
  themes: ThemeSummary[];
};

const DEFAULT_OWNER = "all";
const DEFAULT_KIND: CatalogKind = "all";
const DEFAULT_GOAL_VIEW: GoalCatalogView = "newest";
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
  basePath = "/",
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
  return query ? `${basePath}?${query}` : basePath;
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

export async function getGoalCatalogModel(
  overview: OverviewData,
  params: {
    q?: string;
    view?: string;
  },
): Promise<GoalCatalogModel> {
  const state = parseGoalCatalogState(params);
  const owners = buildOwners(overview.agencies);
  const ownerMap = new Map(owners.map((owner) => [owner.id, owner]));
  const goalItems = buildCatalogItems(overview, ownerMap).filter(
    (item) => item.kind === "goal",
  );
  const searched = await searchGoalItems(goalItems, state.q);
  const visibleItems = state.q
    ? searched.slice(0, VISIBLE_LIMIT)
    : sortGoalItems(searched, state).slice(0, VISIBLE_LIMIT);

  return {
    state,
    totalGoals: goalItems.length,
    totalMatches: searched.length,
    visibleItems,
    agencyCount: owners.length,
  };
}

function parseGoalCatalogState(params: {
  q?: string;
  view?: string;
}): GoalCatalogState {
  const q = compact(params.q);
  const view = goalCatalogViews.some((option) => option.value === params.view)
    ? (params.view as GoalCatalogView)
    : DEFAULT_GOAL_VIEW;

  return { q, view };
}

function sortGoalItems(items: CatalogItem[], state: GoalCatalogState) {
  let sorted: CatalogItem[];

  if (state.view === "trending") {
    sorted = rankItems(items, "");
  } else if (state.view === "agencies") {
    sorted = [...items].sort(
      (a, b) =>
        a.owner.name.localeCompare(b.owner.name) ||
        a.title.localeCompare(b.title),
    );
  } else {
    sorted = [...items].sort(
      (a, b) => getItemNumericId(b) - getItemNumericId(a),
    );
  }

  const tokens = getSearchTokens(state.q);

  if (tokens.length === 0) {
    return sorted;
  }

  return sorted.sort(
    (a, b) => getGoalSearchScore(b, tokens) - getGoalSearchScore(a, tokens),
  );
}

function getItemNumericId(item: CatalogItem) {
  return Number(item.id.split(":").at(1)) || 0;
}

async function searchGoalItems(items: CatalogItem[], query: string) {
  const tokens = getSearchTokens(query);

  if (tokens.length === 0) {
    return items;
  }

  const apiBoosts = await getGoalSearchBoosts(items, query);
  const scoredItems = items
    .map((item) => ({
      item,
      score: getGoalSearchScore(item, tokens, query) + (apiBoosts.get(item.id) ?? 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.item.weight - left.item.weight ||
        left.item.title.localeCompare(right.item.title),
    );

  return scoredItems.map((entry) => entry.item);
}

async function getGoalSearchBoosts(items: CatalogItem[], query: string) {
  const boosts = new Map<string, number>();

  try {
    const response = await searchCorpus({ query, limit: 80 });
    const titleToItemId = new Map(
      items.map((item) => [normalizeSearchText(item.title), item.id]),
    );
    const itemIds = new Set(items.map((item) => item.id));

    for (const [index, result] of response.results.entries()) {
      const itemId = getSearchResultGoalItemId(result, titleToItemId, itemIds);

      if (!itemId) {
        continue;
      }

      const rankBoost = Math.max(45, 240 - index * 5);
      boosts.set(itemId, Math.max(boosts.get(itemId) ?? 0, rankBoost));
    }
  } catch {
    return boosts;
  }

  return boosts;
}

function getSearchResultGoalItemId(
  result: SearchResult,
  titleToItemId: Map<string, string>,
  itemIds: Set<string>,
) {
  if (result.type === "goal") {
    const goalItemId = `goal:${result.id}`;

    if (itemIds.has(goalItemId)) {
      return goalItemId;
    }
  }

  const parentGoalTitle = normalizeSearchText(result.parent_goal ?? "");

  if (parentGoalTitle) {
    const parentGoalItemId = titleToItemId.get(parentGoalTitle);

    if (parentGoalItemId) {
      return parentGoalItemId;
    }
  }

  const resultTitle = normalizeSearchText(result.title ?? result.name ?? "");

  if (resultTitle) {
    return titleToItemId.get(resultTitle) ?? null;
  }

  return null;
}

function getGoalSearchScore(item: CatalogItem, tokens: string[], query = "") {
  const queryText = normalizeSearchText(query);
  const title = normalizeSearchText(item.title);
  const summary = normalizeSearchText(item.summary);
  const ownerName = normalizeSearchText(item.owner.name);
  const ownerAbbreviation = normalizeSearchText(item.owner.abbreviation);
  const sourceTitle = normalizeSearchText(item.sourceTitle);
  const searchText = normalizeSearchText(item.searchText);
  let matchedTokens = 0;
  let score = 0;

  if (queryText) {
    if (title === queryText) {
      score += 240;
    } else if (title.startsWith(queryText)) {
      score += 175;
    } else if (title.includes(queryText)) {
      score += 130;
    } else if (searchText.includes(queryText)) {
      score += 80;
    }
  }

  for (const token of tokens) {
    const tokenScore =
      scoreTokenAgainstField(token, title, 96, 76, 54, 24) +
      scoreTokenAgainstField(token, ownerAbbreviation, 88, 62, 42, 0) +
      scoreTokenAgainstField(token, ownerName, 56, 38, 28, 10) +
      scoreTokenAgainstField(token, sourceTitle, 38, 28, 18, 8) +
      scoreTokenAgainstField(token, summary, 30, 22, 14, 6) +
      scoreTokenAgainstField(token, searchText, 18, 12, 8, 4);

    if (tokenScore > 0) {
      matchedTokens += 1;
      score += tokenScore;
    }
  }

  if (matchedTokens === tokens.length) {
    score += 70;
  } else if (matchedTokens > 0) {
    score += matchedTokens * 10;
  }

  return score;
}

function scoreTokenAgainstField(
  token: string,
  field: string,
  exactScore: number,
  prefixScore: number,
  includesScore: number,
  softScore: number,
) {
  if (!field) {
    return 0;
  }

  const words = field.split(/\s+/).filter(Boolean);

  if (words.includes(token) || field === token) {
    return exactScore;
  }

  if (words.some((word) => word.startsWith(token)) || field.startsWith(token)) {
    return prefixScore;
  }

  if (field.includes(token)) {
    return includesScore;
  }

  if (
    softScore > 0 &&
    token.length >= 4 &&
    words.some((word) => word.length >= 4 && word.startsWith(token.slice(0, 4)))
  ) {
    return softScore;
  }

  return 0;
}

function getSearchTokens(query: string) {
  return normalizeSearchText(query).split(/\s+/).filter(Boolean);
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
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
  const documentMap = new Map(
    overview.documents.map((document) => [document.id, document]),
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
        sourceTitle: owner.name,
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
        sourceTitle: displayTitle(compact(document.title, "Untitled plan")),
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
    const sourceDocument = documentMap.get(goal.document_id);
    const sourceTitle = compact(
      sourceDocument?.title ?? goal.source,
      `${owner.abbreviation} strategic plan`,
    );

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
        sourceTitle,
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
        sourceTitle: "Cross-agency themes",
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
    sourceTitle: displayTitle(compact(goal.source, goal.title)),
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
      item.sourceTitle,
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
