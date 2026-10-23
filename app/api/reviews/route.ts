import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createReviewSchema } from "@/schemas";
import { storeCreateReview, storeListReviews } from "@/server/store";

/**
 * GET /api/reviews — Daftar ulasan
 *
 * Filter ulasan berdasarkan spot atau author.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listReviews.
 *
 * @openapi
 *  /api/reviews:
 *    get:
 *      tags:
 *        - Reviews
 *      operationId: listReviews
 *      summary: "Daftar ulasan"
 *      description: "Filter ulasan berdasarkan spot atau author."
 *      parameters:
 *        -
 *          name: spotId
 *          in: query
 *          required: false
 *          description: "Filter spot."
 *          schema:
 *            type: string
 *        -
 *          name: authorId
 *          in: query
 *          required: false
 *          description: "Filter penulis."
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
 *      x-source-file: app/api/reviews/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const spotId = sp.get("spotId") ?? undefined;
    const authorId = sp.get("authorId") ?? undefined;
    return jsonOk(storeListReviews({ spotId, authorId }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/reviews — Buat ulasan
 *
 * Membuat ulasan dan mencatat kunjungan terverifikasi.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createReview.
 *
 * @openapi
 *  /api/reviews:
 *    post:
 *      tags:
 *        - Reviews
 *      operationId: createReview
 *      summary: "Buat ulasan"
 *      description: "Membuat ulasan dan mencatat kunjungan terverifikasi."
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
 *      x-source-file: app/api/reviews/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createReviewSchema.parse(body);
    const created = storeCreateReview(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
