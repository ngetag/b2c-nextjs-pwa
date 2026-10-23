import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { toggleAttendanceSchema } from "@/schemas";
import { storeListAttendances, storeToggleAttendance } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const userId = sp.get("userId") ?? undefined;
    const eventId = sp.get("eventId") ?? undefined;
    return jsonOk(storeListAttendances({ userId, eventId }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = toggleAttendanceSchema.parse(body);
    return jsonOk(storeToggleAttendance(input));
  } catch (error) {
    return handleApiError(error);
  }
}
