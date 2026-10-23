import { events } from "@/data/fixtures/events";
import { tags } from "@/data/fixtures/tags";
import { simulateLatency } from "@/data/repositories/_latency";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { sortByDistance } from "@/lib/location";
import type { NgetagEvent } from "@/types/event";
import type { Coordinates, WithDistance } from "@/types/location";
import type { Paginated, SearchQuery } from "@/types/index";

export type EventRecommendation = NgetagEvent & WithDistance;

function tagSlugsToIds(slugs: string[]): string[] {
  return tags.filter((t) => slugs.includes(t.slug)).map((t) => t.id);
}

function applyEventFilter(
  items: NgetagEvent[],
  query: SearchQuery,
): NgetagEvent[] {
  let result = items;
  if (query.q) {
    const q = query.q.toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venueName.toLowerCase().includes(q) ||
        e.location.village.toLowerCase().includes(q) ||
        e.location.district.toLowerCase().includes(q),
    );
  }
  if (query.tagSlugs && query.tagSlugs.length > 0) {
    const ids = tagSlugsToIds(query.tagSlugs);
    if (ids.length > 0) {
      result = result.filter((e) => ids.every((id) => e.tagIds.includes(id)));
    }
  }
  if (query.city) {
    result = result.filter(
      (e) => e.location.city.toLowerCase() === query.city!.toLowerCase(),
    );
  }
  return result;
}

function applyEventSort(
  items: NgetagEvent[],
  sort?: SearchQuery["sort"],
): NgetagEvent[] {
  const list = [...items];
  switch (sort) {
    case "newest":
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "distance":
    case "relevance":
    default:
      // upcoming first by start date
      list.sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
  }
  return list;
}

export async function searchEvents(
  query: SearchQuery = {},
): Promise<Paginated<NgetagEvent>> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  const filtered = applyEventFilter(events, query);
  const sorted = applyEventSort(filtered, query.sort);
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);
  return simulateLatency({ items, page, pageSize, total: sorted.length });
}

export async function getEventById(id: string): Promise<NgetagEvent | null> {
  return simulateLatency(events.find((e) => e.id === id) ?? null);
}

export async function listFeaturedEvents(limit = 8): Promise<NgetagEvent[]> {
  const featured = events.filter((e) => e.featured);
  const rest = events.filter((e) => !e.featured);
  const ordered = [...featured, ...rest].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
  return simulateLatency(ordered.slice(0, limit));
}

export async function listRecommendedEventsByLocation(
  userLocation: Coordinates,
  limit = 8,
): Promise<EventRecommendation[]> {
  return simulateLatency(sortByDistance(events, userLocation).slice(0, limit));
}

export async function listEventsByTagSlug(
  slug: string,
  limit?: number,
): Promise<NgetagEvent[]> {
  const ids = tagSlugsToIds([slug]);
  const list = events.filter((e) => e.tagIds.some((id) => ids.includes(id)));
  return simulateLatency(limit ? list.slice(0, limit) : list);
}
