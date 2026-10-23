import { handleApiError, jsonOk } from "@/lib/api-response";
import { getTelemetryRepo, memoryStoredEventCount } from "@/server/telemetry/repo";
import { getBufferedEventCount } from "@/server/telemetry/tracker";
import { contentIndexStats } from "@/server/telemetry/content-index";

/**
 * GET /api/telemetry/summary — Statistik telemetri & index
 *
 * Agregat event per tipe, top target/tag, jumlah taste profile, cakupan content
 * embedding, dan backend storage. Tanpa data pribadi.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#getTelemetrySummary.
 *
 * @openapi
 *  /api/telemetry/summary:
 *    get:
 *      tags:
 *        - Telemetry
 *      operationId: getTelemetrySummary
 *      summary: "Statistik telemetri & index"
 *      description: "Agregat event per tipe, top target/tag, jumlah taste profile, cakupan content embedding, dan backend storage. Tanpa data pribadi."
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/TelemetrySummaryResponse"
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
 *      x-source-file: app/api/telemetry/summary/route.ts
 */
export async function GET() {
  try {
    const repo = getTelemetryRepo();
    const [summary, index, tastes] = await Promise.all([
      repo.getSummary(),
      contentIndexStats(),
      repo.listTastes(),
    ]);

    return jsonOk({
      ...summary,
      bufferedEvents: getBufferedEventCount(),
      memoryEvents: repo.kind === "memory" ? memoryStoredEventCount() : undefined,
      tasteProfiles: tastes.length,
      contentIndex: index,
      storage: repo.kind,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Aggregates must never be cached at the edge. */
export const dynamic = "force-dynamic";
