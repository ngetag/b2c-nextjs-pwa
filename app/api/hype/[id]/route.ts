import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateHypeItemSchema } from "@/schemas";
import {
  storeDeleteHypeItem,
  storeGetHypeItemById,
  storeUpdateHypeItem,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const item = storeGetHypeItemById(id);
    if (!item) {
      return jsonError("NOT_FOUND", `Hype '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateHypeItemSchema.parse(body);
    const updated = storeUpdateHypeItem(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Hype '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteHypeItem(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Hype '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
