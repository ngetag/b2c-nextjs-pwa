"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  setTelemetryCustomer,
  startTelemetry,
  trackEvent,
  trackPageView,
} from "@/lib/telemetry/client";
import { useAuth } from "@/providers/AuthProvider";
import type {
  TelemetryEventType,
  TelemetryTargetType,
} from "@/shared/telemetry";

interface TelemetryContextValue {
  track: (
    eventType: TelemetryEventType,
    input?: {
      targetType?: TelemetryTargetType;
      targetId?: string;
      tagIds?: string[];
      interestIds?: string[];
      value?: number;
      metadata?: Record<string, unknown>;
    },
  ) => void;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

/** Surfaces that should not be tracked (auth + operational pages). */
const IGNORED_PREFIXES = ["/auth", "/api-docs", "/theme"];

/**
 * Client-side telemetry bridge.
 *
 * - Tracks a `page_view` for every route change and a `dwell` event with the
 *   time spent on the previous route.
 * - Attaches the customer id once the session is known.
 * - Batches and flushes via the client SDK (respects Do Not Track).
 */
export function TelemetryProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const previousPath = useRef<string | null>(null);
  const enteredAt = useRef<number | null>(null);

  useEffect(() => {
    startTelemetry();
  }, []);

  useEffect(() => {
    setTelemetryCustomer(user?.id ?? null);
  }, [user?.id]);

  useEffect(() => {
    if (!pathname) return;
    if (enteredAt.current === null) enteredAt.current = Date.now();
    if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      previousPath.current = pathname;
      enteredAt.current = Date.now();
      return;
    }

    if (previousPath.current && previousPath.current !== pathname) {
      const dwellMs = Date.now() - (enteredAt.current ?? Date.now());
      if (dwellMs > 1_000) {
        trackEvent("dwell", {
          targetType: "page",
          targetId: previousPath.current,
          surface: previousPath.current,
          value: dwellMs,
        });
      }
    }

    trackPageView(pathname);
    previousPath.current = pathname;
    enteredAt.current = Date.now();
  }, [pathname]);

  const track = useCallback<TelemetryContextValue["track"]>(
    (eventType, input) => trackEvent(eventType, input ?? {}),
    [],
  );

  return (
    <TelemetryContext.Provider value={{ track }}>
      {children}
    </TelemetryContext.Provider>
  );
}

/** Access the tracking helper from any client component. */
export function useTelemetry(): TelemetryContextValue {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    // Allow components to work in isolation (e.g. storybook-like previews).
    return { track: (eventType, input) => trackEvent(eventType, input ?? {}) };
  }
  return ctx;
}
