import { z } from "zod";

export const entryFormSchema = z.object({
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "YOUTUBE", "TIKTOK"]),
  periodType: z.enum(["WEEKLY", "MONTHLY"]),
  periodDate: z.string().min(1, "La date est requise"),
  followers: z.coerce.number().int().min(0, "Doit être positif"),
  impressions: z.coerce.number().int().min(0, "Doit être positif"),
  engagements: z.coerce.number().int().min(0, "Doit être positif"),
  watchTimeMinutes: z.coerce.number().int().min(0).optional(),
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;
