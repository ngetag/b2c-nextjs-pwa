import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type { CreateInterestInput, UpdateInterestInput } from "@/schemas";
import {
  storeCreateInterest,
  storeDeleteInterest,
  storeGetInterestById,
  storeListInterests,
  storeUpdateInterest,
} from "@/server/store";
import type { InterestContract } from "@/shared/contracts";
import type { Interest } from "@/types/interest";

export async function listInterests(opts?: {
  ids?: string[];
  includeInactive?: boolean;
}): Promise<Interest[]> {
  const qs = buildSearchParams({
    ids: opts?.ids,
    includeInactive: opts?.includeInactive ? "true" : undefined,
  });
  return apiFetch<Interest[]>(`/api/interests${qs}`, {
    fallback: () => storeListInterests(opts),
  });
}

export async function getInterestsByIdsRepo(ids: string[]): Promise<Interest[]> {
  if (ids.length === 0) return [];
  return listInterests({ ids });
}

export async function getInterestById(
  idOrSlug: string,
): Promise<InterestContract | null> {
  return apiFetch<InterestContract | null>(
    `/api/interests/${encodeURIComponent(idOrSlug)}`,
    {
      fallback: () => storeGetInterestById(idOrSlug),
    },
  );
}

export async function createInterest(
  input: CreateInterestInput,
): Promise<InterestContract> {
  return apiFetch<InterestContract>("/api/interests", {
    method: "POST",
    body: input,
    fallback: () => storeCreateInterest(input),
  });
}

export async function updateInterest(
  idOrSlug: string,
  patch: UpdateInterestInput,
): Promise<InterestContract | null> {
  return apiFetch<InterestContract | null>(
    `/api/interests/${encodeURIComponent(idOrSlug)}`,
    {
      method: "PATCH",
      body: patch,
      fallback: () => storeUpdateInterest(idOrSlug, patch),
    },
  );
}

export async function deleteInterest(idOrSlug: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/interests/${encodeURIComponent(idOrSlug)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeleteInterest(idOrSlug) }),
    },
  );
  return Boolean(res?.deleted);
}
