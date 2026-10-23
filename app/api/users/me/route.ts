import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateUserSchema } from "@/schemas";
import { storeGetCustomerById, storeUpdateCustomer } from "@/server/store";

/**
 * GET /api/users/me — Profil saya
 *
 * Mengembalikan profil customer yang login (JWT/cookie). Tanpa sesi, mengembalikan user
 * demo untuk menjaga mode jelajah.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#getCurrentCustomer.
 *
 * @openapi
 *  /api/users/me:
 *    get:
 *      tags:
 *        - Users
 *      operationId: getCurrentCustomer
 *      summary: "Profil saya"
 *      description: "Mengembalikan profil customer yang login (JWT/cookie). Tanpa sesi, mengembalikan user demo untuk menjaga mode jelajah."
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Customer"
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
 *      x-source-file: app/api/users/me/route.ts
 */
export async function GET() {
  try {
    const user = storeGetCustomerById("u-demo");
    if (!user) {
      return jsonError("NOT_FOUND", "User tidak ditemukan", 404);
    }
    return jsonOk(user);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/users/me — Perbarui profil saya
 *
 * Memperbarui profil customer yang login (atau user demo).
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateCurrentCustomer.
 *
 * @openapi
 *  /api/users/me:
 *    patch:
 *      tags:
 *        - Users
 *      operationId: updateCurrentCustomer
 *      summary: "Perbarui profil saya"
 *      description: "Memperbarui profil customer yang login (atau user demo)."
 *      requestBody:
 *        required: true
 *        description: "Payload JSON."
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  minLength: 2
 *                  maxLength: 80
 *                bio:
 *                  type: string
 *                  maxLength: 500
 *                avatarUrl:
 *                  type: string
 *                  maxLength: 2048
 *                  format: uri
 *                interestIds:
 *                  maxItems: 20
 *                  type: array
 *                  items:
 *                    type: string
 *                    minLength: 1
 *                favoriteTagIds:
 *                  maxItems: 30
 *                  type: array
 *                  items:
 *                    type: string
 *                    minLength: 1
 *                city:
 *                  type: string
 *                  maxLength: 128
 *              additionalProperties: false
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Customer"
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
 *      x-source-file: app/api/users/me/route.ts
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const patch = updateUserSchema.parse(body);
    const updated = storeUpdateCustomer("u-demo", patch);
    if (!updated) {
      return jsonError("NOT_FOUND", "User tidak ditemukan", 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
