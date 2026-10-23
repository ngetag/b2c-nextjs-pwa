import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam } from "@/lib/url";
import { createReviewTagSchema } from "@/schemas";
import { storeCreateReviewTag, storeListReviewTags } from "@/server/store";

/**
 * GET /api/review-tags — Daftar review tag
 *
 * Daftar chip pengalaman ulasan, dapat difilter per spot.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listReviewTags.
 *
 * @openapi
 *  /api/review-tags:
 *    get:
 *      tags:
 *        - Reviews
 *      operationId: listReviewTags
 *      summary: "Daftar review tag"
 *      description: "Daftar chip pengalaman ulasan, dapat difilter per spot."
 *      parameters:
 *        -
 *          name: spotId
 *          in: query
 *          required: false
 *          description: "Filter spot."
 *          schema:
 *            type: string
 *        -
 *          name: ids
 *          in: query
 *          required: false
 *          description: "Filter id review tag. CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/ReviewTag"
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
 *      x-source-file: app/api/review-tags/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const spotId = sp.get("spotId") ?? undefined;
    const ids = readArrayParam(
      sp.getAll("ids").length > 0 ? sp.getAll("ids") : (sp.get("ids") ?? undefined),
    );
    return jsonOk(
      storeListReviewTags({
        spotId,
        ids: ids.length > 0 ? ids : undefined,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/review-tags — Buat review tag
 *
 * Membuat chip pengalaman baru untuk sebuah spot.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createReviewTag.
 *
 * @openapi
 *  /api/review-tags:
 *    post:
 *      tags:
 *        - Reviews
 *      operationId: createReviewTag
 *      summary: "Buat review tag"
 *      description: "Membuat chip pengalaman baru untuk sebuah spot."
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
 *                spotId:
 *                  type: string
 *                  minLength: 1
 *                label:
 *                  type: string
 *                  minLength: 1
 *                value:
 *                  type: string
 *                  minLength: 1
 *                ownerEditable:
 *                  default: true
 *                  type: boolean
 *                sortOrder:
 *                  default: 1
 *                  type: integer
 *                  minimum: -9007199254740991
 *                  maximum: 9007199254740991
 *              required:
 *                - spotId
 *                - label
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/ReviewTag"
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
 *      x-source-file: app/api/review-tags/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createReviewTagSchema.parse(body);
    const created = storeCreateReviewTag(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
