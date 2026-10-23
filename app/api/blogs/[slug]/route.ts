import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateBlogArticleSchema } from "@/schemas";
import {
  storeDeleteBlog,
  storeGetBlogBySlug,
  storeUpdateBlog,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/blogs/{slug} — Detail artikel
 *
 * Mengambil artikel berdasarkan slug.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getBlog.
 *
 * @openapi
 *  "/api/blogs/{slug}":
 *    get:
 *      tags:
 *        - Content
 *      operationId: getBlog
 *      summary: "Detail artikel"
 *      description: "Mengambil artikel berdasarkan slug."
 *      parameters:
 *        -
 *          name: slug
 *          in: path
 *          required: true
 *          description: "Slug artikel."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/BlogArticle"
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
 *      x-source-file: "app/api/blogs/[slug]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const blog = storeGetBlogBySlug(slug);
    if (!blog) {
      return jsonError("NOT_FOUND", `Artikel '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk(blog);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/blogs/{slug} — Perbarui artikel
 *
 * Memperbarui artikel.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateBlog.
 *
 * @openapi
 *  "/api/blogs/{slug}":
 *    patch:
 *      tags:
 *        - Content
 *      operationId: updateBlog
 *      summary: "Perbarui artikel"
 *      description: "Memperbarui artikel."
 *      parameters:
 *        -
 *          name: slug
 *          in: path
 *          required: true
 *          description: "Slug artikel."
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
 *                slug:
 *                  type: string
 *                title:
 *                  type: string
 *                  minLength: 3
 *                excerpt:
 *                  type: string
 *                  minLength: 10
 *                coverImageUrl:
 *                  default: https://picsum.photos/seed/blog-new/1400/900
 *                  type: string
 *                  minLength: 1
 *                author:
 *                  default: "Tim NgeTag"
 *                  type: string
 *                  minLength: 1
 *                publishedAt:
 *                  type: string
 *                category:
 *                  type: string
 *                  minLength: 1
 *                tags:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                region:
 *                  default: Jakarta
 *                  type: string
 *                  minLength: 1
 *                spotIds:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                sections:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      heading:
 *                        type: string
 *                        minLength: 1
 *                      paragraphs:
 *                        type: array
 *                        items:
 *                          type: string
 *                          minLength: 1
 *                    required:
 *                      - heading
 *                      - paragraphs
 *                featured:
 *                  default: false
 *                  type: boolean
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/BlogArticle"
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
 *      x-source-file: "app/api/blogs/[slug]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const patch = updateBlogArticleSchema.parse(body);
    const updated = storeUpdateBlog(slug, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Artikel '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/blogs/{slug} — Hapus artikel
 *
 * Menghapus artikel.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deleteBlog.
 *
 * @openapi
 *  "/api/blogs/{slug}":
 *    delete:
 *      tags:
 *        - Content
 *      operationId: deleteBlog
 *      summary: "Hapus artikel"
 *      description: "Menghapus artikel."
 *      parameters:
 *        -
 *          name: slug
 *          in: path
 *          required: true
 *          description: "Slug artikel."
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
 *      x-source-file: "app/api/blogs/[slug]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const deleted = storeDeleteBlog(slug);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Artikel '${slug}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, slug });
  } catch (error) {
    return handleApiError(error);
  }
}
