"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  GoalNetworkNode,
  GoalRelationshipModel,
} from "@/lib/goal-relationships";

type PositionedNode = GoalNetworkNode & {
  x: number;
  y: number;
};

export function GoalNetworkMap({ model }: { model: GoalRelationshipModel }) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const positionedNodes = useMemo(
    () => getPositionedNodes(model.nodes),
    [model.nodes],
  );
  const nodeMap = new Map(positionedNodes.map((node) => [node.id, node]));

  if (model.relatedGoals.length === 0) {
    return (
      <div className="flex h-full min-h-[480px] flex-col justify-between rounded-lg bg-[#27272a] p-6">
        <NetworkHeader source={model.source} />
        <div className="flex flex-1 items-center justify-center text-center">
          <p className="max-w-64 text-sm leading-6 text-[#a8afb7]">
            No related goals are available for this goal yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[520px] overflow-hidden rounded-lg border-2 border-[#27272a] bg-[#27272a] p-5">
      <NetworkHeader source={model.source} />

      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="network-wash" cx="50%" cy="42%" r="70%">
            <stop offset="0%" stopColor="#59A9FF" stopOpacity="0.16" />
            <stop offset="58%" stopColor="#343538" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#network-wash)" />
        {model.edges.map((edge) => {
          const source = nodeMap.get(edge.source);
          const target = nodeMap.get(edge.target);

          if (!source || !target) {
            return null;
          }

          const active =
            !activeNodeId ||
            edge.source === activeNodeId ||
            edge.target === activeNodeId;

          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={edge.type === "shared_priority" ? "#59A9FF" : "#dadee4"}
              strokeDasharray={edge.type === "semantic_similarity" ? "1.5 2.5" : undefined}
              strokeLinecap="round"
              strokeOpacity={active ? 0.22 + edge.strength * 0.46 : 0.08}
              strokeWidth={0.45 + edge.strength * 1.6}
            />
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {positionedNodes.map((node) => (
          <NetworkNode
            key={node.id}
            node={node}
            activeNodeId={activeNodeId}
            onActiveNodeChange={setActiveNodeId}
          />
        ))}
      </div>

      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[#a8afb7]/70">
        <span>Edge width = relationship strength</span>
        <span>{model.relatedGoals.length} related</span>
      </div>
    </div>
  );
}

function NetworkHeader({ source }: { source: GoalRelationshipModel["source"] }) {
  const label =
    source === "semantic-neighbors"
      ? "Semantic network"
      : source === "semantic-preview"
        ? "Similarity network"
        : "Network";

  return (
    <div className="pointer-events-none absolute left-5 top-5 z-10">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#a8afb7]/70">
        {label}
      </p>
    </div>
  );
}

function NetworkNode({
  node,
  activeNodeId,
  onActiveNodeChange,
}: {
  node: PositionedNode;
  activeNodeId: string | null;
  onActiveNodeChange: (nodeId: string | null) => void;
}) {
  const isSeed = node.role === "seed";
  const isActive = !activeNodeId || activeNodeId === node.id || isSeed;
  const width = isSeed ? 218 : 154;

  return (
    <Link
      href={`/goals/${node.goalId}`}
      aria-label={`View ${node.label}`}
      onMouseEnter={() => onActiveNodeChange(node.id)}
      onMouseLeave={() => onActiveNodeChange(null)}
      onFocus={() => onActiveNodeChange(node.id)}
      onBlur={() => onActiveNodeChange(null)}
      className="pointer-events-auto absolute z-10 rounded-lg outline-none transition duration-150 focus-visible:ring-2 focus-visible:ring-[#59A9FF]"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        width,
        transform: "translate(-50%, -50%)",
        opacity: isActive ? 1 : 0.45,
      }}
    >
      <span
        className={
          isSeed
            ? "block rounded-lg border border-[#59A9FF]/40 bg-[#18181b] p-4 shadow-[0_24px_80px_rgba(89,169,255,0.18)]"
            : "block rounded-lg border border-white/10 bg-[#343538]/90 p-3 backdrop-blur"
        }
      >
        <span className="mb-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#dadee4] px-2 text-[11px] font-medium text-[#18181b]">
          {node.agencyAbbreviation}
        </span>
        <span
          className={
            isSeed
              ? "line-clamp-3 text-base font-medium leading-tight text-white"
              : "line-clamp-2 text-xs font-medium leading-snug text-white"
          }
        >
          {node.label}
        </span>
        {!isSeed ? (
          <span className="mt-2 block text-[11px] text-[#a8afb7]">
            {Math.round(node.strength * 100)}%
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function getPositionedNodes(nodes: GoalNetworkNode[]) {
  const seed = nodes.find((node) => node.role === "seed");
  const related = nodes
    .filter((node) => node.role === "related")
    .sort((left, right) => right.strength - left.strength);
  const positioned: PositionedNode[] = [];

  if (seed) {
    positioned.push({ ...seed, x: 50, y: 50 });
  }

  related.forEach((node, index) => {
    const count = related.length;
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
    const radiusX = 34 + (1 - node.strength) * 8;
    const radiusY = 30 + (1 - node.strength) * 7;

    positioned.push({
      ...node,
      x: 50 + Math.cos(angle) * radiusX,
      y: 50 + Math.sin(angle) * radiusY,
    });
  });

  return positioned;
}
