import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type {
  CreateGalleryAssetInput,
  CreateOwnerInput,
  CreateQrCodeInput,
  UpdateOwnerInput,
  UpdateQrCodeInput,
} from "@/schemas";
import {
  getStore,
  resetServerStore,
  storeCreateGalleryAsset,
  storeCreateOwner,
  storeCreateQrCode,
  storeDeleteGalleryAsset,
  storeDeleteQrCode,
  storeGetB2BAnalytics,
  storeGetOwnerById,
  storeGetQrCodeById,
  storeListGalleryAssets,
  storeListOwners,
  storeListQrCodes,
  storeUpdateOwner,
  storeUpdateQrCode,
} from "@/server/store";
import type {
  GalleryAssetContract,
  OwnerContract,
  QrCodeContract,
} from "@/shared/contracts";

export async function listOwners(): Promise<OwnerContract[]> {
  return apiFetch<OwnerContract[]>("/api/owners", {
    fallback: () => storeListOwners(),
  });
}

export async function getOwnerById(id: string): Promise<OwnerContract | null> {
  return apiFetch<OwnerContract | null>(
    `/api/owners/${encodeURIComponent(id)}`,
    {
      fallback: () => storeGetOwnerById(id),
    },
  );
}

export async function createOwner(
  input: CreateOwnerInput,
): Promise<OwnerContract> {
  return apiFetch<OwnerContract>("/api/owners", {
    method: "POST",
    body: input,
    fallback: () => storeCreateOwner(input),
  });
}

export async function updateOwner(
  id: string,
  patch: UpdateOwnerInput,
): Promise<OwnerContract | null> {
  return apiFetch<OwnerContract | null>(
    `/api/owners/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: patch,
      fallback: () => storeUpdateOwner(id, patch),
    },
  );
}

export async function listGalleryAssets(opts?: {
  ownerType?: "spot" | "event" | "promo";
  ownerId?: string;
}): Promise<GalleryAssetContract[]> {
  const qs = buildSearchParams({
    ownerType: opts?.ownerType,
    ownerId: opts?.ownerId,
  });
  return apiFetch<GalleryAssetContract[]>(`/api/gallery${qs}`, {
    fallback: () => storeListGalleryAssets(opts),
  });
}

export async function createGalleryAsset(
  input: CreateGalleryAssetInput,
): Promise<GalleryAssetContract> {
  return apiFetch<GalleryAssetContract>("/api/gallery", {
    method: "POST",
    body: input,
    fallback: () => storeCreateGalleryAsset(input),
  });
}

export async function deleteGalleryAsset(id: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/gallery/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeleteGalleryAsset(id) }),
    },
  );
  return Boolean(res?.deleted);
}

export async function listQrCodes(opts?: {
  targetType?: string;
  targetId?: string;
  ownerId?: string;
}): Promise<QrCodeContract[]> {
  const qs = buildSearchParams({
    targetType: opts?.targetType,
    targetId: opts?.targetId,
    ownerId: opts?.ownerId,
  });
  return apiFetch<QrCodeContract[]>(`/api/qr-codes${qs}`, {
    fallback: () => storeListQrCodes(opts),
  });
}

export async function getQrCodeById(
  id: string,
): Promise<QrCodeContract | null> {
  return apiFetch<QrCodeContract | null>(
    `/api/qr-codes/${encodeURIComponent(id)}`,
    {
      fallback: () => storeGetQrCodeById(id),
    },
  );
}

export async function createQrCode(
  input: CreateQrCodeInput,
): Promise<QrCodeContract> {
  return apiFetch<QrCodeContract>("/api/qr-codes", {
    method: "POST",
    body: input,
    fallback: () => storeCreateQrCode(input),
  });
}

export async function updateQrCode(
  id: string,
  patch: UpdateQrCodeInput,
): Promise<QrCodeContract | null> {
  return apiFetch<QrCodeContract | null>(
    `/api/qr-codes/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: patch,
      fallback: () => storeUpdateQrCode(id, patch),
    },
  );
}

export async function deleteQrCode(id: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/qr-codes/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeleteQrCode(id) }),
    },
  );
  return Boolean(res?.deleted);
}

export async function getB2BAnalytics(ownerId?: string) {
  const qs = buildSearchParams({ ownerId });
  return apiFetch<ReturnType<typeof storeGetB2BAnalytics>>(
    `/api/b2b/analytics${qs}`,
    {
      fallback: () => storeGetB2BAnalytics(ownerId),
    },
  );
}

export async function getB2BHandoffData() {
  return apiFetch("/api/b2b/handoff", {
    fallback: () => {
      const store = getStore();
      return {
        owners: store.owners,
        customers: store.customers,
        tags: store.tags,
        interests: store.interests,
        openingHours: Object.fromEntries(
          store.spots.map((spot) => [spot.id, spot.openingHours]),
        ),
        gallery: store.gallery,
        spots: store.spots,
        events: store.events,
        communityCategories: store.communityCategories,
        communities: store.communities,
        promos: store.promos,
        qrCodes: store.qrCodes,
        reviewTags: store.reviewTags,
        reviews: store.reviews,
        bookmarks: store.bookmarks,
        eventAttendances: store.eventAttendances,
        spotVisits: store.spotVisits,
        communityMemberships: store.communityMemberships,
      };
    },
  });
}

export async function resetB2BHandoffData() {
  return apiFetch("/api/b2b/handoff", {
    method: "POST",
    fallback: () => {
      const store = resetServerStore();
      return {
        reset: true,
        spots: store.spots.length,
        events: store.events.length,
        promos: store.promos.length,
      };
    },
  });
}
