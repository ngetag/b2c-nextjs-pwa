import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
} from "@/lib/api-response";
import { createReviewTagSchema } from "@/schemas";
import {
  storeCreateReviewTag,
  storeGetSpotById,
  storeListReviewTags,
  storeReplaceSpotReviewTags,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const replaceSpotReviewTagsSchema = z.object({
  tags: z.array(
    z.object({
      label: z.string().min(1),
      value: z.string().optional(),
      sortOrder: z.number().int().optional(),
      ownerEditable: z.boolean().optional(),
    }),
  ),
});

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(storeListReviewTags({ spotId: spot.id }));
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
    const input = createReviewTagSchema.parse({
      ...body,
      spotId: spot.id,
    });
    const created = storeCreateReviewTag(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    const body = await request.json();
    const { tags } = replaceSpotReviewTagsSchema.parse(body);
    const updated = storeReplaceSpotReviewTags(spot.id, tags);
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
