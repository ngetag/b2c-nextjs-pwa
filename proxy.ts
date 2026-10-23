import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/shared/auth";

/** Routes that require an authenticated session. */
const PROTECTED_PREFIXES = ["/account"];

/**
 * Next.js 16 proxy (formerly `middleware`).
 *
 * Guards the authenticated account area: visitors without an access or refresh
 * cookie are redirected to `/auth/login?next=…`. Token validity is re-checked
 * server-side by the API/page (the proxy only avoids rendering the page for
 * obvious guests, and runs on the Edge where the DB layer is unavailable).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const requiresAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!requiresAuth) return NextResponse.next();

  const hasSessionCookie = Boolean(
    request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value ||
      request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value,
  );

  if (hasSessionCookie) return NextResponse.next();

  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/account/:path*"],
};
