import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api-response";
import {
  buildAuthorizationUrl,
  canStartOAuth,
  generatePkcePair,
  getProviderConfig,
  isDemoOAuthAllowed,
  isOAuthProvider,
  isOAuthProviderConfigured,
} from "@/lib/auth/oauth";
import { randomToken } from "@/lib/auth/password";
import {
  oauthRedirectUri,
  sanitizeNextPath,
  setOAuthCookies,
} from "@/server/auth/http";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

/**
 * GET /api/auth/oauth/{provider} — Mulai login OAuth (Google/GitHub)
 *
 * Redirect 302 ke provider dengan state CSRF (+ PKCE untuk Google). Bila kredensial
 * provider belum di-set, memakai akun demo yang ditandai `demo: true`.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#startOAuth.
 *
 * @openapi
 *  "/api/auth/oauth/{provider}":
 *    get:
 *      tags:
 *        - Auth
 *      operationId: startOAuth
 *      summary: "Mulai login OAuth (Google/GitHub)"
 *      description: "Redirect 302 ke provider dengan state CSRF (+ PKCE untuk Google). Bila kredensial provider belum di-set, memakai akun demo yang ditandai `demo: true`."
 *      parameters:
 *        -
 *          name: provider
 *          in: path
 *          required: true
 *          description: "`google` atau `github`."
 *          schema:
 *            type: string
 *        -
 *          name: next
 *          in: query
 *          required: false
 *          description: "Path tujuan setelah callback (default `/account`)."
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Berhasil.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                additionalProperties: true
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
 *      x-source-file: "app/api/auth/oauth/[provider]/route.ts"
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    return jsonError(
      "UNSUPPORTED_PROVIDER",
      "Provider OAuth harus 'google' atau 'github'",
      404,
    );
  }

  const config = getProviderConfig(provider);
  const state = randomToken(24);
  const next = sanitizeNextPath(
    request.nextUrl.searchParams.get("next"),
    "/account",
  );

  if (!canStartOAuth(provider)) {
    return jsonError(
      "OAUTH_NOT_CONFIGURED",
      `OAuth ${provider} belum dikonfigurasi. Set ${config?.clientIdEnv} dan ${config?.clientSecretEnv}.`,
      503,
    );
  }

  const redirectUri = oauthRedirectUri(request, provider);
  const configured = isOAuthProviderConfigured(provider);

  if (!configured) {
    if (!isDemoOAuthAllowed()) {
      return jsonError(
        "OAUTH_NOT_CONFIGURED",
        "Mode demo OAuth dinonaktifkan.",
        503,
      );
    }

    const callback = new URL(redirectUri);
    callback.searchParams.set("state", state);
    callback.searchParams.set("demo", "1");

    const response = NextResponse.redirect(callback);
    return setOAuthCookies(response, { state, next });
  }

  const pkce = config?.usesPkce ? generatePkcePair() : null;
  const authorizeUrl = buildAuthorizationUrl({
    provider,
    clientId: process.env[config!.clientIdEnv] ?? "",
    redirectUri,
    state,
    codeChallenge: pkce?.challenge,
  });

  const response = NextResponse.redirect(authorizeUrl);
  return setOAuthCookies(response, {
    state,
    verifier: pkce?.verifier,
    next,
  });
}
