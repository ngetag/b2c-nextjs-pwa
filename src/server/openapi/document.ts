import { z } from "zod";
import packageJson from "../../../package.json";
import { apiTags, componentSchemas } from "./components";
import {
  apiOperations,
  type ApiOperation,
  type ParamSpec,
} from "./registry";

type JsonObject = Record<string, unknown>;

const ERROR_RESPONSE = { $ref: "#/components/schemas/Error" };

/** Convert a param spec to an OpenAPI parameter object. */
function toParameter(param: ParamSpec): JsonObject {
  const type =
    param.type === "int"
      ? { type: "integer" }
      : param.type === "number"
        ? { type: "number" }
        : param.type === "bool"
          ? { type: "boolean" }
          : { type: "string" };

  const parameter: JsonObject = {
    name: param.name,
    in: param.in ?? "query",
    required: param.in === "path" ? true : (param.required ?? false),
    ...(param.description ? { description: param.description } : {}),
    schema: {
      ...type,
      ...(param.enum ? { enum: param.enum } : {}),
      ...(param.default !== undefined ? { default: param.default } : {}),
    },
  };

  if (param.type === "csv") {
    parameter.description = `${param.description ?? ""}${
      param.description ? " " : ""
    }CSV / diulang.`.trim();
    parameter.style = "form";
    parameter.explode = true;
  }

  return parameter;
}

/** Convert the bound zod schema of an operation into JSON Schema (draft 2020-12). */
export function toJsonSchema(schema: z.ZodType): JsonObject {
  try {
    const jsonSchema = z.toJSONSchema(schema, {
      io: "input",
      unrepresentable: "any",
      target: "draft-2020-12",
      override: (ctx) => {
        // Zod-level refinements cannot be expressed in JSON Schema; treat as no-op.
        if (ctx.zodSchema instanceof z.ZodCustom) {
          ctx.jsonSchema.type ??= undefined;
          return;
        }
        if (ctx.zodSchema instanceof z.ZodDefault) return;
        if (ctx.zodSchema instanceof z.ZodPipe) return;
        if (ctx.zodSchema instanceof z.ZodCatch) return;
      },
    }) as JsonObject;
    delete jsonSchema.$schema;
    return jsonSchema;
  } catch {
    return { type: "object", additionalProperties: true };
  }
}

/** Build the request-body object for an operation, if it has one. */
function toRequestBody(operation: ApiOperation): JsonObject | undefined {
  if (!operation.body) return undefined;
  return {
    required: true,
    description: operation.bodyDescription ?? "Payload JSON.",
    content: {
      "application/json": { schema: toJsonSchema(operation.body) },
    },
  };
}

/** Build the responses map for an operation. */
function toResponses(operation: ApiOperation): JsonObject {
  const status = operation.successStatus ?? 200;
  const successSchema = operation.responseRef
    ? { $ref: `#/components/schemas/${operation.responseRef}` }
    : { type: "object", additionalProperties: true };

  const response: JsonObject = {
    [String(status)]: {
      description:
        operation.responseDescription ??
        (status === 201
          ? "Entitas berhasil dibuat."
          : status === 202
            ? "Diterima dan diproses secara asinkron."
            : "Berhasil."),
      content: {
        "application/json": { schema: successSchema },
      },
    },
    "400": {
      description: "Payload/parameter tidak valid (`VALIDATION_ERROR`).",
      content: { "application/json": { schema: ERROR_RESPONSE } },
    },
    "404": {
      description: "Entitas tidak ditemukan (`NOT_FOUND`).",
      content: { "application/json": { schema: ERROR_RESPONSE } },
    },
    "500": {
      description: "Kesalahan server (`INTERNAL_ERROR`).",
      content: { "application/json": { schema: ERROR_RESPONSE } },
    },
  };

  if (operation.auth === "bearer" || operation.auth === "admin") {
    response["401"] = {
      description: "Tidak terautentikasi (`UNAUTHENTICATED`).",
      content: { "application/json": { schema: ERROR_RESPONSE } },
    };
  }
  if (operation.auth === "admin") {
    response["403"] = {
      description: "Akses ditolak — butuh role `admin` (`FORBIDDEN`).",
      content: { "application/json": { schema: ERROR_RESPONSE } },
    };
  }

  return response;
}

