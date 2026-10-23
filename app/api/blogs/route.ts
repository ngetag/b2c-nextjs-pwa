import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createBlogArticleSchema } from "@/schemas";
import { storeCreateBlog, storeListBlogs } from "@/server/store";

/**
 * GET /api/blogs — Daftar artikel blog
 *
 * Artikel editorial, dapat difilter kategori dan featured.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listBlogs.
 *
 * @openapi
 *  /api/blogs:
 *    get:
 *      tags:
 *        - Content
 *      operationId: listBlogs
 *      summary: "Daftar artikel blog"
 *      description: "Artikel editorial, dapat difilter kategori dan featured."
 *      parameters:
 *        -
 *          name: category
 *          in: query
 *          required: false
 *          description: "Kategori artikel."
 *          schema:
 *            type: string
 *        -
 *          name: featured
 *          in: query
 *          required: false
 *          description: "Hanya artikel unggulan."
 *          schema:
 *            type: boolean
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
 *      x-source-file: app/api/blogs/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const category = sp.get("category") ?? undefined;
    const featuredParam = sp.get("featured");
    const featured =
      featuredParam === "true"
        ? true
        : featuredParam === "false"
          ? false
          : undefined;
    return jsonOk(storeListBlogs({ category, featured }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/blogs — Buat artikel blog
 *
 * Membuat artikel editorial baru.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createBlog.
 *
 * @openapi
 *  /api/blogs:
 *    post:
 *      tags:
 *        - Content
 *      operationId: createBlog
 *      summary: "Buat artikel blog"
 *      description: "Membuat artikel editorial baru."
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
 *              required:
 *                - title
 *                - excerpt
 *                - category
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
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
 *      x-source-file: app/api/blogs/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createBlogArticleSchema.parse(body);
    const created = storeCreateBlog(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
