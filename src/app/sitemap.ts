import type { MetadataRoute } from "next";

import { listAgencies, listGoals, listThemes } from "@/lib/apex";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [agencies, goals, themes] = await Promise.all([
    listAgencies(),
    listGoals(),
    listThemes(),
  ]);

  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/explore`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/compare`, changeFrequency: "weekly", priority: 0.8 },
    ...agencies.map((agency) => ({
      url: `${siteUrl}/agencies/${agency.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...goals.map((goal) => ({
      url: `${siteUrl}/goals/${goal.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...themes.map((theme) => ({
      url: `${siteUrl}/themes/${theme.theme}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
