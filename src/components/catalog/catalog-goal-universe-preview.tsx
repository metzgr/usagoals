import type { GoalUniverseGraph } from "@/lib/goal-universe";

const highlightColor = "#EDE7DD";

export function CatalogGoalUniversePreview({
  graph,
  goalId,
}: {
  graph: GoalUniverseGraph;
  goalId: number;
}) {
  const neighborIds = graph.neighborsByGoalId[goalId] ?? [];
  const highlightedGoalIds = new Set([goalId, ...neighborIds]);
  const highlightedEdges = graph.edges.filter(
    (edge) => edge.sourceGoalId === goalId || edge.targetGoalId === goalId,
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none min-h-0 w-full flex-1 px-5 pb-2 pt-1"
      data-component="GoalUniversePreview"
    >
      <svg
        viewBox={`0 0 ${graph.width} ${graph.height}`}
        className="size-full overflow-visible"
        shapeRendering="geometricPrecision"
      >
        <path
          d={graph.edgePath}
          fill="none"
          stroke="#EDE7DD"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.055"
          strokeWidth="0.78"
          vectorEffect="non-scaling-stroke"
        />

        {highlightedEdges.map((edge) => (
          <line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={highlightColor}
            strokeLinecap="round"
            strokeOpacity={0.38 + edge.strength * 0.45}
            strokeWidth={1.1 + edge.strength * 1.45}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <g>
          {graph.nodes.map((node) => {
            const highlighted = highlightedGoalIds.has(node.goalId);

            return (
              <circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={highlighted ? highlightColor : "#EDE7DD"}
                opacity={highlighted ? 0.72 : 0.28}
              />
            );
          })}
        </g>

        <g>
          {graph.nodes
            .filter((node) => highlightedGoalIds.has(node.goalId))
            .map((node) => {
              const selected = node.goalId === goalId;

              return (
                <g key={`${node.id}:highlight`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={selected ? 9.5 : 6.4}
                    fill={highlightColor}
                    opacity={selected ? 0.16 : 0.08}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={selected ? 5.6 : 3.8}
                    fill={highlightColor}
                    opacity={selected ? 1 : 0.72}
                  />
                  {selected ? (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="12"
                      fill="none"
                      stroke={highlightColor}
                      strokeOpacity="0.22"
                      strokeWidth="1.1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ) : null}
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
}
