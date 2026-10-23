import type { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api-response";
import { readArrayParam, readNumberParam } from "@/lib/url";
import {
  storeListCommunities,
  storeListCommunityCategories,
  storeListInterests,
  storeListTags,
  storeSearchEvents,
  storeSearchSpots,
} from "@/server/store";

/**
 * GET /api/search — Pencarian terpadu
 *
 * Pencarian lintas spot, event, komunitas, tag, kategori komunitas, dan interest dalam
 * satu response.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#search.
 *
 * @openapi
 *  /api/search:
 *    get:
 *      tags:
 *        - Search
 *      operationId: search
 *      summary: "Pencarian terpadu"
 *      description: "Pencarian lintas spot, event, komunitas, tag, kategori komunitas, dan interest dalam satu response."
 *      parameters:
 *        -
 *          name: q
 *          in: query
 *          required: false
 *          description: "Kata kunci."
 *          schema:
 *            type: string
 *        -
 *          name: type
 *          in: query
 *          required: false
 *          description: "Batasi tipe hasil."
 *          schema:
 *            type: string
 *            enum:
 *              - spot
 *              - event
 *              - all
 *        -
 *          name: tagSlugs
 *          in: query
 *          required: false
 *          description: "Filter tag. CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: city
 *          in: query
 *          required: false
 *          description: "Filter kota."
 *          schema:
 *            type: string
 *        -
 *          name: sort
 *          in: query
 *          required: false
 *          description: Urutan.
 *          schema:
 *            type: string
 *            enum:
 *              - relevance
 *              - newest
 *              - distance
 *        -
 *          name: page
 *          in: query
 *          required: false
 *          description: Halaman.
 *          schema:
 *            type: integer
 *            default: 1
 *        -
 *          name: pageSize
 *          in: query
 *          required: false
 *          description: "Jumlah per halaman."
 *          schema:
 *            type: integer
 *            default: 24
 *        -
 *          name: lat
 *          in: query
 *          required: false
 *          description: Latitude.
 *          schema:
 *            type: number
 *        -
 *          name: lng
 *          in: query
 *          required: false
 *          description: Longitude.
 *          schema:
 *            type: number
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/SearchResponse"
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
 *      x-source-file: app/api/search/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const q = sp.get("q") ?? undefined;
    const typeParam = sp.get("type");
    const type =
      typeParam === "spot" || typeParam === "event" || typeParam === "all"
        ? typeParam
        : "all";
    const tagSlugs = readArrayParam(
      sp.getAll("tagSlugs").length > 0
        ? sp.getAll("tagSlugs")
        : (sp.get("tags") ?? undefined),
    );
    const city = sp.get("city") ?? undefined;
    const sortParam = sp.get("sort");
    const sort =
      sortParam === "newest" ||
      sortParam === "distance" ||
      sortParam === "relevance"
        ? sortParam
        : undefined;
    const page = readNumberParam(sp.get("page") ?? undefined, 1) ?? 1;
    const pageSize = readNumberParam(sp.get("pageSize") ?? undefined, 24) ?? 24;
    const lat = readNumberParam(sp.get("lat") ?? undefined);
    const lng = readNumberParam(sp.get("lng") ?? undefined);

    const spots =
      type === "event"
        ? { items: [], page, pageSize, total: 0 }
        : storeSearchSpots({
            q,
            tagSlugs,
            city,
            sort,
            page,
            pageSize,
            lat,
            lng,
          });

    const events =
      type === "spot"
        ? { items: [], page, pageSize, total: 0 }
        : storeSearchEvents({
            q,
            tagSlugs,
            city,
            sort,
            page,
            pageSize,
            lat,
            lng,
          });

    const communities = storeListCommunities({ q });

    const qLower = q?.toLowerCase();
    const matchingTags = qLower
      ? storeListTags().filter(
          (t) =>
            t.name.toLowerCase().includes(qLower) ||
            t.slug.toLowerCase().includes(qLower),
        )
      : [];
    const matchingCategories = qLower
      ? storeListCommunityCategories().filter((c) =>
          c.title.toLowerCase().includes(qLower),
        )
      : [];
    const matchingInterests = qLower
      ? storeListInterests().filter((i) =>
          i.label.toLowerCase().includes(qLower),
        )
      : [];

    return jsonOk({
      query: { q, type, tagSlugs, city, sort, page, pageSize },
      spots,
      events,
      communities,
      discovery: {
        tags: matchingTags,
        categories: matchingCategories,
        interests: matchingInterests,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
