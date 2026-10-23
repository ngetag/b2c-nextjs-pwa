import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import {
  clearAuthCookies,
  readRefreshToken,
  refreshAuthSession,
  setAuthCookies,
} from "@/lib/auth/session";
import { refreshTokenSchema } from "@/schemas";
import { sessionMetaFromRequest } from "@/server/auth/http";

/**
 * POST /api/auth/refresh — Rotasi refresh token
 *
 * Menerbitkan access token baru dan merotasi refresh token. Token lama langsung tidak
 * valid (replay window terbatas).
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#refreshToken.
 *
 * @openapi
 *  /api/auth/refresh:
 *    post:
 *      tags:
 *        - Auth
 *      operationId: refreshToken
 *      summary: "Rotasi refresh token"
 *      description: "Menerbitkan access token baru dan merotasi refresh token. Token lama langsung tidak valid (replay window terbatas)."
 *      requestBody:
 *        required: true
 *        description: "Opsional untuk browser — refresh token dibaca dari cookie httpOnly `ngetag_rt`."
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                refreshToken:
 *                  type: string
 *                  minLength: 20
 *              additionalProperties: false
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/AuthSessionPayload"
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
 *      x-source-file: app/api/auth/refresh/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { refreshToken } = refreshTokenSchema.parse(body ?? {});
    const token = refreshToken ?? readRefreshToken(request);

    const session = await refreshAuthSession(token, sessionMetaFromRequest(request));
    if (!session) {
      const response = jsonError(
        "INVALID_REFRESH_TOKEN",
        "Sesi sudah berakhir. Silakan masuk kembali.",
        401,
      );
      return clearAuthCookies(response);
    }

    const response = jsonOk(session.payload);
    return setAuthCookies(response, session.payload);
  } catch (error) {
    return handleApiError(error);
  }
}
