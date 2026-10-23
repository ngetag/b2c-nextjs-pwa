import type { NextRequest } from "next/server";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
} from "@/lib/api-response";
import { createCommunityUpdatePostSchema } from "@/schemas";
import {
  storeAddCommunityUpdatePost,
  storeGetCommunityById,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/communities/{id}/updates — Update komunitas
 *
 * Daftar pengumuman/update komunitas.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listCommunityUpdates.
 *
 * @openapi
 *  "/api/communities/{id}/updates":
 *    get:
 *      tags:
 *        - Communities
 *      operationId: listCommunityUpdates
 *      summary: "Update komunitas"
 *      description: "Daftar pengumuman/update komunitas."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Community id."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/CommunityUpdate"
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
 *      x-source-file: "app/api/communities/[id]/updates/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const community = storeGetCommunityById(id);
    if (!community) {
      return jsonError("NOT_FOUND", `Komunitas '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(community.updates);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/communities/{id}/updates — Buat update komunitas
 *
 * Mempublikasikan update komunitas.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createCommunityUpdate.
 *
 * @openapi
 *  "/api/communities/{id}/updates":
 *    post:
 *      tags:
 *        - Communities
 *      operationId: createCommunityUpdate
 *      summary: "Buat update komunitas"
 *      description: "Mempublikasikan update komunitas."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Community id."
 *          schema:
 *            type: string
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
 *                title:
 *                  type: string
 *                  minLength: 2
 *                body:
 *                  type: string
 *                  minLength: 5
 *                authorName:
 *                  default: "Admin Komunitas"
 *                  type: string
 *                  minLength: 1
 *                publishedAt:
 *                  type: string
 *              required:
 *                - title
 *                - body
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/CommunityUpdate"
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
 *      x-source-file: "app/api/communities/[id]/updates/route.ts"
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = createCommunityUpdatePostSchema.parse(body);
    const updated = storeAddCommunityUpdatePost(id, input);
    if (!updated) {
      return jsonError("NOT_FOUND", `Komunitas '${id}' tidak ditemukan`, 404);
    }
    return jsonCreated(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
