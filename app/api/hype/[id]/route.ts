import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateHypeItemSchema } from "@/schemas";
import {
  storeDeleteHypeItem,
  storeGetHypeItemById,
  storeUpdateHypeItem,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/hype/{id} — Detail item Hype
 *
 * Mengambil item Hype berdasarkan id.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getHype.
 *
 * @openapi
 *  "/api/hype/{id}":
 *    get:
 *      tags:
 *        - Content
 *      operationId: getHype
 *      summary: "Detail item Hype"
 *      description: "Mengambil item Hype berdasarkan id."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Hype item id."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/HypeItem"
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
 *      x-source-file: "app/api/hype/[id]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const item = storeGetHypeItemById(id);
    if (!item) {
      return jsonError("NOT_FOUND", `Hype '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(item);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/hype/{id} — Perbarui item Hype
 *
 * Memperbarui item Hype.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateHype.
 *
 * @openapi
 *  "/api/hype/{id}":
 *    patch:
 *      tags:
 *        - Content
 *      operationId: updateHype
 *      summary: "Perbarui item Hype"
 *      description: "Memperbarui item Hype."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Hype item id."
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
 *                type:
 *                  type: string
 *                  enum:
 *                    - video
 *                    - photo_carousel
 *                eventId:
 *                  type: string
 *                  minLength: 1
 *                eventName:
 *                  type: string
 *                  minLength: 1
 *                locationName:
 *                  type: string
 *                  minLength: 1
 *                organizerName:
 *                  type: string
 *                  minLength: 1
 *                organizerAvatar:
 *                  default: https://picsum.photos/seed/org-new/200/200
 *                  type: string
 *                caption:
 *                  type: string
 *                  minLength: 1
 *                tags:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                likesCount:
 *                  default: 0
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *                commentsCount:
 *                  default: 0
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *                sharesCount:
 *                  default: 0
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *                audioTitle:
 *                  default: "Original Sound — NgeTag"
 *                  type: string
 *                videoUrl:
 *                  type: string
 *                posterUrl:
 *                  type: string
 *                photos:
 *                  type: array
 *                  items:
 *                    type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/HypeItem"
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
 *      x-source-file: "app/api/hype/[id]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateHypeItemSchema.parse(body);
    const updated = storeUpdateHypeItem(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Hype '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/hype/{id} — Hapus item Hype
 *
 * Menghapus item Hype.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deleteHype.
 *
 * @openapi
 *  "/api/hype/{id}":
 *    delete:
 *      tags:
 *        - Content
 *      operationId: deleteHype
 *      summary: "Hapus item Hype"
 *      description: "Menghapus item Hype."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Hype item id."
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
 *      x-source-file: "app/api/hype/[id]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteHypeItem(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Hype '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
