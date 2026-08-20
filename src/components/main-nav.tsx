"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PenLine } from "lucide-react";

import { cn } from "@/lib/utils";
import { PLATFORM_LIST } from "@/lib/platforms";
import { ThemeToggle } from "@/components/theme-toggle";

const primaryLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/saisie", label: "Saisie rapide", icon: PenLine },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Social Dashboard
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex flex-wrap items-center gap-1">
          {primaryLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}

          <span className="mx-2 h-4 w-px bg-border" />

          {PLATFORM_LIST.map((config) => {
            const href = `/${config.id.toLowerCase()}`;
            const Icon = config.icon;
            const isActive = pathname === href;
            return (
              <Link
                key={config.id}
                href={href}
                title={config.label}
                aria-label={config.label}
                className={cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4" style={{ color: config.color }} />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
