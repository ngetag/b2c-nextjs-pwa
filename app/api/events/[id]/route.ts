import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateEventSchema } from "@/schemas";
import {
  storeDeleteEvent,
  storeGetEventById,
  storeUpdateEvent,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/events/{id} — Detail event
 *
 * Mengambil detail event berdasarkan id atau slug.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getEvent.
 *
 * @openapi
 *  "/api/events/{id}":
 *    get:
 *      tags:
 *        - Events
 *      operationId: getEvent
 *      summary: "Detail event"
 *      description: "Mengambil detail event berdasarkan id atau slug."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Event id atau slug."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
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
 *      security: []
 *      x-auth-mode: none
 *      x-source-file: "app/api/events/[id]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const event = storeGetEventById(id);
    if (!event) {
      return jsonError("NOT_FOUND", `Event '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(event);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/events/{id} — Perbarui event
 *
 * Memperbarui sebagian field event.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateEvent.
 *
 * @openapi
 *  "/api/events/{id}":
 *    patch:
 *      tags:
 *        - Events
 *      operationId: updateEvent
 *      summary: "Perbarui event"
 *      description: "Memperbarui sebagian field event."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Event id atau slug."
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
 *      responses:
 *        200:
 *          description: Berhasil.
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
 *      x-source-file: "app/api/events/[id]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateEventSchema.parse(body);
    const updated = storeUpdateEvent(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Event '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/events/{id} — Perbarui event (PUT alias)
 *
 * Alias `PATCH`.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#replaceEvent.
 *
 * @openapi
 *  "/api/events/{id}":
 *    put:
 *      tags:
 *        - Events
 *      operationId: replaceEvent
 *      summary: "Perbarui event (PUT alias)"
 *      description: "Alias `PATCH`."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Event id atau slug."
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
 *      responses:
 *        200:
 *          description: Berhasil.
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
 *      x-source-file: "app/api/events/[id]/route.ts"
 */
export async function PUT(request: NextRequest, ctx: RouteContext) {
  return PATCH(request, ctx);
}

/**
 * DELETE /api/events/{id} — Hapus event
 *
 * Menghapus event berdasarkan id atau slug.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deleteEvent.
 *
 * @openapi
 *  "/api/events/{id}":
 *    delete:
 *      tags:
 *        - Events
 *      operationId: deleteEvent
 *      summary: "Hapus event"
 *      description: "Menghapus event berdasarkan id atau slug."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Event id atau slug."
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
 *      x-source-file: "app/api/events/[id]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteEvent(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Event '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
