import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateBlogArticleSchema } from "@/schemas";
import {
  storeDeleteBlog,
  storeGetBlogBySlug,
  storeUpdateBlog,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const blog = storeGetBlogBySlug(slug);
    if (!blog) {
      return jsonError("NOT_FOUND", `Artikel '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk(blog);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const patch = updateBlogArticleSchema.parse(body);
    const updated = storeUpdateBlog(slug, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Artikel '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const deleted = storeDeleteBlog(slug);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Artikel '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, slug });
  } catch (error) {
    return handleApiError(error);
  }
}
