import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createReviewSchema } from "@/schemas";
import { storeCreateReview, storeListReviews } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const spotId = sp.get("spotId") ?? undefined;
    const authorId = sp.get("authorId") ?? undefined;
    return jsonOk(storeListReviews({ spotId, authorId }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createReviewSchema.parse(body);
    const created = storeCreateReview(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
