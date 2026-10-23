import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { readNumberParam } from "@/lib/url";
import { similarContentQuerySchema } from "@/schemas";
import { getSimilarContent } from "@/server/telemetry/recommendations";
import {
  CONTENT_OWNER_TYPES,
  type ContentOwnerType,
} from "@/shared/telemetry";

/**
 * GET /api/recommendations/similar — "Mirip dengan ini"
 *
 * Mencari tetangga terdekat (cosine) dari sebuah konten di vector index.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getSimilarContent.
 *
 * @openapi
 *  /api/recommendations/similar:
 *    get:
 *      tags:
 *        - Recommendations
 *      operationId: getSimilarContent
 *      summary: "\"Mirip dengan ini\""
 *      description: "Mencari tetangga terdekat (cosine) dari sebuah konten di vector index."
 *      parameters:
 *        -
 *          name: ownerType
 *          in: query
 *          required: false
 *          description: "Tipe konten."
 *          schema:
 *            type: string
 *            enum:
 *              - spot
 *              - event
 *              - community
 *              - promo
 *              - blog
 *              - hype
 *        -
 *          name: ownerId
 *          in: query
 *          required: true
 *          description: "Id konten acuan."
 *          schema:
 *            type: string
 *        -
 *          name: limit
 *          in: query
 *          required: false
 *          description: "Jumlah hasil."
 *          schema:
 *            type: integer
 *            default: 8
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
 *      x-source-file: app/api/recommendations/similar/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const query = similarContentQuerySchema.parse({
      ownerType: sp.get("ownerType") ?? "spot",
      ownerId: sp.get("ownerId") ?? "",
      limit: readNumberParam(sp.get("limit") ?? undefined, 8) ?? 8,
      lat: readNumberParam(sp.get("lat") ?? undefined),
      lng: readNumberParam(sp.get("lng") ?? undefined),
    });

    if (!(CONTENT_OWNER_TYPES as readonly string[]).includes(query.ownerType)) {
      return jsonError(
        "INVALID_OWNER_TYPE",
        `ownerType harus salah satu dari: ${CONTENT_OWNER_TYPES.join(", ")}`,
        400,
      );
    }

    const items = await getSimilarContent({
      ownerType: query.ownerType as ContentOwnerType,
      ownerId: query.ownerId,
      limit: query.limit,
      lat: query.lat,
      lng: query.lng,
    });

    return jsonOk({
      seed: { ownerType: query.ownerType, ownerId: query.ownerId },
      items,
      total: items.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Similarity queries read the live vector index. */
export const dynamic = "force-dynamic";
