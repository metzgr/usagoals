import { cache } from "react";

import {
  getGoalNeighbors,
  listAgencies,
  listGoals,
  type AgencySummary,
  type GoalSummary,
  type SemanticEdge,
} from "@/lib/apex";
import { getGoalSemanticPreview } from "@/lib/discovery";
import { formatTagLabel } from "@/lib/utils";

export type GoalNetworkNode = {
  id: string;
  goalId: number;
  label: string;
  agencyName: string;
  agencyAbbreviation: string;
  role: "seed" | "related";
  strength: number;
};

export type GoalNetworkEdge = {
  id: string;
  source: string;
  target: string;
  type: "shared_priority" | "semantic_similarity";
  label: string;
  strength: number;
};

export type RelatedGoal = {
  goalId: number;
  title: string;
  agencyName: string;
  agencyAbbreviation: string;
  strength: number;
  reasons: string[];
  edgeType: GoalNetworkEdge["type"];
};

export type GoalRelationshipModel = {
  seed: GoalNetworkNode;
  nodes: GoalNetworkNode[];
  edges: GoalNetworkEdge[];
  relatedGoals: RelatedGoal[];
  source: "semantic-neighbors" | "semantic-preview" | "none";
};

const RELATED_GOAL_LIMIT = 9;

export const getGoalRelationshipModel = cache(async (goalId: number) => {
  const [goals, agencies, neighbors, previewMatches] = await Promise.all([
    listGoals(),
    listAgencies(),
    getNeighborsOrNull(goalId),
    getGoalSemanticPreview(goalId).catch(() => []),
  ]);
  const goalMap = new Map(goals.map((goal) => [goal.id, goal]));
  const agencyMap = new Map(agencies.map((agency) => [agency.id, agency]));
  const seedGoal = goalMap.get(goalId);
  const seed = toNetworkNode(
    seedGoal ??
      ({
        id: goalId,
        title: neighbors?.node.title ?? "Selected goal",
        agency_name: neighbors?.node.agency_name ?? "Unknown agency",
        agency_abbreviation: "USA",
      } as GoalSummary),
    "seed",
    1,
    agencyMap,
  );
  const relatedByGoalId = new Map<number, RelatedGoal>();
  const edgesById = new Map<string, GoalNetworkEdge>();

  for (const edge of neighbors?.edges ?? []) {
    const relatedGoalId = getOppositeGoalId(edge, goalId);

    if (!relatedGoalId) {
      continue;
    }

    const relatedGoal = goalMap.get(relatedGoalId);
    const fallbackAgency = getOppositeAgency(edge, goalId, agencyMap);
    const strength = getEdgeStrength(edge);
    const related = toRelatedGoal({
      goal: relatedGoal,
      fallbackGoalId: relatedGoalId,
      fallbackTitle: getOppositeLabel(edge, goalId),
      fallbackAgencyName: fallbackAgency.name,
      fallbackAgencyAbbreviation: fallbackAgency.abbreviation,
      strength,
      reasons: getEdgeReasons(edge),
      edgeType: "shared_priority",
      agencyMap,
    });

    upsertRelatedGoal(relatedByGoalId, related);
    edgesById.set(edge.edge_id, {
      id: edge.edge_id,
      source: `goal:${goalId}`,
      target: `goal:${relatedGoalId}`,
      type: "shared_priority",
      label: getEdgeLabel(edge),
      strength,
    });
  }

  for (const match of previewMatches) {
    if (match.goal.id === goalId || relatedByGoalId.size >= RELATED_GOAL_LIMIT) {
      continue;
    }

    const strength = clamp(0.42 + match.score / 28, 0.48, 0.74);
    const related = toRelatedGoal({
      goal: match.goal,
      fallbackGoalId: match.goal.id,
      fallbackTitle: match.goal.title,
      fallbackAgencyName: "",
      fallbackAgencyAbbreviation: "",
      strength,
      reasons: match.reasons,
      edgeType: "semantic_similarity",
      agencyMap,
    });

    upsertRelatedGoal(relatedByGoalId, related);
    edgesById.set(`semantic-preview:${goalId}:${match.goal.id}`, {
      id: `semantic-preview:${goalId}:${match.goal.id}`,
      source: `goal:${goalId}`,
      target: `goal:${match.goal.id}`,
      type: "semantic_similarity",
      label: "Semantic proximity",
      strength,
    });
  }

  const relatedGoals = [...relatedByGoalId.values()]
    .sort((left, right) => right.strength - left.strength)
    .slice(0, RELATED_GOAL_LIMIT);
  const allowedNodeIds = new Set([
    seed.id,
    ...relatedGoals.map((goal) => `goal:${goal.goalId}`),
  ]);
  const nodes = [
    seed,
    ...relatedGoals.map((goal) => ({
      id: `goal:${goal.goalId}`,
      goalId: goal.goalId,
      label: goal.title,
      agencyName: goal.agencyName,
      agencyAbbreviation: goal.agencyAbbreviation,
      role: "related" as const,
      strength: goal.strength,
    })),
  ];
  const edges = [...edgesById.values()]
    .filter(
      (edge) => allowedNodeIds.has(edge.source) && allowedNodeIds.has(edge.target),
    )
    .sort((left, right) => right.strength - left.strength);

  return {
    seed,
    nodes,
    edges,
    relatedGoals,
    source:
      edges.some((edge) => edge.type === "shared_priority")
        ? "semantic-neighbors"
        : relatedGoals.length > 0
          ? "semantic-preview"
          : "none",
  } satisfies GoalRelationshipModel;
});

