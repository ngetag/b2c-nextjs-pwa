"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface SpotHeroGalleryProps {
  images: string[];
  alt: string;
}

export function SpotHeroGallery({ images, alt }: SpotHeroGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const all = images.length > 0 ? images : [];
  if (all.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] shadow-[var(--shadow-soft)] md:aspect-[21/9]">
        <Image
          src={all[activeIdx]}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[rgb(8_17_22_/_0.82)] to-transparent" />
      </div>

      {all.length > 1 ? (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          {all.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIdx(idx)}
              aria-label={`Lihat foto ${idx + 1}`}
              className={cn(
                "relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                idx === activeIdx
                  ? "border-[var(--color-primary)]"
                  : "border-[var(--color-border)] opacity-75 hover:border-[var(--color-primary)] hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
