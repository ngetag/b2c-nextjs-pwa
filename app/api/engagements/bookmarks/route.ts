import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { toggleBookmarkSchema } from "@/schemas";
import { storeListBookmarks, storeToggleBookmark } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const userId = sp.get("userId") ?? undefined;
    const targetTypeParam = sp.get("targetType");
    const targetType =
      targetTypeParam === "spot" || targetTypeParam === "event"
        ? targetTypeParam
        : undefined;
    return jsonOk(storeListBookmarks({ userId, targetType }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = toggleBookmarkSchema.parse(body);
    return jsonOk(storeToggleBookmark(input));
  } catch (error) {
    return handleApiError(error);
  }
}
