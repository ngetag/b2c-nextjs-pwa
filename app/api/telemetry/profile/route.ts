import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { getAuthContext } from "@/lib/auth/session";
import { telemetryProfileQuerySchema } from "@/schemas";
import { getTelemetryRepo } from "@/server/telemetry/repo";
import {
  getTasteProfile,
  ownerKeyFor,
  topInterestWeights,
  topTagWeights,
} from "@/server/telemetry/taste";

/**
 * GET /api/telemetry/profile — Taste vector saya
 *
 * Mengembalikan profil rasa agregat (vektor 384 dimensi, preview 12 dimensi), bobot
 * tag/interest, dan event terakhir. Guest harus mengirim `anonymousId`.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#getTasteProfile.
 *
 * @openapi
 *  /api/telemetry/profile:
 *    get:
 *      tags:
 *        - Telemetry
 *      operationId: getTasteProfile
 *      summary: "Taste vector saya"
 *      description: "Mengembalikan profil rasa agregat (vektor 384 dimensi, preview 12 dimensi), bobot tag/interest, dan event terakhir. Guest harus mengirim `anonymousId`."
 *      parameters:
 *        -
 *          name: anonymousId
 *          in: query
 *          required: false
 *          description: "Device id untuk guest."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/TasteProfileResponse"
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
 *      x-source-file: app/api/telemetry/profile/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getAuthContext(request);
    const query = telemetryProfileQuerySchema.parse({
      anonymousId:
        request.nextUrl.searchParams.get("anonymousId") ?? undefined,
    });

    const anonymousId = context?.user.id ? undefined : query.anonymousId;
    if (!context && !anonymousId) {
      return jsonError(
        "IDENTITY_REQUIRED",
        "Kirim anonymousId atau gunakan Bearer token",
        400,
      );
    }

    const ownerKey = ownerKeyFor({
      customerId: context?.user.id ?? null,
      anonymousId,
    });

    const taste = await getTasteProfile(ownerKey);
    if (!taste) {
      return jsonOk({
        ownerKey,
        eventCount: 0,
        dimensions: 0,
        embeddingPreview: [],
        tagWeights: [],
        interestWeights: [],
        lastEventAt: null,
        message: "Belum ada aktivitas. Jelajahi beberapa spot terlebih dahulu.",
      });
    }

    const repo = getTelemetryRepo();
    const recentEvents = ownerKey
      ? await repo.listEvents({
          customerId: taste.customerId ?? undefined,
          anonymousId: taste.anonymousId ?? undefined,
          limit: 10,
        })
      : [];

    return jsonOk({
      ownerKey: taste.ownerKey,
      eventCount: taste.eventCount,
      dimensions: taste.embedding.length,
      embeddingPreview: taste.embedding.slice(0, 12).map((value) =>
        Number(value.toFixed(5)),
      ),
      tagWeights: topTagWeights(taste, 12),
      interestWeights: topInterestWeights(taste, 12),
      lastEventAt: taste.lastEventAt,
      updatedAt: taste.updatedAt,
      recentEvents,
      storage: repo.kind,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Taste profiles are user-specific and always live. */
export const dynamic = "force-dynamic";