async function getNeighborsOrNull(goalId: number) {
  try {
    return await getGoalNeighbors(goalId);
  } catch {
    return null;
  }
}

function toNetworkNode(
  goal: GoalSummary,
  role: GoalNetworkNode["role"],
  strength: number,
  agencyMap: Map<number, AgencySummary>,
): GoalNetworkNode {
  const agency = getGoalAgency(goal, agencyMap);

  return {
    id: `goal:${goal.id}`,
    goalId: goal.id,
    label: cleanLabel(goal.title, "Untitled goal"),
    agencyName: agency.name,
    agencyAbbreviation: agency.abbreviation,
    role,
    strength,
  };
}

function toRelatedGoal({
  goal,
  fallbackGoalId,
  fallbackTitle,
  fallbackAgencyName,
  fallbackAgencyAbbreviation,
  strength,
  reasons,
  edgeType,
  agencyMap,
}: {
  goal: GoalSummary | undefined;
  fallbackGoalId: number;
  fallbackTitle: string;
  fallbackAgencyName: string;
  fallbackAgencyAbbreviation: string;
  strength: number;
  reasons: string[];
  edgeType: GoalNetworkEdge["type"];
  agencyMap: Map<number, AgencySummary>;
}): RelatedGoal {
  const agency = goal
    ? getGoalAgency(goal, agencyMap, fallbackAgencyName, fallbackAgencyAbbreviation)
    : {
        name: cleanLabel(fallbackAgencyName, "Unknown agency"),
        abbreviation: cleanLabel(fallbackAgencyAbbreviation, "US"),
      };

  return {
    goalId: goal?.id ?? fallbackGoalId,
    title: cleanLabel(goal?.title ?? fallbackTitle, "Untitled goal"),
    agencyName: agency.name,
    agencyAbbreviation: agency.abbreviation,
    strength,
    reasons: reasons.slice(0, 3),
    edgeType,
  };
}

function upsertRelatedGoal(
  relatedByGoalId: Map<number, RelatedGoal>,
  related: RelatedGoal,
) {
  const existing = relatedByGoalId.get(related.goalId);

  if (!existing || related.strength > existing.strength) {
    relatedByGoalId.set(related.goalId, related);
  }
}

