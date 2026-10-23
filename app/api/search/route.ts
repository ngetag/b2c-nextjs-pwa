import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import {
  storeListCommunities,
  storeListCommunityCategories,
  storeListInterests,
  storeListTags,
  storeSearchEvents,
  storeSearchSpots,
} from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const q = sp.get("q") ?? undefined;
    const typeParam = sp.get("type");
    const type =
      typeParam === "spot" || typeParam === "event" || typeParam === "all"
        ? typeParam
        : "all";
    const tagSlugs = readArrayParam(
      sp.getAll("tagSlugs").length > 0
        ? sp.getAll("tagSlugs")
        : (sp.get("tags") ?? undefined),
    );
    const city = sp.get("city") ?? undefined;
    const sortParam = sp.get("sort");
    const sort =
      sortParam === "newest" ||
      sortParam === "distance" ||
      sortParam === "relevance"
        ? sortParam
        : undefined;
    const page = readNumberParam(sp.get("page") ?? undefined, 1) ?? 1;
    const pageSize = readNumberParam(sp.get("pageSize") ?? undefined, 24) ?? 24;
    const lat = readNumberParam(sp.get("lat") ?? undefined);
    const lng = readNumberParam(sp.get("lng") ?? undefined);

    const spots =
      type === "event"
        ? { items: [], page, pageSize, total: 0 }
        : storeSearchSpots({
            q,
            tagSlugs,
            city,
            sort,
            page,
            pageSize,
            lat,
            lng,
          });

    const events =
      type === "spot"
        ? { items: [], page, pageSize, total: 0 }
        : storeSearchEvents({
            q,
            tagSlugs,
            city,
            sort,
            page,
            pageSize,
            lat,
            lng,
          });

    const communities = storeListCommunities({ q });

    const qLower = q?.toLowerCase();
    const matchingTags = qLower
      ? storeListTags().filter(
          (t) =>
            t.name.toLowerCase().includes(qLower) ||
            t.slug.toLowerCase().includes(qLower),
        )
      : [];
    const matchingCategories = qLower
      ? storeListCommunityCategories().filter((c) =>
          c.title.toLowerCase().includes(qLower),
        )
      : [];
    const matchingInterests = qLower
      ? storeListInterests().filter((i) =>
          i.label.toLowerCase().includes(qLower),
        )
      : [];

    return jsonOk({
      query: { q, type, tagSlugs, city, sort, page, pageSize },
      spots,
      events,
      communities,
      discovery: {
        tags: matchingTags,
        categories: matchingCategories,
        interests: matchingInterests,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
