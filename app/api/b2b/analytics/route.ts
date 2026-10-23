import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { storeGetB2BAnalytics } from "@/server/store";

/**
 * GET /api/b2b/analytics — Metrik performa B2B
 *
 * Ringkasan jumlah spot, event, promo, review, verified visits, bookmark, attendance,
 * dan performa per spot.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#getB2bAnalytics.
 *
 * @openapi
 *  /api/b2b/analytics:
 *    get:
 *      tags:
 *        - B2B
 *      operationId: getB2bAnalytics
 *      summary: "Metrik performa B2B"
 *      description: "Ringkasan jumlah spot, event, promo, review, verified visits, bookmark, attendance, dan performa per spot."
 *      parameters:
 *        -
 *          name: ownerId
 *          in: query
 *          required: false
 *          description: "Batasi ke owner tertentu."
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
 *      x-source-file: app/api/b2b/analytics/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const ownerId =
      request.nextUrl.searchParams.get("ownerId") ?? undefined;
    return jsonOk(storeGetB2BAnalytics(ownerId));
  } catch (error) {
    return handleApiError(error);
  }
}