function getOppositeGoalId(edge: SemanticEdge, goalId: number) {
  const seedNodeId = `goal:${goalId}`;

  if (edge.source_node_id === seedNodeId && edge.target_node_type === "goal") {
    return parseGoalNodeId(edge.target_node_id);
  }

  if (edge.target_node_id === seedNodeId && edge.source_node_type === "goal") {
    return parseGoalNodeId(edge.source_node_id);
  }

  return null;
}

function getOppositeLabel(edge: SemanticEdge, goalId: number) {
  const seedNodeId = `goal:${goalId}`;
  return edge.source_node_id === seedNodeId ? edge.target_label : edge.source_label;
}

function getOppositeAgency(
  edge: SemanticEdge,
  goalId: number,
  agencyMap: Map<number, AgencySummary>,
) {
  const seedNodeId = `goal:${goalId}`;
  const agencyIdValue =
    edge.source_node_id === seedNodeId
      ? edge.metadata?.target_agency_id
      : edge.metadata?.source_agency_id;
  const agencyId = typeof agencyIdValue === "number" ? agencyIdValue : null;
  const agency = agencyId ? agencyMap.get(agencyId) : null;

  if (agency) {
    return {
      name: agency.name,
      abbreviation: agency.abbreviation,
    };
  }

  return {
    name: cleanLabel(
      edge.source_node_id === seedNodeId
        ? edge.metadata?.target_agency_name
        : edge.metadata?.source_agency_name,
      "Unknown agency",
    ),
    abbreviation: "US",
  };
}

function getGoalAgency(
  goal: GoalSummary,
  agencyMap: Map<number, AgencySummary>,
  fallbackName = "Unknown agency",
  fallbackAbbreviation = "US",
) {
  const agency = agencyMap.get(goal.agency_id);

  return {
    name: cleanLabel(goal.agency_name ?? agency?.name, fallbackName),
    abbreviation: cleanLabel(
      goal.agency_abbreviation ?? agency?.abbreviation,
      fallbackAbbreviation,
    ),
  };
}

function parseGoalNodeId(nodeId: string) {
  const match = nodeId.match(/^goal:(\d+)$/);
  return match ? Number(match[1]) : null;
}

function getEdgeStrength(edge: SemanticEdge) {
  const sharedTagCount = Number(edge.metadata?.shared_tag_count ?? 0);
  const confidenceBoost =
    edge.confidence === "high" ? 0.08 : edge.confidence === "medium" ? 0.04 : 0;

  return clamp(
    0.54 + Math.min(edge.weight, 3) * 0.1 + Math.min(sharedTagCount, 4) * 0.08 + confidenceBoost,
    0.5,
    0.96,
  );
}

function getEdgeReasons(edge: SemanticEdge) {
  const reasons: string[] = [];
  const sharedTags = String(edge.metadata?.shared_tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (sharedTags.length > 0) {
    reasons.push(`Shared priority: ${sharedTags.slice(0, 2).map(formatTagLabel).join(", ")}`);
  }

  const targetAgency = cleanLabel(edge.metadata?.target_agency_name, "");
  const sourceAgency = cleanLabel(edge.metadata?.source_agency_name, "");

  if (sourceAgency && targetAgency && sourceAgency !== targetAgency) {
    reasons.push("Cross-agency connection");
  }

  if (edge.confidence) {
    reasons.push(`${formatTagLabel(edge.confidence)} confidence`);
  }

  return reasons.length > 0 ? reasons : [getEdgeLabel(edge)];
}

function getEdgeLabel(edge: SemanticEdge) {
  if (edge.edge_type === "shared_priority") {
    return "Shared priority";
  }

  return formatTagLabel(edge.edge_type);
}

function cleanLabel(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim()
    ? value.replace(/\s+/g, " ").trim()
    : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number(value.toFixed(2))));
}
