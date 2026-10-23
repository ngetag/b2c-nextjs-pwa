import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateQrCodeSchema } from "@/schemas";
import {
  storeDeleteQrCode,
  storeGetQrCodeById,
  storeUpdateQrCode,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const qr = storeGetQrCodeById(id);
    if (!qr) {
      return jsonError("NOT_FOUND", `QR Code '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(qr);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateQrCodeSchema.parse(body);
    const updated = storeUpdateQrCode(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `QR Code '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteQrCode(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `QR Code '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
