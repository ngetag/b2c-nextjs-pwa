"use client";

import { ArrowLeft, FolderOpen } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { communityCategories, communities } from "@/data/fixtures/interests";
import { CommunityCard } from "@/features/community/components/CommunityCard";
import { useIsMounted } from "@/hooks/useIsMounted";
import {
  getCommunitiesByCategoryId,
  getCommunityCategoryById,
} from "@/lib/interests";
import { getCommunityCategoryAccent } from "@/lib/discoveryAccent";
import { routes } from "@/config/routes";
import { useCommunityStore } from "@/stores/community.store";

interface CommunitiesViewProps {
  categoryId?: string;
  showJoinedOnly?: boolean;
}

export function CommunitiesView({
  categoryId,
  showJoinedOnly = false,
}: CommunitiesViewProps) {
  const mounted = useIsMounted();
  const communityMemberships = useCommunityStore((state) => state.items);
  const joinedCommunityIds = new Set(Object.keys(communityMemberships));
  const joinedCommunities = mounted
    ? communities.filter((community) => joinedCommunityIds.has(community.id))
    : [];
  const activeCategory = categoryId
    ? getCommunityCategoryById(categoryId)
    : undefined;
  const categoryCommunities = categoryId
    ? getCommunitiesByCategoryId(categoryId)
    : [];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };
  const filterByTags = (items: typeof communities) =>
    selectedTags.length === 0
      ? items
      : items.filter((community) =>
          community.tags.some((tag) => selectedTags.includes(tag)),
        );
  const activeList = showJoinedOnly
    ? joinedCommunities
    : categoryId
      ? categoryCommunities
      : communities;
  const availableTags = useMemo(
    () => Array.from(new Set(activeList.flatMap((community) => community.tags))),
    [activeList],
  );
  const filteredJoinedCommunities = filterByTags(joinedCommunities);
  const filteredCategoryCommunities = filterByTags(categoryCommunities);

  const tagFilter = availableTags.length > 0 ? (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        
        {selectedTags.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-[var(--color-muted-foreground)]"
            onClick={() => setSelectedTags([])}
          >
            Reset
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {availableTags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  if (showJoinedOnly) {
    return (
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--color-foreground)]">
          Komunitas Saya
        </h2>
        {tagFilter}
        {filteredJoinedCommunities.length > 0 ? (
          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJoinedCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onTagClick={toggleTag}
                activeTags={selectedTags}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum gabung komunitas"
            description="Gabung komunitas dulu untuk melihat daftar komunitas kamu di sini."
          />
        )}
      </section>
    );
  }

  if (categoryId) {
    return (
      <section className="space-y-4">
        <div className="space-y-3">
          <Button asChild size="sm" variant="outline">
            <Link href={routes.communities()}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Kategori
            </Link>
          </Button>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">
              {activeCategory?.title ?? "Kategori komunitas"}
            </h2>
          </div>
        </div>

        {tagFilter}
        {filteredCategoryCommunities.length > 0 ? (
          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategoryCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onTagClick={toggleTag}
                activeTags={selectedTags}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada komunitas"
            description="Kategori ini belum memiliki komunitas aktif."
          />
        )}
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--color-foreground)]">
        Kategori komunitas
      </h2>
      <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
        {communityCategories.map((category) => {
          const count = getCommunitiesByCategoryId(category.id).length;
          const accent = getCommunityCategoryAccent(category);
          return (
            <Link
              key={category.id}
              href={routes.communitiesByCategory(category.id)}
              className="relative flex flex-col rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
              style={{ "--category-accent": accent } as CSSProperties}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--category-accent)]/35 bg-[color-mix(in_srgb,var(--category-accent)_12%,transparent)] text-[var(--category-accent)]">
                  <FolderOpen className="h-5 w-5" aria-hidden />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                    {category.title}
                  </h3>
                  <p className="text-xs font-semibold text-[var(--category-accent)]">
                    {count} komunitas
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
