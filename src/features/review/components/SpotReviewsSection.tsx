"use client";

import { useMemo } from "react";
import { ReviewList } from "@/features/review/components/ReviewList";
import { ReviewSummary } from "@/features/review/components/ReviewSummary";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useReviewStore } from "@/stores/review.store";
import type { Review } from "@/types/review";

interface SpotReviewsSectionProps {
  spotId: string;
  /** Fixture reviews from server. */
  initialReviews: Review[];
}

/**
 * Merge fixture reviews (from server) with user-created reviews (from store).
 * User reviews come first so the user sees their submission immediately.
 */
export function SpotReviewsSection({
  spotId,
  initialReviews,
}: SpotReviewsSectionProps) {
  const mounted = useIsMounted();
  const userReviews = useReviewStore((s) => s.items);

  const merged = useMemo(() => {
    if (!mounted) return initialReviews;
    const userForSpot = userReviews
      .filter((r) => r.spotId === spotId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return [...userForSpot, ...initialReviews];
  }, [mounted, userReviews, initialReviews, spotId]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-[var(--color-foreground)]">
          Ulasan
        </h2>
      </div>
      <ReviewSummary reviews={merged} />
      <ReviewList reviews={merged} />
    </section>
  );
}
