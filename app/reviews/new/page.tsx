import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listReviewTagsBySpotId } from "@/data/repositories/review.repo";
import { getSpotById } from "@/data/repositories/spot.repo";
import { ReviewQrAccessGate } from "@/features/review/components/ReviewQrAccessGate";

export const metadata: Metadata = {
  title: "Tulis Ulasan",
  description: "Bagikan pengalamanmu di spot ini.",
};

interface WriteReviewPageProps {
  searchParams: Promise<{ source?: string; spotId?: string }>;
}

export default async function WriteReviewPage({
  searchParams,
}: WriteReviewPageProps) {
  const { source, spotId } = await searchParams;

  if (source !== "qr" || !spotId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center md:px-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)]">
          Akses ulasan tidak tersedia
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Ulasan hanya bisa dibuat setelah scan QR Code di lokasi.
        </p>
      </div>
    );
  }

  const spot = await getSpotById(spotId);
  if (!spot) notFound();
  const reviewTags = await listReviewTagsBySpotId(spot.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-10">
      <header className="space-y-2 pb-6">
        <div className="h-1 w-10 rounded-full bg-[var(--accent-photo)]" />
        <p className="text-xs font-semibold text-[var(--color-primary)]">
          Tulis ulasan
        </p>
        <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
          {spot.name}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {spot.location.district ?? spot.location.city}
        </p>
      </header>

      <ReviewQrAccessGate
        spotId={spot.id}
        spotName={spot.name}
        spotTagIds={spot.tagIds}
        reviewTags={reviewTags}
      />
    </div>
  );
}
