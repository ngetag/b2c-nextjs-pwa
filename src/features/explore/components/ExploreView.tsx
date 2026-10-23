"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { HorizontalScroll } from "@/components/common/HorizontalScroll";
import { SectionHeader } from "@/components/common/SectionHeader";
import { routes } from "@/config/routes";
import { EventCard } from "@/features/event/components/EventCard";
import {
  getInterestEventRecommendations,
  getInterestSpotRecommendations,
  getLocationEventRecommendations,
  getLocationSpotRecommendations,
} from "@/features/search/lib/recommendations";
import { SpotCard } from "@/features/spot/components/SpotCard";
import { TagFilterChips } from "@/features/tag/components/TagFilterChips";
import { useTagSelection } from "@/hooks/useTagSelection";
import { cn } from "@/lib/cn";
import { getTagAccent } from "@/lib/discoveryAccent";
import { formatHomeLocation } from "@/lib/location";
import { filterEventsByAnyTag, filterSpotsByAnyTag, tagSlugsToIds } from "@/lib/tagFilter";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";
import { useCurrentUserStore } from "@/stores/currentUser.store";
import type { NgetagEvent } from "@/types/event";
import type { Spot } from "@/types/spot";
import type { Tag, TagCategory } from "@/types/tag";

interface ExploreViewProps {
  tags: Tag[];
  trendingTags: Tag[];
  featuredSpots: Spot[];
  featuredEvents: NgetagEvent[];
}

const CATEGORY_LABELS: Record<TagCategory, string> = {
  vibe: "Vibe",
  cuisine: "Kuliner",
  activity: "Aktivitas",
  price: "Harga",
  occasion: "Momen",
};

