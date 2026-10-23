import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/shared/auth";
import { jsonError } from "@/lib/api-response";
import { getRequestIp } from "@/lib/auth/session";
import { AuthServiceError } from "./service";

/**
 * Request metadata attached to a new session (user agent + hashed IP).
 */
export function sessionMetaFromRequest(request: NextRequest) {
  return {
    userAgent: request.headers.get("user-agent"),
    ip: getRequestIp(request),
  };
}

/** Maps `AuthServiceError` to the standard API error envelope. */
export function authErrorResponse(error: unknown) {
  if (error instanceof AuthServiceError) {
    return jsonError(error.code, error.message, error.status);
  }
  throw error;
}

/**
 * Only allows same-origin relative redirects (`/account`, `/id/profile`).
 * Prevents open-redirect abuse through the `next` query parameter.
 */
export function sanitizeNextPath(
  next: string | null | undefined,
  fallback = "/account",
): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next.slice(0, 512);
}

/**
 * Public origin of the current request. Honours `NEXT_PUBLIC_APP_URL` so OAuth
 * redirect URIs stay stable behind proxies and preview hosts.
 */
export function requestOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");

  // Behind a preview proxy / load balancer the canonical host lives in these
  // headers; `nextUrl.origin` can otherwise resolve to the bind address.
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");

  if (host) return `${proto}://${host}`;
  return request.nextUrl.origin;
}

/** Builds the absolute OAuth callback URL for a provider. */
export function oauthRedirectUri(
  request: NextRequest,
  provider: string,
): string {
  return `${requestOrigin(request)}/api/auth/oauth/${provider}/callback`;
}

/**
 * Stores the short-lived OAuth handshake state (CSRF state, PKCE verifier and
 * post-login redirect) in httpOnly cookies.
 */
export function setOAuthCookies(
  response: NextResponse,
  input: { state: string; verifier?: string; next: string },
): NextResponse {
  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  };

  response.cookies.set(AUTH_COOKIE_NAMES.oauthState, input.state, base);
  response.cookies.set(AUTH_COOKIE_NAMES.oauthNext, input.next, base);
  if (input.verifier) {
    response.cookies.set(AUTH_COOKIE_NAMES.oauthVerifier, input.verifier, base);
  }
  return response;
}

/** Clears the OAuth handshake cookies after the callback completes/fails. */
export function clearOAuthCookies(response: NextResponse): NextResponse {
  for (const name of [
    AUTH_COOKIE_NAMES.oauthState,
    AUTH_COOKIE_NAMES.oauthNext,
    AUTH_COOKIE_NAMES.oauthVerifier,
  ]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}

/** Builds an absolute URL for a same-origin path. */
export function absoluteUrl(request: NextRequest, path: string): URL {
  return new URL(path, requestOrigin(request));
}
