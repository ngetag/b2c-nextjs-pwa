import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { markSpotVisitSchema } from "@/schemas";
import { storeListSpotVisits, storeMarkSpotVisit } from "@/server/store";

/**
 * GET /api/engagements/visits — Daftar kunjungan spot
 *
 * Kunjungan spot terverifikasi (hasil scan QR).
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#listSpotVisits.
 *
 * @openapi
 *  /api/engagements/visits:
 *    get:
 *      tags:
 *        - Engagements
 *      operationId: listSpotVisits
 *      summary: "Daftar kunjungan spot"
 *      description: "Kunjungan spot terverifikasi (hasil scan QR)."
 *      parameters:
 *        -
 *          name: userId
 *          in: query
 *          required: false
 *          description: "Filter user."
 *          schema:
 *            type: string
 *        -
 *          name: spotId
 *          in: query
 *          required: false
 *          description: "Filter spot."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/SpotVisit"
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
 *      x-source-file: app/api/engagements/visits/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const userId = sp.get("userId") ?? undefined;
    const spotId = sp.get("spotId") ?? undefined;
    return jsonOk(storeListSpotVisits({ userId, spotId }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/engagements/visits — Catat kunjungan spot
 *
 * Mencatat kunjungan spot dari QR check-in.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#markSpotVisit.
 *
 * @openapi
 *  /api/engagements/visits:
 *    post:
 *      tags:
 *        - Engagements
 *      operationId: markSpotVisit
 *      summary: "Catat kunjungan spot"
 *      description: "Mencatat kunjungan spot dari QR check-in."
 *      requestBody:
 *        required: true
 *        description: "Payload JSON."
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                userId:
 *                  default: u-demo
 *                  type: string
 *                  minLength: 1
 *                spotId:
 *                  type: string
 *                  minLength: 1
 *                tagIds:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                reviewed:
 *                  default: false
 *                  type: boolean
 *              required:
 *                - spotId
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/SpotVisit"
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
 *      x-source-file: app/api/engagements/visits/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = markSpotVisitSchema.parse(body);
    return jsonCreated(storeMarkSpotVisit(input));
  } catch (error) {
    return handleApiError(error);
  }
}
