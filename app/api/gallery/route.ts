import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createGalleryAssetSchema } from "@/schemas";
import {
  storeCreateGalleryAsset,
  storeListGalleryAssets,
} from "@/server/store";

/**
 * GET /api/gallery — Daftar aset gallery
 *
 * Aset foto/video untuk spot, event, atau promo.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#listGallery.
 *
 * @openapi
 *  /api/gallery:
 *    get:
 *      tags:
 *        - B2B
 *      operationId: listGallery
 *      summary: "Daftar aset gallery"
 *      description: "Aset foto/video untuk spot, event, atau promo."
 *      parameters:
 *        -
 *          name: ownerType
 *          in: query
 *          required: false
 *          description: "Tipe owner."
 *          schema:
 *            type: string
 *            enum:
 *              - spot
 *              - event
 *              - promo
 *        -
 *          name: ownerId
 *          in: query
 *          required: false
 *          description: "Id owner."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/GalleryAsset"
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
 *      x-source-file: app/api/gallery/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const ownerTypeParam = sp.get("ownerType");
    const ownerType =
      ownerTypeParam === "spot" ||
      ownerTypeParam === "event" ||
      ownerTypeParam === "promo"
        ? ownerTypeParam
        : undefined;
    const ownerId = sp.get("ownerId") ?? undefined;
    return jsonOk(storeListGalleryAssets({ ownerType, ownerId }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/gallery — Tambah aset gallery
 *
 * Menambahkan aset media baru.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createGalleryAsset.
 *
 * @openapi
 *  /api/gallery:
 *    post:
 *      tags:
 *        - B2B
 *      operationId: createGalleryAsset
 *      summary: "Tambah aset gallery"
 *      description: "Menambahkan aset media baru."
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
 *                ownerType:
 *                  type: string
 *                  enum:
 *                    - spot
 *                    - event
 *                    - promo
 *                ownerId:
 *                  type: string
 *                  minLength: 1
 *                type:
 *                  default: image
 *                  type: string
 *                  enum:
 *                    - image
 *                    - video
 *                url:
 *                  type: string
 *                  minLength: 1
 *                alt:
 *                  type: string
 *                sortOrder:
 *                  default: 0
 *                  type: integer
 *                  minimum: -9007199254740991
 *                  maximum: 9007199254740991
 *                isCover:
 *                  default: false
 *                  type: boolean
 *              required:
 *                - ownerType
 *                - ownerId
 *                - url
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/GalleryAsset"
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
 *      x-source-file: app/api/gallery/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createGalleryAssetSchema.parse(body);
    return jsonCreated(storeCreateGalleryAsset(input));
  } catch (error) {
    return handleApiError(error);
  }
}
