import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateOwnerSchema } from "@/schemas";
import { storeGetOwnerById, storeUpdateOwner } from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const owner = storeGetOwnerById(id);
    if (!owner) {
      return jsonError("NOT_FOUND", `Owner '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(owner);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateOwnerSchema.parse(body);
    const updated = storeUpdateOwner(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Owner '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
