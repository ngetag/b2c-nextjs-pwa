import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { toggleBookmarkSchema } from "@/schemas";
import { storeListBookmarks, storeToggleBookmark } from "@/server/store";

/**
 * GET /api/engagements/bookmarks — Daftar bookmark
 *
 * Bookmark spot/event milik user.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#listBookmarks.
 *
 * @openapi
 *  /api/engagements/bookmarks:
 *    get:
 *      tags:
 *        - Engagements
 *      operationId: listBookmarks
 *      summary: "Daftar bookmark"
 *      description: "Bookmark spot/event milik user."
 *      parameters:
 *        -
 *          name: userId
 *          in: query
 *          required: false
 *          description: "Filter user."
 *          schema:
 *            type: string
 *        -
 *          name: targetType
 *          in: query
 *          required: false
 *          description: "Filter tipe target."
 *          schema:
 *            type: string
 *            enum:
 *              - spot
 *              - event
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Bookmark"
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
 *      x-source-file: app/api/engagements/bookmarks/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const userId = sp.get("userId") ?? undefined;
    const targetTypeParam = sp.get("targetType");
    const targetType =
      targetTypeParam === "spot" || targetTypeParam === "event"
        ? targetTypeParam
        : undefined;
    return jsonOk(storeListBookmarks({ userId, targetType }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/engagements/bookmarks — Toggle bookmark
 *
 * Menyimpan atau menghapus bookmark.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#toggleBookmark.
 *
 * @openapi
 *  /api/engagements/bookmarks:
 *    post:
 *      tags:
 *        - Engagements
 *      operationId: toggleBookmark
 *      summary: "Toggle bookmark"
 *      description: "Menyimpan atau menghapus bookmark."
 *      requestBody:
 *        required: true
 *        description: "Payload JSON."
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                userId:
 *                  default: u-demo
 *                  type: string
 *                  minLength: 1
 *                targetType:
 *                  type: string
 *                  enum:
 *                    - spot
 *                    - event
 *                targetId:
 *                  type: string
 *                  minLength: 1
 *              required:
 *                - targetType
 *                - targetId
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
 *      x-source-file: app/api/engagements/bookmarks/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = toggleBookmarkSchema.parse(body);
    return jsonOk(storeToggleBookmark(input));
  } catch (error) {
    return handleApiError(error);
  }
}
