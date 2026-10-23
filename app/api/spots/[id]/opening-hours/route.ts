import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { openingHoursSchema } from "@/schemas";
import {
  storeGetSpotById,
  storeUpdateSpotOpeningHours,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const putOpeningHoursSchema = z.union([
  openingHoursSchema,
  z.object({ openingHours: openingHoursSchema }),
]);

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(spot.openingHours);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = putOpeningHoursSchema.parse(body);
    const hours = Array.isArray(parsed) ? parsed : parsed.openingHours;
    const updated = storeUpdateSpotOpeningHours(id, hours);
    if (!updated) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated.openingHours);
  } catch (error) {
    return handleApiError(error);
  }
}
