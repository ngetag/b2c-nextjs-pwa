"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HypeItem } from "@/types/hype";
import { HypePhotoCarouselCard } from "./HypePhotoCarouselCard";
import { HypeVideoCard } from "./HypeVideoCard";

interface HypeFeedProps {
  items: HypeItem[];
}

export function HypeFeed({ items }: HypeFeedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // IntersectionObserver to determine active item in full-screen snap feed
  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.6,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute("data-index"));
          if (!isNaN(index)) {
            setActiveIndex(index);
          }
        }
      });
    }, options);

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Keyboard Navigation (ArrowUp / ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (activeIndex < items.length - 1) {
          const nextCard = cardRefs.current[activeIndex + 1];
          nextCard?.scrollIntoView({ behavior: "smooth" });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (activeIndex > 0) {
          const prevCard = cardRefs.current[activeIndex - 1];
          prevCard?.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, items.length]);

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-[#0D0E15] overflow-hidden">
      {/* Feed Container with Scroll Snap */}
      <div
        ref={containerRef}
        className="h-full w-full max-w-[440px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide shadow-[0_0_50px_rgba(0,0,0,0.8)] md:border-x md:border-white/10 relative"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            data-index={index}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="h-full w-full snap-start snap-always relative"
          >
            {item.type === "video" ? (
              <HypeVideoCard
                item={item}
                isActive={index === activeIndex}
                isMuted={isMuted}
                onToggleMute={toggleMute}
              />
            ) : (
              <HypePhotoCarouselCard
                item={item}
                isMuted={isMuted}
                onToggleMute={toggleMute}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
