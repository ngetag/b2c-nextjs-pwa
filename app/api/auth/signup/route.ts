import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/auth/session";
import { signupSchema } from "@/schemas";
import {
  authErrorResponse,
  sessionMetaFromRequest,
} from "@/server/auth/http";
import { signup } from "@/server/auth/service";

/**
 * POST /api/auth/signup — Daftar akun baru (email + password)
 *
 * Membuat customer, menyimpan password sebagai hash scrypt, menyimpan minat/favourite
 * tag untuk cold-start rekomendasi, lalu menerbitkan access JWT (15 menit) dan refresh
 * token (30 hari).
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#signup.
 *
 * @openapi
 *  /api/auth/signup:
 *    post:
 *      tags:
 *        - Auth
 *      operationId: signup
 *      summary: "Daftar akun baru (email + password)"
 *      description: "Membuat customer, menyimpan password sebagai hash scrypt, menyimpan minat/favourite tag untuk cold-start rekomendasi, lalu menerbitkan access JWT (15 menit) dan refresh token (30 hari)."
 *      requestBody:
 *        required: true
 *        description: "Data pendaftaran + onboarding personalisasi."
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  minLength: 2
 *                  maxLength: 80
 *                email:
 *                  type: string
 *                  minLength: 5
 *                  maxLength: 255
 *                  format: email
 *                  pattern: "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
 *                password:
 *                  type: string
 *                  minLength: 8
 *                  maxLength: 128
 *                interestIds:
 *                  default: []
 *                  maxItems: 20
 *                  type: array
 *                  items:
 *                    type: string
 *                    minLength: 1
 *                favoriteTagIds:
 *                  default: []
 *                  maxItems: 30
 *                  type: array
 *                  items:
 *                    type: string
 *                    minLength: 1
 *                city:
 *                  type: string
 *                  maxLength: 128
 *                acceptTerms:
 *                  default: true
 *                  type: boolean
 *              required:
 *                - name
 *                - email
 *                - password
 *              additionalProperties: false
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
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
 *      x-source-file: app/api/auth/signup/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = signupSchema.parse(body);
    const { session } = await signup(input, sessionMetaFromRequest(request));

    const response = jsonCreated(session.payload);
    return setAuthCookies(response, session.payload);
  } catch (error) {
    try {
      return authErrorResponse(error);
    } catch (mapped) {
      return handleApiError(mapped);
    }
  }
}
