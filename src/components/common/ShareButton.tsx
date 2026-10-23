"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  text?: string;
  /** Path or full URL. If path, current origin is prepended. */
  url: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
  label?: string;
  className?: string;
}

export function ShareButton({
  title,
  text,
  url,
  variant = "outline",
  size = "icon",
  label,
  className,
}: ShareButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (busy) return;
    setBusy(true);
    try {
      const fullUrl = url.startsWith("http")
        ? url
        : typeof window !== "undefined"
          ? `${window.location.origin}${url}`
          : url;

      if (typeof navigator !== "undefined" && "share" in navigator) {
        try {
          await navigator.share({ title, text, url: fullUrl });
          return;
        } catch (err) {
          // User cancelled — silent
          if ((err as Error).name === "AbortError") return;
        }
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Link sudah disalin", {
          description: "Tinggal kirim ke teman nongkrongmu.",
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={busy}
      aria-label="Bagikan"
      className={className}
    >
      <Share2 className="h-4 w-4" aria-hidden />
      {label ? <span>{label}</span> : null}
    </Button>
  );
}
