import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import { createSpotSchema } from "@/schemas";
import {
  storeCreateSpot,
  storeListFeaturedSpots,
  storeListRecommendedSpotsByLocation,
  storeSearchSpots,
} from "@/server/store";

/**
 * GET /api/spots — Cari & filter spot
 *
 * Pencarian spot dengan filter tag/kota, sorting, pagination, dan perhitungan jarak.
 * Gunakan `mode=featured` atau `mode=recommended` untuk shortcut beranda.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listSpots.
 *
 * @openapi
 *  /api/spots:
 *    get:
 *      tags:
 *        - Spots
 *      operationId: listSpots
 *      summary: "Cari & filter spot"
 *      description: "Pencarian spot dengan filter tag/kota, sorting, pagination, dan perhitungan jarak. Gunakan `mode=featured` atau `mode=recommended` untuk shortcut beranda."
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
 *          description: "Filter spot unggulan."
 *          schema:
 *            type: boolean
 *        -
 *          name: ownerId
 *          in: query
 *          required: false
 *          description: "Filter berdasarkan owner (B2B)."
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
 *          description: "Limit untuk mode featured/recommended."
 *          schema:
 *            type: integer
 *            default: 8
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/PaginatedSpots"
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
 *      x-source-file: app/api/spots/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const mode = sp.get("mode");
    const limit = readNumberParam(sp.get("limit") ?? undefined, 8) ?? 8;

    if (mode === "featured") {
      return jsonOk(storeListFeaturedSpots(limit));
    }

    if (mode === "recommended") {
      const lat = readNumberParam(sp.get("lat") ?? undefined, -6.2769) ?? -6.2769;
      const lng = readNumberParam(sp.get("lng") ?? undefined, 106.8067) ?? 106.8067;
      return jsonOk(
        storeListRecommendedSpotsByLocation(
          { latitude: lat, longitude: lng },
          limit,
        ),
      );
    }

    const q = sp.get("q") ?? undefined;
    const tagSlugs = readArrayParam(sp.getAll("tagSlugs").length > 0 ? sp.getAll("tagSlugs") : (sp.get("tags") ?? undefined));
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

    const result = storeSearchSpots({
      q,
      tagSlugs,
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
 * POST /api/spots — Buat spot baru
 *
 * Membuat spot beserta tag, jam buka, dan data lokasi.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createSpot.
 *
 * @openapi
 *  /api/spots:
 *    post:
 *      tags:
 *        - Spots
 *      operationId: createSpot
 *      summary: "Buat spot baru"
 *      description: "Membuat spot beserta tag, jam buka, dan data lokasi."
 *      requestBody:
 *        required: true
 *        description: "Payload spot baru."
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
 *                name:
 *                  type: string
 *                  minLength: 2
 *                description:
 *                  type: string
 *                  minLength: 10
 *                coverImageUrl:
 *                  default: https://picsum.photos/seed/spot-new/1200/800
 *                  type: string
 *                  minLength: 1
 *                galleryUrls:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                tagIds:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                priceLevel:
 *                  default: 2
 *                  anyOf:
 *                    -
 *                      type: number
 *                      const: 1
 *                    -
 *                      type: number
 *                      const: 2
 *                    -
 *                      type: number
 *                      const: 3
 *                    -
 *                      type: number
 *                      const: 4
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
 *                openingHours:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      day:
 *                        type: string
 *                        enum:
 *                          - mon
 *                          - tue
 *                          - wed
 *                          - thu
 *                          - fri
 *                          - sat
 *                          - sun
 *                      open:
 *                        type: string
 *                        pattern: "^\\d{2}:\\d{2}$"
 *                      close:
 *                        type: string
 *                        pattern: "^\\d{2}:\\d{2}$"
 *                      closed:
 *                        type: boolean
 *                    required:
 *                      - day
 *                      - open
 *                      - close
 *                promoIds:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                contact:
 *                  type: object
 *                  properties:
 *                    phone:
 *                      type: string
 *                    website:
 *                      type: string
 *                    instagram:
 *                      type: string
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
 *                - name
 *                - description
 *                - location
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Spot"
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
 *      x-source-file: app/api/spots/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createSpotSchema.parse(body);
    const created = storeCreateSpot(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
