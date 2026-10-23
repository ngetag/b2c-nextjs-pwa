"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { NgetagLogo } from "@/components/brand/NgetagLogo";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Desktop top navigation. Hidden on mobile (< md). Mobile uses BottomNav.
 */
export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-[var(--color-border)] bg-[var(--color-background)]/82 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center"
          aria-label="NgeTag beranda"
        >
          <NgetagLogo variant="dark" />
        </Link>

        <nav className="flex items-center justify-end gap-1">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm text-[var(--color-muted-foreground)]",
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "bg-surface-elevated text-primary"
                  : undefined,
              )}
            >
              <Link
                href={link.href}
                aria-current={pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href)) ? "page" : undefined}
              >
                {link.label}
              </Link>
            </Button>
          ))}
          <Link
            href="/notifications"
            className="relative ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-soft text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Notifikasi"
          >
            <Bell className="h-4 w-4" aria-hidden />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-coffee" aria-label="Ada notifikasi baru" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
