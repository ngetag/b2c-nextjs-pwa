"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import type { HypeItem } from "@/types/hype";

interface HypeOverlayProps {
  item: HypeItem;
  isMuted: boolean;
  onToggleMute: () => void;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

export function HypeOverlay({ item, isMuted, onToggleMute }: HypeOverlayProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      toast.success("Disukai!");
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Disimpan dihapus" : "Event disimpan ke Bookmark");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}${routes.event(item.eventId)}`);
    }
    toast.success("Tautan event disalin ke clipboard!");
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? `Batal mengikuti ${item.organizerName}` : `Mengikuti ${item.organizerName}`);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("Fitur komentar prototype Hype");
  };

  // Tags logic: max 3 visible by default + extra counter badge (+1, +2, etc.)
  const visibleTags = isTagsExpanded ? item.tags : item.tags.slice(0, 3);
  const extraTagsCount = item.tags.length - 3;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-5 text-white">
      {/* Top Bar: Minimal Mute Toggle */}
      <div className="pointer-events-auto flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          aria-label={isMuted ? "Aktifkan Suara" : "Matikan Suara"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-950/50 text-white backdrop-blur-md transition-all hover:bg-slate-900 active:scale-95"
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-gray-300" /> : <Volume2 className="h-4 w-4 text-[#00FFFF]" />}
        </button>
      </div>

      {/* Main Bottom Container (Left Details + Right Actions) */}
      <div className="flex items-end justify-between gap-3 pb-1 md:pb-3">
        {/* Left Content Area */}
        <div className="pointer-events-auto flex flex-1 flex-col gap-2.5 max-w-[80%]">
          {/* Organizer */}
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border border-white/20">
              <AvatarImage src={item.organizerAvatar} alt={item.organizerName} />
              <AvatarFallback className="bg-slate-800 text-[10px] font-semibold text-white">
                {item.organizerName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-white drop-shadow">{item.organizerName}</span>
            <button
              type="button"
              onClick={handleFollow}
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all ${
                isFollowing
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-[#00FFFF]/50 bg-[#00FFFF]/10 text-[#00FFFF] hover:bg-[#00FFFF]/20"
              }`}
            >
              {isFollowing ? "Mengikuti" : "+ Ikuti"}
            </button>
          </div>

          {/* Event Name & Location */}
          <div className="space-y-0.5">
            <h2 className="text-base md:text-lg font-bold text-white leading-snug drop-shadow-md">
              {item.eventName}
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-gray-300 drop-shadow">
              <MapPin className="h-3 w-3 text-[#00FFFF] shrink-0" />
              <span className="truncate">{item.locationName}</span>
            </div>
          </div>

          {/* Caption (Max 1 line default + Selengkapnya trigger) */}
          <div className="text-xs text-gray-200 leading-normal drop-shadow">
            <p className={isCaptionExpanded ? "" : "line-clamp-1"}>
              {item.caption}
            </p>
            {item.caption.length > 50 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCaptionExpanded(!isCaptionExpanded);
                }}
                className="mt-0.5 text-[11px] font-medium text-[#00FFFF] hover:underline"
              >
                {isCaptionExpanded ? "Sembunyikan" : "Selengkapnya"}
              </button>
            )}
          </div>

          {/* Tags (Max 3 + extra indicator) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {visibleTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-white/15 bg-slate-950/40 px-2 py-0.5 text-[10px] text-gray-300 backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}

            {extraTagsCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTagsExpanded(!isTagsExpanded);
                }}
                className="rounded-full border border-white/20 bg-slate-950/60 px-2 py-0.5 text-[10px] font-semibold text-[#00FFFF] backdrop-blur-sm hover:bg-slate-900"
              >
                {isTagsExpanded ? "Sembunyikan" : `+${extraTagsCount}`}
              </button>
            )}
          </div>

          {/* Primary CTA "Lihat Event" */}
          <div className="pt-1">
            <Button
              asChild
              size="sm"
              className="group flex w-full max-w-[190px] items-center justify-center gap-2 rounded-xl bg-[#00FFFF] font-bold text-slate-950 shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all hover:bg-[#67fbff] active:scale-95"
            >
              <Link href={routes.event(item.eventId)}>
                <span className="text-xs">Lihat Event</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Action Sidebar */}
        <div className="pointer-events-auto flex flex-col items-center gap-3.5 pb-1">
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            className="group flex flex-col items-center gap-0.5 focus:outline-none"
            aria-label="Suka"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md transition-all group-active:scale-125 ${
                isLiked ? "border-red-500/40 bg-red-500/20 text-red-500" : "text-white hover:bg-slate-900"
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500 scale-110" : ""}`} />
            </div>
            <span className="text-[10px] font-semibold text-white drop-shadow">{formatNumber(likesCount)}</span>
          </button>

          {/* Comment */}
          <button
            type="button"
            onClick={handleComment}
            className="group flex flex-col items-center gap-0.5 focus:outline-none"
            aria-label="Komentar"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-slate-950/50 text-white backdrop-blur-md transition-all group-active:scale-125 hover:bg-slate-900">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold text-white drop-shadow">{formatNumber(item.commentsCount)}</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="group flex flex-col items-center gap-0.5 focus:outline-none"
            aria-label="Bagikan"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-slate-950/50 text-white backdrop-blur-md transition-all group-active:scale-125 hover:bg-slate-900">
              <Share2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold text-white drop-shadow">{formatNumber(item.sharesCount)}</span>
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmark}
            className="group flex flex-col items-center gap-0.5 focus:outline-none"
            aria-label="Simpan Event"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md transition-all group-active:scale-125 ${
                isBookmarked
                  ? "border-[#00FFFF]/40 bg-[#00FFFF]/20 text-[#00FFFF]"
                  : "text-white hover:bg-slate-900"
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-[#00FFFF]" : ""}`} />
            </div>
            <span className="text-[9px] font-medium text-gray-300 drop-shadow">Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
