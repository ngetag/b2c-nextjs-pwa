import type {
  ContentEmbedding,
  StoredTelemetryEvent,
  TasteVector,
} from "@/shared/telemetry";

interface TelemetryMemoryState {
  events: StoredTelemetryEvent[];
  tastes: Map<string, TasteVector>;
  contents: Map<string, ContentEmbedding>;
}

const globalForTelemetry = globalThis as unknown as {
  __ngetagTelemetryMemory?: TelemetryMemoryState;
};

/** Maximum events kept in memory (oldest are trimmed first). */
const MAX_MEMORY_EVENTS = 5000;

/**
 * In-memory telemetry state used when PostgreSQL is not configured.
 * Stored on `globalThis` so Next.js hot reloads don't drop the data.
 */
export function telemetryMemory(): TelemetryMemoryState {
  if (!globalForTelemetry.__ngetagTelemetryMemory) {
    globalForTelemetry.__ngetagTelemetryMemory = {
      events: [],
      tastes: new Map(),
      contents: new Map(),
    };
  }
  return globalForTelemetry.__ngetagTelemetryMemory;
}

/** Appends events, trimming the oldest ones beyond the cap. */
export function memoryAppendEvents(events: StoredTelemetryEvent[]): void {
  const state = telemetryMemory();
  state.events.push(...events);
  if (state.events.length > MAX_MEMORY_EVENTS) {
    state.events.splice(0, state.events.length - MAX_MEMORY_EVENTS);
  }
}

/** Test/helper hook to clear the in-memory telemetry state. */
export function resetTelemetryMemory(): void {
  telemetryMemory().events = [];
  telemetryMemory().tastes.clear();
  telemetryMemory().contents.clear();
}

/** Number of events currently held in memory. */
export function memoryEventCount(): number {
  return telemetryMemory().events.length;
}
