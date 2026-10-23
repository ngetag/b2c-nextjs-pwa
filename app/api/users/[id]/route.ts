import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateUserSchema } from "@/schemas";
import { storeGetCustomerById, storeUpdateCustomer } from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const user = storeGetCustomerById(id);
    if (!user) {
      return jsonError("NOT_FOUND", `User '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateUserSchema.parse(body);
    const updated = storeUpdateCustomer(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `User '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
