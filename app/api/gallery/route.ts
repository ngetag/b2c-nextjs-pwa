import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createGalleryAssetSchema } from "@/schemas";
import {
  storeCreateGalleryAsset,
  storeListGalleryAssets,
} from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const ownerTypeParam = sp.get("ownerType");
    const ownerType =
      ownerTypeParam === "spot" ||
      ownerTypeParam === "event" ||
      ownerTypeParam === "promo"
        ? ownerTypeParam
        : undefined;
    const ownerId = sp.get("ownerId") ?? undefined;
    return jsonOk(storeListGalleryAssets({ ownerType, ownerId }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createGalleryAssetSchema.parse(body);
    return jsonCreated(storeCreateGalleryAsset(input));
  } catch (error) {
    return handleApiError(error);
  }
}
