import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminActivityMeta } from "@/components/common/AdminActivityMeta";
import { listPromosByIds } from "@/data/repositories/promo.repo";
import { listReviewsBySpotId } from "@/data/repositories/review.repo";
import { getSpotById } from "@/data/repositories/spot.repo";
import { listTags } from "@/data/repositories/tag.repo";
import { PromoList } from "@/features/promo/components/PromoList";
import { SpotReviewsSection } from "@/features/review/components/SpotReviewsSection";
import { LocationCard } from "@/features/spot/components/LocationCard";
import { OpeningHoursTable } from "@/features/spot/components/OpeningHoursTable";
import { SpotHeroGallery } from "@/features/spot/components/SpotHeroGallery";
import { SpotInfoHeader } from "@/features/spot/components/SpotInfoHeader";

interface SpotDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SpotDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const spot = await getSpotById(id);
  if (!spot) return { title: "Spot tidak ditemukan" };
  return {
    title: spot.name,
    description: spot.description,
    openGraph: {
      title: spot.name,
      description: spot.description,
      images: [{ url: spot.coverImageUrl }],
    },
  };
}

export default async function SpotDetailPage({
  params,
}: SpotDetailPageProps) {
  const { id } = await params;
  const spot = await getSpotById(id);
  if (!spot) notFound();

  const [tags, reviews, promos] = await Promise.all([
    listTags(),
    listReviewsBySpotId(spot.id),
    listPromosByIds(spot.promoIds),
  ]);

  const galleryImages = [spot.coverImageUrl, ...spot.galleryUrls];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-6 md:py-10">
      <SpotHeroGallery images={galleryImages} alt={spot.name} />

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <SpotInfoHeader spot={spot} tags={tags} />
          <AdminActivityMeta
            lastUpdatedAt={spot.lastUpdatedAt}
            lastUpdatedBy={spot.lastUpdatedBy}
          />

          <section className="space-y-2">
            <h2 className="font-display text-base font-semibold text-[var(--color-foreground)]">
              Tentang
            </h2>
            <p className="text-sm leading-relaxed text-[var(--color-foreground)]">
              {spot.description}
            </p>
          </section>

          {promos.length > 0 ? <PromoList promos={promos} /> : null}

          <SpotReviewsSection spotId={spot.id} initialReviews={reviews} />
        </div>

        <aside className="space-y-4 md:sticky md:top-20 md:self-start">
          <LocationCard location={spot.location} name={spot.name} />
          <OpeningHoursTable hours={spot.openingHours} />
        </aside>
      </div>
    </div>
  );
}
