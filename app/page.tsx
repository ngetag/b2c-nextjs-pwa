import { Suspense } from "react";
import Image from "next/image";
import { HomeMobileHeader } from "@/components/layout/HomeMobileHeader";
import { listFeaturedEvents } from "@/data/repositories/event.repo";
import { listFeaturedPromos } from "@/data/repositories/promo.repo";
import { listFeaturedSpots } from "@/data/repositories/spot.repo";
import { listTags, listTrendingTags } from "@/data/repositories/tag.repo";
import { HomeFilteredContent } from "@/features/home/components/HomeFilteredContent";
import { APP_TAGLINE, DEFAULT_CITY } from "@/lib/constants";

export default async function HomePage() {
  const [
    trendingTags,
    allTags,
    featuredSpots,
    featuredEvents,
    featuredPromos,
  ] = await Promise.all([
    listTrendingTags(8),
    listTags(),
    listFeaturedSpots(8),
    listFeaturedEvents(8),
    listFeaturedPromos(4),
  ]);

  const heroPromo = featuredPromos[0];
  const sidePromos = featuredPromos.slice(1, 3);
  const heroSpot = featuredSpots[0];

  return (
    // 1. Menggunakan bg-background (#0D0E15) & text-foreground agar 1 warna solid dan menyatu rata dengan Header
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8 relative z-10 flex flex-col gap-3 md:gap-10">
        <div className="md:hidden">
          <HomeMobileHeader />
        </div>

        <section className="relative hidden min-h-[430px] overflow-hidden rounded-xl border border-border bg-surface-soft/60 backdrop-blur-md shadow-2xl md:flex">
          <div className="relative flex min-h-[430px] flex-col justify-between gap-8 p-8 w-full">
            {heroSpot ? (
              <Image
                src={heroSpot.coverImageUrl}
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 1216px, 100vw"
                className="object-cover opacity-40"
              />
            ) : null}

            {/* 2. Gradient overlay hero memudar sempurna ke bg-background */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />

            <div className="relative z-10 flex min-h-[360px] flex-col justify-between gap-8 p-5 md:min-h-[430px] md:p-8">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {DEFAULT_CITY || "Jakarta"} lagi seru malam ini
                </div>
                <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                  {APP_TAGLINE}
                </h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                  Cari tongkrongan, event, promo, dan komunitas yang cocok sama mood kamu.
                </p>
              </div>

              <div className="max-w-2xl space-y-3">
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full border border-accent-coffee/30 bg-accent-coffee/10 px-3 py-1 text-accent-coffee">
                    Ngopi
                  </span>
                  <span className="rounded-full border border-accent-music/30 bg-accent-music/10 px-3 py-1 text-accent-music">
                    Live music
                  </span>
                  <span className="rounded-full border border-accent-tech/30 bg-accent-tech/10 px-3 py-1 text-accent-tech">
                    Komunitas
                  </span>
                  <span className="rounded-full border border-accent-pop/30 bg-accent-pop/10 px-3 py-1 text-accent-pop">
                    Gaming
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={null}>
          <HomeFilteredContent
            trendingTags={trendingTags}
            allTags={allTags}
            featuredSpots={featuredSpots}
            featuredEvents={featuredEvents}
            heroPromo={heroPromo}
            sidePromos={sidePromos}
          />
        </Suspense>
      </div>
    </div>
  );
}
