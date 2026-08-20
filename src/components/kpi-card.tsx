import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatEvolution, type Evolution } from "@/lib/metrics";

interface KpiCardProps {
  title: string;
  value: string;
  evolution: Evolution;
  comparisonLabel?: string;
}

export function KpiCard({
  title,
  value,
  evolution,
  comparisonLabel = "vs période précédente",
}: KpiCardProps) {
  const isUp = evolution.direction === "up";
  const isDown = evolution.direction === "down";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <div className="font-display text-4xl font-bold tracking-tight tabular-nums">
          {value}
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isUp && "bg-[color-mix(in_oklch,var(--chart-4),transparent_85%)] text-[#006300] dark:text-[#0ca30c]",
              isDown && "bg-[color-mix(in_oklch,var(--destructive),transparent_85%)] text-destructive",
              !isUp && !isDown && "bg-muted text-muted-foreground"
            )}
          >
            {isUp && <TrendingUp className="size-3" />}
            {isDown && <TrendingDown className="size-3" />}
            {!isUp && !isDown && <Minus className="size-3" />}
            {formatEvolution(evolution)}
          </span>
          <span className="text-muted-foreground">{comparisonLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
