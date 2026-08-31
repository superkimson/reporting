import type { Entry } from "@/generated/prisma/client";
import type { Platform } from "@/generated/prisma/enums";
import { computeEvolution, computeEngagementRate, type Evolution } from "@/lib/metrics";
import { getRangeCutoff, getPreviousRangeWindow, type RangeKey } from "@/lib/date-range";
import type { PlatformConfig } from "@/lib/platforms";

// Fonctions pures (pas de dépendance à Prisma) : elles opèrent sur des entrées déjà
// chargées, pour pouvoir être réutilisées aussi bien côté serveur que côté client
// (filtres interactifs du dashboard).

// Une période peut regrouper plusieurs entrées (une par édition MA/AG) : ce type
// représente le résultat déjà agrégé, pas une ligne brute de la base.
export interface AggregatedPeriod {
  periodDate: Date;
  followers: number;
  views: number;
  reach: number | null;
  interactions: number | null;
  engagementRate: number | null;
}

// Additionne les entrées d'un même réseau partageant la même periodDate (typiquement
// une entrée MA + une entrée AG) pour obtenir la valeur combinée de cette période.
export function aggregateByPeriod(entries: Entry[]): AggregatedPeriod[] {
  const byDate = new Map<string, AggregatedPeriod>();

  for (const entry of entries) {
    const key = entry.periodDate.toISOString().slice(0, 10);
    const existing = byDate.get(key);
    if (existing) {
      existing.followers += entry.followers;
      existing.views += entry.views;
      existing.reach =
        existing.reach != null || entry.reach != null
          ? (existing.reach ?? 0) + (entry.reach ?? 0)
          : null;
      existing.interactions =
        existing.interactions != null || entry.interactions != null
          ? (existing.interactions ?? 0) + (entry.interactions ?? 0)
          : null;
    } else {
      byDate.set(key, {
        periodDate: entry.periodDate,
        followers: entry.followers,
        views: entry.views,
        reach: entry.reach,
        interactions: entry.interactions,
        engagementRate: null,
      });
    }
  }

  const periods = Array.from(byDate.values());
  for (const period of periods) {
    period.engagementRate = computeEngagementRate(period.interactions, period.views);
  }

  return periods.sort((a, b) => b.periodDate.getTime() - a.periodDate.getTime());
}

export interface PlatformSummary {
  platform: Platform;
  current: AggregatedPeriod | null;
  previous: AggregatedPeriod | null;
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
    const periods = aggregateByPeriod(entries.filter((entry) => entry.platform === config.id));
    const current = periods[0] ?? null;
    const previous = periods[1] ?? null;

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
// Additionne les éditions plutôt que d'écraser, quand plusieurs entrées partagent
// la même periodDate pour un même réseau (ex: MA + AG combinés).
export function computeGrowthSeries(entries: Entry[]): GrowthPoint[] {
  const byDate = new Map<string, GrowthPoint>();

  for (const entry of entries) {
    const key = entry.periodDate.toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, { periodDate: key });
    const point = byDate.get(key)!;
    const previousValue = typeof point[entry.platform] === "number" ? (point[entry.platform] as number) : 0;
    point[entry.platform] = previousValue + entry.followers;
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

export interface PlatformExportStats {
  config: PlatformConfig;
  followers: { value: number | null; evolution: Evolution };
  views: { value: number; evolution: Evolution };
  interactions: { value: number | null; evolution: Evolution };
}

// Stats pour l'export visuel : abonnés = dernière valeur connue sur la période
// (c'est un stock, pas un flux, ça ne s'additionne pas) ; vues/interactions =
// somme sur la période, comparée à la somme de la période précédente de même durée.
export function computeExportStats(
  entries: Entry[],
  platforms: PlatformConfig[],
  range: RangeKey
): PlatformExportStats[] {
  const cutoff = getRangeCutoff(range);
  const previousWindow = getPreviousRangeWindow(range);
  const dateStr = (p: AggregatedPeriod) => p.periodDate.toISOString().slice(0, 10);

  return platforms.map((config) => {
    // aggregateByPeriod trie déjà du plus récent au plus ancien.
    const periods = aggregateByPeriod(entries.filter((entry) => entry.platform === config.id));

    const currentPeriods = cutoff ? periods.filter((p) => dateStr(p) >= cutoff) : periods;
    const priorPeriods = previousWindow
      ? periods.filter((p) => dateStr(p) >= previousWindow.start && dateStr(p) < previousWindow.end)
      : [];

    const latest = currentPeriods[0] ?? null;
    const latestBeforeWindow = cutoff ? (periods.find((p) => dateStr(p) < cutoff) ?? null) : null;

    const followersEvolution =
      latest != null
        ? computeEvolution(latest.followers, latestBeforeWindow?.followers)
        : { value: null, direction: "flat" as const };

    const viewsValue = currentPeriods.reduce((sum, p) => sum + p.views, 0);
    const priorViews = priorPeriods.reduce((sum, p) => sum + p.views, 0);
    const viewsEvolution = previousWindow
      ? computeEvolution(viewsValue, priorPeriods.length ? priorViews : undefined)
      : { value: null, direction: "flat" as const };

    const interactionsPeriods = currentPeriods.filter((p) => p.interactions != null);
    const interactionsValue =
      config.hasFullMetrics && interactionsPeriods.length
        ? interactionsPeriods.reduce((sum, p) => sum + (p.interactions ?? 0), 0)
        : null;
    const priorInteractionsPeriods = priorPeriods.filter((p) => p.interactions != null);
    const priorInteractions = priorInteractionsPeriods.reduce(
      (sum, p) => sum + (p.interactions ?? 0),
      0
    );
    const interactionsEvolution =
      previousWindow && interactionsValue != null
        ? computeEvolution(
            interactionsValue,
            priorInteractionsPeriods.length ? priorInteractions : undefined
          )
        : { value: null, direction: "flat" as const };

    return {
      config,
      followers: { value: latest?.followers ?? null, evolution: followersEvolution },
      views: { value: viewsValue, evolution: viewsEvolution },
      interactions: { value: interactionsValue, evolution: interactionsEvolution },
    };
  });
}
