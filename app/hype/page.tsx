import type { Metadata } from "next";
import { hypeItems } from "@/data/fixtures/hype";
import { HypeFeed } from "@/features/hype/components/HypeFeed";

export const metadata: Metadata = {
  title: "Hype — Reels Event Discovery",
  description:
    "Jelajahi momen keseruan event Jakarta dalam format Reels video & carousel foto interaktif.",
};

export default function HypePage() {
  return (
    <div className="relative h-[calc(100dvh-4rem)] md:h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#0D0E15]">
      <HypeFeed items={hypeItems} />
    </div>
  );
}
