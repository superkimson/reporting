"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

import { formatCompactNumber } from "@/lib/metrics";
import type { EngagementPoint } from "@/lib/queries";

function formatMonth(value: string) {
  return format(parseISO(value), "MMM yy", { locale: fr });
}

// Deux graphiques distincts (plutôt qu'un seul à double axe) car vues et
// engagements n'ont pas la même échelle de grandeur.
function SingleMetricBarChart({
  data,
  dataKey,
  color,
}: {
  data: EngagementPoint[];
  dataKey: "impressions" | "engagements";
  color: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          formatter={(value) => [formatCompactNumber(Number(value)), ""]}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
          }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EngagementChart({ data }: { data: EngagementPoint[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Impressions / Vues totales
        </p>
        <SingleMetricBarChart data={data} dataKey="impressions" color="var(--chart-1)" />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Engagements</p>
        <SingleMetricBarChart data={data} dataKey="engagements" color="var(--chart-2)" />
      </div>
    </div>
  );
}
