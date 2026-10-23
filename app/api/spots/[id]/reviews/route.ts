import type { NextRequest } from "next/server";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
} from "@/lib/api-response";
import { createReviewSchema } from "@/schemas";
import {
  storeCreateReview,
  storeGetSpotById,
  storeListReviews,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(storeListReviews({ spotId: spot.id }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    const body = await request.json();
    const input = createReviewSchema.parse({
      ...body,
      spotId: spot.id,
    });
    const review = storeCreateReview(input);
    return jsonCreated(review);
  } catch (error) {
    return handleApiError(error);
  }
}
