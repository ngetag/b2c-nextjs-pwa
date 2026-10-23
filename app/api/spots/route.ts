import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import { createSpotSchema } from "@/schemas";
import {
  storeCreateSpot,
  storeListFeaturedSpots,
  storeListRecommendedSpotsByLocation,
  storeSearchSpots,
} from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const mode = sp.get("mode");
    const limit = readNumberParam(sp.get("limit") ?? undefined, 8) ?? 8;

    if (mode === "featured") {
      return jsonOk(storeListFeaturedSpots(limit));
    }

    if (mode === "recommended") {
      const lat = readNumberParam(sp.get("lat") ?? undefined, -6.2769) ?? -6.2769;
      const lng = readNumberParam(sp.get("lng") ?? undefined, 106.8067) ?? 106.8067;
      return jsonOk(
        storeListRecommendedSpotsByLocation(
          { latitude: lat, longitude: lng },
          limit,
        ),
      );
    }

    const q = sp.get("q") ?? undefined;
    const tagSlugs = readArrayParam(sp.getAll("tagSlugs").length > 0 ? sp.getAll("tagSlugs") : (sp.get("tags") ?? undefined));
    const city = sp.get("city") ?? undefined;
    const sortParam = sp.get("sort");
    const sort =
      sortParam === "newest" ||
      sortParam === "distance" ||
      sortParam === "relevance"
        ? sortParam
        : undefined;
    const page = readNumberParam(sp.get("page") ?? undefined, 1) ?? 1;
    const pageSize = readNumberParam(sp.get("pageSize") ?? undefined, 12) ?? 12;
    const lat = readNumberParam(sp.get("lat") ?? undefined);
    const lng = readNumberParam(sp.get("lng") ?? undefined);
    const ownerId = sp.get("ownerId") ?? undefined;
    const publishStatusParam = sp.get("publishStatus");
    const publishStatus =
      publishStatusParam === "draft" ||
      publishStatusParam === "published" ||
      publishStatusParam === "archived" ||
      publishStatusParam === "all"
        ? publishStatusParam
        : undefined;
    const featuredParam = sp.get("featured");
    const featured =
      featuredParam === "true"
        ? true
        : featuredParam === "false"
          ? false
          : undefined;
    const anyTagMatch = sp.get("anyTagMatch") === "true";

    const result = storeSearchSpots({
      q,
      tagSlugs,
      city,
      sort,
      page,
      pageSize,
      lat,
      lng,
      ownerId,
      publishStatus,
      featured,
      anyTagMatch,
    });

    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createSpotSchema.parse(body);
    const created = storeCreateSpot(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
