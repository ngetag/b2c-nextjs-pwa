"use client";

import { create } from "zustand";
import type {
  AuthSessionPayload,
  AuthUser,
  NgetagJwtClaims,
} from "@/shared/auth";

/** Authentication lifecycle status. */
export type AuthStatus = "idle" | "loading" | "authenticated" | "guest";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  claims: NgetagJwtClaims | null;
  /** Epoch ms when the access token expires. */
  expiresAt: number | null;
  /** True when the session was created by the OAuth demo simulator. */
  demo: boolean;
  setLoading: () => void;
  setSession: (payload: AuthSessionPayload) => void;
  setClaims: (claims: NgetagJwtClaims, user: AuthUser) => void;
  setGuest: () => void;
}

/**
 * Client-side mirror of the authenticated session.
 *
 * Tokens themselves stay in httpOnly cookies; this store only keeps the
 * display-safe user + claims so components can render synchronously. The
 * `AuthProvider` hydrates it from `/api/auth/session` on boot.
 */
export const useAuthStore = create<AuthState>((set) => ({
  status: "idle",
  user: null,
  claims: null,
  expiresAt: null,
  demo: false,

  setLoading: () => set({ status: "loading" }),

  setSession: (payload) =>
    set({
      status: "authenticated",
      user: payload.user,
      claims: payload.claims,
      expiresAt: payload.claims.exp * 1000,
      demo: payload.demo ?? false,
    }),

  setClaims: (claims, user) =>
    set({
      status: "authenticated",
      user,
      claims,
      expiresAt: claims.exp * 1000,
    }),

  setGuest: () =>
    set({
      status: "guest",
      user: null,
      claims: null,
      expiresAt: null,
      demo: false,
    }),
}));
