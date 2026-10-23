import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type { CreateBlogArticleInput, UpdateBlogArticleInput } from "@/schemas";
import {
  storeCreateBlog,
  storeDeleteBlog,
  storeGetBlogBySlug,
  storeListBlogs,
  storeUpdateBlog,
} from "@/server/store";
import type { BlogArticle } from "@/types/blog";

export async function listBlogs(opts?: {
  category?: string;
  featured?: boolean;
}): Promise<BlogArticle[]> {
  const qs = buildSearchParams({
    category: opts?.category,
    featured: opts?.featured !== undefined ? String(opts.featured) : undefined,
  });
  return apiFetch<BlogArticle[]>(`/api/blogs${qs}`, {
    fallback: () => storeListBlogs(opts),
  });
}

export async function getBlogBySlug(slug: string): Promise<BlogArticle | null> {
  return apiFetch<BlogArticle | null>(
    `/api/blogs/${encodeURIComponent(slug)}`,
    {
      fallback: () => storeGetBlogBySlug(slug),
    },
  );
}

export async function createBlog(
  input: CreateBlogArticleInput,
): Promise<BlogArticle> {
  return apiFetch<BlogArticle>("/api/blogs", {
    method: "POST",
    body: input,
    fallback: () => storeCreateBlog(input),
  });
}

export async function updateBlog(
  slug: string,
  patch: UpdateBlogArticleInput,
): Promise<BlogArticle | null> {
  return apiFetch<BlogArticle | null>(
    `/api/blogs/${encodeURIComponent(slug)}`,
    {
      method: "PATCH",
      body: patch,
      fallback: () => storeUpdateBlog(slug, patch),
    },
  );
}

export async function deleteBlog(slug: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/blogs/${encodeURIComponent(slug)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeleteBlog(slug) }),
    },
  );
  return Boolean(res?.deleted);
}
