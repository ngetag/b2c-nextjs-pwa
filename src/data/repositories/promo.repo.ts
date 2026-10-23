import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type { CreatePromoInput, UpdatePromoInput } from "@/schemas";
import {
  storeCreatePromo,
  storeDeletePromo,
  storeGetPromoById,
  storeListPromos,
  storeUpdatePromo,
} from "@/server/store";
import type { PromoContract } from "@/shared/contracts";
import type { Promo } from "@/types/promo";

export async function listPromos(opts?: {
  spotId?: string;
  eventId?: string;
  ownerId?: string;
  status?: string;
}): Promise<PromoContract[]> {
  const qs = buildSearchParams({
    spotId: opts?.spotId,
    eventId: opts?.eventId,
    ownerId: opts?.ownerId,
    status: opts?.status,
  });
  return apiFetch<PromoContract[]>(`/api/promos${qs}`, {
    fallback: () => storeListPromos(opts),
  });
}

export async function listFeaturedPromos(limit = 4): Promise<Promo[]> {
  return apiFetch<Promo[]>(`/api/promos?limit=${limit}`, {
    fallback: () => storeListPromos({ limit }),
  });
}

export async function getPromoById(id: string): Promise<PromoContract | null> {
  return apiFetch<PromoContract | null>(
    `/api/promos/${encodeURIComponent(id)}`,
    {
      fallback: () => storeGetPromoById(id),
    },
  );
}

export async function listPromosByIds(ids: string[]): Promise<Promo[]> {
  if (ids.length === 0) return [];
  const qs = buildSearchParams({ ids });
  return apiFetch<Promo[]>(`/api/promos${qs}`, {
    fallback: () => storeListPromos({ ids }),
  });
}

export async function createPromo(
  input: CreatePromoInput,
): Promise<PromoContract> {
  return apiFetch<PromoContract>("/api/promos", {
    method: "POST",
    body: input,
    fallback: () => storeCreatePromo(input),
  });
}

export async function updatePromo(
  id: string,
  patch: UpdatePromoInput,
): Promise<PromoContract | null> {
  return apiFetch<PromoContract | null>(
    `/api/promos/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: patch,
      fallback: () => storeUpdatePromo(id, patch),
    },
  );
}

export async function deletePromo(id: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/promos/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeletePromo(id) }),
    },
  );
  return Boolean(res?.deleted);
}
