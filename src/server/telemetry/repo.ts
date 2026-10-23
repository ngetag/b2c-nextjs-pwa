import { and, desc, eq, inArray, sql } from "drizzle-orm";
import {
  contentEmbeddings,
  customerTasteVectors,
  telemetryEvents,
} from "@/db/telemetry.schema";
import {
  EMBEDDING_DIMENSIONS,
  type ContentEmbedding,
  type ContentOwnerType,
  type SimilarContentMatch,
  type StoredTelemetryEvent,
  type TasteVector,
  type TelemetryEventType,
  type TelemetrySource,
  type TelemetrySummary,
  type TelemetryTargetType,
} from "@/shared/telemetry";
import { isDatabaseConfigured, getDb } from "@/server/db/client";
import { cosineSimilarity, parsePgVector, toPgVector } from "./embedding";
import { memoryAppendEvents, memoryEventCount, telemetryMemory } from "./memory";

/** Query options for `listEvents`. */
export interface ListEventsQuery {
  customerId?: string;
  anonymousId?: string;
  eventType?: TelemetryEventType;
  targetType?: TelemetryTargetType;
  targetId?: string;
  limit?: number;
}

/** Vector similarity query used by the recommender. */
export interface SimilarityQuery {
  embedding: number[];
  ownerTypes?: ContentOwnerType[];
  limit?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  /** `type:id` keys to exclude (e.g. the item being viewed). */
  excludeKeys?: string[];
}

/** Aggregates that exclude runtime-only counters. */
export type TelemetrySummaryCore = Omit<
  TelemetrySummary,
  "storage" | "bufferedEvents"
>;

/** Persistence contract for telemetry data (memory + PostgreSQL). */
export interface TelemetryRepository {
  readonly kind: "memory" | "postgres";
  persistEvents(events: StoredTelemetryEvent[]): Promise<void>;
  listEvents(query?: ListEventsQuery): Promise<StoredTelemetryEvent[]>;
  getTaste(ownerKey: string): Promise<TasteVector | null>;
  saveTaste(taste: TasteVector): Promise<void>;
  listTastes(): Promise<TasteVector[]>;
  saveContentEmbeddings(rows: ContentEmbedding[]): Promise<void>;
  listContentEmbeddings(
    ownerTypes?: ContentOwnerType[],
  ): Promise<ContentEmbedding[]>;
  findSimilarContent(query: SimilarityQuery): Promise<SimilarContentMatch[]>;
  getSummary(): Promise<TelemetrySummaryCore>;
}

