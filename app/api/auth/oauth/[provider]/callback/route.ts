import { NextResponse, type NextRequest } from "next/server";
import {
  demoOAuthProfile,
  exchangeCodeForProfile,
  isDemoOAuthAllowed,
  isOAuthProvider,
  isOAuthProviderConfigured,
} from "@/lib/auth/oauth";
import { issueSession, setAuthCookies } from "@/lib/auth/session";
import { AUTH_COOKIE_NAMES } from "@/shared/auth";
import {
  absoluteUrl,
  clearOAuthCookies,
  oauthRedirectUri,
  sanitizeNextPath,
  sessionMetaFromRequest,
} from "@/server/auth/http";
import { provisionOAuthCustomer } from "@/server/auth/service";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

/**
 * GET /api/auth/oauth/{provider}/callback — Callback OAuth
 *
 * Memvalidasi state, menukar authorization code, menautkan/membuat customer, membuka
 * sesi, lalu redirect ke `next`. Kegagalan diarahkan ke `/auth/login?error=…`.
 *
 * Auth: Publik.
 * Sumber kontrak: src/server/openapi/registry.ts#oauthCallback.
 *
 * @openapi
 *  "/api/auth/oauth/{provider}/callback":
 *    get:
 *      tags:
 *        - Auth
 *      operationId: oauthCallback
 *      summary: "Callback OAuth"
 *      description: "Memvalidasi state, menukar authorization code, menautkan/membuat customer, membuka sesi, lalu redirect ke `next`. Kegagalan diarahkan ke `/auth/login?error=…`."
 *      parameters:
 *        -
 *          name: provider
 *          in: path
 *          required: true
 *          description: "`google` atau `github`."
 *          schema:
 *            type: string
 *        -
 *          name: code
 *          in: query
 *          required: false
 *          description: "Authorization code dari provider."
 *          schema:
 *            type: string
 *        -
 *          name: state
 *          in: query
 *          required: false
 *          description: "State CSRF yang harus sama dengan cookie."
 *          schema:
 *            type: string
 *        -
 *          name: demo
 *          in: query
 *          required: false
 *          description: "`1` untuk memakai profil demo (dev)."
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
 *      x-source-file: "app/api/auth/oauth/[provider]/callback/route.ts"
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { provider } = await params;
  const searchParams = request.nextUrl.searchParams;

  const failure = (code: string) => {
    const url = absoluteUrl(request, "/auth/login");
    url.searchParams.set("error", code);
    return clearOAuthCookies(NextResponse.redirect(url));
  };

  if (!isOAuthProvider(provider)) return failure("oauth_unsupported_provider");

  const state = searchParams.get("state");
  const expectedState = request.cookies.get(AUTH_COOKIE_NAMES.oauthState)?.value;
  if (!state || !expectedState || state !== expectedState) {
    return failure("oauth_state_mismatch");
  }

  if (searchParams.get("error")) {
    return failure(`oauth_${searchParams.get("error")}`);
  }

  const next = sanitizeNextPath(
    request.cookies.get(AUTH_COOKIE_NAMES.oauthNext)?.value,
    "/account",
  );
  const configured = isOAuthProviderConfigured(provider);
  const demoRequested = searchParams.get("demo") === "1";

  try {
    let profile;

    if (!configured || demoRequested) {
      if (!isDemoOAuthAllowed()) return failure("oauth_not_configured");
      profile = demoOAuthProfile(provider);
    } else {
      const code = searchParams.get("code");
      if (!code) return failure("oauth_missing_code");

      profile = await exchangeCodeForProfile({
        provider,
        code,
        redirectUri: oauthRedirectUri(request, provider),
        codeVerifier:
          request.cookies.get(AUTH_COOKIE_NAMES.oauthVerifier)?.value,
      });
    }

    const { customer } = await provisionOAuthCustomer(profile);
    const session = await issueSession(customer, {
      provider,
      demo: !configured,
      ...sessionMetaFromRequest(request),
    });

    const response = NextResponse.redirect(absoluteUrl(request, next));
    setAuthCookies(response, session.payload);
    return clearOAuthCookies(response);
  } catch (error) {
    console.error("[ngetag/auth] OAuth callback failed", error);
    return failure("oauth_failed");
  }
}
