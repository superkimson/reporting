export interface Evolution {
  value: number | null;
  direction: "up" | "down" | "flat";
}

// Calcule l'évolution en % entre une valeur courante et une valeur précédente.
// Retourne null si aucune valeur précédente n'est disponible (première saisie).
export function computeEvolution(
  current: number,
  previous: number | undefined | null
): Evolution {
  if (previous === undefined || previous === null || previous === 0) {
    return { value: null, direction: "flat" };
  }

  const value = ((current - previous) / previous) * 100;
  return {
    value,
    direction: value > 0 ? "up" : value < 0 ? "down" : "flat",
  };
}

export function formatEvolution(evolution: Evolution): string {
  if (evolution.value === null) return "—";
  const sign = evolution.value > 0 ? "+" : "";
  return `${sign}${evolution.value.toFixed(1)}%`;
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(value);
}

// Affichage des nombres complets (tables, PDF, saisies) : "." comme séparateur
// de milliers, ex. 12345 -> "12.345". Distinct de formatCompactNumber (12 k),
// gardé pour les KPI/graphiques où l'espace est compté.
export function formatNumber(value: number): string {
  return Math.trunc(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Parse une saisie utilisateur en acceptant ou non le "." comme séparateur de
// milliers (ex. "12.345" et "12345" donnent tous les deux 12345) plutôt que de
// l'interpréter comme une décimale.
export function parseNumberInput(value: string): number {
  return Number(value.replace(/\./g, "").trim());
}

// Ramène la date saisie au repère canonique de sa période (1er du mois, ou lundi
// de la semaine) pour qu'une saisie répétée le même mois/semaine mette à jour
// l'entrée existante au lieu d'en créer une nouvelle par jour.
export function normalizePeriodDate(isoDate: string, periodType: "WEEKLY" | "MONTHLY"): Date {
  const date = new Date(isoDate);

  if (periodType === "MONTHLY") {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }

  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + diffToMonday));
}
