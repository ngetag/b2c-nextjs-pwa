"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect when the component has mounted on the client.
 * Use to gate render of localStorage-derived state to prevent hydration mismatch.
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);
  return mounted;
}
