import type { NextRequest } from "next/server";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
} from "@/lib/api-response";
import { createCommunityUpdatePostSchema } from "@/schemas";
import {
  storeAddCommunityUpdatePost,
  storeGetCommunityById,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const community = storeGetCommunityById(id);
    if (!community) {
      return jsonError("NOT_FOUND", `Komunitas '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(community.updates);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = createCommunityUpdatePostSchema.parse(body);
    const updated = storeAddCommunityUpdatePost(id, input);
    if (!updated) {
      return jsonError("NOT_FOUND", `Komunitas '${id}' tidak ditemukan`, 404);
    }
    return jsonCreated(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
