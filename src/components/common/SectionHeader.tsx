import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel = "Lihat semua",
  actionHref,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-3 pb-4",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="h-1 w-9 rounded-full bg-[var(--color-primary)] shadow-[0_0_18px_rgb(0_245_255_/_0.24)]" />
        <h2 className="font-display text-lg font-bold text-[var(--color-foreground)] md:text-xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)]"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
