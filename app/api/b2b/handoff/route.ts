import { handleApiError, jsonOk } from "@/lib/api-response";
import { getStore, resetServerStore } from "@/server/store";

/**
 * GET /api/b2b/handoff — Snapshot dataset B2B
 *
 * Snapshot lengkap seluruh dataset kontrak B2B.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#getB2bHandoff.
 *
 * @openapi
 *  /api/b2b/handoff:
 *    get:
 *      tags:
 *        - B2B
 *      operationId: getB2bHandoff
 *      summary: "Snapshot dataset B2B"
 *      description: "Snapshot lengkap seluruh dataset kontrak B2B."
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
 *      x-source-file: app/api/b2b/handoff/route.ts
 */
export async function GET() {
  try {
    const store = getStore();
    const openingHours = Object.fromEntries(
      store.spots.map((spot) => [spot.id, spot.openingHours]),
    );
    return jsonOk({
      owners: store.owners,
      customers: store.customers,
      tags: store.tags,
      interests: store.interests,
      openingHours,
      gallery: store.gallery,
      spots: store.spots,
      events: store.events,
      communityCategories: store.communityCategories,
      communities: store.communities,
      promos: store.promos,
      qrCodes: store.qrCodes,
      reviewTags: store.reviewTags,
      reviews: store.reviews,
      bookmarks: store.bookmarks,
      eventAttendances: store.eventAttendances,
      spotVisits: store.spotVisits,
      communityMemberships: store.communityMemberships,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/b2b/handoff — Reset dataset demo
 *
 * Mengembalikan server store ke state awal (demo).
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#resetB2bHandoff.
 *
 * @openapi
 *  /api/b2b/handoff:
 *    post:
 *      tags:
 *        - B2B
 *      operationId: resetB2bHandoff
 *      summary: "Reset dataset demo"
 *      description: "Mengembalikan server store ke state awal (demo)."
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
 *      x-source-file: app/api/b2b/handoff/route.ts
 */
export async function POST() {
  try {
    const store = resetServerStore();
    return jsonOk({
      reset: true,
      spots: store.spots.length,
      events: store.events.length,
      promos: store.promos.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
