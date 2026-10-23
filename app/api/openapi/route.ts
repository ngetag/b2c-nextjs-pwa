import { jsonOk } from "@/lib/api-response";
import { buildOpenApiDocument } from "@/server/openapi/document";

/**
 * GET /api/openapi — Spesifikasi OpenAPI 3.1
 *
 * Dokumen OpenAPI lengkap untuk seluruh endpoint NgeTag Customer Web App. Dipakai oleh
 * Swagger UI di `/api-docs`.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getOpenApiDocument.
 *
 * @openapi
 *  /api/openapi:
 *    get:
 *      tags:
 *        - System
 *      operationId: getOpenApiDocument
 *      summary: "Spesifikasi OpenAPI 3.1"
 *      description: "Dokumen OpenAPI lengkap untuk seluruh endpoint NgeTag Customer Web App. Dipakai oleh Swagger UI di `/api-docs`."
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
 *      security: []
 *      x-auth-mode: none
 *      x-source-file: app/api/openapi/route.ts
 */
export async function GET() {
  return jsonOk(buildOpenApiDocument());
}
