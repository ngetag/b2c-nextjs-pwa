import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { unauthorizedResponse } from "@/lib/auth/guards";
import { getAuthContext } from "@/lib/auth/session";

/**
 * GET /api/auth/session — Sesi & klaim JWT aktif
 *
 * Mengembalikan user, klaim JWT terverifikasi, dan sisa masa berlaku token. `401` untuk
 * guest.
 *
 * Auth: Wajib JWT (Authorization: Bearer <token>).
 * Sumber kontrak: src/server/openapi/registry.ts#getSession.
 *
 * @openapi
 *  /api/auth/session:
 *    get:
 *      tags:
 *        - Auth
 *      operationId: getSession
 *      summary: "Sesi & klaim JWT aktif"
 *      description: "Mengembalikan user, klaim JWT terverifikasi, dan sisa masa berlaku token. `401` untuk guest."
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/AuthSessionInfo"
 *        400:
 *          description: "Payload/parameter tidak valid (`VALIDATION_ERROR`)."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Error"
 *        401:
 *          description: "Tidak terautentikasi (`UNAUTHENTICATED`)."
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
 *      x-auth-mode: bearer
 *      x-source-file: app/api/auth/session/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getAuthContext(request);
    if (!context) return unauthorizedResponse("Belum masuk");

    const expiresIn = Math.max(
      0,
      context.claims.exp - Math.floor(Date.now() / 1000),
    );

    return jsonOk({
      authenticated: true,
      user: context.user,
      claims: context.claims,
      expiresIn,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
