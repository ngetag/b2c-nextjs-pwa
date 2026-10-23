import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { openingHoursSchema } from "@/schemas";
import {
  storeGetSpotById,
  storeUpdateSpotOpeningHours,
} from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const putOpeningHoursSchema = z.union([
  openingHoursSchema,
  z.object({ openingHours: openingHoursSchema }),
]);

/**
 * GET /api/spots/{id}/opening-hours — Jam operasional spot
 *
 * Mengambil jam buka harian spot (mon–sun).
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getSpotOpeningHours.
 *
 * @openapi
 *  "/api/spots/{id}/opening-hours":
 *    get:
 *      tags:
 *        - Spots
 *      operationId: getSpotOpeningHours
 *      summary: "Jam operasional spot"
 *      description: "Mengambil jam buka harian spot (mon–sun)."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Spot id atau slug."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/OpeningHour"
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
 *      x-source-file: "app/api/spots/[id]/opening-hours/route.ts"
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const spot = storeGetSpotById(id);
    if (!spot) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(spot.openingHours);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/spots/{id}/opening-hours — Ganti jam operasional
 *
 * Mengganti seluruh jam operasional spot. Menerima array langsung atau `{ openingHours:
 * [...] }`.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#replaceSpotOpeningHours.
 *
 * @openapi
 *  "/api/spots/{id}/opening-hours":
 *    put:
 *      tags:
 *        - Spots
 *      operationId: replaceSpotOpeningHours
 *      summary: "Ganti jam operasional"
 *      description: "Mengganti seluruh jam operasional spot. Menerima array langsung atau `{ openingHours: [...] }`."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Spot id atau slug."
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        description: "Payload JSON."
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  day:
 *                    type: string
 *                    enum:
 *                      - mon
 *                      - tue
 *                      - wed
 *                      - thu
 *                      - fri
 *                      - sat
 *                      - sun
 *                  open:
 *                    type: string
 *                    pattern: "^\\d{2}:\\d{2}$"
 *                  close:
 *                    type: string
 *                    pattern: "^\\d{2}:\\d{2}$"
 *                  closed:
 *                    type: boolean
 *                required:
 *                  - day
 *                  - open
 *                  - close
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/OpeningHour"
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
 *      x-source-file: "app/api/spots/[id]/opening-hours/route.ts"
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = putOpeningHoursSchema.parse(body);
    const hours = Array.isArray(parsed) ? parsed : parsed.openingHours;
    const updated = storeUpdateSpotOpeningHours(id, hours);
    if (!updated) {
      return jsonError("NOT_FOUND", `Spot '${id}' tidak ditemukan`, 404);
    }
    return jsonOk(updated.openingHours);
  } catch (error) {
    return handleApiError(error);
  }
}
