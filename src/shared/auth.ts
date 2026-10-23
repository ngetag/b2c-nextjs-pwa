/**
 * Shared authentication vocabulary and JWT claim contracts.
 *
 * The same types are used by the server (token minting/verification) and by
 * the browser (session store, UI gating), so a claim added here is immediately
 * type-safe on both sides.
 */

/** Account roles supported by the NgeTag platform. */
export const AUTH_ROLES = ["customer", "owner", "admin"] as const;

/** Account roles supported by the NgeTag platform. */
export type AuthRole = (typeof AUTH_ROLES)[number];

/** Identity providers supported by the OAuth bridge. */
export const AUTH_PROVIDERS = ["google", "github", "email"] as const;

/** Identity providers supported by the OAuth bridge. */
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

/** Loyalty tier derived from points, embedded in the access token. */
export const AUTH_TIERS = ["bronze", "silver", "gold", "platinum"] as const;

/** Loyalty tier derived from points, embedded in the access token. */
export type AuthTier = (typeof AUTH_TIERS)[number];

/** OAuth scopes understood by the API. */
export const AUTH_SCOPES = [
  "openid",
  "profile",
  "email",
  "profile:write",
  "telemetry:write",
  "recommendations:read",
] as const;

/** OAuth scopes understood by the API. */
export type AuthScope = (typeof AUTH_SCOPES)[number];

/**
 * Access-token claims.
 *
 * The token deliberately carries *display-level* personalisation data so the
 * UI can render instantly without a round-trip. Never put secrets, emails
 * verification codes, or sensitive PII beyond what the UI already shows.
 */
export interface NgetagJwtClaims {
  /** Subject — customer id (`cus_...` or seeded id). */
  sub: string;
  /** Issuer (`ngetag-web`). */
  iss: string;
  /** Audience (`ngetag-customer-web`). */
  aud: string;
  /** Issued-at (seconds since epoch). */
  iat: number;
  /** Expiry (seconds since epoch). */
  exp: number;
  /** JWT id, unique per access token. */
  jti: string;
  /** Session id that can be revoked server-side. */
  sid: string;

  /** Display name. */
  name: string;
  /** Primary email address. */
  email: string;
  /** AVIF/PNG avatar URL. */
  picture?: string;
  /** Platform role. */
  role: AuthRole;
  /** Loyalty tier derived from points. */
  tier: AuthTier;
  /** Reward points. */
  points: number;
  /** Badge labels shown on the profile. */
  badges: string[];
  /** Interest ids used for event/community recommendations. */
  interests: string[];
  /** Favourite tag ids used for spot recommendations. */
  favoriteTags: string[];
  /** Home city used to bias recommendations. */
  city?: string;
  /** BCP-47 locale, e.g. `id-ID`. */
  locale: string;
  /** Granted scopes. */
  scope: string;
  /** How the session was established. */
  provider: AuthProvider;
  /** Whether the email address has been verified. */
  emailVerified: boolean;
}

/** Public user object returned by the auth endpoints. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: AuthRole;
  bio?: string;
  interestIds: string[];
  favoriteTagIds: string[];
  badges: Array<{
    id: string;
    label: string;
    category: "community" | "interest" | "activity" | "explorer" | "contributor";
  }>;
  points: number;
  tier: AuthTier;
  city?: string;
  emailVerified: boolean;
  joinedAt: string;
}

/** Payload returned by signup/login/refresh/session endpoints. */
export interface AuthSessionPayload {
  user: AuthUser;
  claims: NgetagJwtClaims;
  accessToken: string;
  refreshToken?: string;
  tokenType: "Bearer";
  expiresIn: number;
  /** Present when the token came from a demo/local OAuth simulation. */
  demo?: boolean;
}

/** Error body for auth failures, matching the global API error envelope. */
export interface AuthErrorPayload {
  error: {
    code: string;
    message: string;
  };
}

/** Standard auth cookie names. */
export const AUTH_COOKIE_NAMES = {
  accessToken: "ngetag_at",
  refreshToken: "ngetag_rt",
  oauthState: "ngetag_oauth_state",
  oauthVerifier: "ngetag_oauth_verifier",
  oauthNext: "ngetag_oauth_next",
} as const;

/** Access token lifetime in seconds (15 minutes). */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

/** Refresh token lifetime in seconds (30 days). */
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

/** Derive the loyalty tier from the customer's points. */
export function tierFromPoints(points: number): AuthTier {
  if (points >= 5000) return "platinum";
  if (points >= 2000) return "gold";
  if (points >= 500) return "silver";
  return "bronze";
}