/** Haversine distance in km (used for the in-memory geo filter). */
function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number | null | undefined,
  bLng: number | null | undefined,
): number | null {
  if (bLat == null || bLng == null) return null;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function emptyVector(): number[] {
  return new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
}

/**
 * Aggregates raw events into the summary shape shared by
 * `GET /api/telemetry/summary`.
 */
function summarize(events: StoredTelemetryEvent[]): TelemetrySummaryCore {
  const eventsByType: Record<string, number> = {};
  const targetCounts = new Map<string, { targetType: string; targetId: string; count: number }>();
  const tagCounts = new Map<string, number>();
  const visitors = new Set<string>();
  let lastEventAt: string | null = null;

  for (const event of events) {
    eventsByType[event.eventType] = (eventsByType[event.eventType] ?? 0) + 1;
    visitors.add(event.customerId ?? event.anonymousId ?? "unknown");

    if (event.targetType && event.targetId) {
      const key = `${event.targetType}:${event.targetId}`;
      const current = targetCounts.get(key);
      if (current) current.count += 1;
      else
        targetCounts.set(key, {
          targetType: event.targetType,
          targetId: event.targetId,
          count: 1,
        });
    }

    for (const tagId of event.tagIds ?? []) {
      tagCounts.set(tagId, (tagCounts.get(tagId) ?? 0) + 1);
    }

    if (!lastEventAt || event.occurredAt > lastEventAt) {
      lastEventAt = event.occurredAt;
    }
  }

  return {
    totalEvents: events.length,
    uniqueVisitors: visitors.size,
    eventsByType,
    topTargets: [...targetCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    topTags: [...tagCounts.entries()]
      .map(([tagId, count]) => ({ tagId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    lastEventAt,
  };
}

// ============================================================================
// In-memory repository
// ============================================================================

const memoryRepo: TelemetryRepository = {
  kind: "memory",

  async persistEvents(events) {
    memoryAppendEvents(events);
  },

  async listEvents(query = {}) {
    const limit = query.limit ?? 50;
    return telemetryMemory()
      .events.filter((event) => {
        if (query.customerId && event.customerId !== query.customerId) {
          return false;
        }
        if (query.anonymousId && event.anonymousId !== query.anonymousId) {
          return false;
        }
        if (query.eventType && event.eventType !== query.eventType) return false;
        if (query.targetType && event.targetType !== query.targetType) {
          return false;
        }
        if (query.targetId && event.targetId !== query.targetId) return false;
        return true;
      })
      .slice(-limit)
      .reverse();
  },

  async getTaste(ownerKey) {
    const taste = telemetryMemory().tastes.get(ownerKey);
    return taste ? structuredClone(taste) : null;
  },

  async saveTaste(taste) {
    telemetryMemory().tastes.set(taste.ownerKey, structuredClone(taste));
  },

  async listTastes() {
    return [...telemetryMemory().tastes.values()].map((taste) =>
      structuredClone(taste),
    );
  },

  async saveContentEmbeddings(rows) {
    for (const row of rows) {
      telemetryMemory().contents.set(`${row.ownerType}:${row.ownerId}`, row);
    }
  },

  async listContentEmbeddings(ownerTypes) {
    return [...telemetryMemory().contents.values()].filter(
      (row) => !ownerTypes || ownerTypes.includes(row.ownerType),
    );
  },

  async findSimilarContent(query) {
    const limit = query.limit ?? 10;
    const exclude = new Set(query.excludeKeys ?? []);
    const radius = query.radiusKm ?? 25;

    const matches: SimilarContentMatch[] = [];

    for (const row of telemetryMemory().contents.values()) {
      if (query.ownerTypes && !query.ownerTypes.includes(row.ownerType)) continue;
      const key = `${row.ownerType}:${row.ownerId}`;
      if (exclude.has(key)) continue;

      if (query.lat != null && query.lng != null) {
        const distance = distanceKm(
          query.lat,
          query.lng,
          row.latitude ?? null,
          row.longitude ?? null,
        );
        if (distance != null && distance > radius) continue;
      }

      matches.push({
        ownerType: row.ownerType,
        ownerId: row.ownerId,
        score: cosineSimilarity(query.embedding, row.embedding),
        tags: row.tags,
      });
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, limit);
  },

  async getSummary() {
    return summarize(
      telemetryMemory().events.slice(-5000),
    );
  },
};

// ============================================================================
// PostgreSQL repository (pgvector + PostGIS)
// ============================================================================

type TelemetryEventRow = typeof telemetryEvents.$inferSelect;

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapEventRow(row: TelemetryEventRow): StoredTelemetryEvent {
  return {
    id: row.id,
    customerId: row.customerId,
    anonymousId: row.anonymousId ?? undefined,
    sessionId: row.sessionId ?? undefined,
    eventType: row.eventType as TelemetryEventType,
    targetType: (row.targetType as TelemetryTargetType | null) ?? null,
    targetId: row.targetId,
    surface: row.surface,
    tagIds: row.tagIds ?? [],
    interestIds: row.interestIds ?? [],
    value: row.value,
    weight: row.weight,
    metadata: row.metadata ?? undefined,
    source: row.source as TelemetrySource,
    latitude: row.latitude,
    longitude: row.longitude,
    embedding: row.embedding ? parsePgVector(row.embedding) : undefined,
    occurredAt: iso(row.occurredAt),
    receivedAt: iso(row.receivedAt),
  };
}

const postgresRepo: TelemetryRepository = {
  kind: "postgres",

  async persistEvents(events) {
    if (events.length === 0) return;
    const db = await getDb();

    await db.insert(telemetryEvents).values(
      events.map((event) => ({
        id: event.id,
        customerId: event.customerId ?? null,
        anonymousId: event.anonymousId ?? null,
        sessionId: event.sessionId ?? null,
        eventType: event.eventType,
        targetType: event.targetType ?? null,
        targetId: event.targetId ?? null,
        surface: event.surface ?? null,
        tagIds: event.tagIds ?? [],
        interestIds: event.interestIds ?? [],
        value: event.value ?? null,
        weight: event.weight,
        metadata: event.metadata,
        source: event.source ?? "web",
        latitude: event.latitude ?? null,
        longitude: event.longitude ?? null,
        location:
          event.latitude != null && event.longitude != null
            ? { x: event.longitude, y: event.latitude }
            : null,
        embedding: event.embedding ?? emptyVector(),
        occurredAt: new Date(event.occurredAt ?? Date.now()),
      })),
    );
  },

  async listEvents(query = {}) {
    const db = await getDb();
    const conditions = [];
    if (query.customerId) {
      conditions.push(eq(telemetryEvents.customerId, query.customerId));
    }
    if (query.anonymousId) {
      conditions.push(eq(telemetryEvents.anonymousId, query.anonymousId));
    }
    if (query.eventType) {
      conditions.push(eq(telemetryEvents.eventType, query.eventType));
    }
    if (query.targetType) {
      conditions.push(eq(telemetryEvents.targetType, query.targetType));
    }
    if (query.targetId) {
      conditions.push(eq(telemetryEvents.targetId, query.targetId));
    }

    const rows = await db
      .select()
      .from(telemetryEvents)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(telemetryEvents.occurredAt))
      .limit(query.limit ?? 50);

    return rows.map(mapEventRow);
  },

  async getTaste(ownerKey) {
    const db = await getDb();
    const rows = await db
      .select()
      .from(customerTasteVectors)
      .where(eq(customerTasteVectors.ownerKey, ownerKey))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];

    return {
      ownerKey: row.ownerKey,
      customerId: row.customerId,
      anonymousId: row.anonymousId,
      embedding: parsePgVector(row.embedding),
      tagWeights: row.tagWeights ?? {},
      interestWeights: row.interestWeights ?? {},
      eventCount: row.eventCount,
      lastEventAt: row.lastEventAt?.toISOString() ?? row.updatedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  },

  async saveTaste(taste) {
    const db = await getDb();
    const values = {
      id: taste.ownerKey,
      ownerKey: taste.ownerKey,
      customerId: taste.customerId,
      anonymousId: taste.anonymousId,
      embedding: taste.embedding,
      tagWeights: taste.tagWeights,
      interestWeights: taste.interestWeights,
      eventCount: taste.eventCount,
      latitude: null as number | null,
      longitude: null as number | null,
      lastEventAt: new Date(taste.lastEventAt),
      updatedAt: new Date(taste.updatedAt),
    };

    await db
      .insert(customerTasteVectors)
      .values(values)
      .onConflictDoUpdate({
        target: customerTasteVectors.ownerKey,
        set: {
          embedding: values.embedding,
          tagWeights: values.tagWeights,
          interestWeights: values.interestWeights,
          eventCount: values.eventCount,
          lastEventAt: values.lastEventAt,
          updatedAt: values.updatedAt,
        },
      });
  },

  async listTastes() {
    const db = await getDb();
    const rows = await db.select().from(customerTasteVectors);
    return rows.map((row) => ({
      ownerKey: row.ownerKey,
      customerId: row.customerId,
      anonymousId: row.anonymousId,
      embedding: parsePgVector(row.embedding),
      tagWeights: row.tagWeights ?? {},
      interestWeights: row.interestWeights ?? {},
      eventCount: row.eventCount,
      lastEventAt: row.lastEventAt?.toISOString() ?? row.updatedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  },

  async saveContentEmbeddings(rows) {
    if (rows.length === 0) return;
    const db = await getDb();

    for (const row of rows) {
      const values = {
        id: `${row.ownerType}:${row.ownerId}`,
        ownerType: row.ownerType,
        ownerId: row.ownerId,
        embedding: row.embedding,
        tags: row.tags,
        interestIds: [] as string[],
        city: null as string | null,
        latitude: null as number | null,
        longitude: null as number | null,
        contentHash: row.contentHash,
        updatedAt: new Date(row.updatedAt),
      };

      await db
        .insert(contentEmbeddings)
        .values(values)
        .onConflictDoUpdate({
          target: [contentEmbeddings.ownerType, contentEmbeddings.ownerId],
          set: {
            embedding: values.embedding,
            tags: values.tags,
            contentHash: values.contentHash,
            updatedAt: values.updatedAt,
          },
        });
    }
  },

  async listContentEmbeddings(ownerTypes) {
    const db = await getDb();
    const rows = await db
      .select()
      .from(contentEmbeddings)
      .where(
        ownerTypes && ownerTypes.length > 0
          ? inArray(contentEmbeddings.ownerType, ownerTypes)
          : undefined,
      );

    return rows.map((row) => ({
      id: row.id,
      ownerType: row.ownerType,
      ownerId: row.ownerId,
      embedding: parsePgVector(row.embedding),
      tags: row.tags,
      contentHash: row.contentHash,
      updatedAt: row.updatedAt.toISOString(),
    }));
  },

  async findSimilarContent(query) {
    const db = await getDb();
    const limit = query.limit ?? 10;
    const ownerTypes = query.ownerTypes ?? [];
    const vector = toPgVector(query.embedding);
    const excludes = query.excludeKeys ?? [];

    try {
      const typeClause =
        ownerTypes.length > 0
          ? sql`AND owner_type::text IN (${sql.join(
              ownerTypes.map((type) => sql`${type}`),
              sql`, `,
            )})`
          : sql``;

      const excludeClause =
        excludes.length > 0
          ? sql`AND (owner_type::text || ':' || owner_id) NOT IN (${sql.join(
              excludes.map((key) => sql`${key}`),
              sql`, `,
            )})`
          : sql``;

      const geoClause =
        query.lat != null && query.lng != null
          ? sql`AND (
              location IS NULL OR ST_DWithin(
                location::geography,
                ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography,
                ${(query.radiusKm ?? 25) * 1000}
              )
            )`
          : sql``;

      const result = (await db.execute(sql`
        SELECT owner_type, owner_id, tags,
               1 - (embedding <=> ${vector}::vector) AS score
        FROM content_embeddings
        WHERE 1 = 1
        ${typeClause}
        ${excludeClause}
        ${geoClause}
        ORDER BY embedding <=> ${vector}::vector
        LIMIT ${limit}
      `)) as unknown as {
        rows: Array<{
          owner_type: ContentOwnerType;
          owner_id: string;
          tags: string[] | null;
          score: number | string;
        }>;
      };

      return result.rows.map((row) => ({
        ownerType: row.owner_type,
        ownerId: row.owner_id,
        score: Number(row.score),
        tags: row.tags ?? [],
      }));
    } catch (error) {
      // pgvector/PostGIS may be unavailable (e.g. managed PG without the
      // extension). Fall back to exact cosine search in Node.
      console.warn(
        "[ngetag/telemetry] pgvector query failed, falling back to in-process cosine search",
        error,
      );
      const rows = await postgresRepo.listContentEmbeddings(ownerTypes);
      const exclude = new Set(excludes);
      return rows
        .filter((row) => !exclude.has(`${row.ownerType}:${row.ownerId}`))
        .map((row) => ({
          ownerType: row.ownerType,
          ownerId: row.ownerId,
          score: cosineSimilarity(query.embedding, row.embedding),
          tags: row.tags,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }
  },

  async getSummary() {
    return summarize(await postgresRepo.listEvents({ limit: 5000 }));
  },
};

/**
 * Returns the active telemetry repository.
 *
 * PostgreSQL is used when `DATABASE_URL` is configured (pgvector + PostGIS for
 * similarity and geo filtering); otherwise everything stays in memory so the
 * demo remains fully functional.
 */
export function getTelemetryRepo(): TelemetryRepository {
  return isDatabaseConfigured() ? postgresRepo : memoryRepo;
}

/** Whether telemetry events are persisted to PostgreSQL. */
export function telemetryStorageKind(): "postgres" | "memory" {
  return isDatabaseConfigured() ? "postgres" : "memory";
}

/** Memory store size (useful for debugging without PostgreSQL). */
export function memoryStoredEventCount(): number {
  return memoryEventCount();
}

/** Direct access to the memory event count (tests / debugging). */
export function memoryEventTotal(): number {
  return telemetryMemory().events.length;
}
