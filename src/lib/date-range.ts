export type RangeKey = "1M" | "3M" | "6M" | "YTD" | "1Y" | "MAX";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "6M", label: "6M" },
  { key: "YTD", label: "YTD" },
  { key: "1Y", label: "1 an" },
  { key: "MAX", label: "Max" },
];

export const RANGE_DESCRIPTIONS: Record<RangeKey, string> = {
  "1M": "Mois dernier et en cours",
  "3M": "3 derniers mois",
  "6M": "6 derniers mois",
  YTD: "Depuis janvier",
  "1Y": "12 derniers mois",
  MAX: "Historique complet",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function ymString(year: number, monthIndex: number): string {
  const d = new Date(year, monthIndex, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}

// Comparaison en chaîne "YYYY-MM-01" plutôt qu'en objets Date : periodDate est
// déjà normalisé sous cette forme, ça évite tout décalage de fuseau horaire
// entre le calcul de la borne (locale) et le parsing des points (UTC).
export function getRangeCutoff(range: RangeKey): string | null {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (range) {
    case "1M":
      return ymString(year, month - 1);
    case "3M":
      return ymString(year, month - 3);
    case "6M":
      return ymString(year, month - 6);
    case "YTD":
      return `${year}-01-01`;
    case "1Y":
      return ymString(year, month - 12);
    case "MAX":
      return null;
  }
}

function rangeSpanMonths(range: RangeKey): number {
  switch (range) {
    case "1M":
      return 1;
    case "3M":
      return 3;
    case "6M":
      return 6;
    case "1Y":
      return 12;
    case "YTD":
      return new Date().getMonth() + 1;
    case "MAX":
      return 0;
  }
}

// Fenêtre de comparaison "précédente", de même durée, juste avant le début de
// la période sélectionnée — pour calculer une évolution période sur période
// (ex: les 3 mois qui précèdent les "3 derniers mois").
export function getPreviousRangeWindow(range: RangeKey): { start: string; end: string } | null {
  const start = getRangeCutoff(range);
  if (!start) return null; // MAX : pas de période de comparaison naturelle.

  const span = rangeSpanMonths(range);
  const [y, m] = start.split("-").map(Number);
  const previousStart = ymString(y, m - 1 - span);

  return { start: previousStart, end: start };
}
