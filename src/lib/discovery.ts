import { cache } from "react";

import {
  getGoalNeighbors,
  getOverview,
  listGoals,
  type GoalSummary,
  type ThemeSummary,
} from "@/lib/apex";
import { formatTagLabel } from "@/lib/utils";

const STOP_WORDS = new Set([
  "about",
  "across",
  "after",
  "agency",
  "american",
  "americans",
  "been",
  "between",
  "build",
  "current",
  "ensure",
  "federal",
  "from",
  "goal",
  "goals",
  "government",
  "improve",
  "into",
  "more",
  "national",
  "public",
  "state",
  "strategy",
  "support",
  "through",
  "toward",
  "under",
  "with",
  "year",
]);

const discoverySignalConfig = {
  workforce: {
    label: "Workforce",
    tagline: "Talent pipelines, public-sector capacity, and hiring resilience.",
    description:
      "Best for showing how the current corpus already connects hiring, STEM talent, and operational capacity across unrelated agencies.",
    investorAngle:
      "This is the cleanest prototype story for cross-agency similarity, because the same workforce language appears in multiple strategic contexts.",
    prompts: [
      "Which agencies are treating talent as a strategic constraint?",
      "Where do workforce and technology priorities overlap?",
      "What plans mention recruiting, retaining, or developing staff?",
    ],
    keywords: ["workforce", "talent", "hiring", "stem", "employee", "staff"],
  },
  technology: {
    label: "Technology",
    tagline: "Digital modernization, science, innovation, and research strength.",
    description:
      "Shows how USA Goals can move from document retrieval into issue intelligence around innovation, modernization, and science leadership.",
    investorAngle:
      "Technology is the strongest proof that this can become a semantic strategy platform, not just a repository of plan PDFs.",
    prompts: [
      "Where is technology framed as mission-critical right now?",
      "Which agencies pair innovation with workforce or trade goals?",
      "What goals cluster around research, AI, or modernization themes?",
    ],
    keywords: ["technology", "innovation", "digital", "research", "science", "modernization"],
  },
  fiscal_responsibility: {
    label: "Fiscal Responsibility",
    tagline: "Operational discipline, stewardship, efficiency, and budget pressure.",
    description:
      "Useful for demonstrating a stakeholder-facing accountability angle even before richer time-series performance data arrives.",
    investorAngle:
      "This theme positions the product as strategy oversight infrastructure, not only strategic planning software.",
    prompts: [
      "Which agencies frame stewardship and efficiency as strategic priorities?",
      "Where do fiscal and workforce concerns intersect?",
      "How broad is the current stewardship story across the corpus?",
    ],
    keywords: ["fiscal", "efficiency", "budget", "stewardship", "financial", "operations"],
  },
  national_security: {
    label: "National Security",
    tagline: "Security, resilience, sovereignty, and strategic posture.",
    description:
      "Best for showing how the corpus can already support geopolitical and mission-level exploration across agencies.",
    investorAngle:
      "Security goals create high-signal graph stories because related priorities surface across diplomacy, research, and readiness.",
    prompts: [
      "Which strategic goals align around readiness or resilience?",
      "How does national security connect with science and technology?",
      "What adjacent issues emerge from security-tagged goals?",
    ],
    keywords: ["security", "resilience", "sovereignty", "readiness", "defense", "strategic"],
  },
  trade: {
    label: "Trade",
    tagline: "Markets, exports, competitiveness, and economic positioning.",
    description:
      "Shows how a smaller theme can still drive useful issue mapping when combined with related signals like technology and security.",
    investorAngle:
      "Trade is a good demo of future vector retrieval because exact-tag coverage is small but adjacent semantic context is rich.",
    prompts: [
      "What else should a user see when they start from trade?",
      "Where do trade and technology priorities reinforce each other?",
      "Which agencies are carrying the trade narrative today?",
    ],
    keywords: ["trade", "market", "export", "competitiveness", "economic", "commerce"],
  },
  education: {
    label: "Education",
    tagline: "Learning systems, STEM development, and talent formation.",
    description:
      "A compact theme that demonstrates how even sparse coverage can become a credible issue hub when combined with neighboring signals.",
    investorAngle:
      "Education gives a good prototype story for similarity expansion beyond exact lexical matches.",
    prompts: [
      "Which goals connect education to workforce or science leadership?",
      "What agencies currently anchor the education story?",
      "Where would semantic recommendations add the most value here?",
    ],
    keywords: ["education", "learning", "stem", "students", "training", "talent"],
  },
  infrastructure: {
    label: "Infrastructure",
    tagline: "Physical systems, resilience, logistics, and public assets.",
    description:
      "Useful for showing how narrow current coverage can still become a future network view once similarity and graph tooling expand.",
    investorAngle:
      "Infrastructure frames the long-term opportunity: the UI can already hold the workflow even if the corpus is still sparse.",
    prompts: [
      "How much of the current corpus touches infrastructure directly?",
      "What neighboring themes should be recommended next?",
      "Which agencies own the clearest infrastructure narratives today?",
    ],
    keywords: ["infrastructure", "logistics", "transportation", "systems", "assets", "resilience"],
  },
} as const;

