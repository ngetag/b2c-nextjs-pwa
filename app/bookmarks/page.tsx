import type { Metadata } from "next";
import { searchEvents } from "@/data/repositories/event.repo";
import { searchSpots } from "@/data/repositories/spot.repo";
import { listTags } from "@/data/repositories/tag.repo";
import { BookmarksView } from "@/features/bookmark/components/BookmarksView";

export const metadata: Metadata = {
  title: "Bookmark",
  description: "Spot dan event yang kamu simpan.",
};

export default async function BookmarksPage() {
  // Fetch all spots and events to filter against bookmark store on client.
  const [spotsRes, eventsRes, tags] = await Promise.all([
    searchSpots({ pageSize: 100 }),
    searchEvents({ pageSize: 100 }),
    listTags(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <header className="space-y-2 pb-6">
        <div className="h-1 w-10 rounded-full bg-[var(--color-primary)]" />
        <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
          Bookmark
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Tempat dan event yang kamu simpan buat nanti.
        </p>
      </header>

      <BookmarksView
        spots={spotsRes.items}
        events={eventsRes.items}
        tags={tags}
      />
    </div>
  );
}
