import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createOwnerSchema } from "@/schemas";
import { storeCreateOwner, storeListOwners } from "@/server/store";

/**
 * GET /api/owners — Daftar owner
 *
 * Akun B2B pengelola spot, event, promo, komunitas.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#listOwners.
 *
 * @openapi
 *  /api/owners:
 *    get:
 *      tags:
 *        - B2B
 *      operationId: listOwners
 *      summary: "Daftar owner"
 *      description: "Akun B2B pengelola spot, event, promo, komunitas."
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Owner"
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
 *      x-source-file: app/api/owners/route.ts
 */
export async function GET() {
  try {
    return jsonOk(storeListOwners());
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/owners — Buat owner
 *
 * Membuat akun owner baru.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createOwner.
 *
 * @openapi
 *  /api/owners:
 *    post:
 *      tags:
 *        - B2B
 *      operationId: createOwner
 *      summary: "Buat owner"
 *      description: "Membuat akun owner baru."
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
 *                name:
 *                  type: string
 *                  minLength: 2
 *                email:
 *                  type: string
 *                  format: email
 *                  pattern: "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
 *                phone:
 *                  type: string
 *                avatarUrl:
 *                  type: string
 *                role:
 *                  default: owner
 *                  type: string
 *                  enum:
 *                    - owner
 *                    - manager
 *                    - staff
 *                status:
 *                  default: active
 *                  type: string
 *                  enum:
 *                    - invited
 *                    - active
 *                    - suspended
 *                businessName:
 *                  type: string
 *                  minLength: 2
 *                managedSpotIds:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                managedEventIds:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *              required:
 *                - name
 *                - email
 *                - businessName
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Owner"
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
 *      x-source-file: app/api/owners/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createOwnerSchema.parse(body);
    return jsonCreated(storeCreateOwner(input));
  } catch (error) {
    return handleApiError(error);
  }
}
