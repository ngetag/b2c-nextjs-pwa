import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateUserSchema } from "@/schemas";
import { storeGetCustomerById, storeUpdateCustomer } from "@/server/store";

export async function GET() {
  try {
    const user = storeGetCustomerById("u-demo");
    if (!user) {
      return jsonError("NOT_FOUND", "User tidak ditemukan", 404);
    }
    return jsonOk(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const patch = updateUserSchema.parse(body);
    const updated = storeUpdateCustomer("u-demo", patch);
    if (!updated) {
      return jsonError("NOT_FOUND", "User tidak ditemukan", 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
