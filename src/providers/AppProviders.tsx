"use client";

import { Toaster } from "sonner";
import { LocationBootstrap } from "@/providers/LocationBootstrap";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Single client-side provider boundary for the whole app.
 * Currently only wraps Sonner Toaster — added Theme/QueryClient here later.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      <LocationBootstrap />
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: "var(--font-sans)",
            borderRadius: "0.75rem",
          },
        }}
      />
    </>
  );
}
