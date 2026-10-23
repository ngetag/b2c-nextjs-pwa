import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import { createTagSchema } from "@/schemas";
import {
  storeCreateTag,
  storeGetTagsByIds,
  storeListTags,
} from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const ids = readArrayParam(
      sp.getAll("ids").length > 0 ? sp.getAll("ids") : (sp.get("ids") ?? undefined),
    );
    if (ids.length > 0) {
      return jsonOk(storeGetTagsByIds(ids));
    }

    const category = sp.get("category") ?? undefined;
    const includeInactive = sp.get("includeInactive") === "true";
    const trendingLimit = readNumberParam(
      sp.get("trendingLimit") ?? sp.get("limit") ?? undefined,
    );

    return jsonOk(
      storeListTags({
        category,
        includeInactive,
        trendingLimit: sp.get("trending") === "true" ? (trendingLimit ?? 8) : trendingLimit,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createTagSchema.parse(body);
    const created = storeCreateTag(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
