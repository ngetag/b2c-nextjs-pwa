import type { Metadata } from "next";
import { Suspense } from "react";
import { listFeaturedEvents } from "@/data/repositories/event.repo";
import { listFeaturedSpots } from "@/data/repositories/spot.repo";
import { listTags, listTrendingTags } from "@/data/repositories/tag.repo";
import { ExploreView } from "@/features/explore/components/ExploreView";
import { ResultGridSkeleton } from "@/features/search/components/ResultGrid";

export const metadata: Metadata = {
  title: "Eksplore",
  description: "Jelajahi rekomendasi spot, event, tag, dan kategori di NgeTag.",
};

export default async function ExplorePage() {
  const [tags, trendingTags, featuredSpots, featuredEvents] = await Promise.all([
    listTags(),
    listTrendingTags(10),
    listFeaturedSpots(8),
    listFeaturedEvents(8),
  ]);

  return (
    <Suspense fallback={<ResultGridSkeleton />}>
      <ExploreView
        tags={tags}
        trendingTags={trendingTags}
        featuredSpots={featuredSpots}
        featuredEvents={featuredEvents}
      />
    </Suspense>
  );
}
