"use client";

import { HorizontalScroll } from "@/components/common/HorizontalScroll";
import { SectionHeader } from "@/components/common/SectionHeader";
import { routes } from "@/config/routes";
import { HomeCommunityRecommendations } from "@/features/community/components/HomeCommunityRecommendations";
import { EventCard } from "@/features/event/components/EventCard";
import { PromoCard } from "@/features/promo/components/PromoCard";
import {
  getLocationEventRecommendations,
  getLocationSpotRecommendations,
} from "@/features/search/lib/recommendations";
import { SpotCard } from "@/features/spot/components/SpotCard";
import { TagFilterChips } from "@/features/tag/components/TagFilterChips";
import { useTagSelection } from "@/hooks/useTagSelection";
import { formatHomeLocation } from "@/lib/location";
import { filterEventsByAnyTag, filterSpotsByAnyTag, tagSlugsToIds } from "@/lib/tagFilter";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";
import type { NgetagEvent } from "@/types/event";
import type { Promo } from "@/types/promo";
import type { Spot } from "@/types/spot";
import type { Tag } from "@/types/tag";

interface HomeFilteredContentProps {
  trendingTags: Tag[];
  allTags: Tag[];
  featuredSpots: Spot[];
  featuredEvents: NgetagEvent[];
  heroPromo?: Promo;
  sidePromos: Promo[];
}

export function HomeFilteredContent({
  trendingTags,
  allTags,
  featuredSpots,
  featuredEvents,
  heroPromo,
  sidePromos,
}: HomeFilteredContentProps) {
  const { selectedTagSlugs, toggleTag, clearTags } = useTagSelection();
  const location = useCurrentLocationStore((state) => state.location);
  const selectedTagIds = tagSlugsToIds(selectedTagSlugs, allTags);
  const visibleSpots = filterSpotsByAnyTag(featuredSpots, selectedTagIds);
  const visibleEvents = filterEventsByAnyTag(featuredEvents, selectedTagIds);
  const locationSpots = filterSpotsByAnyTag(
    getLocationSpotRecommendations(location, 8),
    selectedTagIds,
  );
  const locationEvents = filterEventsByAnyTag(
    getLocationEventRecommendations(location, 8),
    selectedTagIds,
  );

  return (
    <div className="relative flex flex-col gap-10 md:pt-0">
      {trendingTags.length > 0 ? (
        <section className="hidden md:block">
          <SectionHeader title="Lagi banyak dicari" />
          <TagFilterChips
            tags={trendingTags}
            selectedTagSlugs={selectedTagSlugs}
            onToggleTag={toggleTag}
            onClear={clearTags}
          />
        </section>
      ) : null}

      {locationSpots.length > 0 || locationEvents.length > 0 ? (
        <section>
          <SectionHeader
            title={`Dekat ${formatHomeLocation(location)}`}
            subtitle=""
          />
          <div className="space-y-4">
            {locationSpots.length > 0 ? (
              <HorizontalScroll>
                {locationSpots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    tags={allTags}
                    variant="compact"
                    distanceKm={spot.distanceKm}
                  />
                ))}
              </HorizontalScroll>
            ) : null}
            {locationEvents.length > 0 ? (
              <HorizontalScroll>
                {locationEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    tags={allTags}
                    variant="compact"
                    distanceKm={event.distanceKm}
                  />
                ))}
              </HorizontalScroll>
            ) : null}
          </div>
        </section>
      ) : null}

      {selectedTagSlugs.length === 0 ? <HomeCommunityRecommendations /> : null}

      {visibleSpots.length > 0 ? (
        <section>
          <SectionHeader
            title="Spot buat nongkrong"
            actionHref={routes.explore({ type: "spot", tags: selectedTagSlugs })}
          />
          <HorizontalScroll>
            {visibleSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                tags={allTags}
                variant="compact"
              />
            ))}
          </HorizontalScroll>
        </section>
      ) : null}

      {heroPromo ? (
        <section>
          <SectionHeader title="Promo yang sayang dilewatkan" actionHref={routes.promo()} />
          <div className="grid gap-3 md:grid-cols-2">
            <PromoCard promo={heroPromo} variant="highlight" />
            <div className="grid gap-3 md:grid-cols-1">
              {sidePromos.map((promo) => (
                <PromoCard key={promo.id} promo={promo} variant="highlight" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {visibleEvents.length > 0 ? (
        <section>
          <SectionHeader
            title="Event buat agenda berikutnya"
            actionHref={routes.explore({ type: "event", tags: selectedTagSlugs })}
          />
          <HorizontalScroll>
            {visibleEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tags={allTags}
                variant="compact"
              />
            ))}
          </HorizontalScroll>
        </section>
      ) : null}
    </div>
  );
}
