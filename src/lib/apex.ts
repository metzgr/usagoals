import { cache } from "react";

const DEFAULT_REVALIDATE_SECONDS = 60 * 30;
const apexOrigin = (process.env.APEX_API_BASE_URL ?? "https://apex.app.cloud.gov").replace(
  /\/$/,
  "",
);
const apexBaseUrl = apexOrigin.endsWith("/api") ? apexOrigin : `${apexOrigin}/api`;

type PaginatedResponse<T> = {
  data: T[];
  total?: number;
  limit?: number;
  offset?: number;
};

export type AgencySummary = {
  id: number;
  name: string;
  abbreviation: string;
  goal_count: number;
  is_cfo_act_agency: boolean;
};

export type GoalMeasure = {
  id: number;
  objective_id: number | null;
  name: string;
  unit: string | null;
  baseline_value: string | null;
  baseline_year: string | null;
  target_value: string | null;
  target_year: string | null;
  actual_value: string | null;
  actual_year: string | null;
  trend: string | null;
  source_page: number | null;
};

export type AgencyMention = {
  id: number;
  agency_id: number;
  mention_text: string;
  evidence_text: string | null;
  source_page: number | null;
  mention_role: string | null;
  relationship_summary: string | null;
  agency_name?: string;
  agency_abbreviation?: string | null;
};

export type SummaryCitation = {
  source: string;
  page: number | null;
  text: string;
};

export type GoalObjective = {
  id: number;
  goal_id: number;
  number: string | null;
  title: string;
  description: string | null;
  source_page: number | null;
  source_text?: string | null;
  source_highlight_text?: string | null;
  source_heading: string | null;
  source_match_method?: string | null;
  source_confidence: string | null;
  agency_mentions: AgencyMention[];
  stakeholder_relations: unknown[];
  measures: GoalMeasure[];
};

export type GoalSummary = {
  id: number;
  document_id: number;
  agency_id: number;
  agency_name?: string;
  agency_abbreviation?: string | null;
  number: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  summary: string | null;
  tags: string | null;
  source_page: number | null;
  source_text?: string | null;
  source_highlight_text?: string | null;
  source_heading: string | null;
  source_match_method?: string | null;
  source_confidence: string | null;
  source: string | null;
  document_title?: string | null;
  document_type?: string | null;
  plan_type?: string | null;
  fiscal_year?: string | null;
  publication_year?: number | null;
  summary_citations: SummaryCitation[];
  objectives: GoalObjective[];
  agency_mentions: AgencyMention[];
  stakeholder_relations: unknown[];
};

export type ThemeSummary = {
  theme: string;
  goal_count: number;
  agencies: string[];
};

export type ThemeAgencyGoal = {
  id: number;
  title: string;
  number: string | null;
  measures_improving: number;
  measures_declining: number;
};

export type ThemeAgency = {
  id: number;
  name: string;
  abbreviation: string;
  goals: ThemeAgencyGoal[];
};

export type ThemeDetail = {
  theme: string;
  total_goals: number;
  total_agencies: number;
  agencies: ThemeAgency[];
};

export type SearchResult = {
  type: string;
  id: number;
  title: string | null;
  name: string | null;
  description: string | null;
  agency_name: string | null;
  agency_id: number | null;
  document_title: string | null;
  parent_goal: string | null;
  parent_objective: string | null;
};

export type SearchResponse = {
  query: string;
  total: number;
  results: SearchResult[];
};

export type MeasureComparisonRow = {
  measure_name: string;
  agency_name: string;
  baseline_value: string | null;
  target_value: string | null;
  actual_value: string | null;
  trend: string | null;
};

export type DocumentSummary = {
  id: number;
  agency_id: number;
  title: string;
  document_type: string;
  plan_type: string;
  fiscal_year: string;
  publication_year: number;
  qa_status: string;
};

export type DocumentDetail = DocumentSummary & {
  qa_confidence: string | null;
  qa_model: string | null;
  qa_findings: string[];
  file_path: string;
  pdf_url: string;
};

export type SemanticManifest = {
  generated_at: string;
  snapshot_id: string;
  corpus_version: string;
  node_total: number;
  goal_total: number;
  objective_total: number;
  latest_updated_at: string;
  supports_incremental_sync: boolean;
  supports_tombstones: boolean;
};

