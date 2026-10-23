"use client";

import Link from "next/link";
import { Check, Moon, Palette, Sparkles, Sun } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { THEME_META, type Theme } from "@/lib/theme";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/cn";

const PALETTES: Record<Theme, Array<{ label: string; token: string }>> = {
  dark: [
    { label: "Background", token: "var(--color-background)" },
    { label: "Surface", token: "var(--color-surface)" },
    { label: "Primary", token: "var(--color-primary)" },
    { label: "Accent", token: "var(--color-accent)" },
    { label: "Foreground", token: "var(--color-foreground)" },
  ],
  light: [
    { label: "Background", token: "var(--color-background)" },
    { label: "Surface", token: "var(--color-surface)" },
    { label: "Primary", token: "var(--color-primary)" },
    { label: "Accent", token: "var(--color-accent)" },
    { label: "Foreground", token: "var(--color-foreground)" },
  ],
};

/**
 * Live side-by-side theme comparison. Each panel sets its own
 * `data-theme`, so the design tokens are scoped to that subtree.
 */
export function ThemeGallery() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Palette className="h-4 w-4 text-primary" aria-hidden />
          <span className="font-semibold">Tema aktif:</span>
          <span className="text-[var(--color-muted-foreground)]">
            {THEME_META[theme].label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={cn(
              "glass-subtle inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
              theme === "dark" && "text-primary",
            )}
          >
            <Moon className="h-3.5 w-3.5" aria-hidden /> Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={cn(
              "glass-subtle inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
              theme === "light" && "text-primary",
            )}
          >
            <Sun className="h-3.5 w-3.5" aria-hidden /> Light
          </button>
          <ThemeToggle variant="pill" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(["dark", "light"] as Theme[]).map((value) => (
          <section
            key={value}
            data-theme={value}
            style={{ colorScheme: THEME_META[value].mode }}
            className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--page-gradient)] bg-[var(--color-background)] p-1"
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="accent-pill inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    Theme
                  </p>
                  <h2 className="mt-2 font-display text-xl font-bold text-[var(--color-foreground)]">
                    {THEME_META[value].label}
                  </h2>
                  <p className="mt-1 max-w-xs text-xs text-[var(--color-muted-foreground)]">
                    {THEME_META[value].description}
                  </p>
                </div>
                <div className="flex gap-1">
                  {THEME_META[value].swatch.map((color) => (
                    <span
                      key={color}
                      className="h-6 w-6 rounded-full border border-[var(--color-border)]"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <article className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-primary">
                      <Sparkles className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">
                        Glass card
                      </p>
                      <p className="truncate text-[10px] text-[var(--color-muted-foreground)]">
                        backdrop-blur + token border
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-muted-foreground)]">
                    Permukaan memakai <code>--glass-bg</code> dan{" "}
                    <code>--glass-blur</code> yang berbeda per tema.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Cafe", "Live Music", "Rooftop"].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-[var(--color-border)] bg-[var(--glass-bg-subtle)] px-2 py-0.5 text-[10px] text-[var(--color-muted-foreground)]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary text-[11px] font-semibold text-[var(--color-primary-foreground)]"
                  >
                    Tombol utama
                  </button>
                </article>

                <article className="glass-accent rounded-2xl p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Palet
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {PALETTES[value].map((entry) => (
                      <li
                        key={entry.label}
                        className="flex items-center gap-2 text-[10px] text-[var(--color-muted-foreground)]"
                      >
                        <span
                          className="h-4 w-4 rounded border border-[var(--color-border)]"
                          style={{ backgroundColor: entry.token }}
                        />
                        {entry.label}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-primary">
                    <Check className="h-3 w-3" aria-hidden />
                    {value === "light"
                      ? "Aksen ungu #7C3AED"
                      : "Aksen cyan #00FFFF"}
                  </p>
                </article>
              </div>

              <div className="mt-3 glass-subtle flex items-center gap-2 rounded-xl px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                <p className="text-[10px] text-[var(--color-muted-foreground)]">
                  Teks, border, dan input otomatis mengikuti token tema ini.
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 text-sm">
        <p className="font-semibold">Mau lihat di halaman asli?</p>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Aktifkan tema lalu jelajahi beranda, detail spot, dan halaman akun.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-[var(--color-primary-foreground)]"
          >
            Beranda
          </Link>
          <Link
            href="/account"
            className="glass-subtle inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold"
          >
            Halaman akun
          </Link>
        </div>
      </div>
    </div>
  );
}
