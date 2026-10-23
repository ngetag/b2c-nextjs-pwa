import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam } from "@/lib/url";
import { createInterestSchema } from "@/schemas";
import { storeCreateInterest, storeListInterests } from "@/server/store";

/**
 * GET /api/interests — Daftar interest
 *
 * Daftar minat untuk personalisasi event dan komunitas.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listInterests.
 *
 * @openapi
 *  /api/interests:
 *    get:
 *      tags:
 *        - Taxonomy
 *      operationId: listInterests
 *      summary: "Daftar interest"
 *      description: "Daftar minat untuk personalisasi event dan komunitas."
 *      parameters:
 *        -
 *          name: ids
 *          in: query
 *          required: false
 *          description: "Filter id interest. CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: includeInactive
 *          in: query
 *          required: false
 *          description: "Sertakan interest non-aktif."
 *          schema:
 *            type: boolean
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Interest"
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
 *      x-source-file: app/api/interests/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const ids = readArrayParam(
      sp.getAll("ids").length > 0 ? sp.getAll("ids") : (sp.get("ids") ?? undefined),
    );
    const includeInactive = sp.get("includeInactive") === "true";

    return jsonOk(
      storeListInterests({
        ids: ids.length > 0 ? ids : undefined,
        includeInactive,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/interests — Tambah interest
 *
 * Membuat interest baru.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createInterest.
 *
 * @openapi
 *  /api/interests:
 *    post:
 *      tags:
 *        - Taxonomy
 *      operationId: createInterest
 *      summary: "Tambah interest"
 *      description: "Membuat interest baru."
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
 *                label:
 *                  type: string
 *                  minLength: 1
 *                slug:
 *                  type: string
 *                  minLength: 1
 *                isActive:
 *                  default: true
 *                  type: boolean
 *                sortOrder:
 *                  default: 0
 *                  type: integer
 *                  minimum: -9007199254740991
 *                  maximum: 9007199254740991
 *              required:
 *                - label
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Interest"
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
 *      x-source-file: app/api/interests/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createInterestSchema.parse(body);
    const created = storeCreateInterest(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
