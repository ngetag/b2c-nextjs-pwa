import type { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-response";
import { storeDeleteGalleryAsset } from "@/server/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/gallery/{id} — Hapus aset gallery
 *
 * Menghapus aset media.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#deleteGalleryAsset.
 *
 * @openapi
 *  "/api/gallery/{id}":
 *    delete:
 *      tags:
 *        - B2B
 *      operationId: deleteGalleryAsset
 *      summary: "Hapus aset gallery"
 *      description: "Menghapus aset media."
 *      parameters:
 *        -
 *          name: id
 *          in: path
 *          required: true
 *          description: "Gallery asset id."
 *          schema:
 *            type: string
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
 *      x-source-file: "app/api/gallery/[id]/route.ts"
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = storeDeleteGalleryAsset(id);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Gallery asset '${id}' tidak ditemukan`, 404);
    }
    return jsonOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
