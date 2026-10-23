import { events } from "@/data/fixtures/events";
import { spots } from "@/data/fixtures/spots";
import { tags } from "@/data/fixtures/tags";
import { sortByDistance } from "@/lib/location";
import type { NgetagEvent } from "@/types/event";
import type { Coordinates, WithDistance } from "@/types/location";
import type { Spot } from "@/types/spot";
import type { Tag } from "@/types/tag";

export type RecommendedSpot = Spot & Partial<WithDistance>;
export type RecommendedEvent = NgetagEvent & Partial<WithDistance>;

function byFeaturedThenNewest<T extends { featured?: boolean; createdAt: string }>(
  a: T,
  b: T,
): number {
  return (
    Number(b.featured ?? false) - Number(a.featured ?? false) ||
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPopularTags(limit = 10): Tag[] {
  return [...tags]
    .sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0))
    .slice(0, limit);
}

export function getLocationSpotRecommendations(
  location: Coordinates,
  limit = 6,
): RecommendedSpot[] {
  return sortByDistance(spots, location).slice(0, limit);
}

export function getLocationEventRecommendations(
  location: Coordinates,
  limit = 6,
): RecommendedEvent[] {
  return sortByDistance(events, location).slice(0, limit);
}

export function getInterestSpotRecommendations(
  favoriteTagIds: string[],
  limit = 6,
): RecommendedSpot[] {
  return spots
    .filter((spot) => spot.tagIds.some((tagId) => favoriteTagIds.includes(tagId)))
    .sort(byFeaturedThenNewest)
    .slice(0, limit);
}

export function getInterestEventRecommendations(
  favoriteTagIds: string[],
  favoriteInterestIds: string[] = [],
  limit = 6,
): RecommendedEvent[] {
  return events
    .filter((event) =>
      event.tagIds.some((tagId) => favoriteTagIds.includes(tagId)) ||
      event.interestIds.some((interestId) =>
        favoriteInterestIds.includes(interestId),
      ),
    )
    .sort(
      (a, b) =>
        Number(b.featured ?? false) - Number(a.featured ?? false) ||
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
    .slice(0, limit);
}
