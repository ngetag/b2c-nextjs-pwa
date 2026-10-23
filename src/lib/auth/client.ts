"use client";

import type { AuthSessionPayload } from "@/shared/auth";

/** Error thrown by the auth client helpers. */
export class AuthClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthClientError";
  }
}

async function parse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string } }
    | T
    | null;

  if (!response.ok) {
    const errorBody = data as { error?: { code?: string; message?: string } } | null;
    throw new AuthClientError(
      errorBody?.error?.code ?? "REQUEST_FAILED",
      errorBody?.error?.message ?? "Permintaan gagal. Coba lagi.",
      response.status,
    );
  }

  return data as T;
}

/**
 * `POST /api/auth/signup`
 *
 * @throws {AuthClientError} For validation, duplicate email or server errors.
 */
export async function signupRequest(input: {
  name: string;
  email: string;
  password: string;
  interestIds?: string[];
  favoriteTagIds?: string[];
  city?: string;
  acceptTerms?: boolean;
}): Promise<AuthSessionPayload> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  return parse<AuthSessionPayload>(response);
}

/**
 * `POST /api/auth/login`
 *
 * @throws {AuthClientError} For invalid credentials or server errors.
 */
export async function loginRequest(input: {
  email: string;
  password: string;
}): Promise<AuthSessionPayload> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  return parse<AuthSessionPayload>(response);
}

/** `POST /api/auth/logout` — revokes the session and clears cookies. */
export async function logoutRequest(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
}

/** `POST /api/auth/refresh` — rotates the refresh token (cookie-based). */
export async function refreshRequest(): Promise<AuthSessionPayload> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
    cache: "no-store",
  });
  return parse<AuthSessionPayload>(response);
}

/** `GET /api/auth/session` — hydrates user + claims for authenticated visitors. */
export async function sessionRequest(): Promise<{
  authenticated: boolean;
  user: AuthSessionPayload["user"];
  claims: AuthSessionPayload["claims"];
  expiresIn: number;
}> {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  return parse(response);
}

/** `PATCH /api/auth/profile` — updates profile and re-mints the JWT claims. */
export async function updateProfileRequest(input: {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  interestIds?: string[];
  favoriteTagIds?: string[];
  city?: string;
}): Promise<AuthSessionPayload> {
  const response = await fetch("/api/auth/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  return parse<AuthSessionPayload>(response);
}

/** Human-readable Indonesian copy for OAuth callback error codes. */
export function oauthErrorMessage(code: string | null): string | null {
  if (!code) return null;
  const messages: Record<string, string> = {
    oauth_state_mismatch:
      "Sesi OAuth tidak valid (state mismatch). Silakan coba lagi.",
    oauth_failed: "Login OAuth gagal. Silakan coba lagi.",
    oauth_missing_code: "Kode otorisasi tidak ditemukan.",
    oauth_denied: "Akses dibatalkan di halaman provider.",
    oauth_not_configured:
      "OAuth belum dikonfigurasi. Gunakan email & password atau aktifkan mode demo.",
    oauth_unsupported_provider: "Provider OAuth tidak didukung.",
  };
  return messages[code] ?? "Login OAuth gagal. Silakan coba lagi.";
}
