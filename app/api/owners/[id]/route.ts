import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateOwnerSchema } from "@/schemas";
import { storeGetOwnerById, storeUpdateOwner } from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/owners/{id} — Detail owner
 *
 * Mengambil akun owner.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#getOwner.
 *
 * @openapi
 *  "/api/owners/{id}":
 *    get:
 *      tags:
 *        - B2B
 *      operationId: getOwner
 *      summary: "Detail owner"
 *      description: "Mengambil akun owner."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Owner id."
 *          schema:
 *            type: string
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
 *      x-source-file: "app/api/owners/[id]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const owner = storeGetOwnerById(id);
    if (!owner) {
      return jsonError("NOT_FOUND", `Owner '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(owner);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/owners/{id} — Perbarui owner
 *
 * Memperbarui akun owner.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateOwner.
 *
 * @openapi
 *  "/api/owners/{id}":
 *    patch:
 *      tags:
 *        - B2B
 *      operationId: updateOwner
 *      summary: "Perbarui owner"
 *      description: "Memperbarui akun owner."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Owner id."
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
 *      x-source-file: "app/api/owners/[id]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateOwnerSchema.parse(body);
    const updated = storeUpdateOwner(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Owner '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