export type DiscoverySignalId = keyof typeof discoverySignalConfig;

export type DiscoverySignal = {
  id: DiscoverySignalId;
  label: string;
  tagline: string;
  description: string;
  investorAngle: string;
  prompts: readonly string[];
  keywords: readonly string[];
};

export type DiscoveryGoalMatch = {
  goal: GoalSummary;
  reasons: string[];
  sharedTags: string[];
  keywordHits: string[];
  score: number;
};

export type DiscoveryCompanionTheme = ThemeSummary & {
  overlapCount: number;
  label: string;
};

export type DiscoveryAgencyBridge = {
  agencyId: number;
  agencyName: string;
  agencyAbbreviation: string;
  goalCount: number;
  activeThemes: string[];
  goalIds: number[];
  anchorTitles: string[];
};

export type DiscoveryScenario = {
  signal: DiscoverySignal;
  signals: DiscoverySignal[];
  selectedTheme: ThemeSummary | null;
  exactThemeGoalCount: number;
  participatingAgencyCount: number;
  companionThemes: DiscoveryCompanionTheme[];
  seedGoals: GoalSummary[];
  adjacentMatches: DiscoveryGoalMatch[];
  agencyBridges: DiscoveryAgencyBridge[];
  sharedPriorityCount: number;
};

function getDiscoverySignalsInternal(): DiscoverySignal[] {
  return (Object.entries(discoverySignalConfig) as [
    DiscoverySignalId,
    (typeof discoverySignalConfig)[DiscoverySignalId],
  ][]).map(([id, config]) => ({
    id,
    ...config,
  }));
}

function parseGoalTags(goal: GoalSummary) {
  return goal.tags
    ? goal.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
}

function tokenize(...values: Array<string | null | undefined>) {
  return [
    ...new Set(
      values
        .flatMap((value) =>
          (value ?? "")
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter(Boolean),
        )
        .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
    ),
  ];
}

function takeTopDistinct(values: string[], limit: number) {
  return [...new Set(values)].slice(0, limit);
}

function getSignal(signalId?: string): DiscoverySignal {
  const signals = getDiscoverySignalsInternal();
  return signals.find((signal) => signal.id === signalId) ?? signals[0];
}

