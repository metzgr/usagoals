import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { cache } from "react";

import {
  listAgencies,
  listGoals,
  listSemanticEdges,
  type GoalSummary,
  type SemanticEdge,
} from "@/lib/apex";

export type GoalUniverseNode = {
  id: string;
  goalId: number;
  agencyId: number;
  agencyAbbreviation: string;
  connectionCount: number;
  x: number;
  y: number;
  radius: number;
};

export type GoalUniverseEdge = {
  id: string;
  source: string;
  target: string;
  sourceGoalId: number;
  targetGoalId: number;
  strength: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type GoalUniverseGraph = {
  nodes: GoalUniverseNode[];
  edges: GoalUniverseEdge[];
  edgePath: string;
  neighborsByGoalId: Record<number, number[]>;
  width: number;
  height: number;
};

type LayoutNode = Omit<GoalUniverseNode, "x" | "y" | "radius"> &
  SimulationNodeDatum & {
    agencyAngle: number;
    radius: number;
  };

type LayoutEdge = Omit<
  GoalUniverseEdge,
  "x1" | "y1" | "x2" | "y2" | "source" | "target"
> &
  SimulationLinkDatum<LayoutNode> & {
    source: string | LayoutNode;
    target: string | LayoutNode;
  };

const chartWidth = 360;
const chartHeight = 220;

export const getGoalUniverseGraph = cache(async () => {
  const [goals, agencies, semanticEdges] = await Promise.all([
    listGoals(),
    listAgencies(),
    listSemanticEdges(),
  ]);
  const agencyMap = new Map(agencies.map((agency) => [agency.id, agency]));
  const goalMap = new Map(goals.map((goal) => [goal.id, goal]));
  const agencyAngles = getAgencyAngles(goals);
  const edgesByKey = getGoalEdges(semanticEdges, goalMap);
  const neighborSets = new Map<number, Set<number>>();

  for (const edge of edgesByKey.values()) {
    getOrCreateSet(neighborSets, edge.sourceGoalId).add(edge.targetGoalId);
    getOrCreateSet(neighborSets, edge.targetGoalId).add(edge.sourceGoalId);
  }

  const nodes: LayoutNode[] = goals
    .map((goal) => {
      const goalNodeId = `goal:${goal.id}`;
      const connectionCount = neighborSets.get(goal.id)?.size ?? 0;
      const agency = agencyMap.get(goal.agency_id);
      const agencyAbbreviation =
        cleanLabel(goal.agency_abbreviation) ??
        cleanLabel(agency?.abbreviation) ??
        "US";
      const agencyAngle = agencyAngles.get(goal.agency_id) ?? 0;
      const seed = stableUnit(goalNodeId);
      const spread = 50 + seed * 74;
      const angle = agencyAngle + (stableUnit(`${goalNodeId}:angle`) - 0.5) * 0.9;

      return {
        id: goalNodeId,
        goalId: goal.id,
        agencyId: goal.agency_id,
        agencyAbbreviation,
        connectionCount,
        agencyAngle,
        radius: 3.1 + Math.min(Math.sqrt(connectionCount), 3.9) * 1.12,
        x: chartWidth / 2 + Math.cos(angle) * spread,
        y: chartHeight / 2 + Math.sin(angle) * spread * 0.66,
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
  const layoutEdges: LayoutEdge[] = [...edgesByKey.values()];

  forceSimulation(nodes)
    .force(
      "link",
      forceLink<LayoutNode, LayoutEdge>(layoutEdges)
        .id((node) => node.id)
        .distance((edge) => 38 - edge.strength * 9)
        .strength((edge) => 0.2 + edge.strength * 0.42),
    )
    .force(
      "charge",
      forceManyBody<LayoutNode>().strength((node) => -12 - node.connectionCount * 1.65),
    )
    .force(
      "collide",
      forceCollide<LayoutNode>()
        .radius((node) => node.radius * 0.82 + 1.4)
        .iterations(1),
    )
    .force("center", forceCenter(chartWidth / 2, chartHeight / 2))
    .force(
      "x",
      forceX<LayoutNode>(
        (node) => chartWidth / 2 + Math.cos(node.agencyAngle) * 34,
      ).strength(0.035),
    )
    .force(
      "y",
      forceY<LayoutNode>(
        (node) => chartHeight / 2 + Math.sin(node.agencyAngle) * 24,
      ).strength(0.045),
    )
    .stop()
    .tick(260);

  for (const node of nodes) {
    node.x = round(clamp(node.x ?? chartWidth / 2, 14, chartWidth - 14));
    node.y = round(clamp(node.y ?? chartHeight / 2, 14, chartHeight - 14));
  }

  const renderedEdges = layoutEdges.map((edge) => {
    const source = edge.source as LayoutNode;
    const target = edge.target as LayoutNode;

    return {
      id: edge.id,
      source: source.id,
      target: target.id,
      sourceGoalId: edge.sourceGoalId,
      targetGoalId: edge.targetGoalId,
      strength: edge.strength,
      x1: round(source.x ?? chartWidth / 2),
      y1: round(source.y ?? chartHeight / 2),
      x2: round(target.x ?? chartWidth / 2),
      y2: round(target.y ?? chartHeight / 2),
    };
  });

  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      goalId: node.goalId,
      agencyId: node.agencyId,
      agencyAbbreviation: node.agencyAbbreviation,
      connectionCount: node.connectionCount,
      x: round(node.x ?? chartWidth / 2),
      y: round(node.y ?? chartHeight / 2),
      radius: round(node.radius),
    })),
    edges: renderedEdges,
    edgePath: renderedEdges
      .map((edge) => `M${edge.x1} ${edge.y1}L${edge.x2} ${edge.y2}`)
      .join(" "),
    neighborsByGoalId: Object.fromEntries(
      [...neighborSets.entries()].map(([goalId, neighbors]) => [
        goalId,
        [...neighbors].sort((left, right) => left - right),
      ]),
    ),
    width: chartWidth,
    height: chartHeight,
  } satisfies GoalUniverseGraph;
});

