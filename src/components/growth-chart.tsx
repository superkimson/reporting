"use client";

import { useMemo, useState } from "react";
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
import type { GrowthPoint } from "@/lib/queries";
import type { Platform } from "@/generated/prisma/enums";

function formatMonth(value: string) {
  return format(parseISO(value), "MMM yy", { locale: fr });
}

type RangeKey = "1M" | "3M" | "6M" | "YTD" | "1Y" | "MAX";

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "6M", label: "6M" },
  { key: "YTD", label: "YTD" },
  { key: "1Y", label: "1 an" },
  { key: "MAX", label: "Max" },
];

function getRangeCutoff(range: RangeKey): Date | null {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  switch (range) {
    case "1M":
      return new Date(Date.UTC(year, month - 1, 1));
    case "3M":
      return new Date(Date.UTC(year, month - 3, 1));
    case "6M":
      return new Date(Date.UTC(year, month - 6, 1));
    case "YTD":
      return new Date(Date.UTC(year, 0, 1));
    case "1Y":
      return new Date(Date.UTC(year - 1, month, 1));
    case "MAX":
      return null;
  }
}

export function GrowthChart({
  data,
  platforms,
}: {
  data: GrowthPoint[];
  /** Restreint les lignes affichées (et masque la légende s'il n'y en a qu'une). */
  platforms?: Platform[];
}) {
  const [range, setRange] = useState<RangeKey>("MAX");

  const seriesConfigs = platforms
    ? PLATFORM_LIST.filter((config) => platforms.includes(config.id))
    : PLATFORM_LIST;

  const cutoff = useMemo(() => getRangeCutoff(range), [range]);
  const filteredData = useMemo(() => {
    if (!cutoff) return data;
    return data.filter((point) => parseISO(point.periodDate) >= cutoff);
  }, [data, cutoff]);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-[3px]">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option.key)}
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
              formatter={(value: string) =>
                PLATFORM_LIST.find((p) => p.id === value)?.label ?? value
              }
              wrapperStyle={{ fontSize: 12 }}
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
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
