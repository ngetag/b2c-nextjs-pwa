import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import {
  storeGetRecommendations,
  storeListCommunities,
  storeListCommunityCategories,
  storeListInterests,
  storeListTags,
  storeSearchEvents,
  storeSearchSpots,
} from "@/server/store";
import type { SearchQuery } from "@/types/index";

export async function unifiedSearch(
  query: SearchQuery & { lat?: number; lng?: number } = {},
) {
  const qs = buildSearchParams({
    q: query.q,
    type: query.type,
    tagSlugs: query.tagSlugs,
    city: query.city,
    sort: query.sort,
    page: query.page !== undefined ? String(query.page) : undefined,
    pageSize: query.pageSize !== undefined ? String(query.pageSize) : undefined,
    lat: query.lat !== undefined ? String(query.lat) : undefined,
    lng: query.lng !== undefined ? String(query.lng) : undefined,
  });

  return apiFetch(`/api/search${qs}`, {
    fallback: () => {
      const qLower = query.q?.toLowerCase();
      return {
        query,
        spots: storeSearchSpots(query),
        events: storeSearchEvents(query),
        communities: storeListCommunities({ q: query.q }),
        discovery: {
          tags: qLower
            ? storeListTags().filter(
                (t) =>
                  t.name.toLowerCase().includes(qLower) ||
                  t.slug.toLowerCase().includes(qLower),
              )
            : [],
          categories: qLower
            ? storeListCommunityCategories().filter((c) =>
                c.title.toLowerCase().includes(qLower),
              )
            : [],
          interests: qLower
            ? storeListInterests().filter((i) =>
                i.label.toLowerCase().includes(qLower),
              )
            : [],
        },
      };
    },
  });
}

export async function getRecommendations(opts?: {
  lat?: number;
  lng?: number;
  favoriteTagIds?: string[];
  interestIds?: string[];
  limit?: number;
}) {
  const qs = buildSearchParams({
    lat: opts?.lat !== undefined ? String(opts.lat) : undefined,
    lng: opts?.lng !== undefined ? String(opts.lng) : undefined,
    favoriteTagIds: opts?.favoriteTagIds,
    interestIds: opts?.interestIds,
    limit: opts?.limit !== undefined ? String(opts.limit) : undefined,
  });

  return apiFetch<ReturnType<typeof storeGetRecommendations>>(
    `/api/recommendations${qs}`,
    {
      fallback: () => storeGetRecommendations(opts),
    },
  );
}
