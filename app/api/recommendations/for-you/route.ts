import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { getAuthContext } from "@/lib/auth/session";
import { readNumberParam } from "@/lib/url";
import { forYouQuerySchema } from "@/schemas";
import { getForYouRecommendations } from "@/server/telemetry/recommendations";

/**
 * GET /api/recommendations/for-you — Feed personal berbasis pgvector
 *
 * Hybrid ranking: taste vector hasil telemetri → cold start dari klaim JWT
 * (interests/favoriteTags) → trending. Cosine similarity (`<=>`) terhadap
 * `content_embeddings`, dengan filter radius PostGIS bila lat/lng dikirim.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#getForYouRecommendations.
 *
 * @openapi
 *  /api/recommendations/for-you:
 *    get:
 *      tags:
 *        - Recommendations
 *      operationId: getForYouRecommendations
 *      summary: "Feed personal berbasis pgvector"
 *      description: "Hybrid ranking: taste vector hasil telemetri → cold start dari klaim JWT (interests/favoriteTags) → trending. Cosine similarity (`<=>`) terhadap `content_embeddings`, dengan filter radius PostGIS bila lat/lng dikirim."
 *      parameters:
 *        -
 *          name: limit
 *          in: query
 *          required: false
 *          description: "Jumlah item."
 *          schema:
 *            type: integer
 *            default: 8
 *        -
 *          name: lat
 *          in: query
 *          required: false
 *          description: "Latitude untuk filter radius."
 *          schema:
 *            type: number
 *        -
 *          name: lng
 *          in: query
 *          required: false
 *          description: "Longitude untuk filter radius."
 *          schema:
 *            type: number
 *        -
 *          name: types
 *          in: query
 *          required: false
 *          description: "Batasi tipe konten (spot,event,community,promo,...). CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: anonymousId
 *          in: query
 *          required: false
 *          description: "Stabilkan profil untuk guest."
 *          schema:
 *            type: string
 *        -
 *          name: debug
 *          in: query
 *          required: false
 *          description: "Sertakan penjelasan profil."
 *          schema:
 *            type: boolean
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/ForYouResponse"
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
 *      x-source-file: app/api/recommendations/for-you/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const context = await getAuthContext(request);

    const query = forYouQuerySchema.parse({
      limit: readNumberParam(sp.get("limit") ?? undefined, 8) ?? 8,
      lat: readNumberParam(sp.get("lat") ?? undefined),
      lng: readNumberParam(sp.get("lng") ?? undefined),
      anonymousId: sp.get("anonymousId") ?? undefined,
      types: sp.get("types") ?? undefined,
      debug: sp.get("debug") ?? undefined,
    });

    const result = await getForYouRecommendations({
      customerId: context?.user.id ?? null,
      anonymousId: context ? undefined : query.anonymousId,
      interestIds: context?.claims.interests,
      favoriteTagIds: context?.claims.favoriteTags,
      lat: query.lat,
      lng: query.lng,
      limit: query.limit,
      types: query.types,
      debug: query.debug,
    });

    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/** Recommendations are personalised and always fresh. */
export const dynamic = "force-dynamic";
