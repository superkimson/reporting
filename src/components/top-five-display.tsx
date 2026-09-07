"use client";

import { useMemo, useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Play } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlurredThumbnail } from "@/components/blurred-thumbnail";
import { fetchTopFiveForMonth } from "@/actions/top-five";
import { formatCompactNumber } from "@/lib/metrics";
import type { TopFiveEntry } from "@/generated/prisma/client";

function toMonthKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMonthLabel(key: string) {
  return format(parseISO(key), "MMMM yyyy", { locale: fr });
}

export function TopFiveDisplay({
  initialMonth,
  initialEntries,
  availableMonths,
}: {
  initialMonth: Date;
  initialEntries: TopFiveEntry[];
  availableMonths: Date[];
}) {
  const monthOptions = useMemo(() => {
    const keys = new Set(availableMonths.map(toMonthKey));
    keys.add(toMonthKey(initialMonth));
    return Array.from(keys).sort((a, b) => b.localeCompare(a));
  }, [availableMonths, initialMonth]);

  const [selectedMonth, setSelectedMonth] = useState(toMonthKey(initialMonth));
  const [entries, setEntries] = useState(initialEntries);
  const [isPending, startTransition] = useTransition();

  function handleMonthChange(value: string | null) {
    if (!value) return;
    setSelectedMonth(value);
    startTransition(async () => {
      const next = await fetchTopFiveForMonth(value);
      setEntries(next);
    });
  }

  const slots = [1, 2, 3, 4, 5].map((position) => entries.find((e) => e.position === position));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Top 5 du mois</h2>
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-48">
            <SelectValue>{(value: string) => formatMonthLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((key) => (
              <SelectItem key={key} value={key}>
                {formatMonthLabel(key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 ${isPending ? "opacity-50" : ""}`}
      >
        {slots.map((entry, index) => {
          const thumbnail = (
            <div
              className={`relative flex aspect-[9/16] items-center justify-center overflow-hidden rounded-lg border bg-muted ${
                entry?.url ? "transition-opacity hover:opacity-90" : ""
              }`}
            >
              {entry ? (
                <BlurredThumbnail
                  src={entry.imageData}
                  alt={entry.name}
                  className="absolute inset-0"
                />
              ) : (
                <Play className="size-5 text-muted-foreground/40" />
              )}
            </div>
          );

          return (
            <div key={index} className="space-y-2">
              {entry?.url ? (
                <a href={entry.url} target="_blank" rel="noopener noreferrer">
                  {thumbnail}
                </a>
              ) : (
                thumbnail
              )}
              {entry && (
                <div>
                  <p className="truncate text-xs font-medium">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCompactNumber(entry.views)} vues
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
