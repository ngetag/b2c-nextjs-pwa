import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateEventSchema } from "@/schemas";
import {
  storeDeleteEvent,
  storeGetEventById,
  storeUpdateEvent,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const event = storeGetEventById(id);
    if (!event) {
      return jsonError("NOT_FOUND", `Event '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(event);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateEventSchema.parse(body);
    const updated = storeUpdateEvent(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Event '${id}' tidak ditemukan`, 404);
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
    const deleted = storeDeleteEvent(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Event '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
