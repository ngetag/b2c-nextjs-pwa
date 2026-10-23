import type { NextRequest } from "next/server";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
} from "@/lib/api-response";
import { createReviewSchema } from "@/schemas";
import {
  storeCreateReview,
  storeGetSpotById,
  storeListReviews,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/spots/{id}/reviews — Ulasan per spot
 *
 * Daftar ulasan terverifikasi untuk satu spot.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listSpotReviews.
 *
 * @openapi
 *  "/api/spots/{id}/reviews":
 *    get:
 *      tags:
 *        - Reviews
 *      operationId: listSpotReviews
 *      summary: "Ulasan per spot"
 *      description: "Daftar ulasan terverifikasi untuk satu spot."
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
 *      x-source-file: "app/api/spots/[id]/reviews/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(storeListReviews({ spotId: spot.id }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/spots/{id}/reviews — Tulis ulasan spot
 *
 * Membuat ulasan untuk spot pada path (menimpa `spotId` dari body) dan otomatis mencatat
 * kunjungan.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createSpotReview.
 *
 * @openapi
 *  "/api/spots/{id}/reviews":
 *    post:
 *      tags:
 *        - Reviews
 *      operationId: createSpotReview
 *      summary: "Tulis ulasan spot"
 *      description: "Membuat ulasan untuk spot pada path (menimpa `spotId` dari body) dan otomatis mencatat kunjungan."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Spot id atau slug."
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
 *                spotId:
 *                  type: string
 *                  minLength: 1
 *                authorId:
 *                  default: u-demo
 *                  type: string
 *                  minLength: 1
 *                authorSnapshot:
 *                  default:
 *                    name: "Demo User"
 *                    avatarUrl: https://picsum.photos/seed/demo-user/200/200
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      minLength: 1
 *                    avatarUrl:
 *                      type: string
 *                  required:
 *                    - name
 *                comment:
 *                  type: string
 *                  minLength: 10
 *                  maxLength: 1000
 *                reviewTagIds:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                imageUrls:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                helpfulCount:
 *                  default: 0
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *              required:
 *                - spotId
 *                - comment
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
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
 *      x-source-file: "app/api/spots/[id]/reviews/route.ts"
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    const body = await request.json();
    const input = createReviewSchema.parse({
      ...body,
      spotId: spot.id,
    });
    const review = storeCreateReview(input);
    return jsonCreated(review);
  } catch (error) {
    return handleApiError(error);
  }
}
