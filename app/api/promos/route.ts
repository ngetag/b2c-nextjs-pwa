import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import { createPromoSchema } from "@/schemas";
import { storeCreatePromo, storeListPromos } from "@/server/store";

/**
 * GET /api/promos — Daftar promo
 *
 * Filter promo berdasarkan id, spot, event, owner, dan status.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listPromos.
 *
 * @openapi
 *  /api/promos:
 *    get:
 *      tags:
 *        - Promos
 *      operationId: listPromos
 *      summary: "Daftar promo"
 *      description: "Filter promo berdasarkan id, spot, event, owner, dan status."
 *      parameters:
 *        -
 *          name: ids
 *          in: query
 *          required: false
 *          description: "Filter id promo. CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: spotId
 *          in: query
 *          required: false
 *          description: "Filter spot."
 *          schema:
 *            type: string
 *        -
 *          name: eventId
 *          in: query
 *          required: false
 *          description: "Filter event."
 *          schema:
 *            type: string
 *        -
 *          name: ownerId
 *          in: query
 *          required: false
 *          description: "Filter owner."
 *          schema:
 *            type: string
 *        -
 *          name: status
 *          in: query
 *          required: false
 *          description: "Status promo."
 *          schema:
 *            type: string
 *            enum:
 *              - draft
 *              - active
 *              - expired
 *              - archived
 *              - all
 *        -
 *          name: limit
 *          in: query
 *          required: false
 *          description: "Jumlah maksimum."
 *          schema:
 *            type: integer
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Promo"
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
 *      x-source-file: app/api/promos/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const ids = readArrayParam(
      sp.getAll("ids").length > 0 ? sp.getAll("ids") : (sp.get("ids") ?? undefined),
    );
    const spotId = sp.get("spotId") ?? undefined;
    const eventId = sp.get("eventId") ?? undefined;
    const ownerId = sp.get("ownerId") ?? undefined;
    const status = sp.get("status") ?? undefined;
    const limit = readNumberParam(sp.get("limit") ?? undefined);

    return jsonOk(
      storeListPromos({
        ids: ids.length > 0 ? ids : undefined,
        spotId,
        eventId,
        ownerId,
        status,
        limit,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/promos — Buat promo
 *
 * Membuat promo untuk spot atau event.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createPromo.
 *
 * @openapi
 *  /api/promos:
 *    post:
 *      tags:
 *        - Promos
 *      operationId: createPromo
 *      summary: "Buat promo"
 *      description: "Membuat promo untuk spot atau event."
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
 *                  minLength: 5
 *                validUntil:
 *                  type: string
 *                discountPercent:
 *                  type: number
 *                  minimum: 0
 *                  maximum: 100
 *                code:
 *                  type: string
 *                imageUrl:
 *                  type: string
 *                spotId:
 *                  type: string
 *                eventId:
 *                  type: string
 *                ownerType:
 *                  type: string
 *                  enum:
 *                    - spot
 *                    - event
 *                status:
 *                  default: active
 *                  type: string
 *                  enum:
 *                    - draft
 *                    - active
 *                    - expired
 *                    - archived
 *              required:
 *                - title
 *                - description
 *                - validUntil
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Promo"
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
 *      x-source-file: app/api/promos/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createPromoSchema.parse(body);
    const created = storeCreatePromo(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
