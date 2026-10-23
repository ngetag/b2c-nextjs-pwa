import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateInterestSchema } from "@/schemas";
import {
  storeDeleteInterest,
  storeGetInterestById,
  storeUpdateInterest,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const interest = storeGetInterestById(id);
    if (!interest) {
      return jsonError("NOT_FOUND", `Interest '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(interest);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateInterestSchema.parse(body);
    const updated = storeUpdateInterest(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Interest '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteInterest(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Interest '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
