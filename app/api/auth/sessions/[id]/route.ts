import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth/guards";
import { getAuthRepo } from "@/server/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/auth/sessions/{id} — Cabut satu sesi
 *
 * Mencabut sesi milik customer sendiri (remote logout). `404` bila sesi bukan milik
 * caller.
 *
 * Auth: Wajib JWT (Authorization: Bearer <token>).
 * Sumber kontrak: src/server/openapi/registry.ts#revokeAuthSession.
 *
 * @openapi
 *  "/api/auth/sessions/{id}":
 *    delete:
 *      tags:
 *        - Auth
 *      operationId: revokeAuthSession
 *      summary: "Cabut satu sesi"
 *      description: "Mencabut sesi milik customer sendiri (remote logout). `404` bila sesi bukan milik caller."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Session id (`sess_...`)."
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
 *      x-source-file: "app/api/auth/sessions/[id]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth(_request);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const repo = await getAuthRepo();
    const session = await repo.getSessionById(id);

    if (!session || session.customerId !== auth.context.user.id) {
      return jsonError("NOT_FOUND", "Sesi tidak ditemukan", 404);
    }

    await repo.revokeSession(id);
    return jsonOk({ success: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
