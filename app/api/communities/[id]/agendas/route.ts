import type { NextRequest } from "next/server";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
} from "@/lib/api-response";
import { createCommunityAgendaSchema } from "@/schemas";
import {
  storeAddCommunityAgenda,
  storeGetCommunityById,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/communities/{id}/agendas — Agenda komunitas
 *
 * Daftar agenda/kegiatan komunitas.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listCommunityAgendas.
 *
 * @openapi
 *  "/api/communities/{id}/agendas":
 *    get:
 *      tags:
 *        - Communities
 *      operationId: listCommunityAgendas
 *      summary: "Agenda komunitas"
 *      description: "Daftar agenda/kegiatan komunitas."
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
 *                "$ref": "#/components/schemas/CommunityAgenda"
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
 *      x-source-file: "app/api/communities/[id]/agendas/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const community = storeGetCommunityById(id);
    if (!community) {
      return jsonError("NOT_FOUND", `Komunitas '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(community.agendas);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/communities/{id}/agendas — Buat agenda komunitas
 *
 * Menjadwalkan agenda komunitas.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createCommunityAgenda.
 *
 * @openapi
 *  "/api/communities/{id}/agendas":
 *    post:
 *      tags:
 *        - Communities
 *      operationId: createCommunityAgenda
 *      summary: "Buat agenda komunitas"
 *      description: "Menjadwalkan agenda komunitas."
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
 *                startAt:
 *                  type: string
 *                description:
 *                  type: string
 *                  minLength: 2
 *              required:
 *                - title
 *                - startAt
 *                - description
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/CommunityAgenda"
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
 *      x-source-file: "app/api/communities/[id]/agendas/route.ts"
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = createCommunityAgendaSchema.parse(body);
    const updated = storeAddCommunityAgenda(id, input);
    if (!updated) {
      return jsonError("NOT_FOUND", `Komunitas '${id}' tidak ditemukan`, 404);
    }
    return jsonCreated(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
