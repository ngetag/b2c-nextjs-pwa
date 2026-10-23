import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { markSpotVisitSchema } from "@/schemas";
import { storeListSpotVisits, storeMarkSpotVisit } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const userId = sp.get("userId") ?? undefined;
    const spotId = sp.get("spotId") ?? undefined;
    return jsonOk(storeListSpotVisits({ userId, spotId }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = markSpotVisitSchema.parse(body);
    return jsonCreated(storeMarkSpotVisit(input));
  } catch (error) {
    return handleApiError(error);
  }
}
