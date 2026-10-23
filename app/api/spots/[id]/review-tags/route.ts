import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
} from "@/lib/api-response";
import { createReviewTagSchema } from "@/schemas";
import {
  storeCreateReviewTag,
  storeGetSpotById,
  storeListReviewTags,
  storeReplaceSpotReviewTags,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const replaceSpotReviewTagsSchema = z.object({
  tags: z.array(
    z.object({
      label: z.string().min(1),
      value: z.string().optional(),
      sortOrder: z.number().int().optional(),
      ownerEditable: z.boolean().optional(),
    }),
  ),
});

/**
 * GET /api/spots/{id}/review-tags — Chip ulasan per spot
 *
 * Daftar review tag yang dapat dipilih pada form ulasan spot.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listSpotReviewTags.
 *
 * @openapi
 *  "/api/spots/{id}/review-tags":
 *    get:
 *      tags:
 *        - Reviews
 *      operationId: listSpotReviewTags
 *      summary: "Chip ulasan per spot"
 *      description: "Daftar review tag yang dapat dipilih pada form ulasan spot."
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
 *      x-source-file: "app/api/spots/[id]/review-tags/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(storeListReviewTags({ spotId: spot.id }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/spots/{id}/review-tags — Tambah chip ulasan
 *
 * Menambahkan satu review tag untuk spot.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createSpotReviewTag.
 *
 * @openapi
 *  "/api/spots/{id}/review-tags":
 *    post:
 *      tags:
 *        - Reviews
 *      operationId: createSpotReviewTag
 *      summary: "Tambah chip ulasan"
 *      description: "Menambahkan satu review tag untuk spot."
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
 *      x-source-file: "app/api/spots/[id]/review-tags/route.ts"
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    const body = await request.json();
    const input = createReviewTagSchema.parse({
      ...body,
      spotId: spot.id,
    });
    const created = storeCreateReviewTag(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/spots/{id}/review-tags — Ganti seluruh chip ulasan
 *
 * Mengganti seluruh daftar review tag milik spot.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#replaceSpotReviewTags.
 *
 * @openapi
 *  "/api/spots/{id}/review-tags":
 *    put:
 *      tags:
 *        - Reviews
 *      operationId: replaceSpotReviewTags
 *      summary: "Ganti seluruh chip ulasan"
 *      description: "Mengganti seluruh daftar review tag milik spot."
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
 *                tags:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      label:
 *                        type: string
 *                        minLength: 1
 *                      value:
 *                        type: string
 *                      sortOrder:
 *                        type: integer
 *                        minimum: -9007199254740991
 *                        maximum: 9007199254740991
 *                      ownerEditable:
 *                        type: boolean
 *                    required:
 *                      - label
 *              required:
 *                - tags
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
 *      x-source-file: "app/api/spots/[id]/review-tags/route.ts"
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    const body = await request.json();
    const { tags } = replaceSpotReviewTagsSchema.parse(body);
    const updated = storeReplaceSpotReviewTags(spot.id, tags);
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
