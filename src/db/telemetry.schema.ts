import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  vector,
  geometry,
} from "drizzle-orm/pg-core";
import {
  CONTENT_OWNER_TYPES,
  EMBEDDING_DIMENSIONS,
  TELEMETRY_EVENT_TYPES,
  TELEMETRY_SOURCES,
  TELEMETRY_TARGET_TYPES,
} from "@/shared/telemetry";
import { customers } from "./schema";

// ============================================================================
// Telemetry enums
// ============================================================================

export const telemetryEventTypeEnum = pgEnum(
  "telemetry_event_type",
  TELEMETRY_EVENT_TYPES,
);

export const telemetrySourceEnum = pgEnum(
  "telemetry_source",
  TELEMETRY_SOURCES,
);

export const telemetryTargetTypeEnum = pgEnum(
  "telemetry_target_type",
  TELEMETRY_TARGET_TYPES,
);

export const contentOwnerTypeEnum = pgEnum(
  "content_owner_type",
  CONTENT_OWNER_TYPES,
);

// ============================================================================
// 1. Raw activity stream (append-only, asynchronous writes)
// ============================================================================

/**
 * `telemetry_events` — append-only stream of customer interactions.
 *
 * Rows are inserted asynchronously *after* the API response is sent, so the
 * customer-facing latency of tracking calls stays close to zero. Each row
 * carries a denormalised 384-dimension embedding of the interaction context;
 * that lets the recommender compute "similar interactions" cheaply, while the
 * aggregated taste profile lives in `customer_taste_vectors`.
 *
 * Requires the `vector` (pgvector) and `postgis` extensions:
 * `CREATE EXTENSION IF NOT EXISTS vector; CREATE EXTENSION IF NOT EXISTS postgis;`
 */
export const telemetryEvents = pgTable(
  "telemetry_events",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    customerId: varchar("customer_id", { length: 64 }).references(
      () => customers.id,
      { onDelete: "set null" },
    ),
    anonymousId: varchar("anonymous_id", { length: 64 }),
    sessionId: varchar("session_id", { length: 64 }),
    eventType: telemetryEventTypeEnum("event_type").notNull(),
    targetType: telemetryTargetTypeEnum("target_type"),
    targetId: varchar("target_id", { length: 128 }),
    surface: varchar("surface", { length: 255 }),
    tagIds: jsonb("tag_ids").$type<string[]>().notNull().default([]),
    interestIds: jsonb("interest_ids").$type<string[]>().notNull().default([]),
    /** Numeric payload: dwell ms, search result count, rating, price, ... */
    value: real("value"),
    /** Implicit-feedback weight derived from `TELEMETRY_EVENT_WEIGHTS`. */
    weight: real("weight").notNull().default(1),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    source: telemetrySourceEnum("source").notNull().default("web"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    /** PostGIS point (SRID 4326) for geo-aware vector search. */
    location: geometry("location", { type: "point", mode: "xy", srid: 4326 }),
    /** pgvector embedding of the interaction (content + tags + surface). */
    embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }),
    userAgent: text("user_agent"),
    ipHash: varchar("ip_hash", { length: 64 }),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("telemetry_events_customer_time_idx").on(
      table.customerId,
      table.occurredAt,
    ),
    index("telemetry_events_anon_time_idx").on(
      table.anonymousId,
      table.occurredAt,
    ),
    index("telemetry_events_type_time_idx").on(
      table.eventType,
      table.occurredAt,
    ),
    index("telemetry_events_target_idx").on(
      table.targetType,
      table.targetId,
    ),
    // Approximate nearest neighbour index (cosine distance).
    index("telemetry_events_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
    // Geo index for "activity near me" queries.
    index("telemetry_events_location_idx").using("gist", table.location),
  ],
);

// ============================================================================
// 2. Aggregated taste profile (one row per customer / anonymous device)
// ============================================================================

/**
 * `customer_taste_vectors` — decaying taste profile per visitor.
 *
 * Updated asynchronously whenever new activity arrives. The embedding is a
 * weighted mean of the customer's interaction embeddings, blended with the
 * onboarding signal (selected interests and favourite tags).
 */
export const customerTasteVectors = pgTable(
  "customer_taste_vectors",
  {
    id: varchar("id", { length: 80 }).primaryKey(),
    /** `cust:<customerId>` or `anon:<anonymousId>`. */
    ownerKey: varchar("owner_key", { length: 80 }).notNull(),
    customerId: varchar("customer_id", { length: 64 }).references(
      () => customers.id,
      { onDelete: "cascade" },
    ),
    anonymousId: varchar("anonymous_id", { length: 64 }),
    embedding: vector("embedding", {
      dimensions: EMBEDDING_DIMENSIONS,
    }).notNull(),
    /** Decayed tag affinity — `{ [tagId]: weight }`. */
    tagWeights: jsonb("tag_weights")
      .$type<Record<string, number>>()
      .notNull()
      .default({}),
    /** Decayed interest affinity — `{ [interestId]: weight }`. */
    interestWeights: jsonb("interest_weights")
      .$type<Record<string, number>>()
      .notNull()
      .default({}),
    eventCount: integer("event_count").notNull().default(0),
    /** Last known coordinates (also denormalised into PostGIS). */
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    location: geometry("location", { type: "point", mode: "xy", srid: 4326 }),
    lastEventAt: timestamp("last_event_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("customer_taste_vectors_owner_key_idx").on(table.ownerKey),
    index("customer_taste_vectors_customer_idx").on(table.customerId),
    index("customer_taste_vectors_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
    index("customer_taste_vectors_location_idx").using("gist", table.location),
  ],
);

// ============================================================================
// 3. Embeddable content catalogue
// ============================================================================

/**
 * `content_embeddings` — vector representation of every recommendable item
 * (spot, event, community, promo, blog article, hype item).
 *
 * Recomputed by `src/server/telemetry/content-index.ts` whenever content is
 * created/updated, and used together with taste vectors for hybrid ranking:
 * `score = cosine(taste, content) + geo proximity + tag overlap`.
 */
export const contentEmbeddings = pgTable(
  "content_embeddings",
  {
    id: varchar("id", { length: 80 }).primaryKey(),
    ownerType: contentOwnerTypeEnum("owner_type").notNull(),
    ownerId: varchar("owner_id", { length: 64 }).notNull(),
    embedding: vector("embedding", {
      dimensions: EMBEDDING_DIMENSIONS,
    }).notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    interestIds: jsonb("interest_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    city: varchar("city", { length: 128 }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    location: geometry("location", { type: "point", mode: "xy", srid: 4326 }),
    /** Hash of the source fields — skips redundant re-embedding. */
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("content_embeddings_owner_idx").on(
      table.ownerType,
      table.ownerId,
    ),
    index("content_embeddings_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
    index("content_embeddings_city_idx").on(table.city),
    index("content_embeddings_location_idx").using("gist", table.location),
  ],
);
