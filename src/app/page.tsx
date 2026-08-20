import { KpiCard } from "@/components/kpi-card";
import { GrowthChart } from "@/components/growth-chart";
import { EngagementChart } from "@/components/engagement-chart";
import { PlatformSummaryCard } from "@/components/platform-summary-card";
import { EntriesTable } from "@/components/entries-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDashboardData,
  getGrowthSeries,
  getEngagementSeries,
  getAllEntries,
} from "@/lib/queries";
import { formatCompactNumber } from "@/lib/metrics";

export default async function DashboardPage() {
  const [{ kpis, summaries }, growthSeries, engagementSeries, allEntries] = await Promise.all([
    getDashboardData(),
    getGrowthSeries(),
    getEngagementSeries(),
    getAllEntries(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="text-muted-foreground">
          Suivi consolidé de tous vos réseaux sociaux.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Abonnés totaux"
          value={formatCompactNumber(kpis.totalFollowers)}
          evolution={kpis.totalFollowersEvolution}
        />
        <KpiCard
          title="Portée globale"
          value={formatCompactNumber(kpis.totalImpressions)}
          evolution={kpis.totalImpressionsEvolution}
        />
        <KpiCard
          title="Engagement moyen"
          value={`${kpis.avgEngagementRate.toFixed(1)}%`}
          evolution={kpis.avgEngagementRateEvolution}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Croissance des abonnés</CardTitle>
        </CardHeader>
        <CardContent>
          <GrowthChart data={growthSeries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vues et engagements, tous réseaux confondus</CardTitle>
        </CardHeader>
        <CardContent>
          <EngagementChart data={engagementSeries} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Détail par réseau</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <PlatformSummaryCard key={summary.platform} summary={summary} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Historique complet des saisies
        </h2>
        <EntriesTable entries={allEntries} showPlatformFilter exportFileName="statistiques" />
      </div>
    </div>
  );
}
