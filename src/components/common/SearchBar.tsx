"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { routes } from "@/config/routes";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
  autoFocus?: boolean;
}

/**
 * Global search entry point. Actual search is handled on /search.
 */
export function SearchBar({
  defaultValue = "",
  placeholder = "Cari spot, event, komunitas, tag...",
  className,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();

  function goToSearch() {
    router.push(routes.search());
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        goToSearch();
      }}
      className={cn("relative flex w-full flex-1 items-center", className)}
    >
      <Search
        className="pointer-events-none absolute left-4 h-4 w-4 text-[var(--color-muted-foreground)]"
        aria-hidden
      />
      <input
        type="search"
        name="q"
        value={defaultValue}
        readOnly
        onFocus={goToSearch}
        onClick={goToSearch}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "flex h-12 w-full flex-1 cursor-text rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 pl-11 pr-14 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)] backdrop-blur-md transition-colors duration-200 ease-out",
          "focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none",
        )}
        aria-label="Cari"
      />
      <button
        type="button"
        onClick={goToSearch}
        className="absolute right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)]/50 bg-[var(--color-surface-elevated)] text-[var(--color-foreground)] transition-colors duration-200 ease-out hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        aria-label="Filter pencarian"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
