import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth/guards";
import {
  mintAccessTokenForSession,
  setAuthCookies,
} from "@/lib/auth/session";
import { updateProfileSchema } from "@/schemas";
import { updateProfile } from "@/server/auth/service";

/**
 * PATCH /api/auth/profile — Perbarui profil & terbitkan ulang JWT
 *
 * Memperbarui nama, bio, avatar, minat, favourite tag, dan kota. Access token
 * diterbitkan ulang agar klaim tetap sinkron.
 *
 * Auth: Wajib JWT (Authorization: Bearer <token>).
 * Sumber kontrak: src/server/openapi/registry.ts#updateAuthProfile.
 *
 * @openapi
 *  /api/auth/profile:
 *    patch:
 *      tags:
 *        - Auth
 *      operationId: updateAuthProfile
 *      summary: "Perbarui profil & terbitkan ulang JWT"
 *      description: "Memperbarui nama, bio, avatar, minat, favourite tag, dan kota. Access token diterbitkan ulang agar klaim tetap sinkron."
 *      requestBody:
 *        required: true
 *        description: "Patch profil (semua field opsional)."
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
 *                "$ref": "#/components/schemas/AuthSessionPayload"
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
 *      x-source-file: app/api/auth/profile/route.ts
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const patch = updateProfileSchema.parse(body);

    const customer = await updateProfile(auth.context.user.id, patch);
    const payload = await mintAccessTokenForSession(customer, {
      sessionId: auth.context.sessionId,
      provider: auth.context.claims.provider,
      scope: auth.context.claims.scope.split(" "),
    });

    const response = jsonOk(payload);
    return setAuthCookies(response, payload);
  } catch (error) {
    return handleApiError(error);
  }
}
