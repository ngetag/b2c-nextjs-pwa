import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import { storeGetRecommendations } from "@/server/store";

/**
 * GET /api/recommendations — Rekomendasi berbasis preferensi & lokasi
 *
 * Rekomendasi heuristic (favourite tag + interest + jarak) untuk beranda. Untuk
 * rekomendasi berbasis vektor gunakan `/api/recommendations/for-you`.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getRecommendations.
 *
 * @openapi
 *  /api/recommendations:
 *    get:
 *      tags:
 *        - Recommendations
 *      operationId: getRecommendations
 *      summary: "Rekomendasi berbasis preferensi & lokasi"
 *      description: "Rekomendasi heuristic (favourite tag + interest + jarak) untuk beranda. Untuk rekomendasi berbasis vektor gunakan `/api/recommendations/for-you`."
 *      parameters:
 *        -
 *          name: lat
 *          in: query
 *          required: false
 *          description: Latitude.
 *          schema:
 *            type: number
 *        -
 *          name: lng
 *          in: query
 *          required: false
 *          description: Longitude.
 *          schema:
 *            type: number
 *        -
 *          name: favoriteTagIds
 *          in: query
 *          required: false
 *          description: "Favourite tag ids. CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: interestIds
 *          in: query
 *          required: false
 *          description: "Interest ids. CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: limit
 *          in: query
 *          required: false
 *          description: "Jumlah rekomendasi."
 *          schema:
 *            type: integer
 *            default: 8
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
 *      security: []
 *      x-auth-mode: none
 *      x-source-file: app/api/recommendations/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const lat = readNumberParam(sp.get("lat") ?? undefined);
    const lng = readNumberParam(sp.get("lng") ?? undefined);
    const limit = readNumberParam(sp.get("limit") ?? undefined, 8) ?? 8;
    const favoriteTagIds = readArrayParam(
      sp.getAll("favoriteTagIds").length > 0
        ? sp.getAll("favoriteTagIds")
        : (sp.get("favoriteTagIds") ?? undefined),
    );
    const interestIds = readArrayParam(
      sp.getAll("interestIds").length > 0
        ? sp.getAll("interestIds")
        : (sp.get("interestIds") ?? undefined),
    );

    return jsonOk(
      storeGetRecommendations({
        lat,
        lng,
        favoriteTagIds: favoriteTagIds.length > 0 ? favoriteTagIds : undefined,
        interestIds: interestIds.length > 0 ? interestIds : undefined,
        limit,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
