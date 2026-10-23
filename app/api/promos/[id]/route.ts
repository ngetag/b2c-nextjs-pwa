import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updatePromoSchema } from "@/schemas";
import {
  storeDeletePromo,
  storeGetPromoById,
  storeUpdatePromo,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const promo = storeGetPromoById(id);
    if (!promo) {
      return jsonError("NOT_FOUND", `Promo '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(promo);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updatePromoSchema.parse(body);
    const updated = storeUpdatePromo(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Promo '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext) {
  return PATCH(request, ctx);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeletePromo(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Promo '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
