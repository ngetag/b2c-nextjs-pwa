import type { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import type { AuthRole } from "@/shared/auth";
import {
  getAuthContext,
  type AuthContext,
  type ResolveOptions,
} from "./session";
import { hasScope } from "./claims";

/** Result of an auth guard: either the context or a ready-made 401/403. */
export type AuthGuardResult =
  | { ok: true; context: AuthContext }
  | { ok: false; response: NextResponse };

/** Standard 401 response with a `WWW-Authenticate` challenge. */
export function unauthorizedResponse(
  message = "Token akses tidak ada atau sudah kedaluwarsa",
): NextResponse {
  const response = jsonError("UNAUTHENTICATED", message, 401);
  response.headers.set("WWW-Authenticate", 'Bearer realm="ngetag"');
  return response;
}

/** Standard 403 response. */
export function forbiddenResponse(
  message = "Kamu tidak punya izin untuk aksi ini",
): NextResponse {
  return jsonError("FORBIDDEN", message, 403);
}

/**
 * Requires a valid access token (Bearer header or httpOnly cookie).
 *
 * @param request Incoming request.
 * @param options Session verification behaviour.
 */
export async function requireAuth(
  request: Request,
  options?: ResolveOptions,
): Promise<AuthGuardResult> {
  const context = await getAuthContext(request, options);
  if (!context) {
    return { ok: false, response: unauthorizedResponse() };
  }
  return { ok: true, context };
}

/**
 * Requires a valid access token **and** a specific OAuth scope.
 *
 * @example
 * const auth = await requireScope(request, "telemetry:write");
 * if (!auth.ok) return auth.response;
 */
export async function requireScope(
  request: Request,
  scope: string,
): Promise<AuthGuardResult> {
  const result = await requireAuth(request);
  if (!result.ok) return result;

  if (!hasScope(result.context.claims, scope)) {
    return {
      ok: false,
      response: forbiddenResponse(`Scope '${scope}' dibutuhkan`),
    };
  }
  return result;
}

/**
 * Requires a valid access token whose role is in `roles`.
 *
 * @param request Incoming request.
 * @param roles Allowed roles (`customer`, `owner`, `admin`).
 */
export async function requireRole(
  request: Request,
  roles: readonly AuthRole[],
): Promise<AuthGuardResult> {
  const result = await requireAuth(request);
  if (!result.ok) return result;

  if (!roles.includes(result.context.claims.role)) {
    return {
      ok: false,
      response: forbiddenResponse(
        `Role '${result.context.claims.role}' tidak diizinkan`,
      ),
    };
  }
  return result;
}
