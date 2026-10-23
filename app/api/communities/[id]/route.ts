import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { updateCommunitySchema } from "@/schemas";
import {
  storeDeleteCommunity,
  storeGetCommunityById,
  storeUpdateCommunity,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/communities/{id} — Detail komunitas
 *
 * Mengambil detail komunitas.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getCommunity.
 *
 * @openapi
 *  "/api/communities/{id}":
 *    get:
 *      tags:
 *        - Communities
 *      operationId: getCommunity
 *      summary: "Detail komunitas"
 *      description: "Mengambil detail komunitas."
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
 *                "$ref": "#/components/schemas/Community"
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
 *      x-source-file: "app/api/communities/[id]/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const community = storeGetCommunityById(id);
    if (!community) {
      return jsonError("NOT_FOUND", `Komunitas '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(community);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/communities/{id} — Perbarui komunitas
 *
 * Memperbarui sebagian field komunitas.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#updateCommunity.
 *
 * @openapi
 *  "/api/communities/{id}":
 *    patch:
 *      tags:
 *        - Communities
 *      operationId: updateCommunity
 *      summary: "Perbarui komunitas"
 *      description: "Memperbarui sebagian field komunitas."
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
 *                ownerId:
 *                  type: string
 *                title:
 *                  type: string
 *                  minLength: 2
 *                description:
 *                  type: string
 *                  minLength: 10
 *                coverImage:
 *                  default: https://picsum.photos/seed/community-new/900/520
 *                  type: string
 *                  minLength: 1
 *                categoryId:
 *                  type: string
 *                  minLength: 1
 *                tags:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                memberCount:
 *                  default: 1
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *                activeEvents:
 *                  default: 0
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *                isOfficial:
 *                  default: false
 *                  type: boolean
 *                managedBy:
 *                  type: string
 *                managementName:
 *                  type: string
 *                communityType:
 *                  default: club
 *                  type: string
 *                  enum:
 *                    - official
 *                    - fanbase
 *                    - team
 *                    - guild
 *                    - creator
 *                    - club
 *                    - learning
 *                    - network
 *                updates:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        minLength: 1
 *                      title:
 *                        type: string
 *                        minLength: 1
 *                      body:
 *                        type: string
 *                        minLength: 1
 *                      publishedAt:
 *                        type: string
 *                      authorName:
 *                        type: string
 *                        minLength: 1
 *                    required:
 *                      - id
 *                      - title
 *                      - body
 *                      - publishedAt
 *                      - authorName
 *                agendas:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        minLength: 1
 *                      title:
 *                        type: string
 *                        minLength: 1
 *                      startAt:
 *                        type: string
 *                      description:
 *                        type: string
 *                        minLength: 1
 *                    required:
 *                      - id
 *                      - title
 *                      - startAt
 *                      - description
 *                publishStatus:
 *                  default: published
 *                  type: string
 *                  enum:
 *                    - draft
 *                    - published
 *                    - archived
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Community"
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
 *      x-source-file: "app/api/communities/[id]/route.ts"
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = updateCommunitySchema.parse(body);
    const updated = storeUpdateCommunity(id, patch);
    if (!updated) {
      return jsonError("NOT_FOUND", `Komunitas '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext) {
  return PATCH(request, ctx);
}

/**
 * DELETE /api/communities/{id} — Hapus komunitas
 *
 * Menghapus komunitas.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deleteCommunity.
 *
 * @openapi
 *  "/api/communities/{id}":
 *    delete:
 *      tags:
 *        - Communities
 *      operationId: deleteCommunity
 *      summary: "Hapus komunitas"
 *      description: "Menghapus komunitas."
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
 *      x-source-file: "app/api/communities/[id]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteCommunity(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Komunitas '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
