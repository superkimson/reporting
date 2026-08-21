"use client";

import { useMemo, useState } from "react";

import { KpiCard } from "@/components/kpi-card";
import { GrowthChart } from "@/components/growth-chart";
import { EntriesTable } from "@/components/entries-table";
import { FilterChipGroup, type ChipSelection } from "@/components/filter-chip-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EDITION_LIST } from "@/lib/editions";
import { PLATFORMS } from "@/lib/platforms";
import { formatCompactNumber } from "@/lib/metrics";
import { computeDashboardSummary, computeGrowthSeries } from "@/lib/dashboard-metrics";
import type { Entry } from "@/generated/prisma/client";
import type { Edition, Platform } from "@/generated/prisma/enums";

export function PlatformView({ platform, entries }: { platform: Platform; entries: Entry[] }) {
  const config = PLATFORMS[platform];
  const [editionSelection, setEditionSelection] = useState<ChipSelection<Edition>>("ALL");
  const Icon = config.icon;

  const filteredEntries = useMemo(() => {
    if (editionSelection === "ALL") return entries;
    return entries.filter((entry) => editionSelection.includes(entry.edition));
  }, [entries, editionSelection]);

  const { summaries } = useMemo(
    () => computeDashboardSummary(filteredEntries, [config]),
    [filteredEntries, config]
  );
  const growthSeries = useMemo(() => computeGrowthSeries(filteredEntries), [filteredEntries]);
  const summary = summaries[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon className="size-8" style={{ color: config.color }} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{config.label}</h1>
            <p className="text-muted-foreground">
              Suivi détaillé des statistiques {config.label}.
            </p>
          </div>
        </div>

        <FilterChipGroup
          options={EDITION_LIST.map((edition) => ({
            id: edition.id,
            label: edition.label,
            content: <span className="text-xs font-semibold">{edition.shortLabel}</span>,
          }))}
          selection={editionSelection}
          onChange={setEditionSelection}
        />
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
          <GrowthChart data={growthSeries} platforms={[config.id]} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Historique des saisies</h2>
        <EntriesTable entries={filteredEntries} exportFileName={config.id.toLowerCase()} />
      </div>
    </div>
  );
}
