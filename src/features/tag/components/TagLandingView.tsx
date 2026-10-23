"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/features/event/components/EventCard";
import { ResultGrid } from "@/features/search/components/ResultGrid";
import { SpotCard } from "@/features/spot/components/SpotCard";
import { TagFilterChips } from "@/features/tag/components/TagFilterChips";
import { useTagSelection } from "@/hooks/useTagSelection";
import { formatCount } from "@/lib/format";
import { getTagAccent } from "@/lib/discoveryAccent";
import { filterEventsByAnyTag, filterSpotsByAnyTag, tagSlugsToIds } from "@/lib/tagFilter";
import type { NgetagEvent } from "@/types/event";
import type { Spot } from "@/types/spot";
import type { Tag } from "@/types/tag";

interface TagLandingViewProps {
  activeTag: Tag;
  spots: Spot[];
  events: NgetagEvent[];
  tags: Tag[];
}

export function TagLandingView({
  activeTag,
  spots,
  events,
  tags,
}: TagLandingViewProps) {
  const { selectedTagSlugs, toggleTag, clearTags } = useTagSelection();
  const effectiveTagSlugs = useMemo(
    () => (selectedTagSlugs.length > 0 ? selectedTagSlugs : [activeTag.slug]),
    [activeTag.slug, selectedTagSlugs],
  );
  const selectedTagIds = useMemo(
    () => tagSlugsToIds(effectiveTagSlugs, tags),
    [effectiveTagSlugs, tags],
  );
  const visibleSpots = filterSpotsByAnyTag(spots, selectedTagIds);
  const visibleEvents = filterEventsByAnyTag(events, selectedTagIds);
  const accent = getTagAccent(activeTag);

  return (
    <div style={{ "--tag-accent": accent } as CSSProperties}>
      <header className="space-y-2 pb-6">
        <div className="h-1 w-10 rounded-full bg-[var(--tag-accent)]" />
        <p className="text-xs font-semibold text-[var(--tag-accent)]">
          Tag
        </p>
        <h1 className="font-display text-3xl font-bold text-[var(--color-foreground)] md:text-4xl">
          #{activeTag.name}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {formatCount(visibleSpots.length, "spot")} ·{" "}
          {formatCount(visibleEvents.length, "event")}
        </p>
      </header>

      <TagFilterChips
        tags={tags}
        selectedTagSlugs={effectiveTagSlugs}
        onToggleTag={toggleTag}
        onClear={clearTags}
        title="Filter tag"
        className="pb-5"
      />

      <Tabs defaultValue="spots">
        <TabsList>
          <TabsTrigger value="spots">Spot ({visibleSpots.length})</TabsTrigger>
          <TabsTrigger value="events">Event ({visibleEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="spots">
          {visibleSpots.length === 0 ? (
            <EmptyState
              title="Belum ada spot"
              description="Belum ada spot yang cocok. Coba kombinasi tag lain."
            />
          ) : (
            <ResultGrid>
              {visibleSpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} tags={tags} />
              ))}
            </ResultGrid>
          )}
        </TabsContent>

        <TabsContent value="events">
          {visibleEvents.length === 0 ? (
            <EmptyState
              title="Belum ada event"
              description="Belum ada event yang cocok. Coba kombinasi tag lain."
            />
          ) : (
            <ResultGrid>
              {visibleEvents.map((event) => (
                <EventCard key={event.id} event={event} tags={tags} />
              ))}
            </ResultGrid>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
