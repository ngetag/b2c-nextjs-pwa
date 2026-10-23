import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { createQrCodeSchema } from "@/schemas";
import { storeCreateQrCode, storeListQrCodes } from "@/server/store";

/**
 * GET /api/qr-codes — Daftar QR code
 *
 * QR code lokasi untuk review terverifikasi/halaman publik.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#listQrCodes.
 *
 * @openapi
 *  /api/qr-codes:
 *    get:
 *      tags:
 *        - B2B
 *      operationId: listQrCodes
 *      summary: "Daftar QR code"
 *      description: "QR code lokasi untuk review terverifikasi/halaman publik."
 *      parameters:
 *        -
 *          name: ownerId
 *          in: query
 *          required: false
 *          description: "Filter owner."
 *          schema:
 *            type: string
 *        -
 *          name: targetType
 *          in: query
 *          required: false
 *          description: "Filter target."
 *          schema:
 *            type: string
 *            enum:
 *              - spot-review
 *              - spot
 *              - event
 *              - promo
 *        -
 *          name: targetId
 *          in: query
 *          required: false
 *          description: "Filter target id."
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
 *      x-source-file: app/api/qr-codes/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const targetType = sp.get("targetType") ?? undefined;
    const targetId = sp.get("targetId") ?? undefined;
    const ownerId = sp.get("ownerId") ?? undefined;
    return jsonOk(storeListQrCodes({ targetType, targetId, ownerId }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/qr-codes — Buat QR code
 *
 * Membuat QR code baru.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createQrCode.
 *
 * @openapi
 *  /api/qr-codes:
 *    post:
 *      tags:
 *        - B2B
 *      operationId: createQrCode
 *      summary: "Buat QR code"
 *      description: "Membuat QR code baru."
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
 *              required:
 *                - targetType
 *                - targetId
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
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
 *      x-source-file: app/api/qr-codes/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createQrCodeSchema.parse(body);
    return jsonCreated(storeCreateQrCode(input));
  } catch (error) {
    return handleApiError(error);
  }
}
