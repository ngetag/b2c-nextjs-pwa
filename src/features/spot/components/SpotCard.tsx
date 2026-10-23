import { MapPin, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { routes } from "@/config/routes";
import { BookmarkButton } from "@/features/bookmark/components/BookmarkButton";
import { cn } from "@/lib/cn";
import { getTagAccent } from "@/lib/discoveryAccent";
import { formatPriceLevel } from "@/lib/format";
import { formatAdministrativeLocation, formatDistanceKm } from "@/lib/location";
import type { Spot } from "@/types/spot";
import type { Tag } from "@/types/tag";

interface SpotCardProps {
  spot: Spot;
  /** All tags — only ones matching spot.tagIds are rendered. */
  tags?: Tag[];
  className?: string;
  /** "default" = grid card, "compact" = horizontal carousel item. */
  variant?: "default" | "compact";
  distanceKm?: number;
}

export function SpotCard({
  spot,
  tags = [],
  className,
  variant = "default",
  distanceKm,
}: SpotCardProps) {
  const allSpotTags = tags.filter((t) => spot.tagIds.includes(t.id));
  const spotTags = allSpotTags.slice(0, 3);
  const hiddenTagCount = Math.max(allSpotTags.length - spotTags.length, 0);
  const accent = spotTags[0] ? getTagAccent(spotTags[0]) : "var(--accent-coffee)";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl glass border transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--card-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F5FF]",
        variant === "compact" ? "w-64 shrink-0" : "w-full",
        className,
      )}
      style={{ "--card-accent": accent } as CSSProperties}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-background)]">
        <Link href={routes.spot(spot.id)} aria-label={`Lihat detail ${spot.name}`}>
          <Image
            src={spot.coverImageUrl}
            alt=""
            fill
            sizes={variant === "compact" ? "256px" : "(min-width: 768px) 33vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[rgb(8_17_22_/_0.88)] to-transparent" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-[var(--card-accent)]/45 bg-[var(--color-background)]/72 px-2 py-1 text-[10px] font-semibold text-[var(--card-accent)] backdrop-blur">
          <Store className="h-3 w-3" aria-hidden />
          Spot
        </span>
        {spot.featured ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent-foreground)]">
            Lagi rame
          </span>
        ) : null}
        <div className="absolute right-2 top-2">
          <BookmarkButton
            targetType="spot"
            targetId={spot.id}
            size="icon"
            variant="default"
            className="h-8 w-8 bg-[var(--color-surface)]/90 text-[var(--color-foreground)] backdrop-blur hover:bg-[var(--color-surface)]"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-[var(--card-accent)]/25 p-3">
        {spotTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {spotTags.map((t) => (
              <Link
                key={t.id}
                href={routes.search({ tags: [t.slug] })}
                className="rounded-full border border-[var(--chip-accent)]/35 bg-[color-mix(in_srgb,var(--chip-accent)_13%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--chip-accent)] transition-colors hover:border-[var(--chip-accent)]"
                style={{ "--chip-accent": getTagAccent(t) } as CSSProperties}
              >
                #{t.name}
              </Link>
            ))}
            {hiddenTagCount > 0 ? (
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-muted-foreground)]">
                +{hiddenTagCount}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-2">
          <Link href={routes.spot(spot.id)}>
            <h3 className="line-clamp-2 font-display text-sm font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)]">
              {spot.name}
            </h3>
          </Link>
          <span className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-muted-foreground)]">
            {formatPriceLevel(spot.priceLevel)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          <span className="line-clamp-1">
            {formatAdministrativeLocation(spot.location)}
          </span>
        </div>

        {distanceKm !== undefined ? (
          <div className="text-xs text-[var(--color-muted-foreground)]">
            {formatDistanceKm(distanceKm)} dari lokasimu
          </div>
        ) : null}
      </div>
    </article>
  );
}
