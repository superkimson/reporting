"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { PLATFORM_LIST } from "@/lib/platforms";
import { formatCompactNumber } from "@/lib/metrics";
import { RANGE_OPTIONS, getRangeCutoff, type RangeKey } from "@/lib/date-range";
import type { GrowthPoint } from "@/lib/dashboard-metrics";
import type { Platform } from "@/generated/prisma/enums";

function formatMonth(value: string) {
  return format(parseISO(value), "MMM yy", { locale: fr });
}

export function GrowthChart({
  data,
  platforms,
  range,
  onRangeChange,
}: {
  data: GrowthPoint[];
  /** Restreint les lignes affichées (et masque la légende s'il n'y en a qu'une). */
  platforms?: Platform[];
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
}) {
  const seriesConfigs = platforms
    ? PLATFORM_LIST.filter((config) => platforms.includes(config.id))
    : PLATFORM_LIST;

  const cutoff = useMemo(() => getRangeCutoff(range), [range]);
  const filteredData = useMemo(() => {
    if (!cutoff) return data;
    return data.filter((point) => point.periodDate >= cutoff);
  }, [data, cutoff]);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-[3px]">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onRangeChange(option.key)}
              aria-pressed={range === option.key}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                range === option.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={filteredData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="periodDate"
            tickFormatter={formatMonth}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tickFormatter={(value) => formatCompactNumber(Number(value))}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            labelFormatter={(value) => formatMonth(String(value))}
            formatter={(value, name) => [
              formatCompactNumber(Number(value)),
              PLATFORM_LIST.find((p) => p.id === name)?.label ?? String(name),
            ]}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
            }}
          />
          {seriesConfigs.length > 1 && (
            <Legend
              // Recharts trie sinon la légende alphabétiquement par dataKey : un
              // contenu personnalisé impose l'ordre de seriesConfigs (celui des
              // filtres réseau) plutôt que de dépendre de son tri interne.
              content={() => (
                <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                  {seriesConfigs.map((config) => (
                    <li key={config.id} className="flex items-center gap-1.5">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="text-muted-foreground">{config.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            />
          )}
          {seriesConfigs.map((config) => (
            <Line
              key={config.id}
              type="monotone"
              dataKey={config.id}
              name={config.id}
              stroke={config.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive
              animationDuration={200}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
