"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mockCurrentUserLocation } from "@/data/fixtures/currentLocation";
import { STORAGE_KEYS } from "@/lib/constants";
import { reverseGeocode } from "@/services/reverseGeocode";
import type { UserLocation } from "@/types/location";

type LocationStatus = "idle" | "detecting" | "ready" | "denied" | "unsupported";
type LocationMode = "current" | "manual";

interface CurrentLocationState {
  location: UserLocation;
  currentLocation?: UserLocation;
  mode: LocationMode;
  status: LocationStatus;
  error?: string;
  initializeLocation: () => void;
  useCurrentBrowserLocation: () => void;
  setManualLocation: (location: UserLocation) => void;
}

function detectBrowserLocation(
  set: (
    patch: Partial<CurrentLocationState> | ((state: CurrentLocationState) => Partial<CurrentLocationState>),
  ) => void,
  get: () => CurrentLocationState,
) {
  if (get().status === "detecting") return;

  if (typeof window !== "undefined" && !window.isSecureContext) {
    set({
      status: "unsupported",
      error: "Geolocation perlu HTTPS atau localhost",
    });
    return;
  }

  if (!("geolocation" in navigator)) {
    set({ status: "unsupported", error: "Geolocation tidak tersedia" });
    return;
  }

  set({ mode: "current", status: "detecting", error: undefined });
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const result = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude,
        );
        const currentLocation: UserLocation = {
          village: result.village,
          district: result.district,
          city: result.city,
          address: result.displayName,
          displayName: result.village || result.district || result.city,
          latitude: result.latitude,
          longitude: result.longitude,
          source: "browser",
        };

        set({
          location: currentLocation,
          currentLocation,
          mode: "current",
          status: "ready",
          error: undefined,
        });
      } catch (error) {
        const currentLocation: UserLocation = {
          ...mockCurrentUserLocation,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: "browser",
          isApproximate: true,
        };

        set({
          location: currentLocation,
          currentLocation,
          mode: "current",
          status: "ready",
          error:
            error instanceof Error ? error.message : "Reverse geocoding gagal",
        });
      }
    },
    (error) => {
      set({
        location: mockCurrentUserLocation,
        currentLocation: mockCurrentUserLocation,
        mode: "current",
        status: error.code === error.PERMISSION_DENIED ? "denied" : "idle",
        error: error.message,
      });
    },
    {
      enableHighAccuracy: false,
      maximumAge: 1000 * 60 * 10,
      timeout: 10000,
    },
  );
}

export const useCurrentLocationStore = create<CurrentLocationState>()(
  persist(
    (set, get) => ({
      location: mockCurrentUserLocation,
      currentLocation: undefined,
      mode: "current",
      status: "idle",
      initializeLocation: () => {
        const state = get();
        if (state.mode === "manual") {
          set({ status: "ready" });
          return;
        }
        if (state.currentLocation?.source === "browser") {
          set({ location: state.currentLocation, status: "ready" });
          return;
        }
        detectBrowserLocation(set, get);
      },
      useCurrentBrowserLocation: () => detectBrowserLocation(set, get),
      setManualLocation: (location) => {
        set({
          location: { ...location, source: "manual" },
          mode: "manual",
          status: "ready",
          error: undefined,
        });
      },
    }),
    {
      name: STORAGE_KEYS.location,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        location: state.location,
        currentLocation: state.currentLocation,
        mode: state.mode,
      }),
      version: 4,
    },
  ),
);
