import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLATFORMS } from "@/lib/platforms";
import { formatCompactNumber, formatEvolution } from "@/lib/metrics";
import type { PlatformSummary } from "@/lib/queries";

function EvolutionBadge({ evolution }: { evolution: PlatformSummary["followersEvolution"] }) {
  const isUp = evolution.direction === "up";
  const isDown = evolution.direction === "down";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        isUp && "text-[#006300] dark:text-[#0ca30c]",
        isDown && "text-destructive",
        !isUp && !isDown && "text-muted-foreground"
      )}
    >
      {isUp && <TrendingUp className="size-3" />}
      {isDown && <TrendingDown className="size-3" />}
      {!isUp && !isDown && <Minus className="size-3" />}
      {formatEvolution(evolution)}
    </span>
  );
}

export function PlatformSummaryCard({ summary }: { summary: PlatformSummary }) {
  const config = PLATFORMS[summary.platform];
  const Icon = config.icon;

  return (
    <Link href={`/${config.id.toLowerCase()}`}>
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="size-4" style={{ color: config.color }} />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{config.followersLabel}</span>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold tabular-nums">
                {summary.current ? formatCompactNumber(summary.current.followers) : "—"}
              </span>
              <EvolutionBadge evolution={summary.followersEvolution} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{config.impressionsLabel}</span>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold tabular-nums">
                {summary.current ? formatCompactNumber(summary.current.impressions) : "—"}
              </span>
              <EvolutionBadge evolution={summary.impressionsEvolution} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{config.engagementsLabel}</span>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold tabular-nums">
                {summary.current ? formatCompactNumber(summary.current.engagements) : "—"}
              </span>
              <EvolutionBadge evolution={summary.engagementsEvolution} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
