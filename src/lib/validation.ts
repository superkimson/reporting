import { z } from "zod";

export const entryFormSchema = z.object({
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "TIKTOK", "WHATSAPP", "YOUTUBE", "DAILYMOTION"]),
  edition: z.enum(["MA", "AG"]),
  periodType: z.enum(["WEEKLY", "MONTHLY"]),
  periodDate: z.string().min(1, "La date est requise"),
  followers: z.coerce.number().int().min(0, "Doit être positif"),
  views: z.coerce.number().int().min(0, "Doit être positif"),
  reach: z.coerce.number().int().min(0, "Doit être positif").optional(),
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;

// 2 Mo max par image, en base64 (~2.66 Mo bruts) — largement suffisant pour
// une miniature vidéo, mais évite qu'une base64 énorme ne finisse en base.
export const MAX_TOP_FIVE_IMAGE_BYTES = 2 * 1024 * 1024;

export const topFiveEntrySchema = z.object({
  periodDate: z.string().min(1, "Le mois est requis"),
  position: z.coerce.number().int().min(1).max(5),
  name: z.string().trim().min(1, "Le nom est requis").max(200),
  views: z.coerce.number().int().min(0, "Doit être positif"),
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
