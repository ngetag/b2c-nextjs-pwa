"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  /** `icon` renders a round glass button; `pill` renders a labelled switch. */
  variant?: "icon" | "pill";
  className?: string;
}

/**
 * Toggles between the dark "Midnight Neon" theme and the light
 * "Lavender Glass" theme. The preference is persisted in a cookie so the
 * server can render the correct palette on the next request (no flash).
 */
export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, toggleTheme, meta } = useTheme();
  const nextLabel =
    theme === "light" ? "Aktifkan tema gelap" : "Aktifkan tema terang";

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={nextLabel}
        title={`${meta.label} — ${nextLabel}`}
        className={cn(
          "glass inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-[var(--color-foreground)] transition-all hover:border-[var(--glass-border-strong)] hover:text-primary active:scale-95",
          className,
        )}
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          {theme === "light" ? (
            <Sun className="h-4 w-4 text-primary" aria-hidden />
          ) : (
            <Moon className="h-4 w-4 text-primary" aria-hidden />
          )}
        </span>
        <span>{theme === "light" ? "Light" : "Dark"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={`${meta.label} — ${nextLabel}`}
      className={cn(
        "glass group relative inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted-foreground)] transition-all hover:text-primary active:scale-95",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          theme === "light" ? "rotate-0 scale-100" : "-rotate-90 scale-0",
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          theme === "light" ? "rotate-90 scale-0" : "rotate-0 scale-100",
        )}
        aria-hidden
      />
    </button>
  );
}
