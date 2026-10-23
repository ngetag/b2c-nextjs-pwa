"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { PromoCard } from "@/features/promo/components/PromoCard";
import { TagFilterChips } from "@/features/tag/components/TagFilterChips";
import { events } from "@/data/fixtures/events";
import { spots } from "@/data/fixtures/spots";
import { useTagSelection } from "@/hooks/useTagSelection";
import { calculateDistanceKm, formatHomeLocation } from "@/lib/location";
import { hasAnySelectedTag, tagSlugsToIds } from "@/lib/tagFilter";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";
import type { Promo } from "@/types/promo";
import type { Tag } from "@/types/tag";

interface PromoLocationViewProps {
  promos: Promo[];
  tags: Tag[];
}

function getPromoDistance(promo: Promo, location: { latitude: number; longitude: number }) {
  const spot = promo.spotId ? spots.find((item) => item.id === promo.spotId) : undefined;
  const event = promo.eventId
    ? events.find((item) => item.id === promo.eventId)
    : undefined;
  const targetLocation = spot?.location ?? event?.location;
  return targetLocation ? calculateDistanceKm(location, targetLocation) : Number.MAX_VALUE;
}

function getPromoTagIds(promo: Promo): string[] {
  const spot = promo.spotId ? spots.find((item) => item.id === promo.spotId) : undefined;
  const event = promo.eventId
    ? events.find((item) => item.id === promo.eventId)
    : undefined;
  return spot?.tagIds ?? event?.tagIds ?? [];
}

export function PromoLocationView({ promos, tags }: PromoLocationViewProps) {
  const location = useCurrentLocationStore((state) => state.location);
  const { selectedTagSlugs, toggleTag, clearTags } = useTagSelection();
  const selectedTagIds = tagSlugsToIds(selectedTagSlugs, tags);
  const orderedPromos = [...promos].sort(
    (a, b) => getPromoDistance(a, location) - getPromoDistance(b, location),
  );
  const visiblePromos = orderedPromos.filter((promo) =>
    hasAnySelectedTag(getPromoTagIds(promo), selectedTagIds),
  );

  return (
    <>
      <header className="space-y-2 pb-6">
        <div className="h-1 w-10 rounded-full bg-[var(--accent-coffee)]" />
        <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
          Promo
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Deal menarik di sekitar {formatHomeLocation(location)}.
        </p>
      </header>

      <TagFilterChips
        tags={tags}
        selectedTagSlugs={selectedTagSlugs}
        onToggleTag={toggleTag}
        onClear={clearTags}
        title="Filter tag"
        className="pb-5"
      />

      {visiblePromos.length === 0 ? (
        <EmptyState
          title="Belum ada promo"
          description="Belum ketemu promo yang cocok. Coba lepas beberapa tag dulu."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePromos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}
    </>
  );
}
