import { DUMMY_LATENCY_MS } from "@/lib/constants";

/**
 * Simulate network latency for repository calls.
 * Lets us swap to real fetch later without changing call sites.
 */
export function simulateLatency<T>(value: T, ms: number = DUMMY_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
