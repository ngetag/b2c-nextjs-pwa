import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { toggleAttendanceSchema } from "@/schemas";
import { storeListAttendances, storeToggleAttendance } from "@/server/store";

/**
 * GET /api/engagements/attendances — Daftar kehadiran event
 *
 * Event yang ditambahkan ke kalender user.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#listAttendances.
 *
 * @openapi
 *  /api/engagements/attendances:
 *    get:
 *      tags:
 *        - Engagements
 *      operationId: listAttendances
 *      summary: "Daftar kehadiran event"
 *      description: "Event yang ditambahkan ke kalender user."
 *      parameters:
 *        -
 *          name: userId
 *          in: query
 *          required: false
 *          description: "Filter user."
 *          schema:
 *            type: string
 *        -
 *          name: eventId
 *          in: query
 *          required: false
 *          description: "Filter event."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/EventAttendance"
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
 *      x-source-file: app/api/engagements/attendances/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const userId = sp.get("userId") ?? undefined;
    const eventId = sp.get("eventId") ?? undefined;
    return jsonOk(storeListAttendances({ userId, eventId }));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/engagements/attendances — Toggle kehadiran event
 *
 * Menambah/menghapus event dari kalender.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#toggleAttendance.
 *
 * @openapi
 *  /api/engagements/attendances:
 *    post:
 *      tags:
 *        - Engagements
 *      operationId: toggleAttendance
 *      summary: "Toggle kehadiran event"
 *      description: "Menambah/menghapus event dari kalender."
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
 *                eventId:
 *                  type: string
 *                  minLength: 1
 *              required:
 *                - eventId
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
 *      x-source-file: app/api/engagements/attendances/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = toggleAttendanceSchema.parse(body);
    return jsonOk(storeToggleAttendance(input));
  } catch (error) {
    return handleApiError(error);
  }
}
