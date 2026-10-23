import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateTagSchema } from "@/schemas";
import {
  storeDeleteTag,
  storeGetTagBySlugOrId,
  storeUpdateTag,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/tags/{slug} — Detail tag
 *
 * Mengambil tag berdasarkan slug atau id.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getTag.
 *
 * @openapi
 *  "/api/tags/{slug}":
 *    get:
 *      tags:
 *        - Taxonomy
 *      operationId: getTag
 *      summary: "Detail tag"
 *      description: "Mengambil tag berdasarkan slug atau id."
 *      parameters:
 *        -
 *          name: slug
 *          in: path
 *          required: true
 *          description: "Slug atau id tag."
 *          schema:
 *            type: string
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
 *      x-source-file: "app/api/tags/[slug]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const tag = storeGetTagBySlugOrId(slug);
    if (!tag) {
      return jsonError("NOT_FOUND", `Tag '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk(tag);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/tags/{slug} — Perbarui tag
 *
 * Memperbarui tag.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateTag.
 *
 * @openapi
 *  "/api/tags/{slug}":
 *    patch:
 *      tags:
 *        - Taxonomy
 *      operationId: updateTag
 *      summary: "Perbarui tag"
 *      description: "Memperbarui tag."
 *      parameters:
 *        -
 *          name: slug
 *          in: path
 *          required: true
 *          description: "Slug atau id tag."
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
 *      security:
 *        -
 *          bearerAuth: []
 *        -
 *          {}
 *      x-auth-mode: optional
 *      x-source-file: "app/api/tags/[slug]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const patch = updateTagSchema.parse(body);
    const updated = storeUpdateTag(slug, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Tag '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/tags/{slug} — Hapus tag
 *
 * Menghapus tag.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deleteTag.
 *
 * @openapi
 *  "/api/tags/{slug}":
 *    delete:
 *      tags:
 *        - Taxonomy
 *      operationId: deleteTag
 *      summary: "Hapus tag"
 *      description: "Menghapus tag."
 *      parameters:
 *        -
 *          name: slug
 *          in: path
 *          required: true
 *          description: "Slug atau id tag."
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
 *      security:
 *        -
 *          bearerAuth: []
 *        -
 *          {}
 *      x-auth-mode: optional
 *      x-source-file: "app/api/tags/[slug]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const deleted = storeDeleteTag(slug);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Tag '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, slug });
  } catch (error) {
    return handleApiError(error);
  }
}
