"use client";

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

import { PLATFORM_LIST } from "@/lib/platforms";
import { formatCompactNumber } from "@/lib/metrics";
import type { GrowthPoint } from "@/lib/queries";
import type { Platform } from "@/generated/prisma/enums";

function formatMonth(value: string) {
  return format(parseISO(value), "MMM yy", { locale: fr });
}

export function GrowthChart({
  data,
  platforms,
}: {
  data: GrowthPoint[];
  /** Restreint les lignes affichées (et masque la légende s'il n'y en a qu'une). */
  platforms?: Platform[];
}) {
  const seriesConfigs = platforms
    ? PLATFORM_LIST.filter((config) => platforms.includes(config.id))
    : PLATFORM_LIST;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
            stroke={config.chartVar}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
