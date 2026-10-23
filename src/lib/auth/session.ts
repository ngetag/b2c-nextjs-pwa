import type { NextRequest, NextResponse } from "next/server";
import { getAuthRepo } from "@/server/auth";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  AUTH_COOKIE_NAMES,
  REFRESH_TOKEN_TTL_SECONDS,
  type AuthProvider,
  type AuthSessionPayload,
  type AuthUser,
  type NgetagJwtClaims,
} from "@/shared/auth";
import { buildJwtClaims, toAuthUser } from "./claims";
import { newId } from "./id";
import { hashIp, hashToken, randomToken } from "./password";
import { signAccessToken, verifyAccessToken } from "./jwt";
import type { AuthCustomerRecord } from "./types";

/** Request metadata captured with each session for the "active devices" list. */
export interface SessionMeta {
  userAgent?: string | null;
  ip?: string | null;
}

/** Options for {@link issueSession}. */
export interface IssueSessionOptions extends SessionMeta {
  provider?: AuthProvider;
  scope?: readonly string[];
  /** Marks demo/OAuth-simulated sessions in the response payload. */
  demo?: boolean;
}

/** Session object returned by {@link issueSession}. */
export interface IssuedSession {
  payload: AuthSessionPayload;
  sessionId: string;
  refreshToken: string;
}

function assertCustomerShape(customer: AuthCustomerRecord): AuthUser {
  return toAuthUser(customer);
}

/**
 * Creates a refresh-token session and mints the access token.
 *
 * The refresh token is random (not a JWT) and only its SHA-256 hash is stored,
 * so sessions can be revoked instantly without rotating the signing secret.
 *
 * @param customer Persisted customer.
 * @param options Provider, scopes and request metadata.
 */
export async function issueSession(
  customer: AuthCustomerRecord,
  options: IssueSessionOptions = {},
): Promise<IssuedSession> {
  const repo = await getAuthRepo();
  const provider = options.provider ?? "email";
  const sessionId = newId("sess");
  const refreshToken = randomToken(48);
  const now = Date.now();

  await repo.createSession({
    id: sessionId,
    customerId: customer.id,
    refreshTokenHash: hashToken(refreshToken),
    provider,
    userAgent: options.userAgent ?? undefined,
    ipHash: hashIp(options.ip ?? undefined) ?? undefined,
    expiresAt: new Date(now + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString(),
    lastUsedAt: new Date(now).toISOString(),
    createdAt: new Date(now).toISOString(),
  });

  const claims = buildJwtClaims(customer, {
    sessionId,
    provider,
    scope: options.scope,
  });
  const { token, expiresIn } = await signAccessToken(claims);

  const payload: AuthSessionPayload = {
    user: assertCustomerShape(customer),
    claims,
    accessToken: token,
    refreshToken,
    tokenType: "Bearer",
    expiresIn,
    ...(options.demo ? { demo: true } : {}),
  };

  return { payload, sessionId, refreshToken };
}

/**
 * Rotates a refresh token: validates the stored session, issues a new access
 * token **and** a new refresh token, and invalidates the previous one.
 *
 * @param refreshToken Raw refresh token from the httpOnly cookie.
 * @param meta Request metadata.
 * @returns A fresh session payload, or `null` for invalid/expired/revoked
 * tokens.
 */
export async function refreshAuthSession(
  refreshToken: string | null | undefined,
  meta: SessionMeta = {},
): Promise<IssuedSession | null> {
  if (!refreshToken) return null;

  const repo = await getAuthRepo();
  const session = await repo.getSessionByRefreshHash(hashToken(refreshToken));
  if (!session || session.revokedAt) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await repo.revokeSession(session.id);
    return null;
  }

  const customer = await repo.findCustomerById(session.customerId);
  if (!customer) return null;

  const nextRefreshToken = randomToken(48);
  await repo.touchSession(session.id, {
    refreshTokenHash: hashToken(nextRefreshToken),
    lastUsedAt: new Date().toISOString(),
    ...(meta.userAgent ? { userAgent: meta.userAgent } : {}),
  });

  const claims = buildJwtClaims(customer, {
    sessionId: session.id,
    provider: session.provider,
  });
  const { token, expiresIn } = await signAccessToken(claims);

  return {
    payload: {
      user: toAuthUser(customer),
      claims,
      accessToken: token,
      refreshToken: nextRefreshToken,
      tokenType: "Bearer",
      expiresIn,
    },
    sessionId: session.id,
    refreshToken: nextRefreshToken,
  };
}

