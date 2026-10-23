import type { Metadata } from "next";
import { Suspense } from "react";
import { listPromos } from "@/data/repositories/promo.repo";
import { listTags } from "@/data/repositories/tag.repo";
import { PromoLocationView } from "@/features/promo/components/PromoLocationView";

export const metadata: Metadata = {
  title: "Promo",
  description: "Semua promo berjalan di NgeTag.",
};

export default async function PromoPage() {
  const [promos, tags] = await Promise.all([listPromos(), listTags()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <Suspense fallback={null}>
        <PromoLocationView promos={promos} tags={tags} />
      </Suspense>
    </div>
  );
}
