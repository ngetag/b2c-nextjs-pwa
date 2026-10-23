import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import { createTagSchema } from "@/schemas";
import {
  storeCreateTag,
  storeGetTagsByIds,
  storeListTags,
} from "@/server/store";

/**
 * GET /api/tags — Daftar tag
 *
 * Daftar tag dengan filter kategori, trending, dan id. Dipakai untuk chip discovery dan
 * filter.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listTags.
 *
 * @openapi
 *  /api/tags:
 *    get:
 *      tags:
 *        - Taxonomy
 *      operationId: listTags
 *      summary: "Daftar tag"
 *      description: "Daftar tag dengan filter kategori, trending, dan id. Dipakai untuk chip discovery dan filter."
 *      parameters:
 *        -
 *          name: category
 *          in: query
 *          required: false
 *          description: "Kategori tag."
 *          schema:
 *            type: string
 *            enum:
 *              - vibe
 *              - cuisine
 *              - activity
 *              - price
 *              - occasion
 *        -
 *          name: trending
 *          in: query
 *          required: false
 *          description: "Hanya tag trending."
 *          schema:
 *            type: boolean
 *        -
 *          name: trendingLimit
 *          in: query
 *          required: false
 *          description: "Jumlah tag trending."
 *          schema:
 *            type: integer
 *        -
 *          name: ids
 *          in: query
 *          required: false
 *          description: "Filter id tag. CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: limit
 *          in: query
 *          required: false
 *          description: "Jumlah maksimum."
 *          schema:
 *            type: integer
 *        -
 *          name: includeInactive
 *          in: query
 *          required: false
 *          description: "Sertakan tag non-aktif."
 *          schema:
 *            type: boolean
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Tag"
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
 *      x-source-file: app/api/tags/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const ids = readArrayParam(
      sp.getAll("ids").length > 0 ? sp.getAll("ids") : (sp.get("ids") ?? undefined),
    );
    if (ids.length > 0) {
      return jsonOk(storeGetTagsByIds(ids));
    }

    const category = sp.get("category") ?? undefined;
    const includeInactive = sp.get("includeInactive") === "true";
    const trendingLimit = readNumberParam(
      sp.get("trendingLimit") ?? sp.get("limit") ?? undefined,
    );

    return jsonOk(
      storeListTags({
        category,
        includeInactive,
        trendingLimit: sp.get("trending") === "true" ? (trendingLimit ?? 8) : trendingLimit,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tags — Tambah tag
 *
 * Membuat tag baru.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createTag.
 *
 * @openapi
 *  /api/tags:
 *    post:
 *      tags:
 *        - Taxonomy
 *      operationId: createTag
 *      summary: "Tambah tag"
 *      description: "Membuat tag baru."
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
 *                slug:
 *                  type: string
 *                  minLength: 1
 *                name:
 *                  type: string
 *                  minLength: 1
 *                category:
 *                  type: string
 *                  enum:
 *                    - vibe
 *                    - cuisine
 *                    - activity
 *                    - price
 *                    - occasion
 *                iconName:
 *                  type: string
 *                trendingScore:
 *                  default: 50
 *                  type: number
 *                  minimum: 0
 *                  maximum: 100
 *                isActive:
 *                  default: true
 *                  type: boolean
 *              required:
 *                - name
 *                - category
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Tag"
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
 *      x-source-file: app/api/tags/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createTagSchema.parse(body);
    const created = storeCreateTag(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
