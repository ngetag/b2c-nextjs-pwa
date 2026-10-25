"use client";

export interface TelemetryConsent {
  telemetry: boolean;
  ipConsent: boolean;
  geoConsent: boolean;
}

export interface TrackEventOptions {
  eventType: string;
  metadata?: Record<string, unknown>;
  immediate?: boolean;
}

interface QueuedEvent {
  eventType: string;
  path: string;
  metadata?: Record<string, unknown>;
  clientTimestamp: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
}

class TelemetryClient {
  private queue: QueuedEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private consent: TelemetryConsent = {
    telemetry: true,
    ipConsent: false,
    geoConsent: false,
  };
  private cachedLocation: {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
  } | null = null;
  private userId: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadConsentFromStorage();
      this.setupLifecycleListeners();
    }
  }

  public setUserId(userId: string | null) {
    this.userId = userId;
  }

  public setConsent(consent: Partial<TelemetryConsent>) {
    this.consent = { ...this.consent, ...consent };
    if (typeof window !== "undefined") {
      localStorage.setItem("ngetag_user_consent", JSON.stringify(this.consent));
    }
    if (this.consent.geoConsent) {
      this.refreshGeolocation();
    }
  }

  public getConsent(): TelemetryConsent {
    return this.consent;
  }

  private loadConsentFromStorage() {
    try {
      const stored = localStorage.getItem("ngetag_user_consent");
      if (stored) {
        this.consent = JSON.parse(stored);
      }
    } catch {
      // Fallback to default
    }
  }

  public refreshGeolocation(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.consent.geoConsent || !navigator.geolocation) {
        this.cachedLocation = null;
        resolve();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.cachedLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: Date.now(),
          };
          resolve();
        },
        () => {
          this.cachedLocation = null;
          resolve();
        },
        { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false }
      );
    });
  }

  public track(options: TrackEventOptions) {
    if (!this.consent.telemetry) return;

    // Use cached location if fresh (< 5 mins) and allowed
    let geo = undefined;
    if (
      this.consent.geoConsent &&
      this.cachedLocation &&
      Date.now() - this.cachedLocation.timestamp < 300000
    ) {
      geo = {
        latitude: this.cachedLocation.lat,
        longitude: this.cachedLocation.lng,
        accuracy: this.cachedLocation.accuracy,
      };
    }

    const event: QueuedEvent = {
      eventType: options.eventType,
      path: typeof window !== "undefined" ? window.location.pathname : "/",
      metadata: options.metadata || {},
      clientTimestamp: new Date().toISOString(),
      ...geo,
    };

    this.queue.push(event);

    if (options.immediate || this.queue.length >= 10) {
      this.flush();
    } else if (!this.flushTimer) {
      // Periodic buffer flush every 5 seconds
      this.flushTimer = setTimeout(() => this.flush(), 5000);
    }
  }

  public flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) return;

    const eventsToFlush = [...this.queue];
    this.queue = [];

    const payload = JSON.stringify({
      events: eventsToFlush,
      consent: {
        ipConsent: this.consent.ipConsent,
        geoConsent: this.consent.geoConsent,
      },
      userId: this.userId,
    });

    // Resolves to NEXT_PUBLIC_API_URL if configured, otherwise uses relative path
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
    const endpoint = `${apiBase}/api/telemetry/useractivitytracker`;
    const isCrossOrigin = !!apiBase && typeof window !== "undefined" && !apiBase.includes(window.location.host);

    // 1. For cross-origin with credentials, standard fetch is preferred because
    // sendBeacon cannot reliably send cross-origin credentials (cookies) in all browsers.
    if (!isCrossOrigin && typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const success = navigator.sendBeacon(endpoint, blob);
      if (success) return;
    }

    // 2. Fetch with keepalive and credentials enabled
    if (typeof fetch !== "undefined") {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
        credentials: "include", // Required to pass and receive ngetag_sid cookies across ports
      }).catch(() => {
        // Silently swallow network anomalies for telemetry to prevent UI disruption
      });
    }
  }

  private setupLifecycleListeners() {
    // Flush when page unloads or user switches tabs
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flush();
      }
    });

    window.addEventListener("pagehide", () => this.flush());
  }
}

export const tracker = new TelemetryClient();