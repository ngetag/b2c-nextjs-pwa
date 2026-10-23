import { SignJWT, jwtVerify } from "jose";
import type { NgetagJwtClaims } from "@/shared/auth";
import { JWT_AUDIENCE, JWT_ISSUER } from "./claims";

const encoder = new TextEncoder();

/**
 * Development fallback secret. Deterministic so tokens survive a dev-server
 * restart, but obviously not safe for production — set `AUTH_JWT_SECRET`.
 */
const DEV_FALLBACK_SECRET =
  "ngetag-development-only-jwt-secret-do-not-use-in-production";

let warnedAboutSecret = false;

/**
 * Resolves the HS256 signing secret.
 *
 * @throws When `NODE_ENV=production` and `AUTH_JWT_SECRET` is missing or too
 * short. In development/CI a deterministic fallback keeps the app usable.
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET;

  if (secret && secret.length >= 32) {
    return encoder.encode(secret);
  }

  if (process.env.NODE_ENV === "production" && !secret) {
    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.warn(
        "[ngetag/auth] AUTH_JWT_SECRET is not set. Falling back to the development secret — configure a 32+ character secret before going live.",
      );
    }
  }

  return encoder.encode(DEV_FALLBACK_SECRET);
}

/** True when a strong, explicitly configured JWT secret is available. */
export function isJwtSecretConfigured(): boolean {
  return Boolean(process.env.AUTH_JWT_SECRET && process.env.AUTH_JWT_SECRET.length >= 32);
}

/**
 * Signs an access token with HS256.
 *
 * @param claims Claims built by `buildJwtClaims`.
 * @returns Compact JWS string and its lifetime in seconds.
 */
export async function signAccessToken(
  claims: NgetagJwtClaims,
): Promise<{ token: string; expiresIn: number }> {
  const token = await new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(claims.iat)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setJti(claims.jti)
    .setSubject(claims.sub)
    .setExpirationTime(claims.exp)
    .sign(getJwtSecret());

  return { token, expiresIn: claims.exp - claims.iat };
}

/**
 * Verifies an access token (signature, issuer, audience and expiry).
 *
 * @param token Compact JWS from the `Authorization: Bearer` header or cookie.
 * @returns Verified claims, or `null` when the token is invalid/expired.
 */
export async function verifyAccessToken(
  token: string | null | undefined,
): Promise<NgetagJwtClaims | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
    });

    if (typeof payload.sub !== "string" || typeof payload.sid !== "string") {
      return null;
    }

    return payload as unknown as NgetagJwtClaims;
  } catch {
    return null;
  }
}
