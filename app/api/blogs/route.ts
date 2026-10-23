import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createBlogArticleSchema } from "@/schemas";
import { storeCreateBlog, storeListBlogs } from "@/server/store";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const category = sp.get("category") ?? undefined;
    const featuredParam = sp.get("featured");
    const featured =
      featuredParam === "true"
        ? true
        : featuredParam === "false"
          ? false
          : undefined;
    return jsonOk(storeListBlogs({ category, featured }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createBlogArticleSchema.parse(body);
    const created = storeCreateBlog(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
