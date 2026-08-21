import { z } from "zod";

export const entryFormSchema = z.object({
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "TIKTOK", "WHATSAPP", "YOUTUBE", "DAILYMOTION"]),
  periodType: z.enum(["WEEKLY", "MONTHLY"]),
  periodDate: z.string().min(1, "La date est requise"),
  followers: z.coerce.number().int().min(0, "Doit être positif"),
  views: z.coerce.number().int().min(0, "Doit être positif"),
  reach: z.coerce.number().int().min(0, "Doit être positif").optional(),
  interactions: z.coerce.number().int().min(0, "Doit être positif").optional(),
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;
