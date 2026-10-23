"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/AuthProvider";
import { LocationBootstrap } from "@/providers/LocationBootstrap";
import { TelemetryProvider } from "@/providers/TelemetryProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Single client-side provider boundary for the whole app.
 *
 * Order matters: `AuthProvider` resolves the session first so telemetry can
 * attach the customer id, and `TelemetryProvider` then tracks page views and
 * interaction events for the recommendation engine.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <TelemetryProvider>
        <LocationBootstrap />
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter, sans-serif)",
              borderRadius: "0.75rem",
            },
          }}
        />
      </TelemetryProvider>
    </AuthProvider>
  );
}
