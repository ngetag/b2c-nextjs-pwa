import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam } from "@/lib/url";
import { createCommunitySchema } from "@/schemas";
import { storeCreateCommunity, storeListCommunities } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const categoryId = sp.get("categoryId") ?? sp.get("category") ?? undefined;
    const interestIds = readArrayParam(
      sp.getAll("interestIds").length > 0
        ? sp.getAll("interestIds")
        : (sp.get("interestIds") ?? undefined),
    );
    const tags = readArrayParam(
      sp.getAll("tags").length > 0 ? sp.getAll("tags") : (sp.get("tags") ?? undefined),
    );
    const q = sp.get("q") ?? undefined;
    const ownerId = sp.get("ownerId") ?? undefined;
    const publishStatusParam = sp.get("publishStatus");
    const publishStatus =
      publishStatusParam === "draft" ||
      publishStatusParam === "published" ||
      publishStatusParam === "archived" ||
      publishStatusParam === "all"
        ? publishStatusParam
        : undefined;

    return jsonOk(
      storeListCommunities({
        categoryId,
        interestIds: interestIds.length > 0 ? interestIds : undefined,
        tags: tags.length > 0 ? tags : undefined,
        q,
        ownerId,
        publishStatus,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createCommunitySchema.parse(body);
    const created = storeCreateCommunity(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
