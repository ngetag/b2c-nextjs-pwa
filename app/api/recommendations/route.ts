import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import { storeGetRecommendations } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const lat = readNumberParam(sp.get("lat") ?? undefined);
    const lng = readNumberParam(sp.get("lng") ?? undefined);
    const limit = readNumberParam(sp.get("limit") ?? undefined, 8) ?? 8;
    const favoriteTagIds = readArrayParam(
      sp.getAll("favoriteTagIds").length > 0
        ? sp.getAll("favoriteTagIds")
        : (sp.get("favoriteTagIds") ?? undefined),
    );
    const interestIds = readArrayParam(
      sp.getAll("interestIds").length > 0
        ? sp.getAll("interestIds")
        : (sp.get("interestIds") ?? undefined),
    );

    return jsonOk(
      storeGetRecommendations({
        lat,
        lng,
        favoriteTagIds: favoriteTagIds.length > 0 ? favoriteTagIds : undefined,
        interestIds: interestIds.length > 0 ? interestIds : undefined,
        limit,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
