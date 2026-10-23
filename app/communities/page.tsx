import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunitiesContent } from "@/features/community/components/CommunitiesContent";

export const metadata: Metadata = {
  title: "Komunitas",
  description: "Temukan dan gabung komunitas berdasarkan minat kamu.",
};

export default function CommunitiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <header className="space-y-2 pb-6">
        <div className="h-1 w-10 rounded-full bg-[var(--accent-community)]" />
        <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
          Komunitas
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Cari circle yang cocok sama minatmu.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              />
            ))}
          </div>
        }
      >
        <CommunitiesContent />
      </Suspense>
    </div>
  );
}
