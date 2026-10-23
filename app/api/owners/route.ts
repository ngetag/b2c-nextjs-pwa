import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createOwnerSchema } from "@/schemas";
import { storeCreateOwner, storeListOwners } from "@/server/store";

export async function GET() {
  try {
    return jsonOk(storeListOwners());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createOwnerSchema.parse(body);
    return jsonCreated(storeCreateOwner(input));
  } catch (error) {
    return handleApiError(error);
  }
}
