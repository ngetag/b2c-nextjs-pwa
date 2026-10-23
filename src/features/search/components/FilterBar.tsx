"use client";

import { Check, X } from "lucide-react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getTagAccent } from "@/lib/discoveryAccent";
import type { Tag } from "@/types/tag";

interface FilterBarProps {
  tags: Tag[];
  selectedTagSlugs: string[];
  onToggleTag: (slug: string) => void;
  sort: "relevance" | "newest" | "distance";
  onChangeSort: (sort: "relevance" | "newest" | "distance") => void;
  onReset?: () => void;
  className?: string;
}

const SORT_OPTIONS: Array<{
  value: "relevance" | "newest" | "distance";
  label: string;
}> = [
  { value: "relevance", label: "Relevansi" },
  { value: "newest", label: "Terbaru" },
];

export function FilterBar({
  tags,
  selectedTagSlugs,
  onToggleTag,
  sort,
  onChangeSort,
  onReset,
  className,
}: FilterBarProps) {
  const hasFilters = selectedTagSlugs.length > 0 || sort !== "relevance";
  const selectedTags = tags.filter((tag) =>
    selectedTagSlugs.includes(tag.slug),
  );
  const sortedTags = [...tags].sort(
    (a, b) =>
      Number(selectedTagSlugs.includes(b.slug)) -
        Number(selectedTagSlugs.includes(a.slug)) ||
      (b.trendingScore ?? 0) - (a.trendingScore ?? 0) ||
      a.name.localeCompare(b.name),
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Urutkan:
          </span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChangeSort(opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                sort === opt.value
                  ? "bg-[var(--color-accent)] text-[var(--color-secondary-foreground)]"
                  : "bg-[var(--color-background)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-border)]",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {hasFilters && onReset ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 text-xs text-[var(--color-muted-foreground)]"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Reset
          </Button>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Filter tag: {selectedTagSlugs.length} dipilih
          </span>
        </div>

        {selectedTags.length > 0 ? (
          <div className="max-h-24 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onToggleTag(tag.slug)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-[var(--chip-accent)] bg-[color-mix(in_srgb,var(--chip-accent)_18%,transparent)] px-2.5 py-1 text-xs font-semibold text-[var(--chip-accent)]",
                  )}
                  style={
                    { "--chip-accent": getTagAccent(tag) } as CSSProperties
                  }
                  aria-label={`Hapus tag ${tag.name}`}
                >
                  #{tag.name}
                  <X className="h-3 w-3" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <br />
        <hr />
        <br />
        <div className="max-h-72 overflow-y-auto pr-1">
          <div className="flex flex-wrap gap-1.5">
            {sortedTags.map((tag) => {
              const active = selectedTagSlugs.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onToggleTag(tag.slug)}
                  className={cn(
                    "inline-flex min-w-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-[var(--chip-accent)] bg-[color-mix(in_srgb,var(--chip-accent)_18%,transparent)] text-[var(--chip-accent)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-foreground)] hover:border-[var(--chip-accent)] hover:text-[var(--chip-accent)]",
                  )}
                  style={
                    { "--chip-accent": getTagAccent(tag) } as CSSProperties
                  }
                  aria-pressed={active}
                  aria-label={
                    active
                      ? `Nonaktifkan tag ${tag.name}`
                      : `Aktifkan tag ${tag.name}`
                  }
                >
                  {active ? (
                    <Check className="h-3 w-3 shrink-0" aria-hidden />
                  ) : null}
                  <span className="truncate">#{tag.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
