"use client";

import { useMemo, useState } from "react";

import { KpiCard } from "@/components/kpi-card";
import { GrowthChart } from "@/components/growth-chart";
import { EngagementChart } from "@/components/engagement-chart";
import { PlatformSummaryCard } from "@/components/platform-summary-card";
import { EntriesTable } from "@/components/entries-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLATFORM_LIST } from "@/lib/platforms";
import { formatCompactNumber } from "@/lib/metrics";
import {
  computeDashboardSummary,
  computeGrowthSeries,
  computeEngagementSeries,
} from "@/lib/dashboard-metrics";
import type { Entry } from "@/generated/prisma/client";
import type { Platform } from "@/generated/prisma/enums";

type Selection = "ALL" | Platform[];

function PlatformFilterBar({
  selection,
  onChange,
}: {
  selection: Selection;
  onChange: (next: Selection) => void;
}) {
  function toggleAll() {
    onChange("ALL");
  }

  function togglePlatform(platform: Platform) {
    if (selection === "ALL") {
      onChange([platform]);
      return;
    }
    const next = selection.includes(platform)
      ? selection.filter((p) => p !== platform)
      : [...selection, platform];
    onChange(next.length === 0 ? "ALL" : next);
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={toggleAll}
        aria-pressed={selection === "ALL"}
        className={cn(
          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          selection === "ALL"
            ? "border-foreground bg-foreground text-background"
            : "border-border text-muted-foreground hover:text-foreground"
        )}
      >
        All
      </button>

      {PLATFORM_LIST.map((config) => {
        const Icon = config.icon;
        const isActive = selection !== "ALL" && selection.includes(config.id);
        return (
          <button
            key={config.id}
            type="button"
            onClick={() => togglePlatform(config.id)}
            aria-pressed={isActive}
            title={config.label}
            aria-label={config.label}
            className={cn(
              "flex items-center justify-center rounded-full border p-2 transition-colors",
              isActive
                ? "border-foreground bg-muted"
                : "border-border text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="size-4" style={{ color: config.color }} />
          </button>
        );
      })}
    </div>
  );
}

export function DashboardView({ entries }: { entries: Entry[] }) {
  const [selection, setSelection] = useState<Selection>("ALL");

  const selectedPlatforms = useMemo(
    () =>
      selection === "ALL"
        ? PLATFORM_LIST
        : PLATFORM_LIST.filter((config) => selection.includes(config.id)),
    [selection]
  );

  const filteredEntries = useMemo(() => {
    if (selection === "ALL") return entries;
    return entries.filter((entry) => selection.includes(entry.platform));
  }, [entries, selection]);

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
        <PlatformFilterBar selection={selection} onChange={setSelection} />
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
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Historique complet des saisies
        </h2>
        <EntriesTable
          entries={filteredEntries}
          showPlatformFilter
          exportFileName="statistiques"
        />
      </div>
    </div>
  );
}
