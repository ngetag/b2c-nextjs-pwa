import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import { createEventSchema } from "@/schemas";
import {
  storeCreateEvent,
  storeListFeaturedEvents,
  storeListRecommendedEventsByLocation,
  storeSearchEvents,
} from "@/server/store";

/**
 * GET /api/events — Cari & filter event
 *
 * Pencarian event dengan filter tag, interest, kota, jadwal, dan jarak. Mendukung
 * `mode=featured|recommended`.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listEvents.
 *
 * @openapi
 *  /api/events:
 *    get:
 *      tags:
 *        - Events
 *      operationId: listEvents
 *      summary: "Cari & filter event"
 *      description: "Pencarian event dengan filter tag, interest, kota, jadwal, dan jarak. Mendukung `mode=featured|recommended`."
 *      parameters:
 *        -
 *          name: q
 *          in: query
 *          required: false
 *          description: "Kata kunci pencarian."
 *          schema:
 *            type: string
 *        -
 *          name: tagSlugs
 *          in: query
 *          required: false
 *          description: "Filter tag (boleh diulang atau dipisah koma). CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: city
 *          in: query
 *          required: false
 *          description: "Filter kota."
 *          schema:
 *            type: string
 *        -
 *          name: sort
 *          in: query
 *          required: false
 *          description: "Urutan hasil."
 *          schema:
 *            type: string
 *            enum:
 *              - relevance
 *              - newest
 *              - distance
 *        -
 *          name: page
 *          in: query
 *          required: false
 *          description: "Halaman (mulai 1)."
 *          schema:
 *            type: integer
 *            default: 1
 *        -
 *          name: pageSize
 *          in: query
 *          required: false
 *          description: "Jumlah per halaman."
 *          schema:
 *            type: integer
 *            default: 12
 *        -
 *          name: lat
 *          in: query
 *          required: false
 *          description: "Latitude untuk perhitungan jarak."
 *          schema:
 *            type: number
 *        -
 *          name: lng
 *          in: query
 *          required: false
 *          description: "Longitude untuk perhitungan jarak."
 *          schema:
 *            type: number
 *        -
 *          name: anyTagMatch
 *          in: query
 *          required: false
 *          description: "`true` = cocokkan salah satu tag."
 *          schema:
 *            type: boolean
 *        -
 *          name: interestIds
 *          in: query
 *          required: false
 *          description: "Filter interest. CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: mode
 *          in: query
 *          required: false
 *          description: "Shortcut daftar."
 *          schema:
 *            type: string
 *            enum:
 *              - featured
 *              - recommended
 *        -
 *          name: featured
 *          in: query
 *          required: false
 *          description: "Filter event unggulan."
 *          schema:
 *            type: boolean
 *        -
 *          name: ownerId
 *          in: query
 *          required: false
 *          description: "Filter owner (B2B)."
 *          schema:
 *            type: string
 *        -
 *          name: publishStatus
 *          in: query
 *          required: false
 *          description: "Filter status publikasi."
 *          schema:
 *            type: string
 *            enum:
 *              - draft
 *              - published
 *              - archived
 *              - all
 *        -
 *          name: limit
 *          in: query
 *          required: false
 *          description: "Limit untuk mode shortcut."
 *          schema:
 *            type: integer
 *            default: 8
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/PaginatedEvents"
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
 *      security: []
 *      x-auth-mode: none
 *      x-source-file: app/api/events/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const mode = sp.get("mode");
    const limit = readNumberParam(sp.get("limit") ?? undefined, 8) ?? 8;

    if (mode === "featured") {
      return jsonOk(storeListFeaturedEvents(limit));
    }

    if (mode === "recommended") {
      const lat = readNumberParam(sp.get("lat") ?? undefined, -6.2769) ?? -6.2769;
      const lng = readNumberParam(sp.get("lng") ?? undefined, 106.8067) ?? 106.8067;
      return jsonOk(
        storeListRecommendedEventsByLocation(
          { latitude: lat, longitude: lng },
          limit,
        ),
      );
    }

    const q = sp.get("q") ?? undefined;
    const tagSlugs = readArrayParam(
      sp.getAll("tagSlugs").length > 0
        ? sp.getAll("tagSlugs")
        : (sp.get("tags") ?? undefined),
    );
    const interestIds = readArrayParam(
      sp.getAll("interestIds").length > 0
        ? sp.getAll("interestIds")
        : (sp.get("interestIds") ?? undefined),
    );
    const city = sp.get("city") ?? undefined;
    const sortParam = sp.get("sort");
    const sort =
      sortParam === "newest" ||
      sortParam === "distance" ||
      sortParam === "relevance"
        ? sortParam
        : undefined;
    const page = readNumberParam(sp.get("page") ?? undefined, 1) ?? 1;
    const pageSize = readNumberParam(sp.get("pageSize") ?? undefined, 12) ?? 12;
    const lat = readNumberParam(sp.get("lat") ?? undefined);
    const lng = readNumberParam(sp.get("lng") ?? undefined);
    const ownerId = sp.get("ownerId") ?? undefined;
    const publishStatusParam = sp.get("publishStatus");
    const publishStatus =
      publishStatusParam === "draft" ||
      publishStatusParam === "published" ||
      publishStatusParam === "archived" ||
      publishStatusParam === "all"
        ? publishStatusParam
        : undefined;
    const featuredParam = sp.get("featured");
    const featured =
      featuredParam === "true"
        ? true
        : featuredParam === "false"
          ? false
          : undefined;
    const anyTagMatch = sp.get("anyTagMatch") === "true";

    const result = storeSearchEvents({
      q,
      tagSlugs,
      interestIds,
      city,
      sort,
      page,
      pageSize,
      lat,
      lng,
      ownerId,
      publishStatus,
      featured,
      anyTagMatch,
    });

    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/events — Buat event baru
 *
 * Membuat event beserta jadwal, venue, harga, dan organizer.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createEvent.
 *
 * @openapi
 *  /api/events:
 *    post:
 *      tags:
 *        - Events
 *      operationId: createEvent
 *      summary: "Buat event baru"
 *      description: "Membuat event beserta jadwal, venue, harga, dan organizer."
 *      requestBody:
 *        required: true
 *        description: "Payload JSON."
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                ownerId:
 *                  type: string
 *                slug:
 *                  type: string
 *                title:
 *                  type: string
 *                  minLength: 2
 *                description:
 *                  type: string
 *                  minLength: 10
 *                coverImageUrl:
 *                  default: https://picsum.photos/seed/event-new/1200/675
 *                  type: string
 *                  minLength: 1
 *                tagIds:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                interestIds:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                startAt:
 *                  type: string
 *                endAt:
 *                  type: string
 *                venueName:
 *                  type: string
 *                  minLength: 1
 *                location:
 *                  type: object
 *                  properties:
 *                    latitude:
 *                      type: number
 *                      minimum: -90
 *                      maximum: 90
 *                    longitude:
 *                      type: number
 *                      minimum: -180
 *                      maximum: 180
 *                    address:
 *                      type: string
 *                      minLength: 1
 *                    village:
 *                      type: string
 *                      minLength: 1
 *                    district:
 *                      type: string
 *                      minLength: 1
 *                    city:
 *                      type: string
 *                      minLength: 1
 *                    province:
 *                      type: string
 *                    postalCode:
 *                      type: string
 *                    displayName:
 *                      type: string
 *                  required:
 *                    - latitude
 *                    - longitude
 *                    - address
 *                    - village
 *                    - district
 *                    - city
 *                price:
 *                  type: object
 *                  properties:
 *                    min:
 *                      type: number
 *                      minimum: 0
 *                    max:
 *                      type: number
 *                      minimum: 0
 *                    currency:
 *                      default: IDR
 *                      type: string
 *                      const: IDR
 *                    isFree:
 *                      type: boolean
 *                  required:
 *                    - min
 *                    - isFree
 *                organizer:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                      minLength: 1
 *                    name:
 *                      type: string
 *                      minLength: 1
 *                    logoUrl:
 *                      type: string
 *                  required:
 *                    - id
 *                    - name
 *                status:
 *                  default: upcoming
 *                  type: string
 *                  enum:
 *                    - upcoming
 *                    - ongoing
 *                    - past
 *                capacity:
 *                  type: integer
 *                  exclusiveMinimum: 0
 *                  maximum: 9007199254740991
 *                ticketUrl:
 *                  type: string
 *                featured:
 *                  default: false
 *                  type: boolean
 *                publishStatus:
 *                  default: published
 *                  type: string
 *                  enum:
 *                    - draft
 *                    - published
 *                    - archived
 *                lastUpdatedBy:
 *                  type: string
 *              required:
 *                - title
 *                - description
 *                - startAt
 *                - endAt
 *                - venueName
 *                - location
 *                - price
 *                - organizer
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Event"
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
 *      x-source-file: app/api/events/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createEventSchema.parse(body);
    const created = storeCreateEvent(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
