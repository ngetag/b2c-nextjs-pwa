"use client";

import { useEffect } from "react";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";

export function LocationBootstrap() {
  const initializeLocation = useCurrentLocationStore(
    (state) => state.initializeLocation,
  );

  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  return null;
}
