import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/auth/session";
import { loginSchema } from "@/schemas";
import {
  authErrorResponse,
  sessionMetaFromRequest,
} from "@/server/auth/http";
import { login } from "@/server/auth/service";

/**
 * POST /api/auth/login — Masuk dengan email & password
 *
 * Memverifikasi kredensial dengan scrypt dan membuka sesi refresh-token baru.
 * Mengembalikan klaim JWT (role, tier, points, interests, favoriteTags).
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#login.
 *
 * @openapi
 *  /api/auth/login:
 *    post:
 *      tags:
 *        - Auth
 *      operationId: login
 *      summary: "Masuk dengan email & password"
 *      description: "Memverifikasi kredensial dengan scrypt dan membuka sesi refresh-token baru. Mengembalikan klaim JWT (role, tier, points, interests, favoriteTags)."
 *      requestBody:
 *        required: true
 *        description: "Email dan password."
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  minLength: 5
 *                  maxLength: 255
 *                  format: email
 *                  pattern: "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
 *                password:
 *                  type: string
 *                  minLength: 1
 *                  maxLength: 128
 *              required:
 *                - email
 *                - password
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
 *      x-source-file: app/api/auth/login/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);
    const { session } = await login(input, sessionMetaFromRequest(request));

    const response = jsonOk(session.payload);
    return setAuthCookies(response, session.payload);
  } catch (error) {
    try {
      return authErrorResponse(error);
    } catch (mapped) {
      return handleApiError(mapped);
    }
  }
}
