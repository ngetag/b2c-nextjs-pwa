import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createQrCodeSchema } from "@/schemas";
import { storeCreateQrCode, storeListQrCodes } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const targetType = sp.get("targetType") ?? undefined;
    const targetId = sp.get("targetId") ?? undefined;
    const ownerId = sp.get("ownerId") ?? undefined;
    return jsonOk(storeListQrCodes({ targetType, targetId, ownerId }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createQrCodeSchema.parse(body);
    return jsonCreated(storeCreateQrCode(input));
  } catch (error) {
    return handleApiError(error);
  }
}
