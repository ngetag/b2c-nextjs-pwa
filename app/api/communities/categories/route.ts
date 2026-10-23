import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createCommunityCategorySchema } from "@/schemas";
import {
  getStore,
  slugifyText,
  storeListCommunityCategories,
} from "@/server/store";

export async function GET() {
  try {
    return jsonOk(storeListCommunityCategories());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createCommunityCategorySchema.parse(body);
    const slug = input.slug ?? slugifyText(input.title);
    const category = {
      id: input.id ?? slug,
      title: input.title,
      name: input.name ?? input.title,
      slug,
      image: input.image,
      totalCommunities: 0,
    };
    getStore().communityCategories.push(category);
    return jsonCreated(category);
  } catch (error) {
    return handleApiError(error);
  }
}
