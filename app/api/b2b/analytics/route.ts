import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { storeGetB2BAnalytics } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const ownerId =
      request.nextUrl.searchParams.get("ownerId") ?? undefined;
    return jsonOk(storeGetB2BAnalytics(ownerId));
  } catch (error) {
    return handleApiError(error);
  }
}
