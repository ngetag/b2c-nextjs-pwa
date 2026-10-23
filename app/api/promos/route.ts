import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import { createPromoSchema } from "@/schemas";
import { storeCreatePromo, storeListPromos } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const ids = readArrayParam(
      sp.getAll("ids").length > 0 ? sp.getAll("ids") : (sp.get("ids") ?? undefined),
    );
    const spotId = sp.get("spotId") ?? undefined;
    const eventId = sp.get("eventId") ?? undefined;
    const ownerId = sp.get("ownerId") ?? undefined;
    const status = sp.get("status") ?? undefined;
    const limit = readNumberParam(sp.get("limit") ?? undefined);

    return jsonOk(
      storeListPromos({
        ids: ids.length > 0 ? ids : undefined,
        spotId,
        eventId,
        ownerId,
        status,
        limit,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createPromoSchema.parse(body);
    const created = storeCreatePromo(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
