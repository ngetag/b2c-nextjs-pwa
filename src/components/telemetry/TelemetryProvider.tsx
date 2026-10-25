"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ConsentBanner } from "./ConsentBanner";
import { tracker } from "@/lib/tracker";

interface TelemetryProviderProps {
  children: React.ReactNode;
  userId?: string | null;
}

/**
 * Isolated listener wrapped in React.Suspense so Next.js doesn't bail out
 * of static generation or throw missing suspense boundary errors for useSearchParams().
 */
function PageViewTracker({ userId }: { userId?: string | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialMount = useRef(true);

  // Synchronize authenticated user ID with telemetry tracker instance
  useEffect(() => {
    tracker.setUserId(userId ?? null);
  }, [userId]);

  // Track page views on route and query string changes
  useEffect(() => {
    const queryString = searchParams?.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    tracker.track({
      eventType: "page_view",
      metadata: {
        path: fullPath,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        title: typeof document !== "undefined" ? document.title : "",
        isInitial: initialMount.current,
      },
      immediate: false,
    });

    initialMount.current = false;
  }, [pathname, searchParams]);

  return null;
}

export function TelemetryProvider({
  children,
  userId = null,
}: TelemetryProviderProps) {
  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker userId={userId} />
      </Suspense>
      {children}
      <ConsentBanner />
    </>
  );
}

/**
 * Hook to trigger custom user actions throughout the application
 */
export function useActivityTracker() {
  return {
    trackSpotClick: (spotId: string, spotName: string, category?: string) => {
      tracker.track({
        eventType: "spot_click",
        metadata: { spotId, spotName, category },
      });
    },
    trackSearch: (keyword: string, resultCount: number) => {
      tracker.track({
        eventType: "search_query",
        metadata: { keyword, resultCount },
      });
    },
    trackTagClick: (tag: string) => {
      tracker.track({
        eventType: "tag_explore",
        metadata: { tag },
      });
    },
    trackCustomEvent: (eventType: string, metadata?: Record<string, unknown>) => {
      tracker.track({ eventType, metadata });
    },
  };
}