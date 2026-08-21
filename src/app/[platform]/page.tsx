import { notFound } from "next/navigation";

import { KpiCard } from "@/components/kpi-card";
import { GrowthChart } from "@/components/growth-chart";
import { EntriesTable } from "@/components/entries-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORMS, PLATFORM_LIST } from "@/lib/platforms";
import { getAllEntries, getEntriesByPlatform } from "@/lib/queries";
import { computeDashboardSummary, computeGrowthSeries } from "@/lib/dashboard-metrics";
import { formatCompactNumber } from "@/lib/metrics";
import type { Platform } from "@/generated/prisma/enums";

export function generateStaticParams() {
  return PLATFORM_LIST.map((config) => ({ platform: config.id.toLowerCase() }));
}

function resolvePlatform(slug: string): Platform | null {
  const match = PLATFORM_LIST.find((config) => config.id.toLowerCase() === slug.toLowerCase());
  return match?.id ?? null;
}

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform: slug } = await params;
  const platform = resolvePlatform(slug);
  if (!platform) notFound();

  const config = PLATFORMS[platform];
  const Icon = config.icon;

  const [allEntries, entries] = await Promise.all([
    getAllEntries(),
    getEntriesByPlatform(platform),
  ]);

  const { summaries } = computeDashboardSummary(allEntries, PLATFORM_LIST);
  const growthSeries = computeGrowthSeries(allEntries);
  const summary = summaries.find((s) => s.platform === platform)!;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Icon className="size-8" style={{ color: config.color }} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{config.label}</h1>
          <p className="text-muted-foreground">Suivi détaillé des statistiques {config.label}.</p>
        </div>
      </div>

      {summary.current ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title={config.followersLabel}
            value={formatCompactNumber(summary.current.followers)}
            evolution={summary.followersEvolution}
          />
          <KpiCard
            title={config.viewsLabel}
            value={formatCompactNumber(summary.current.views)}
            evolution={summary.viewsEvolution}
          />
          {config.hasFullMetrics && (
            <>
              <KpiCard
                title={config.interactionsLabel}
                value={
                  summary.current.interactions != null
                    ? formatCompactNumber(summary.current.interactions)
                    : "—"
                }
                evolution={summary.interactionsEvolution}
              />
              <KpiCard
                title="Taux d'engagement"
                value={
                  summary.current.engagementRate
                    ? `${summary.current.engagementRate.toFixed(1)}%`
                    : "—"
                }
                evolution={{ value: null, direction: "flat" }}
                comparisonLabel="sur la dernière période"
              />
            </>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Aucune saisie pour {config.label} pour le moment. Rends-toi dans{" "}
          <span className="font-medium text-foreground">Saisie rapide</span> pour commencer.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Évolution des abonnés</CardTitle>
        </CardHeader>
        <CardContent>
          <GrowthChart data={growthSeries} platforms={[platform]} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Historique des saisies</h2>
        <EntriesTable entries={entries} exportFileName={config.id.toLowerCase()} />
      </div>
    </div>
  );
}
