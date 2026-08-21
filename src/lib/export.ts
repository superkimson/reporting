import Papa from "papaparse";
import type { Entry } from "@/generated/prisma/client";
import { PLATFORMS, PERIOD_TYPE_LABELS } from "@/lib/platforms";

function toRow(entry: Entry) {
  const config = PLATFORMS[entry.platform];
  return {
    Réseau: config.label,
    Édition: entry.edition,
    Période: PERIOD_TYPE_LABELS[entry.periodType],
    Date: entry.periodDate.toISOString().slice(0, 10),
    [config.followersLabel]: entry.followers,
    [config.viewsLabel]: entry.views,
    [config.reachLabel]: entry.reach ?? "",
    [config.interactionsLabel]: entry.interactions ?? "",
    "Taux d'engagement (%)": entry.engagementRate?.toFixed(2) ?? "",
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportEntriesToCsv(entries: Entry[], filename = "statistiques.csv") {
  const csv = Papa.unparse(entries.map(toRow));
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}

export async function exportEntriesToPdf(entries: Entry[], filename = "statistiques.pdf") {
  const { pdf } = await import("@react-pdf/renderer");
  const { EntriesPdfDocument } = await import("@/components/entries-pdf-document");
  const blob = await pdf(EntriesPdfDocument({ entries })).toBlob();
  downloadBlob(blob, filename);
}