/**
 * Revokes the session behind a refresh token (logout).
 *
 * @param refreshToken Raw refresh token; unknown tokens are ignored.
 */
export async function revokeSessionByRefreshToken(
  refreshToken: string | null | undefined,
): Promise<void> {
  if (!refreshToken) return;
  const repo = await getAuthRepo();
  const session = await repo.getSessionByRefreshHash(hashToken(refreshToken));
  if (session) await repo.revokeSession(session.id);
}

/**
 * Revokes every session of a customer, optionally keeping the current one.
 *
 * @returns Number of revoked sessions.
 */
export async function revokeAllSessions(
  customerId: string,
  exceptSessionId?: string,
): Promise<number> {
  const repo = await getAuthRepo();
  return repo.revokeAllSessions(customerId, exceptSessionId);
}

/** Authenticated request context. */
export interface AuthContext {
  claims: NgetagJwtClaims;
  user: AuthUser;
  customer: AuthCustomerRecord;
  sessionId: string;
}

/** Reads `Authorization: Bearer <token>` or falls back to the auth cookie. */
export function readAccessToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === AUTH_COOKIE_NAMES.accessToken) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

/** Options for `getAuthContext`. */
export interface ResolveOptions {
  /** Check the session row so revoked sessions are rejected immediately. */
  verifySession?: boolean;
}

/**
 * Resolves the authenticated context from a Next.js / Web `Request`.
 *
 * @param request Incoming request.
 * @param options `verifySession` (default `true`) also checks the session row,
 * which makes logout/revocation effective instantly.
 * @returns The auth context, or `null` when unauthenticated.
 */
export async function getAuthContext(
  request: Request | NextRequest,
  options: ResolveOptions = {},
): Promise<AuthContext | null> {
  const token = readAccessToken(request);
  const claims = await verifyAccessToken(token);
  if (!claims) return null;

  const repo = await getAuthRepo();
  const customer = await repo.findCustomerById(claims.sub);
  if (!customer) return null;

  if (options.verifySession !== false) {
    const session = await repo.getSessionById(claims.sid);
    if (!session || session.revokedAt) return null;
    if (new Date(session.expiresAt).getTime() <= Date.now()) return null;
  }

  return {
    claims,
    user: toAuthUser(customer),
    customer,
    sessionId: claims.sid,
  };
}

/** Sends the access + refresh tokens as httpOnly, SameSite=Lax cookies. */
export function setAuthCookies(
  response: NextResponse,
  payload: AuthSessionPayload,
): NextResponse {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(AUTH_COOKIE_NAMES.accessToken, payload.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });

  if (payload.refreshToken) {
    response.cookies.set(
      AUTH_COOKIE_NAMES.refreshToken,
      payload.refreshToken,
      {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: REFRESH_TOKEN_TTL_SECONDS,
      },
    );
  }

  return response;
}

/** Clears auth cookies (logout). */
export function clearAuthCookies(response: NextResponse): NextResponse {
  for (const name of [
    AUTH_COOKIE_NAMES.accessToken,
    AUTH_COOKIE_NAMES.refreshToken,
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

/** Reads the refresh token cookie from a request. */
export function readRefreshToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === AUTH_COOKIE_NAMES.refreshToken) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

/** Reads the refresh token cookie from a `NextRequest`. */
export function readRefreshTokenFromNextRequest(
  request: NextRequest,
): string | null {
  return request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value ?? null;
}

/**
 * Best-effort client IP extraction (Vercel, Cloudflare, generic proxies).
 * The value is hashed before persistence.
 */
export function getRequestIp(request: Request): string | null {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    null
  );
}

/**
 * Mints a fresh access token for an existing session without rotating the
 * refresh token. Used after a profile update so the embedded claims
 * (name, interests, favourite tags, tier) stay in sync immediately.
 *
 * @param customer Updated customer record.
 * @param options Existing session id and provider.
 */
export async function mintAccessTokenForSession(
  customer: AuthCustomerRecord,
  options: { sessionId: string; provider: AuthProvider; scope?: readonly string[] },
): Promise<AuthSessionPayload> {
  const claims = buildJwtClaims(customer, {
    sessionId: options.sessionId,
    provider: options.provider,
    scope: options.scope,
  });
  const { token, expiresIn } = await signAccessToken(claims);

  return {
    user: toAuthUser(customer),
    claims,
    accessToken: token,
    tokenType: "Bearer",
    expiresIn,
  };
}