function getCompanionThemes(seedGoals: GoalSummary[], activeSignalId: DiscoverySignalId) {
  const counts = new Map<string, number>();

  for (const goal of seedGoals) {
    for (const tag of parseGoalTags(goal)) {
      if (tag === activeSignalId) {
        continue;
      }

      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return counts;
}

function scoreGoalForSignal(
  goal: GoalSummary,
  signal: DiscoverySignal,
  companionThemeIds: string[],
) {
  const reasons: string[] = [];
  const tags = parseGoalTags(goal);
  const keywordHits = tokenize(goal.title, goal.subtitle, goal.summary, goal.description).filter(
    (token) => signal.keywords.includes(token),
  );
  let score = 0;

  if (tags.includes(signal.id)) {
    score += 10;
    reasons.push(`Exact theme: ${signal.label}`);
  }

  const sharedCompanionThemes = companionThemeIds.filter((tag) => tags.includes(tag));
  if (sharedCompanionThemes.length > 0) {
    score += sharedCompanionThemes.length * 4;
    reasons.push(
      `Companion theme: ${sharedCompanionThemes
        .slice(0, 2)
        .map((tag) => formatTagLabel(tag))
        .join(", ")}`,
    );
  }

  if (keywordHits.length > 0) {
    score += keywordHits.length * 2;
    reasons.push(`Language match: ${takeTopDistinct(keywordHits, 2).join(", ")}`);
  }

  if (goal.objectives.length >= 2) {
    score += 1;
    reasons.push(`${goal.objectives.length} objectives`);
  }

  if ((goal.summary_citations?.length ?? 0) > 0 || goal.source_page) {
    score += 1;
    reasons.push("Source-linked evidence");
  }

  if (score < 4) {
    return null;
  }

  return {
    goal,
    reasons: reasons.slice(0, 4),
    sharedTags: tags.filter((tag) => tag === signal.id || sharedCompanionThemes.includes(tag)),
    keywordHits: takeTopDistinct(keywordHits, 3),
    score,
  } satisfies DiscoveryGoalMatch;
}

function scoreGoalAgainstGoal(seedGoal: GoalSummary, candidateGoal: GoalSummary) {
  const seedTags = parseGoalTags(seedGoal);
  const candidateTags = parseGoalTags(candidateGoal);
  const sharedTags = seedTags.filter((tag) => candidateTags.includes(tag));
  const reasons: string[] = [];
  let score = 0;

  if (sharedTags.length > 0) {
    score += sharedTags.length * 6;
    reasons.push(
      `Shared theme: ${sharedTags
        .slice(0, 2)
        .map((tag) => formatTagLabel(tag))
        .join(", ")}`,
    );
  }

  const seedTokens = tokenize(
    seedGoal.title,
    seedGoal.subtitle,
    seedGoal.summary,
    seedGoal.description,
  );
  const candidateTokens = tokenize(
    candidateGoal.title,
    candidateGoal.subtitle,
    candidateGoal.summary,
    candidateGoal.description,
  );
  const keywordHits = seedTokens.filter((token) => candidateTokens.includes(token));

  if (keywordHits.length > 0) {
    score += Math.min(keywordHits.length, 3) * 2;
    reasons.push(`Shared language: ${takeTopDistinct(keywordHits, 2).join(", ")}`);
  }

  if (seedGoal.agency_id && candidateGoal.agency_id && seedGoal.agency_id !== candidateGoal.agency_id) {
    if (sharedTags.length > 0) {
      score += 2;
      reasons.push("Cross-agency parallel");
    }
  } else if (seedGoal.agency_id === candidateGoal.agency_id) {
    score += 1;
    reasons.push("Same agency stack");
  }

  if (candidateGoal.objectives.length >= 2) {
    score += 1;
    reasons.push(`${candidateGoal.objectives.length} objectives`);
  }

  if ((candidateGoal.summary_citations?.length ?? 0) > 0 || candidateGoal.source_page) {
    score += 1;
    reasons.push("Source-linked evidence");
  }

  if (score < 5) {
    return null;
  }

  return {
    goal: candidateGoal,
    reasons: reasons.slice(0, 4),
    sharedTags,
    keywordHits: takeTopDistinct(keywordHits, 3),
    score,
  } satisfies DiscoveryGoalMatch;
}

export function getDiscoverySignals() {
  return getDiscoverySignalsInternal();
}

export const getDiscoveryScenario = cache(async (signalId?: string) => {
  const activeSignal = getSignal(signalId);
  const overview = await getOverview();
  const selectedTheme =
    overview.themes.find((theme) => theme.theme === activeSignal.id) ?? null;

  const seedGoals = overview.goals
    .filter((goal) => parseGoalTags(goal).includes(activeSignal.id))
    .sort((left, right) => right.objectives.length - left.objectives.length);

  const companionThemeCounts = getCompanionThemes(seedGoals, activeSignal.id);
  const companionThemeIds = [...companionThemeCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([tag]) => tag)
    .slice(0, 4);

  const companionThemes = companionThemeIds
    .map((tag) => {
      const theme = overview.themes.find((entry) => entry.theme === tag);

      if (!theme) {
        return null;
      }

      return {
        ...theme,
        overlapCount: companionThemeCounts.get(tag) ?? 0,
        label: formatTagLabel(tag),
      } satisfies DiscoveryCompanionTheme;
    })
    .filter((theme): theme is DiscoveryCompanionTheme => Boolean(theme));

  const seedGoalIds = new Set(seedGoals.map((goal) => goal.id));
  const adjacentMatches = overview.goals
    .filter((goal) => !seedGoalIds.has(goal.id))
    .map((goal) => scoreGoalForSignal(goal, activeSignal, companionThemeIds))
    .filter((goal): goal is DiscoveryGoalMatch => Boolean(goal))
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);

  const agencyMap = new Map(overview.agencies.map((agency) => [agency.id, agency]));
  const agencyBridges = [...seedGoals.reduce((accumulator, goal) => {
    const agencyId = goal.agency_id;

    if (!agencyId) {
      return accumulator;
    }

    const existing = accumulator.get(agencyId) ?? {
      agencyId,
      agencyName: goal.agency_name ?? "Unknown agency",
      agencyAbbreviation:
        goal.agency_abbreviation ??
        agencyMap.get(agencyId)?.abbreviation ??
        "N/A",
      goalCount: 0,
      activeThemes: new Set<string>(),
      goalIds: [] as number[],
      anchorTitles: [] as string[],
    };

    existing.goalCount += 1;
    existing.goalIds.push(goal.id);
    existing.anchorTitles.push(goal.title);

    for (const tag of parseGoalTags(goal)) {
      if (tag !== activeSignal.id) {
        existing.activeThemes.add(formatTagLabel(tag));
      }
    }

    accumulator.set(agencyId, existing);
    return accumulator;
  }, new Map<number, {
    agencyId: number;
    agencyName: string;
    agencyAbbreviation: string;
    goalCount: number;
    activeThemes: Set<string>;
    goalIds: number[];
    anchorTitles: string[];
  }>()).values()]
    .map((agency) => ({
      agencyId: agency.agencyId,
      agencyName: agency.agencyName,
      agencyAbbreviation: agency.agencyAbbreviation,
      goalCount: agency.goalCount,
      activeThemes: [...agency.activeThemes].slice(0, 4),
      goalIds: agency.goalIds,
      anchorTitles: agency.anchorTitles.slice(0, 2),
    }))
    .sort((left, right) => right.goalCount - left.goalCount)
    .slice(0, 6);

  const neighborhoods = await Promise.all(
    seedGoals.slice(0, 4).map(async (goal) => {
      try {
        return await getGoalNeighbors(goal.id);
      } catch {
        return null;
      }
    }),
  );

  const sharedPriorityCount = new Set(
    neighborhoods
      .flatMap((entry) => entry?.edges ?? [])
      .filter((edge) => edge.edge_type === "shared_priority")
      .map((edge) => edge.edge_id),
  ).size;

  return {
    signal: activeSignal,
    signals: getDiscoverySignalsInternal(),
    selectedTheme,
    exactThemeGoalCount: seedGoals.length,
    participatingAgencyCount: new Set(
      seedGoals.map((goal) => goal.agency_id).filter((agencyId): agencyId is number => Boolean(agencyId)),
    ).size,
    companionThemes,
    seedGoals: seedGoals.slice(0, 4),
    adjacentMatches,
    agencyBridges,
    sharedPriorityCount,
  } satisfies DiscoveryScenario;
});

export const getGoalSemanticPreview = cache(async (goalId: number) => {
  const goals = await listGoals();
  const selectedGoal = goals.find((goal) => goal.id === goalId);

  if (!selectedGoal) {
    return [] as DiscoveryGoalMatch[];
  }

  return goals
    .filter((goal) => goal.id !== goalId)
    .map((goal) => scoreGoalAgainstGoal(selectedGoal, goal))
    .filter((goal): goal is DiscoveryGoalMatch => Boolean(goal))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);
});
