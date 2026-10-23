import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { toggleMembershipSchema } from "@/schemas";
import {
  storeListCommunityMemberships,
  storeToggleCommunityMembership,
} from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const userId = sp.get("userId") ?? undefined;
    const communityId = sp.get("communityId") ?? undefined;
    return jsonOk(storeListCommunityMemberships({ userId, communityId }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = toggleMembershipSchema.parse(body);
    return jsonOk(storeToggleCommunityMembership(input));
  } catch (error) {
    return handleApiError(error);
  }
}
