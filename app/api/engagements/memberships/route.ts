import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { toggleMembershipSchema } from "@/schemas";
import {
  storeListCommunityMemberships,
  storeToggleCommunityMembership,
} from "@/server/store";

/**
 * GET /api/engagements/memberships — Daftar keanggotaan komunitas
 *
 * Komunitas yang diikuti user.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#listMemberships.
 *
 * @openapi
 *  /api/engagements/memberships:
 *    get:
 *      tags:
 *        - Engagements
 *      operationId: listMemberships
 *      summary: "Daftar keanggotaan komunitas"
 *      description: "Komunitas yang diikuti user."
 *      parameters:
 *        -
 *          name: userId
 *          in: query
 *          required: false
 *          description: "Filter user."
 *          schema:
 *            type: string
 *        -
 *          name: communityId
 *          in: query
 *          required: false
 *          description: "Filter komunitas."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/CommunityMembership"
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
 *      x-source-file: app/api/engagements/memberships/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const userId = sp.get("userId") ?? undefined;
    const communityId = sp.get("communityId") ?? undefined;
    return jsonOk(storeListCommunityMemberships({ userId, communityId }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/engagements/memberships — Toggle keanggotaan komunitas
 *
 * Bergabung/keluar dari komunitas.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#toggleMembership.
 *
 * @openapi
 *  /api/engagements/memberships:
 *    post:
 *      tags:
 *        - Engagements
 *      operationId: toggleMembership
 *      summary: "Toggle keanggotaan komunitas"
 *      description: "Bergabung/keluar dari komunitas."
 *      requestBody:
 *        required: true
 *        description: "Payload JSON."
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                userId:
 *                  default: u-demo
 *                  type: string
 *                  minLength: 1
 *                communityId:
 *                  type: string
 *                  minLength: 1
 *              required:
 *                - communityId
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
 *      x-source-file: app/api/engagements/memberships/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = toggleMembershipSchema.parse(body);
    return jsonOk(storeToggleCommunityMembership(input));
  } catch (error) {
    return handleApiError(error);
  }
}
