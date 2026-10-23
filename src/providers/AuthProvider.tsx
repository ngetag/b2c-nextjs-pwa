"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { toLegacyUser } from "@/lib/auth/claims";
import {
  logoutRequest,
  refreshRequest,
  sessionRequest,
} from "@/lib/auth/client";
import { useAuthStore, type AuthStatus } from "@/stores/auth.store";
import { useCurrentUserStore } from "@/stores/currentUser.store";
import type { AuthSessionPayload, AuthUser, NgetagJwtClaims } from "@/shared/auth";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  claims: NgetagJwtClaims | null;
  isAuthenticated: boolean;
  /** True when the session came from the OAuth demo simulator. */
  demo: boolean;
  /** Milliseconds left before the access token expires. */
  expiresAt: number | null;
  /** Stores a session returned by the login/signup/OAuth endpoints. */
  login: (payload: AuthSessionPayload) => void;
  logout: () => Promise<void>;
  /** Rotates the refresh token and refreshes the access token. */
  refresh: () => Promise<AuthSessionPayload | null>;
  /** Re-runs session bootstrapping (e.g. after an OAuth redirect). */
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Boots the authenticated session and mirrors it into the legacy
 * `useCurrentUserStore`, so all existing discovery pages render the signed-in
 * customer without modification.
 *
 * Guests fall back to the demo user, keeping the app fully browsable.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const claims = useAuthStore((state) => state.claims);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const demo = useAuthStore((state) => state.demo);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setSession = useAuthStore((state) => state.setSession);
  const setClaims = useAuthStore((state) => state.setClaims);
  const setGuest = useAuthStore((state) => state.setGuest);

  const setLegacyUser = useCurrentUserStore((state) => state.setUser);
  const resetLegacyUser = useCurrentUserStore((state) => state.resetUser);

  const bootstrap = useCallback(async () => {
    setLoading();

    try {
      const session = await sessionRequest();
      setClaims(session.claims, session.user);
      return;
    } catch {
      // Access token missing/expired → try the refresh cookie.
    }

    try {
      const refreshed = await refreshRequest();
      setSession(refreshed);
    } catch {
      setGuest();
    }
  }, [setClaims, setGuest, setLoading, setSession]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // Mirror the authenticated user into the legacy store used by existing pages.
  useEffect(() => {
    if (user) {
      setLegacyUser(toLegacyUser(user));
    } else if (status === "guest") {
      resetLegacyUser();
    }
  }, [resetLegacyUser, setLegacyUser, status, user]);

  // Silent refresh ~60s before the access token expires.
  useEffect(() => {
    if (!expiresAt) return;
    const delay = Math.max(15_000, expiresAt - Date.now() - 60_000);
    const timer = setTimeout(() => {
      void (async () => {
        try {
          setSession(await refreshRequest());
        } catch {
          setGuest();
        }
      })();
    }, delay);

    return () => clearTimeout(timer);
  }, [expiresAt, setGuest, setSession]);

  const login = useCallback(
    (payload: AuthSessionPayload) => setSession(payload),
    [setSession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setGuest();
      resetLegacyUser();
    }
  }, [resetLegacyUser, setGuest]);

  const refresh = useCallback(async () => {
    try {
      const refreshed = await refreshRequest();
      setSession(refreshed);
      return refreshed;
    } catch {
      setGuest();
      return null;
    }
  }, [setGuest, setSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      claims,
      isAuthenticated: status === "authenticated",
      demo,
      expiresAt,
      login,
      logout,
      refresh,
      reload: bootstrap,
    }),
    [bootstrap, claims, demo, expiresAt, login, logout, refresh, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth session from any client component. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
