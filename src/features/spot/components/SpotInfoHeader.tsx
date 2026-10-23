import { MapPin } from "lucide-react";
import { ShareButton } from "@/components/common/ShareButton";
import { TagChip } from "@/components/common/TagChip";
import { routes } from "@/config/routes";
import { BookmarkButton } from "@/features/bookmark/components/BookmarkButton";
import { formatPriceLevel } from "@/lib/format";
import type { Spot } from "@/types/spot";
import type { Tag } from "@/types/tag";

interface SpotInfoHeaderProps {
  spot: Spot;
  tags: Tag[];
}

export function SpotInfoHeader({ spot, tags }: SpotInfoHeaderProps) {
  const spotTags = tags.filter((t) => spot.tagIds.includes(t.id));

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
            {spot.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-[var(--color-muted-foreground)]">
              {formatPriceLevel(spot.priceLevel)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <BookmarkButton targetType="spot" targetId={spot.id} />
          <ShareButton
            title={spot.name}
            text={spot.description.slice(0, 100)}
            url={routes.spot(spot.id)}
          />
        </div>
      </div>

      {spotTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {spotTags.map((tag) => (
            <TagChip key={tag.id} tag={tag} variant="outline" />
          ))}
        </div>
      ) : null}

      <div className="flex items-start gap-1.5 text-sm text-[var(--color-muted-foreground)]">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          {spot.location.address}
          {spot.location.district ? `, ${spot.location.district}` : ""}
        </span>
      </div>
    </div>
  );
}
