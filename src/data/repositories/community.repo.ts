import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type {
  CreateCommunityAgendaInput,
  CreateCommunityInput,
  CreateCommunityUpdatePostInput,
  UpdateCommunityInput,
} from "@/schemas";
import {
  storeAddCommunityAgenda,
  storeAddCommunityUpdatePost,
  storeCreateCommunity,
  storeDeleteCommunity,
  storeGetCommunityById,
  storeGetCommunityCategoryById,
  storeListCommunities,
  storeListCommunityCategories,
  storeUpdateCommunity,
} from "@/server/store";
import type {
  CommunityCategoryContract,
  CommunityContract,
} from "@/shared/contracts";
import type { Community, CommunityCategory } from "@/types/interest";

export async function listCommunityCategories(): Promise<CommunityCategory[]> {
  return apiFetch<CommunityCategory[]>("/api/communities/categories", {
    fallback: () => storeListCommunityCategories(),
  });
}

export async function getCommunityCategoryById(
  id: string,
): Promise<CommunityCategoryContract | null> {
  const categories = await listCommunityCategories();
  return (
    categories.find((c) => c.id === id || c.slug === id) ??
    storeGetCommunityCategoryById(id)
  );
}

export async function listCommunities(opts?: {
  categoryId?: string;
  interestIds?: string[];
  tags?: string[];
  q?: string;
  ownerId?: string;
  publishStatus?: "draft" | "published" | "archived" | "all";
}): Promise<CommunityContract[]> {
  const qs = buildSearchParams({
    categoryId: opts?.categoryId,
    interestIds: opts?.interestIds,
    tags: opts?.tags,
    q: opts?.q,
    ownerId: opts?.ownerId,
    publishStatus: opts?.publishStatus,
  });
  return apiFetch<CommunityContract[]>(`/api/communities${qs}`, {
    fallback: () => storeListCommunities(opts),
  });
}

export async function getCommunityById(
  id: string,
): Promise<CommunityContract | null> {
  return apiFetch<CommunityContract | null>(
    `/api/communities/${encodeURIComponent(id)}`,
    {
      fallback: () => storeGetCommunityById(id),
    },
  );
}

export async function listCommunitiesByCategoryId(
  categoryId: string,
): Promise<Community[]> {
  return listCommunities({ categoryId });
}

export async function listRecommendedCommunitiesByInterestIds(
  interestIds: string[],
): Promise<Community[]> {
  return listCommunities({ interestIds });
}

export async function createCommunity(
  input: CreateCommunityInput,
): Promise<CommunityContract> {
  return apiFetch<CommunityContract>("/api/communities", {
    method: "POST",
    body: input,
    fallback: () => storeCreateCommunity(input),
  });
}

export async function updateCommunity(
  id: string,
  patch: UpdateCommunityInput,
): Promise<CommunityContract | null> {
  return apiFetch<CommunityContract | null>(
    `/api/communities/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: patch,
      fallback: () => storeUpdateCommunity(id, patch),
    },
  );
}

export async function addCommunityUpdatePost(
  communityId: string,
  input: CreateCommunityUpdatePostInput,
): Promise<CommunityContract | null> {
  return apiFetch<CommunityContract | null>(
    `/api/communities/${encodeURIComponent(communityId)}/updates`,
    {
      method: "POST",
      body: input,
      fallback: () => storeAddCommunityUpdatePost(communityId, input),
    },
  );
}

export async function addCommunityAgenda(
  communityId: string,
  input: CreateCommunityAgendaInput,
): Promise<CommunityContract | null> {
  return apiFetch<CommunityContract | null>(
    `/api/communities/${encodeURIComponent(communityId)}/agendas`,
    {
      method: "POST",
      body: input,
      fallback: () => storeAddCommunityAgenda(communityId, input),
    },
  );
}

export async function deleteCommunity(id: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/communities/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeleteCommunity(id) }),
    },
  );
  return Boolean(res?.deleted);
}
