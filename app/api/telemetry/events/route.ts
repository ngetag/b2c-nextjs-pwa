import { after } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { hashIp } from "@/lib/auth/password";
import { getAuthContext, getRequestIp } from "@/lib/auth/session";
import { requireAuth } from "@/lib/auth/guards";
import { readNumberParam } from "@/lib/url";
import { telemetryBatchSchema, telemetryEventsQuerySchema } from "@/schemas";
import {
  enqueueTelemetryEvents,
  flushTelemetry,
  getBufferedEventCount,
} from "@/server/telemetry/tracker";
import { getTelemetryRepo, telemetryStorageKind } from "@/server/telemetry/repo";
import type { TelemetryEventInput } from "@/shared/telemetry";

/**
 * POST /api/telemetry/events — Ingest event aktivitas (asinkron)
 *
 * Menerima 1–50 event tervalidasi dan langsung mengembalikan `202 Accepted`. Persistensi
 * ke PostgreSQL dan pembaruan taste vector dilakukan setelah response via `after()`.
 * Event menyimpan embedding 384 dimensi; identitas customer diambil dari JWT, bukan dari
 * body.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#ingestTelemetryEvents.
 *
 * @openapi
 *  /api/telemetry/events:
 *    post:
 *      tags:
 *        - Telemetry
 *      operationId: ingestTelemetryEvents
 *      summary: "Ingest event aktivitas (asinkron)"
 *      description: "Menerima 1–50 event tervalidasi dan langsung mengembalikan `202 Accepted`. Persistensi ke PostgreSQL dan pembaruan taste vector dilakukan setelah response via `after()`. Event menyimpan embedding 384 dimensi; identitas customer diambil dari JWT, bukan dari body."
 *      requestBody:
 *        required: true
 *        description: "Batch event aktivitas (maks 50)."
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                events:
 *                  minItems: 1
 *                  maxItems: 50
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        minLength: 8
 *                        maxLength: 64
 *                      anonymousId:
 *                        type: string
 *                        minLength: 8
 *                        maxLength: 64
 *                      sessionId:
 *                        type: string
 *                        minLength: 8
 *                        maxLength: 64
 *                      eventType:
 *                        type: string
 *                        enum:
 *                          - page_view
 *                          - spot_view
 *                          - event_view
 *                          - community_view
 *                          - promo_view
 *                          - blog_view
 *                          - hype_view
 *                          - search
 *                          - tag_click
 *                          - filter_apply
 *                          - qr_scan
 *                          - bookmark_add
 *                          - bookmark_remove
 *                          - attendance_add
 *                          - attendance_remove
 *                          - membership_add
 *                          - membership_remove
 *                          - review_create
 *                          - review_helpful
 *                          - share
 *                          - dwell
 *                          - recommendation_impression
 *                          - recommendation_click
 *                          - spot_directions
 *                          - signup
 *                          - login
 *                      targetType:
 *                        anyOf:
 *                          -
 *                            type: string
 *                            enum:
 *                              - spot
 *                              - event
 *                              - community
 *                              - promo
 *                              - blog
 *                              - hype
 *                              - tag
 *                              - interest
 *                              - review
 *                              - search
 *                              - page
 *                              - spot_collection
 *                          -
 *                            type: null
 *                      targetId:
 *                        anyOf:
 *                          -
 *                            type: string
 *                            maxLength: 128
 *                          -
 *                            type: null
 *                      surface:
 *                        anyOf:
 *                          -
 *                            type: string
 *                            maxLength: 255
 *                          -
 *                            type: null
 *                      tagIds:
 *                        default: []
 *                        maxItems: 30
 *                        type: array
 *                        items:
 *                          type: string
 *                          minLength: 1
 *                      interestIds:
 *                        default: []
 *                        maxItems: 20
 *                        type: array
 *                        items:
 *                          type: string
 *                          minLength: 1
 *                      value:
 *                        anyOf:
 *                          -
 *                            type: number
 *                          -
 *                            type: null
 *                      metadata:
 *                        type: object
 *                        propertyNames:
 *                          type: string
 *                        additionalProperties: {}
 *                      latitude:
 *                        anyOf:
 *                          -
 *                            type: number
 *                            minimum: -90
 *                            maximum: 90
 *                          -
 *                            type: null
 *                      longitude:
 *                        anyOf:
 *                          -
 *                            type: number
 *                            minimum: -180
 *                            maximum: 180
 *                          -
 *                            type: null
 *                      source:
 *                        default: web
 *                        type: string
 *                        enum:
 *                          - web
 *                          - pwa
 *                          - qr
 *                          - api
 *                          - system
 *                      occurredAt:
 *                        type: string
 *                        format: date-time
 *                        pattern: "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
 *                    required:
 *                      - eventType
 *                    additionalProperties: false
 *              required:
 *                - events
 *              additionalProperties: false
 *      responses:
 *        202:
 *          description: "Diterima dan diproses secara asinkron."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/TelemetryIngestResponse"
 *        400:
 *          description: "Payload/parameter tidak valid (`VALIDATION_ERROR`)."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Error"
 *        404:
 *          description: "Entitas tidak ditemukan (`NOT_FOUND`)."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Error"
 *        500:
 *          description: "Kesalahan server (`INTERNAL_ERROR`)."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Error"
 *      security:
 *        -
 *          bearerAuth: []
 *        -
 *          {}
 *      x-auth-mode: optional
 *      x-source-file: app/api/telemetry/events/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = telemetryBatchSchema.parse(body);
    const context = await getAuthContext(request);

    const events = enqueueTelemetryEvents(
      payload.events as TelemetryEventInput[],
      {
        customerId: context?.user.id ?? null,
        sessionId: context?.sessionId ?? null,
        userAgent: request.headers.get("user-agent"),
        ipHash: hashIp(getRequestIp(request)),
        source: "web",
      },
    );

    // Never block the response on persistence.
    after(async () => {
      try {
        await flushTelemetry();
      } catch {
        // Already logged by the tracker; telemetry must never break the app.
      }
    });

    return jsonOk(
      {
        accepted: events.length,
        buffered: getBufferedEventCount(),
        storage: telemetryStorageKind(),
        ids: events.map((event) => event.id),
        receivedAt: new Date().toISOString(),
      },
      202,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/telemetry/events — Riwayat aktivitas saya
 *
 * Menampilkan event aktivitas terbaru milik customer yang login, dengan filter
 * tipe/target.
 *
 * Auth: Wajib JWT (Authorization: Bearer <token>).
 * Sumber kontrak: src/server/openapi/registry.ts#listTelemetryEvents.
 *
 * @openapi
 *  /api/telemetry/events:
 *    get:
 *      tags:
 *        - Telemetry
 *      operationId: listTelemetryEvents
 *      summary: "Riwayat aktivitas saya"
 *      description: "Menampilkan event aktivitas terbaru milik customer yang login, dengan filter tipe/target."
 *      parameters:
 *        -
 *          name: eventType
 *          in: query
 *          required: false
 *          description: "Filter tipe event."
 *          schema:
 *            type: string
 *        -
 *          name: targetType
 *          in: query
 *          required: false
 *          description: "Filter tipe target."
 *          schema:
 *            type: string
 *        -
 *          name: targetId
 *          in: query
 *          required: false
 *          description: "Filter id target."
 *          schema:
 *            type: string
 *        -
 *          name: limit
 *          in: query
 *          required: false
 *          description: "Maksimum event."
 *          schema:
 *            type: integer
 *            default: 50
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                additionalProperties: true
 *        400:
 *          description: "Payload/parameter tidak valid (`VALIDATION_ERROR`)."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Error"
 *        401:
 *          description: "Tidak terautentikasi (`UNAUTHENTICATED`)."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Error"
 *        404:
 *          description: "Entitas tidak ditemukan (`NOT_FOUND`)."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Error"
 *        500:
 *          description: "Kesalahan server (`INTERNAL_ERROR`)."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Error"
 *      security:
 *        -
 *          bearerAuth: []
 *      x-auth-mode: bearer
 *      x-source-file: app/api/telemetry/events/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const sp = request.nextUrl.searchParams;
    const query = telemetryEventsQuerySchema.parse({
      eventType: sp.get("eventType") ?? undefined,
      targetType: sp.get("targetType") ?? undefined,
      targetId: sp.get("targetId") ?? undefined,
      limit: readNumberParam(sp.get("limit") ?? undefined, 50) ?? 50,
    });

    const repo = getTelemetryRepo();
    const events = await repo.listEvents({
      customerId: auth.context.user.id,
      eventType: query.eventType,
      targetType: query.targetType,
      targetId: query.targetId,
      limit: query.limit,
    });

    return jsonOk({
      items: events,
      total: events.length,
      storage: repo.kind,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Telemetry reads must always hit the live store. */
export const dynamic = "force-dynamic";
