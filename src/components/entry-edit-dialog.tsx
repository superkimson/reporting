"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditionToggle } from "@/components/edition-toggle";
import { updateEntry } from "@/actions/entries";
import { entryFormSchema, type EntryFormInput, type EntryFormValues } from "@/lib/validation";
import { PLATFORMS } from "@/lib/platforms";
import { formatNumber, parseNumberInput, toMonthInputValue } from "@/lib/metrics";
import type { Entry } from "@/generated/prisma/client";

function reformatNumericInput(event: React.FocusEvent<HTMLInputElement>) {
  const parsed = parseNumberInput(event.target.value);
  if (Number.isFinite(parsed)) {
    event.target.value = formatNumber(parsed);
  }
}

function valuesFromEntry(entry: Entry): EntryFormInput {
  return {
    platform: entry.platform,
    edition: entry.edition,
    periodType: entry.periodType,
    periodDate:
      entry.periodType === "MONTHLY"
        ? toMonthInputValue(entry.periodDate)
        : entry.periodDate.toISOString().slice(0, 10),
    followers: formatNumber(entry.followers),
    views: formatNumber(entry.views),
    reach: entry.reach != null ? formatNumber(entry.reach) : "",
  };
}

// Boîte de dialogue de correction d'une saisie : on peut y changer l'édition,
// le mois et les chiffres. Le réseau reste fixe (ses libellés et la présence
// de la portée en dépendent) — pour ça, supprimer et re-saisir.
export function EntryEditDialog({
  entry,
  onClose,
}: {
  entry: Entry | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormInput, unknown, EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
  });

  useEffect(() => {
    if (entry) reset(valuesFromEntry(entry));
  }, [entry, reset]);

  const edition = useWatch({ control, name: "edition" }) ?? entry?.edition ?? "MA";
  const config = entry ? PLATFORMS[entry.platform] : null;

  async function onSubmit(values: EntryFormValues) {
    if (!entry) return;
    const result = await updateEntry(entry.id, values);
    if (result.success) {
      toast.success("Saisie modifiée");
      router.refresh();
      onClose();
    } else {
      toast.error(result.error ?? "Erreur lors de la modification");
    }
  }

  return (
    <Dialog open={entry !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4" />
            Modifier la saisie
          </DialogTitle>
          <DialogDescription>
            {config?.label} — corrige le mois ou les chiffres puis enregistre.
          </DialogDescription>
        </DialogHeader>

        {entry && config && (
          <form
            id="entry-edit-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Édition</Label>
              <EditionToggle
                edition={edition}
                onChange={(value) => setValue("edition", value, { shouldDirty: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-periodDate">
                {entry.periodType === "MONTHLY" ? "Mois" : "Semaine du"}
              </Label>
              <Input
                id="edit-periodDate"
                type={entry.periodType === "MONTHLY" ? "month" : "date"}
                {...register("periodDate")}
              />
              {errors.periodDate && (
                <p className="text-xs text-destructive">{errors.periodDate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-followers">{config.followersLabel}</Label>
                <Input
                  id="edit-followers"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  {...register("followers", { onBlur: reformatNumericInput })}
                />
                {errors.followers && (
                  <p className="text-xs text-destructive">{errors.followers.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-views">{config.viewsLabel}</Label>
                <Input
                  id="edit-views"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  {...register("views", { onBlur: reformatNumericInput })}
                />
                {errors.views && (
                  <p className="text-xs text-destructive">{errors.views.message}</p>
                )}
              </div>

              {config.hasReach && (
                <div className="space-y-2">
                  <Label htmlFor="edit-reach">{config.reachLabel}</Label>
                  <Input
                    id="edit-reach"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="—"
                    {...register("reach", { onBlur: reformatNumericInput })}
                  />
                  {errors.reach && (
                    <p className="text-xs text-destructive">{errors.reach.message}</p>
                  )}
                </div>
              )}
            </div>
          </form>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="entry-edit-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
