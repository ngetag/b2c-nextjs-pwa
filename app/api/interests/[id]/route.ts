import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateInterestSchema } from "@/schemas";
import {
  storeDeleteInterest,
  storeGetInterestById,
  storeUpdateInterest,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/interests/{id} — Detail interest
 *
 * Mengambil interest berdasarkan id atau slug.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getInterest.
 *
 * @openapi
 *  "/api/interests/{id}":
 *    get:
 *      tags:
 *        - Taxonomy
 *      operationId: getInterest
 *      summary: "Detail interest"
 *      description: "Mengambil interest berdasarkan id atau slug."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Interest id atau slug."
 *          schema:
 *            type: string
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
 *      x-source-file: "app/api/interests/[id]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const interest = storeGetInterestById(id);
    if (!interest) {
      return jsonError("NOT_FOUND", `Interest '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(interest);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/interests/{id} — Perbarui interest
 *
 * Memperbarui interest.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateInterest.
 *
 * @openapi
 *  "/api/interests/{id}":
 *    patch:
 *      tags:
 *        - Taxonomy
 *      operationId: updateInterest
 *      summary: "Perbarui interest"
 *      description: "Memperbarui interest."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Interest id atau slug."
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
 *      security:
 *        -
 *          bearerAuth: []
 *        -
 *          {}
 *      x-auth-mode: optional
 *      x-source-file: "app/api/interests/[id]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateInterestSchema.parse(body);
    const updated = storeUpdateInterest(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Interest '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/interests/{id} — Hapus interest
 *
 * Menghapus interest.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deleteInterest.
 *
 * @openapi
 *  "/api/interests/{id}":
 *    delete:
 *      tags:
 *        - Taxonomy
 *      operationId: deleteInterest
 *      summary: "Hapus interest"
 *      description: "Menghapus interest."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Interest id atau slug."
 *          schema:
 *            type: string
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
 *      x-source-file: "app/api/interests/[id]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteInterest(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Interest '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
