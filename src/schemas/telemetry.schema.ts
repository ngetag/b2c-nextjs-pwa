import { z } from "zod";
import {
  TELEMETRY_EVENT_TYPES,
  TELEMETRY_SOURCES,
  TELEMETRY_TARGET_TYPES,
} from "@/shared/telemetry";

export const telemetryEventTypeSchema = z.enum(TELEMETRY_EVENT_TYPES);
export const telemetrySourceSchema = z.enum(TELEMETRY_SOURCES);
export const telemetryTargetTypeSchema = z.enum(TELEMETRY_TARGET_TYPES);

const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true, message: "Timestamp harus ISO-8601" });

/**
 * A single activity event accepted by `POST /api/telemetry/events`.
 *
 * The client SDK (`src/lib/telemetry/client.ts`) fills `anonymousId` and
 * `sessionId` automatically. Client `customerId` aliases are accepted for
 * compatibility but discarded; ownership always comes from the verified JWT.
 */
export const telemetryEventSchema = z
  .strictObject({
    id: z.string().min(8).max(64).optional(),
    customerId: z.string().max(64).optional(),
    customer_id: z.string().max(64).optional(),
    anonymousId: z.string().min(8).max(64).optional(),
    sessionId: z.string().min(8).max(64).optional(),
    eventType: telemetryEventTypeSchema,
    targetType: telemetryTargetTypeSchema.nullish(),
    targetId: z.string().max(128).nullish(),
    surface: z.string().max(255).nullish(),
    tagIds: z.array(z.string().min(1)).max(30).optional().default([]),
    interestIds: z.array(z.string().min(1)).max(20).optional().default([]),
    value: z.number().finite().nullish(),
    metadata: z
      .record(z.string(), z.unknown())
      .refine(
        (value) => JSON.stringify(value).length <= 2048,
        "metadata maksimal 2 KB",
      )
      .optional(),
    latitude: z.number().min(-90).max(90).nullish(),
    longitude: z.number().min(-180).max(180).nullish(),
    source: telemetrySourceSchema.optional().default("web"),
    occurredAt: isoDateTimeSchema.optional(),
  })
  .transform((event) => {
    const normalized = { ...event };
    delete normalized.customerId;
    delete normalized.customer_id;
    return normalized;
  })
  .refine(
    (event) =>
      (event.latitude === undefined ||
        event.latitude === null ||
        event.longitude !== undefined) &&
      (event.longitude === undefined ||
        event.longitude === null ||
        event.latitude !== undefined),
    { message: "latitude dan longitude harus dikirim berpasangan" },
  );

/** Batch envelope — max 50 events per request keeps payloads small. */
export const telemetryBatchSchema = z.strictObject({
  events: z.array(telemetryEventSchema).min(1).max(50),
});

/** Query for `GET /api/telemetry/events`. */
export const telemetryEventsQuerySchema = z.object({
  eventType: telemetryEventTypeSchema.optional(),
  targetType: telemetryTargetTypeSchema.optional(),
  targetId: z.string().max(128).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  /** `me` (JWT) or an anonymous id. Defaults to the JWT subject. */
  owner: z.string().max(80).optional(),
});

/** Query for `GET /api/telemetry/profile`. */
export const telemetryProfileQuerySchema = z.object({
  anonymousId: z.string().min(8).max(64).optional(),
});

/** Query for `GET /api/recommendations/for-you`. */
export const forYouQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(24).default(8),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  anonymousId: z.string().min(8).max(64).optional(),
  types: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined,
    ),
  /** Include the taste profile explanation in the response. */
  debug: z.coerce.boolean().optional().default(false),
});

/** Query for `GET /api/recommendations/similar`. */
export const similarContentQuerySchema = z.object({
  ownerType: telemetryTargetTypeSchema.optional().default("spot"),
  ownerId: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(24).default(8),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export type TelemetryEventPayload = z.infer<typeof telemetryEventSchema>;
export type TelemetryBatchPayload = z.infer<typeof telemetryBatchSchema>;
