import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import {
  createNotificationSchema,
  patchNotificationsSchema,
} from "@/schemas";
import {
  storeCreateNotification,
  storeListNotifications,
  storePatchNotifications,
} from "@/server/store";

export async function GET() {
  try {
    return jsonOk(storeListNotifications());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createNotificationSchema.parse(body);
    return jsonCreated(storeCreateNotification(input));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const input = patchNotificationsSchema.parse(body);
    return jsonOk(storePatchNotifications(input));
  } catch (error) {
    return handleApiError(error);
  }
}
