"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/cn";
import { useBookmarkStore } from "@/stores/bookmark.store";
import { useCurrentUserStore } from "@/stores/currentUser.store";
import type { BookmarkTargetType } from "@/types/bookmark";

interface BookmarkButtonProps {
  targetType: BookmarkTargetType;
  targetId: string;
  /** Display label next to the icon. */
  label?: string;
  /** "icon" = square icon-only, "default" = icon + label inline. */
  size?: "icon" | "default" | "sm";
  variant?: "outline" | "ghost" | "default";
  className?: string;
}

export function BookmarkButton({
  targetType,
  targetId,
  label,
  size = "icon",
  variant = "outline",
  className,
}: BookmarkButtonProps) {
  const mounted = useIsMounted();
  const isBookmarked = useBookmarkStore((s) =>
    mounted ? s.isBookmarked(targetType, targetId) : false,
  );
  const toggle = useBookmarkStore((s) => s.toggle);
  const userId = useCurrentUserStore((s) => s.user.id);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(targetType, targetId, userId);
    toast.success(added ? "Sudah disimpan" : "Sudah dilepas", {
      description: added
        ? targetType === "spot"
          ? "Spot ini masuk bookmarkmu."
          : "Event ini masuk bookmarkmu."
        : targetType === "spot"
          ? "Spot ini keluar dari bookmarkmu."
          : "Event ini keluar dari bookmarkmu.",
    });
  }

  const Icon = isBookmarked ? BookmarkCheck : Bookmark;
  const ariaLabel = isBookmarked ? "Hapus dari bookmark" : "Simpan ke bookmark";

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-pressed={isBookmarked}
      className={cn(
        isBookmarked &&
          "border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5",
        className,
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          isBookmarked && "fill-[var(--color-primary)]",
        )}
        aria-hidden
      />
      {label ? <span>{label}</span> : null}
    </Button>
  );
}
