"use client";

import { Check, X } from "lucide-react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getTagAccent } from "@/lib/discoveryAccent";
import type { Tag } from "@/types/tag";

interface TagFilterChipsProps {
  tags: Tag[];
  selectedTagSlugs: string[];
  onToggleTag: (slug: string) => void;
  onClear?: () => void;
  title?: string;
  className?: string;
}

export function TagFilterChips({
  tags,
  selectedTagSlugs,
  onToggleTag,
  onClear,
  title,
  className,
}: TagFilterChipsProps) {
  const hasActiveTags = selectedTagSlugs.length > 0;

  if (tags.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {title || hasActiveTags ? (
        <div className="flex items-center justify-between gap-3">
          {title ? (
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              {title}
            </p>
          ) : (
            <span />
          )}
          {hasActiveTags && onClear ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-[var(--color-muted-foreground)]"
              onClick={onClear}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Reset
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="scrollbar-hide -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {tags.map((tag) => {
          const active = selectedTagSlugs.includes(tag.slug);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggleTag(tag.slug)}
              aria-pressed={active}
              className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                  ? "border-[var(--chip-accent)] bg-[color-mix(in_srgb,var(--chip-accent)_18%,transparent)] text-[var(--chip-accent)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-foreground)] hover:border-[var(--chip-accent)] hover:text-[var(--chip-accent)]",
              )}
              style={{ "--chip-accent": getTagAccent(tag) } as CSSProperties}
            >
              {active ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
              #{tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
