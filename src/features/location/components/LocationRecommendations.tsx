"use client";

import { HorizontalScroll } from "@/components/common/HorizontalScroll";
import { SectionHeader } from "@/components/common/SectionHeader";
import { routes } from "@/config/routes";
import { events } from "@/data/fixtures/events";
import { spots } from "@/data/fixtures/spots";
import { tags } from "@/data/fixtures/tags";
import { EventCard } from "@/features/event/components/EventCard";
import { SpotCard } from "@/features/spot/components/SpotCard";
import { formatHomeLocation, sortByDistance } from "@/lib/location";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";

export function LocationRecommendations() {
  const { location } = useCurrentLocationStore();

  const recommendedSpots = sortByDistance(spots, location).slice(0, 8);
  const recommendedEvents = sortByDistance(events, location).slice(0, 8);
  const locationLabel = formatHomeLocation(location);

  return (
    <>
      {recommendedSpots.length > 0 ? (
        <section>
          <SectionHeader
            title={`Spot sekitar ${locationLabel}`}
            actionHref={routes.explore({ type: "spot", sort: "distance" })}
          />
          <HorizontalScroll>
            {recommendedSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                tags={tags}
                variant="compact"
                distanceKm={spot.distanceKm}
              />
            ))}
          </HorizontalScroll>
        </section>
      ) : null}

      {recommendedEvents.length > 0 ? (
        <section>
          <SectionHeader
            title={`Event sekitar ${locationLabel}`}
            actionHref={routes.explore({ type: "event", sort: "distance" })}
          />
          <HorizontalScroll>
            {recommendedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tags={tags}
                variant="compact"
                distanceKm={event.distanceKm}
              />
            ))}
          </HorizontalScroll>
        </section>
      ) : null}
    </>
  );
}
