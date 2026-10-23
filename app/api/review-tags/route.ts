import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam } from "@/lib/url";
import { createReviewTagSchema } from "@/schemas";
import { storeCreateReviewTag, storeListReviewTags } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const spotId = sp.get("spotId") ?? undefined;
    const ids = readArrayParam(
      sp.getAll("ids").length > 0 ? sp.getAll("ids") : (sp.get("ids") ?? undefined),
    );
    return jsonOk(
      storeListReviewTags({
        spotId,
        ids: ids.length > 0 ? ids : undefined,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createReviewTagSchema.parse(body);
    const created = storeCreateReviewTag(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
