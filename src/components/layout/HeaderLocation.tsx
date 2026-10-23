"use client";

import { ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import { formatUserLocation } from "@/lib/location";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";

export function HeaderLocation() {
  const { location, status, mode } = useCurrentLocationStore();

  const label = (() => {
    if (status === "detecting") return "Mendeteksi...";
    if (status === "denied") return formatUserLocation(location);
    if (status === "unsupported") return "Lokasi tidak tersedia";
    if (status !== "ready") return "Deteksi lokasi";
    return formatUserLocation(location);
  })();

  return (
    <Link
      href="/location"
      className="hidden min-w-0 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-left text-sm text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)] lg:flex"
      aria-label="Pilih lokasi aktif"
      title={mode === "manual" ? "Lokasi manual aktif" : "Lokasi saat ini aktif"}
    >
      <MapPin className="h-4 w-4 shrink-0" aria-hidden />
      <span className="max-w-40 truncate">{label}</span>
      <span className="rounded-full bg-[var(--color-background)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-muted-foreground)]">
      </span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
    </Link>
  );
}