/** Build the security requirement list for an operation. */
function toSecurity(operation: ApiOperation): JsonObject[] {
  if (operation.auth === "bearer" || operation.auth === "admin") {
    return [{ bearerAuth: [] }];
  }
  if (operation.auth === "optional") {
    return [{ bearerAuth: [] }, {}];
  }
  return [];
}

/** Build one OpenAPI path-item operation. */
export function buildOperationObject(operation: ApiOperation): JsonObject {
  const parameters = (operation.params ?? []).map(toParameter);
  const requestBody = toRequestBody(operation);

  return {
    tags: [operation.tag],
    operationId: operation.operationId,
    summary: operation.summary,
    description: operation.description,
    ...(operation.deprecated ? { deprecated: true } : {}),
    ...(parameters.length > 0 ? { parameters } : {}),
    ...(requestBody ? { requestBody } : {}),
    responses: toResponses(operation),
    security: toSecurity(operation),
    "x-auth-mode": operation.auth,
    "x-source-file": operation.file,
  };
}

/** Group operations into OpenAPI `paths`, merging methods on the same path. */
function toPaths(): JsonObject {
  const paths: JsonObject = {};

  for (const operation of apiOperations) {
    const item = (paths[operation.path] as JsonObject | undefined) ?? {};
    item[operation.method] = buildOperationObject(operation);
    paths[operation.path] = item;
  }

  return paths;
}

export interface OpenApiDocument {
  openapi: string;
  info: JsonObject;
  servers: JsonObject[];
  tags: JsonObject[];
  paths: JsonObject;
  components: JsonObject;
}

/**
 * Build the OpenAPI 3.1 description of the NgeTag Customer Web App API.
 *
 * The document is derived from {@link apiOperations} (routes, auth, params,
 * zod request bodies) and {@link componentSchemas}; it is served at
 * `GET /api/openapi` and rendered by Swagger UI at `/api-docs`.
 */
export function buildOpenApiDocument(): OpenApiDocument {
  return {
    openapi: "3.1.0",
    info: {
      title: "NgeTag Customer Web App API",
      version: packageJson.version,
      summary:
        "REST API untuk discovery spot & event Jakarta, autentikasi (email + OAuth + JWT), telemetri aktivitas asinkron, dan recommendation engine berbasis pgvector.",
      description: [
        "## Ringkasan",
        "Seluruh endpoint mengembalikan JSON. Error memakai bentuk",
        "`{ \"error\": { \"code\": string, \"message\": string, \"details\"?: unknown } }`.",
        "",
        "## Autentikasi",
        "- Access token JWT (HS256, 15 menit) dikirim sebagai `Authorization: Bearer <token>`.",
        "- Browser juga memakai cookie httpOnly: `ngetag_at` (access) dan `ngetag_rt` (refresh, rotasi 30 hari).",
        "- Klaim memuat data personalisasi: `role`, `tier`, `points`, `badges`, `interests`, `favoriteTags`, `city`, `locale`.",
        "- `POST /api/auth/refresh` merotasi refresh token; `POST /api/auth/logout` mencabutnya.",
        "",
        "## Telemetri",
        "- `POST /api/telemetry/events` bersifat **fire-and-forget**: respons `202` dikirim sebelum",
        "  penulisan ke PostgreSQL + pembaruan taste vector (pgvector, 384 dimensi) berjalan lewat `after()`.",
        "- Identitas diambil dari JWT (`cust:<id>`) atau `anonymousId` (`anon:<uuid>`).",
        "- Taste vector dipakai `/api/recommendations/for-you` (cosine similarity + filter radius PostGIS).",
        "",
        "## Coba langsung",
        "Login lewat `/auth/login` di aplikasi, lalu tekan **Authorize** dan tempel access token.",
      ].join("\n"),
      license: { name: "Proprietary" },
    },
    servers: [
      { url: "/", description: "Origin saat ini" },
    ],
    tags: apiTags.map((tag) => ({ ...tag })),
    paths: toPaths(),
    components: {
      schemas: componentSchemas as Record<string, unknown>,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Access token JWT (HS256). Klaim memuat role, tier, points, interests, dan favoriteTags.",
        },
      },
    },
  };
}

/** Lightweight counts used by the docs landing page and health endpoint. */
export function getOpenApiStats() {
  const methods = apiOperations.length;
  const paths = new Set(apiOperations.map((operation) => operation.path)).size;
  const tags = new Set(apiOperations.map((operation) => operation.tag)).size;
  return { paths, methods, tags };
}
