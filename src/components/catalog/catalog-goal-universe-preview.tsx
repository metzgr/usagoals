import type { GoalUniverseGraph } from "@/lib/goal-universe";

const highlightColor = "#C8E3FF";
const cardSurfaceColor = "#27272a";
const cardBackgroundColor = "#18181b";

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
      className="pointer-events-none min-h-0 w-full flex-1 px-6 pb-4 pt-3 max-[640px]:px-5"
      data-component="GoalUniversePreview"
    >
      <div className="size-full p-3">
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
            strokeOpacity="0.07"
            strokeWidth="0.85"
            vectorEffect="non-scaling-stroke"
          />

          {highlightedEdges.map((edge) => (
            <g key={edge.id}>
              <path
                d={edge.path}
                fill="none"
                stroke={cardBackgroundColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.7"
                strokeWidth="2.8"
                transform="translate(0 1.15)"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={edge.path}
                fill="none"
                stroke="#fffaf0"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.2 + edge.strength * 0.18}
                strokeWidth="1.9"
                transform="translate(0 -0.35)"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={edge.path}
                fill="none"
                stroke={highlightColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.34 + edge.strength * 0.44}
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}

          <g>
            {graph.nodes.map((node) => {
              const highlighted = highlightedGoalIds.has(node.goalId);

              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 0.9}
                    fill={cardBackgroundColor}
                    opacity={highlighted ? 0.62 : 0.5}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={highlighted ? highlightColor : cardSurfaceColor}
                    fillOpacity={highlighted ? 0.58 : 0.86}
                    stroke={highlighted ? cardBackgroundColor : highlightColor}
                    strokeOpacity={highlighted ? 0.54 : 0.24}
                    strokeWidth={highlighted ? 1.15 : 0.95}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
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
                      r={node.radius + (selected ? 6.6 : 3.6)}
                      fill={highlightColor}
                      opacity={selected ? 0.16 : 0.09}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + (selected ? 2.7 : 0.9)}
                      fill={highlightColor}
                      opacity={selected ? 1 : 0.72}
                      stroke={cardBackgroundColor}
                      strokeOpacity={selected ? 0.88 : 0.48}
                      strokeWidth={selected ? 1.4 : 1}
                      vectorEffect="non-scaling-stroke"
                    />
                    {selected ? (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius + 9.3}
                        fill="none"
                        stroke={highlightColor}
                        strokeOpacity="0.28"
                        strokeWidth="1.25"
                        vectorEffect="non-scaling-stroke"
                      />
                    ) : null}
                  </g>
                );
              })}
          </g>
        </svg>
      </div>
    </div>
  );
}
