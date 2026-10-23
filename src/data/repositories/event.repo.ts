import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type { CreateEventInput, UpdateEventInput } from "@/schemas";
import {
  type EventSearchOptions,
  storeCreateEvent,
  storeDeleteEvent,
  storeGetEventById,
  storeListFeaturedEvents,
  storeListRecommendedEventsByLocation,
  storeSearchEvents,
  storeUpdateEvent,
} from "@/server/store";
import type { EventContract } from "@/shared/contracts";
import type { NgetagEvent } from "@/types/event";
import type { Paginated } from "@/types/index";
import type { Coordinates, WithDistance } from "@/types/location";

export type EventRecommendation = NgetagEvent & WithDistance;

export async function searchEvents(
  query: EventSearchOptions = {},
): Promise<Paginated<NgetagEvent>> {
  const qs = buildSearchParams({
    q: query.q,
    tagSlugs: query.tagSlugs,
    interestIds: query.interestIds,
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

  return apiFetch<Paginated<NgetagEvent>>(`/api/events${qs}`, {
    fallback: () => storeSearchEvents(query),
  });
}

export async function getEventById(id: string): Promise<EventContract | null> {
  return apiFetch<EventContract | null>(
    `/api/events/${encodeURIComponent(id)}`,
    {
      fallback: () => storeGetEventById(id),
    },
  );
}

export async function listFeaturedEvents(limit = 8): Promise<NgetagEvent[]> {
  return apiFetch<NgetagEvent[]>(`/api/events?mode=featured&limit=${limit}`, {
    fallback: () => storeListFeaturedEvents(limit),
  });
}

export async function listRecommendedEventsByLocation(
  userLocation: Coordinates,
  limit = 8,
): Promise<EventRecommendation[]> {
  const qs = buildSearchParams({
    mode: "recommended",
    lat: String(userLocation.latitude),
    lng: String(userLocation.longitude),
    limit: String(limit),
  });
  return apiFetch<EventRecommendation[]>(`/api/events${qs}`, {
    fallback: () => storeListRecommendedEventsByLocation(userLocation, limit),
  });
}

export async function listEventsByTagSlug(
  slug: string,
  limit?: number,
): Promise<NgetagEvent[]> {
  const pageSize = limit ?? 100;
  const res = await searchEvents({
    tagSlugs: [slug],
    pageSize,
    anyTagMatch: true,
  });
  return limit ? res.items.slice(0, limit) : res.items;
}

export async function createEvent(
  input: CreateEventInput,
): Promise<EventContract> {
  return apiFetch<EventContract>("/api/events", {
    method: "POST",
    body: input,
    fallback: () => storeCreateEvent(input),
  });
}

export async function updateEvent(
  id: string,
  patch: UpdateEventInput,
): Promise<EventContract | null> {
  return apiFetch<EventContract | null>(
    `/api/events/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: patch,
      fallback: () => storeUpdateEvent(id, patch),
    },
  );
}

export async function deleteEvent(id: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/events/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeleteEvent(id) }),
    },
  );
  return Boolean(res?.deleted);
}
