import type { Metadata } from "next";
import { listHypeItems } from "@/data/repositories/hype.repo";
import { HypeFeed } from "@/features/hype/components/HypeFeed";

export const metadata: Metadata = {
  title: "Hype — Reels Event Discovery",
  description:
    "Jelajahi momen keseruan event Jakarta dalam format Reels video & carousel foto interaktif.",
};

export default async function HypePage() {
  const items = await listHypeItems();

  return (
    <div className="relative h-[calc(100dvh-4rem)] md:h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#0D0E15]">
      <HypeFeed items={items} />
    </div>
  );
}
