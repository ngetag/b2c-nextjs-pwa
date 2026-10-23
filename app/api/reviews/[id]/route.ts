import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateReviewSchema } from "@/schemas";
import {
  storeDeleteReview,
  storeGetReviewById,
  storeUpdateReview,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const review = storeGetReviewById(id);
    if (!review) {
      return jsonError("NOT_FOUND", `Review '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(review);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateReviewSchema.parse(body);
    const updated = storeUpdateReview(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Review '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteReview(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Review '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
