import Papa from "papaparse";
import { toast } from "sonner";
import type { Entry } from "@/generated/prisma/client";
import { PLATFORMS, PERIOD_TYPE_LABELS } from "@/lib/platforms";
import type { PlatformExportStats } from "@/lib/dashboard-metrics";

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

// Les exports PDF sont déclenchés depuis un onClick sans await : sans ce
// garde-fou, un échec (CSP, import dynamique, rendu) serait invisible.
async function downloadPdf(render: () => Promise<Blob>, filename: string) {
  try {
    downloadBlob(await render(), filename);
  } catch (error) {
    console.error("Export PDF impossible :", error);
    toast.error("L'export PDF a échoué. Réessaie ou contacte l'administrateur.");
  }
}

export async function exportEntriesToPdf(entries: Entry[], filename = "statistiques.pdf") {
  await downloadPdf(async () => {
    const { pdf } = await import("@react-pdf/renderer");
    const { EntriesPdfDocument } = await import("@/components/entries-pdf-document");
    return pdf(EntriesPdfDocument({ entries })).toBlob();
  }, filename);
}

export async function exportSummaryToPdf(
  stats: PlatformExportStats[],
  editionLabel: string,
  rangeLabel: string,
  filename = "recapitulatif.pdf"
) {
  await downloadPdf(async () => {
    const { pdf } = await import("@react-pdf/renderer");
    const { SummaryPdfDocument } = await import("@/components/summary-pdf-document");
    return pdf(SummaryPdfDocument({ stats, editionLabel, rangeLabel })).toBlob();
  }, filename);
}
