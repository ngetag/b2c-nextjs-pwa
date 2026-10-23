import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createCommunityCategorySchema } from "@/schemas";
import {
  getStore,
  slugifyText,
  storeListCommunityCategories,
} from "@/server/store";

/**
 * GET /api/communities/categories — Kategori komunitas
 *
 * Daftar kategori komunitas.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listCommunityCategories.
 *
 * @openapi
 *  /api/communities/categories:
 *    get:
 *      tags:
 *        - Communities
 *      operationId: listCommunityCategories
 *      summary: "Kategori komunitas"
 *      description: "Daftar kategori komunitas."
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/CommunityCategory"
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
 *      x-source-file: app/api/communities/categories/route.ts
 */
export async function GET() {
  try {
    return jsonOk(storeListCommunityCategories());
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/communities/categories — Tambah kategori komunitas
 *
 * Membuat kategori komunitas baru.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createCommunityCategory.
 *
 * @openapi
 *  /api/communities/categories:
 *    post:
 *      tags:
 *        - Communities
 *      operationId: createCommunityCategory
 *      summary: "Tambah kategori komunitas"
 *      description: "Membuat kategori komunitas baru."
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/CommunityCategory"
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
 *      x-source-file: app/api/communities/categories/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createCommunityCategorySchema.parse(body);
    const slug = input.slug ?? slugifyText(input.title);
    const category = {
      id: input.id ?? slug,
      title: input.title,
      name: input.name ?? input.title,
      slug,
      image: input.image,
      totalCommunities: 0,
    };
    getStore().communityCategories.push(category);
    return jsonCreated(category);
  } catch (error) {
    return handleApiError(error);
  }
}
