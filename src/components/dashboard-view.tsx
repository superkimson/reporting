"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { KpiCard } from "@/components/kpi-card";
import { GrowthChart } from "@/components/growth-chart";
import { EngagementChart } from "@/components/engagement-chart";
import { PlatformSummaryCard } from "@/components/platform-summary-card";
import { EntriesTable } from "@/components/entries-table";
import { FilterChipGroup, type ChipSelection } from "@/components/filter-chip-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLATFORM_LIST } from "@/lib/platforms";
import { EDITION_LIST } from "@/lib/editions";
import { formatCompactNumber } from "@/lib/metrics";
import {
  computeDashboardSummary,
  computeGrowthSeries,
  computeEngagementSeries,
} from "@/lib/dashboard-metrics";
import type { Entry } from "@/generated/prisma/client";
import type { Platform, Edition } from "@/generated/prisma/enums";

export function DashboardView({
  entries,
  isEditor,
}: {
  entries: Entry[];
  isEditor: boolean;
}) {
  const [platformSelection, setPlatformSelection] = useState<ChipSelection<Platform>>("ALL");
  const [editionSelection, setEditionSelection] = useState<ChipSelection<Edition>>("ALL");
  const [historyOpen, setHistoryOpen] = useState(false);

  const selectedPlatforms = useMemo(
    () =>
      platformSelection === "ALL"
        ? PLATFORM_LIST
        : PLATFORM_LIST.filter((config) => platformSelection.includes(config.id)),
    [platformSelection]
  );

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesPlatform =
        platformSelection === "ALL" || platformSelection.includes(entry.platform);
      const matchesEdition =
        editionSelection === "ALL" || editionSelection.includes(entry.edition);
      return matchesPlatform && matchesEdition;
    });
  }, [entries, platformSelection, editionSelection]);

  const { kpis, summaries } = useMemo(
    () => computeDashboardSummary(filteredEntries, selectedPlatforms),
    [filteredEntries, selectedPlatforms]
  );
  const growthSeries = useMemo(() => computeGrowthSeries(filteredEntries), [filteredEntries]);
  const engagementSeries = useMemo(
    () => computeEngagementSeries(filteredEntries),
    [filteredEntries]
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vue d&apos;ensemble</h1>
          <p className="text-muted-foreground">
            Suivi consolidé de tous vos réseaux sociaux.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterChipGroup
            options={EDITION_LIST.map((config) => ({
              id: config.id,
              label: config.label,
              content: <span className="text-xs font-semibold">{config.shortLabel}</span>,
            }))}
            selection={editionSelection}
            onChange={setEditionSelection}
            exclusive
          />

          <span className="h-6 w-px bg-border" />

          <FilterChipGroup
            options={PLATFORM_LIST.map((config) => {
              const Icon = config.icon;
              return {
                id: config.id,
                label: config.label,
                content: <Icon className="size-4" style={{ color: config.color }} />,
              };
            })}
            selection={platformSelection}
            onChange={setPlatformSelection}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Abonnés totaux"
          value={formatCompactNumber(kpis.totalFollowers)}
          evolution={kpis.totalFollowersEvolution}
        />
        <KpiCard
          title="Portée globale"
          value={formatCompactNumber(kpis.totalViews)}
          evolution={kpis.totalViewsEvolution}
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
          <GrowthChart
            data={growthSeries}
            platforms={selectedPlatforms.map((config) => config.id)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vues et interactions, réseaux sélectionnés</CardTitle>
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
        <button
          type="button"
          onClick={() => setHistoryOpen((open) => !open)}
          aria-expanded={historyOpen}
          className="mb-4 flex w-full items-center justify-between gap-2 text-left"
        >
          <h2 className="text-lg font-semibold tracking-tight">
            Historique complet des saisies
          </h2>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform",
              historyOpen && "rotate-180"
            )}
          />
        </button>
        {historyOpen && (
          <EntriesTable
            entries={filteredEntries}
            showPlatformFilter
            exportFileName="statistiques"
            isEditor={isEditor}
          />
        )}
      </div>
    </div>
  );
}
