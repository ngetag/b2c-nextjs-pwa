import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { storeIncrementReviewHelpful } from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/reviews/{id}/helpful — Tandai ulasan membantu
 *
 * Menambah `helpfulCount` pada ulasan.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#markReviewHelpful.
 *
 * @openapi
 *  "/api/reviews/{id}/helpful":
 *    post:
 *      tags:
 *        - Reviews
 *      operationId: markReviewHelpful
 *      summary: "Tandai ulasan membantu"
 *      description: "Menambah `helpfulCount` pada ulasan."
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
 *      security:
 *        -
 *          bearerAuth: []
 *        -
 *          {}
 *      x-auth-mode: optional
 *      x-source-file: "app/api/reviews/[id]/helpful/route.ts"
 */
export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const updated = storeIncrementReviewHelpful(id);
    if (!updated) {
      return jsonError("NOT_FOUND", `Review '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
