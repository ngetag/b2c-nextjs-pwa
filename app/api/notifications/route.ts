import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import {
  createNotificationSchema,
  patchNotificationsSchema,
} from "@/schemas";
import {
  storeCreateNotification,
  storeListNotifications,
  storePatchNotifications,
} from "@/server/store";

/**
 * GET /api/notifications — Daftar notifikasi
 *
 * Notifikasi tiket, kalender, dan sistem.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#listNotifications.
 *
 * @openapi
 *  /api/notifications:
 *    get:
 *      tags:
 *        - Notifications
 *      operationId: listNotifications
 *      summary: "Daftar notifikasi"
 *      description: "Notifikasi tiket, kalender, dan sistem."
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Notification"
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
 *      x-source-file: app/api/notifications/route.ts
 */
export async function GET() {
  try {
    return jsonOk(storeListNotifications());
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/notifications — Buat notifikasi
 *
 * Menambahkan notifikasi baru.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createNotification.
 *
 * @openapi
 *  /api/notifications:
 *    post:
 *      tags:
 *        - Notifications
 *      operationId: createNotification
 *      summary: "Buat notifikasi"
 *      description: "Menambahkan notifikasi baru."
 *      requestBody:
 *        required: true
 *        description: "Payload JSON."
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  minLength: 1
 *                description:
 *                  type: string
 *                  minLength: 1
 *                detail:
 *                  type: string
 *                  minLength: 1
 *                href:
 *                  type: string
 *                  minLength: 1
 *                type:
 *                  default: system
 *                  type: string
 *                  enum:
 *                    - ticket
 *                    - calendar
 *                    - system
 *              required:
 *                - title
 *                - description
 *                - detail
 *                - href
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Notification"
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
 *      x-source-file: app/api/notifications/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createNotificationSchema.parse(body);
    return jsonCreated(storeCreateNotification(input));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/notifications — Tandai notifikasi
 *
 * Menandai notifikasi terbaca/belum terbaca.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#patchNotifications.
 *
 * @openapi
 *  /api/notifications:
 *    patch:
 *      tags:
 *        - Notifications
 *      operationId: patchNotifications
 *      summary: "Tandai notifikasi"
 *      description: "Menandai notifikasi terbaca/belum terbaca."
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
 *                markAllAsRead:
 *                  type: boolean
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
 *      x-source-file: app/api/notifications/route.ts
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const input = patchNotificationsSchema.parse(body);
    return jsonOk(storePatchNotifications(input));
  } catch (error) {
    return handleApiError(error);
  }
}
