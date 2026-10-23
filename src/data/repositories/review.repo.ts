import { apiFetch } from "@/lib/api-client";
import { buildSearchParams } from "@/lib/url";
import type {
  CreateReviewInput,
  CreateReviewTagInput,
  UpdateReviewInput,
} from "@/schemas";
import {
  storeCreateReview,
  storeCreateReviewTag,
  storeDeleteReview,
  storeGetReviewById,
  storeIncrementReviewHelpful,
  storeListReviews,
  storeListReviewTags,
  storeReplaceSpotReviewTags,
  storeUpdateReview,
} from "@/server/store";
import type { ReviewContract, ReviewTagContract } from "@/shared/contracts";
import type { Review, ReviewTag } from "@/types/review";

export async function listReviewsBySpotId(spotId: string): Promise<Review[]> {
  return apiFetch<Review[]>(
    `/api/spots/${encodeURIComponent(spotId)}/reviews`,
    {
      fallback: () => storeListReviews({ spotId }),
    },
  );
}

export async function listReviewsByAuthor(authorId: string): Promise<Review[]> {
  const qs = buildSearchParams({ authorId });
  return apiFetch<Review[]>(`/api/reviews${qs}`, {
    fallback: () => storeListReviews({ authorId }),
  });
}

export async function getReviewById(
  id: string,
): Promise<ReviewContract | null> {
  return apiFetch<ReviewContract | null>(
    `/api/reviews/${encodeURIComponent(id)}`,
    {
      fallback: () => storeGetReviewById(id),
    },
  );
}

export async function createReview(
  input: CreateReviewInput,
): Promise<ReviewContract> {
  return apiFetch<ReviewContract>("/api/reviews", {
    method: "POST",
    body: input,
    fallback: () => storeCreateReview(input),
  });
}

export async function updateReview(
  id: string,
  patch: UpdateReviewInput,
): Promise<ReviewContract | null> {
  return apiFetch<ReviewContract | null>(
    `/api/reviews/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: patch,
      fallback: () => storeUpdateReview(id, patch),
    },
  );
}

export async function incrementReviewHelpful(
  id: string,
): Promise<ReviewContract | null> {
  return apiFetch<ReviewContract | null>(
    `/api/reviews/${encodeURIComponent(id)}/helpful`,
    {
      method: "POST",
      fallback: () => storeIncrementReviewHelpful(id),
    },
  );
}

export async function deleteReview(id: string): Promise<boolean> {
  const res = await apiFetch<{ deleted: boolean } | null>(
    `/api/reviews/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallback: () => ({ deleted: storeDeleteReview(id) }),
    },
  );
  return Boolean(res?.deleted);
}

export async function listReviewTagsBySpotId(
  spotId: string,
): Promise<ReviewTag[]> {
  return apiFetch<ReviewTag[]>(
    `/api/spots/${encodeURIComponent(spotId)}/review-tags`,
    {
      fallback: () => storeListReviewTags({ spotId }),
    },
  );
}

export async function listReviewTagsByIds(ids: string[]): Promise<ReviewTag[]> {
  if (ids.length === 0) return [];
  const qs = buildSearchParams({ ids });
  return apiFetch<ReviewTag[]>(`/api/review-tags${qs}`, {
    fallback: () => storeListReviewTags({ ids }),
  });
}

export async function createReviewTag(
  input: CreateReviewTagInput,
): Promise<ReviewTagContract> {
  return apiFetch<ReviewTagContract>("/api/review-tags", {
    method: "POST",
    body: input,
    fallback: () => storeCreateReviewTag(input),
  });
}

export async function replaceSpotReviewTags(
  spotId: string,
  tags: Array<{
    label: string;
    value?: string;
    sortOrder?: number;
    ownerEditable?: boolean;
  }>,
): Promise<ReviewTagContract[]> {
  return apiFetch<ReviewTagContract[]>(
    `/api/spots/${encodeURIComponent(spotId)}/review-tags`,
    {
      method: "PUT",
      body: { tags },
      fallback: () => storeReplaceSpotReviewTags(spotId, tags),
    },
  );
}
