"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/config/routes";
import { createReview } from "@/data/repositories/review.repo";
import { QR_REVIEW_ACCESS_KEY } from "@/lib/constants";
import { useCurrentUserStore } from "@/stores/currentUser.store";
import { useReviewStore } from "@/stores/review.store";
import { useVisitStore } from "@/stores/visit.store";
import type { Review, ReviewTag } from "@/types/review";

const schema = z.object({
  comment: z
    .string()
    .min(10, "Ulasan minimal 10 karakter")
    .max(1000, "Ulasan maksimal 1000 karakter"),
});

type FormValues = z.infer<typeof schema>;

interface WriteReviewFormProps {
  spotId: string;
  spotName: string;
  spotTagIds: string[];
  reviewTags: ReviewTag[];
}

export function WriteReviewForm({
  spotId,
  spotName,
  spotTagIds,
  reviewTags,
}: WriteReviewFormProps) {
  const router = useRouter();
  const user = useCurrentUserStore((s) => s.user);
  const addReview = useReviewStore((s) => s.add);
  const markSpotVisit = useVisitStore((s) => s.markSpotVisit);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReviewTagIds, setSelectedReviewTagIds] = useState<string[]>([]);
  const selectedReviewTags = reviewTags.filter((tag) =>
    selectedReviewTagIds.includes(tag.id),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { comment: "" },
  });

  function toggleReviewTag(tagId: string) {
    setSelectedReviewTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const trimmedComment = values.comment.trim();
    const reviewId = `r-user-${spotId}-${user.id}-${trimmedComment.length}`;
    const review: Review = {
      id: reviewId,
      spotId,
      authorId: user.id,
      authorSnapshot: { name: user.name, avatarUrl: user.avatarUrl },
      comment: trimmedComment,
      reviewTagIds: selectedReviewTagIds,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await createReview({
        id: review.id,
        spotId: review.spotId,
        authorId: review.authorId,
        authorSnapshot: review.authorSnapshot,
        comment: review.comment,
        reviewTagIds: selectedReviewTagIds,
        imageUrls: [],
        helpfulCount: 0,
      });
    } catch {
      // Fallback to local state if offline
    }

    addReview(review);
    markSpotVisit({
      userId: user.id,
      spotId,
      tagIds: spotTagIds,
      reviewed: true,
    });
    toast.success("Ulasanmu sudah masuk", {
      description: `${spotName} dapat cerita baru dari kamu.`,
    });
    window.sessionStorage.removeItem(QR_REVIEW_ACCESS_KEY);
    router.push(routes.spot(spotId));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="comment">Ulasanmu</Label>
        <Textarea
          id="comment"
          rows={6}
          placeholder={`Ceritain pengalamanmu di ${spotName}...`}
          {...register("comment")}
        />
        <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
          <span>
            {errors.comment ? (
              <span className="text-[var(--color-destructive)]">
                {errors.comment.message}
              </span>
            ) : (
              "Minimal 10 karakter."
            )}
          </span>
          <span>Maksimal 1000 karakter</span>
        </div>
      </div>

      {reviewTags.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3">
          <div className="space-y-1">
            <Label>Tag pengalaman</Label>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Pilih satu atau beberapa tag yang paling sesuai dengan kunjunganmu.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {reviewTags.map((tag) => {
              const active = selectedReviewTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleReviewTag(tag.id)}
                  className={
                    active
                      ? "inline-flex items-center gap-1 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-foreground)] transition-colors"
                      : "inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-foreground)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  }
                  aria-pressed={active}
                >
                  {active ? (
                    <Check className="h-3 w-3 shrink-0" aria-hidden />
                  ) : null}
                  {tag.label}
                </button>
              );
            })}
          </div>

          {selectedReviewTags.length > 0 ? (
            <div className="space-y-1.5 border-t border-[var(--color-border)] pt-3">
              <p className="text-xs font-medium text-[var(--color-muted-foreground)]">
                Tag dipilih
              </p>
              <div className="flex max-h-20 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {selectedReviewTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleReviewTag(tag.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]"
                    aria-label={`Hapus tag ${tag.label}`}
                  >
                    {tag.label}
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Lagi kirim..." : "Kirim ulasan"}
        </Button>
      </div>
    </form>
  );
}
