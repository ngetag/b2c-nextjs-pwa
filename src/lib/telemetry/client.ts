"use client";

import type {
  TelemetryEventInput,
  TelemetryEventType,
  TelemetryTargetType,
} from "@/shared/telemetry";

const ANONYMOUS_ID_KEY = "ngetag:anon-id:v1";
const SESSION_ID_KEY = "ngetag:session-id:v1";
const SESSION_SEEN_KEY = "ngetag:session-seen:v1";
const SESSION_TTL_MS = 30 * 60 * 1000;

const BATCH_SIZE = 20;
const FLUSH_DELAY_MS = 4_000;
const ENDPOINT = "/api/telemetry/events";

let queue: TelemetryEventInput[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;
let customerId: string | null = null;

function isDisabled(): boolean {
  if (process.env.NEXT_PUBLIC_TELEMETRY_DISABLED === "true") return true;
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") {
    return true;
  }
  return false;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked — telemetry then degrades to session-only ids.
  }
}

/** Stable anonymous id used to build a taste profile for guests. */
export function getAnonymousId(): string {
  if (typeof window === "undefined") return "server";
  let id = readStorage(ANONYMOUS_ID_KEY);
  if (!id) {
    id = `anon_${uuid()}`;
    writeStorage(ANONYMOUS_ID_KEY, id);
  }
  return id;
}

/** Session id, rotated after 30 minutes of inactivity. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const now = Date.now();
  const seen = Number(readStorage(SESSION_SEEN_KEY) ?? 0);
  let id = readStorage(SESSION_ID_KEY);

  if (!id || !Number.isFinite(seen) || now - seen > SESSION_TTL_MS) {
    id = `sess_${uuid()}`;
    writeStorage(SESSION_ID_KEY, id);
  }

  writeStorage(SESSION_SEEN_KEY, String(now));
  return id;
}

/** Binds subsequent events to the signed-in customer (or clears it). */
export function setTelemetryCustomer(id: string | null): void {
  customerId = id;
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushTelemetry();
  }, FLUSH_DELAY_MS);
}

function enqueue(event: TelemetryEventInput): void {
  if (isDisabled()) return;
  queue.push(event);

  if (queue.length >= BATCH_SIZE) {
    void flushTelemetry();
  } else {
    scheduleFlush();
  }
}

/**
 * Sends the queued events to `POST /api/telemetry/events`.
 *
 * @param useBeacon Use `navigator.sendBeacon` (page hide / unload) so the
 * request survives navigation.
 */
export async function flushTelemetry(useBeacon = false): Promise<void> {
  if (queue.length === 0) return;

  const batch = queue;
  queue = [];

  const body = JSON.stringify({ events: batch });

  try {
    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(ENDPOINT, blob);
      return;
    }

    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Never retry aggressively: analytics must not affect UX.
  }
}

/**
 * Records a single activity event.
 *
 * @example
 * trackEvent("bookmark_add", { targetType: "spot", targetId: spot.id, tagIds: spot.tagIds });
 */
export function trackEvent(
  eventType: TelemetryEventType,
  input: {
    targetType?: TelemetryTargetType;
    targetId?: string;
    tagIds?: string[];
    interestIds?: string[];
    value?: number;
    metadata?: Record<string, unknown>;
    surface?: string;
    source?: TelemetryEventInput["source"];
  } = {},
): void {
  if (typeof window === "undefined" || isDisabled()) return;

  const coords = readLastCoordinates();

  enqueue({
    id: `tel_${uuid()}`,
    eventType,
    anonymousId: getAnonymousId(),
    sessionId: getSessionId(),
    customerId,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    tagIds: input.tagIds ?? [],
    interestIds: input.interestIds ?? [],
    value: input.value ?? null,
    metadata: input.metadata,
    surface: input.surface ?? window.location.pathname,
    source: input.source ?? "web",
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    occurredAt: new Date().toISOString(),
  });
}

/** Records a route impression. */
export function trackPageView(pathname: string): void {
  trackEvent("page_view", {
    targetType: "page",
    targetId: pathname,
    surface: pathname,
  });
}

/** Reads the last known coordinates stored by the location store, if any. */
function readLastCoordinates(): { latitude: number; longitude: number } | null {
  try {
    const raw = window.localStorage.getItem("ngetag:location:v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { location?: { latitude?: number; longitude?: number } };
    };
    const location = parsed.state?.location;
    if (
      typeof location?.latitude === "number" &&
      typeof location?.longitude === "number"
    ) {
      return { latitude: location.latitude, longitude: location.longitude };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Installs unload listeners so the final batch (and dwell time) is delivered.
 * Safe to call multiple times.
 */
export function startTelemetry(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const flushOnHide = () => {
    void flushTelemetry(true);
  };

  window.addEventListener("pagehide", flushOnHide);
  window.addEventListener("beforeunload", flushOnHide);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushOnHide();
  });
}
