import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateQrCodeSchema } from "@/schemas";
import {
  storeDeleteQrCode,
  storeGetQrCodeById,
  storeUpdateQrCode,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/qr-codes/{id} — Detail QR code
 *
 * Mengambil QR code.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#getQrCode.
 *
 * @openapi
 *  "/api/qr-codes/{id}":
 *    get:
 *      tags:
 *        - B2B
 *      operationId: getQrCode
 *      summary: "Detail QR code"
 *      description: "Mengambil QR code."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "QR code id."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/QrCode"
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
 *      x-source-file: "app/api/qr-codes/[id]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const qr = storeGetQrCodeById(id);
    if (!qr) {
      return jsonError("NOT_FOUND", `QR Code '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(qr);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/qr-codes/{id} — Perbarui QR code
 *
 * Memperbarui QR code.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateQrCode.
 *
 * @openapi
 *  "/api/qr-codes/{id}":
 *    patch:
 *      tags:
 *        - B2B
 *      operationId: updateQrCode
 *      summary: "Perbarui QR code"
 *      description: "Memperbarui QR code."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "QR code id."
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
 *                ownerId:
 *                  type: string
 *                targetType:
 *                  type: string
 *                  enum:
 *                    - spot-review
 *                    - spot
 *                    - event
 *                    - promo
 *                targetId:
 *                  type: string
 *                  minLength: 1
 *                url:
 *                  type: string
 *                  minLength: 1
 *                label:
 *                  type: string
 *                isActive:
 *                  default: true
 *                  type: boolean
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/QrCode"
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
 *      x-source-file: "app/api/qr-codes/[id]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateQrCodeSchema.parse(body);
    const updated = storeUpdateQrCode(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `QR Code '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/qr-codes/{id} — Hapus QR code
 *
 * Menghapus QR code.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deleteQrCode.
 *
 * @openapi
 *  "/api/qr-codes/{id}":
 *    delete:
 *      tags:
 *        - B2B
 *      operationId: deleteQrCode
 *      summary: "Hapus QR code"
 *      description: "Menghapus QR code."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "QR code id."
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
 *      x-source-file: "app/api/qr-codes/[id]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteQrCode(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `QR Code '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
