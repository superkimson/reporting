import type { Edition } from "@/generated/prisma/enums";

export interface EditionConfig {
  id: Edition;
  label: string;
  shortLabel: string;
}

export const EDITIONS: Record<Edition, EditionConfig> = {
  MA: { id: "MA", label: "Moniteur Automobile", shortLabel: "MA" },
  AG: { id: "AG", label: "AutoGids", shortLabel: "AG" },
};

export const EDITION_LIST = Object.values(EDITIONS);
