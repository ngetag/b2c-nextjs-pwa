import Link from "next/link";
import { routes } from "@/config/routes";
import type { Tag } from "@/types/tag";

interface TrendingTagsRowProps {
  tags: Tag[];
}

/**
 * Horizontal scrolling row of trending tags. Used on Home page.
 */
export function TrendingTagsRow({ tags }: TrendingTagsRowProps) {
  if (tags.length === 0) return null;

  return (
    <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={routes.tag(tag.slug)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary)]"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
