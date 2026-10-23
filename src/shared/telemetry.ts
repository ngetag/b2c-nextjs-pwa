/**
 * Shared telemetry vocabulary for the NgeTag customer web app.
 *
 * These constants are the single source of truth used by:
 * - the PostgreSQL enums in `src/db/telemetry.schema.ts`,
 * - the Zod validation schemas in `src/schemas/telemetry.schema.ts`,
 * - the client-side tracker (`src/lib/telemetry/client.ts`),
 * - the asynchronous ingest pipeline (`src/server/telemetry/*`).
 */

/**
 * Every user interaction the customer web app can record.
 *
 * Keep this list additive: renaming a value requires a database migration
 * because the values are persisted as a PostgreSQL enum.
 */
export const TELEMETRY_EVENT_TYPES = [
  /** Generic route impression (`surface` holds the pathname). */
  "page_view",
  /** A spot detail page was opened. */
  "spot_view",
  /** An event detail page was opened. */
  "event_view",
  /** A community detail page was opened. */
  "community_view",
  /** A promo card/detail was opened. */
  "promo_view",
  /** A blog article was opened. */
  "blog_view",
  /** A Hype reel/carousel was opened. */
  "hype_view",
  /** A search query was submitted. */
  "search",
  /** A tag chip or tag landing page was used. */
  "tag_click",
  /** A discovery filter was applied in search/explore. */
  "filter_apply",
  /** A location/QR code was scanned from the in-app scanner. */
  "qr_scan",
  /** Spot or event saved. */
  "bookmark_add",
  /** Saved item removed. */
  "bookmark_remove",
  /** Event added to the personal calendar. */
  "attendance_add",
  /** Event removed from the personal calendar. */
  "attendance_remove",
  /** Community joined. */
  "membership_add",
  /** Community left. */
  "membership_remove",
  /** A review was submitted. */
  "review_create",
  /** A review was marked helpful. */
  "review_helpful",
  /** Content shared to another app. */
  "share",
  /** Measured dwell time on a detail surface (value = milliseconds). */
  "dwell",
  /** Recommendation slot rendered (impression logging). */
  "recommendation_impression",
  /** Recommendation card opened. */
  "recommendation_click",
  /** Directions/maps action triggered for a spot or event. */
  "spot_directions",
  /** Account created. */
  "signup",
  /** Signed in with password or OAuth. */
  "login",
] as const;

/** All telemetry event types. */
export type TelemetryEventType = (typeof TELEMETRY_EVENT_TYPES)[number];

/** Client surface that produced the event. */
export const TELEMETRY_SOURCES = [
  "web",
  "pwa",
  "qr",
  "api",
  "system",
] as const;

/** Client surface that produced the event. */
export type TelemetrySource = (typeof TELEMETRY_SOURCES)[number];

/** Entity type an activity event refers to. */
export const TELEMETRY_TARGET_TYPES = [
  "spot",
  "event",
  "community",
  "promo",
  "blog",
  "hype",
  "tag",
  "interest",
  "review",
  "search",
  "page",
  "spot_collection",
] as const;

/** Entity type an activity event refers to. */
export type TelemetryTargetType = (typeof TELEMETRY_TARGET_TYPES)[number];

/** Content types that can be embedded for the recommendation engine. */
export const CONTENT_OWNER_TYPES = [
  "spot",
  "event",
  "community",
  "promo",
  "blog",
  "hype",
] as const;

/** Content types that can be embedded for the recommendation engine. */
export type ContentOwnerType = (typeof CONTENT_OWNER_TYPES)[number];

/**
 * Embedding dimensionality. 384 matches common small sentence-transformer
 * models (e.g. `all-MiniLM-L6-v2`) and keeps the HNSW index small.
 * The deterministic local embedder also produces 384 dimensions so the
 * pipeline works without any external inference service.
 */
export const EMBEDDING_DIMENSIONS = 384;

/**
 * Implicit-feedback weight per event type. These numbers feed the taste
 * vector aggregation (higher = stronger preference signal).
 */
export const TELEMETRY_EVENT_WEIGHTS: Record<TelemetryEventType, number> = {
  page_view: 0.2,
  spot_view: 1,
  event_view: 1,
  community_view: 0.8,
  promo_view: 0.7,
  blog_view: 0.6,
  hype_view: 0.6,
  search: 0.9,
  tag_click: 1.2,
  filter_apply: 0.5,
  qr_scan: 1.6,
  bookmark_add: 2.5,
  bookmark_remove: -1.2,
  attendance_add: 3,
  attendance_remove: -1.5,
  membership_add: 2.2,
  membership_remove: -1,
  review_create: 3.5,
  review_helpful: 1.1,
  share: 2,
  dwell: 0.35,
  recommendation_impression: 0.05,
  recommendation_click: 1.4,
  spot_directions: 2,
  signup: 0.4,
  login: 0.1,
};

