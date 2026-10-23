import { jsonOk } from "@/lib/api-response";

/**
 * GET /api/schema — Manifest schema Drizzle, enum, dan kontrak
 *
 * Dokumen referensi tabel Drizzle, enum PostgreSQL, lokasi file schema/relations, dan
 * kontrak bersama.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getSchemaManifest.
 *
 * @openapi
 *  /api/schema:
 *    get:
 *      tags:
 *        - System
 *      operationId: getSchemaManifest
 *      summary: "Manifest schema Drizzle, enum, dan kontrak"
 *      description: "Dokumen referensi tabel Drizzle, enum PostgreSQL, lokasi file schema/relations, dan kontrak bersama."
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/SchemaManifest"
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
 *      x-source-file: app/api/schema/route.ts
 */
export async function GET() {
  return jsonOk({
    orm: "drizzle-orm",
    dialect: "postgresql",
    validation: "zod",
    schemaFiles: {
      drizzleTables: "src/db/schema.ts",
      drizzleRelations: "src/db/relations.ts",
      drizzleConfig: "drizzle.config.ts",
      zodSchemas: "src/schemas/index.ts",
      sharedContracts: "src/shared/contracts/index.ts",
    },
    enums: [
      "user_role",
      "user_badge_category",
      "owner_role",
      "owner_account_status",
      "publish_status",
      "tag_category",
      "day_key",
      "event_status",
      "promo_owner_type",
      "promo_status",
      "community_type",
      "gallery_owner_type",
      "gallery_asset_type",
      "qr_code_target_type",
      "bookmark_target_type",
      "hype_content_type",
      "notification_type",
    ],
    tables: {
      core: [
        "owners",
        "customers",
        "tags",
        "interests",
        "spots",
        "spot_opening_hours",
        "events",
        "promos",
        "review_tags",
        "reviews",
        "community_categories",
        "communities",
        "community_updates",
        "community_agendas",
        "gallery_assets",
        "qr_codes",
        "blogs",
        "hype_items",
        "notifications",
      ],
      joinTables: [
        "spot_tags",
        "event_tags",
        "event_interests",
        "customer_interests",
        "customer_favorite_tags",
        "owner_spots",
        "owner_events",
        "owner_communities",
        "review_selected_tags",
      ],
      engagements: [
        "bookmarks",
        "event_attendances",
        "spot_visits",
        "community_memberships",
      ],
    },
  });
}
