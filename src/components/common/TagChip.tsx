import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { routes } from "@/config/routes";
import { getTagAccent } from "@/lib/discoveryAccent";
import type { Tag } from "@/types/tag";

interface TagChipProps {
  tag: Pick<Tag, "slug" | "name"> & Partial<Pick<Tag, "category">>;
  variant?: "default" | "filled" | "outline";
  size?: "sm" | "md";
  asLink?: boolean;
  className?: string;
}

const variantClass = {
  default:
    "border border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-foreground)] hover:border-[var(--chip-accent)] hover:text-[var(--chip-accent)]",
  filled:
    "border border-[var(--chip-accent)] bg-[color-mix(in_srgb,var(--chip-accent)_18%,transparent)] text-[var(--chip-accent)] hover:bg-[color-mix(in_srgb,var(--chip-accent)_26%,transparent)]",
  outline:
    "border border-[var(--chip-accent)] bg-transparent text-[var(--chip-accent)] hover:bg-[color-mix(in_srgb,var(--chip-accent)_12%,transparent)]",
};

const sizeClass = {
  sm: "text-xs px-2.5 py-0.5",
  md: "text-sm px-3 py-1",
};

export function TagChip({
  tag,
  variant = "default",
  size = "sm",
  asLink = true,
  className,
}: TagChipProps) {
  const classes = cn(
    "inline-flex items-center gap-1 rounded-full font-semibold transition-colors",
    variantClass[variant],
    sizeClass[size],
    className,
  );
  const style = {
    "--chip-accent": tag.category ? getTagAccent(tag as Pick<Tag, "category">) : "var(--color-primary)",
  } as CSSProperties;
  if (asLink) {
    return (
      <Link href={routes.tag(tag.slug)} className={classes} style={style}>
        #{tag.name}
      </Link>
    );
  }
  return <span className={classes} style={style}>#{tag.name}</span>;
}
