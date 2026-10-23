import { Card, CardContent } from "@/components/ui/card";
import { formatCount } from "@/lib/format";
import type { Review } from "@/types/review";

interface ReviewSummaryProps {
  reviews: Review[];
}

export function ReviewSummary({ reviews }: ReviewSummaryProps) {
  if (reviews.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            Cerita pengunjung
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {formatCount(reviews.length, "review")} dari pengunjung lainnya
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
