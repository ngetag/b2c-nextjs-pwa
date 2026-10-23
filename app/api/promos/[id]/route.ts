import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updatePromoSchema } from "@/schemas";
import {
  storeDeletePromo,
  storeGetPromoById,
  storeUpdatePromo,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/promos/{id} — Detail promo
 *
 * Mengambil detail promo.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getPromo.
 *
 * @openapi
 *  "/api/promos/{id}":
 *    get:
 *      tags:
 *        - Promos
 *      operationId: getPromo
 *      summary: "Detail promo"
 *      description: "Mengambil detail promo."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Promo id."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Promo"
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
 *      x-source-file: "app/api/promos/[id]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const promo = storeGetPromoById(id);
    if (!promo) {
      return jsonError("NOT_FOUND", `Promo '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(promo);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/promos/{id} — Perbarui promo
 *
 * Memperbarui sebagian field promo.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updatePromo.
 *
 * @openapi
 *  "/api/promos/{id}":
 *    patch:
 *      tags:
 *        - Promos
 *      operationId: updatePromo
 *      summary: "Perbarui promo"
 *      description: "Memperbarui sebagian field promo."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Promo id."
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
 *                title:
 *                  type: string
 *                  minLength: 2
 *                description:
 *                  type: string
 *                  minLength: 5
 *                validUntil:
 *                  type: string
 *                discountPercent:
 *                  type: number
 *                  minimum: 0
 *                  maximum: 100
 *                code:
 *                  type: string
 *                imageUrl:
 *                  type: string
 *                spotId:
 *                  type: string
 *                eventId:
 *                  type: string
 *                ownerType:
 *                  type: string
 *                  enum:
 *                    - spot
 *                    - event
 *                status:
 *                  default: active
 *                  type: string
 *                  enum:
 *                    - draft
 *                    - active
 *                    - expired
 *                    - archived
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Promo"
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
 *      x-source-file: "app/api/promos/[id]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updatePromoSchema.parse(body);
    const updated = storeUpdatePromo(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Promo '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/promos/{id} — Perbarui promo (PUT alias)
 *
 * Alias `PATCH`.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#replacePromo.
 *
 * @openapi
 *  "/api/promos/{id}":
 *    put:
 *      tags:
 *        - Promos
 *      operationId: replacePromo
 *      summary: "Perbarui promo (PUT alias)"
 *      description: "Alias `PATCH`."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Promo id."
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
 *                title:
 *                  type: string
 *                  minLength: 2
 *                description:
 *                  type: string
 *                  minLength: 5
 *                validUntil:
 *                  type: string
 *                discountPercent:
 *                  type: number
 *                  minimum: 0
 *                  maximum: 100
 *                code:
 *                  type: string
 *                imageUrl:
 *                  type: string
 *                spotId:
 *                  type: string
 *                eventId:
 *                  type: string
 *                ownerType:
 *                  type: string
 *                  enum:
 *                    - spot
 *                    - event
 *                status:
 *                  default: active
 *                  type: string
 *                  enum:
 *                    - draft
 *                    - active
 *                    - expired
 *                    - archived
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Promo"
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
 *      x-source-file: "app/api/promos/[id]/route.ts"
 */
export async function PUT(request: NextRequest, ctx: RouteContext) {
  return PATCH(request, ctx);
}

/**
 * DELETE /api/promos/{id} — Hapus promo
 *
 * Menghapus promo.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deletePromo.
 *
 * @openapi
 *  "/api/promos/{id}":
 *    delete:
 *      tags:
 *        - Promos
 *      operationId: deletePromo
 *      summary: "Hapus promo"
 *      description: "Menghapus promo."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Promo id."
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
 *      x-source-file: "app/api/promos/[id]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeletePromo(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Promo '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
