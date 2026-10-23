import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { AuthProvider } from "@/shared/auth";

/** Static OAuth 2.0 / OIDC provider configuration. */
export interface OAuthProviderConfig {
  id: AuthProvider;
  label: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  usesPkce: boolean;
}

const PROVIDERS: Partial<Record<AuthProvider, OAuthProviderConfig>> = {
  google: {
    id: "google",
    label: "Google",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    scopes: ["openid", "email", "profile"],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    usesPkce: true,
  },
  github: {
    id: "github",
    label: "GitHub",
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scopes: ["read:user", "user:email"],
    clientIdEnv: "GITHUB_CLIENT_ID",
    clientSecretEnv: "GITHUB_CLIENT_SECRET",
    usesPkce: false,
  },
};

/** Normalised profile returned by every provider (and the demo simulator). */
export interface OAuthProfile {
  provider: AuthProvider;
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
  accessToken?: string;
  refreshToken?: string;
  scope?: string;
  tokenExpiresAt?: string;
}

/** Type guard for supported OAuth provider slugs. */
export function isOAuthProvider(value: string): value is "google" | "github" {
  return value === "google" || value === "github";
}

/** Returns configuration for a supported provider, or `null`. */
export function getProviderConfig(
  provider: AuthProvider,
): OAuthProviderConfig | null {
  return PROVIDERS[provider] ?? null;
}

/** True when client id + secret are configured for the provider. */
export function isOAuthProviderConfigured(provider: AuthProvider): boolean {
  const config = PROVIDERS[provider];
  if (!config) return false;
  return Boolean(
    process.env[config.clientIdEnv] && process.env[config.clientSecretEnv],
  );
}

/**
 * Demo OAuth is enabled when the provider has no credentials, so the flow can
 * be explored locally. It is disabled by setting `AUTH_ALLOW_DEMO_OAUTH=false`
 * — do that in production.
 */
export function isDemoOAuthAllowed(): boolean {
  return process.env.AUTH_ALLOW_DEMO_OAUTH !== "false";
}

/**
 * True when the user can start the flow: either real credentials exist, or
 * the demo simulator is allowed.
 */
export function canStartOAuth(provider: AuthProvider): boolean {
  return isOAuthProviderConfigured(provider) || isDemoOAuthAllowed();
}

/** Generates a PKCE verifier + S256 challenge pair. */
export function generatePkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

/** Builds the provider authorization URL. */
export function buildAuthorizationUrl(input: {
  provider: AuthProvider;
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge?: string;
}): string {
  const config = PROVIDERS[input.provider];
  if (!config) throw new Error(`Provider OAuth tidak didukung: ${input.provider}`);

  const url = new URL(config.authorizeUrl);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", input.state);
  if (config.id === "google") {
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "select_account");
  }
  if (config.usesPkce && input.codeChallenge) {
    url.searchParams.set("code_challenge", input.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url.toString();
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

async function exchangeCodeForTokens(input: {
  provider: AuthProvider;
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}): Promise<TokenResponse> {
  const config = PROVIDERS[input.provider];
  if (!config) throw new Error(`Provider OAuth tidak didukung: ${input.provider}`);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    client_id: process.env[config.clientIdEnv] ?? "",
    client_secret: process.env[config.clientSecretEnv] ?? "",
  });
  if (config.usesPkce && input.codeVerifier) {
    body.set("code_verifier", input.codeVerifier);
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const data = (await response.json()) as TokenResponse;
  if (!response.ok || data.error) {
    throw new Error(
      data.error_description ??
        data.error ??
        `Penukaran kode OAuth gagal (${response.status})`,
    );
  }
  return data;
}

let googleJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getGoogleJwks() {
  if (!googleJwks) {
    googleJwks = createRemoteJWKSet(
      new URL("https://www.googleapis.com/oauth2/v3/certs"),
    );
  }
  return googleJwks;
}

async function googleProfile(
  tokens: TokenResponse,
  clientId: string,
): Promise<OAuthProfile> {
  if (tokens.id_token) {
    const { payload } = await jwtVerify(tokens.id_token, getGoogleJwks(), {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    });
    const email = String(payload.email ?? "");
    return {
      provider: "google",
      providerAccountId: String(payload.sub),
      email,
      name: String(payload.name ?? email.split("@")[0] ?? "NgeTag User"),
      avatarUrl: payload.picture ? String(payload.picture) : undefined,
      emailVerified: payload.email_verified === true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      scope: tokens.scope,
      tokenExpiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : undefined,
    };
  }

  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error("Gagal mengambil profil Google");
  const data = (await response.json()) as {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
  };

  return {
    provider: "google",
    providerAccountId: data.sub,
    email: data.email,
    name: data.name ?? data.email.split("@")[0],
    avatarUrl: data.picture,
    emailVerified: data.email_verified === true,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    scope: tokens.scope,
  };
}

async function githubProfile(tokens: TokenResponse): Promise<OAuthProfile> {
  const headers = {
    authorization: `Bearer ${tokens.access_token}`,
    accept: "application/vnd.github+json",
    "user-agent": "ngetag-web",
  };

  const [userResponse, emailsResponse] = await Promise.all([
    fetch("https://api.github.com/user", { headers, cache: "no-store" }),
    fetch("https://api.github.com/user/emails", {
      headers,
      cache: "no-store",
    }),
  ]);

  if (!userResponse.ok) throw new Error("Gagal mengambil profil GitHub");

  const user = (await userResponse.json()) as {
    id: number;
    login: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string;
  };

  let email = user.email ?? "";
  let emailVerified = Boolean(user.email);

  if (emailsResponse.ok) {
    const emails = (await emailsResponse.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;
    const primary = emails.find((item) => item.primary && item.verified);
    if (primary) {
      email = primary.email;
      emailVerified = true;
    }
  }

  if (!email) {
    email = `${user.login}@users.noreply.github.com`;
  }

  return {
    provider: "github",
    providerAccountId: String(user.id),
    email,
    name: user.name ?? user.login,
    avatarUrl: user.avatar_url,
    emailVerified,
    accessToken: tokens.access_token,
    scope: tokens.scope,
  };
}

/**
 * Exchanges an authorization code for a normalised user profile.
 *
 * Google tokens are verified through OIDC (JWKS + audience check); GitHub
 * profiles are fetched with the access token.
 *
 * @throws When the code is invalid or the provider request fails.
 */
export async function exchangeCodeForProfile(input: {
  provider: AuthProvider;
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}): Promise<OAuthProfile> {
  const config = PROVIDERS[input.provider];
  if (!config) throw new Error(`Provider OAuth tidak didukung: ${input.provider}`);

  const tokens = await exchangeCodeForTokens(input);

  if (input.provider === "google") {
    return googleProfile(tokens, process.env[config.clientIdEnv] ?? "");
  }
  if (input.provider === "github") {
    return githubProfile(tokens);
  }
  throw new Error(`Provider OAuth tidak didukung: ${input.provider}`);
}

/**
 * Produces a deterministic demo profile when real OAuth credentials are not
 * configured. Every visitor of the same provider lands on the same demo
 * account (`google.demo@ngetag.id` / `github.demo@ngetag.id`).
 */
export function demoOAuthProfile(provider: AuthProvider): OAuthProfile {
  const label = provider === "github" ? "GitHub" : "Google";
  return {
    provider,
    providerAccountId: `demo-${provider}`,
    email: `${provider}.demo@ngetag.id`,
    name: `${label} Demo User`,
    avatarUrl: `https://picsum.photos/seed/${provider}-demo/200/200`,
    emailVerified: true,
    scope: "openid email profile",
  };
}
