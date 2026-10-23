import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateTagSchema } from "@/schemas";
import {
  storeDeleteTag,
  storeGetTagBySlugOrId,
  storeUpdateTag,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const tag = storeGetTagBySlugOrId(slug);
    if (!tag) {
      return jsonError("NOT_FOUND", `Tag '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk(tag);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const patch = updateTagSchema.parse(body);
    const updated = storeUpdateTag(slug, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Tag '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const deleted = storeDeleteTag(slug);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Tag '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, slug });
  } catch (error) {
    return handleApiError(error);
  }
}
