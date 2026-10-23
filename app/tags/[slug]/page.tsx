import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { searchEvents } from "@/data/repositories/event.repo";
import { searchSpots } from "@/data/repositories/spot.repo";
import { getTagBySlug, listTags } from "@/data/repositories/tag.repo";
import { TagLandingView } from "@/features/tag/components/TagLandingView";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Tag tidak ditemukan" };
  return {
    title: `#${tag.name}`,
    description: `Spot dan event ber-tag #${tag.name} di Jakarta.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const [spotsRes, eventsRes, tags] = await Promise.all([
    searchSpots({ pageSize: 100 }),
    searchEvents({ pageSize: 100 }),
    listTags(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <Suspense fallback={null}>
        <TagLandingView
          activeTag={tag}
          spots={spotsRes.items}
          events={eventsRes.items}
          tags={tags}
        />
      </Suspense>
    </div>
  );
}
