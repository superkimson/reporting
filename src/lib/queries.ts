import "server-only";
import type { Entry } from "@/generated/prisma/client";
import type { Platform } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { computeEvolution, type Evolution } from "@/lib/metrics";
import { PLATFORM_LIST } from "@/lib/platforms";

export async function getAllEntries(): Promise<Entry[]> {
  return prisma.entry.findMany({
    orderBy: [{ platform: "asc" }, { periodDate: "desc" }],
  });
}

export async function getEntriesByPlatform(platform: Platform): Promise<Entry[]> {
  return prisma.entry.findMany({
    where: { platform },
    orderBy: { periodDate: "desc" },
  });
}

export interface PlatformSummary {
  platform: Platform;
  current: Entry | null;
  previous: Entry | null;
  followersEvolution: Evolution;
  impressionsEvolution: Evolution;
  engagementsEvolution: Evolution;
}

export interface DashboardData {
  summaries: PlatformSummary[];
  kpis: {
    totalFollowers: number;
    totalFollowersEvolution: Evolution;
    totalImpressions: number;
    totalImpressionsEvolution: Evolution;
    avgEngagementRate: number;
    avgEngagementRateEvolution: Evolution;
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const entries = await getAllEntries();

  const summaries: PlatformSummary[] = PLATFORM_LIST.map((config) => {
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
      impressionsEvolution: computeEvolution(current?.impressions ?? 0, previous?.impressions),
      engagementsEvolution: computeEvolution(current?.engagements ?? 0, previous?.engagements),
    };
  });

  const sum = (pick: (s: PlatformSummary) => number | undefined) =>
    summaries.reduce((total, s) => total + (pick(s) ?? 0), 0);

  const totalFollowers = sum((s) => s.current?.followers);
  const totalFollowersPrev = sum((s) => s.previous?.followers);
  const totalImpressions = sum((s) => s.current?.impressions);
  const totalImpressionsPrev = sum((s) => s.previous?.impressions);
  const totalEngagements = sum((s) => s.current?.engagements);
  const totalEngagementsPrev = sum((s) => s.previous?.engagements);

  const avgEngagementRate =
    totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
  const avgEngagementRatePrev =
    totalImpressionsPrev > 0 ? (totalEngagementsPrev / totalImpressionsPrev) * 100 : 0;

  return {
    summaries,
    kpis: {
      totalFollowers,
      totalFollowersEvolution: computeEvolution(totalFollowers, totalFollowersPrev),
      totalImpressions,
      totalImpressionsEvolution: computeEvolution(totalImpressions, totalImpressionsPrev),
      avgEngagementRate,
      avgEngagementRateEvolution: computeEvolution(
        avgEngagementRate,
        totalImpressionsPrev > 0 ? avgEngagementRatePrev : undefined
      ),
    },
  };
}

export interface GrowthPoint {
  periodDate: string;
  [platform: string]: string | number;
}

// Formate les données pour la courbe de croissance des abonnés (une série par réseau).
export async function getGrowthSeries(): Promise<GrowthPoint[]> {
  const entries = await getAllEntries();
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
  impressions: number;
  engagements: number;
}

// Agrège vues et engagements tous réseaux confondus, par mois, pour l'histogramme comparatif.
export async function getEngagementSeries(): Promise<EngagementPoint[]> {
  const entries = await getAllEntries();
  const byDate = new Map<string, EngagementPoint>();

  for (const entry of entries) {
    const key = entry.periodDate.toISOString().slice(0, 10);
    const existing = byDate.get(key) ?? { periodDate: key, impressions: 0, engagements: 0 };
    existing.impressions += entry.impressions;
    existing.engagements += entry.engagements;
    byDate.set(key, existing);
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.periodDate.localeCompare(b.periodDate)
  );
}
