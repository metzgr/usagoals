"use client";

import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { useMemo, useState } from "react";

import type {
  GoalNetworkEdge,
  GoalNetworkNode,
  GoalRelationshipModel,
} from "@/lib/goal-relationships";

const chartWidth = 1000;
const chartHeight = 560;

type SimNode = GoalNetworkNode &
  SimulationNodeDatum & {
    radius: number;
  };

type SimLink = Omit<GoalNetworkEdge, "source" | "target"> &
  SimulationLinkDatum<SimNode> & {
    source: string | SimNode;
    target: string | SimNode;
  };

export function GoalNetworkMap({ model }: { model: GoalRelationshipModel }) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const graph = useMemo(() => getForceGraph(model), [model]);

  if (model.relatedGoals.length === 0) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl bg-[#27272a] p-8 text-center">
        <p className="max-w-64 text-sm leading-6 text-[#a8afb7]">
          No related goals are available for this goal yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-2xl bg-[#27272a]">
      <div className="absolute left-6 top-6 z-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#a8afb7]/70">
          {getNetworkLabel(model.source)}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label="Force-directed graph of related goals"
        className="size-full"
      >
        <defs>
          <radialGradient id="goal-network-core" cx="50%" cy="48%" r="58%">
            <stop offset="0%" stopColor="#59A9FF" stopOpacity="0.2" />
            <stop offset="54%" stopColor="#dadee4" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#27272a" stopOpacity="0" />
          </radialGradient>
          <filter id="goal-network-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={chartWidth} height={chartHeight} fill="#27272a" />
        <rect width={chartWidth} height={chartHeight} fill="url(#goal-network-core)" />

        <g opacity="0.16">
          {Array.from({ length: 7 }).map((_, index) => (
            <circle
              key={index}
              cx={chartWidth / 2}
              cy={chartHeight / 2}
              r={72 + index * 42}
              fill="none"
              stroke="#dadee4"
              strokeWidth="1"
            />
          ))}
        </g>

        <g>
          {graph.links.map((edge) => {
            const source = edge.source as SimNode;
            const target = edge.target as SimNode;
            const active = isEdgeActive(edge, activeNodeId);

            return (
              <line
                key={edge.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={edge.type === "shared_priority" ? "#59A9FF" : "#dadee4"}
                strokeDasharray={edge.type === "semantic_similarity" ? "8 10" : undefined}
                strokeLinecap="round"
                strokeOpacity={active ? 0.38 + edge.strength * 0.34 : 0.08}
                strokeWidth={1.2 + edge.strength * 4.8}
              />
            );
          })}
        </g>

        <g>
          {graph.nodes.map((node) => (
            <GoalGraphNode
              key={node.id}
              node={node}
              active={isNodeActive(node, activeNodeId)}
              onActiveNodeChange={setActiveNodeId}
            />
          ))}
        </g>
      </svg>

      <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between gap-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[#a8afb7]/70">
        <span>Force layout · edge width = strength</span>
        <span>{model.relatedGoals.length} connections</span>
      </div>
    </div>
  );
}

function GoalGraphNode({
  node,
  active,
  onActiveNodeChange,
}: {
  node: SimNode;
  active: boolean;
  onActiveNodeChange: (nodeId: string | null) => void;
}) {
  const isSeed = node.role === "seed";
  const nodeX = node.x ?? chartWidth / 2;
  const nodeY = node.y ?? chartHeight / 2;
  const labelOffset = nodeY < chartHeight / 2 ? -20 : 30;

  return (
    <a
      href={`/goals/${node.goalId}`}
      aria-label={`View ${node.label}`}
      onMouseEnter={() => onActiveNodeChange(node.id)}
      onMouseLeave={() => onActiveNodeChange(null)}
      onFocus={() => onActiveNodeChange(node.id)}
      onBlur={() => onActiveNodeChange(null)}
    >
      <g className="outline-none transition-opacity duration-150" opacity={active ? 1 : 0.38}>
        {isSeed ? (
          <circle
            cx={nodeX}
            cy={nodeY}
            r={node.radius + 13}
            fill="#59A9FF"
            fillOpacity="0.14"
            filter="url(#goal-network-glow)"
          />
        ) : null}
        <circle
          cx={nodeX}
          cy={nodeY}
          r={node.radius}
          fill={isSeed ? "#18181b" : "#343538"}
          stroke={isSeed ? "#59A9FF" : "#dadee4"}
          strokeOpacity={isSeed ? 0.72 : 0.28 + node.strength * 0.4}
          strokeWidth={isSeed ? 2.5 : 1.5}
        />
        <text
          x={nodeX}
          y={nodeY + 4}
          textAnchor="middle"
          className="fill-[#18181b] text-[11px] font-medium"
        >
          <tspan
            className={isSeed ? "fill-white" : "fill-[#dadee4]"}
          >
            {node.agencyAbbreviation}
          </tspan>
        </text>
        <text
          x={nodeX}
          y={nodeY + labelOffset}
          textAnchor="middle"
          className={isSeed ? "fill-white text-[17px] font-medium" : "fill-[#dadee4] text-[12px] font-medium"}
        >
          <tspan x={nodeX}>{truncateLabel(node.label, isSeed ? 34 : 26)}</tspan>
          {!isSeed ? (
            <tspan
              x={nodeX}
              dy="16"
              className="fill-[#a8afb7] text-[10px]"
            >
              {Math.round(node.strength * 100)}%
            </tspan>
          ) : null}
        </text>
      </g>
    </a>
  );
}

function getForceGraph(model: GoalRelationshipModel) {
  const related = model.nodes
    .filter((node) => node.role === "related")
    .sort((left, right) => right.strength - left.strength);
  const nodes: SimNode[] = model.nodes.map((node, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * Math.max(index - 1, 0)) / Math.max(related.length, 1);
    const isSeed = node.role === "seed";
    const radius = isSeed ? 33 : 18 + node.strength * 13;

    return {
      ...node,
      radius,
      x: isSeed ? chartWidth / 2 : chartWidth / 2 + Math.cos(angle) * 260,
      y: isSeed ? chartHeight / 2 : chartHeight / 2 + Math.sin(angle) * 190,
      fx: isSeed ? chartWidth / 2 : undefined,
      fy: isSeed ? chartHeight / 2 : undefined,
    };
  });
  const links: SimLink[] = model.edges.map((edge) => ({ ...edge }));

  forceSimulation(nodes)
    .force(
      "link",
      forceLink<SimNode, SimLink>(links)
        .id((node) => node.id)
        .distance((edge) => 230 - edge.strength * 78)
        .strength((edge) => 0.3 + edge.strength * 0.52),
    )
    .force("charge", forceManyBody<SimNode>().strength((node) => (node.role === "seed" ? -420 : -190)))
    .force("collide", forceCollide<SimNode>().radius((node) => node.radius + 42).iterations(2))
    .force("center", forceCenter(chartWidth / 2, chartHeight / 2))
    .force("x", forceX<SimNode>(chartWidth / 2).strength(0.015))
    .force("y", forceY<SimNode>(chartHeight / 2).strength(0.02))
    .force("radial", forceRadial<SimNode>(190, chartWidth / 2, chartHeight / 2).strength((node) => (node.role === "seed" ? 0 : 0.1)))
    .stop()
    .tick(210);

  for (const node of nodes) {
    node.x = clamp(node.x ?? chartWidth / 2, 82, chartWidth - 82);
    node.y = clamp(node.y ?? chartHeight / 2, 92, chartHeight - 82);
  }

  return { nodes, links };
}

function isNodeActive(node: SimNode, activeNodeId: string | null) {
  return !activeNodeId || node.id === activeNodeId || node.role === "seed";
}

function isEdgeActive(edge: SimLink, activeNodeId: string | null) {
  if (!activeNodeId) {
    return true;
  }

  const source = edge.source as SimNode;
  const target = edge.target as SimNode;
  return source.id === activeNodeId || target.id === activeNodeId;
}

function getNetworkLabel(source: GoalRelationshipModel["source"]) {
  if (source === "semantic-neighbors") {
    return "Connections";
  }

  if (source === "semantic-preview") {
    return "Similarity";
  }

  return "Connections";
}

function truncateLabel(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1).trim()}…` : value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
