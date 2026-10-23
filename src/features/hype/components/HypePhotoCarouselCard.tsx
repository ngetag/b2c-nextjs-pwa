"use client";

import { useRef, useState } from "react";
import type { HypeItem } from "@/types/hype";
import { HypeOverlay } from "./HypeOverlay";

interface HypePhotoCarouselCardProps {
  item: HypeItem;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function HypePhotoCarouselCard({ item, isMuted, onToggleMute }: HypePhotoCarouselCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const photos = item.photos ?? [];

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth;
    if (width > 0) {
      const index = Math.round(container.scrollLeft / width);
      setActivePhotoIndex(index);
    }
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden snap-start snap-always select-none">
      {/* Horizontal Carousel Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {photos.map((photoUrl, idx) => (
          <div key={photoUrl} className="relative h-full w-full min-w-full shrink-0 snap-center">
            {/* eslint-disable-next-html-element-suppression */}
            <img
              src={photoUrl}
              alt={`${item.eventName} foto ${idx + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Dark Vignette Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

      {/* Subtle Bottom-Center Photo Indicator ("1 / 3" + Dots) */}
      <div className="pointer-events-none absolute bottom-[210px] left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        <div className="rounded-full bg-slate-950/60 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-300 backdrop-blur-md">
          {activePhotoIndex + 1} / {photos.length}
        </div>
        <div className="flex items-center gap-1">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === activePhotoIndex
                  ? "w-3 bg-[#00FFFF]"
                  : "w-1 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Overlay UI (Event details & Actions) */}
      <HypeOverlay item={item} isMuted={isMuted} onToggleMute={onToggleMute} />
    </div>
  );
}
