"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import type { HypeItem } from "@/types/hype";
import { HypeOverlay } from "./HypeOverlay";

interface HypeVideoCardProps {
  item: HypeItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function HypeVideoCard({ item, isActive, isMuted, onToggleMute }: HypeVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sync autoplay / pause with isActive state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      // Playback state is derived from the media events below, which keeps this
      // effect free of state updates (and in sync with native controls).
      void video.play().catch(() => {
        /* Autoplay can be blocked until the user interacts. */
      });
    } else {
      video.pause();
    }
  }, [isActive]);

  // Sync mute state with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => {
        /* Ignore: the play() rejection is surfaced by the video element. */
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  return (
    <div
      className="relative h-full w-full bg-black overflow-hidden snap-start snap-always select-none flex items-center justify-center"
      onClick={togglePlayPause}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={item.videoUrl}
        poster={item.posterUrl}
        playsInline
        loop
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="h-full w-full object-cover"
      />

      {/* Dark Vignette Overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* Center Play Icon Indicator when Video is Paused */}
      {!isPlaying && (
        <div className="pointer-events-none absolute flex h-16 w-16 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur-md transition-all duration-300 animate-in fade-in zoom-in-75">
          <Play className="h-8 w-8 translate-x-0.5 text-[#00FFFF]" />
        </div>
      )}

      {/* Bottom Video Progress Bar */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-gradient-to-r from-[#00FFFF] to-[#00C2FF] transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Overlay UI (Event info, CTA, actions) */}
      <HypeOverlay item={item} isMuted={isMuted} onToggleMute={onToggleMute} />
    </div>
  );
}
