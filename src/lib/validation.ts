import { z } from "zod";
import { parseNumberInput } from "./metrics";

// Les champs saisis peuvent contenir un "." comme séparateur de milliers
// (ex. "12.345") ou non (ex. "12345") — on l'enlève avant conversion plutôt
// que de laisser z.coerce.number() l'interpréter comme une décimale.
function stripThousandsSeparator(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    return parseNumberInput(trimmed);
  }
  return value;
}

const integerFromDisplay = z.preprocess(
  stripThousandsSeparator,
  z.number().int().min(0, "Doit être positif")
);

export const entryFormSchema = z.object({
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "TIKTOK", "WHATSAPP", "YOUTUBE", "DAILYMOTION"]),
  edition: z.enum(["MA", "AG"]),
  periodType: z.enum(["WEEKLY", "MONTHLY"]),
  periodDate: z.string().min(1, "La date est requise"),
  followers: integerFromDisplay,
  views: integerFromDisplay,
  reach: z.preprocess(stripThousandsSeparator, z.number().int().min(0, "Doit être positif").optional()),
});

// z.preprocess() rend le type d'entrée (avant parsing) distinct du type de
// sortie (followers/views/reach : string ou number en entrée, number en
// sortie) — nécessaire pour typer le useForm de react-hook-form (le 3e
// générique TTransformedValues) sans conflit de type.
export type EntryFormInput = z.input<typeof entryFormSchema>;
export type EntryFormValues = z.output<typeof entryFormSchema>;

// 2 Mo max par image, en base64 (~2.66 Mo bruts) — largement suffisant pour
// une miniature vidéo, mais évite qu'une base64 énorme ne finisse en base.
export const MAX_TOP_FIVE_IMAGE_BYTES = 2 * 1024 * 1024;

export const topFiveEntrySchema = z.object({
  periodDate: z.string().min(1, "Le mois est requis"),
  position: z.coerce.number().int().min(1).max(5),
  name: z.string().trim().min(1, "Le nom est requis").max(200),
  views: integerFromDisplay,
  url: z.string().trim().min(1, "L'URL est requise").url("URL invalide"),
  imageData: z
    .string()
    .min(1, "Une image est requise")
    .refine((value) => value.startsWith("data:image/jpeg;") || value.startsWith("data:image/png;"), {
      message: "Format d'image non supporté (jpg ou png uniquement)",
    })
    .refine((value) => (value.length * 3) / 4 <= MAX_TOP_FIVE_IMAGE_BYTES, {
      message: "Image trop lourde (2 Mo max)",
    }),
});

export type TopFiveEntryFormValues = z.infer<typeof topFiveEntrySchema>;
