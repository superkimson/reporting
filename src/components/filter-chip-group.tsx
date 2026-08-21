"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ChipSelection<T extends string> = "ALL" | T[];

export interface ChipOption<T extends string> {
  id: T;
  content: ReactNode;
  label: string;
}

// Groupe de filtres "All" + options cumulables : sélectionner une option
// désélectionne "All" ; en resélectionner plusieurs les cumule ; vider la
// sélection revient automatiquement à "All".
export function FilterChipGroup<T extends string>({
  options,
  selection,
  onChange,
  allLabel = "All",
}: {
  options: ChipOption<T>[];
  selection: ChipSelection<T>;
  onChange: (next: ChipSelection<T>) => void;
  allLabel?: string;
}) {
  function toggleAll() {
    onChange("ALL");
  }

  function toggleOption(id: T) {
    if (selection === "ALL") {
      onChange([id]);
      return;
    }
    const next = selection.includes(id)
      ? selection.filter((o) => o !== id)
      : [...selection, id];
    onChange(next.length === 0 ? "ALL" : next);
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={toggleAll}
        aria-pressed={selection === "ALL"}
        className={cn(
          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          selection === "ALL"
            ? "border-foreground bg-foreground text-background"
            : "border-border text-muted-foreground hover:text-foreground"
        )}
      >
        {allLabel}
      </button>

      {options.map((option) => {
        const isActive = selection !== "ALL" && selection.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggleOption(option.id)}
            aria-pressed={isActive}
            title={option.label}
            aria-label={option.label}
            className={cn(
              "flex items-center justify-center rounded-full border p-2 transition-colors",
              isActive
                ? "border-foreground bg-muted"
                : "border-border text-muted-foreground hover:bg-muted/50"
            )}
          >
            {option.content}
          </button>
        );
      })}
    </div>
  );
}
