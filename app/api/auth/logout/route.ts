import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import {
  clearAuthCookies,
  getAuthContext,
  readRefreshToken,
  revokeSessionByRefreshToken,
} from "@/lib/auth/session";
import { getAuthRepo } from "@/server/auth";

/**
 * POST /api/auth/logout — Keluar dari sesi saat ini
 *
 * Mencabut sesi refresh token (atau sesi dari JWT bearer) dan menghapus cookie
 * autentikasi.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#logout.
 *
 * @openapi
 *  /api/auth/logout:
 *    post:
 *      tags:
 *        - Auth
 *      operationId: logout
 *      summary: "Keluar dari sesi saat ini"
 *      description: "Mencabut sesi refresh token (atau sesi dari JWT bearer) dan menghapus cookie autentikasi."
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
 *      x-source-file: app/api/auth/logout/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const refreshToken = readRefreshToken(request);

    if (refreshToken) {
      await revokeSessionByRefreshToken(refreshToken);
    } else {
      const context = await getAuthContext(request, { verifySession: false });
      if (context) {
        const repo = await getAuthRepo();
        await repo.revokeSession(context.sessionId);
      }
    }

    const response = jsonOk({ success: true, message: "Berhasil keluar" });
    return clearAuthCookies(response);
  } catch (error) {
    return handleApiError(error);
  }
}
