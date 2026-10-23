import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateSpotSchema } from "@/schemas";
import {
  storeDeleteSpot,
  storeGetSpotById,
  storeUpdateSpot,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/spots/{id} — Detail spot
 *
 * Mengambil detail spot berdasarkan id atau slug.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getSpot.
 *
 * @openapi
 *  "/api/spots/{id}":
 *    get:
 *      tags:
 *        - Spots
 *      operationId: getSpot
 *      summary: "Detail spot"
 *      description: "Mengambil detail spot berdasarkan id atau slug."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Spot id atau slug."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
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
 *      security: []
 *      x-auth-mode: none
 *      x-source-file: "app/api/spots/[id]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(spot);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/spots/{id} — Perbarui spot
 *
 * Memperbarui sebagian field spot (partial update).
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateSpot.
 *
 * @openapi
 *  "/api/spots/{id}":
 *    patch:
 *      tags:
 *        - Spots
 *      operationId: updateSpot
 *      summary: "Perbarui spot"
 *      description: "Memperbarui sebagian field spot (partial update)."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Spot id atau slug."
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        description: "Field spot yang diubah."
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
 *      responses:
 *        200:
 *          description: Berhasil.
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
 *      x-source-file: "app/api/spots/[id]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateSpotSchema.parse(body);
    const updated = storeUpdateSpot(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/spots/{id} — Perbarui spot (PUT alias)
 *
 * Alias `PATCH` untuk klien yang memakai PUT.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#replaceSpot.
 *
 * @openapi
 *  "/api/spots/{id}":
 *    put:
 *      tags:
 *        - Spots
 *      operationId: replaceSpot
 *      summary: "Perbarui spot (PUT alias)"
 *      description: "Alias `PATCH` untuk klien yang memakai PUT."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Spot id atau slug."
 *          schema:
 *            type: string
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
 *      responses:
 *        200:
 *          description: Berhasil.
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
 *      x-source-file: "app/api/spots/[id]/route.ts"
 */
export async function PUT(request: NextRequest, ctx: RouteContext) {
  return PATCH(request, ctx);
}

/**
 * DELETE /api/spots/{id} — Hapus spot
 *
 * Menghapus spot berdasarkan id atau slug.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deleteSpot.
 *
 * @openapi
 *  "/api/spots/{id}":
 *    delete:
 *      tags:
 *        - Spots
 *      operationId: deleteSpot
 *      summary: "Hapus spot"
 *      description: "Menghapus spot berdasarkan id atau slug."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Spot id atau slug."
 *          schema:
 *            type: string
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
 *      x-source-file: "app/api/spots/[id]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteSpot(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
