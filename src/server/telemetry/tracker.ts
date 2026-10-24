import { randomUUID } from "node:crypto";
import {
  TELEMETRY_EVENT_WEIGHTS,
  type StoredTelemetryEvent,
  type TelemetryEventInput,
} from "@/shared/telemetry";
import { embedTelemetryEvent } from "./embedding";
import { getTelemetryRepo } from "./repo";
import { applyEventsToTasteProfiles } from "./taste";

/** Flush cadence: events are batched for ~800 ms before hitting the DB. */
const FLUSH_DELAY_MS = 800;
/** Hard cap per flush (keeps a single insert predictable). */
const MAX_FLUSH_BATCH = 500;
/** Flush immediately when the buffer grows past this size. */
const EAGER_FLUSH_THRESHOLD = 100;

interface TrackerGlobal {
  __ngetagTelemetryBuffer?: StoredTelemetryEvent[];
  __ngetagTelemetryTimer?: ReturnType<typeof setTimeout> | null;
  __ngetagTelemetryFlushing?: Promise<FlushResult> | null;
}

const globalForTracker = globalThis as unknown as TrackerGlobal;

function buffer(): StoredTelemetryEvent[] {
  if (!globalForTracker.__ngetagTelemetryBuffer) {
    globalForTracker.__ngetagTelemetryBuffer = [];
  }
  return globalForTracker.__ngetagTelemetryBuffer;
}

/** Context attached server-side (never trusted from the body). */
export interface IngestContext {
  customerId?: string | null;
  sessionId?: string | null;
  userAgent?: string | null;
  /** Only the hash is stored — see `hashIp`. */
  ipHash?: string | null;
  source?: TelemetryEventInput["source"];
}

function eventWeight(event: TelemetryEventInput): number {
  const base = TELEMETRY_EVENT_WEIGHTS[event.eventType] ?? 0.5;

  // Dwell time is scaled so a quick glance barely moves the taste vector.
  if (event.eventType === "dwell" && typeof event.value === "number") {
    const seconds = Math.min(Math.max(event.value, 0) / 1000, 120);
    return base * (0.2 + Math.min(seconds / 20, 1.4));
  }

  return base;
}

function normalizeEvent(
  input: TelemetryEventInput,
  context: IngestContext,
): StoredTelemetryEvent {
  const now = Date.now();
  const receivedAt = new Date(now).toISOString();

  // Clamp timestamps: at most 5 minutes in the future, at most 30 days old.
  let occurredAt = input.occurredAt ?? receivedAt;
  const occurredMs = new Date(occurredAt).getTime();
  if (!Number.isFinite(occurredMs)) occurredAt = receivedAt;
  else if (occurredMs > now + 5 * 60_000) occurredAt = receivedAt;
  else if (occurredMs < now - 30 * 86_400_000) occurredAt = receivedAt;

  const normalized: StoredTelemetryEvent = {
    ...input,
    id: input.id ?? `tel_${randomUUID()}`,
    customerId: context.customerId ?? null,
    sessionId: input.sessionId ?? context.sessionId ?? undefined,
    tagIds: input.tagIds ?? [],
    interestIds: input.interestIds ?? [],
    source: input.source ?? context.source ?? "web",
    occurredAt,
    receivedAt,
    weight: eventWeight(input),
    embedding: embedTelemetryEvent(input),
  };

  return normalized;
}

/**
 * Normalises and buffers telemetry events for asynchronous persistence.
 *
 * This is intentionally fire-and-forget: the API returns `202 Accepted` before
 * anything is written, so tracking never slows down the customer experience.
 *
 * @param inputs Validated events from `POST /api/telemetry/events`.
 * @param context Server-derived identity (JWT subject, session, IP hash).
 * @returns The normalised events (including generated ids).
 */
export function enqueueTelemetryEvents(
  inputs: TelemetryEventInput[],
  context: IngestContext = {},
): StoredTelemetryEvent[] {
  const normalized = inputs.map((input) => normalizeEvent(input, context));
  buffer().push(...normalized);

  if (buffer().length >= EAGER_FLUSH_THRESHOLD) {
    void flushTelemetry();
  } else {
    scheduleFlush();
  }

  return normalized;
}

function scheduleFlush(): void {
  if (globalForTracker.__ngetagTelemetryTimer) return;

  const timer = setTimeout(() => {
    globalForTracker.__ngetagTelemetryTimer = null;
    void flushTelemetry();
  }, FLUSH_DELAY_MS);

  // Don't keep the Node process alive just for telemetry.
  timer.unref?.();
  globalForTracker.__ngetagTelemetryTimer = timer;
}

/** Result of a flush cycle. */
export interface FlushResult {
  processed: number;
  storage: "postgres" | "memory";
}

/**
 * Persists the buffered events and updates the affected taste vectors.
 *
 * Safe to call concurrently: in-flight flushes are shared. Call this at the end
 * of a request via `after()` or manually from `/api/telemetry/flush`.
 */
export async function flushTelemetry(): Promise<FlushResult> {
  if (globalForTracker.__ngetagTelemetryFlushing) {
    return globalForTracker.__ngetagTelemetryFlushing;
  }

  const repo = getTelemetryRepo();
  const batch = buffer().splice(0, MAX_FLUSH_BATCH);

  if (batch.length === 0) {
    return { processed: 0, storage: repo.kind };
  }

  const flush = (async (): Promise<FlushResult> => {
    try {
      await repo.persistEvents(batch);
      await applyEventsToTasteProfiles(batch);
      return { processed: batch.length, storage: repo.kind };
    } catch (error) {
      // Re-queue on failure (best effort) and surface the error.
      buffer().unshift(...batch);
      console.error("[ngetag/telemetry] flush failed", error);
      throw error;
    }
  })();

  globalForTracker.__ngetagTelemetryFlushing = flush;

  try {
    return await flush;
  } finally {
    globalForTracker.__ngetagTelemetryFlushing = null;
    if (buffer().length > 0) scheduleFlush();
  }
}

/** Drains the buffer completely (used by tests and the flush endpoint). */
export async function drainTelemetry(): Promise<FlushResult & { batches: number }> {
  let processed = 0;
  let batches = 0;
  let storage: "postgres" | "memory" = getTelemetryRepo().kind;

  while (buffer().length > 0) {
    const result = await flushTelemetry();
    processed += result.processed;
    storage = result.storage;
    batches += 1;
    if (result.processed === 0) break;
  }

  return { processed, batches, storage };
}

/** Number of events currently buffered in memory. */
export function getBufferedEventCount(): number {
  return buffer().length;
}
