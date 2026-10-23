import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createHypeItemSchema } from "@/schemas";
import { storeCreateHypeItem, storeListHypeItems } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const eventId = sp.get("eventId") ?? undefined;
    return jsonOk(storeListHypeItems({ eventId }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createHypeItemSchema.parse(body);
    const created = storeCreateHypeItem(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
