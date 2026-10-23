import { Calendar, MapPin, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { routes } from "@/config/routes";
import { BookmarkButton } from "@/features/bookmark/components/BookmarkButton";
import { AttendanceButton } from "@/features/event/components/AttendanceButton";
import { InterestChip } from "@/features/interest/components/InterestChip";
import { cn } from "@/lib/cn";
import { getTagAccent } from "@/lib/discoveryAccent";
import { getInterestsByIds } from "@/lib/interests";
import { formatDateShort, formatPriceRange, formatTime } from "@/lib/format";
import { formatAdministrativeLocation, formatDistanceKm } from "@/lib/location";
import type { NgetagEvent } from "@/types/event";
import type { Tag } from "@/types/tag";

interface EventCardProps {
  event: NgetagEvent;
  tags?: Tag[];
  className?: string;
  variant?: "default" | "compact";
  distanceKm?: number;
}

export function EventCard({
  event,
  tags = [],
  className,
  variant = "default",
  distanceKm,
}: EventCardProps) {
  const allEventTags = tags.filter((t) => event.tagIds.includes(t.id));
  const eventTags = allEventTags.slice(0, 3);
  const hiddenTagCount = Math.max(allEventTags.length - eventTags.length, 0);
  const eventInterests = getInterestsByIds(event.interestIds).slice(0, 3);
  const accent = eventTags[0] ? getTagAccent(eventTags[0]) : "var(--accent-music)";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl glass border transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--card-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F5FF]",
        variant === "compact" ? "w-72 shrink-0" : "w-full",
        className,
      )}
      style={{ "--card-accent": accent } as CSSProperties}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-background)]">
        <Link href={routes.event(event.id)} aria-label={`Lihat detail ${event.title}`}>
          <Image
            src={event.coverImageUrl}
            alt=""
            fill
            sizes={variant === "compact" ? "288px" : "(min-width: 768px) 33vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[rgb(8_17_22_/_0.88)] to-transparent" />
        <div className="absolute left-2 top-2 flex flex-col items-center justify-center rounded-md border border-[var(--card-accent)]/45 bg-[var(--color-background)]/74 px-2 py-1 text-center shadow-sm backdrop-blur">
          <span className="text-[10px] font-semibold leading-none text-[var(--color-primary)]">
            {formatDateShort(event.startAt).split(" ")[1]}
          </span>
          <span className="font-display text-base font-bold leading-none text-[var(--color-foreground)]">
            {formatDateShort(event.startAt).split(" ")[0]}
          </span>
        </div>
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full border border-[var(--card-accent)]/45 bg-[var(--color-background)]/72 px-2 py-1 text-[10px] font-semibold text-[var(--card-accent)] backdrop-blur">
          <Ticket className="h-3 w-3" aria-hidden />
          Event
        </span>
        {event.price.isFree ? (
          <span className="absolute right-12 top-2 rounded-full bg-[var(--color-success)] px-2 py-0.5 text-[10px] font-semibold text-[#06150c]">
            Gratis
          </span>
        ) : null}
        <div className="absolute right-2 top-2">
          <BookmarkButton
            targetType="event"
            targetId={event.id}
            size="icon"
            variant="default"
            className="h-8 w-8 bg-[var(--color-surface)]/90 text-[var(--color-foreground)] backdrop-blur hover:bg-[var(--color-surface)]"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-[var(--card-accent)]/25 p-3">
        {eventTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {eventTags.map((t) => (
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

        {eventInterests.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {eventInterests.map((interest) => (
              <InterestChip key={interest.id} interest={interest} asLink />
            ))}
          </div>
        ) : null}

        <Link href={routes.event(event.id)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]">
          <h3 className="line-clamp-2 font-display text-sm font-semibold text-[var(--color-foreground)]">
            {event.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
          <Calendar className="h-3 w-3 shrink-0" aria-hidden />
          <span>{formatTime(event.startAt)} WIB</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          <span className="line-clamp-1">
            {event.venueName} · {formatAdministrativeLocation(event.location)}
          </span>
        </div>

        {distanceKm !== undefined ? (
          <div className="text-xs text-[var(--color-muted-foreground)]">
            {formatDistanceKm(distanceKm)} dari lokasimu
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-xs font-semibold text-[var(--color-primary)]">
            {formatPriceRange(event.price)}
          </span>
        </div>

        <AttendanceButton event={event} size="sm" />
      </div>
    </article>
  );
}