function getGoalEdges(
  semanticEdges: SemanticEdge[],
  goalMap: Map<number, GoalSummary>,
) {
  const edgeMap = new Map<string, LayoutEdge>();

  for (const edge of semanticEdges) {
    const sourceGoalId = parseGoalNodeId(edge.source_node_id);
    const targetGoalId = parseGoalNodeId(edge.target_node_id);

    if (
      edge.edge_type !== "shared_priority" ||
      !sourceGoalId ||
      !targetGoalId ||
      sourceGoalId === targetGoalId ||
      !goalMap.has(sourceGoalId) ||
      !goalMap.has(targetGoalId)
    ) {
      continue;
    }

    const [lowGoalId, highGoalId] =
      sourceGoalId < targetGoalId
        ? [sourceGoalId, targetGoalId]
        : [targetGoalId, sourceGoalId];
    const id = `goal-edge:${lowGoalId}:${highGoalId}`;
    const strength = getEdgeStrength(edge);
    const existing = edgeMap.get(id);

    if (!existing || strength > existing.strength) {
      edgeMap.set(id, {
        id,
        source: `goal:${lowGoalId}`,
        target: `goal:${highGoalId}`,
        sourceGoalId: lowGoalId,
        targetGoalId: highGoalId,
        strength,
      });
    }
  }

  return edgeMap;
}

function getAgencyAngles(goals: GoalSummary[]) {
  const agencyIds = [...new Set(goals.map((goal) => goal.agency_id))].sort(
    (left, right) => left - right,
  );

  return new Map(
    agencyIds.map((agencyId, index) => [
      agencyId,
      -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(agencyIds.length, 1),
    ]),
  );
}

function getOrCreateSet(map: Map<number, Set<number>>, key: number) {
  const existing = map.get(key);

  if (existing) {
    return existing;
  }

  const next = new Set<number>();
  map.set(key, next);
  return next;
}

function getEdgeStrength(edge: SemanticEdge) {
  const sharedTagCount = Number(edge.metadata?.shared_tag_count ?? 0);
  const confidenceBoost =
    edge.confidence === "high" ? 0.1 : edge.confidence === "medium" ? 0.05 : 0;

  return clamp(
    0.45 + Math.min(edge.weight, 3) * 0.12 + Math.min(sharedTagCount, 4) * 0.07 + confidenceBoost,
    0.45,
    0.96,
  );
}

function parseGoalNodeId(nodeId: string) {
  const match = nodeId.match(/^goal:(\d+)$/);
  return match ? Number(match[1]) : null;
}

function stableUnit(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}

function cleanLabel(value: string | null | undefined) {
  return value?.trim() || null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Number(value.toFixed(2));
}
