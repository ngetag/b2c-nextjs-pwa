"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  QR_REVIEW_ACCESS_KEY,
  QR_REVIEW_ACCESS_TTL_MS,
} from "@/lib/constants";
import { WriteReviewForm } from "@/features/review/components/WriteReviewForm";
import type { ReviewTag } from "@/types/review";

interface ReviewQrAccessPayload {
  spotId: string;
  createdAt: number;
}

interface ReviewQrAccessGateProps {
  spotId: string;
  spotName: string;
  spotTagIds: string[];
  reviewTags: ReviewTag[];
}

function readQrAccess(): ReviewQrAccessPayload | null {
  try {
    const raw = window.sessionStorage.getItem(QR_REVIEW_ACCESS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ReviewQrAccessPayload>;
    if (typeof parsed.spotId !== "string" || typeof parsed.createdAt !== "number") {
      return null;
    }

    return { spotId: parsed.spotId, createdAt: parsed.createdAt };
  } catch {
    return null;
  }
}

export function ReviewQrAccessGate({
  spotId,
  spotName,
  spotTagIds,
  reviewTags,
}: ReviewQrAccessGateProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const access = readQrAccess();
      const now = Date.now();
      const isAllowed =
        Boolean(access) &&
        access!.spotId === spotId &&
        now - access!.createdAt <= QR_REVIEW_ACCESS_TTL_MS;

      if (!isAllowed) {
        window.sessionStorage.removeItem(QR_REVIEW_ACCESS_KEY);
      }

      setAllowed(isAllowed);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [spotId]);

  if (allowed === null) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 text-sm text-[var(--color-muted-foreground)]">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" aria-hidden />
        Memverifikasi akses QR Code...
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
        <p className="text-sm font-semibold text-[var(--color-foreground)]">
          Akses ulasan tidak tersedia
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Ulasan hanya bisa dibuat setelah scan QR Code di lokasi.
        </p>
      </div>
    );
  }

  return (
    <WriteReviewForm
      spotId={spotId}
      spotName={spotName}
      spotTagIds={spotTagIds}
      reviewTags={reviewTags}
    />
  );
}
