import { ReviewItem } from "@/features/review/components/ReviewItem";
import type { Review } from "@/types/review";

interface ReviewListProps {
  reviews: Review[];
  /** Limit number of reviews displayed; pass undefined to show all. */
  limit?: number;
}

export function ReviewList({ reviews, limit }: ReviewListProps) {
  const items = limit ? reviews.slice(0, limit) : reviews;
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
        Belum ada ulasan. Kamu bisa jadi yang pertama cerita di sini.
      </p>
    );
  }
  return (
    <div className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4">
      {items.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}
