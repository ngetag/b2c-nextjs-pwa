"use client";

import { ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import { formatHomeLocation } from "@/lib/location";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";

export function HomeActiveLocation() {
  const { location, status } = useCurrentLocationStore();

  const label =
    status === "detecting" ? "Mendeteksi lokasi..." : formatHomeLocation(location);

  return (
    <Link
      href="/location"
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]"
      aria-label="Ganti lokasi aktif"
    >
      <MapPin className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 truncate">{label}</span>
      <span className="rounded-full bg-[var(--color-background)] px-1.5 py-0.5 text-[10px] font-medium">
      </span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
    </Link>
  );
}
