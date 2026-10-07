"use client";

import { cn } from "@/lib/utils";
import { EDITION_LIST } from "@/lib/editions";
import type { Edition } from "@/generated/prisma/enums";

export function EditionToggle({
  edition,
  onChange,
}: {
  edition: Edition;
  onChange: (edition: Edition) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-[3px]">
      {EDITION_LIST.map((config) => (
        <button
          key={config.id}
          type="button"
          onClick={() => onChange(config.id)}
          aria-pressed={edition === config.id}
          title={config.label}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            edition === config.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {config.shortLabel}
        </button>
      ))}
    </div>
  );
}
