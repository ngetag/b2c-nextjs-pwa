import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { storeGetSpotById, storeListPromos } from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/spots/{id}/promos — Promo milik spot
 *
 * Daftar promo aktif yang terhubung ke spot.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listSpotPromos.
 *
 * @openapi
 *  "/api/spots/{id}/promos":
 *    get:
 *      tags:
 *        - Promos
 *      operationId: listSpotPromos
 *      summary: "Promo milik spot"
 *      description: "Daftar promo aktif yang terhubung ke spot."
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
 *      x-source-file: "app/api/spots/[id]/promos/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(storeListPromos({ spotId: spot.id }));
  } catch (error) {
    return handleApiError(error);
  }
}
