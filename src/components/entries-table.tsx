"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, FileText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteEntry } from "@/actions/entries";
import { exportEntriesToCsv, exportEntriesToPdf } from "@/lib/export";
import { PLATFORMS, PLATFORM_LIST, PERIOD_TYPE_LABELS } from "@/lib/platforms";
import { formatCompactNumber } from "@/lib/metrics";
import type { Entry } from "@/generated/prisma/client";
import type { Platform } from "@/generated/prisma/enums";

export function EntriesTable({
  entries,
  showPlatformFilter = false,
  exportFileName = "statistiques",
}: {
  entries: Entry[];
  showPlatformFilter?: boolean;
  exportFileName?: string;
}) {
  const router = useRouter();
  const [platformFilter, setPlatformFilter] = useState<Platform | "ALL">("ALL");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      platformFilter === "ALL"
        ? entries
        : entries.filter((entry) => entry.platform === platformFilter),
    [entries, platformFilter]
  );

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteEntry(id);
      if (result.success) {
        toast.success("Saisie supprimée");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur lors de la suppression");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showPlatformFilter ? (
          <Select
            value={platformFilter}
            onValueChange={(value) => setPlatformFilter(value as Platform | "ALL")}
          >
            <SelectTrigger className="w-48">
              <SelectValue>
                {(value: string) =>
                  value === "ALL"
                    ? "Tous les réseaux"
                    : PLATFORMS[value as Platform]?.label ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les réseaux</SelectItem>
              {PLATFORM_LIST.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div />
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => exportEntriesToCsv(filtered, `${exportFileName}.csv`)}
          >
            <Download className="size-3.5" />
            Exporter CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => exportEntriesToPdf(filtered, `${exportFileName}.pdf`)}
          >
            <FileText className="size-3.5" />
            Exporter PDF
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {showPlatformFilter && <TableHead>Réseau</TableHead>}
              <TableHead>Édition</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Abonnés</TableHead>
              <TableHead className="text-right">Vues</TableHead>
              <TableHead className="text-right">Portée</TableHead>
              <TableHead className="text-right">Interactions</TableHead>
              <TableHead className="text-right">Taux</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={showPlatformFilter ? 10 : 9}
                  className="py-8 text-center text-muted-foreground"
                >
                  Aucune saisie pour le moment.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((entry) => {
              const config = PLATFORMS[entry.platform];
              return (
                <TableRow key={entry.id}>
                  {showPlatformFilter && (
                    <TableCell className="font-medium">{config.label}</TableCell>
                  )}
                  <TableCell className="text-muted-foreground">{entry.edition}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {PERIOD_TYPE_LABELS[entry.periodType]}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {entry.periodDate.toISOString().slice(0, 10)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCompactNumber(entry.followers)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCompactNumber(entry.views)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {entry.reach != null ? formatCompactNumber(entry.reach) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {entry.interactions != null ? formatCompactNumber(entry.interactions) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {entry.engagementRate ? `${entry.engagementRate.toFixed(1)}%` : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending}
                      onClick={() => handleDelete(entry.id)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
