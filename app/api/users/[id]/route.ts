import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateUserSchema } from "@/schemas";
import { storeGetCustomerById, storeUpdateCustomer } from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/{id} — Detail customer
 *
 * Mengambil profil customer berdasarkan id.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getCustomer.
 *
 * @openapi
 *  "/api/users/{id}":
 *    get:
 *      tags:
 *        - Users
 *      operationId: getCustomer
 *      summary: "Detail customer"
 *      description: "Mengambil profil customer berdasarkan id."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Customer id."
 *          schema:
 *            type: string
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
 *      x-source-file: "app/api/users/[id]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const user = storeGetCustomerById(id);
    if (!user) {
      return jsonError("NOT_FOUND", `User '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(user);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/users/{id} — Perbarui customer
 *
 * Memperbarui profil customer berdasarkan id.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateCustomer.
 *
 * @openapi
 *  "/api/users/{id}":
 *    patch:
 *      tags:
 *        - Users
 *      operationId: updateCustomer
 *      summary: "Perbarui customer"
 *      description: "Memperbarui profil customer berdasarkan id."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Customer id."
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
 *      x-source-file: "app/api/users/[id]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateUserSchema.parse(body);
    const updated = storeUpdateCustomer(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `User '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
