"use client";

import Link from "next/link";
import { Bell, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import { NgetagLogo } from "@/components/brand/NgetagLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/config/site";
import { cn } from "@/lib/cn";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Desktop top navigation. Hidden on mobile (< md). Mobile uses BottomNav.
 *
 * Uses the glassmorphism tokens so the same markup renders as frosted dark
 * glass in the dark theme and lavender-tinted glass in the light theme.
 */
export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="glass-nav sticky top-0 z-40 hidden border-b md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center"
          aria-label="NgeTag beranda"
        >
          <NgetagLogo variant="auto" />
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
                pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href))
                  ? "bg-[var(--color-primary-soft)] text-primary"
                  : undefined,
              )}
            >
              <Link
                href={link.href}
                aria-current={
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href))
                    ? "page"
                    : undefined
                }
              >
                {link.label}
              </Link>
            </Button>
          ))}

          <ThemeToggle className="ml-2" />

          <Link
            href="/notifications"
            className="relative ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full glass text-muted-foreground transition-colors hover:text-primary"
            aria-label="Notifikasi"
          >
            <Bell className="h-4 w-4" aria-hidden />
            <span
              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-coffee"
              aria-label="Ada notifikasi baru"
            />
          </Link>

          {isAuthenticated && user ? (
            <Link
              href="/account"
              className="glass ml-2 inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs font-semibold text-[var(--color-foreground)] transition-colors hover:text-primary"
              aria-label="Buka akun saya"
            >
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-soft)] text-[11px] font-bold text-primary">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.name.slice(0, 1).toUpperCase()
                )}
              </span>
              <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="ml-2 inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-[var(--color-primary-foreground)] shadow-[0_8px_24px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] transition-all hover:bg-[var(--color-primary-hover)] active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden />
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
