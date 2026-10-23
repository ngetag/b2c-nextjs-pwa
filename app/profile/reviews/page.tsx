import type { Metadata } from "next";
import { searchSpots } from "@/data/repositories/spot.repo";
import { MyReviewsView } from "@/features/review/components/MyReviewsView";

export const metadata: Metadata = {
  title: "Ulasan Saya",
  description: "Ulasan yang telah kamu tulis di NgeTag.",
};

export default async function MyReviewsPage() {
  // Fetch all spots so we can resolve spotId → spot name in the client view.
  const spotsRes = await searchSpots({ pageSize: 100 });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <header className="space-y-2 pb-6">
        <div className="h-1 w-10 rounded-full bg-[var(--accent-photo)]" />
        <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
          Ulasan Saya
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Semua ceritamu soal tempat yang pernah dicoba.
        </p>
      </header>

      <MyReviewsView spots={spotsRes.items} />
    </div>
  );
}
