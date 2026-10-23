import type { NextRequest } from "next/server";
import { handleApiError, jsonCreated, jsonOk } from "@/lib/api-response";
import { readArrayParam } from "@/lib/url";
import { createCommunitySchema } from "@/schemas";
import { storeCreateCommunity, storeListCommunities } from "@/server/store";

/**
 * GET /api/communities — Daftar komunitas
 *
 * Filter komunitas berdasarkan kategori, interest, tag, kata kunci, dan status
 * publikasi.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#listCommunities.
 *
 * @openapi
 *  /api/communities:
 *    get:
 *      tags:
 *        - Communities
 *      operationId: listCommunities
 *      summary: "Daftar komunitas"
 *      description: "Filter komunitas berdasarkan kategori, interest, tag, kata kunci, dan status publikasi."
 *      parameters:
 *        -
 *          name: q
 *          in: query
 *          required: false
 *          description: "Kata kunci."
 *          schema:
 *            type: string
 *        -
 *          name: categoryId
 *          in: query
 *          required: false
 *          description: "Kategori komunitas."
 *          schema:
 *            type: string
 *        -
 *          name: category
 *          in: query
 *          required: false
 *          description: "Alias kategori."
 *          schema:
 *            type: string
 *        -
 *          name: interestIds
 *          in: query
 *          required: false
 *          description: "Filter interest. CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: tags
 *          in: query
 *          required: false
 *          description: "Filter tag. CSV / diulang."
 *          schema:
 *            type: string
 *          style: form
 *          explode: true
 *        -
 *          name: ownerId
 *          in: query
 *          required: false
 *          description: "Filter owner."
 *          schema:
 *            type: string
 *        -
 *          name: publishStatus
 *          in: query
 *          required: false
 *          description: "Filter status publikasi."
 *          schema:
 *            type: string
 *            enum:
 *              - draft
 *              - published
 *              - archived
 *              - all
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Community"
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
 *      x-source-file: app/api/communities/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const categoryId = sp.get("categoryId") ?? sp.get("category") ?? undefined;
    const interestIds = readArrayParam(
      sp.getAll("interestIds").length > 0
        ? sp.getAll("interestIds")
        : (sp.get("interestIds") ?? undefined),
    );
    const tags = readArrayParam(
      sp.getAll("tags").length > 0 ? sp.getAll("tags") : (sp.get("tags") ?? undefined),
    );
    const q = sp.get("q") ?? undefined;
    const ownerId = sp.get("ownerId") ?? undefined;
    const publishStatusParam = sp.get("publishStatus");
    const publishStatus =
      publishStatusParam === "draft" ||
      publishStatusParam === "published" ||
      publishStatusParam === "archived" ||
      publishStatusParam === "all"
        ? publishStatusParam
        : undefined;

    return jsonOk(
      storeListCommunities({
        categoryId,
        interestIds: interestIds.length > 0 ? interestIds : undefined,
        tags: tags.length > 0 ? tags : undefined,
        q,
        ownerId,
        publishStatus,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/communities — Buat komunitas
 *
 * Membuat komunitas baru.
 *
 * Auth: Opsional — JWT bila tersedia.
 * Sumber kontrak: src/server/openapi/registry.ts#createCommunity.
 *
 * @openapi
 *  /api/communities:
 *    post:
 *      tags:
 *        - Communities
 *      operationId: createCommunity
 *      summary: "Buat komunitas"
 *      description: "Membuat komunitas baru."
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
 *                  minLength: 10
 *                coverImage:
 *                  default: https://picsum.photos/seed/community-new/900/520
 *                  type: string
 *                  minLength: 1
 *                categoryId:
 *                  type: string
 *                  minLength: 1
 *                tags:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: string
 *                memberCount:
 *                  default: 1
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *                activeEvents:
 *                  default: 0
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 9007199254740991
 *                isOfficial:
 *                  default: false
 *                  type: boolean
 *                managedBy:
 *                  type: string
 *                managementName:
 *                  type: string
 *                communityType:
 *                  default: club
 *                  type: string
 *                  enum:
 *                    - official
 *                    - fanbase
 *                    - team
 *                    - guild
 *                    - creator
 *                    - club
 *                    - learning
 *                    - network
 *                updates:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        minLength: 1
 *                      title:
 *                        type: string
 *                        minLength: 1
 *                      body:
 *                        type: string
 *                        minLength: 1
 *                      publishedAt:
 *                        type: string
 *                      authorName:
 *                        type: string
 *                        minLength: 1
 *                    required:
 *                      - id
 *                      - title
 *                      - body
 *                      - publishedAt
 *                      - authorName
 *                agendas:
 *                  default: []
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        minLength: 1
 *                      title:
 *                        type: string
 *                        minLength: 1
 *                      startAt:
 *                        type: string
 *                      description:
 *                        type: string
 *                        minLength: 1
 *                    required:
 *                      - id
 *                      - title
 *                      - startAt
 *                      - description
 *                publishStatus:
 *                  default: published
 *                  type: string
 *                  enum:
 *                    - draft
 *                    - published
 *                    - archived
 *              required:
 *                - title
 *                - description
 *                - categoryId
 *      responses:
 *        201:
 *          description: "Entitas berhasil dibuat."
 *          content:
 *            application/json:
 *              schema:
 *                "$ref": "#/components/schemas/Community"
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
 *      x-source-file: app/api/communities/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createCommunitySchema.parse(body);
    const created = storeCreateCommunity(input);
    return jsonCreated(created);
  } catch (error) {
    return handleApiError(error);
  }
}
