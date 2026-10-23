import { jsonOk } from "@/lib/api-response";
import { getStore } from "@/server/store";

/**
 * GET /api/health — Status server & jumlah record
 *
 * Mengembalikan status server, versi, jumlah record per entitas, daftar endpoint, dan
 * status integrasi database (pgvector/PostGIS).
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getHealth.
 *
 * @openapi
 *  /api/health:
 *    get:
 *      tags:
 *        - System
 *      operationId: getHealth
 *      summary: "Status server & jumlah record"
 *      description: "Mengembalikan status server, versi, jumlah record per entitas, daftar endpoint, dan status integrasi database (pgvector/PostGIS)."
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/HealthResponse"
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
 *      x-source-file: app/api/health/route.ts
 */
export async function GET() {
  const store = getStore();
  return jsonOk({
    status: "ok",
    service: "ngetag-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    counts: {
      spots: store.spots.length,
      events: store.events.length,
      promos: store.promos.length,
      tags: store.tags.length,
      interests: store.interests.length,
      reviews: store.reviews.length,
      reviewTags: store.reviewTags.length,
      communities: store.communities.length,
      communityCategories: store.communityCategories.length,
      blogs: store.blogs.length,
      hypeItems: store.hypeItems.length,
      customers: store.customers.length,
      owners: store.owners.length,
      gallery: store.gallery.length,
      qrCodes: store.qrCodes.length,
    },
    docs: {
      swaggerUi: "/api-docs",
      openapi: "/api/openapi",
      jsdocContract: "src/server/openapi/registry.ts",
    },
    endpoints: [
      "/api/health",
      "/api/schema",
      "/api/openapi",
      "/api/auth/signup",
      "/api/auth/login",
      "/api/auth/refresh",
      "/api/auth/logout",
      "/api/auth/session",
      "/api/auth/profile",
      "/api/auth/sessions",
      "/api/auth/sessions/[id]",
      "/api/auth/oauth/[provider]",
      "/api/auth/oauth/[provider]/callback",
      "/api/telemetry/events",
      "/api/telemetry/profile",
      "/api/telemetry/summary",
      "/api/telemetry/flush",
      "/api/telemetry/reindex",
      "/api/spots",
      "/api/spots/[id]",
      "/api/spots/[id]/reviews",
      "/api/spots/[id]/review-tags",
      "/api/spots/[id]/opening-hours",
      "/api/spots/[id]/promos",
      "/api/events",
      "/api/events/[id]",
      "/api/promos",
      "/api/promos/[id]",
      "/api/tags",
      "/api/tags/[slug]",
      "/api/interests",
      "/api/interests/[id]",
      "/api/reviews",
      "/api/reviews/[id]",
      "/api/reviews/[id]/helpful",
      "/api/review-tags",
      "/api/communities",
      "/api/communities/categories",
      "/api/communities/[id]",
      "/api/communities/[id]/updates",
      "/api/communities/[id]/agendas",
      "/api/blogs",
      "/api/blogs/[slug]",
      "/api/hype",
      "/api/hype/[id]",
      "/api/users",
      "/api/users/me",
      "/api/users/[id]",
      "/api/engagements/bookmarks",
      "/api/engagements/attendances",
      "/api/engagements/visits",
      "/api/engagements/memberships",
      "/api/notifications",
      "/api/search",
      "/api/recommendations",
      "/api/recommendations/for-you",
      "/api/recommendations/similar",
      "/api/owners",
      "/api/owners/[id]",
      "/api/gallery",
      "/api/gallery/[id]",
      "/api/qr-codes",
      "/api/qr-codes/[id]",
      "/api/b2b/analytics",
      "/api/b2b/handoff",
    ],
  });
}