/**
 * A single telemetry event as accepted by `POST /api/telemetry/events`.
 * Unknown properties are rejected by Zod so typos are caught early.
 */
export interface TelemetryEventInput {
  /** Client-generated idempotency key (uuid). */
  id?: string;
  /** Customer id when the request is authenticated. Filled in server-side. */
  customerId?: string | null;
  /** Stable device/browser identifier for anonymous visitors. */
  anonymousId?: string;
  /** Client session identifier (rotates every 30 minutes of inactivity). */
  sessionId?: string;
  eventType: TelemetryEventType;
  targetType?: TelemetryTargetType | null;
  targetId?: string | null;
  /** Route/pathname or UI surface name, e.g. `/spots/coffee-xyz`. */
  surface?: string | null;
  /** Tag ids involved in the interaction (used to build taste vectors). */
  tagIds?: string[];
  /** Interest ids involved in the interaction. */
  interestIds?: string[];
  /** Raw numeric value: dwell ms, search result count, rating, price, etc. */
  value?: number | null;
  /** Free-form payload; capped at 2 KB by the API. */
  metadata?: Record<string, unknown>;
  latitude?: number | null;
  longitude?: number | null;
  source?: TelemetrySource;
  /** ISO timestamp generated on the client. Defaults to server receive time. */
  occurredAt?: string;
}

/** A telemetry event after ingestion/normalisation. */
export interface StoredTelemetryEvent
  extends Omit<TelemetryEventInput, "occurredAt" | "receivedAt"> {
  id: string;
  /** Server-normalised timestamp (always present after ingest). */
  occurredAt: string;
  anonymousId?: string;
  receivedAt: string;
  /** Aggregate weight used for taste-vector updates. */
  weight: number;
  /** Denormalised pgvector embedding of the interaction context. */
  embedding?: number[];
}

/** Persisted taste profile used by the vector recommender. */
export interface TasteVector {
  /** `cust:<customerId>` or `anon:<anonymousId>`. */
  ownerKey: string;
  customerId: string | null;
  anonymousId: string | null;
  embedding: number[];
  tagWeights: Record<string, number>;
  interestWeights: Record<string, number>;
  eventCount: number;
  lastEventAt: string;
  updatedAt: string;
}

/** Content embedding row used for cosine similarity lookups. */
export interface ContentEmbedding {
  id: string;
  ownerType: ContentOwnerType;
  ownerId: string;
  embedding: number[];
  tags: string[];
  interestIds?: string[];
  city?: string;
  latitude?: number;
  longitude?: number;
  contentHash: string;
  updatedAt: string;
}

/** Aggregated telemetry stats for dashboards and debugging. */
export interface TelemetrySummary {
  totalEvents: number;
  uniqueVisitors: number;
  eventsByType: Record<string, number>;
  topTargets: Array<{
    targetType: string;
    targetId: string;
    count: number;
  }>;
  topTags: Array<{ tagId: string; count: number }>;
  lastEventAt: string | null;
  bufferedEvents: number;
  /** Whether events are persisted to PostgreSQL or only kept in memory. */
  storage: "postgres" | "memory";
}

/** Result of a vector similarity query. */
export interface SimilarContentMatch {
  ownerType: ContentOwnerType;
  ownerId: string;
  score: number;
  tags: string[];
}

/** A hydrated recommendation returned by `/api/recommendations/for-you`. */
export interface RecommendationItem {
  ownerType: ContentOwnerType;
  ownerId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  href: string;
  /** Cosine similarity in `[0, 1]` (or the raw similarity for similar items). */
  score: number;
  tagIds: string[];
  /** Why this item was recommended. */
  reason: "taste-vector" | "cold-start" | "trending" | "similar-content";
}

/** Explanation payload included when `debug=true` is requested. */
export interface RecommendationProfile {
  source: "taste-vector" | "cold-start" | "trending";
  ownerKey: string | null;
  dimensions: number;
  eventCount: number;
  topTags: Array<{ tagId: string; weight: number }>;
  topInterests: Array<{ interestId: string; weight: number }>;
}

/** Response body of `GET /api/recommendations/for-you`. */
export interface ForYouResponse {
  items: RecommendationItem[];
  profile: RecommendationProfile;
  generatedAt: string;
  storage: "postgres" | "memory";
}
