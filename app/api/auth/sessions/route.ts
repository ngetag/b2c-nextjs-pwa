import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth/guards";
import { revokeAllSessions } from "@/lib/auth/session";
import { getAuthRepo } from "@/server/auth";

/**
 * GET /api/auth/sessions — Daftar sesi aktif (perangkat)
 *
 * Menampilkan sesi refresh token yang masih aktif beserta user agent dan waktu pemakaian
 * terakhir.
 *
 * Auth: Wajib JWT (Authorization: Bearer <token>).
 * Sumber kontrak: src/server/openapi/registry.ts#listAuthSessions.
 *
 * @openapi
 *  /api/auth/sessions:
 *    get:
 *      tags:
 *        - Auth
 *      operationId: listAuthSessions
 *      summary: "Daftar sesi aktif (perangkat)"
 *      description: "Menampilkan sesi refresh token yang masih aktif beserta user agent dan waktu pemakaian terakhir."
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
 *      x-source-file: app/api/auth/sessions/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const repo = await getAuthRepo();
    const sessions = await repo.listSessions(auth.context.user.id);
    const now = Date.now();

    const items = sessions
      .filter(
        (session) =>
          !session.revokedAt && new Date(session.expiresAt).getTime() > now,
      )
      .map((session) => ({
        id: session.id,
        provider: session.provider,
        userAgent: session.userAgent ?? null,
        createdAt: session.createdAt,
        lastUsedAt: session.lastUsedAt,
        expiresAt: session.expiresAt,
        current: session.id === auth.context.sessionId,
      }));

    return jsonOk({ sessions: items, total: items.length });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/auth/sessions — Keluar dari semua perangkat lain
 *
 * Mencabut semua sesi customer kecuali sesi yang sedang dipakai.
 *
 * Auth: Wajib JWT (Authorization: Bearer <token>).
 * Sumber kontrak: src/server/openapi/registry.ts#revokeOtherSessions.
 *
 * @openapi
 *  /api/auth/sessions:
 *    delete:
 *      tags:
 *        - Auth
 *      operationId: revokeOtherSessions
 *      summary: "Keluar dari semua perangkat lain"
 *      description: "Mencabut semua sesi customer kecuali sesi yang sedang dipakai."
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
 *      x-source-file: app/api/auth/sessions/route.ts
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const revoked = await revokeAllSessions(
      auth.context.user.id,
      auth.context.sessionId,
    );
    return jsonOk({ success: true, revoked });
  } catch (error) {
    return handleApiError(error);
  }
}
