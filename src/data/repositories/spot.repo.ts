import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type {
  CreateSpotInput,
  OpeningHourInput,
  UpdateSpotInput,
} from "@/schemas";
import {
  type SpotSearchOptions,
  storeCreateSpot,
  storeDeleteSpot,
  storeGetSpotById,
  storeListFeaturedSpots,
  storeListRecommendedSpotsByLocation,
  storeSearchSpots,
  storeUpdateSpot,
  storeUpdateSpotOpeningHours,
} from "@/server/store";
import type { SpotContract } from "@/shared/contracts";
import type { Paginated } from "@/types/index";
import type { Coordinates, WithDistance } from "@/types/location";
import type { Spot } from "@/types/spot";

export type SpotRecommendation = Spot & WithDistance;

export async function searchSpots(
  query: SpotSearchOptions = {},
): Promise<Paginated<Spot>> {
  const qs = buildSearchParams({
    q: query.q,
    tagSlugs: query.tagSlugs,
    city: query.city,
    sort: query.sort,
    page: query.page !== undefined ? String(query.page) : undefined,
    pageSize: query.pageSize !== undefined ? String(query.pageSize) : undefined,
    lat: query.lat !== undefined ? String(query.lat) : undefined,
    lng: query.lng !== undefined ? String(query.lng) : undefined,
    ownerId: query.ownerId,
    publishStatus: query.publishStatus,
    featured: query.featured !== undefined ? String(query.featured) : undefined,
    anyTagMatch: query.anyTagMatch ? "true" : undefined,
  });

  return apiFetch<Paginated<Spot>>(`/api/spots${qs}`, {
    fallback: () => storeSearchSpots(query),
  });
}

export async function getSpotById(id: string): Promise<SpotContract | null> {
  return apiFetch<SpotContract | null>(
    `/api/spots/${encodeURIComponent(id)}`,
    {
      fallback: () => storeGetSpotById(id),
    },
  );
}

export async function listFeaturedSpots(limit = 8): Promise<Spot[]> {
  return apiFetch<Spot[]>(`/api/spots?mode=featured&limit=${limit}`, {
    fallback: () => storeListFeaturedSpots(limit),
  });
}

export async function listRecommendedSpotsByLocation(
  userLocation: Coordinates,
  limit = 8,
): Promise<SpotRecommendation[]> {
  const qs = buildSearchParams({
    mode: "recommended",
    lat: String(userLocation.latitude),
    lng: String(userLocation.longitude),
    limit: String(limit),
  });
  return apiFetch<SpotRecommendation[]>(`/api/spots${qs}`, {
    fallback: () => storeListRecommendedSpotsByLocation(userLocation, limit),
  });
}

export async function listSpotsByTagSlug(
  slug: string,
  limit?: number,
): Promise<Spot[]> {
  const pageSize = limit ?? 100;
  const res = await searchSpots({
    tagSlugs: [slug],
    pageSize,
    anyTagMatch: true,
  });
  return limit ? res.items.slice(0, limit) : res.items;
}

export async function createSpot(
  input: CreateSpotInput,
): Promise<SpotContract> {
  return apiFetch<SpotContract>("/api/spots", {
    method: "POST",
    body: input,
    fallback: () => storeCreateSpot(input),
  });
}

export async function updateSpot(
  id: string,
  patch: UpdateSpotInput,
): Promise<SpotContract | null> {
  return apiFetch<SpotContract | null>(
    `/api/spots/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: patch,
      fallback: () => storeUpdateSpot(id, patch),
    },
  );
}

export async function updateSpotOpeningHours(
  spotId: string,
  openingHours: OpeningHourInput[],
): Promise<OpeningHourInput[] | null> {
  return apiFetch<OpeningHourInput[] | null>(
    `/api/spots/${encodeURIComponent(spotId)}/opening-hours`,
    {
      method: "PUT",
      body: { openingHours },
      fallback: () =>
        storeUpdateSpotOpeningHours(spotId, openingHours)?.openingHours ?? null,
    },
  );
}

export async function deleteSpot(id: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/spots/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeleteSpot(id) }),
    },
  );
  return Boolean(res?.deleted);
}
