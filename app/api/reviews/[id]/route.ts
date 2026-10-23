import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateReviewSchema } from "@/schemas";
import {
  storeDeleteReview,
  storeGetReviewById,
  storeUpdateReview,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/reviews/{id} — Detail ulasan
 *
 * Mengambil ulasan berdasarkan id.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getReview.
 *
 * @openapi
 *  "/api/reviews/{id}":
 *    get:
 *      tags:
 *        - Reviews
 *      operationId: getReview
 *      summary: "Detail ulasan"
 *      description: "Mengambil ulasan berdasarkan id."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Review id."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Review"
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
 *      x-source-file: "app/api/reviews/[id]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const review = storeGetReviewById(id);
    if (!review) {
      return jsonError("NOT_FOUND", `Review '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(review);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/reviews/{id} — Perbarui ulasan
 *
 * Memperbarui komentar/tag ulasan.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateReview.
 *
 * @openapi
 *  "/api/reviews/{id}":
 *    patch:
 *      tags:
 *        - Reviews
 *      operationId: updateReview
 *      summary: "Perbarui ulasan"
 *      description: "Memperbarui komentar/tag ulasan."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Review id."
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
 *                comment:
 *                  type: string
 *                  minLength: 10
 *                  maxLength: 1000
 *                reviewTagIds:
 *                  type: array
 *                  items:
 *                    type: string
 *                imageUrls:
 *                  type: array
 *                  items:
 *                    type: string
 *                helpfulCount:
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Review"
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
 *      x-source-file: "app/api/reviews/[id]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateReviewSchema.parse(body);
    const updated = storeUpdateReview(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Review '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/reviews/{id} — Hapus ulasan
 *
 * Menghapus ulasan.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deleteReview.
 *
 * @openapi
 *  "/api/reviews/{id}":
 *    delete:
 *      tags:
 *        - Reviews
 *      operationId: deleteReview
 *      summary: "Hapus ulasan"
 *      description: "Menghapus ulasan."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Review id."
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
 *      x-source-file: "app/api/reviews/[id]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteReview(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Review '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
