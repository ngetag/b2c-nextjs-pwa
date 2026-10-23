"use client";

import { Bookmark } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultGrid } from "@/features/search/components/ResultGrid";
import { EventCard } from "@/features/event/components/EventCard";
import { SpotCard } from "@/features/spot/components/SpotCard";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useBookmarkStore } from "@/stores/bookmark.store";
import type { NgetagEvent } from "@/types/event";
import type { Spot } from "@/types/spot";
import type { Tag } from "@/types/tag";
import Link from "next/link";

interface BookmarksViewProps {
  spots: Spot[];
  events: NgetagEvent[];
  tags: Tag[];
}

export function BookmarksView({ spots, events, tags }: BookmarksViewProps) {
  const mounted = useIsMounted();
  const bookmarks = useBookmarkStore((s) => s.items);

  if (!mounted) {
    return (
      <div className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
        Lagi nyiapin bookmarkmu...
      </div>
    );
  }

  const savedSpotIds = new Set(
    Object.values(bookmarks)
      .filter((b) => b.targetType === "spot")
      .map((b) => b.targetId),
  );
  const savedEventIds = new Set(
    Object.values(bookmarks)
      .filter((b) => b.targetType === "event")
      .map((b) => b.targetId),
  );

  const savedSpots = spots.filter((s) => savedSpotIds.has(s.id));
  const savedEvents = events.filter((e) => savedEventIds.has(e.id));

  return (
    <Tabs defaultValue="spots">
      <TabsList>
        <TabsTrigger value="spots">
          Spot ({savedSpots.length})
        </TabsTrigger>
        <TabsTrigger value="events">
          Event ({savedEvents.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="spots">
        {savedSpots.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Belum ada spot tersimpan"
            description="Kalau nemu tempat menarik, tap bookmark biar gampang balik lagi."
            action={
              <Button asChild size="sm">
                <Link href="/explore?type=spot">Cari spot</Link>
              </Button>
            }
          />
        ) : (
          <ResultGrid>
            {savedSpots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} tags={tags} />
            ))}
          </ResultGrid>
        )}
      </TabsContent>

      <TabsContent value="events">
        {savedEvents.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Belum ada event tersimpan"
            description="Simpan event yang bikin penasaran, nanti muncul di sini."
            action={
              <Button asChild size="sm">
                <Link href="/explore?type=event">Cari event</Link>
              </Button>
            }
          />
        ) : (
          <ResultGrid>
            {savedEvents.map((event) => (
              <EventCard key={event.id} event={event} tags={tags} />
            ))}
          </ResultGrid>
        )}
      </TabsContent>
    </Tabs>
  );
}
