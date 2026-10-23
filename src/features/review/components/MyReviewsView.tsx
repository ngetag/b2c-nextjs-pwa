"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { ReviewTagChips } from "@/features/review/components/ReviewTagChips";
import { useIsMounted } from "@/hooks/useIsMounted";
import { formatRelative } from "@/lib/format";
import { useCurrentUserStore } from "@/stores/currentUser.store";
import { useReviewStore } from "@/stores/review.store";
import type { Spot } from "@/types/spot";

interface MyReviewsViewProps {
  spots: Spot[];
}

export function MyReviewsView({ spots }: MyReviewsViewProps) {
  const mounted = useIsMounted();
  const user = useCurrentUserStore((s) => s.user);
  const reviews = useReviewStore((s) => s.items);
  const removeReview = useReviewStore((s) => s.remove);

  const spotById = useMemo(() => {
    const map = new Map<string, Spot>();
    for (const s of spots) map.set(s.id, s);
    return map;
  }, [spots]);

  if (!mounted) {
    return (
      <div className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
        Lagi ngambil ulasanmu...
      </div>
    );
  }

  const myReviews = reviews
    .filter((r) => r.authorId === user.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  if (myReviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Belum ada ulasan"
        description="Ceritain pengalamanmu setelah mampir ke spot favorit."
        action={
          <Button asChild size="sm">
            <Link href={routes.explore({ type: "spot" })}>Cari spot</Link>
          </Button>
        }
      />
    );
  }

  function handleDelete(id: string, spotName: string) {
    removeReview(id);
    toast.success("Ulasan sudah dihapus", {
      description: `${spotName} sudah bersih dari daftar ulasanmu.`,
    });
  }

  return (
    <ul className="space-y-3">
      {myReviews.map((review) => {
        const spot = spotById.get(review.spotId);
        return (
          <li key={review.id}>
            <Card>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    {spot ? (
                      <Link
                        href={routes.spot(spot.id)}
                        className="font-display text-sm font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
                      >
                        {spot.name}
                      </Link>
                    ) : (
                      <span className="font-display text-sm font-semibold text-[var(--color-muted-foreground)]">
                        Spot tidak ditemukan
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                      <time dateTime={review.createdAt}>
                        {formatRelative(review.createdAt)}
                      </time>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDelete(review.id, spot?.name ?? "spot")
                    }
                    aria-label="Hapus ulasan"
                    className="h-8 w-8 text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
                <p className="text-sm text-[var(--color-foreground)]">
                  {review.comment}
                </p>
                <ReviewTagChips tagIds={review.reviewTagIds} />
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
