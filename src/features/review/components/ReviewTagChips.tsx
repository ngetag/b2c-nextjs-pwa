import { getReviewTagsByIds } from "@/data/fixtures/review-tags";

interface ReviewTagChipsProps {
  tagIds?: string[];
}

export function ReviewTagChips({ tagIds }: ReviewTagChipsProps) {
  if (!tagIds || tagIds.length === 0) return null;

  const tags = getReviewTagsByIds(tagIds);
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex rounded-full border border-[var(--color-primary)]/35 bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]"
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}
