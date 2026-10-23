"use client";

import { ArrowLeft, Check, Crosshair, MapPin, Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/cn";
import { formatDistanceKm, formatUserLocation } from "@/lib/location";
import {
  searchLocationSuggestions,
  type LocationSearchSuggestion,
} from "@/services/locationSearch";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";
import type { UserLocation } from "@/types/location";

const MIN_SEARCH_LENGTH = 2;

function sameLocation(a: UserLocation, b: UserLocation): boolean {
  return (
    Math.abs(a.latitude - b.latitude) < 0.0001 &&
    Math.abs(a.longitude - b.longitude) < 0.0001 &&
    a.village === b.village &&
    a.city === b.city
  );
}

export function LocationPickerView() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 450);
  const [suggestions, setSuggestions] = useState<LocationSearchSuggestion[]>([]);
  const [searchStatus, setSearchStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [searchError, setSearchError] = useState<string>();
  const [, startTransition] = useTransition();
  const {
    location,
    currentLocation,
    mode,
    status,
    error,
    setManualLocation,
    useCurrentBrowserLocation,
  } = useCurrentLocationStore();

  useEffect(() => {
    const searchTerm = debouncedQuery.trim();
    if (searchTerm.length < MIN_SEARCH_LENGTH) {
      startTransition(() => {
        setSuggestions([]);
        setSearchStatus("idle");
        setSearchError(undefined);
      });
      return;
    }

    const controller = new AbortController();

    startTransition(() => {
      setSearchStatus("loading");
      setSearchError(undefined);
    });

    searchLocationSuggestions(searchTerm, {
      near: currentLocation ?? location,
      signal: controller.signal,
    })
      .then((results) => {
        startTransition(() => {
          setSuggestions(results);
          setSearchStatus("ready");
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        startTransition(() => {
          setSuggestions([]);
          setSearchStatus("error");
          setSearchError(
            error instanceof Error
              ? error.message
              : "Pencarian lokasi gagal",
          );
        });
      });

    return () => controller.abort();
  }, [currentLocation, debouncedQuery, location, startTransition]);

  function selectManualLocation(option: LocationSearchSuggestion) {
    setManualLocation({
      village: option.village || option.name,
      district: option.district,
      city: option.city,
      address: option.address,
      displayName: option.name,
      latitude: option.latitude,
      longitude: option.longitude,
      source: "manual",
      isApproximate: option.isApproximate,
    });
  }

  const trimmedQuery = query.trim();
  const showSearchHint = trimmedQuery.length > 0 && trimmedQuery.length < MIN_SEARCH_LENGTH;
  const showEmptyState =
    debouncedQuery.trim().length >= MIN_SEARCH_LENGTH &&
    searchStatus === "ready" &&
    suggestions.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-3 md:px-6 md:py-8">
      <header className="mb-4 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => router.back()}
          aria-label="Kembali"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Button>
        <div>
          <div className="mb-2 h-1 w-10 rounded-full bg-[var(--color-primary)]" />
          <h1 className="font-display text-xl font-bold text-[var(--color-foreground)] md:text-2xl">
            Pilih lokasi
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Biar rekomendasinya lebih dekat sama kamu.
          </p>
        </div>
      </header>

      <div className="space-y-5">
        <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Lokasi aktif saat ini
          </p>
          <div className="mt-2 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                {formatUserLocation(location)}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {mode === "manual"
                  ? "Dipilih manual"
                  : "Pakai lokasi kamu saat ini"}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <button
            type="button"
            onClick={useCurrentBrowserLocation}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
              mode === "current"
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]",
            )}
            aria-pressed={mode === "current"}
          >
            <span className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                <span className="block text-sm font-semibold">
                  Pakai lokasi saat ini
                </span>
                <span className="block text-xs opacity-80">
                  {status === "detecting"
                    ? "Lagi deteksi lokasi..."
                    : currentLocation
                      ? formatUserLocation(currentLocation)
                      : "Izinkan akses lokasi dari browser"}
                </span>
              </span>
            </span>
            {mode === "current" ? <Check className="h-4 w-4" /> : null}
          </button>
          {error ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {error}
            </p>
          ) : null}
        </section>

        <section className="space-y-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari alamat, mall, atau area..."
              className="h-11 pl-10"
            />
          </div>

          <div className="space-y-2">
            {showSearchHint ? (
              <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs text-[var(--color-muted-foreground)]">
                Ketik minimal 2 karakter buat mulai cari.
              </p>
            ) : null}

            {searchStatus === "loading" ? (
              <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-muted-foreground)]">
                Lagi cari lokasi...
              </p>
            ) : null}

            {searchStatus === "error" ? (
              <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-muted-foreground)]">
                {searchError ?? "Pencarian lokasi gagal"}
              </p>
            ) : null}

            {showEmptyState ? (
              <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-muted-foreground)]">
                Belum ketemu. Coba nama area atau alamat lain.
              </p>
            ) : null}

            {suggestions.map((option) => {
              const active = mode === "manual" && sameLocation(location, option);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectManualLocation(option)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
                    active
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]",
                  )}
                  aria-pressed={active}
                >
                  <span className="flex min-w-0 items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {option.name}
                      </span>
                      <span className="block text-xs opacity-80">
                        {option.detail}
                      </span>
                      {option.distanceKm !== undefined ? (
                        <span className="mt-1 block text-xs opacity-80">
                          {formatDistanceKm(option.distanceKm)} dari lokasimu
                        </span>
                      ) : null}
                    </span>
                  </span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
