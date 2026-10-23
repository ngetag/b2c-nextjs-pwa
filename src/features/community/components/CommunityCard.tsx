import { BadgeCheck, CalendarDays, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { routes } from "@/config/routes";
import { formatRelative } from "@/lib/format";
import { getCommunityCategoryById } from "@/lib/interests";
import { getCommunityCategoryAccent } from "@/lib/discoveryAccent";
import type { Community } from "@/types/interest";

interface CommunityCardProps {
  community: Community;
  onTagClick?: (tag: string) => void;
  activeTags?: string[];
}

export function CommunityCard({
  community,
  onTagClick,
  activeTags = [],
}: CommunityCardProps) {
  const category = getCommunityCategoryById(community.categoryId);
  const accent = getCommunityCategoryAccent(category);

  return (
    <article
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl glass border transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--card-accent)]"
      style={{ "--card-accent": accent } as CSSProperties}
    >
      <Link
        href={routes.community(community.id)}
        className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        aria-label={`Lihat detail ${community.title}`}
      >
          <Image
            src={community.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgb(8_17_22_/_0.92)] to-transparent" />
          {community.isOfficial ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-[var(--card-accent)]/45 bg-[var(--color-background)]/72 px-2 py-1 text-[10px] font-semibold text-[var(--card-accent)] shadow-sm backdrop-blur">
              <BadgeCheck className="h-3 w-3" aria-hidden />
              Official
            </span>
          ) : null}
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full border border-[var(--card-accent)]/45 bg-[var(--color-background)]/72 px-2 py-1 text-[10px] font-semibold text-[var(--card-accent)] backdrop-blur">
            <Users className="h-3 w-3" aria-hidden />
            Komunitas
          </span>
      </Link>

      <div className="flex flex-1 flex-col border-t border-[var(--card-accent)]/25 p-3">
        {category ? (
          <p className="text-xs font-semibold text-[var(--card-accent)]">
            {category.title}
          </p>
        ) : null}
        <Link href={routes.community(community.id)}>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)]">
            {community.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
          {community.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {community.tags.slice(0, 3).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              className={
                activeTags.includes(tag)
                  ? "rounded-full border border-[var(--card-accent)] bg-[color-mix(in_srgb,var(--card-accent)_18%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--card-accent)]"
                  : "rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-muted-foreground)] hover:border-[var(--card-accent)] hover:text-[var(--card-accent)]"
              }
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-1.5 text-xs text-[var(--color-muted-foreground)]">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-[var(--card-accent)]" aria-hidden />
            {community.memberCount.toLocaleString("id-ID")} member
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--card-accent)]" aria-hidden />
            {community.activeEvents} event aktif
          </span>
          <span>Terakhir aktif {formatRelative(community.lastActiveAt)}</span>
          {community.managementName ? (
            <span>Managed by {community.managementName}</span>
          ) : null}
        </div>

        <Link href={routes.community(community.id)} className="mt-auto pt-4 text-xs font-semibold text-[var(--card-accent)] hover:text-[var(--color-primary-hover)]">
          Cek komunitas
        </Link>
      </div>
    </article>
  );
}
