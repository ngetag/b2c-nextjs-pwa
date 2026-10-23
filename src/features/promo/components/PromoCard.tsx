import { Tag as TagIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Promo } from "@/types/promo";

interface PromoCardProps {
  promo: Promo;
  className?: string;
  variant?: "default" | "highlight";
}

export function PromoCard({
  promo,
  className,
  variant = "default",
}: PromoCardProps) {
  const href = promo.spotId
    ? routes.spot(promo.spotId)
    : promo.eventId
      ? routes.event(promo.eventId)
      : routes.promo();

  if (variant === "highlight") {
    return (
      <Link
        href={href}
        className={cn(
          "group relative flex aspect-[16/9] w-full overflow-hidden rounded-lg border border-[var(--accent-coffee)]/25 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent-coffee)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
          className,
        )}
      >
        {promo.imageUrl ? (
          <Image
            src={promo.imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 flex w-full flex-col justify-end gap-2 p-4 text-white">
          {promo.discountPercent ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-accent-foreground)]">
              <TagIcon className="h-3 w-3" aria-hidden />
              Hemat {promo.discountPercent}%
            </span>
          ) : null}
          <h3 className="font-display text-lg font-bold leading-tight md:text-xl">
            {promo.title}
          </h3>
          <p className="line-clamp-2 text-xs text-white/80 md:text-sm">
            {promo.description}
          </p>
          <span className="text-[10px] font-semibold text-white/70">
            Berlaku sampai {formatDate(promo.validUntil)}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent-coffee)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
        className,
      )}
    >
      {promo.imageUrl ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-background)]">
          <Image
            src={promo.imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {promo.discountPercent ? (
            <span className="absolute left-2 top-2 rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-accent-foreground)]">
              Hemat {promo.discountPercent}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 font-display text-sm font-semibold text-[var(--color-foreground)]">
          {promo.title}
        </h3>
        <p className="line-clamp-2 text-xs text-[var(--color-muted-foreground)]">
          {promo.description}
        </p>
        <span className="mt-auto pt-1 text-[10px] font-semibold text-[var(--color-muted-foreground)]">
          s/d {formatDate(promo.validUntil)}
        </span>
      </div>
    </Link>
  );
}
