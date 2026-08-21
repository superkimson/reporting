"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, PenLine } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";

export function MainNav({ isEditor }: { isEditor: boolean }) {
  const pathname = usePathname();

  const primaryLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ...(isEditor ? [{ href: "/saisie", label: "Saisie rapide", icon: PenLine }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Social Dashboard
          </Link>
          <div className="flex items-center gap-1">
            {isEditor ? (
              <form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  aria-label="Déconnexion"
                  title="Déconnexion"
                >
                  <LogOut className="size-4" />
                </Button>
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                Se connecter
              </Link>
            )}
            <ThemeToggle />
          </div>
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
        </nav>
      </div>
    </header>
  );
}
