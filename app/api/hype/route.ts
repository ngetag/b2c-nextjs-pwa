import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createHypeItemSchema } from "@/schemas";
import { storeCreateHypeItem, storeListHypeItems } from "@/server/store";

/**
 * GET /api/hype — Feed Hype
 *
 * Daftar konten pendek (video Reels & photo carousel).
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listHype.
 *
 * @openapi
 *  /api/hype:
 *    get:
 *      tags:
 *        - Content
 *      operationId: listHype
 *      summary: "Feed Hype"
 *      description: "Daftar konten pendek (video Reels & photo carousel)."
 *      parameters:
 *        -
 *          name: eventId
 *          in: query
 *          required: false
 *          description: "Filter event."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/HypeItem"
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
 *      x-source-file: app/api/hype/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const eventId = sp.get("eventId") ?? undefined;
    return jsonOk(storeListHypeItems({ eventId }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/hype — Buat item Hype
 *
 * Menambahkan item Hype baru.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createHype.
 *
 * @openapi
 *  /api/hype:
 *    post:
 *      tags:
 *        - Content
 *      operationId: createHype
 *      summary: "Buat item Hype"
 *      description: "Menambahkan item Hype baru."
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
 *                type:
 *                  type: string
 *                  enum:
 *                    - video
 *                    - photo_carousel
 *                eventId:
 *                  type: string
 *                  minLength: 1
 *                eventName:
 *                  type: string
 *                  minLength: 1
 *                locationName:
 *                  type: string
 *                  minLength: 1
 *                organizerName:
 *                  type: string
 *                  minLength: 1
 *                organizerAvatar:
 *                  default: https://picsum.photos/seed/org-new/200/200
 *                  type: string
 *                caption:
 *                  type: string
 *                  minLength: 1
 *                tags:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                likesCount:
 *                  default: 0
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *                commentsCount:
 *                  default: 0
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *                sharesCount:
 *                  default: 0
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *                audioTitle:
 *                  default: "Original Sound — NgeTag"
 *                  type: string
 *                videoUrl:
 *                  type: string
 *                posterUrl:
 *                  type: string
 *                photos:
 *                  type: array
 *                  items:
 *                    type: string
 *              required:
 *                - type
 *                - eventId
 *                - eventName
 *                - locationName
 *                - organizerName
 *                - caption
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/HypeItem"
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
 *      x-source-file: app/api/hype/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createHypeItemSchema.parse(body);
    const created = storeCreateHypeItem(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
