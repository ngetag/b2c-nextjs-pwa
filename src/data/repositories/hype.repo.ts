import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type { CreateHypeItemInput, UpdateHypeItemInput } from "@/schemas";
import {
  storeCreateHypeItem,
  storeDeleteHypeItem,
  storeGetHypeItemById,
  storeListHypeItems,
  storeUpdateHypeItem,
} from "@/server/store";
import type { HypeItem } from "@/types/hype";

export async function listHypeItems(opts?: {
  eventId?: string;
}): Promise<HypeItem[]> {
  const qs = buildSearchParams({ eventId: opts?.eventId });
  return apiFetch<HypeItem[]>(`/api/hype${qs}`, {
    fallback: () => storeListHypeItems(opts),
  });
}

export async function getHypeItemById(id: string): Promise<HypeItem | null> {
  return apiFetch<HypeItem | null>(`/api/hype/${encodeURIComponent(id)}`, {
    fallback: () => storeGetHypeItemById(id),
  });
}

export async function createHypeItem(
  input: CreateHypeItemInput,
): Promise<HypeItem> {
  return apiFetch<HypeItem>("/api/hype", {
    method: "POST",
    body: input,
    fallback: () => storeCreateHypeItem(input),
  });
}

export async function updateHypeItem(
  id: string,
  patch: UpdateHypeItemInput,
): Promise<HypeItem | null> {
  return apiFetch<HypeItem | null>(`/api/hype/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
    fallback: () => storeUpdateHypeItem(id, patch),
  });
}

export async function deleteHypeItem(id: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/hype/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeleteHypeItem(id) }),
    },
  );
  return Boolean(res?.deleted);
}
