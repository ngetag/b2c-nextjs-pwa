import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReviewTagChips } from "@/features/review/components/ReviewTagChips";
import { formatRelative } from "@/lib/format";
import type { Review } from "@/types/review";

interface ReviewItemProps {
  review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
  const { authorSnapshot, comment, createdAt } = review;
  const initials = authorSnapshot.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <article className="space-y-2 border-b border-[var(--color-border)] py-4 last:border-0">
      <header className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          {authorSnapshot.avatarUrl ? (
            <AvatarImage src={authorSnapshot.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            {authorSnapshot.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
            <time dateTime={createdAt}>{formatRelative(createdAt)}</time>
          </div>
        </div>
      </header>
      <p className="pl-12 text-sm text-[var(--color-foreground)]">{comment}</p>
      {review.reviewTagIds && review.reviewTagIds.length > 0 ? (
        <div className="pl-12">
          <ReviewTagChips tagIds={review.reviewTagIds} />
        </div>
      ) : null}
    </article>
  );
}
