import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth/guards";
import { authorizeTelemetryAdmin } from "@/server/telemetry/http";
import { drainTelemetry, getBufferedEventCount } from "@/server/telemetry/tracker";

/**
 * POST /api/telemetry/flush — Flush buffer telemetri
 *
 * Menulis seluruh buffer ingest ke storage dan menghitung ulang taste vector. Normalnya
 * otomatis ±800 ms setelah ingest; endpoint ini untuk test/cron/demo.
 *
 * Auth: Wajib JWT (Authorization: Bearer <token>).
 * Sumber kontrak: src/server/openapi/registry.ts#flushTelemetry.
 *
 * @openapi
 *  /api/telemetry/flush:
 *    post:
 *      tags:
 *        - Telemetry
 *      operationId: flushTelemetry
 *      summary: "Flush buffer telemetri"
 *      description: "Menulis seluruh buffer ingest ke storage dan menghitung ulang taste vector. Normalnya otomatis ±800 ms setelah ingest; endpoint ini untuk test/cron/demo."
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
 *        401:
 *          description: "Tidak terautentikasi (`UNAUTHENTICATED`)."
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
 *      x-auth-mode: bearer
 *      x-source-file: app/api/telemetry/flush/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const expected = process.env.TELEMETRY_FLUSH_TOKEN;
    const provided = request.headers.get("x-telemetry-token");
    const machineAuthorized = Boolean(expected && provided === expected);

    if (!machineAuthorized) {
      const auth = await requireAuth(request);
      if (!auth.ok) {
        const admin = await authorizeTelemetryAdmin(request);
        if (!admin.ok) return admin.response;
      }
    }

    const before = getBufferedEventCount();
    const result = await drainTelemetry();

    return jsonOk({
      success: true,
      bufferedBefore: before,
      processed: result.processed,
      batches: result.batches,
      storage: result.storage,
      remaining: getBufferedEventCount(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Buffered counts are process-local and must not be cached. */
export const dynamic = "force-dynamic";