export type SemanticNode = {
  node_id: string;
  node_type: string;
  entity_id: number;
  title: string;
  agency_id: number | null;
  agency_name: string | null;
  summary: string | null;
};

export type SemanticEdge = {
  edge_id: string;
  edge_type: string;
  source_node_id: string;
  source_node_type: string;
  source_label: string;
  target_node_id: string;
  target_node_type: string;
  target_label: string;
  weight: number;
  confidence: string | null;
  metadata?: Record<string, string | number | boolean | null>;
};

export type GoalNeighbors = {
  node: SemanticNode;
  total_edges: number;
  edges: SemanticEdge[];
};

export type AgencyProfile = {
  id: number;
  name: string;
  abbreviation: string;
  goal_count: number;
  objective_count: number;
  measure_count: number;
  document_count: number;
  measures_improving: number;
  measures_declining: number;
  measures_stable: number;
  measures_unknown: number;
  goals: GoalSummary[];
};

async function apexFetch<T>(path: string, revalidate = DEFAULT_REVALIDATE_SECONDS) {
  const url = `${apexBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, {
    next: { revalidate },
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`APEX request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const getOverview = cache(async () => {
  const [agencies, goals, measures, documents, themes, manifest, edgeTotal] =
    await Promise.all([
    listAgencies(),
    listGoals(),
    listMeasures(),
    listDocuments(),
    listThemes(),
    getSemanticManifest(),
    getSemanticEdgeTotal(),
  ]);

  return {
    agencies,
    goals,
    measures,
    documents,
    themes,
    manifest,
    edgeTotal,
  };
});

export const listAgencies = cache(async () => {
  const response = await apexFetch<PaginatedResponse<AgencySummary>>("/agencies");
  return response.data;
});

export const listGoals = cache(async () => {
  const response = await apexFetch<PaginatedResponse<GoalSummary>>("/goals");
  return response.data;
});

export const listMeasures = cache(async () => {
  const response = await apexFetch<PaginatedResponse<GoalMeasure>>("/measures");
  return response.data;
});

export const listDocuments = cache(async () => {
  const response = await apexFetch<PaginatedResponse<DocumentSummary>>("/documents");
  return response.data;
});

export const listThemes = cache(async () => {
  return apexFetch<ThemeSummary[]>("/themes");
});

export const getSemanticManifest = cache(async () => {
  return apexFetch<SemanticManifest>("/semantic/manifest");
});

export const getSemanticEdgeTotal = cache(async () => {
  const response = await apexFetch<PaginatedResponse<SemanticEdge>>(
    "/semantic/edges?limit=1&offset=0",
  );
  return response.total ?? 0;
});

export const getAgencyProfile = cache(async (agencyId: number) => {
  return apexFetch<AgencyProfile>(`/agencies/${agencyId}/profile`);
});

export const getGoal = cache(async (goalId: number) => {
  return apexFetch<GoalSummary>(`/goals/${goalId}`);
});

export const getDocument = cache(async (documentId: number) => {
  return apexFetch<DocumentDetail>(`/documents/${documentId}`);
});

export const getTheme = cache(async (tag: string) => {
  return apexFetch<ThemeDetail>(`/themes/${encodeURIComponent(tag)}`);
});

export const searchCorpus = cache(
  async ({
    query,
    agencyId,
    nodeType,
    limit = 20,
  }: {
    query: string;
    agencyId?: number;
    nodeType?: string;
    limit?: number;
  }) => {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });

    if (agencyId) {
      params.set("agency_id", String(agencyId));
    }

    if (nodeType) {
      params.set("node_type", nodeType);
    }

    return apexFetch<SearchResponse>(`/search?${params.toString()}`);
  },
);

export const compareMeasures = cache(async (agencyIds: number[]) => {
  if (agencyIds.length === 0) {
    return [] as MeasureComparisonRow[];
  }

  return apexFetch<MeasureComparisonRow[]>(
    `/compare?agency_ids=${agencyIds.join(",")}`,
  );
});

export const getGoalNeighbors = cache(async (goalId: number) => {
  return apexFetch<GoalNeighbors>(
    `/semantic/nodes/${encodeURIComponent(`goal:${goalId}`)}/neighbors?limit=20&offset=0`,
  );
});
