import type { Entry } from "@/generated/prisma/client";
import type { Platform } from "@/generated/prisma/enums";
import { computeEvolution, type Evolution } from "@/lib/metrics";
import type { PlatformConfig } from "@/lib/platforms";

// Fonctions pures (pas de dépendance à Prisma) : elles opèrent sur des entrées déjà
// chargées, pour pouvoir être réutilisées aussi bien côté serveur que côté client
// (filtres interactifs du dashboard).

export interface PlatformSummary {
  platform: Platform;
  current: Entry | null;
  previous: Entry | null;
  followersEvolution: Evolution;
  viewsEvolution: Evolution;
  interactionsEvolution: Evolution;
}

export interface DashboardData {
  summaries: PlatformSummary[];
  kpis: {
    totalFollowers: number;
    totalFollowersEvolution: Evolution;
    totalViews: number;
    totalViewsEvolution: Evolution;
    avgEngagementRate: number;
    avgEngagementRateEvolution: Evolution;
  };
}

export function computeDashboardSummary(
  entries: Entry[],
  platforms: PlatformConfig[]
): DashboardData {
  const summaries: PlatformSummary[] = platforms.map((config) => {
    const platformEntries = entries
      .filter((entry) => entry.platform === config.id)
      .sort((a, b) => b.periodDate.getTime() - a.periodDate.getTime());

    const current = platformEntries[0] ?? null;
    const previous = platformEntries[1] ?? null;

    return {
      platform: config.id,
      current,
      previous,
      followersEvolution: computeEvolution(current?.followers ?? 0, previous?.followers),
      viewsEvolution: computeEvolution(current?.views ?? 0, previous?.views),
      interactionsEvolution: computeEvolution(
        current?.interactions ?? 0,
        previous?.interactions ?? undefined
      ),
    };
  });

  const sum = (pick: (s: PlatformSummary) => number | null | undefined) =>
    summaries.reduce((total, s) => total + (pick(s) ?? 0), 0);

  const totalFollowers = sum((s) => s.current?.followers);
  const totalFollowersPrev = sum((s) => s.previous?.followers);
  const totalViews = sum((s) => s.current?.views);
  const totalViewsPrev = sum((s) => s.previous?.views);
  const totalInteractions = sum((s) => s.current?.interactions);
  const totalInteractionsPrev = sum((s) => s.previous?.interactions);

  const avgEngagementRate = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;
  const avgEngagementRatePrev =
    totalViewsPrev > 0 ? (totalInteractionsPrev / totalViewsPrev) * 100 : 0;

  return {
    summaries,
    kpis: {
      totalFollowers,
      totalFollowersEvolution: computeEvolution(totalFollowers, totalFollowersPrev),
      totalViews,
      totalViewsEvolution: computeEvolution(totalViews, totalViewsPrev),
      avgEngagementRate,
      avgEngagementRateEvolution: computeEvolution(
        avgEngagementRate,
        totalViewsPrev > 0 ? avgEngagementRatePrev : undefined
      ),
    },
  };
}

export interface GrowthPoint {
  periodDate: string;
  [platform: string]: string | number;
}

// Formate les données pour la courbe de croissance des abonnés (une série par réseau).
export function computeGrowthSeries(entries: Entry[]): GrowthPoint[] {
  const byDate = new Map<string, GrowthPoint>();

  for (const entry of entries) {
    const key = entry.periodDate.toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, { periodDate: key });
    byDate.get(key)![entry.platform] = entry.followers;
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.periodDate.localeCompare(b.periodDate)
  );
}

export interface EngagementPoint {
  periodDate: string;
  views: number;
  interactions: number;
}

// Agrège vues et interactions tous réseaux confondus, par mois, pour l'histogramme comparatif.
export function computeEngagementSeries(entries: Entry[]): EngagementPoint[] {
  const byDate = new Map<string, EngagementPoint>();

  for (const entry of entries) {
    const key = entry.periodDate.toISOString().slice(0, 10);
    const existing = byDate.get(key) ?? { periodDate: key, views: 0, interactions: 0 };
    existing.views += entry.views;
    existing.interactions += entry.interactions ?? 0;
    byDate.set(key, existing);
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.periodDate.localeCompare(b.periodDate)
  );
}
