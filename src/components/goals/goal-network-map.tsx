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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

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

export function GoalNetworkMap({
  model,
  className,
}: {
  model: GoalRelationshipModel;
  className?: string;
}) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const graph = useMemo(() => getForceGraph(model), [model]);

  if (model.relatedGoals.length === 0) {
    return (
      <Empty className={cn("h-full min-h-[420px] border-0", className)}>
        <EmptyHeader>
          <EmptyTitle>No related goals yet</EmptyTitle>
          <EmptyDescription>
            Connections will appear when semantic relationships are available.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div
      className={cn(
        "relative h-full min-h-[420px] overflow-hidden bg-muted/30",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label="Force-directed graph of related goals"
        className="size-full"
      >
        <defs>
          <radialGradient id="goal-network-core" cx="50%" cy="48%" r="62%">
            <stop offset="0%" stopColor="#59A9FF" stopOpacity="0.18" />
            <stop offset="58%" stopColor="#EDE7DD" stopOpacity="0.045" />
            <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
          </radialGradient>
          <filter id="goal-network-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={chartWidth} height={chartHeight} fill="#1f1f22" />
        <rect width={chartWidth} height={chartHeight} fill="url(#goal-network-core)" />

        <g opacity="0.13">
          {Array.from({ length: 6 }).map((_, index) => (
            <circle
              key={index}
              cx={chartWidth / 2}
              cy={chartHeight / 2}
              r={84 + index * 46}
              fill="none"
              stroke="#EDE7DD"
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
                stroke={edge.type === "shared_priority" ? "#59A9FF" : "#EDE7DD"}
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
              focused={activeNodeId === node.id}
              onActiveNodeChange={setActiveNodeId}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

function GoalGraphNode({
  node,
  active,
  focused,
  onActiveNodeChange,
}: {
  node: SimNode;
  active: boolean;
  focused: boolean;
  onActiveNodeChange: (nodeId: string | null) => void;
}) {
  const isSeed = node.role === "seed";
  const showLabel = isSeed || focused;
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
          stroke={isSeed ? "#59A9FF" : "#EDE7DD"}
          strokeOpacity={isSeed ? 0.72 : 0.28 + node.strength * 0.4}
          strokeWidth={isSeed ? 2.5 : 1.5}
        />
        <text
          x={nodeX}
          y={nodeY + 4}
          textAnchor="middle"
          className="text-[11px] font-medium"
        >
          <tspan
            className={isSeed ? "fill-white" : "fill-[#EDE7DD]"}
          >
            {node.agencyAbbreviation}
          </tspan>
        </text>
        {showLabel ? (
          <text
            x={nodeX}
            y={nodeY + labelOffset}
            textAnchor="middle"
            className={isSeed ? "fill-white text-[17px] font-medium" : "fill-[#EDE7DD] text-[12px] font-medium"}
          >
            <tspan x={nodeX}>{truncateLabel(node.label, isSeed ? 34 : 28)}</tspan>
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
        ) : null}
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

function truncateLabel(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1).trim()}…` : value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