export function ExploreView({
  tags,
  trendingTags,
  featuredSpots,
  featuredEvents,
}: ExploreViewProps) {
  const location = useCurrentLocationStore((s) => s.location);
  const userFavoriteTagIds = useCurrentUserStore(
    (s) => s.user.preferences?.favoriteTagIds,
  );
  const userInterestIds = useCurrentUserStore((s) => s.user.interestIds ?? []);
  const favoriteTagIds = useMemo(
    () => userFavoriteTagIds ?? [],
    [userFavoriteTagIds],
  );
  const {
    selectedTagSlugs,
    toggleTag,
    clearTags,
    setSelectedTagSlugs,
  } = useTagSelection();
  const selectedTagIds = useMemo(
    () => tagSlugsToIds(selectedTagSlugs, tags),
    [selectedTagSlugs, tags],
  );

  const locationSpots = useMemo(
    () => filterSpotsByAnyTag(getLocationSpotRecommendations(location, 8), selectedTagIds),
    [location, selectedTagIds],
  );
  const locationEvents = useMemo(
    () => filterEventsByAnyTag(getLocationEventRecommendations(location, 8), selectedTagIds),
    [location, selectedTagIds],
  );
  const interestSpots = useMemo(
    () => filterSpotsByAnyTag(getInterestSpotRecommendations(favoriteTagIds, 8), selectedTagIds),
    [favoriteTagIds, selectedTagIds],
  );
  const interestEvents = useMemo(
    () =>
      filterEventsByAnyTag(
        getInterestEventRecommendations(favoriteTagIds, userInterestIds, 8),
        selectedTagIds,
      ),
    [favoriteTagIds, selectedTagIds, userInterestIds],
  );
  const visibleFeaturedSpots = useMemo(
    () => filterSpotsByAnyTag(featuredSpots, selectedTagIds),
    [featuredSpots, selectedTagIds],
  );
  const visibleFeaturedEvents = useMemo(
    () => filterEventsByAnyTag(featuredEvents, selectedTagIds),
    [featuredEvents, selectedTagIds],
  );

  const categories = useMemo(
    () =>
      Object.entries(CATEGORY_LABELS).map(([category, label]) => ({
        category: category as TagCategory,
        label,
        tags: tags.filter((tag) => tag.category === category).slice(0, 4),
      })),
    [tags],
  );

  function toggleCategory(categoryTags: Tag[]) {
    const categorySlugs = categoryTags.map((tag) => tag.slug);
    const selectedSet = new Set(selectedTagSlugs);
    const allSelected = categorySlugs.every((slug) => selectedSet.has(slug));
    const next = allSelected
      ? selectedTagSlugs.filter((slug) => !categorySlugs.includes(slug))
      : Array.from(new Set([...selectedTagSlugs, ...categorySlugs]));
    setSelectedTagSlugs(next);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 md:px-6 md:py-10">
      <header className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-[var(--color-primary)]" />
        <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
          Eksplore
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Temukan spot, event, dan tag yang lagi pas buat mood kamu.
        </p>
      </header>
      <section>
        <SectionHeader title="Trending tags" subtitle="" />
        <TagFilterChips
          tags={trendingTags}
          selectedTagSlugs={selectedTagSlugs}
          onToggleTag={toggleTag}
          onClear={clearTags}
        />
      </section>

      <section>
        <SectionHeader title="Kategori" subtitle="" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.map((item) => {
            const selectedCount = item.tags.filter((tag) =>
              selectedTagSlugs.includes(tag.slug),
            ).length;
            const active = selectedCount === item.tags.length && item.tags.length > 0;
            const partial = selectedCount > 0 && !active;
            const accent = item.tags[0] ? getTagAccent(item.tags[0]) : "var(--color-primary)";

            return (
              <button
                key={item.category}
                type="button"
                onClick={() => toggleCategory(item.tags)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-[var(--category-accent)] bg-[color-mix(in_srgb,var(--category-accent)_18%,transparent)] text-[var(--color-foreground)]"
                    : partial
                      ? "border-[var(--category-accent)] bg-[color-mix(in_srgb,var(--category-accent)_10%,transparent)] text-[var(--color-foreground)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--category-accent)]",
                )}
                style={{ "--category-accent": accent } as CSSProperties}
                aria-pressed={selectedCount > 0}
              >
                <p className="text-sm font-semibold text-[var(--category-accent)]">{item.label}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.map((tag) => {
                    const tagActive = selectedTagSlugs.includes(tag.slug);
                    return (
                      <span
                        key={tag.id}
                        className={cn(
                          "text-xs",
                          active
                            ? "text-[var(--color-muted-foreground)]"
                            : tagActive
                              ? "font-semibold text-[var(--category-accent)]"
                              : "text-[var(--color-muted-foreground)]",
                        )}
                      >
                        #{tag.name}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </section>
      <section>
        <SectionHeader
          title={`Rekomendasi sekitar ${formatHomeLocation(location)}`}
          subtitle=""
        />
        <div className="space-y-4">
          <HorizontalScroll>
            {locationSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                tags={tags}
                variant="compact"
                distanceKm={spot.distanceKm}
              />
            ))}
          </HorizontalScroll>
          <HorizontalScroll>
            {locationEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tags={tags}
                variant="compact"
                distanceKm={event.distanceKm}
              />
            ))}
          </HorizontalScroll>
        </div>
      </section>

      

      <section>
        <SectionHeader title="Berdasarkan minat" subtitle="Dari profil demo" />
        <div className="space-y-4">
          <HorizontalScroll>
            {interestSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                tags={tags}
                variant="compact"
              />
            ))}
          </HorizontalScroll>
          <HorizontalScroll>
            {interestEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tags={tags}
                variant="compact"
              />
            ))}
          </HorizontalScroll>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Spot pilihan"
          actionHref={routes.explore({ type: "spot" })}
        />
        <HorizontalScroll>
          {visibleFeaturedSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} tags={tags} variant="compact" />
          ))}
        </HorizontalScroll>
      </section>

      <section>
        <SectionHeader
          title="Event pilihan"
          actionHref={routes.explore({ type: "event" })}
        />
        <HorizontalScroll>
          {visibleFeaturedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              tags={tags}
              variant="compact"
            />
          ))}
        </HorizontalScroll>
      </section>
    </div>
  );
}
