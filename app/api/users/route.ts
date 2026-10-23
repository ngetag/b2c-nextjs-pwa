import { handleApiError, jsonOk } from "@/lib/api-response";
import { storeListCustomers } from "@/server/store";

/**
 * GET /api/users — Daftar customer
 *
 * Daftar seluruh customer (agregat B2C).
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listCustomers.
 *
 * @openapi
 *  /api/users:
 *    get:
 *      tags:
 *        - Users
 *      operationId: listCustomers
 *      summary: "Daftar customer"
 *      description: "Daftar seluruh customer (agregat B2C)."
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
 *      security: []
 *      x-auth-mode: none
 *      x-source-file: app/api/users/route.ts
 */
export async function GET() {
  try {
    return jsonOk(storeListCustomers());
  } catch (error) {
    return handleApiError(error);
  }
}
