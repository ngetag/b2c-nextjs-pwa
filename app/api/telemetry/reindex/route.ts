import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { rebuildContentIndex } from "@/server/telemetry/content-index";
import { authorizeTelemetryAdmin } from "@/server/telemetry/http";

/**
 * POST /api/telemetry/reindex — Rebuild vector index konten
 *
 * Menghitung ulang embedding seluruh spot, event, komunitas, promo, blog, dan hype.
 * Butuh role `admin` atau header `x-telemetry-token`.
 *
 * Auth: Wajib JWT role `admin` (atau header `x-telemetry-token`).
 * Sumber kontrak: src/server/openapi/registry.ts#reindexContent.
 *
 * @openapi
 *  /api/telemetry/reindex:
 *    post:
 *      tags:
 *        - Telemetry
 *      operationId: reindexContent
 *      summary: "Rebuild vector index konten"
 *      description: "Menghitung ulang embedding seluruh spot, event, komunitas, promo, blog, dan hype. Butuh role `admin` atau header `x-telemetry-token`."
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
 *        403:
 *          description: "Akses ditolak — butuh role `admin` (`FORBIDDEN`)."
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
 *      x-auth-mode: admin
 *      x-source-file: app/api/telemetry/reindex/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeTelemetryAdmin(request);
    if (!auth.ok) return auth.response;

    const result = await rebuildContentIndex();
    return jsonOk({
      success: true,
      ...result,
      reindexedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Content index writes must never be cached. */
export const dynamic = "force-dynamic";
