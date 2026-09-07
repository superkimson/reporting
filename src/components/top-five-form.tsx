"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BlurredThumbnail } from "@/components/blurred-thumbnail";
import { MAX_TOP_FIVE_IMAGE_BYTES } from "@/lib/validation";
import { saveTopFiveEntry, deleteTopFiveEntry, fetchTopFiveForMonth } from "@/actions/top-five";
import type { TopFiveEntry } from "@/generated/prisma/client";

const POSITIONS = [1, 2, 3, 4, 5];

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type SlotMap = Record<number, TopFiveEntry | undefined>;

interface PendingUpload {
  position: number;
  imageData: string;
  name: string;
  views: string;
  url: string;
}

export function TopFiveForm() {
  const [month, setMonth] = useState(currentMonthValue());
  const [slots, setSlots] = useState<SlotMap>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTopFiveForMonth(`${month}-01`).then((entries) => {
      if (cancelled) return;
      const next: SlotMap = {};
      for (const entry of entries) next[entry.position] = entry;
      setSlots(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [month]);

  async function handleFile(position: number, file: File) {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Format non supporté : jpg ou png uniquement");
      return;
    }
    if (file.size > MAX_TOP_FIVE_IMAGE_BYTES) {
      toast.error("Image trop lourde (2 Mo max)");
      return;
    }

    const imageData = await readFileAsDataUrl(file);
    const existing = slots[position];
    setPending({
      position,
      imageData,
      name: existing?.name ?? "",
      views: existing ? String(existing.views) : "",
      url: existing?.url ?? "",
    });
  }

  function handleCancelPending() {
    setPending(null);
  }

  async function handleConfirmPending() {
    if (!pending) return;
    const views = Number(pending.views);
    if (!pending.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    if (!Number.isFinite(views) || views < 0) {
      toast.error("Nombre de vues invalide");
      return;
    }
    const url = pending.url.trim();
    if (!url) {
      toast.error("L'URL est requise");
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error("URL invalide");
      return;
    }

    setIsSaving(true);
    const result = await saveTopFiveEntry({
      periodDate: `${month}-01`,
      position: pending.position,
      name: pending.name.trim(),
      views,
      url,
      imageData: pending.imageData,
    });
    setIsSaving(false);

    if (result.success) {
      toast.success("Vidéo ajoutée au Top 5");
      const entries = await fetchTopFiveForMonth(`${month}-01`);
      const next: SlotMap = {};
      for (const entry of entries) next[entry.position] = entry;
      setSlots(next);
      setPending(null);
    } else {
      toast.error(result.error ?? "Erreur lors de l'enregistrement");
    }
  }

  async function handleRemove(position: number) {
    const entry = slots[position];
    if (!entry) return;
    const result = await deleteTopFiveEntry(entry.id);
    if (result.success) {
      toast.success("Emplacement vidé");
      setSlots((prev) => ({ ...prev, [position]: undefined }));
    } else {
      toast.error(result.error ?? "Erreur lors de la suppression");
    }
  }

  return (
    <div className="space-y-4 border-t pt-8">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Top 5 du mois</h2>
        <p className="text-sm text-muted-foreground">
          Les 5 vidéos les plus vues du mois, avec leur miniature.
        </p>
      </div>

      <div className="max-w-48 space-y-2">
        <Label htmlFor="top-five-month">Mois</Label>
        <Input
          id="top-five-month"
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {POSITIONS.map((position) => {
          const entry = slots[position];
          return (
            <div key={position} className="space-y-2">
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files[0];
                  if (file) handleFile(position, file);
                }}
                onClick={() => fileInputs.current[position]?.click()}
                className={cn(
                  "relative flex aspect-[9/16] cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-dashed text-center transition-colors",
                  entry
                    ? "border-solid border-border"
                    : "border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted/40"
                )}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : entry ? (
                  <BlurredThumbnail
                    src={entry.imageData}
                    alt={entry.name}
                    className="absolute inset-0"
                  />
                ) : (
                  <>
                    <ImagePlus className="size-5 text-muted-foreground" />
                    <span className="px-2 text-xs text-muted-foreground">
                      Clic ou glisser une image
                    </span>
                  </>
                )}
                <input
                  ref={(el) => {
                    fileInputs.current[position] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleFile(position, file);
                    event.target.value = "";
                  }}
                />
              </div>

              {entry && (
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.views.toLocaleString("fr-FR")} vues
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemove(position)}
                    aria-label="Retirer"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && handleCancelPending()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-4" />
              Détails de la vidéo
            </DialogTitle>
            <DialogDescription>
              Emplacement {pending?.position} du Top 5 — {month}
            </DialogDescription>
          </DialogHeader>

          {pending && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <BlurredThumbnail
                  src={pending.imageData}
                  alt="Aperçu"
                  className="aspect-[9/16] w-32 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="top-five-name">Nom de la vidéo</Label>
                <Input
                  id="top-five-name"
                  value={pending.name}
                  onChange={(event) =>
                    setPending((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                  }
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="top-five-views">Nombre de vues</Label>
                <Input
                  id="top-five-views"
                  type="number"
                  min={0}
                  value={pending.views}
                  onChange={(event) =>
                    setPending((prev) => (prev ? { ...prev, views: event.target.value } : prev))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="top-five-url">URL</Label>
                <Input
                  id="top-five-url"
                  type="url"
                  placeholder="https://..."
                  value={pending.url}
                  onChange={(event) =>
                    setPending((prev) => (prev ? { ...prev, url: event.target.value } : prev))
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelPending}>
              Annuler
            </Button>
            <Button type="button" onClick={handleConfirmPending} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
