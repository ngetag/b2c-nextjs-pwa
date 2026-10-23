"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { cn } from "@/lib/cn";
import { formatHomeLocation } from "@/lib/location";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";

interface MobileSearchLocationProps {
  className?: string;
}

export function MobileSearchLocation({ className }: MobileSearchLocationProps) {
  const pathname = usePathname();
  const { location, status } = useCurrentLocationStore();
  const label =
    status === "detecting" ? "Mendeteksi..." : formatHomeLocation(location);

  if (pathname !== routes.home()) return null;

  return (
    <div
      className={cn(
        "flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-[var(--color-primary)]/35 bg-[var(--color-background)]/72 shadow-[0_18px_40px_rgb(0_0_0_/_0.25)] backdrop-blur-xl",
        className,
      )}
    >
      <Link
        href={routes.search()}
        className="flex h-full min-w-0 flex-1 items-center gap-2 px-3 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
        aria-label="Buka pencarian"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="min-w-0 truncate">Cari tempat, event, atau komunitas...</span>
      </Link>

      <span
        className="h-6 w-px shrink-0 bg-[var(--color-border)]"
        aria-hidden
      />

      <Link
        href="/location"
        className="flex h-full min-w-0 max-w-[42%] items-center gap-1 px-2.5 text-sm font-semibold text-[var(--color-foreground)] transition-colors hover:text-[var(--color-primary)]"
        aria-label="Ganti lokasi aktif"
      >
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </Link>
    </div>
  );
}
