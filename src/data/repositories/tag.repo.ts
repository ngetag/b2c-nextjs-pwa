import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type { CreateTagInput, UpdateTagInput } from "@/schemas";
import {
  storeCreateTag,
  storeDeleteTag,
  storeGetTagBySlugOrId,
  storeGetTagsByIds,
  storeListTags,
  storeUpdateTag,
} from "@/server/store";
import type { TagContract } from "@/shared/contracts";
import type { Tag } from "@/types/tag";

export async function listTags(opts?: {
  category?: string;
  includeInactive?: boolean;
}): Promise<Tag[]> {
  const qs = buildSearchParams({
    category: opts?.category,
    includeInactive: opts?.includeInactive ? "true" : undefined,
  });
  return apiFetch<Tag[]>(`/api/tags${qs}`, {
    fallback: () => storeListTags(opts),
  });
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  return apiFetch<Tag | null>(`/api/tags/${encodeURIComponent(slug)}`, {
    fallback: () => storeGetTagBySlugOrId(slug),
  });
}

export async function getTagById(id: string): Promise<Tag | null> {
  return apiFetch<Tag | null>(`/api/tags/${encodeURIComponent(id)}`, {
    fallback: () => storeGetTagBySlugOrId(id),
  });
}

export async function getTagsByIds(ids: string[]): Promise<Tag[]> {
  if (ids.length === 0) return [];
  const qs = buildSearchParams({ ids });
  return apiFetch<Tag[]>(`/api/tags${qs}`, {
    fallback: () => storeGetTagsByIds(ids),
  });
}

export async function listTrendingTags(limit = 8): Promise<Tag[]> {
  return apiFetch<Tag[]>(`/api/tags?trending=true&limit=${limit}`, {
    fallback: () => storeListTags({ trendingLimit: limit }),
  });
}

export async function createTag(input: CreateTagInput): Promise<TagContract> {
  return apiFetch<TagContract>("/api/tags", {
    method: "POST",
    body: input,
    fallback: () => storeCreateTag(input),
  });
}

export async function updateTag(
  slugOrId: string,
  patch: UpdateTagInput,
): Promise<TagContract | null> {
  return apiFetch<TagContract | null>(
    `/api/tags/${encodeURIComponent(slugOrId)}`,
    {
      method: "PATCH",
      body: patch,
      fallback: () => storeUpdateTag(slugOrId, patch),
    },
  );
}

export async function deleteTag(slugOrId: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/tags/${encodeURIComponent(slugOrId)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeleteTag(slugOrId) }),
    },
  );
  return Boolean(res?.deleted);
}
