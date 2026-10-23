import type { User } from "@/types/user";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  tierFromPoints,
  type AuthProvider,
  type AuthTier,
  type AuthUser,
  type NgetagJwtClaims,
} from "@/shared/auth";
import type { AuthCustomerRecord } from "./types";

/** JWT issuer claim used by the NgeTag customer web app. */
export const JWT_ISSUER = "ngetag-web";

/** JWT audience claim used by the NgeTag customer web app. */
export const JWT_AUDIENCE = "ngetag-customer-web";

/** Default scopes granted to every customer session. */
export const DEFAULT_SCOPES = [
  "openid",
  "profile",
  "email",
  "telemetry:write",
  "recommendations:read",
] as const;

/**
 * Maps a persisted customer record to the public `AuthUser` shape that is
 * exposed to the browser and rendered in the UI.
 */
export function toAuthUser(customer: AuthCustomerRecord): AuthUser {
  const tier: AuthTier = customer.tier ?? tierFromPoints(customer.points);
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    avatarUrl: customer.avatarUrl,
    role: customer.role,
    bio: customer.bio,
    interestIds: customer.interestIds,
    favoriteTagIds: customer.favoriteTagIds,
    badges: customer.badges,
    points: customer.points,
    tier,
    city: customer.city,
    emailVerified: customer.emailVerified,
    joinedAt: customer.joinedAt,
  };
}

/**
 * Converts the auth user to the legacy `User` type used across the existing
 * discovery pages, so authenticated sessions can drive the same UI as the
 * demo user without touching every consumer.
 */
export function toLegacyUser(user: AuthUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    bio: user.bio,
    interestIds: user.interestIds,
    badges: user.badges,
    joinedAt: user.joinedAt,
    preferences: {
      favoriteTagIds: user.favoriteTagIds,
      city: user.city,
    },
  };
}

/** Options required when minting an access token. */
export interface BuildClaimsOptions {
  sessionId: string;
  provider: AuthProvider;
  /** Seconds since epoch; defaults to `now`. */
  issuedAt?: number;
  /** Lifetime in seconds; defaults to 15 minutes. */
  ttlSeconds?: number;
  scope?: readonly string[];
}

/**
 * Builds the full JWT claim set for a customer.
 *
 * The claims intentionally include display-level personalisation data
 * (name, avatar, tier, interests, favourite tags, city) so the app can render
 * the authenticated shell immediately after a page load without an extra API
 * call. Secrets never belong in a JWT.
 *
 * @param customer Persisted customer record.
 * @param options Session id, provider and token lifetime.
 * @returns Claims ready to be signed.
 */
export function buildJwtClaims(
  customer: AuthCustomerRecord,
  options: BuildClaimsOptions,
): NgetagJwtClaims {
  const issuedAt = options.issuedAt ?? Math.floor(Date.now() / 1000);
  const ttl = options.ttlSeconds ?? ACCESS_TOKEN_TTL_SECONDS;
  const user = toAuthUser(customer);
  const scope = (options.scope ?? DEFAULT_SCOPES).join(" ");

  return {
    sub: user.id,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
    iat: issuedAt,
    exp: issuedAt + ttl,
    jti: globalThis.crypto.randomUUID(),
    sid: options.sessionId,
    name: user.name,
    email: user.email,
    picture: user.avatarUrl,
    role: user.role,
    tier: user.tier,
    points: user.points,
    badges: user.badges.map((badge) => badge.label),
    interests: user.interestIds,
    favoriteTags: user.favoriteTagIds,
    city: user.city,
    locale: "id-ID",
    scope,
    provider: options.provider,
    emailVerified: user.emailVerified,
  };
}

/**
 * Checks whether a claims object grants a specific scope.
 *
 * @param claims Verified JWT claims.
 * @param scope Scope to check, e.g. `telemetry:write`.
 */
export function hasScope(claims: NgetagJwtClaims, scope: string): boolean {
  return claims.scope.split(" ").includes(scope);
}

/**
 * Extracts the display-safe subset of claims for debugging UI (e.g. the
 * "JWT claims" inspector on `/account`).
 */
export function summarizeClaims(claims: NgetagJwtClaims): Record<string, unknown> {
  return {
    sub: claims.sub,
    name: claims.name,
    email: claims.email,
    role: claims.role,
    tier: claims.tier,
    points: claims.points,
    interests: claims.interests,
    favoriteTags: claims.favoriteTags,
    city: claims.city,
    locale: claims.locale,
    scope: claims.scope,
    provider: claims.provider,
    emailVerified: claims.emailVerified,
    sessionId: claims.sid,
    issuedAt: new Date(claims.iat * 1000).toISOString(),
    expiresAt: new Date(claims.exp * 1000).toISOString(),
  };
}
