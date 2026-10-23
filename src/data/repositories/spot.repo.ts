import { spots } from "@/data/fixtures/spots";
import { tags } from "@/data/fixtures/tags";
import { simulateLatency } from "@/data/repositories/_latency";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { sortByDistance } from "@/lib/location";
import type { Spot } from "@/types/spot";
import type { Coordinates, WithDistance } from "@/types/location";
import type { Paginated, SearchQuery } from "@/types/index";

export type SpotRecommendation = Spot & WithDistance;

function tagSlugsToIds(slugs: string[]): string[] {
  return tags.filter((t) => slugs.includes(t.slug)).map((t) => t.id);
}

function applySpotFilter(items: Spot[], query: SearchQuery): Spot[] {
  let result = items;
  if (query.q) {
    const q = query.q.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.location.address.toLowerCase().includes(q) ||
        s.location.village.toLowerCase().includes(q) ||
        s.location.district.toLowerCase().includes(q),
    );
  }
  if (query.tagSlugs && query.tagSlugs.length > 0) {
    const ids = tagSlugsToIds(query.tagSlugs);
    if (ids.length > 0) {
      result = result.filter((s) => ids.every((id) => s.tagIds.includes(id)));
    }
  }
  if (query.city) {
    result = result.filter(
      (s) => s.location.city.toLowerCase() === query.city!.toLowerCase(),
    );
  }
  return result;
}

function applySpotSort(items: Spot[], sort?: SearchQuery["sort"]): Spot[] {
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
      // Admin recommendations first, then newest.
      list.sort(
        (a, b) =>
          Number(b.featured ?? false) - Number(a.featured ?? false) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
  return list;
}

export async function searchSpots(
  query: SearchQuery = {},
): Promise<Paginated<Spot>> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  const filtered = applySpotFilter(spots, query);
  const sorted = applySpotSort(filtered, query.sort);
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);
  return simulateLatency({ items, page, pageSize, total: sorted.length });
}

export async function getSpotById(id: string): Promise<Spot | null> {
  return simulateLatency(spots.find((s) => s.id === id) ?? null);
}

export async function listFeaturedSpots(limit = 8): Promise<Spot[]> {
  const featured = spots.filter((s) => s.featured);
  const rest = spots.filter((s) => !s.featured);
  const ordered = [...featured, ...rest].sort(
    (a, b) =>
      Number(b.featured ?? false) - Number(a.featured ?? false) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return simulateLatency(ordered.slice(0, limit));
}

export async function listRecommendedSpotsByLocation(
  userLocation: Coordinates,
  limit = 8,
): Promise<SpotRecommendation[]> {
  return simulateLatency(sortByDistance(spots, userLocation).slice(0, limit));
}

export async function listSpotsByTagSlug(
  slug: string,
  limit?: number,
): Promise<Spot[]> {
  const ids = tagSlugsToIds([slug]);
  const list = spots.filter((s) => s.tagIds.some((id) => ids.includes(id)));
  return simulateLatency(limit ? list.slice(0, limit) : list);
}
