"use client";

import { ArrowLeft, BadgeCheck, CalendarDays, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { routes } from "@/config/routes";
import { CommunityJoinButton } from "@/features/community/components/CommunityJoinButton";
import { formatDateShort, formatRelative, formatTime } from "@/lib/format";
import { getCommunityCategoryById } from "@/lib/interests";
import { getCommunityCategoryAccent } from "@/lib/discoveryAccent";
import type { Community } from "@/types/interest";

interface CommunityDetailViewProps {
  community: Community;
}

export function CommunityDetailView({ community }: CommunityDetailViewProps) {
  const category = getCommunityCategoryById(community.categoryId);
  const accent = getCommunityCategoryAccent(category);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  return (
    <div className="space-y-6" style={{ "--community-accent": accent } as CSSProperties}>
      <Button asChild size="sm" variant="outline">
        <Link href={routes.communitiesByCategory(community.categoryId)}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali
        </Link>
      </Button>

      <section className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
        <div className="relative aspect-[16/9] w-full bg-[var(--color-background)] md:aspect-[3/1]">
          <Image
            src={community.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[rgb(8_17_22_/_0.86)] to-transparent" />
        </div>
        <div className="space-y-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              {category ? (
                <p className="text-xs font-semibold text-[var(--community-accent)]">
                  {category.title}
                </p>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
                  {community.title}
                </h1>
                {community.isOfficial ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--community-accent)] bg-[color-mix(in_srgb,var(--community-accent)_12%,transparent)] px-2 py-1 text-xs font-semibold text-[var(--community-accent)]">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    Official
                  </span>
                ) : null}
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-foreground)]">
                {community.description}
              </p>
            </div>
            <div className="w-full md:w-48">
              <CommunityJoinButton communityId={community.id} size="default" />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {community.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={selectedTags.includes(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                   selectedTags.includes(tag)
                    ? "border-[var(--community-accent)] bg-[color-mix(in_srgb,var(--community-accent)_18%,transparent)] text-[var(--community-accent)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-muted-foreground)] hover:border-[var(--community-accent)] hover:text-[var(--community-accent)]",
                )}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="rounded-full px-2.5 py-1 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
              >
                Reset
              </button>
            ) : null}
          </div>

          <div className="grid gap-2 text-sm text-[var(--color-muted-foreground)] sm:grid-cols-3">
            <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-[var(--community-accent)]" aria-hidden />
              {community.memberCount.toLocaleString("id-ID")} member
            </span>
            <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-[var(--community-accent)]" aria-hidden />
              {community.activeEvents} event aktif
            </span>
            <span>Terakhir aktif {formatRelative(community.lastActiveAt)}</span>
          </div>

          {community.managementName ? (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3 text-sm">
              <p className="font-medium text-[var(--color-foreground)]">
                Managed by {community.managementName}
              </p>
              {community.managedBy ? (
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  {community.managedBy}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--color-foreground)]">
            Update komunitas
          </h2>
          <div className="space-y-3">
            {community.updates.map((update) => (
              <article
                key={update.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]"
              >
                <p className="text-sm font-semibold text-[var(--color-foreground)]">
                  {update.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                  {update.body}
                </p>
                <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
                  {update.authorName} · {formatRelative(update.publishedAt)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--color-foreground)]">
            Event / agenda
          </h2>
          {community.agendas.map((agenda) => (
            <article
              key={agenda.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]"
            >
              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                {agenda.title}
              </p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                {formatDateShort(agenda.startAt)} · {formatTime(agenda.startAt)} WIB
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {agenda.description}
              </p>
            </article>
          ))}
        </aside>
      </div>
    </div>
  );
}
